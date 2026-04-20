// ─── Fiche projet dynamique ─────────────────────────────────────────────────
// Route : /projets/[id]  (ex. /projets/PROJ_A14)
// Server Component — lecture de Supabase côté serveur.
//
// Contenu :
//   1. Hero (nom, accroche, badge PS, chiffres-clés)
//   2. Description longue
//   3. Synthèse des effets (3 KPI conditionnels : rayonnement, initiatives, engagement)
//   4. Tableau des changements induits (indicateurs groupés)
//   5. Niveaux de changement observé (SVG concentrique interactif)
//   6. Témoignages (avec photo + auteur + fonction)
//   7. Pays de couverture
//   8. Partenaires
//   9. Événements marquants (timeline)
// ─────────────────────────────────────────────────────────────────────────────

import { Fragment } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { BadgePreuve } from '@/components/shared/BadgePreuve'
import { CercleImpact, type CerclesImpactData } from '@/components/visuals/CercleImpact'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { ChaineResultats, type ChaineResultatsData, type ActiviteStructurante } from '@/components/shared/ChaineResultats'
import ContributionODD, { type OddContribution } from '@/components/shared/ContributionODD'
import type { TypePreuve } from '@/types/database'

// ─── Types locaux ─────────────────────────────────────────────────────────────
interface ProjetRow {
  id: string
  code_officiel: string | null
  ps_id: string | null
  nom: string
  accroche: string | null
  description: string | null
  annee_exercice: number
  budget_modifie: number | null
  budget_engage: number | null
  engagement_global: number | null
  taux_execution: number | null
  nombre_pays: number | null
  nombre_projets_deposes: number | null
  nombre_projets_retenus: number | null
  thematiques: string[] | null
  mots_cles: string[] | null
  cercles_impact: CerclesImpactData | null
}

interface Indicateur {
  id: string
  libelle: string
  valeur_numerique: number | null
  valeur_pourcentage: number | null
  unite: string | null
  categorie: string | null
  type_preuve: TypePreuve | null
  source: string | null
  hypothese_calcul: string | null
  mise_en_avant: boolean
  ordre: number
}

interface Temoignage {
  id: string
  citation: string
  auteur: string | null
  fonction: string | null
  photo_url: string | null
  source: string | null
  source_url: string | null
  type_media: string | null
  pays: string | null
  mise_en_avant: boolean
}

interface PaysCouverture {
  pays_code: string | null
  pays?: { nom_fr: string } | { nom_fr: string }[] | null
}

interface Partenariat {
  id: string
  nom: string
  acronyme: string | null
  type: string | null
  description: string | null
  ordre: number
}

interface Evenement {
  id: string
  titre: string
  description: string | null
  date_evenement: string | null
  type: string | null
  ordre: number
}

interface Programme {
  id: string
  nom: string
  nom_court: string | null
  couleur_theme: string | null
}

interface ChaineRow {
  extrants_titre: string | null
  extrants_items: string[] | null
  effets_immediats_titre: string | null
  effets_immediats_items: string[] | null
  effets_intermediaires_titre: string | null
  effets_intermediaires_items: string[] | null
  impact_titre: string | null
  impact_items: string[] | null
  activites_structurantes: ActiviteStructurante[] | null
}

interface Representation {
  id: number
  nom: string
  acronyme: string | null
  type: string | null
  region: string | null
  ville: string | null
  pays_code: string | null
  role_dans_projet: string | null
  description: string | null
  mise_en_avant: boolean
  ordre: number
}

const PS_FALLBACK_COLOR: Record<string, string> = {
  PS1: '#003DA5',
  PS2: '#6B2C91',
  PS3: '#0F6E56',
}

// ─── Chargement des données ────────────────────────────────────────────────────
async function loadFiche(id: string) {
  const supabase = await createClient()

  const { data: rawProjet, error } = await supabase
    .from('projets')
    .select(
      'id, code_officiel, ps_id, nom, accroche, description, annee_exercice, budget_modifie, budget_engage, engagement_global, taux_execution, nombre_pays, nombre_projets_deposes, nombre_projets_retenus, thematiques, mots_cles, cercles_impact'
    )
    .eq('id', id)
    .maybeSingle()

  if (error) console.error('[fiche projet] select error:', error.message)
  const projet = rawProjet as ProjetRow | null
  if (!projet) return null

  const [indicRes, temoRes, paysRes, partRes, evtRes, psRes, repexRes, chaineRes, oddRes, navRes] = await Promise.all([
    supabase
      .from('indicateurs')
      .select('id, libelle, valeur_numerique, valeur_pourcentage, unite, categorie, type_preuve, source, hypothese_calcul, mise_en_avant, ordre')
      .eq('projet_id', id)
      .order('ordre', { ascending: true }),
    supabase
      .from('temoignages')
      .select('id, citation, auteur, fonction, photo_url, source, source_url, type_media, pays, mise_en_avant')
      .eq('projet_id', id)
      .order('mise_en_avant', { ascending: false }),
    supabase
      .from('pays_couverture')
      .select('pays_code, pays:pays(nom_fr)')
      .eq('projet_id', id),
    supabase
      .from('partenariats')
      .select('id, nom, acronyme, type, description, ordre')
      .eq('projet_id', id)
      .order('ordre', { ascending: true }),
    supabase
      .from('evenements')
      .select('id, titre, description, date_evenement, type, ordre')
      .eq('projet_id', id)
      .order('date_evenement', { ascending: true }),
    projet.ps_id
      ? supabase
          .from('programmes_strategiques')
          .select('id, nom, nom_court, couleur_theme')
          .eq('id', projet.ps_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    // REPEX — graceful fallback si la table n'existe pas encore
    (async () => {
      try {
        return await supabase
          .from('representations')
          .select('id, nom, acronyme, type, region, ville, pays_code, role_dans_projet, description, mise_en_avant, ordre')
          .eq('projet_id', id)
          .order('ordre', { ascending: true })
      } catch {
        return { data: null, error: null }
      }
    })(),
    // Chaîne des résultats — graceful fallback
    (async () => {
      try {
        return await supabase
          .from('chaine_resultats')
          .select('extrants_titre, extrants_items, effets_immediats_titre, effets_immediats_items, effets_intermediaires_titre, effets_intermediaires_items, impact_titre, impact_items, activites_structurantes')
          .eq('projet_id', id)
          .maybeSingle()
      } catch {
        return { data: null, error: null }
      }
    })(),
    // Contributions ODD — graceful fallback si table pas encore migrée
    (async () => {
      try {
        return await supabase
          .from('odd_contributions')
          .select('id, odd_numero, cible_codes, texte_contribution, niveau_contribution, ordre, odd_objectif:odd_objectifs(libelle, couleur_hex)')
          .eq('projet_id', id)
          .eq('edition_annee', 2025)
          .order('ordre', { ascending: true })
      } catch {
        return { data: null, error: null }
      }
    })(),
    // Liste ordonnée des projets publiés pour navigation prev/next
    supabase
      .from('projets')
      .select('id, code_officiel, nom, ps_id')
      .eq('statut', 'publie')
      .order('code_officiel', { ascending: true }),
  ])

  return {
    projet: projet as ProjetRow,
    indicateurs: (indicRes.data ?? []) as Indicateur[],
    temoignages: (temoRes.data ?? []) as Temoignage[],
    pays: (paysRes.data ?? []) as PaysCouverture[],
    partenariats: (partRes.data ?? []) as Partenariat[],
    evenements: (evtRes.data ?? []) as Evenement[],
    programme: (psRes.data ?? null) as Programme | null,
    representations: ((repexRes as { data: unknown[] | null }).data ?? []) as Representation[],
    chaine: ((chaineRes as { data: unknown | null }).data ?? null) as ChaineRow | null,
    oddContributions: ((oddRes as { data: unknown[] | null }).data ?? []) as OddContribution[],
    navProjets: ((navRes.data ?? []) as { id: string; code_officiel: string | null; nom: string; ps_id: string | null }[]),
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatBudget(v: number | null): string | null {
  if (v == null) return null
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} M€`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)} k€`
  return `${v.toLocaleString('fr-FR')} €`
}

function formatNombre(v: number | null): string | null {
  if (v == null) return null
  return v.toLocaleString('fr-FR')
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatIndicValeur(ind: Indicateur): string {
  if (ind.valeur_pourcentage != null) return `${ind.valeur_pourcentage}${ind.unite ?? '%'}`
  if (ind.valeur_numerique != null) {
    const n = ind.valeur_numerique.toLocaleString('fr-FR')
    return ind.unite && ind.unite !== '%' ? `${n} ${ind.unite}` : n
  }
  return '—'
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await loadFiche(id)
  if (!data) return { title: 'Projet introuvable — CREXE' }
  return {
    title: `${data.projet.nom} — CREXE`,
    description: data.projet.accroche ?? data.projet.description?.slice(0, 160),
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function FicheProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await loadFiche(id)
  if (!data) notFound()

  const { projet, indicateurs, temoignages, pays, partenariats, evenements, programme, representations, chaine, oddContributions, navProjets } = data

  // Navigation précédent / suivant
  const navIdx   = navProjets.findIndex((p) => p.id === id)
  const prevProj = navIdx > 0 ? navProjets[navIdx - 1] : null
  const nextProj = navIdx >= 0 && navIdx < navProjets.length - 1 ? navProjets[navIdx + 1] : null
  const accent =
    programme?.couleur_theme ??
    PS_FALLBACK_COLOR[projet.ps_id ?? 'PS1'] ??
    '#003DA5'

  // Construction de l'objet ChaineResultatsData depuis la DB
  const chaineData: ChaineResultatsData | null = chaine ? {
    impact: {
      titre: chaine.impact_titre ?? '',
      items: chaine.impact_items ?? [],
    },
    effets_intermediaires: {
      titre: chaine.effets_intermediaires_titre ?? '',
      items: chaine.effets_intermediaires_items ?? [],
    },
    effets_immediats: {
      titre: chaine.effets_immediats_titre ?? '',
      items: chaine.effets_immediats_items ?? [],
    },
    extrants: {
      titre: chaine.extrants_titre ?? '',
      items: chaine.extrants_items ?? [],
    },
  } : null

  const activitesStructurantes: ActiviteStructurante[] = chaine?.activites_structurantes ?? []

  const kpisMisEnAvant = indicateurs.filter((i) => i.mise_en_avant)
  const autresIndicateurs = indicateurs.filter((i) => !i.mise_en_avant)

  // Groupement par catégorie pour le tableau des changements
  const categoriesMap = new Map<string, Indicateur[]>()
  for (const ind of indicateurs) {
    const cat = ind.categorie ?? 'Résultats'
    if (!categoriesMap.has(cat)) categoriesMap.set(cat, [])
    categoriesMap.get(cat)!.push(ind)
  }
  const categories = Array.from(categoriesMap.entries())

  // Données disponibles pour la synthèse des effets
  const hasRayonnement = projet.nombre_pays != null
  const hasInitiatives = projet.nombre_projets_retenus != null
  const hasEngagement = projet.engagement_global != null
  const hasSynthese = hasRayonnement || hasInitiatives || hasEngagement

  return (
    <article>
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="text-white relative overflow-hidden"
        style={{ background: `linear-gradient(140deg, var(--oif-blue-dark) 0%, ${accent}E0 100%)` }}
      >
        {/* Grille de fond */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '32px 32px' }}
          aria-hidden="true"
        />
        <div
          className="absolute -right-32 -bottom-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, white 0%, transparent 70%)` }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-12">
          {/* Fil d'Ariane */}
          <div className="flex items-center justify-between mb-8">
            <nav aria-label="Fil d'Ariane" className="text-xs text-white/50 flex items-center gap-1">
              <Link href="/projets" className="hover:text-white/80 transition">← Tous les projets</Link>
              {programme && (
                <>
                  <span className="text-white/25"> / </span>
                  <Link href={`/projets?ps=${programme.id}`} className="hover:text-white/80 transition">
                    {programme.id}{programme.nom_court ? ` · ${programme.nom_court}` : ''}
                  </Link>
                </>
              )}
            </nav>
            <a
              href={`/api/projets/${projet.id}/fiche-docx`}
              download
              className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition hover:bg-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              Fiche de portée
            </a>
          </div>

          {/* Badge programme + code */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {programme && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' }}>
                {programme.nom_court ?? programme.id}
              </span>
            )}
            <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.18)' }}>
              {projet.code_officiel ?? projet.id}
            </span>
            <span className="text-[10px] text-white/40 font-medium">Exercice {projet.annee_exercice}</span>
          </div>

          <h1 className="font-editorial text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-4 max-w-4xl">
            {projet.nom}
          </h1>
          {projet.accroche && (
            <p className="font-editorial italic text-lg md:text-2xl text-white/75 max-w-3xl mb-8 leading-relaxed">
              « {projet.accroche} »
            </p>
          )}

          {/* Barre de progression */}
          {projet.taux_execution != null && (
            <div className="max-w-sm mb-8">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/60">Taux d&apos;exécution budgétaire</span>
                <span className="text-sm font-bold text-white">{projet.taux_execution}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{
                  width: `${Math.min(projet.taux_execution, 100)}%`,
                  backgroundColor: projet.taux_execution >= 95 ? '#22c55e' : projet.taux_execution >= 80 ? '#D4A017' : '#ef4444',
                }} />
              </div>
            </div>
          )}

          {/* KPI Hero — affichés seulement si disponibles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {projet.budget_engage != null && (
              <ChiffreHero
                value={formatBudget(projet.budget_engage)!}
                label="Budget engagé"
                sub={formatBudget(projet.budget_modifie) != null ? `sur ${formatBudget(projet.budget_modifie)} alloués` : undefined}
                accent={accent}
                highlight
              />
            )}
            {projet.nombre_pays != null && (
              <ChiffreHero
                value={`${projet.nombre_pays} pays`}
                label="Rayonnement"
                sub="États membres concernés"
                accent={accent}
              />
            )}
            {projet.nombre_projets_retenus != null && (
              <ChiffreHero
                value={formatNombre(projet.nombre_projets_retenus)!}
                label="Initiatives retenues"
                sub={projet.nombre_projets_deposes != null ? `sur ${formatNombre(projet.nombre_projets_deposes)} candidatures` : undefined}
                accent={accent}
              />
            )}
            {projet.engagement_global != null && (
              <ChiffreHero
                value={formatBudget(projet.engagement_global)!}
                label="Engagement global"
                sub="sur la durée du projet"
                accent={accent}
              />
            )}
          </div>
        </div>

        {/* Vague */}
        <div className="relative h-10 overflow-hidden" aria-hidden="true">
          <svg viewBox="0 0 1440 40" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ─── Description ──────────────────────────────────────────────────── */}
      {projet.description && (
        <section className="bg-white py-14">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: accent }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
                Présentation du projet
              </p>
            </div>
            <p className="text-lg text-[var(--oif-blue-dark)] leading-relaxed pl-5 border-l-4" style={{ borderColor: accent }}>
              {projet.description}
            </p>
            {(projet.thematiques?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {projet.thematiques!.map((t) => (
                  <span key={t} className="text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: accent + '15', color: accent, border: `1px solid ${accent}30` }}>
                    {t.replaceAll('_', ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Fiche signalétique ───────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: accent }}>
            Fiche signalétique
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              projet.code_officiel && { label: 'Code officiel', value: projet.code_officiel },
              programme && { label: 'Programme', value: programme.nom_court ?? programme.id },
              { label: 'Exercice', value: String(projet.annee_exercice) },
              projet.budget_engage != null && { label: 'Budget engagé', value: formatBudget(projet.budget_engage)! },
              projet.budget_modifie != null && { label: 'Budget alloué', value: formatBudget(projet.budget_modifie)! },
              projet.engagement_global != null && { label: 'Engagement global', value: formatBudget(projet.engagement_global)! },
              projet.taux_execution != null && { label: "Taux d'exécution", value: `${projet.taux_execution} %` },
              projet.nombre_pays != null && { label: 'Couverture géo.', value: `${projet.nombre_pays} pays` },
              projet.nombre_projets_deposes != null && { label: 'Candidatures reçues', value: formatNombre(projet.nombre_projets_deposes)! },
              projet.nombre_projets_retenus != null && { label: 'Projets retenus', value: formatNombre(projet.nombre_projets_retenus)! },
            ].filter(Boolean).map((item, i) => {
              const { label, value } = item as { label: string; value: string }
              return (
                <div key={i} className="bg-[var(--oif-neutral)] rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">{label}</p>
                  <p className="font-semibold text-[var(--oif-blue-dark)] text-sm leading-snug">{value}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Synthèse des effets (3 KPI conditionnels) ────────────────────── */}
      {hasSynthese && (
        <section className="bg-[var(--oif-neutral)] py-10 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: accent }}>
              Données clés de portée — Exercice {projet.annee_exercice}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {hasRayonnement && (
                <div className="group rounded-xl bg-white border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: accent + '18' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8}
                        stroke={accent} className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Rayonnement</p>
                      <p className="font-editorial text-3xl font-bold mt-0.5" style={{ color: accent }}>
                        <AnimatedCounter value={projet.nombre_pays!} suffix=" pays" />
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    États membres de l&apos;espace francophone concernés par les actions du projet en {projet.annee_exercice}.
                  </p>
                </div>
              )}

              {hasInitiatives && (
                <div className="group rounded-xl bg-white border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: accent + '18' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8}
                        stroke={accent} className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Initiatives retenues en {projet.annee_exercice}</p>
                      <p className="font-editorial text-3xl font-bold mt-0.5" style={{ color: accent }}>
                        <AnimatedCounter value={projet.nombre_projets_retenus!} />
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Projets sélectionnés{projet.nombre_projets_deposes ? ` sur ${formatNombre(projet.nombre_projets_deposes)} candidatures reçues` : ' à l\'issue du processus de sélection'}.
                  </p>
                </div>
              )}

              {hasEngagement && (
                <div className="group rounded-xl bg-white border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: accent + '18' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8}
                        stroke={accent} className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 01-.75.75h-.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Engagement global</p>
                      <p className="font-editorial text-3xl font-bold mt-0.5" style={{ color: accent }}>
                        {formatBudget(projet.engagement_global)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Budget total mobilisé sur l&apos;ensemble de la durée de vie du projet, toutes sources confondues.
                  </p>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ─── Réalisations clés ─────────────────────────────────────────────── */}
      {projet.cercles_impact && Object.keys(projet.cercles_impact).length > 0 && (
        <section className="py-14" style={{ background: `linear-gradient(135deg, var(--oif-blue-dark) 0%, ${accent}CC 100%)` }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px opacity-30" style={{ background: 'white' }} />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                Réalisations clés du projet
              </p>
              <div className="flex-1 h-px opacity-30" style={{ background: 'white' }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Coeur — investissement */}
              {projet.cercles_impact.coeur && (
                <RealisationCard
                  icon="💰"
                  valeur={projet.cercles_impact.coeur.valeur ?? (projet.engagement_global ? `${(projet.engagement_global / 1_000_000).toFixed(1)} M€` : null)}
                  label="Investissement OIF"
                  preuve="Comptabilité vérifiée"
                  accent={accent}
                />
              )}
              {/* N1 — bénéficiaires directes */}
              {projet.cercles_impact.niveau1 && (
                <RealisationCard
                  icon="👩"
                  valeur={projet.cercles_impact.niveau1.valeur ?? null}
                  label={projet.cercles_impact.niveau1.label ?? 'Bénéficiaires directes'}
                  preuve={projet.cercles_impact.niveau1.type_preuve ?? 'Mesuré'}
                  accent="#D4A017"
                />
              )}
              {/* N2 — familles */}
              {projet.cercles_impact.niveau2 && (
                <RealisationCard
                  icon="🏘️"
                  valeur={projet.cercles_impact.niveau2.valeur ?? null}
                  label={projet.cercles_impact.niveau2.label ?? 'Familles touchées'}
                  preuve={projet.cercles_impact.niveau2.type_preuve ?? 'Estimé'}
                  accent="#D4A017"
                />
              )}
              {/* Taux exécution ou N3 */}
              {projet.taux_execution != null ? (
                <RealisationCard
                  icon="📈"
                  valeur={`${projet.taux_execution} %`}
                  label="Taux d'exécution budgétaire"
                  preuve="Comptabilité OIF"
                  accent={accent}
                />
              ) : projet.cercles_impact.niveau3 ? (
                <RealisationCard
                  icon="🌍"
                  valeur={projet.cercles_impact.niveau3.valeur ?? null}
                  label={projet.cercles_impact.niveau3.label ?? 'Communautés mobilisées'}
                  preuve={projet.cercles_impact.niveau3.type_preuve ?? 'Observé'}
                  accent={accent}
                />
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* ─── Chaîne des résultats — Pipeline interactif ──────────────────── */}
      {chaineData && (
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            {/* En-tête */}
            <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, #0F6E56, #C07A10, #B83A2D, #6B2C91)` }} />
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Théorie du changement · CAD-OCDE
                  </p>
                </div>
                <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)] mb-3">
                  Chaîne des résultats
                </h2>
                <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
                  Visualisation de la cascade d&apos;effets : des réalisations directes (extrants) vers l&apos;impact
                  structurel à long terme. Cliquez sur chaque niveau pour afficher le détail.
                </p>
              </div>
              {/* Indicateur de lecture */}
              <div className="hidden lg:flex flex-col items-center gap-1 text-xs text-gray-300 flex-shrink-0 border border-gray-100 rounded-xl p-4 bg-gray-50">
                <div className="flex gap-1 items-center flex-wrap justify-center mb-1">
                  {['#0F6E56','#C07A10','#B83A2D','#6B2C91'].map((c, i) => (
                    <span key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-center leading-relaxed" style={{ fontSize: '10px' }}>
                  Lecture<br/>ascendante ↑
                </span>
              </div>
            </div>
            <ChaineResultats
              data={chaineData}
              activites={activitesStructurantes}
              accentColor={accent}
            />
          </div>
        </section>
      )}

      {/* ─── Contribution aux cibles ODD ──────────────────────────────────── */}
      {oddContributions.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accent }}>
                Agenda 2030
              </p>
              <h2 className="font-editorial text-2xl md:text-3xl font-semibold text-[var(--oif-blue-dark)]">
                Contribution aux cibles ODD
              </h2>
              <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
                Analyse des liens entre les indicateurs du projet et les Objectifs de développement durable (ODD)
                de l&apos;Agenda 2030 des Nations Unies, selon les réalisations documentées en 2025.
              </p>
            </div>
            <ContributionODD
              contributions={oddContributions}
              accentColor={accent}
            />
          </div>
        </section>
      )}

      {/* ─── Tableau des changements induits ──────────────────────────────── */}
      {indicateurs.length > 0 && (
        <section className="py-16" style={{ background: 'linear-gradient(180deg,#f8f9ff 0%,#ffffff 100%)' }}>
          <div className="max-w-7xl mx-auto px-6">

            {/* En-tête avec badge ERA */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
                    Effets et changements documentés
                  </p>
                  {/* Badge Enquête ERA — souligne la source */}
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: accent + '18', color: accent, border: `1px solid ${accent}30` }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Mesure ERA 2025
                  </span>
                </div>
                <h2 className="font-editorial text-2xl md:text-3xl font-semibold text-[var(--oif-blue-dark)] mb-3">
                  Quelques chiffres clés
                </h2>
                <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
                  Effets mesurés, estimés ou observés issus de la Mesure des Résultats et Apprentissages (ERA 2025).
                  Chaque indicateur est sourcé et qualifié selon le niveau de preuve disponible.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0 border border-gray-100 rounded-xl px-4 py-3 bg-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                </svg>
                {indicateurs.length} indicateur{indicateurs.length > 1 ? 's' : ''} documenté{indicateurs.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* KPIs en avant */}
            {kpisMisEnAvant.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                {kpisMisEnAvant.map((ind) => (
                  <IndicateurCard key={ind.id} ind={ind} accent={accent} />
                ))}
              </div>
            )}

            {/* Tableau complet groupé par catégorie */}
            {categories.length > 0 && (
              <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-gray-500 border-b-2 border-gray-100"
                      style={{ backgroundColor: accent + '0B' }}>
                      <th className="text-left px-6 py-4 font-bold w-1/2">Changement constaté</th>
                      <th className="text-right px-6 py-4 font-bold">Résultat ERA</th>
                      <th className="text-right px-6 py-4 font-bold hidden md:table-cell">Qualité</th>
                      <th className="text-right px-6 py-4 font-bold hidden xl:table-cell">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(([cat, inds]) => (
                      <Fragment key={cat}>
                        {/* Ligne de catégorie — séparation visuelle forte */}
                        <tr className="border-t border-gray-100">
                          <td colSpan={4} className="px-6 py-3"
                            style={{ backgroundColor: accent + '06' }}>
                            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                              style={{ backgroundColor: accent + '15', color: accent }}>
                              {cat}
                            </span>
                          </td>
                        </tr>
                        {/* Lignes d'indicateurs */}
                        {inds.map((ind) => {
                          const hasPct = ind.valeur_pourcentage != null
                          const pct    = Math.min(100, Math.max(0, ind.valeur_pourcentage ?? 0))
                          return (
                            <tr key={ind.id}
                              className="border-t border-gray-50 transition-colors duration-150 hover:bg-gray-50/70 group">
                              <td className="px-6 py-4">
                                <p className="text-[var(--oif-blue-dark)] font-semibold text-sm leading-snug">
                                  {ind.libelle}
                                </p>
                                {ind.hypothese_calcul && (
                                  <p className="text-xs text-gray-400 italic mt-1 leading-relaxed border-l-2 pl-2 ml-0.5"
                                    style={{ borderColor: accent + '30' }}>
                                    {ind.hypothese_calcul}
                                  </p>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right align-top">
                                <div className="flex flex-col items-end gap-1.5">
                                  <span className="font-editorial text-lg font-bold leading-none"
                                    style={{ color: accent }}>
                                    {formatIndicValeur(ind)}
                                  </span>
                                  {/* Mini-barre si pourcentage */}
                                  {hasPct && (
                                    <div className="w-20 h-1.5 rounded-full overflow-hidden"
                                      style={{ backgroundColor: accent + '18' }}>
                                      <div className="h-full rounded-full"
                                        style={{ width: `${pct}%`, backgroundColor: accent }} />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right hidden md:table-cell align-top pt-[18px]">
                                {ind.type_preuve && <BadgePreuve type={ind.type_preuve} taille="sm" hideDot />}
                              </td>
                              <td className="px-6 py-4 text-right hidden xl:table-cell align-top pt-5">
                                {ind.source && (
                                  <span className="text-[11px] text-gray-400 leading-relaxed max-w-[14rem] block text-right">
                                    {ind.source}
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Fallback sans catégories */}
            {categories.length === 0 && autresIndicateurs.length > 0 && (
              <details className="bg-[var(--oif-neutral)] rounded-xl border border-gray-100">
                <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-[var(--oif-blue-dark)] hover:bg-gray-100 rounded-xl">
                  Voir les {autresIndicateurs.length} indicateurs complémentaires
                </summary>
                <ul className="divide-y divide-gray-100 px-5 pb-3">
                  {autresIndicateurs.map((ind) => (
                    <li key={ind.id} className="flex items-start justify-between gap-4 py-3 text-sm hover:bg-gray-50 transition-colors rounded px-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--oif-blue-dark)]">{ind.libelle}</p>
                        {ind.source && <p className="text-xs text-gray-400 mt-0.5">Source : {ind.source}</p>}
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <span className="font-editorial text-base font-semibold text-[var(--oif-blue-dark)]">
                          {formatIndicValeur(ind)}
                        </span>
                        {ind.type_preuve && <BadgePreuve type={ind.type_preuve} taille="sm" hideDot />}
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </section>
      )}

      {/* ─── Niveaux de changement observé (SVG interactif) ───────────────── */}
      {projet.cercles_impact && (
        <section className="bg-[var(--oif-cream)] py-16">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-semibold text-[var(--oif-blue)] uppercase tracking-widest mb-2">
              Cascade des effets
            </p>
            <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)] mb-4">
              Niveaux de changement observé
            </h2>
            <p className="text-gray-500 mb-10 max-w-2xl text-sm leading-relaxed">
              Représentation concentrique des effets du projet : du cœur (bénéficiaires directes) vers la portée institutionnelle la plus large. Cliquez sur chaque anneau pour découvrir le détail du changement à ce niveau.
            </p>
            <CercleImpact data={projet.cercles_impact} />
          </div>
        </section>
      )}

      {/* ─── Témoignages ──────────────────────────────────────────────────── */}
      {temoignages.length > 0 && (
        <section className="py-16" style={{ backgroundColor: 'var(--oif-cream)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accent }}>
                  Voix du terrain
                </p>
                <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)]">
                  Témoignages et parcours
                </h2>
                <p className="text-gray-500 mt-2 text-sm">
                  {temoignages.length} témoignage{temoignages.length > 1 ? 's' : ''} recueilli{temoignages.length > 1 ? 's' : ''} lors de l&apos;enquête ERA 2025
                </p>
              </div>
            </div>
            {/* Grille responsive : 1 col → 2 col → 3 col selon le nombre */}
            <div className={`grid gap-6 ${
              temoignages.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
              temoignages.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {temoignages.map((t) => (
                <TemoignageCard key={t.id} t={t} accent={accent} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Pays de couverture ───────────────────────────────────────────── */}
      {pays.length > 0 && (
        <section className="bg-[var(--oif-cream)] py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs font-semibold text-[var(--oif-blue)] uppercase tracking-widest mb-2">
              Déploiement géographique
            </p>
            <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)] mb-2">
              {pays.length} pays d&apos;intervention
            </h2>
            <p className="text-gray-500 mb-8 max-w-xl">
              Pays francophones dans lesquels des activités du projet sont déployées en {projet.annee_exercice}.
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {pays.map((p) => (
                <li key={p.pays_code ?? Math.random()}
                  className="flex items-center gap-2 text-sm bg-white border border-gray-100 rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <span className="text-[10px] font-mono uppercase flex-shrink-0" style={{ color: accent }}>
                    {p.pays_code}
                  </span>
                  <span className="text-[var(--oif-blue-dark)] truncate">
                    {Array.isArray(p.pays) ? (p.pays[0]?.nom_fr ?? p.pays_code) : (p.pays?.nom_fr ?? p.pays_code)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─── Partenaires ──────────────────────────────────────────────────── */}
      {partenariats.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-semibold text-[var(--oif-blue)] uppercase tracking-widest mb-2">
              Alliances
            </p>
            <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)] mb-8">
              Partenaires engagés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partenariats.map((p) => (
                <div key={p.id}
                  className="bg-[var(--oif-neutral)] rounded-xl border border-gray-100 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[var(--oif-blue-dark)]">
                      {p.nom}
                      {p.acronyme && <span className="text-gray-400 font-normal"> ({p.acronyme})</span>}
                    </h3>
                    {p.type && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
                        style={{ backgroundColor: accent + '20', color: accent }}>
                        {p.type}
                      </span>
                    )}
                  </div>
                  {p.description && <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── REPEX — Représentations OIF ──────────────────────────────────── */}
      {representations.length > 0 && (
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            {/* En-tête */}
            <div className="flex items-end justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block w-6 h-0.5 rounded-full" style={{ backgroundColor: '#D4A017' }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4A017' }}>
                    REPEX
                  </p>
                </div>
                <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)]">
                  Représentations de l&apos;Organisation
                </h2>
                <p className="mt-2 text-sm text-gray-500 max-w-xl">
                  Bureaux régionaux et délégations permanentes de l&apos;OIF impliqués dans le déploiement de ce projet.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 flex-shrink-0 text-xs text-gray-400 border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4A017" strokeWidth="2">
                  <path strokeLinecap="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
                </svg>
                {representations.length} représentation{representations.length > 1 ? 's' : ''} active{representations.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Grille des représentations */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {representations.map((rep) => (
                <div key={rep.id}
                  className="group relative rounded-2xl border bg-white p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                  style={{ borderColor: rep.mise_en_avant ? '#D4A01733' : '#E5E7EB' }}>
                  {/* Accent top si mise en avant */}
                  {rep.mise_en_avant && (
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#D4A017' }} />
                  )}

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#D4A01718' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4A017" strokeWidth="1.8">
                        <path strokeLinecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[var(--oif-blue-dark)] leading-snug">
                        {rep.nom}
                      </h3>
                      {rep.acronyme && (
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                          style={{ backgroundColor: '#D4A01720', color: '#D4A017' }}>
                          {rep.acronyme}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Localisation */}
                  {(rep.ville || rep.region) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
                      </svg>
                      {[rep.ville, rep.region].filter(Boolean).join(', ')}
                    </div>
                  )}

                  {/* Rôle dans le projet */}
                  {rep.role_dans_projet && (
                    <p className="text-xs font-semibold text-[var(--oif-blue-dark)] mb-2 flex items-start gap-1.5">
                      <span className="mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center"
                        style={{ backgroundColor: '#D4A01720' }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="#D4A017" stroke="none">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                        </svg>
                      </span>
                      {rep.role_dans_projet}
                    </p>
                  )}

                  {/* Description */}
                  {rep.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                      {rep.description}
                    </p>
                  )}

                  {/* Badge type */}
                  <div className="mt-4 pt-3 border-t border-gray-50">
                    <span className="text-[10px] uppercase tracking-wider text-gray-300 font-medium">
                      {(rep.type ?? 'représentation').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Événements marquants ─────────────────────────────────────────── */}
      {evenements.length > 0 && (
        <section className="bg-[var(--oif-cream)] py-16">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-xs font-semibold text-[var(--oif-blue)] uppercase tracking-widest mb-2">
              Jalons
            </p>
            <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)] mb-10">
              Événements marquants
            </h2>
            <ol className="relative border-l-2 pl-8 space-y-8" style={{ borderColor: accent + '33' }}>
              {evenements.map((e) => (
                <li key={e.id} className="relative group">
                  <span
                    className="absolute -left-[41px] top-1 w-4 h-4 rounded-full border-4 border-white transition-transform duration-200 group-hover:scale-125"
                    style={{ backgroundColor: accent }}
                    aria-hidden="true"
                  />
                  {e.date_evenement && (
                    <time className="text-xs uppercase tracking-widest text-gray-400">{formatDate(e.date_evenement)}</time>
                  )}
                  <h3 className="font-semibold text-lg text-[var(--oif-blue-dark)] mt-1">{e.titre}</h3>
                  {e.description && <p className="text-sm text-gray-600 leading-relaxed mt-1">{e.description}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ─── Navigation flottante Projet précédent / suivant ──────────────── */}
      {/* Affiché uniquement si au moins un voisin existe dans la liste publiée */}
      {(prevProj || nextProj) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl px-3 py-2">
          {prevProj ? (
            <Link
              href={`/projets/${prevProj.id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors group"
              title={prevProj.nom}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:-translate-x-0.5 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="hidden md:block max-w-[12rem] truncate">{prevProj.code_officiel}</span>
            </Link>
          ) : (
            <div className="w-10" />
          )}

          {/* Indicateur position */}
          <div className="flex items-center gap-1.5 px-3 border-x border-gray-100">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
            <span className="text-xs text-gray-400 font-medium">
              {navIdx + 1} / {navProjets.length}
            </span>
          </div>

          {nextProj ? (
            <Link
              href={`/projets/${nextProj.id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors group"
              title={nextProj.nom}
            >
              <span className="hidden md:block max-w-[12rem] truncate">{nextProj.code_officiel}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-0.5 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ) : (
            <div className="w-10" />
          )}
        </div>
      )}
    </article>
  )
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

// Carte réalisation clé (section "Réalisations clés" sur fond sombre)
function RealisationCard({ icon, valeur, label, preuve, accent }: {
  icon: string; valeur: string | null; label: string; preuve: string; accent: string
}) {
  if (!valeur) return null
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 hover:scale-[1.03]"
      style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
      <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
      <p className="font-editorial text-3xl font-bold text-white mb-1 leading-tight">{valeur}</p>
      <p className="text-sm text-white/80 mb-2">{label}</p>
      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full text-white/50"
        style={{ backgroundColor: accent + '33', border: '1px solid ' + accent + '44' }}>
        {preuve}
      </span>
    </div>
  )
}

function ChiffreHero({ value, label, sub, accent, highlight = false }: {
  value: string; label: string; sub?: string; accent: string; highlight?: boolean
}) {
  return (
    <div className="rounded-xl px-5 py-5 flex flex-col relative overflow-hidden transition-all duration-200 hover:scale-[1.02]"
      style={{
        backgroundColor: highlight ? accent : 'rgba(255,255,255,0.08)',
        border: highlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
      }}>
      {!highlight && <span className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: accent + '99' }} />}
      <p className="font-editorial text-3xl md:text-4xl font-semibold text-white leading-none mb-2">{value}</p>
      <p className="text-sm text-white/75">{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: highlight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)' }}>{sub}</p>}
    </div>
  )
}

// ─── Icône indicative selon la catégorie / libellé ────────────────────────────
// Permet d'assigner automatiquement une icône parlante à chaque KPI
function getIndicIcon(libelle: string, categorie: string | null): string {
  const t = (libelle + ' ' + (categorie ?? '')).toLowerCase()
  if (t.includes('femme') || t.includes('genre') || t.includes('fille'))          return '♀'
  if (t.includes('jeune') || t.includes('youth'))                                  return '🎓'
  if (t.includes('formation') || t.includes('formé') || t.includes('formés'))     return '📚'
  if (t.includes('emploi') || t.includes('revenu') || t.includes('économi'))      return '💼'
  if (t.includes('pays') || t.includes('état') || t.includes('nation'))           return '🌍'
  if (t.includes('partenair') || t.includes('institution'))                        return '🤝'
  if (t.includes('numérique') || t.includes('digital') || t.includes('technolog')) return '💻'
  if (t.includes('environ') || t.includes('climat') || t.includes('écologi'))     return '🌿'
  if (t.includes('tourisme'))                                                       return '🏔'
  if (t.includes('culture') || t.includes('patrimoin'))                            return '🎭'
  if (t.includes('santé') || t.includes('médical'))                               return '🏥'
  if (t.includes('eau') || t.includes('hydrau'))                                  return '💧'
  if (t.includes('bénéficiaire') || t.includes('bénéficié'))                      return '👥'
  if (t.includes('budget') || t.includes('financement') || t.includes('euro'))    return '💰'
  if (t.includes('taux') || t.includes('pourcentage'))                             return '📊'
  if (t.includes('satisfaction') || t.includes('qualité'))                         return '⭐'
  if (t.includes('innov'))                                                          return '💡'
  return '📈'
}

function IndicateurCard({ ind, accent }: { ind: Indicateur; accent: string }) {
  // Si on a un pourcentage, on affiche une barre de progression
  const hasPercent = ind.valeur_pourcentage != null
  const pct        = Math.min(100, Math.max(0, ind.valeur_pourcentage ?? 0))
  const icon       = getIndicIcon(ind.libelle, ind.categorie)

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 group"
      style={{ border: `1.5px solid ${accent}30`, backgroundColor: accent + '0A' }}>

      {/* Bandeau couleur en haut */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg,${accent},${accent}88)` }} />

      {/* Zone valeur — fond coloré plein */}
      <div className="px-5 pt-5 pb-4 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,${accent}22,${accent}0C)` }}>
        {/* Icône décorative grande en fond */}
        <div className="absolute -right-3 -top-2 text-6xl opacity-10 select-none" aria-hidden>
          {icon}
        </div>

        <div className="relative z-10">
          {/* Icône + badge preuve */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl leading-none" aria-hidden>{icon}</span>
            {ind.type_preuve && <BadgePreuve type={ind.type_preuve} taille="sm" />}
          </div>

          {/* Valeur principale avec compteur animé */}
          <span className="font-editorial leading-none font-bold block"
            style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: accent }}>
            {ind.valeur_pourcentage != null ? (
              <AnimatedCounter
                value={ind.valeur_pourcentage}
                suffix={ind.unite ?? ' %'}
                decimals={ind.valeur_pourcentage % 1 !== 0 ? 1 : 0}
                duration={1800}
              />
            ) : ind.valeur_numerique != null ? (
              <AnimatedCounter
                value={ind.valeur_numerique}
                suffix={ind.unite ? ` ${ind.unite}` : ''}
                decimals={0}
                duration={1600}
              />
            ) : (
              formatIndicValeur(ind)
            )}
          </span>

          {/* Barre de progression si pourcentage */}
          {hasPercent && (
            <div className="mt-3">
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: accent + '25' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg,${accent}AA,${accent})`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] mt-1" style={{ color: accent + 'AA' }}>
                <span>0 %</span>
                <span>100 %</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone texte */}
      <div className="px-5 py-4 flex flex-col flex-1 bg-white">
        <p className="text-sm font-semibold text-[var(--oif-blue-dark)] leading-snug mb-2">
          {ind.libelle}
        </p>
        {ind.hypothese_calcul && (
          <p className="text-xs text-gray-500 italic leading-relaxed mb-2 border-l-2 pl-2"
            style={{ borderColor: accent + '40' }}>
            {ind.hypothese_calcul}
          </p>
        )}
        {ind.source && (
          <p className="text-[11px] text-gray-400 mt-auto pt-3 border-t border-gray-100 flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
            </svg>
            {ind.source}
          </p>
        )}
      </div>
    </div>
  )
}

function TemoignageCard({ t, accent }: { t: Temoignage; accent: string }) {
  const isVideo = t.type_media === 'video'

  return (
    <figure className="rounded-2xl overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group bg-white flex flex-col"
      style={{ borderColor: accent + '20' }}>

      {/* ── Grande photo portrait ── */}
      <div className="relative w-full overflow-hidden bg-gray-100"
        style={{ aspectRatio: '4/3' }}>
        {t.photo_url ? (
          <Image
            src={t.photo_url}
            alt={t.auteur ?? 'Portrait du témoin'}
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 50vw"
          />
        ) : (
          /* Placeholder illustré si pas de photo */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg,${accent}18,${accent}08)` }}>
            <span className="font-editorial text-8xl leading-none font-bold"
              style={{ color: accent + '30' }} aria-hidden>
              {t.auteur?.[0]?.toUpperCase() ?? '«'}
            </span>
          </div>
        )}

        {/* Gradient bas pour lisibilité du nom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Identité en overlay bas */}
        {t.auteur && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="font-semibold text-white text-base leading-tight drop-shadow">
              {t.auteur}
            </p>
            {(t.fonction || t.pays) && (
              <p className="text-white/80 text-sm mt-0.5 leading-tight drop-shadow">
                {[t.fonction, t.pays].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        )}

        {/* Badge vidéo */}
        {isVideo && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
            style={{ backgroundColor: accent + 'CC', color: 'white' }}>
            ▶ Vidéo
          </div>
        )}
      </div>

      {/* ── Citation ── */}
      <div className="px-6 pt-5 pb-6 flex flex-col flex-1 bg-white">
        {/* Grand guillemet décoratif */}
        <span className="font-editorial text-6xl leading-none block -mb-2"
          style={{ color: accent + '60' }} aria-hidden>
          «
        </span>
        <blockquote
          className="font-editorial italic text-base leading-relaxed flex-1 mt-2 text-[var(--oif-blue-dark)]"
          style={{ borderLeft: `3px solid ${accent}35`, paddingLeft: '1rem' }}>
          {t.citation}
        </blockquote>

        {/* Source */}
        {(t.source || t.source_url) && (
          <figcaption className="flex items-center gap-2 text-xs text-gray-400 pt-4 mt-2 border-t border-gray-100">
            {t.source_url ? (
              <a href={t.source_url} target="_blank" rel="noopener noreferrer"
                className="hover:underline transition-colors" style={{ color: accent }}>
                {t.source ?? 'Source'} {isVideo ? '▶' : '↗'}
              </a>
            ) : (
              <span>{t.source}</span>
            )}
          </figcaption>
        )}
      </div>
    </figure>
  )
}
