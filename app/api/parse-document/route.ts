// ─── Endpoint : Parseur IA de documents CREXE ────────────────────────────────
// Méthode : POST /api/parse-document
// Corps    : FormData avec un champ "file" (DOCX, PDF ou TXT)
//
// Fonctionnement :
// 1. Réception et validation du fichier
// 2. Extraction du texte (DOCX/TXT → texte brut, PDF → base64 pour GPT-4o vision)
// 3. Appel OpenAI GPT-4o avec un prompt d'extraction structurée
// 4. Retour d'un JSON correspondant au schéma de la table `projets`
//
// Pourquoi OpenAI ?
// GPT-4o comprend le français institutionnel et les formats OIF/ONU.
// Il supporte les PDF en mode vision et retourne un JSON très fiable.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Forcer le mode dynamique — ce route ne doit jamais être pré-rendu statiquement
export const dynamic = 'force-dynamic'

// ─── Prompt système pour l'extraction structurée ─────────────────────────────
// On décrit précisément la structure JSON attendue pour guider GPT-4o.
// Plus le prompt est précis, moins il y a d'hallucinations.
const SYSTEM_PROMPT = `Tu es un expert en extraction de données pour l'Organisation internationale de la Francophonie (OIF).
Tu reçois le contenu textuel d'un document CREXE (Compte-Rendu d'Exécution).
Ton rôle est d'extraire les informations et de les retourner UNIQUEMENT sous forme de JSON valide.

RÈGLES ABSOLUES :
- Ne jamais inventer de chiffres. Si une information est absente du document, retourner null pour ce champ.
- Conserver les formulations exactes du document pour les citations et descriptions.
- Les montants sont toujours en euros (€), retourner des nombres sans symbole ni espace.
- Les codes pays sont en ISO 3166-1 alpha-3 (ex: "BEN" pour Bénin, "MDG" pour Madagascar, "SEN" pour Sénégal).
- Le taux d'exécution est un nombre entre 0 et 100 (pas de %).
- Retourner UNIQUEMENT le JSON, sans markdown, sans explication, sans balises de code.

STRUCTURE JSON À RETOURNER :
{
  "projet": {
    "id": "string (ex: P14, P15) ou null si non trouvé",
    "ps_id": "PS1, PS2 ou PS3 selon le programme stratégique, ou null",
    "nom": "string — nom officiel du projet",
    "accroche": "string — sous-titre court et percutant (max 60 caractères) ou null",
    "description": "string — narratif de présentation en 2-3 phrases ou null",
    "annee_exercice": 2025,
    "budget_modifie": null ou nombre entier en euros,
    "budget_engage": null ou nombre entier en euros,
    "engagement_global": null ou nombre entier en euros,
    "taux_execution": null ou nombre entre 0 et 100,
    "nombre_pays": null ou nombre entier,
    "nombre_projets_deposes": null ou nombre entier,
    "nombre_projets_retenus": null ou nombre entier,
    "thematiques": null ou tableau de strings en snake_case,
    "mots_cles": null ou tableau de strings
  },
  "indicateurs": [
    {
      "libelle": "string — intitulé exact de l'indicateur",
      "valeur_numerique": null ou nombre,
      "valeur_pourcentage": null ou nombre décimal,
      "valeur_texte": null ou string,
      "unite": null ou string (femmes, personnes, %, €, x...),
      "categorie": null ou string (insertion_economique, renforcement_capacites, satisfaction...),
      "type_preuve": "mesure" | "estimation" | "observation" | "institutionnel",
      "source": null ou string,
      "mise_en_avant": true si indicateur phare/KPI, sinon false,
      "ordre": numéro d'ordre commençant à 1
    }
  ],
  "temoignages": [
    {
      "citation": "string — texte exact de la citation",
      "auteur": null ou string,
      "fonction": null ou string,
      "pays": null ou code ISO3,
      "source": null ou string,
      "source_url": null ou string,
      "type_media": "video" | "article" | "rapport" | "interview" | "autre",
      "mise_en_avant": true si témoignage phare, sinon false
    }
  ],
  "pays_couverture": ["tableau de codes ISO3"],
  "confiance": nombre entre 0.0 et 1.0 indiquant la qualité de l'extraction,
  "champs_manquants": ["liste des champs importants absents du document"]
}`

export async function POST(request: NextRequest) {
  // Client OpenAI instancié ici pour éviter l'évaluation statique au build
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // ─── 1. Vérification de l'authentification ─────────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'editeur'].includes(profile.role)) {
    return NextResponse.json({ error: 'Accès refusé — rôle insuffisant' }, { status: 403 })
  }

  // ─── 2. Récupération et validation du fichier ──────────────────────────────
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Données de formulaire invalides' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier fourni (champ "file" manquant)' }, { status: 400 })
  }

  const isDocx = file.name.endsWith('.docx') || file.type.includes('wordprocessingml')
  const isPdf = file.name.endsWith('.pdf') || file.type === 'application/pdf'
  const isTxt = file.name.endsWith('.txt') || file.type === 'text/plain'

  if (!isDocx && !isPdf && !isTxt) {
    return NextResponse.json(
      { error: 'Format non supporté. Utilisez DOCX, PDF ou TXT.' },
      { status: 400 }
    )
  }

  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Fichier trop volumineux (max 15 Mo)' },
      { status: 400 }
    )
  }

  // ─── 3. Appel OpenAI selon le type de fichier ──────────────────────────────
  try {
    let completion

    if (isPdf) {
      // PDF → envoi en base64 à GPT-4o (vision)
      // GPT-4o peut lire le PDF directement comme image/document
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')

      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 4096,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Voici un document CREXE au format PDF. Extrais toutes les informations disponibles et retourne le JSON structuré demandé. Retourne UNIQUEMENT le JSON valide, sans markdown.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
      })
    } else {
      // DOCX ou TXT → extraction texte puis envoi comme message texte
      const buffer = await file.arrayBuffer()
      let texte: string

      if (isTxt) {
        texte = new TextDecoder('utf-8').decode(buffer)
      } else {
        // DOCX : extraction naïve du texte visible dans le XML Word
        // Pour une extraction parfaite, installer mammoth : npm install mammoth
        const raw = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
        texte = raw
          .replace(/<[^>]+>/g, ' ')   // suppression des balises XML
          .replace(/[^\x20-\x7E\xA0-\xFF\u00C0-\u024F]/g, ' ') // garde le latin
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 60000) // limite tokens
      }

      if (!texte || texte.length < 50) {
        return NextResponse.json(
          { error: 'Le fichier semble vide ou illisible. Essayez de l\'exporter en TXT depuis Word.' },
          { status: 422 }
        )
      }

      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 4096,
        response_format: { type: 'json_object' }, // Force un JSON valide en sortie
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Voici le contenu du document CREXE à analyser :\n\n---\n${texte}\n---\n\nExtrais toutes les informations disponibles et retourne le JSON structuré demandé.`,
          },
        ],
      })
    }

    // ─── 4. Parsing et retour de la réponse ─────────────────────────────────
    const raw = completion.choices[0]?.message?.content ?? ''

    // Nettoyage des éventuels backticks markdown
    const jsonText = raw.trim().replace(/^```json?\s*/i, '').replace(/\s*```$/, '')

    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      console.error('JSON invalide reçu de GPT-4o:', jsonText.substring(0, 500))
      return NextResponse.json(
        { error: 'L\'IA n\'a pas retourné un JSON valide. Réessayez avec un fichier plus structuré.' },
        { status: 500 }
      )
    }

    return NextResponse.json(parsed)

  } catch (error) {
    console.error('Erreur OpenAI:', error)
    const msg = error instanceof Error ? error.message : 'Erreur inconnue'

    // Erreur spécifique : clé manquante
    if (msg.includes('API key')) {
      return NextResponse.json(
        { error: 'Clé OpenAI manquante ou invalide. Vérifiez OPENAI_API_KEY dans .env.local' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: `Erreur lors de l'analyse par l'IA : ${msg}` },
      { status: 500 }
    )
  }
}
