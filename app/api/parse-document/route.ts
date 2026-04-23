// ─── API : Parseur IA de documents CREXE ─────────────────────────────────────
// POST /api/parse-document
// FormData : { file: File, mode: string }
//
// Modes disponibles :
//   global         — extrait tout (projet + indicateurs + ERA + chaîne + témoignages)
//   projet         — métadonnées du projet uniquement
//   indicateurs    — indicateurs / KPIs seulement
//   era            — résultats ERA (niveaux acquisition / effets / retombées)
//   chaine         — chaîne des résultats CAD-OCDE (extrants → impact)
//   temoignages    — citations et témoignages de bénéficiaires
//
// Flux :
//   1. Authentification Supabase (profils v3)
//   2. Extraction texte : DOCX → mammoth | PDF/TXT → text decoder
//   3. Appel Claude claude-sonnet-4-6 avec prompt ciblé selon le mode
//   4. Retour JSON structuré correspondant au schéma CREXE
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const maxDuration = 60  // 60 s — parsing de gros DOCX

// ─── Prompts par mode ─────────────────────────────────────────────────────────

const SYSTEM_BASE = `Tu es un expert en extraction de données institutionnelles pour l'Organisation internationale de la Francophonie (OIF).
Tu reçois le texte d'un rapport CREXE (Compte-Rendu d'Exécution) ou d'une Enquête ERA.
Règles absolues :
- Ne jamais inventer de chiffres. Si une information est absente, retourner null pour ce champ.
- Conserver les formulations exactes du document pour les citations et descriptions.
- Les montants sont en euros (€) — retourner des nombres sans symbole ni espace.
- Taux d'exécution : nombre entre 0 et 100 (sans %).
- Codes pays : ISO 3166-1 alpha-3 (ex: BEN, MDG, SEN, CMR, RWA, CIV).
- Retourner UNIQUEMENT du JSON valide, sans markdown, sans explication, sans balises de code.`

const PROMPTS: Record<string, string> = {

  projet: `${SYSTEM_BASE}

Extrais UNIQUEMENT les métadonnées du projet. JSON attendu :
{
  "projet": {
    "code_officiel": "code du projet (ex: PROJ_A14, A14) ou null",
    "ps_id": "PS1, PS2 ou PS3 selon le programme stratégique du document, ou null",
    "nom": "nom officiel complet du projet",
    "accroche": "sous-titre court et percutant (max 80 caractères) ou null",
    "description": "narratif de présentation en 2-3 phrases résumant l'objet et la zone d'intervention ou null",
    "annee_exercice": 2025,
    "budget_modifie": null ou nombre entier en euros,
    "budget_engage": null ou nombre entier en euros,
    "engagement_global": null ou nombre entier en euros,
    "taux_execution": null ou nombre entre 0 et 100,
    "nombre_pays": null ou nombre entier,
    "nombre_projets_deposes": null ou nombre entier,
    "nombre_projets_retenus": null ou nombre entier,
    "thematiques": null ou tableau de strings parmi : ["Développement durable","Langue française et diversité culturelles","Paix, démocratie et droits de l'homme","Transversalité","Économie et numérique","Éducation et formation"],
    "mots_cles": null ou tableau de strings
  },
  "pays_couverture": ["tableau de codes ISO3"],
  "confiance": nombre entre 0.0 et 1.0 indiquant la qualité de l'extraction,
  "champs_manquants": ["liste des champs importants non trouvés dans le document"]
}`,

  indicateurs: `${SYSTEM_BASE}

Extrais UNIQUEMENT les indicateurs, KPIs et chiffres-clés du projet. JSON attendu :
{
  "indicateurs": [
    {
      "libelle": "intitulé exact de l'indicateur tel qu'il apparaît dans le document",
      "valeur_numerique": null ou nombre,
      "valeur_pourcentage": null ou nombre décimal entre 0 et 100,
      "valeur_texte": null ou string pour les valeurs non numériques,
      "unite": null ou string (femmes, personnes, pays, sessions, %, EUR...),
      "categorie": null ou string décrivant le type (renforcement_capacites, insertion_economique, satisfaction, couverture_geographique...),
      "type_preuve": "mesure" si chiffre mesuré directement | "estimation" si calculé/estimé | "observation" si constaté | "institutionnel" si donné officiel,
      "source": null ou string (nom du rapport ou de l'enquête source),
      "mise_en_avant": true si c'est un indicateur-phare ou KPI principal, sinon false,
      "ordre": numéro d'ordre commençant à 1
    }
  ],
  "confiance": 0.0 à 1.0,
  "champs_manquants": []
}`,

  era: `${SYSTEM_BASE}

Extrais UNIQUEMENT les résultats de l'Enquête Rapide Annuelle (ERA) du document.
L'ERA mesure 3 niveaux de résultats : acquisition des compétences (niveau 1), utilisation des compétences / effets intermédiaires (niveau 2), retombées observées (niveau 3).
JSON attendu :
{
  "era": [
    {
      "niveau": "acquisition_competences" | "effets_intermediaires" | "retombees" | "extrants" | "synthese",
      "titre_section": "titre exact de la section telle qu'elle apparaît dans le document",
      "contenu": "texte complet de la section (plusieurs paragraphes séparés par \\n si nécessaire)",
      "chiffre_cle": "chiffre ou pourcentage mis en avant dans la section (ex: '75 %', '1 264') ou null",
      "ordre": numéro d'ordre commençant à 100
    }
  ],
  "projet_code": "code du projet (ex: PROJ_A14) ou null",
  "projet_nom": "nom du projet ou null",
  "annee": 2024,
  "confiance": 0.0 à 1.0,
  "champs_manquants": []
}`,

  chaine: `${SYSTEM_BASE}

Extrais UNIQUEMENT la chaîne des résultats CAD-OCDE (Extrants → Effets immédiats → Effets intermédiaires → Impact).
JSON attendu :
{
  "chaine": {
    "extrants_titre": "titre de la section Extrants ou null",
    "extrants_items": ["liste des réalisations directes, une par ligne"],
    "effets_immediats_titre": "titre de la section Effets immédiats ou null",
    "effets_immediats_items": ["liste des effets à court terme"],
    "effets_intermediaires_titre": "titre de la section Effets intermédiaires ou null",
    "effets_intermediaires_items": ["liste des effets à moyen terme"],
    "impact_titre": "titre de la section Impact ou null",
    "impact_items": ["liste des impacts à long terme"],
    "activites_structurantes": [
      { "volume": "chiffre ou quantité", "action": "description de l'activité" }
    ]
  },
  "confiance": 0.0 à 1.0,
  "champs_manquants": []
}`,

  temoignages: `${SYSTEM_BASE}

Extrais UNIQUEMENT les témoignages, citations et retours de bénéficiaires présents dans le document.
JSON attendu :
{
  "temoignages": [
    {
      "citation": "texte exact de la citation entre guillemets, tel qu'il apparaît dans le document",
      "auteur": null ou prénom et nom de l'auteur,
      "fonction": null ou fonction/titre (ex: Directrice d'école, Agent d'état civil),
      "pays": null ou code ISO3,
      "source": null ou nom du document source,
      "source_url": null ou URL si un lien est mentionné,
      "type_media": "video" si c'est un témoignage vidéo | "rapport" si rapport écrit | "article" | "interview" | "autre",
      "mise_en_avant": true si c'est un témoignage emblématique, sinon false
    }
  ],
  "confiance": 0.0 à 1.0,
  "champs_manquants": []
}`,

  global: '', // Construit dynamiquement en combinant tous les schémas
}

// Prompt global = combinaison de tous les schémas
PROMPTS.global = `${SYSTEM_BASE}

Extrais l'ensemble des informations disponibles dans le document. JSON attendu :
{
  "projet": { /* même structure que le mode projet */ },
  "indicateurs": [ /* même structure que le mode indicateurs */ ],
  "era": [ /* même structure que le mode era */ ],
  "chaine": { /* même structure que le mode chaine */ },
  "temoignages": [ /* même structure que le mode temoignages */ ],
  "pays_couverture": ["tableau de codes ISO3"],
  "confiance": 0.0 à 1.0,
  "champs_manquants": []
}

Pour chaque section, applique les mêmes règles que les modes individuels.`

// ─── Extraction DOCX via mammoth ─────────────────────────────────────────────
async function extractDocx(buffer: ArrayBuffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth')
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
    return result.value ?? ''
  } catch {
    // Fallback : extraction naïve si mammoth échoue
    const raw = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
    return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // ─── 1. Auth (table profils v3) ───────────────────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profil } = await supabase
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profil || !['admin', 'editeur'].includes(profil.role as string)) {
    return NextResponse.json({ error: 'Accès refusé — rôle insuffisant' }, { status: 403 })
  }

  // ─── 2. Récupération du fichier et du mode ────────────────────────────────
  let formData: FormData
  try { formData = await request.formData() }
  catch { return NextResponse.json({ error: 'Données de formulaire invalides' }, { status: 400 }) }

  const file = formData.get('file') as File | null
  const mode = (formData.get('mode') as string) || 'global'
  const contextProjet = (formData.get('contexte') as string) || ''  // infos contextuelles optionnelles

  if (!file) return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })

  const isDocx = file.name.endsWith('.docx') || file.type.includes('wordprocessingml')
  const isPdf  = file.name.endsWith('.pdf')  || file.type === 'application/pdf'
  const isTxt  = file.name.endsWith('.txt')  || file.type === 'text/plain'

  if (!isDocx && !isPdf && !isTxt) {
    return NextResponse.json({ error: 'Format non supporté. Utilisez DOCX, PDF ou TXT.' }, { status: 400 })
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 25 Mo)' }, { status: 400 })
  }

  const prompt = PROMPTS[mode] || PROMPTS.global

  // ─── 3. Extraction du texte ───────────────────────────────────────────────
  const buffer = await file.arrayBuffer()
  let texte: string

  if (isTxt) {
    texte = new TextDecoder('utf-8').decode(buffer)
  } else if (isDocx) {
    texte = await extractDocx(buffer)
  } else {
    // PDF : extraction basique (le PDF text-based peut souvent être lu)
    const raw = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
    texte = raw
      .replace(/[^\x20-\x7E\xA0-\xFF\u00C0-\u024F\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Nettoyage et limite tokens
  texte = texte.substring(0, 80000)

  if (!texte || texte.length < 100) {
    return NextResponse.json({
      error: 'Le fichier semble vide ou non lisible. Pour un PDF scanné, convertissez-le en DOCX d\'abord.'
    }, { status: 422 })
  }

  // ─── 4. Appel Claude ──────────────────────────────────────────────────────
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const userMessage = contextProjet
    ? `Contexte additionnel fourni par l'administrateur : ${contextProjet}\n\n---\n\nContenu du document :\n\n${texte}`
    : `Contenu du document CREXE à analyser :\n\n---\n\n${texte}\n\n---\n\nRetourne UNIQUEMENT le JSON valide, sans aucun texte autour.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8096,
      system: prompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const raw = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim()

    // Nettoyage des balises markdown si présentes
    const jsonText = raw
      .replace(/^```json?\s*/i, '')
      .replace(/\s*```$/,       '')
      .trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      // Tentative de récupération si Claude a ajouté du texte avant/après le JSON
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]) }
        catch { /* échec total */ }
      }
      if (!parsed) {
        console.error('[parse-document] JSON invalide:', jsonText.substring(0, 500))
        return NextResponse.json(
          { error: 'L\'IA n\'a pas retourné un JSON valide. Réessayez avec un document plus structuré.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ ok: true, mode, fichier: file.name, ...parsed as object })

  } catch (err) {
    console.error('[parse-document] Erreur Claude:', err)
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json(
      { error: `Erreur lors de l'analyse : ${msg}` },
      { status: 500 }
    )
  }
}
