// ─── Contexte vivant de la plateforme — connexion directe Supabase ───────────
// Ce module interroge les tables de la plateforme en temps réel pour alimenter
// le chatbot avec des données fraîches et sourcées, sans attendre l'upload RAG.
//
// Concept pédagogique — Deux sources de contexte complémentaires :
//
//   1. documents_rag (vectoriel) : passages de PDF/DOCX uploadés par l'admin.
//      → cherche par similarité sémantique, idéal pour les nuances narratives.
//
//   2. platform-context (SQL) : données structurées en direct depuis Supabase.
//      → projets, indicateurs, témoignages, ERA — toujours à jour, jamais périmés.
//
// L'API chat combine les deux pour un contexte complet et fiable.
//
// Concept pédagogique — Filtre par édition :
// En multi-éditions, chaque projet appartient à un exercice (annee_exercice).
// On filtre ici sur l'édition active pour que le chatbot réponde sur les données
// correctes : si l'utilisateur consulte le CREXE 2024, Claude parle du CREXE 2024.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { CREX_ANNEE } from '@/lib/constants'

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Types de sortie ─────────────────────────────────────────────────────────
export interface ProjetContexte {
  id: string
  code_officiel: string
  nom: string
  accroche: string | null
  description: string | null
  ps_id: string
  budget_engage: number | null
  taux_execution: number | null
  nombre_pays: number | null
  annee_exercice: number
  statut: string
  url: string                    // lien interne plateforme
  indicateurs: IndicateurContexte[]
}

interface IndicateurContexte {
  libelle: string
  valeur_numerique: number | null
  valeur_texte: string | null
  unite: string | null
  type_preuve: string
  categorie: string | null
}

// ─── 1. Récupérer tous les projets publiés avec leurs indicateurs clés ────────
/**
 * @param editionAnnee  Filtre sur l'exercice (défaut : CREX_ANNEE = 2025).
 *                      Passer NULL pour récupérer toutes les éditions.
 */
export async function getProjetsContexte(
  editionAnnee: number | null = CREX_ANNEE
): Promise<ProjetContexte[]> {
  const supabase = supabaseAdmin()

  let query = supabase
    .from('projets')
    .select(`
      id, code_officiel, nom, accroche, description, ps_id,
      budget_engage, taux_execution, nombre_pays, annee_exercice, statut
    `)
    .eq('statut', 'publie')
    .order('code_officiel')

  // Filtrer par édition si spécifiée
  if (editionAnnee !== null) {
    query = query.eq('annee_exercice', editionAnnee)
  }

  const { data: projets, error } = await query

  if (error || !projets) return []

  // Charger les indicateurs mise_en_avant pour chaque projet
  const projetIds = projets.map(p => p.id)
  if (projetIds.length === 0) return []

  const { data: indicateurs } = await supabase
    .from('indicateurs')
    .select('projet_id, libelle, valeur_numerique, valeur_texte, unite, type_preuve, categorie, mise_en_avant')
    .in('projet_id', projetIds)
    .eq('mise_en_avant', true)
    .order('ordre')

  const indicsByProjet = (indicateurs ?? []).reduce<Record<string, IndicateurContexte[]>>((acc, ind) => {
    const pid = ind.projet_id as string
    if (!acc[pid]) acc[pid] = []
    acc[pid].push({
      libelle: ind.libelle,
      valeur_numerique: ind.valeur_numerique,
      valeur_texte: ind.valeur_texte,
      unite: ind.unite,
      type_preuve: ind.type_preuve,
      categorie: ind.categorie,
    })
    return acc
  }, {})

  return projets.map(p => ({
    ...p,
    url: `/projets/${p.id}`,
    indicateurs: indicsByProjet[p.id] ?? [],
  }))
}

// ─── 2. Recherche textuelle simple sur les projets (par mots-clés) ────────────
// Utilisé quand la question mentionne un projet spécifique ou une thématique.
export function filtrerProjetsParQuestion(
  projets: ProjetContexte[],
  question: string
): ProjetContexte[] {
  const q = question.toLowerCase()

  // Détection de codes projet explicites (ex: P14, PROJ_A14, A14)
  const codeMatch = q.match(/\b(proj_?a?(\d+[a-z]?)|p(\d+[a-z]?))\b/i)
  if (codeMatch) {
    const num = codeMatch[2] ?? codeMatch[3]
    const filtered = projets.filter(p =>
      p.code_officiel.toLowerCase().includes(num.toLowerCase()) ||
      p.id.toLowerCase().includes(num.toLowerCase())
    )
    if (filtered.length > 0) return filtered
  }

  // Recherche par mots-clés dans nom/description
  const mots = q.split(/\s+/).filter(m => m.length > 3)
  const scores = projets.map(p => {
    const texte = [p.nom, p.accroche, p.description, p.code_officiel].join(' ').toLowerCase()
    const score = mots.filter(m => texte.includes(m)).length
    return { projet: p, score }
  })

  const pertinents = scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => s.projet)

  // Si aucun projet ne matche, retourner tous (vue d'ensemble)
  return pertinents.length > 0 ? pertinents : projets
}

// ─── 3. Formater le contexte plateforme pour l'injection dans le prompt ───────
export function formaterContextePlateforme(
  projets: ProjetContexte[],
  editionAnnee?: number | null
): string {
  if (projets.length === 0) return ''

  const anneeLabel = editionAnnee ? ` — Édition ${editionAnnee}` : ''
  const lignes: string[] = [
    `## Données en direct — Plateforme CREXE${anneeLabel}`,
    '',
    `Projets disponibles : ${projets.length}`,
    '',
  ]

  for (const p of projets) {
    lignes.push(`### ${p.code_officiel} — ${p.nom}`)
    lignes.push(`**Programme :** ${p.ps_id} | **Exercice :** ${p.annee_exercice} | **Pays couverts :** ${p.nombre_pays ?? 'N/D'}`)
    lignes.push(`**Lien plateforme :** [Consulter la fiche](${p.url})`)
    if (p.accroche) lignes.push(`**Accroche :** ${p.accroche}`)
    if (p.description) lignes.push(`**Description :** ${p.description.slice(0, 400)}${p.description.length > 400 ? '…' : ''}`)
    if (p.budget_engage) lignes.push(`**Budget engagé :** ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p.budget_engage)}`)
    if (p.taux_execution) lignes.push(`**Taux d'exécution :** ${p.taux_execution}%`)

    if (p.indicateurs.length > 0) {
      lignes.push('**Indicateurs clés :**')
      for (const ind of p.indicateurs) {
        const valeur = ind.valeur_numerique != null
          ? `${new Intl.NumberFormat('fr-FR').format(ind.valeur_numerique)}${ind.unite ? ' ' + ind.unite : ''}`
          : (ind.valeur_texte ?? 'N/D')
        lignes.push(`  - ${ind.libelle} : **${valeur}** (${ind.type_preuve})`)
      }
    }
    lignes.push('')
  }

  return lignes.join('\n')
}

// ─── 4. Pipeline complet : question → contexte plateforme ────────────────────
/**
 * @param question      Question de l'utilisateur
 * @param editionAnnee  Édition CREXE active (défaut : CREX_ANNEE). NULL = toutes.
 */
export async function getContextePlateforme(
  question: string,
  editionAnnee: number | null = CREX_ANNEE
): Promise<string> {
  try {
    const tousLesProjets = await getProjetsContexte(editionAnnee)
    const pertinents = filtrerProjetsParQuestion(tousLesProjets, question)
    return formaterContextePlateforme(pertinents, editionAnnee)
  } catch (err) {
    console.warn('[Platform Context] Erreur:', err)
    return ''
  }
}
