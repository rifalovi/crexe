// ─── API Upload Base de Connaissance ─────────────────────────────────────────
// Route : POST /api/knowledge/upload  — ajouter un document
//         DELETE /api/knowledge/upload — supprimer tous les chunks d'un document
//         GET    /api/knowledge/upload — statistiques
//
// Formats supportés (parsing côté serveur) :
//   .txt .md .json  → lecture directe (UTF-8)
//   .docx           → extraction mammoth (texte brut)
//   .pdf            → extraction pdfjs-dist/legacy (texte brut)
//   .csv            → lecture lignes CSV
//   .xlsx .xls      → extraction xlsx (SheetJS)
//   .png .jpg .jpeg → non supporté (OCR non disponible)
//
// Concept pédagogique — Pourquoi parser côté serveur ?
// Le navigateur peut lire les fichiers binaires (ArrayBuffer) mais n'a pas
// accès aux bibliothèques Node.js (mammoth, pdfjs-dist). L'API Next.js tourne
// dans un contexte Node.js, ce qui permet d'utiliser ces libs directement.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { chunkText, generateEmbeddingsBatch } from '@/lib/embeddings/generate'

// ─── Polyfills Node.js pour pdfjs-dist ───────────────────────────────────────
if (typeof (globalThis as Record<string, unknown>).DOMMatrix === 'undefined') {
  class DOMMatrixPolyfill {
    is2D = true; isIdentity = true
    a=1; b=0; c=0; d=1; e=0; f=0
    m11=1; m12=0; m13=0; m14=0; m21=0; m22=1; m23=0; m24=0
    m31=0; m32=0; m33=1; m34=0; m41=0; m42=0; m43=0; m44=1
    multiply() { return this }
    translate() { return this }
    scale() { return this }
    rotate() { return this }
    inverse() { return this }
    transformPoint(p: unknown) { return p || { x: 0, y: 0 } }
    toString() { return `matrix(${this.a},${this.b},${this.c},${this.d},${this.e},${this.f})` }
    static fromMatrix(m: unknown) { return Object.assign(new DOMMatrixPolyfill(), m) }
  }
  ;(globalThis as Record<string, unknown>).DOMMatrix = DOMMatrixPolyfill
}
if (typeof (globalThis as Record<string, unknown>).Path2D === 'undefined') {
  class Path2DPolyfill {
    moveTo(){}; lineTo(){}; closePath(){}; arc(){}; rect(){}
    addPath(){}; bezierCurveTo(){}; quadraticCurveTo(){}
  }
  ;(globalThis as Record<string, unknown>).Path2D = Path2DPolyfill
}
if (typeof (globalThis as Record<string, unknown>).ImageData === 'undefined') {
  class ImageDataPolyfill {
    width: number; height: number; data: Uint8ClampedArray
    constructor(w: number, h: number) {
      this.width = w; this.height = h
      this.data = new Uint8ClampedArray(w * h * 4)
    }
  }
  ;(globalThis as Record<string, unknown>).ImageData = ImageDataPolyfill
}

// ─── Clients Supabase ─────────────────────────────────────────────────────────
function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function verifierAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await supabase.from('profils').select('role').eq('id', user.id).single()
    return data?.role === 'admin'
  } catch {
    return false
  }
}

// ─── Extraction texte selon format ───────────────────────────────────────────

async function extraireTexte(buffer: Buffer, nomFichier: string): Promise<string> {
  const nom = nomFichier.toLowerCase()

  // ── TXT / MD / JSON ──────────────────────────────────────────────────────
  if (nom.endsWith('.txt') || nom.endsWith('.md')) {
    return buffer.toString('utf-8')
  }

  if (nom.endsWith('.json')) {
    try {
      const obj = JSON.parse(buffer.toString('utf-8'))
      if (Array.isArray(obj)) return obj.map((i: unknown) => JSON.stringify(i)).join('\n')
      return JSON.stringify(obj, null, 2)
    } catch {
      return buffer.toString('utf-8')
    }
  }

  // ── CSV ──────────────────────────────────────────────────────────────────
  // Concept : le CSV est du texte tabulaire. On lit chaque ligne comme une
  // phrase pour que le chatbot puisse retrouver des données par similarité.
  if (nom.endsWith('.csv')) {
    const lines = buffer.toString('utf-8').split('\n').filter(l => l.trim())
    const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, ''))
    if (!headers) return buffer.toString('utf-8')

    return lines.slice(1).map(ligne => {
      const vals = ligne.split(',').map(v => v.trim().replace(/"/g, ''))
      return headers.map((h, i) => `${h}: ${vals[i] ?? ''}`).join(' | ')
    }).join('\n')
  }

  // ── Excel (.xlsx / .xls) ─────────────────────────────────────────────────
  // Concept : SheetJS lit le binaire Excel, chaque feuille est convertie en
  // tableau de lignes, elles-mêmes converties en texte lisible par le LLM.
  if (nom.endsWith('.xlsx') || nom.endsWith('.xls')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const XLSX = await import('xlsx') as any
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const lignes: string[] = []
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[]
        lignes.push(`=== Feuille : ${sheetName} ===`)
        for (const row of rows) {
          lignes.push(Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(' | '))
        }
      }
      return lignes.join('\n')
    } catch (e) {
      console.error('[KB] Excel erreur:', e)
      return ''
    }
  }

  // ── DOCX ─────────────────────────────────────────────────────────────────
  if (nom.endsWith('.docx')) {
    try {
      const mammoth = await import('mammoth')
      const { value } = await mammoth.extractRawText({ buffer })
      return value.trim()
    } catch (e) {
      console.error('[KB] DOCX erreur:', e)
      return ''
    }
  }

  // ── PDF ──────────────────────────────────────────────────────────────────
  if (nom.endsWith('.pdf')) {
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs' as string) as {
        getDocument: (opts: unknown) => { promise: Promise<{
          numPages: number
          getPage: (n: number) => Promise<{
            getTextContent: () => Promise<{ items: { str: string }[] }>
          }>
        }> }
      }
      const data = new Uint8Array(buffer)
      const doc  = await pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalSupported: false }).promise
      const pages: string[] = []
      for (let i = 1; i <= doc.numPages; i++) {
        const page    = await doc.getPage(i)
        const content = await page.getTextContent()
        const texte   = content.items.map(item => item.str).join(' ')
        if (texte.trim()) pages.push(texte.trim())
      }
      return pages.join('\n\n')
    } catch (e) {
      console.error('[KB] PDF erreur:', e)
      return ''
    }
  }

  // Fallback : tenter de lire comme texte brut
  return buffer.toString('utf-8')
}

// ─── POST — Ajouter un document ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const estAdmin = await verifierAdmin()
  if (!estAdmin) {
    return NextResponse.json({ error: 'Accès refusé — réservé aux administrateurs' }, { status: 403 })
  }

  try {
    const formData    = await req.formData()
    const fichier     = formData.get('fichier') as File | null
    const texteManuel = formData.get('texte') as string | null
    const titreDoc    = formData.get('titre') as string || 'Document sans titre'
    const categorieDoc = formData.get('categorie') as string || 'crexe'
    const projetId    = formData.get('projet_id') as string | null
    const sectionDoc  = formData.get('section') as string || ''

    if (!fichier && !texteManuel) {
      return NextResponse.json({ error: 'Aucun fichier ni texte fourni' }, { status: 400 })
    }

    let texte = ''
    let nomFichier = titreDoc

    if (fichier) {
      nomFichier = fichier.name
      const bytes = await fichier.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Bloquer les images (pas d'OCR disponible)
      const nomLower = fichier.name.toLowerCase()
      if (nomLower.match(/\.(png|jpg|jpeg|gif|webp|svg|bmp|tiff)$/)) {
        return NextResponse.json({
          error: 'Les images ne sont pas supportées (pas d\'OCR). Utilisez un PDF ou DOCX avec du texte extractible.'
        }, { status: 400 })
      }

      texte = await extraireTexte(buffer, fichier.name)
    } else if (texteManuel) {
      texte = texteManuel
    }

    if (!texte || texte.trim().length < 50) {
      return NextResponse.json({
        error: 'Texte trop court ou vide. Vérifiez que le document contient du texte extractible (pas un scan image).'
      }, { status: 400 })
    }

    // Chunking + embeddings
    const chunks = chunkText(texte.trim(), 400, 50)
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Aucun passage extrait.' }, { status: 400 })
    }

    const embeddings = await generateEmbeddingsBatch(chunks)
    const supabase   = supabaseAdmin()

    const documents = chunks.map((contenu, i) => ({
      projet_id:       projetId || null,
      contenu,
      type_contenu:    categorieDoc,
      section:         sectionDoc ? `${sectionDoc} — chunk ${i + 1}` : `${titreDoc} — chunk ${i + 1}`,
      source_document: nomFichier,
      tokens_count:    Math.round(contenu.split(/\s+/).length * 1.3),
      embedding:       embeddings[i],
    }))

    const { error: insertError } = await supabase.from('documents_rag').insert(documents)

    if (insertError) {
      console.error('[Upload KB] Erreur insertion:', insertError.message)
      return NextResponse.json({ error: `Erreur base de données: ${insertError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      chunks_crees: chunks.length,
      fichier: nomFichier,
      message: `${chunks.length} passages indexés avec succès.`,
    })

  } catch (err) {
    console.error('[Upload KB] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur lors du traitement.' }, { status: 500 })
  }
}

// ─── DELETE — Supprimer tous les chunks d'un document ────────────────────────
export async function DELETE(req: NextRequest) {
  const estAdmin = await verifierAdmin()
  if (!estAdmin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { source_document } = await req.json() as { source_document: string }
  if (!source_document) {
    return NextResponse.json({ error: 'source_document requis' }, { status: 400 })
  }

  const supabase = supabaseAdmin()
  const { error, count } = await supabase
    .from('documents_rag')
    .delete({ count: 'exact' })
    .eq('source_document', source_document)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    supprimes: count ?? 0,
    message: `${count ?? 0} passages supprimés.`,
  })
}

// ─── GET — Statistiques de la base de connaissance ───────────────────────────
export async function GET() {
  const estAdmin = await verifierAdmin()
  if (!estAdmin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('documents_rag')
    .select('source_document, type_contenu, projet_id, created_at, tokens_count, section')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const parSource = (data ?? []).reduce<Record<string, {
    titre: string
    categorie: string
    projet_id: string | null
    nb_chunks: number
    tokens_total: number
    created_at: string
  }>>((acc, doc) => {
    const cle = doc.source_document ?? 'Inconnu'
    if (!acc[cle]) {
      acc[cle] = {
        titre:       doc.section?.split(' — ')[0] ?? cle,
        categorie:   doc.type_contenu ?? 'autre',
        projet_id:   doc.projet_id,
        nb_chunks:   0,
        tokens_total: 0,
        created_at:  doc.created_at,
      }
    }
    acc[cle].nb_chunks++
    acc[cle].tokens_total += doc.tokens_count ?? 0
    return acc
  }, {})

  return NextResponse.json({
    total_chunks: data?.length ?? 0,
    documents: Object.entries(parSource).map(([source, info]) => ({ source, ...info })),
  })
}
