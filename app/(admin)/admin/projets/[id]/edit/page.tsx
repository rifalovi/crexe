'use client'

// ─── Page d'édition complète d'un projet ──────────────────────────────────────
// Route : /admin/projets/[id]/edit
//
// Concept pédagogique : "Formulaire contrôlé multi-onglets"
// ───────────────────────────────────────────────────────────
// Un formulaire contrôlé signifie que CHAQUE champ est lié à un état React.
// Quand l'utilisateur saisit, l'état se met à jour en temps réel.
// À la sauvegarde, on envoie uniquement les données modifiées (diff) vers
// Supabase pour éviter les conflits d'édition concurrente.
//
// Architecture des onglets :
//   1. Projet      — métadonnées, budget, champs narratifs
//   2. Indicateurs — KPIs avec type de preuve
//   3. Cercles     — structure JSONB des niveaux de changement observé
//   4. Témoignages — citations + photo + auteur
//   5. Partenaires — organisations partenaires
//   6. Événements  — timeline d'événements marquants
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProjetForm {
  id: string
  code_officiel: string
  ps_id: string
  nom: string
  accroche: string
  description: string
  annee_exercice: string
  budget_modifie: string
  budget_engage: string
  engagement_global: string
  taux_execution: string
  nombre_pays: string
  nombre_projets_deposes: string
  nombre_projets_retenus: string
  thematiques: string
  mots_cles: string
  date_debut: string
  date_fin: string
  statut: 'brouillon' | 'en_revue' | 'publie' | 'archive'
  est_sous_projet: boolean
  projet_parent_id: string
}

interface IndicateurForm {
  id?: string
  libelle: string
  valeur_numerique: string
  valeur_pourcentage: string
  valeur_texte: string
  unite: string
  categorie: string
  type_preuve: string
  source: string
  source_url: string
  hypothese_calcul: string
  mise_en_avant: boolean
  ordre: number
  _deleted?: boolean
}

// Une "bague" du cercle d'impact
interface CercleRing {
  valeur: string
  label: string
  description: string
  type_preuve: string
  hypothese: string
  detail: string
}

interface CerclesImpactForm {
  coeur: CercleRing
  niveau1: CercleRing
  niveau2: CercleRing
  niveau3: CercleRing
  niveau4: CercleRing
}

interface TemoignageForm {
  id?: string
  citation: string
  auteur: string
  fonction: string
  pays: string
  photo_url: string
  source: string
  source_url: string
  type_media: string
  mise_en_avant: boolean
  _deleted?: boolean
}

interface PartenaireForm {
  id?: string
  nom: string
  acronyme: string
  type: string
  description: string
  site_web: string
  ordre: number
  _deleted?: boolean
}

interface EvenementForm {
  id?: string
  titre: string
  description: string
  date_evenement: string
  date_fin: string
  type: string
  lieu: string
  pays_code: string
  url: string
  mise_en_avant: boolean
  ordre: number
  _deleted?: boolean
}

interface ChaineForm {
  extrants_titre: string
  extrants_items: string          // textarea : un item par ligne
  effets_immediats_titre: string
  effets_immediats_items: string
  effets_intermediaires_titre: string
  effets_intermediaires_items: string
  impact_titre: string
  impact_items: string
  activites_structurantes: string // JSON brut editable
}

interface EraForm {
  edition_annee: string           // ex: '2025'
  objectif_era: string
  methodologie: string
  questionnaire: string
  population_estimee: string
  echantillon_prevu: string
  nombre_retours: string
  taux_completude: string         // pourcentage
  tableaux_resultats: string      // JSON brut
  analyse_ia: string
  statut_era: 'brouillon' | 'en_revue' | 'publie'
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const PS_OPTIONS = [
  { value: 'PS1', label: 'PS1 — Langue française, cultures et éducation' },
  { value: 'PS2', label: 'PS2 — Démocratie et gouvernance' },
  { value: 'PS3', label: 'PS3 — Développement durable' },
]

const STATUT_OPTIONS = [
  { value: 'brouillon',  label: 'Brouillon',     color: 'bg-gray-100 text-gray-600' },
  { value: 'en_revue',   label: 'En révision',    color: 'bg-amber-100 text-amber-700' },
  { value: 'publie',     label: 'Publié ✓',       color: 'bg-emerald-100 text-emerald-700' },
  { value: 'archive',    label: 'Archivé',         color: 'bg-red-100 text-red-600' },
]

const TYPE_PREUVE_OPTIONS = ['mesure', 'estimation', 'observation', 'institutionnel']

const PARTENAIRE_TYPES = [
  { value: 'bailleur',              label: 'Bailleur de fonds' },
  { value: 'operateur',             label: 'Opérateur' },
  { value: 'partenaire_technique',  label: 'Partenaire technique' },
  { value: 'gouvernemental',        label: 'Gouvernemental' },
  { value: 'societe_civile',        label: 'Société civile' },
  { value: 'autre',                 label: 'Autre' },
]

const EVENEMENT_TYPES = [
  { value: 'conference',    label: 'Conférence' },
  { value: 'formation',     label: 'Formation' },
  { value: 'forum',         label: 'Forum' },
  { value: 'lancement',     label: 'Lancement' },
  { value: 'reunion',       label: 'Réunion' },
  { value: 'remise_prix',   label: 'Remise de prix' },
  { value: 'publication',   label: 'Publication' },
  { value: 'autre',         label: 'Autre' },
]

const EMPTY_RING: CercleRing = {
  valeur: '', label: '', description: '', type_preuve: 'mesure', hypothese: '', detail: ''
}

const RING_LABELS: Record<keyof CerclesImpactForm, string> = {
  coeur:   'Cœur — Action centrale',
  niveau1: 'Niveau 1 — Changement direct',
  niveau2: 'Niveau 2 — Effets secondaires',
  niveau3: 'Niveau 3 — Transformation collective',
  niveau4: 'Niveau 4 — Portée institutionnelle',
}

const RING_COLORS: Record<keyof CerclesImpactForm, string> = {
  coeur:   '#003DA5',
  niveau1: '#1E5FBE',
  niveau2: '#3A7DD4',
  niveau3: '#559BE8',
  niveau4: '#7CB9F5',
}

// ─── Sous-composants utilitaires ─────────────────────────────────────────────

function Field({ label, required, hint, children }: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
        {hint && <span className="font-normal text-gray-400 ml-1.5">({hint})</span>}
      </label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, className = '', ...rest }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  [k: string]: unknown
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 focus:border-[var(--oif-blue)] transition ${className}`}
      {...rest}
    />
  )
}

function TextArea({ value, onChange, rows = 4, placeholder }: {
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 focus:border-[var(--oif-blue)] transition resize-none"
    />
  )
}

function Select({ value, onChange, options, className = '' }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 focus:border-[var(--oif-blue)] transition bg-white ${className}`}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2 mb-4">
      {children}
    </h3>
  )
}

// Badge statut
function StatutBadge({ statut }: { statut: string }) {
  const found = STATUT_OPTIONS.find(s => s.value === statut)
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${found?.color ?? 'bg-gray-100 text-gray-600'}`}>
      {found?.label ?? statut}
    </span>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function EditProjetPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const projetId = params.id

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ─── État de navigation ────────────────────────────────────────────────
  type TabId = 'projet' | 'indicateurs' | 'cercles' | 'temoignages' | 'partenaires' | 'evenements' | 'chaine' | 'era'
  const [activeTab, setActiveTab] = useState<TabId>('projet')

  // ─── États des données ─────────────────────────────────────────────────
  const [projet, setProjet] = useState<ProjetForm>({
    id: '', code_officiel: '', ps_id: '', nom: '', accroche: '', description: '',
    annee_exercice: '2025', budget_modifie: '', budget_engage: '', engagement_global: '',
    taux_execution: '', nombre_pays: '', nombre_projets_deposes: '', nombre_projets_retenus: '',
    thematiques: '', mots_cles: '', date_debut: '', date_fin: '',
    statut: 'brouillon', est_sous_projet: false, projet_parent_id: '',
  })
  const [indicateurs, setIndicateurs] = useState<IndicateurForm[]>([])
  const [cercles, setCercles] = useState<CerclesImpactForm>({
    coeur: { ...EMPTY_RING },
    niveau1: { ...EMPTY_RING },
    niveau2: { ...EMPTY_RING },
    niveau3: { ...EMPTY_RING },
    niveau4: { ...EMPTY_RING },
  })
  const [temoignages, setTemoignages] = useState<TemoignageForm[]>([])
  const [partenaires, setPartenaires] = useState<PartenaireForm[]>([])
  const [evenements, setEvenements] = useState<EvenementForm[]>([])
  const EMPTY_CHAINE: ChaineForm = {
    extrants_titre: '', extrants_items: '',
    effets_immediats_titre: '', effets_immediats_items: '',
    effets_intermediaires_titre: '', effets_intermediaires_items: '',
    impact_titre: '', impact_items: '',
    activites_structurantes: '[]',
  }
  const [chaine, setChaine] = useState<ChaineForm>(EMPTY_CHAINE)

  const EMPTY_ERA: EraForm = {
    edition_annee: '2025', objectif_era: '', methodologie: '', questionnaire: '',
    population_estimee: '', echantillon_prevu: '', nombre_retours: '', taux_completude: '',
    tableaux_resultats: '[]', analyse_ia: '', statut_era: 'brouillon',
  }
  const [era, setEra] = useState<EraForm>(EMPTY_ERA)

  // ─── États UI ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // ─── Chargement initial ────────────────────────────────────────────────
  // Concept : useCallback mémorise la fonction pour éviter des re-rendus
  // inutiles. useEffect déclenche le chargement une seule fois au montage.
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Projet
      const { data: p, error: pErr } = await supabase
        .from('projets')
        .select('*')
        .eq('id', projetId)
        .single()

      if (pErr) throw new Error(pErr.message)
      if (!p) throw new Error('Projet introuvable')

      setProjet({
        id: p.id ?? '',
        code_officiel: p.code_officiel ?? '',
        ps_id: p.ps_id ?? '',
        nom: p.nom ?? '',
        accroche: p.accroche ?? '',
        description: p.description ?? '',
        annee_exercice: p.annee_exercice?.toString() ?? '2025',
        budget_modifie: p.budget_modifie?.toString() ?? '',
        budget_engage: p.budget_engage?.toString() ?? '',
        engagement_global: p.engagement_global?.toString() ?? '',
        taux_execution: p.taux_execution?.toString() ?? '',
        nombre_pays: p.nombre_pays?.toString() ?? '',
        nombre_projets_deposes: p.nombre_projets_deposes?.toString() ?? '',
        nombre_projets_retenus: p.nombre_projets_retenus?.toString() ?? '',
        thematiques: (p.thematiques ?? []).join(', '),
        mots_cles: (p.mots_cles ?? []).join(', '),
        date_debut: p.date_debut ?? '',
        date_fin: p.date_fin ?? '',
        statut: p.statut ?? 'brouillon',
        est_sous_projet: p.est_sous_projet ?? false,
        projet_parent_id: p.projet_parent_id ?? '',
      })

      // Cercles d'impact (JSONB)
      if (p.cercles_impact) {
        const ci = p.cercles_impact as Record<string, Partial<CercleRing>>
        const parseRing = (r?: Partial<CercleRing>): CercleRing => ({
          valeur: r?.valeur ?? '',
          label: r?.label ?? '',
          description: r?.description ?? '',
          type_preuve: r?.type_preuve ?? 'mesure',
          hypothese: r?.hypothese ?? '',
          detail: r?.detail ?? '',
        })
        setCercles({
          coeur:   parseRing(ci.coeur),
          niveau1: parseRing(ci.niveau1),
          niveau2: parseRing(ci.niveau2),
          niveau3: parseRing(ci.niveau3),
          niveau4: parseRing(ci.niveau4),
        })
      }

      // Indicateurs
      const { data: inds } = await supabase
        .from('indicateurs')
        .select('*')
        .eq('projet_id', projetId)
        .order('ordre')

      setIndicateurs((inds ?? []).map(i => ({
        id: i.id,
        libelle: i.libelle ?? '',
        valeur_numerique: i.valeur_numerique?.toString() ?? '',
        valeur_pourcentage: i.valeur_pourcentage?.toString() ?? '',
        valeur_texte: i.valeur_texte ?? '',
        unite: i.unite ?? '',
        categorie: i.categorie ?? '',
        type_preuve: i.type_preuve ?? 'mesure',
        source: i.source ?? '',
        source_url: i.source_url ?? '',
        hypothese_calcul: i.hypothese_calcul ?? '',
        mise_en_avant: i.mise_en_avant ?? false,
        ordre: i.ordre ?? 0,
      })))

      // Témoignages
      const { data: tems } = await supabase
        .from('temoignages')
        .select('*')
        .eq('projet_id', projetId)
        .order('created_at')

      setTemoignages((tems ?? []).map(t => ({
        id: t.id,
        citation: t.citation ?? '',
        auteur: t.auteur ?? '',
        fonction: t.fonction ?? '',
        pays: t.pays ?? '',
        photo_url: t.photo_url ?? '',
        source: t.source ?? '',
        source_url: t.source_url ?? '',
        type_media: t.type_media ?? 'rapport',
        mise_en_avant: t.mise_en_avant ?? false,
      })))

      // Partenaires (peut ne pas exister si migration non appliquée)
      try {
        const { data: parts } = await supabase
          .from('partenariats')
          .select('*')
          .eq('projet_id', projetId)
          .order('ordre')

        setPartenaires((parts ?? []).map(p => ({
          id: p.id,
          nom: p.nom ?? '',
          acronyme: p.acronyme ?? '',
          type: p.type ?? '',
          description: p.description ?? '',
          site_web: p.site_web ?? '',
          ordre: p.ordre ?? 0,
        })))
      } catch { /* table pas encore créée */ }

      // Événements
      try {
        const { data: evts } = await supabase
          .from('evenements')
          .select('*')
          .eq('projet_id', projetId)
          .order('date_evenement', { ascending: false })

        setEvenements((evts ?? []).map(e => ({
          id: e.id,
          titre: e.titre ?? '',
          description: e.description ?? '',
          date_evenement: e.date_evenement ?? '',
          date_fin: e.date_fin ?? '',
          type: e.type ?? '',
          lieu: e.lieu ?? '',
          pays_code: e.pays_code ?? '',
          url: e.url ?? '',
          mise_en_avant: e.mise_en_avant ?? false,
          ordre: e.ordre ?? 0,
        })))
      } catch { /* table pas encore créée */ }

      // Chaîne des résultats
      try {
        const { data: cr } = await supabase
          .from('chaine_resultats')
          .select('*')
          .eq('projet_id', projetId)
          .maybeSingle()

        if (cr) {
          setChaine({
            extrants_titre:               cr.extrants_titre ?? '',
            extrants_items:               (cr.extrants_items ?? []).join('\n'),
            effets_immediats_titre:       cr.effets_immediats_titre ?? '',
            effets_immediats_items:       (cr.effets_immediats_items ?? []).join('\n'),
            effets_intermediaires_titre:  cr.effets_intermediaires_titre ?? '',
            effets_intermediaires_items:  (cr.effets_intermediaires_items ?? []).join('\n'),
            impact_titre:                 cr.impact_titre ?? '',
            impact_items:                 (cr.impact_items ?? []).join('\n'),
            activites_structurantes:      JSON.stringify(cr.activites_structurantes ?? [], null, 2),
          })
        }
      } catch { /* table pas encore créée */ }

      // ERA résultats
      try {
        const { data: eraRow } = await supabase
          .from('era_resultats')
          .select('*')
          .eq('projet_id', projetId)
          .order('edition_annee', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (eraRow) {
          setEra({
            edition_annee:     String(eraRow.edition_annee ?? 2025),
            objectif_era:      eraRow.objectif_era ?? '',
            methodologie:      eraRow.methodologie ?? '',
            questionnaire:     eraRow.questionnaire ?? '',
            population_estimee: String(eraRow.population_estimee ?? ''),
            echantillon_prevu:  String(eraRow.echantillon_prevu ?? ''),
            nombre_retours:     String(eraRow.nombre_retours ?? ''),
            taux_completude:    String(eraRow.taux_completude ?? ''),
            tableaux_resultats: JSON.stringify(eraRow.tableaux_resultats ?? [], null, 2),
            analyse_ia:         eraRow.analyse_ia ?? '',
            statut_era:         (eraRow.statut ?? 'brouillon') as EraForm['statut_era'],
          })
        }
      } catch { /* table pas encore créée — migration à appliquer */ }

    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [projetId, supabase])

  useEffect(() => { loadData() }, [loadData])

  // ─── Sauvegarde globale ────────────────────────────────────────────────
  // Concept : on upsert (insert ou update) chaque entité selon si elle a un id.
  // Les entités marquées _deleted sont supprimées.
  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // 1. Mettre à jour le projet
      const { error: pErr } = await supabase.from('projets').update({
        code_officiel: projet.code_officiel.trim().toUpperCase(),
        ps_id: projet.ps_id || null,
        nom: projet.nom.trim(),
        accroche: projet.accroche || null,
        description: projet.description || null,
        annee_exercice: projet.annee_exercice ? parseInt(projet.annee_exercice) : 2025,
        budget_modifie: projet.budget_modifie ? parseFloat(projet.budget_modifie) : null,
        budget_engage: projet.budget_engage ? parseFloat(projet.budget_engage) : null,
        engagement_global: projet.engagement_global ? parseFloat(projet.engagement_global) : null,
        taux_execution: projet.taux_execution ? parseFloat(projet.taux_execution) : null,
        nombre_pays: projet.nombre_pays ? parseInt(projet.nombre_pays) : null,
        nombre_projets_deposes: projet.nombre_projets_deposes ? parseInt(projet.nombre_projets_deposes) : null,
        nombre_projets_retenus: projet.nombre_projets_retenus ? parseInt(projet.nombre_projets_retenus) : null,
        thematiques: projet.thematiques ? projet.thematiques.split(',').map(s => s.trim()).filter(Boolean) : null,
        mots_cles: projet.mots_cles ? projet.mots_cles.split(',').map(s => s.trim()).filter(Boolean) : null,
        date_debut: projet.date_debut || null,
        date_fin: projet.date_fin || null,
        statut: projet.statut,
        est_sous_projet: projet.est_sous_projet,
        projet_parent_id: projet.projet_parent_id || null,
        cercles_impact: buildCerclesJson(cercles),
        updated_at: new Date().toISOString(),
      }).eq('id', projetId)

      if (pErr) throw new Error(`Projet : ${pErr.message}`)

      // 2. Indicateurs — upsert ou suppression
      for (const ind of indicateurs) {
        if (ind._deleted && ind.id) {
          await supabase.from('indicateurs').delete().eq('id', ind.id)
        } else if (!ind._deleted && ind.libelle.trim()) {
          if (ind.id) {
            await supabase.from('indicateurs').update({
              libelle: ind.libelle.trim(),
              valeur_numerique: ind.valeur_numerique ? parseFloat(ind.valeur_numerique) : null,
              valeur_pourcentage: ind.valeur_pourcentage ? parseFloat(ind.valeur_pourcentage) : null,
              valeur_texte: ind.valeur_texte || null,
              unite: ind.unite || null,
              categorie: ind.categorie || null,
              type_preuve: ind.type_preuve || null,
              source: ind.source || null,
              source_url: ind.source_url || null,
              hypothese_calcul: ind.hypothese_calcul || null,
              mise_en_avant: ind.mise_en_avant,
              ordre: ind.ordre,
            }).eq('id', ind.id)
          } else {
            await supabase.from('indicateurs').insert({
              projet_id: projetId,
              libelle: ind.libelle.trim(),
              valeur_numerique: ind.valeur_numerique ? parseFloat(ind.valeur_numerique) : null,
              valeur_pourcentage: ind.valeur_pourcentage ? parseFloat(ind.valeur_pourcentage) : null,
              valeur_texte: ind.valeur_texte || null,
              unite: ind.unite || null,
              categorie: ind.categorie || null,
              type_preuve: ind.type_preuve || null,
              source: ind.source || null,
              source_url: ind.source_url || null,
              hypothese_calcul: ind.hypothese_calcul || null,
              mise_en_avant: ind.mise_en_avant,
              ordre: ind.ordre,
            })
          }
        }
      }

      // 3. Témoignages
      for (const tem of temoignages) {
        if (tem._deleted && tem.id) {
          await supabase.from('temoignages').delete().eq('id', tem.id)
        } else if (!tem._deleted && tem.citation.trim()) {
          const temData = {
            citation: tem.citation.trim(),
            auteur: tem.auteur || null,
            fonction: tem.fonction || null,
            pays: tem.pays || null,
            photo_url: tem.photo_url || null,
            source: tem.source || null,
            source_url: tem.source_url || null,
            type_media: tem.type_media || null,
            mise_en_avant: tem.mise_en_avant,
          }
          if (tem.id) {
            await supabase.from('temoignages').update(temData).eq('id', tem.id)
          } else {
            await supabase.from('temoignages').insert({ ...temData, projet_id: projetId })
          }
        }
      }

      // 4. Partenaires
      for (const part of partenaires) {
        if (part._deleted && part.id) {
          await supabase.from('partenariats').delete().eq('id', part.id)
        } else if (!part._deleted && part.nom.trim()) {
          const partData = {
            nom: part.nom.trim(),
            acronyme: part.acronyme || null,
            type: part.type || null,
            description: part.description || null,
            site_web: part.site_web || null,
            ordre: part.ordre,
          }
          if (part.id) {
            await supabase.from('partenariats').update(partData).eq('id', part.id)
          } else {
            await supabase.from('partenariats').insert({ ...partData, projet_id: projetId })
          }
        }
      }

      // 5. Événements
      for (const evt of evenements) {
        if (evt._deleted && evt.id) {
          await supabase.from('evenements').delete().eq('id', evt.id)
        } else if (!evt._deleted && evt.titre.trim()) {
          const evtData = {
            titre: evt.titre.trim(),
            description: evt.description || null,
            date_evenement: evt.date_evenement || null,
            date_fin: evt.date_fin || null,
            type: evt.type || null,
            lieu: evt.lieu || null,
            pays_code: evt.pays_code || null,
            url: evt.url || null,
            mise_en_avant: evt.mise_en_avant,
            ordre: evt.ordre,
          }
          if (evt.id) {
            await supabase.from('evenements').update(evtData).eq('id', evt.id)
          } else {
            await supabase.from('evenements').insert({ ...evtData, projet_id: projetId })
          }
        }
      }

      // ─── Sauvegarde chaîne des résultats ──────────────────────────────
      const chainePayload = {
        projet_id:                    projetId,
        extrants_titre:               chaine.extrants_titre,
        extrants_items:               chaine.extrants_items.split('\n').map(s => s.trim()).filter(Boolean),
        effets_immediats_titre:       chaine.effets_immediats_titre,
        effets_immediats_items:       chaine.effets_immediats_items.split('\n').map(s => s.trim()).filter(Boolean),
        effets_intermediaires_titre:  chaine.effets_intermediaires_titre,
        effets_intermediaires_items:  chaine.effets_intermediaires_items.split('\n').map(s => s.trim()).filter(Boolean),
        impact_titre:                 chaine.impact_titre,
        impact_items:                 chaine.impact_items.split('\n').map(s => s.trim()).filter(Boolean),
        activites_structurantes:      (() => { try { return JSON.parse(chaine.activites_structurantes) } catch { return [] } })(),
      }
      await supabase.from('chaine_resultats').upsert(chainePayload, { onConflict: 'projet_id' })

      // ERA résultats
      try {
        const eraPayload = {
          projet_id:          projetId,
          edition_annee:      parseInt(era.edition_annee) || 2025,
          objectif_era:       era.objectif_era,
          methodologie:       era.methodologie,
          questionnaire:      era.questionnaire,
          population_estimee: era.population_estimee ? parseInt(era.population_estimee) : null,
          echantillon_prevu:  era.echantillon_prevu  ? parseInt(era.echantillon_prevu)  : null,
          nombre_retours:     era.nombre_retours     ? parseInt(era.nombre_retours)     : null,
          taux_completude:    era.taux_completude    ? parseFloat(era.taux_completude)  : null,
          tableaux_resultats: (() => { try { return JSON.parse(era.tableaux_resultats) } catch { return [] } })(),
          analyse_ia:         era.analyse_ia,
          statut:             era.statut_era,
        }
        await supabase.from('era_resultats').upsert(eraPayload, { onConflict: 'projet_id,edition_annee' })
      } catch { /* table pas encore migrée */ }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

      // Supprimer les items marqués supprimés du state local
      setIndicateurs(prev => prev.filter(i => !i._deleted))
      setTemoignages(prev => prev.filter(t => !t._deleted))
      setPartenaires(prev => prev.filter(p => !p._deleted))
      setEvenements(prev => prev.filter(e => !e._deleted))

    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  // Convertit le form cercles en JSONB Supabase
  function buildCerclesJson(c: CerclesImpactForm): Record<string, CercleRing> | null {
    const isEmpty = (r: CercleRing) => !r.valeur && !r.label && !r.description
    if (['coeur', 'niveau1', 'niveau2', 'niveau3', 'niveau4'].every(k =>
      isEmpty(c[k as keyof CerclesImpactForm])
    )) return null
    return { ...c }
  }

  // ─── Helpers ajout / mise à jour ─────────────────────────────────────

  const addIndicateur = () => setIndicateurs(prev => [...prev, {
    libelle: '', valeur_numerique: '', valeur_pourcentage: '', valeur_texte: '',
    unite: '', categorie: '', type_preuve: 'mesure', source: '', source_url: '',
    hypothese_calcul: '', mise_en_avant: false, ordre: prev.length + 1,
  }])

  const upd = <T extends object>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    field: keyof T,
    value: T[keyof T]
  ) => setter(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))

  const markDeleted = <T extends { _deleted?: boolean }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number
  ) => setter(prev => prev.map((item, i) => i === index ? { ...item, _deleted: true } : item))

  const addTemoignage = () => setTemoignages(prev => [...prev, {
    citation: '', auteur: '', fonction: '', pays: '', photo_url: '',
    source: '', source_url: '', type_media: 'rapport', mise_en_avant: false,
  }])

  const addPartenaire = () => setPartenaires(prev => [...prev, {
    nom: '', acronyme: '', type: '', description: '', site_web: '',
    ordre: prev.length + 1,
  }])

  const addEvenement = () => setEvenements(prev => [...prev, {
    titre: '', description: '', date_evenement: '', date_fin: '',
    type: '', lieu: '', pays_code: '', url: '',
    mise_en_avant: false, ordre: prev.length + 1,
  }])

  // ─── Comptes par onglet ────────────────────────────────────────────────
  const indCount  = indicateurs.filter(i => !i._deleted).length
  const temCount  = temoignages.filter(t => !t._deleted).length
  const partCount = partenaires.filter(p => !p._deleted).length
  const evtCount  = evenements.filter(e => !e._deleted).length

  // ─── Onglets ──────────────────────────────────────────────────────────
  const TABS: { key: TabId; label: string; count?: number }[] = [
    { key: 'projet',      label: 'Projet' },
    { key: 'indicateurs', label: 'Indicateurs',     count: indCount },
    { key: 'cercles',     label: 'Niveaux',          count: undefined },
    { key: 'chaine',      label: 'Chaîne ERA',       count: undefined },
    { key: 'era',         label: 'Résultat enquête', count: undefined },
    { key: 'temoignages', label: 'Témoignages',      count: temCount },
    { key: 'partenaires', label: 'Partenaires',      count: partCount },
    { key: 'evenements',  label: 'Événements',       count: evtCount },
  ]

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--oif-blue)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chargement du projet…</p>
        </div>
      </div>
    )
  }

  // ─── Rendu principal ──────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* ── En-tête ── */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <a href="/admin/projets" className="hover:text-[var(--oif-blue)] transition">Projets</a>
            <span>/</span>
            <a href={`/admin/projets/${projetId}`} className="hover:text-[var(--oif-blue)] transition">
              {projetId}
            </a>
            <span>/</span>
            <span className="text-gray-600">Modifier</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--oif-blue-dark)]">
              {projet.nom || 'Projet sans titre'}
            </h1>
            <StatutBadge statut={projet.statut} />
          </div>
          <p className="text-sm text-gray-400 mt-1">{projetId}</p>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href={`/projets/${projetId}`}
            target="_blank"
            className="text-sm text-gray-500 hover:text-[var(--oif-blue)] border border-gray-200 rounded-lg px-3 py-2 transition"
          >
            ↗ Voir public
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-[var(--oif-blue)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--oif-blue-dark)] transition disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? <><span className="animate-spin">⟳</span> Enregistrement…</> : '✓ Enregistrer'}
          </button>
        </div>
      </div>

      {/* Retour */}
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          ✗ {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
          ✓ Projet enregistré avec succès.
        </div>
      )}

      {/* ── Barre d'onglets ── */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-full overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-[var(--oif-blue-dark)] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-[var(--oif-blue)]/10 text-[var(--oif-blue)] text-xs rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════
          ONGLET 1 — PROJET
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'projet' && (
        <div className="space-y-8">

          {/* Identité */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <SectionTitle>Identité du projet</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Identifiant système" hint="lecture seule">
                <TextInput value={projet.id} onChange={() => {}} className="bg-gray-50 cursor-not-allowed" />
              </Field>
              <Field label="Code officiel" required hint="ex: PROJ_A14">
                <TextInput
                  value={projet.code_officiel}
                  onChange={v => setProjet(p => ({ ...p, code_officiel: v }))}
                  placeholder="ex: PROJ_A14"
                />
              </Field>
              <Field label="Programme stratégique" required>
                <Select
                  value={projet.ps_id}
                  onChange={v => setProjet(p => ({ ...p, ps_id: v }))}
                  options={[{ value: '', label: '— Sélectionner —' }, ...PS_OPTIONS]}
                />
              </Field>
              <Field label="Statut de publication" required>
                <Select
                  value={projet.statut}
                  onChange={v => setProjet(p => ({ ...p, statut: v as ProjetForm['statut'] }))}
                  options={STATUT_OPTIONS}
                />
              </Field>
              <Field label="Année d'exercice">
                <TextInput
                  value={projet.annee_exercice}
                  onChange={v => setProjet(p => ({ ...p, annee_exercice: v }))}
                  placeholder="2025"
                />
              </Field>
              <Field label="Projet parent" hint="si sous-projet">
                <TextInput
                  value={projet.projet_parent_id}
                  onChange={v => setProjet(p => ({ ...p, projet_parent_id: v }))}
                  placeholder="ex: PROJ_A16"
                />
              </Field>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="est_sous_projet"
                checked={projet.est_sous_projet}
                onChange={e => setProjet(p => ({ ...p, est_sous_projet: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="est_sous_projet" className="text-sm text-gray-600">
                Ce projet est un sous-projet (composante d'un projet parent)
              </label>
            </div>
          </div>

          {/* Contenu éditorial */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <SectionTitle>Contenu éditorial</SectionTitle>
            <div className="space-y-4">
              <Field label="Nom du projet" required>
                <TextInput
                  value={projet.nom}
                  onChange={v => setProjet(p => ({ ...p, nom: v }))}
                  placeholder="Titre officiel complet"
                />
              </Field>
              <Field label="Accroche" hint="1–2 phrases percutantes pour le hero">
                <TextArea
                  value={projet.accroche}
                  onChange={v => setProjet(p => ({ ...p, accroche: v }))}
                  rows={3}
                  placeholder="Phrase-choc qui résume l'impact du projet…"
                />
              </Field>
              <Field label="Description longue">
                <TextArea
                  value={projet.description}
                  onChange={v => setProjet(p => ({ ...p, description: v }))}
                  rows={6}
                  placeholder="Contexte, objectifs, méthodes, résultats…"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Thématiques" hint="séparées par des virgules">
                  <TextInput
                    value={projet.thematiques}
                    onChange={v => setProjet(p => ({ ...p, thematiques: v }))}
                    placeholder="Éducation, Formation, Genre…"
                  />
                </Field>
                <Field label="Mots-clés" hint="séparés par des virgules">
                  <TextInput
                    value={projet.mots_cles}
                    onChange={v => setProjet(p => ({ ...p, mots_cles: v }))}
                    placeholder="numérique, francophonie, ODD…"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date de début">
                  <input
                    type="date"
                    value={projet.date_debut}
                    onChange={e => setProjet(p => ({ ...p, date_debut: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 focus:border-[var(--oif-blue)] transition"
                  />
                </Field>
                <Field label="Date de fin">
                  <input
                    type="date"
                    value={projet.date_fin}
                    onChange={e => setProjet(p => ({ ...p, date_fin: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 focus:border-[var(--oif-blue)] transition"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Données chiffrées */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <SectionTitle>Données financières et de portée</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Budget modifié (€)">
                <TextInput
                  value={projet.budget_modifie}
                  onChange={v => setProjet(p => ({ ...p, budget_modifie: v }))}
                  placeholder="ex: 1200000"
                />
              </Field>
              <Field label="Budget engagé (€)">
                <TextInput
                  value={projet.budget_engage}
                  onChange={v => setProjet(p => ({ ...p, budget_engage: v }))}
                  placeholder="ex: 980000"
                />
              </Field>
              <Field label="Engagement global (€)" hint="cumulé sur la durée">
                <TextInput
                  value={projet.engagement_global}
                  onChange={v => setProjet(p => ({ ...p, engagement_global: v }))}
                  placeholder="ex: 3500000"
                />
              </Field>
              <Field label="Taux d'exécution (%)" hint="0–100">
                <TextInput
                  value={projet.taux_execution}
                  onChange={v => setProjet(p => ({ ...p, taux_execution: v }))}
                  placeholder="ex: 81.5"
                />
              </Field>
              <Field label="Nombre de pays couverts">
                <TextInput
                  value={projet.nombre_pays}
                  onChange={v => setProjet(p => ({ ...p, nombre_pays: v }))}
                  placeholder="ex: 12"
                />
              </Field>
              <Field label="Projets déposés">
                <TextInput
                  value={projet.nombre_projets_deposes}
                  onChange={v => setProjet(p => ({ ...p, nombre_projets_deposes: v }))}
                  placeholder="ex: 48"
                />
              </Field>
              <Field label="Projets retenus (2025)">
                <TextInput
                  value={projet.nombre_projets_retenus}
                  onChange={v => setProjet(p => ({ ...p, nombre_projets_retenus: v }))}
                  placeholder="ex: 24"
                />
              </Field>
            </div>
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ONGLET 2 — INDICATEURS
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'indicateurs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">
              Les indicateurs alimentent le tableau des changements observés dans la fiche publique.
            </p>
            <button
              onClick={addIndicateur}
              className="px-3 py-1.5 bg-[var(--oif-blue)] text-white text-sm rounded-lg hover:bg-[var(--oif-blue-dark)] transition flex items-center gap-1.5"
            >
              + Ajouter
            </button>
          </div>

          {indicateurs.filter(i => !i._deleted).length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              Aucun indicateur. Cliquez sur « + Ajouter » pour en créer un.
            </div>
          )}

          {indicateurs.map((ind, idx) => {
            if (ind._deleted) return null
            return (
              <div key={ind.id ?? idx} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Indicateur #{idx + 1}
                  </span>
                  <button
                    onClick={() => markDeleted(setIndicateurs, idx)}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                  >
                    ✕ Supprimer
                  </button>
                </div>
                <div className="space-y-3">
                  <Field label="Libellé" required>
                    <TextInput
                      value={ind.libelle}
                      onChange={v => upd(setIndicateurs, idx, 'libelle', v)}
                      placeholder="Ex : Nombre de bénéficiaires directs formés"
                    />
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Valeur numérique">
                      <TextInput
                        value={ind.valeur_numerique}
                        onChange={v => upd(setIndicateurs, idx, 'valeur_numerique', v)}
                        placeholder="ex: 1250"
                      />
                    </Field>
                    <Field label="Valeur %" hint="0–100">
                      <TextInput
                        value={ind.valeur_pourcentage}
                        onChange={v => upd(setIndicateurs, idx, 'valeur_pourcentage', v)}
                        placeholder="ex: 68"
                      />
                    </Field>
                    <Field label="Unité">
                      <TextInput
                        value={ind.unite}
                        onChange={v => upd(setIndicateurs, idx, 'unite', v)}
                        placeholder="ex: personnes"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Catégorie">
                      <TextInput
                        value={ind.categorie}
                        onChange={v => upd(setIndicateurs, idx, 'categorie', v)}
                        placeholder="ex: Bénéficiaires"
                      />
                    </Field>
                    <Field label="Type de preuve">
                      <Select
                        value={ind.type_preuve}
                        onChange={v => upd(setIndicateurs, idx, 'type_preuve', v)}
                        options={TYPE_PREUVE_OPTIONS.map(t => ({ value: t, label: t }))}
                      />
                    </Field>
                  </div>
                  <Field label="Valeur textuelle" hint="si non numérique">
                    <TextInput
                      value={ind.valeur_texte}
                      onChange={v => upd(setIndicateurs, idx, 'valeur_texte', v)}
                      placeholder="ex: En cours"
                    />
                  </Field>
                  <Field label="Hypothèse de calcul" hint="explication méthodologique">
                    <TextInput
                      value={ind.hypothese_calcul}
                      onChange={v => upd(setIndicateurs, idx, 'hypothese_calcul', v)}
                      placeholder="ex: Extrapolation à partir de l'échantillon enquêté (n=400)"
                    />
                  </Field>
                  <Field label="Source">
                    <TextInput
                      value={ind.source}
                      onChange={v => upd(setIndicateurs, idx, 'source', v)}
                      placeholder="ex: Enquête bénéficiaires CREXE 2025"
                    />
                  </Field>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={ind.mise_en_avant}
                        onChange={e => upd(setIndicateurs, idx, 'mise_en_avant', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-gray-600">Mettre en avant (affiché dans le hero)</span>
                    </label>
                    <span className="text-xs text-gray-400">Ordre : {ind.ordre}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ONGLET 3 — CERCLES (NIVEAUX DE CHANGEMENT)
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'cercles' && (
        <div className="space-y-5">
          <p className="text-sm text-gray-500 mb-4">
            Chaque niveau correspond à un anneau du graphique concentrique visible sur la fiche projet.
            Plus le niveau est élevé, plus la portée est large et indirecte.
          </p>

          {(Object.keys(RING_LABELS) as Array<keyof CerclesImpactForm>).map(ringKey => {
            const ring = cercles[ringKey]
            const color = RING_COLORS[ringKey]
            return (
              <div key={ringKey} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100"
                  style={{ borderLeftColor: color, borderLeftWidth: 4 }}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <h3 className="text-sm font-semibold text-[var(--oif-blue-dark)]">
                    {RING_LABELS[ringKey]}
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Valeur clé" hint="chiffre ou texte court">
                      <TextInput
                        value={ring.valeur}
                        onChange={v => setCercles(c => ({ ...c, [ringKey]: { ...c[ringKey], valeur: v } }))}
                        placeholder="ex: 12 500"
                      />
                    </Field>
                    <Field label="Label" hint="nom court">
                      <TextInput
                        value={ring.label}
                        onChange={v => setCercles(c => ({ ...c, [ringKey]: { ...c[ringKey], label: v } }))}
                        placeholder="ex: Bénéficiaires formés"
                      />
                    </Field>
                    <Field label="Type de preuve">
                      <Select
                        value={ring.type_preuve}
                        onChange={v => setCercles(c => ({ ...c, [ringKey]: { ...c[ringKey], type_preuve: v } }))}
                        options={TYPE_PREUVE_OPTIONS.map(t => ({ value: t, label: t }))}
                      />
                    </Field>
                  </div>
                  <Field label="Description" hint="1–2 phrases sur ce niveau">
                    <TextArea
                      value={ring.description}
                      onChange={v => setCercles(c => ({ ...c, [ringKey]: { ...c[ringKey], description: v } }))}
                      rows={2}
                      placeholder="Décrit ce qui a été observé à ce niveau de changement…"
                    />
                  </Field>
                  <Field label="Hypothèse / Source">
                    <TextInput
                      value={ring.hypothese}
                      onChange={v => setCercles(c => ({ ...c, [ringKey]: { ...c[ringKey], hypothese: v } }))}
                      placeholder="ex: Données issues de l'enquête de satisfaction (n=350, 2024)"
                    />
                  </Field>
                  <Field label="Détail supplémentaire" hint="texte long, affiché dans le panneau au clic">
                    <TextArea
                      value={ring.detail}
                      onChange={v => setCercles(c => ({ ...c, [ringKey]: { ...c[ringKey], detail: v } }))}
                      rows={3}
                      placeholder="Contexte approfondi, exemples concrets, méthodologie…"
                    />
                  </Field>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ONGLET 4 — TÉMOIGNAGES
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'temoignages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">
              Ajoutez une photo portrait (<code className="text-xs bg-gray-100 px-1 py-0.5 rounded">/images/temoignages/nom.jpg</code>)
              ou une URL externe pour chaque témoignage.
            </p>
            <button onClick={addTemoignage}
              className="px-3 py-1.5 bg-[var(--oif-blue)] text-white text-sm rounded-lg hover:bg-[var(--oif-blue-dark)] transition flex items-center gap-1.5">
              + Ajouter
            </button>
          </div>

          {temoignages.filter(t => !t._deleted).length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              Aucun témoignage. Cliquez sur « + Ajouter » pour en créer un.
            </div>
          )}

          {temoignages.map((tem, idx) => {
            if (tem._deleted) return null
            return (
              <div key={tem.id ?? idx} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    {tem.photo_url && (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--oif-blue)]/20 flex-shrink-0 bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={tem.photo_url} alt={tem.auteur} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Témoignage #{idx + 1} {tem.auteur && `— ${tem.auteur}`}
                    </span>
                  </div>
                  <button onClick={() => markDeleted(setTemoignages, idx)}
                    className="text-xs text-red-400 hover:text-red-600 transition">
                    ✕ Supprimer
                  </button>
                </div>

                <div className="space-y-3">
                  <Field label="Citation" required>
                    <TextArea
                      value={tem.citation}
                      onChange={v => upd(setTemoignages, idx, 'citation', v)}
                      rows={4}
                      placeholder="Citation complète entre guillemets…"
                    />
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Auteur">
                      <TextInput
                        value={tem.auteur}
                        onChange={v => upd(setTemoignages, idx, 'auteur', v)}
                        placeholder="Prénom Nom"
                      />
                    </Field>
                    <Field label="Fonction / Titre">
                      <TextInput
                        value={tem.fonction}
                        onChange={v => upd(setTemoignages, idx, 'fonction', v)}
                        placeholder="ex: Directrice adjointe, ITI"
                      />
                    </Field>
                    <Field label="Pays">
                      <TextInput
                        value={tem.pays}
                        onChange={v => upd(setTemoignages, idx, 'pays', v)}
                        placeholder="ex: Mauritanie"
                      />
                    </Field>
                  </div>
                  <Field label="URL de la photo portrait" hint="chemin /images/temoignages/... ou URL externe">
                    <TextInput
                      value={tem.photo_url}
                      onChange={v => upd(setTemoignages, idx, 'photo_url', v)}
                      placeholder="/images/temoignages/a15_temoignage_valerie_1.jpg"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Source">
                      <TextInput
                        value={tem.source}
                        onChange={v => upd(setTemoignages, idx, 'source', v)}
                        placeholder="ex: CREXE 2025 — rapport d'exécution"
                      />
                    </Field>
                    <Field label="Type de média">
                      <Select
                        value={tem.type_media}
                        onChange={v => upd(setTemoignages, idx, 'type_media', v)}
                        options={[
                          { value: 'rapport', label: 'Rapport' },
                          { value: 'video', label: 'Vidéo' },
                          { value: 'article', label: 'Article' },
                          { value: 'interview', label: 'Interview' },
                          { value: 'autre', label: 'Autre' },
                        ]}
                      />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={tem.mise_en_avant}
                      onChange={e => upd(setTemoignages, idx, 'mise_en_avant', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-600">Mettre en avant (témoignage principal)</span>
                  </label>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ONGLET 5 — PARTENAIRES
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'partenaires' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">
              Bailleurs, opérateurs, partenaires techniques et gouvernementaux impliqués dans le projet.
            </p>
            <button onClick={addPartenaire}
              className="px-3 py-1.5 bg-[var(--oif-blue)] text-white text-sm rounded-lg hover:bg-[var(--oif-blue-dark)] transition flex items-center gap-1.5">
              + Ajouter
            </button>
          </div>

          {partenaires.filter(p => !p._deleted).length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              Aucun partenaire. Cliquez sur « + Ajouter » pour en créer un.
            </div>
          )}

          {partenaires.map((part, idx) => {
            if (part._deleted) return null
            return (
              <div key={part.id ?? idx} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Partenaire #{idx + 1} {part.nom && `— ${part.nom}`}
                  </span>
                  <button onClick={() => markDeleted(setPartenaires, idx)}
                    className="text-xs text-red-400 hover:text-red-600 transition">
                    ✕ Supprimer
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Field label="Nom de l'organisation" required>
                        <TextInput
                          value={part.nom}
                          onChange={v => upd(setPartenaires, idx, 'nom', v)}
                          placeholder="ex: Agence Universitaire de la Francophonie"
                        />
                      </Field>
                    </div>
                    <Field label="Acronyme">
                      <TextInput
                        value={part.acronyme}
                        onChange={v => upd(setPartenaires, idx, 'acronyme', v)}
                        placeholder="ex: AUF"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Type de partenaire">
                      <Select
                        value={part.type}
                        onChange={v => upd(setPartenaires, idx, 'type', v)}
                        options={[{ value: '', label: '— Sélectionner —' }, ...PARTENAIRE_TYPES]}
                      />
                    </Field>
                    <Field label="Site web">
                      <TextInput
                        value={part.site_web}
                        onChange={v => upd(setPartenaires, idx, 'site_web', v)}
                        placeholder="https://..."
                      />
                    </Field>
                  </div>
                  <Field label="Description du rôle">
                    <TextArea
                      value={part.description}
                      onChange={v => upd(setPartenaires, idx, 'description', v)}
                      rows={2}
                      placeholder="Rôle spécifique dans le projet, contribution financière ou technique…"
                    />
                  </Field>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ONGLET 6 — ÉVÉNEMENTS
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'evenements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">
              Événements marquants dans la vie du projet — conférences, formations, forums, remises de prix…
            </p>
            <button onClick={addEvenement}
              className="px-3 py-1.5 bg-[var(--oif-blue)] text-white text-sm rounded-lg hover:bg-[var(--oif-blue-dark)] transition flex items-center gap-1.5">
              + Ajouter
            </button>
          </div>

          {evenements.filter(e => !e._deleted).length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              Aucun événement. Cliquez sur « + Ajouter » pour en créer un.
            </div>
          )}

          {evenements.map((evt, idx) => {
            if (evt._deleted) return null
            return (
              <div key={evt.id ?? idx} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Événement #{idx + 1} {evt.titre && `— ${evt.titre}`}
                  </span>
                  <button onClick={() => markDeleted(setEvenements, idx)}
                    className="text-xs text-red-400 hover:text-red-600 transition">
                    ✕ Supprimer
                  </button>
                </div>
                <div className="space-y-3">
                  <Field label="Titre" required>
                    <TextInput
                      value={evt.titre}
                      onChange={v => upd(setEvenements, idx, 'titre', v)}
                      placeholder="ex: Forum Mondial de la Langue Française — Montréal 2024"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Type d'événement">
                      <Select
                        value={evt.type}
                        onChange={v => upd(setEvenements, idx, 'type', v)}
                        options={[{ value: '', label: '— Sélectionner —' }, ...EVENEMENT_TYPES]}
                      />
                    </Field>
                    <Field label="Date de début">
                      <input
                        type="date"
                        value={evt.date_evenement}
                        onChange={e => upd(setEvenements, idx, 'date_evenement', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 focus:border-[var(--oif-blue)] transition"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Lieu">
                      <TextInput
                        value={evt.lieu}
                        onChange={v => upd(setEvenements, idx, 'lieu', v)}
                        placeholder="ex: Montréal, Canada"
                      />
                    </Field>
                    <Field label="Pays" hint="code ISO3">
                      <TextInput
                        value={evt.pays_code}
                        onChange={v => upd(setEvenements, idx, 'pays_code', v)}
                        placeholder="ex: CAN"
                      />
                    </Field>
                  </div>
                  <Field label="Description">
                    <TextArea
                      value={evt.description}
                      onChange={v => upd(setEvenements, idx, 'description', v)}
                      rows={2}
                      placeholder="Ce qui s'est passé, résultats, importance pour le projet…"
                    />
                  </Field>
                  <Field label="URL" hint="lien vers le site ou les documents de l'événement">
                    <TextInput
                      value={evt.url}
                      onChange={v => upd(setEvenements, idx, 'url', v)}
                      placeholder="https://..."
                    />
                  </Field>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={evt.mise_en_avant}
                      onChange={e => upd(setEvenements, idx, 'mise_en_avant', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-600">Événement phare (mis en avant sur la fiche)</span>
                  </label>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Bouton sauvegarder (sticky bas de page) ── */}
      {/* ─── Onglet Chaîne des résultats ──────────────────────────────── */}
      {activeTab === 'chaine' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>Chaîne de résultats CAD-OCDE</strong> — Saisissez le titre narratif de chaque niveau,
            puis les items détaillés (un par ligne). Les flèches et couleurs sont générées automatiquement.
          </div>

          {/* Couleur guide */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Impact (4)',             color: '#6B2C91' },
              { label: 'Effets interméd. (3)',   color: '#B83A2D' },
              { label: 'Effets immédiats (2)',   color: '#C07A10' },
              { label: 'Extrants (1)',            color: '#0F6E56' },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: color }}>
                {label}
              </span>
            ))}
          </div>

          {/* Niveau IMPACT */}
          <div className="bg-white rounded-xl border-2 border-[#6B2C91]/30 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#6B2C91' }}>
              Niveau 4 — Impact (long terme)
            </h3>
            <Field label="Titre du niveau">
              <TextInput
                value={chaine.impact_titre}
                onChange={v => setChaine(c => ({ ...c, impact_titre: v }))}
                placeholder="ex: Réduction des inégalités entre hommes et femmes…"
              />
            </Field>
            <Field label="Items détaillés" hint="Un item par ligne">
              <TextArea
                value={chaine.impact_items}
                onChange={v => setChaine(c => ({ ...c, impact_items: v }))}
                rows={5}
                placeholder={"L'amélioration des revenus permet aux femmes de...\nL'amélioration des conditions économiques..."}
              />
            </Field>
          </div>

          {/* Niveau EFFETS INTERMÉDIAIRES */}
          <div className="bg-white rounded-xl border-2 border-[#B83A2D]/30 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#B83A2D' }}>
              Niveau 3 — Effets intermédiaires (moyen terme)
            </h3>
            <Field label="Titre du niveau">
              <TextInput
                value={chaine.effets_intermediaires_titre}
                onChange={v => setChaine(c => ({ ...c, effets_intermediaires_titre: v }))}
                placeholder="ex: Le projet a eu un impact significatif sur la situation économique…"
              />
            </Field>
            <Field label="Items détaillés" hint="Un item par ligne">
              <TextArea
                value={chaine.effets_intermediaires_items}
                onChange={v => setChaine(c => ({ ...c, effets_intermediaires_items: v }))}
                rows={5}
                placeholder={'58 % d\'entre elles ont vu leurs revenus augmenter…\nAccès au système financier formel…'}
              />
            </Field>
          </div>

          {/* Niveau EFFETS IMMÉDIATS */}
          <div className="bg-white rounded-xl border-2 border-[#C07A10]/30 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#C07A10' }}>
              Niveau 2 — Effets immédiats (court terme)
            </h3>
            <Field label="Titre du niveau">
              <TextInput
                value={chaine.effets_immediats_titre}
                onChange={v => setChaine(c => ({ ...c, effets_immediats_titre: v }))}
                placeholder="ex: 100 % des femmes bénéficiaires ont développé…"
              />
            </Field>
            <Field label="Items détaillés" hint="Un item par ligne">
              <TextArea
                value={chaine.effets_immediats_items}
                onChange={v => setChaine(c => ({ ...c, effets_immediats_items: v }))}
                rows={6}
                placeholder={'70 % de femmes formées en production maraîchère…\n31 % de femmes sur la transformation…'}
              />
            </Field>
          </div>

          {/* Niveau EXTRANTS */}
          <div className="bg-white rounded-xl border-2 border-[#0F6E56]/30 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#0F6E56' }}>
              Niveau 1 — Extrants (réalisations directes)
            </h3>
            <Field label="Titre du niveau">
              <TextInput
                value={chaine.extrants_titre}
                onChange={v => setChaine(c => ({ ...c, extrants_titre: v }))}
                placeholder="ex: Réalisations directes du Fonds — exercice 2025"
              />
            </Field>
            <Field label="Items détaillés" hint="Un item par ligne">
              <TextArea
                value={chaine.extrants_items}
                onChange={v => setChaine(c => ({ ...c, extrants_items: v }))}
                rows={7}
                placeholder={'50 projets soutenus dans le cadre du Fonds…\n9 706 femmes ont accès à une AGR…'}
              />
            </Field>
          </div>

          {/* Activités structurantes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1">
              Tableau des activités structurantes
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Format JSON : <code className="bg-gray-100 px-1 rounded">[{'{'}&#34;volume&#34;: &#34;1 264&#34;, &#34;action&#34;: &#34;Actions de renforcement&#34;{'}'}]</code>
            </p>
            <TextArea
              value={chaine.activites_structurantes}
              onChange={v => setChaine(c => ({ ...c, activites_structurantes: v }))}
              rows={10}
              placeholder={'[\n  {"volume": "1 264", "action": "Actions de renforcement des capacités"},\n  {"volume": "9 475", "action": "Femmes ayant obtenu un accès direct à une AGR"}\n]'}
            />
          </div>
        </div>
      )}

      {/* ── Onglet Résultat enquête ERA ─────────────────────────────── */}
      {activeTab === 'era' && (
        <div className="space-y-6">
          <div className="bg-[#B83A2D]/5 border border-[#B83A2D]/20 rounded-xl p-4 text-sm text-[#B83A2D]">
            <strong>Résultats d'enquête ERA</strong> — Renseignez les résultats de l'enquête qualitative
            pour ce projet. Les lecteurs assignés pourront consulter ces données depuis leur espace personnel.
          </div>

          {/* Édition CREX + statut ERA */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#B83A2D] mb-4">
              Édition et statut
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Édition CREX" hint="Année de l'exercice (ex: 2025)">
                <TextInput
                  value={era.edition_annee}
                  onChange={v => setEra(e => ({ ...e, edition_annee: v }))}
                  placeholder="2025"
                />
              </Field>
              <Field label="Statut ERA">
                <select
                  value={era.statut_era}
                  onChange={ev => setEra(e => ({ ...e, statut_era: ev.target.value as EraForm['statut_era'] }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]"
                >
                  <option value="brouillon">Brouillon (non visible par les lecteurs)</option>
                  <option value="en_revue">En révision (visible par les lecteurs assignés)</option>
                  <option value="publie">Publié (visible par tous)</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Section Rappel */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#B83A2D] mb-4">
              Section Rappel
            </h3>
            <Field label="Objectif ERA" hint="Décrivez l'objectif principal de l'enquête pour ce projet">
              <TextArea
                value={era.objectif_era}
                onChange={v => setEra(e => ({ ...e, objectif_era: v }))}
                rows={4}
                placeholder="Documenter les effets des actions de l'OIF sur les bénéficiaires du projet…"
              />
            </Field>
            <Field label="Méthodologie" hint="Approche, outils, délais de collecte">
              <TextArea
                value={era.methodologie}
                onChange={v => setEra(e => ({ ...e, methodologie: v }))}
                rows={4}
                placeholder="Questionnaires numériques via Survey Solutions, diffusés par les équipes terrain…"
              />
            </Field>
            <Field label="Questionnaire (copie)" hint="Collez ici le texte intégral du questionnaire utilisé">
              <TextArea
                value={era.questionnaire}
                onChange={v => setEra(e => ({ ...e, questionnaire: v }))}
                rows={8}
                placeholder="Q1. Dans quelle mesure les formations reçues ont-elles amélioré vos compétences…"
              />
            </Field>
          </div>

          {/* Section Résultats — métriques */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#B83A2D] mb-4">
              Section Résultats — Collecte
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Population d'enquête estimée">
                <TextInput
                  value={era.population_estimee}
                  onChange={v => setEra(e => ({ ...e, population_estimee: v }))}
                  placeholder="ex: 9706"
                />
              </Field>
              <Field label="Échantillon prévu (Schwartz)">
                <TextInput
                  value={era.echantillon_prevu}
                  onChange={v => setEra(e => ({ ...e, echantillon_prevu: v }))}
                  placeholder="ex: 370"
                />
              </Field>
              <Field label="Nombre de retours reçus">
                <TextInput
                  value={era.nombre_retours}
                  onChange={v => setEra(e => ({ ...e, nombre_retours: v }))}
                  placeholder="ex: 312"
                />
              </Field>
              <Field label="Taux de complétion (%)">
                <TextInput
                  value={era.taux_completude}
                  onChange={v => setEra(e => ({ ...e, taux_completude: v }))}
                  placeholder="ex: 84.3"
                />
              </Field>
            </div>
          </div>

          {/* Section Résultats — Tableaux */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#B83A2D] mb-2">
              Tableaux de résultats détaillés
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Format JSON : tableau d&apos;objets <code className="bg-gray-100 px-1 rounded text-[10px]">[{'{'}titre, colonnes:[], lignes:[{'{'}libelle, [col]:val{'}'}]{'}'}]</code>.
              Chaque ligne contient un <code className="bg-gray-100 px-1 rounded text-[10px]">libelle</code> et les valeurs pour chaque colonne.
              Exemple colonne : <code className="bg-gray-100 px-1 rounded text-[10px]">"Effectif"</code>, <code className="bg-gray-100 px-1 rounded text-[10px]">"Taux (%)"</code>
            </p>
            <TextArea
              value={era.tableaux_resultats}
              onChange={v => setEra(e => ({ ...e, tableaux_resultats: v }))}
              rows={14}
              placeholder={'[\n  {\n    "titre": "Amélioration des compétences techniques",\n    "colonnes": ["Effectif", "Taux (%)"],\n    "lignes": [\n      {"libelle": "Oui, nettement améliorées", "Effectif": 218, "Taux (%)": "69,9"},\n      {"libelle": "Oui, légèrement améliorées", "Effectif": 72, "Taux (%)": "23,1"},\n      {"libelle": "Non améliorées", "Effectif": 22, "Taux (%)": "7,0"},\n      {"libelle": "Total", "Effectif": 312, "Taux (%)": "100"}\n    ]\n  }\n]'}
            />
            <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
              L&apos;import automatique depuis Excel ou DOCX sera disponible prochainement (IA).
            </p>
          </div>

          {/* Analyse IA */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#B83A2D] mb-2">
              Analyse IA des résultats
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Saisissez ou collez ici l&apos;analyse narrative des résultats. Ce texte sera affiché
              dans l&apos;espace lecteur et pourra être exporté en DOCX.
            </p>
            <TextArea
              value={era.analyse_ia}
              onChange={v => setEra(e => ({ ...e, analyse_ia: v }))}
              rows={10}
              placeholder="L'enquête ERA 2025 révèle que 69,9 % des bénéficiaires déclarent une amélioration nette de leurs compétences techniques…"
            />
            <p className="text-[11px] text-[var(--oif-blue)] mt-2 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.091z"/></svg>
              La génération automatique d&apos;analyse via IA sera disponible dans la prochaine version.
            </p>
          </div>
        </div>
      )}

      <div className="sticky bottom-6 flex justify-end mt-8">
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
          {saveError && (
            <span className="text-sm text-red-600">✗ {saveError}</span>
          )}
          {saveSuccess && (
            <span className="text-sm text-emerald-600">✓ Enregistré</span>
          )}
          <button
            onClick={() => router.push('/admin/projets')}
            className="text-sm text-gray-500 hover:text-gray-700 transition px-3 py-1.5"
          >
            Retour
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-[var(--oif-blue)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--oif-blue-dark)] transition disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? <><span className="animate-spin">⟳</span> Enregistrement…</> : '✓ Enregistrer tout'}
          </button>
        </div>
      </div>

    </div>
  )
}
