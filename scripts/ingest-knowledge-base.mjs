#!/usr/bin/env node
/**
 * Script d'ingestion de la base de connaissance SCS → Supabase pgvector
 *
 * Exécution depuis votre terminal Mac (dans le dossier Crexe) :
 *   node scripts/ingest-knowledge-base.mjs
 *
 * Concept pédagogique — Pipeline RAG complet :
 *   1. Extraction texte : DOCX via mammoth, PDF via pdfjs-dist (legacy/Node pur)
 *   2. Chunking : segments de ~400 mots avec 50 mots de chevauchement
 *      → le chevauchement évite de couper une idée en deux entre deux chunks
 *   3. Embeddings : vecteurs 1536 dims via OpenAI text-embedding-3-small
 *      → chaque chunk devient un point dans un espace sémantique à 1536 dimensions
 *   4. Insertion : chunks + vecteurs dans Supabase documents_rag
 *      → la fonction match_documents() retrouve les passages par proximité cosinus
 */

import { readFileSync, readdirSync } from 'fs'
import { join, extname, basename } from 'path'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// ─── Polyfills Node.js pour pdfjs-dist ─────────────────────────────────────────
// Concept pédagogique — Pourquoi ces polyfills ?
// pdfjs-dist est conçu pour le navigateur. Il utilise DOMMatrix, Path2D et
// ImageData qui n'existent pas en Node.js. On les émule avec des classes
// minimales : on n'a besoin que de l'extraction de texte, pas du rendu visuel.
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() {
      this.is2D = true; this.isIdentity = true
      this.a=1; this.b=0; this.c=0; this.d=1; this.e=0; this.f=0
      this.m11=1; this.m12=0; this.m13=0; this.m14=0
      this.m21=0; this.m22=1; this.m23=0; this.m24=0
      this.m31=0; this.m32=0; this.m33=1; this.m34=0
      this.m41=0; this.m42=0; this.m43=0; this.m44=1
    }
    multiply() { return this }
    translate() { return this }
    scale() { return this }
    rotate() { return this }
    inverse() { return this }
    transformPoint(p) { return p || { x: 0, y: 0 } }
    toString() { return `matrix(${this.a},${this.b},${this.c},${this.d},${this.e},${this.f})` }
    static fromMatrix(m) { return Object.assign(new DOMMatrix(), m) }
    static fromFloat32Array(a) { return new DOMMatrix() }
    static fromFloat64Array(a) { return new DOMMatrix() }
  }
}
if (typeof globalThis.Path2D === 'undefined') {
  globalThis.Path2D = class Path2D {
    constructor() {}
    moveTo() {} lineTo() {} closePath() {} arc() {} rect() {}
    addPath() {} bezierCurveTo() {} quadraticCurveTo() {}
  }
}
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {
    constructor(w, h) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4) }
  }
}

// ─── Configuration ──────────────────────────────────────────────────────────────
function chargerEnv() {
  try {
    const contenu = readFileSync('.env.local', 'utf8')
    const vars = {}
    for (const ligne of contenu.split('\n')) {
      const m = ligne.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m) vars[m[1].trim()] = m[2].trim()
    }
    return vars
  } catch {
    console.error('❌ .env.local introuvable — lancez depuis le dossier Crexe')
    process.exit(1)
  }
}

const env         = chargerEnv()
const SUPABASE_URL  = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_KEY    = env.OPENAI_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_KEY) {
  console.error('❌ Variables manquantes dans .env.local')
  process.exit(1)
}

// Dossier source — modifier si nécessaire
const DOSSIER_SOURCE = process.env.KB_PATH
  || join(process.env.HOME, 'Downloads', 'Base de connaissnce IA')

const CHUNK_SIZE    = 400
const CHUNK_OVERLAP = 50
const BATCH_SIZE    = 20   // chunks par appel OpenAI

// Mode sélectif : node scripts/ingest-knowledge-base.mjs --pdf-only
const PDF_ONLY  = process.argv.includes('--pdf-only')
const DOCX_ONLY = process.argv.includes('--docx-only')

// Catégories auto selon le nom de fichier
const CATEGORIES = {
  era: 'methodologie', gar: 'methodologie', smart: 'methodologie',
  sise: 'methodologie', odd: 'general_oif', efh: 'general_oif',
  'stratégie': 'general_oif', strategie: 'general_oif',
  programmation: 'general_oif', francophonie: 'general_oif',
  crexe: 'crexe', ps1: 'crexe', ps2: 'crexe', ps3: 'crexe',
  copil: 'crexe', séminaire: 'crexe', seminaire: 'crexe',
}

function detecterCategorie(nom) {
  const n = nom.toLowerCase()
  for (const [mot, cat] of Object.entries(CATEGORIES)) {
    if (n.includes(mot)) return cat
  }
  return 'autre'
}

// ─── 1. Extraction texte ────────────────────────────────────────────────────────

async function extraireDocx(chemin) {
  try {
    const { default: mammoth } = await import('mammoth')
    const buffer = readFileSync(chemin)
    const { value } = await mammoth.extractRawText({ buffer })
    return value.trim()
  } catch (e) {
    console.warn(`  ⚠️  DOCX erreur : ${e.message}`)
    return ''
  }
}

async function extrairePdf(chemin) {
  // Concept pédagogique — pdfjs-dist/legacy :
  // La version "legacy" de pdfjs-dist émule les API navigateur manquantes
  // (DOMMatrix, ImageData) pour fonctionner en environnement Node.js pur.
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const data = new Uint8Array(readFileSync(chemin))
    const doc  = await pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalSupported: false }).promise
    const pages = []
    for (let i = 1; i <= doc.numPages; i++) {
      const page    = await doc.getPage(i)
      const content = await page.getTextContent()
      const texte   = content.items.map(item => item.str).join(' ')
      if (texte.trim()) pages.push(texte.trim())
    }
    return pages.join('\n\n')
  } catch (e) {
    console.warn(`  ⚠️  PDF erreur : ${e.message}`)
    return ''
  }
}

// ─── 2. Chunking ────────────────────────────────────────────────────────────────

function chunkerTexte(texte, taille = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const mots = texte.split(/\s+/).filter(Boolean)
  if (!mots.length) return []
  const chunks = []
  let debut = 0
  while (debut < mots.length) {
    const fin   = Math.min(debut + taille, mots.length)
    const chunk = mots.slice(debut, fin).join(' ')
    if (chunk.trim().length > 50) chunks.push(chunk)
    if (fin >= mots.length) break
    debut += taille - overlap
  }
  return chunks
}

// ─── 3. Embeddings ──────────────────────────────────────────────────────────────

async function genererEmbeddings(openai, textes) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: textes,
  })
  return response.data.map(item => item.embedding)
}

// ─── 4. Insertion Supabase ───────────────────────────────────────────────────────
// Colonnes réelles de documents_rag (schema_v3) :
//   id, projet_id, contenu, type_contenu, section, source_document,
//   source_page, tokens_count, embedding, created_at
// On encode la catégorie dans type_contenu et le titre dans section.

function preparerRows(chunks, embeddings, nom, categorie) {
  const titre = nom.replace(/\.[^.]+$/, '')
  return chunks.map((chunk, j) => ({
    contenu:         chunk,
    embedding:       embeddings[j],
    source_document: nom,
    type_contenu:    categorie,             // catégorie stockée dans type_contenu
    section:         `${titre} — chunk ${j + 1}`,  // titre + numéro de chunk
    tokens_count:    chunk.split(/\s+/).length,
  })).filter(r => r.embedding?.length > 0)
}

// ─── Programme principal ─────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60))
  console.log('🔍 Ingestion Base de connaissance SCS → Supabase pgvector')
  console.log('='.repeat(60))
  console.log(`\n📁 Source : ${DOSSIER_SOURCE}\n`)

  const openai   = new OpenAI({ apiKey: OPENAI_KEY })
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Lister DOCX et PDF (filtrés selon le mode)
  let fichiers
  try {
    fichiers = readdirSync(DOSSIER_SOURCE)
      .filter(f => {
        const ext = extname(f).toLowerCase()
        if (PDF_ONLY)  return ext === '.pdf'
        if (DOCX_ONLY) return ext === '.docx'
        return ['.docx', '.pdf'].includes(ext)
      })
      .filter(f => !f.startsWith('.'))
      .sort()
      .map(f => join(DOSSIER_SOURCE, f))
  } catch {
    console.error(`❌ Dossier introuvable : ${DOSSIER_SOURCE}`)
    process.exit(1)
  }

  const nbDocx = fichiers.filter(f => f.endsWith('.docx')).length
  const nbPdf  = fichiers.filter(f => f.endsWith('.pdf')).length
  console.log(`📄 ${fichiers.length} fichiers (${nbDocx} DOCX, ${nbPdf} PDF)\n`)

  let totalChunks  = 0
  let totalInseres = 0
  const rapport = []

  for (let i = 0; i < fichiers.length; i++) {
    const chemin    = fichiers[i]
    const nom       = basename(chemin)
    const ext       = extname(nom).toLowerCase()
    const categorie = detecterCategorie(nom)

    console.log(`[${String(i + 1).padStart(2, '0')}/${fichiers.length}] 📄 ${nom}`)
    console.log(`  Catégorie : ${categorie}`)

    // Extraction
    let texte = ''
    if (ext === '.docx') texte = await extraireDocx(chemin)
    else if (ext === '.pdf') texte = await extrairePdf(chemin)

    if (!texte || texte.length < 100) {
      console.log(`  ⚠️  Texte vide ou trop court — ignoré`)
      rapport.push({ nom, chunks: 0, inseres: 0, statut: 'ignoré' })
      continue
    }

    const nbMots = texte.split(/\s+/).length
    console.log(`  Texte : ${nbMots.toLocaleString('fr-FR')} mots`)

    // Chunking
    const chunks = chunkerTexte(texte)
    console.log(`  Chunks : ${chunks.length}`)
    totalChunks += chunks.length

    let inseres = 0
    for (let debut = 0; debut < chunks.length; debut += BATCH_SIZE) {
      const lotChunks = chunks.slice(debut, debut + BATCH_SIZE)
      const numLot    = Math.floor(debut / BATCH_SIZE) + 1
      const totLots   = Math.ceil(chunks.length / BATCH_SIZE)

      let embeddings
      try {
        embeddings = await genererEmbeddings(openai, lotChunks)
      } catch (e) {
        console.warn(`  ⚠️  OpenAI erreur : ${e.message}`)
        continue
      }

      const rows = preparerRows(lotChunks, embeddings, nom, categorie)

      if (rows.length > 0) {
        const { error } = await supabase.from('documents_rag').insert(rows)
        if (error) {
          console.warn(`  ⚠️  Supabase erreur : ${error.message}`)
        } else {
          inseres += rows.length
          console.log(`  ✅ Lot ${numLot}/${totLots} — ${rows.length} chunks insérés`)
        }
      }

      await new Promise(r => setTimeout(r, 300))
    }

    totalInseres += inseres
    rapport.push({
      nom,
      mots: nbMots,
      chunks: chunks.length,
      inseres,
      statut: inseres === chunks.length ? '✅ OK' : `⚠️ ${inseres}/${chunks.length}`,
    })
    console.log()
  }

  // ── Rapport final ─────────────────────────────────────────────────────────────
  console.log('='.repeat(68))
  console.log('📊 RAPPORT D\'INGESTION')
  console.log('='.repeat(68))
  console.log(`\n${'Fichier'.padEnd(50)} ${'Chunks'.padStart(7)} ${'Insérés'.padStart(8)} Statut`)
  console.log('-'.repeat(75))
  for (const r of rapport) {
    const n = r.nom.slice(0, 48).padEnd(50)
    console.log(`${n} ${String(r.chunks || 0).padStart(7)} ${String(r.inseres || 0).padStart(8)}  ${r.statut}`)
  }
  console.log('-'.repeat(75))
  console.log(`\n✅ Chunks générés  : ${totalChunks.toLocaleString('fr-FR')}`)
  console.log(`✅ Chunks insérés  : ${totalInseres.toLocaleString('fr-FR')}`)

  if (totalInseres > 0) {
    console.log(`\n🎉 Base de connaissance chargée ! Le chatbot peut maintenant citer`)
    console.log(`   ces ${totalInseres.toLocaleString('fr-FR')} passages dans ses réponses.`)
  } else {
    console.log('\n⚠️  Aucun chunk inséré — vérifiez les erreurs ci-dessus.')
  }
}

main().catch(err => {
  console.error('\n❌ Erreur fatale :', err.message)
  process.exit(1)
})
