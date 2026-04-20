'use client'

// ─── Formulaire de création d'un projet ──────────────────────────────────────
// Ce composant combine deux fonctionnalités :
//
// 1. IMPORT IA (optionnel) :
//    L'utilisateur upload un DOCX/PDF → l'API /api/parse-document est appelée
//    → Claude extrait les données → les champs du formulaire sont pré-remplis.
//    L'utilisateur peut ensuite tout modifier avant de sauvegarder.
//
// 2. SAISIE MANUELLE :
//    Tous les champs sont éditables directement.
//
// CONCEPT : Formulaire contrôlé en React
// Chaque champ est lié à un état React (useState). Quand l'IA pré-remplit
// les données, elle fait un setState sur chaque champ → le formulaire
// se met à jour instantanément et reste modifiable.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// ─── Types du formulaire ──────────────────────────────────────────────────────
interface IndicateurForm {
  libelle: string
  valeur_numerique: string
  valeur_pourcentage: string
  unite: string
  categorie: string
  type_preuve: string
  source: string
  mise_en_avant: boolean
  ordre: number
}

interface TemoignageForm {
  citation: string
  auteur: string
  fonction: string
  pays: string
  source: string
  source_url: string
  type_media: string
  mise_en_avant: boolean
}

interface ProjetForm {
  id: string
  code_officiel: string
  ps_id: string
  statut: string
  nom: string
  accroche: string
  description: string
  budget_modifie: string
  budget_engage: string
  engagement_global: string
  taux_execution: string
  nombre_pays: string
  nombre_projets_deposes: string
  nombre_projets_retenus: string
  thematiques: string
  mots_cles: string
}

// Valeurs initiales vides
const EMPTY_PROJET: ProjetForm = {
  id: '',
  code_officiel: '',
  ps_id: '',
  statut: 'brouillon',
  nom: '',
  accroche: '',
  description: '',
  budget_modifie: '',
  budget_engage: '',
  engagement_global: '',
  taux_execution: '',
  nombre_pays: '',
  nombre_projets_deposes: '',
  nombre_projets_retenus: '',
  thematiques: '',
  mots_cles: '',
}

const PS_OPTIONS = [
  { value: 'PS1', label: 'PS1 — Langue française, cultures et éducation' },
  { value: 'PS2', label: 'PS2 — Démocratie et gouvernance' },
  { value: 'PS3', label: 'PS3 — Développement durable' },
]

export default function NouveauProjetPage() {
  const router = useRouter()

  // ─── États du formulaire ─────────────────────────────────────────────────
  const [projet, setProjet] = useState<ProjetForm>(EMPTY_PROJET)
  const [indicateurs, setIndicateurs] = useState<IndicateurForm[]>([])
  const [temoignages, setTemoignages] = useState<TemoignageForm[]>([])
  const [paysCouverture, setPaysCouverture] = useState<string>('')

  // ─── États UI ─────────────────────────────────────────────────────────────
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parseConfiance, setParseConfiance] = useState<number | null>(null)
  const [champManquants, setChampManquants] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'projet' | 'indicateurs' | 'temoignages'>('projet')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ─── Import IA ────────────────────────────────────────────────────────────
  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setParsing(true)
    setParseError(null)
    setParseConfiance(null)
    setChampManquants([])

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erreur lors de l\'analyse')
      }

      const data = await res.json()

      // Pré-remplissage des champs projet
      if (data.projet) {
        const p = data.projet
        setProjet({
          id: p.id ?? '',
          code_officiel: p.code_officiel ?? p.id ?? '',
          ps_id: p.ps_id ?? '',
          statut: p.statut ?? 'brouillon',
          nom: p.nom ?? '',
          accroche: p.accroche ?? '',
          description: p.description ?? '',
          budget_modifie: p.budget_modifie?.toString() ?? '',
          budget_engage: p.budget_engage?.toString() ?? '',
          engagement_global: p.engagement_global?.toString() ?? '',
          taux_execution: p.taux_execution?.toString() ?? '',
          nombre_pays: p.nombre_pays?.toString() ?? '',
          nombre_projets_deposes: p.nombre_projets_deposes?.toString() ?? '',
          nombre_projets_retenus: p.nombre_projets_retenus?.toString() ?? '',
          thematiques: (p.thematiques ?? []).join(', '),
          mots_cles: (p.mots_cles ?? []).join(', '),
        })
      }

      // Pré-remplissage indicateurs
      if (data.indicateurs?.length) {
        setIndicateurs(
          data.indicateurs.map(
            (ind: Record<string, unknown>, i: number) => ({
              libelle: (ind.libelle as string) ?? '',
              valeur_numerique: ind.valeur_numerique?.toString() ?? '',
              valeur_pourcentage: ind.valeur_pourcentage?.toString() ?? '',
              unite: (ind.unite as string) ?? '',
              categorie: (ind.categorie as string) ?? '',
              type_preuve: (ind.type_preuve as string) ?? 'mesure',
              source: (ind.source as string) ?? '',
              mise_en_avant: (ind.mise_en_avant as boolean) ?? i < 4,
              ordre: (ind.ordre as number) ?? i + 1,
            })
          )
        )
      }

      // Pré-remplissage témoignages
      if (data.temoignages?.length) {
        setTemoignages(
          data.temoignages.map((t: Record<string, unknown>) => ({
            citation: (t.citation as string) ?? '',
            auteur: (t.auteur as string) ?? '',
            fonction: (t.fonction as string) ?? '',
            pays: (t.pays as string) ?? '',
            source: (t.source as string) ?? '',
            source_url: (t.source_url as string) ?? '',
            type_media: (t.type_media as string) ?? 'rapport',
            mise_en_avant: (t.mise_en_avant as boolean) ?? false,
          }))
        )
      }

      // Pays de couverture
      if (data.pays_couverture?.length) {
        setPaysCouverture(data.pays_couverture.join(', '))
      }

      setParseConfiance(data.confiance ?? null)
      setChampManquants(data.champs_manquants ?? [])

      // Aller sur l'onglet indicateurs si détectés
      if (data.indicateurs?.length) setActiveTab('indicateurs')

    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setParsing(false)
      // Réinitialiser l'input pour permettre le re-upload du même fichier
      e.target.value = ''
    }
  }

  // ─── Sauvegarde en base ───────────────────────────────────────────────────
  async function handleSave() {
    if (!projet.nom.trim()) {
      setSaveError('Le nom du projet est obligatoire')
      return
    }
    if (!projet.id.trim()) {
      setSaveError('L\'identifiant du projet est obligatoire (ex: PROJ_A14)')
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      // 1. Insérer le projet
      const { error: projetError } = await supabase.from('projets').insert({
        id: projet.id.trim().toUpperCase(),
        code_officiel: (projet.code_officiel || projet.id).trim().toUpperCase(),
        ps_id: projet.ps_id || null,
        statut: projet.statut || 'brouillon',
        nom: projet.nom.trim(),
        accroche: projet.accroche || null,
        description: projet.description || null,
        annee_exercice: 2025,
        budget_modifie: projet.budget_modifie ? parseFloat(projet.budget_modifie) : null,
        budget_engage: projet.budget_engage ? parseFloat(projet.budget_engage) : null,
        engagement_global: projet.engagement_global ? parseFloat(projet.engagement_global) : null,
        taux_execution: projet.taux_execution ? parseFloat(projet.taux_execution) : null,
        nombre_pays: projet.nombre_pays ? parseInt(projet.nombre_pays) : null,
        nombre_projets_deposes: projet.nombre_projets_deposes ? parseInt(projet.nombre_projets_deposes) : null,
        nombre_projets_retenus: projet.nombre_projets_retenus ? parseInt(projet.nombre_projets_retenus) : null,
        thematiques: projet.thematiques ? projet.thematiques.split(',').map(s => s.trim()).filter(Boolean) : null,
        mots_cles: projet.mots_cles ? projet.mots_cles.split(',').map(s => s.trim()).filter(Boolean) : null,
      })

      if (projetError) throw new Error(projetError.message)

      const projetId = projet.id.trim().toUpperCase()

      // 2. Insérer les indicateurs
      if (indicateurs.length > 0) {
        const { error: indError } = await supabase.from('indicateurs').insert(
          indicateurs
            .filter(ind => ind.libelle.trim())
            .map(ind => ({
              projet_id: projetId,
              libelle: ind.libelle.trim(),
              valeur_numerique: ind.valeur_numerique ? parseFloat(ind.valeur_numerique) : null,
              valeur_pourcentage: ind.valeur_pourcentage ? parseFloat(ind.valeur_pourcentage) : null,
              unite: ind.unite || null,
              categorie: ind.categorie || null,
              type_preuve: ind.type_preuve || null,
              source: ind.source || null,
              mise_en_avant: ind.mise_en_avant,
              ordre: ind.ordre,
            }))
        )
        if (indError) console.error('Erreur indicateurs:', indError)
      }

      // 3. Insérer les témoignages
      if (temoignages.length > 0) {
        const { error: temError } = await supabase.from('temoignages').insert(
          temoignages
            .filter(t => t.citation.trim())
            .map(t => ({
              projet_id: projetId,
              citation: t.citation.trim(),
              auteur: t.auteur || null,
              fonction: t.fonction || null,
              pays: t.pays || null,
              source: t.source || null,
              source_url: t.source_url || null,
              type_media: t.type_media || null,
              mise_en_avant: t.mise_en_avant,
            }))
        )
        if (temError) console.error('Erreur témoignages:', temError)
      }

      // 4. Insérer les pays de couverture
      if (paysCouverture.trim()) {
        const codes = paysCouverture.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
        if (codes.length > 0) {
          const { error: paysError } = await supabase.from('pays_couverture').insert(
            codes.map(code => ({
              projet_id: projetId,
              pays_code: code,
              annee: 2025,
            }))
          )
          if (paysError) console.error('Erreur pays:', paysError)
        }
      }

      router.push(`/admin/projets`)
      router.refresh()

    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  // ─── Helpers pour les indicateurs ────────────────────────────────────────
  function addIndicateur() {
    setIndicateurs(prev => [
      ...prev,
      {
        libelle: '',
        valeur_numerique: '',
        valeur_pourcentage: '',
        unite: '',
        categorie: '',
        type_preuve: 'mesure',
        source: '',
        mise_en_avant: false,
        ordre: prev.length + 1,
      },
    ])
  }

  function removeIndicateur(index: number) {
    setIndicateurs(prev => prev.filter((_, i) => i !== index))
  }

  function updateIndicateur(index: number, field: keyof IndicateurForm, value: string | boolean | number) {
    setIndicateurs(prev =>
      prev.map((ind, i) => (i === index ? { ...ind, [field]: value } : ind))
    )
  }

  // ─── Helpers pour les témoignages ────────────────────────────────────────
  function addTemoignage() {
    setTemoignages(prev => [
      ...prev,
      {
        citation: '',
        auteur: '',
        fonction: '',
        pays: '',
        source: '',
        source_url: '',
        type_media: 'rapport',
        mise_en_avant: false,
      },
    ])
  }

  function removeTemoignage(index: number) {
    setTemoignages(prev => prev.filter((_, i) => i !== index))
  }

  function updateTemoignage(index: number, field: keyof TemoignageForm, value: string | boolean) {
    setTemoignages(prev =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    )
  }

  // ─── Rendu ───────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <a href="/admin/projets" className="hover:text-[var(--oif-blue)]">Projets</a>
          <span>/</span>
          <span className="text-gray-600">Nouveau projet</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--oif-blue-dark)]">Créer un projet</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Importez un fichier DOCX ou PDF pour pré-remplir automatiquement les champs, ou saisissez manuellement.
        </p>
      </div>

      {/* Zone d'import IA */}
      <div className="bg-gradient-to-br from-[var(--oif-blue)]/5 to-[var(--oif-purple)]/5 border border-[var(--oif-blue)]/20 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--oif-blue)] flex items-center justify-center text-white text-sm flex-shrink-0">
            ✦
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-[var(--oif-blue-dark)] mb-1">
              Import intelligent par IA
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Uploadez un fichier CREXE. Claude analysera le document et pré-remplira
              tous les champs détectés. Vous pourrez tout modifier avant de sauvegarder.
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--oif-blue)] text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-[var(--oif-blue-dark)] transition disabled:opacity-50">
              {parsing ? (
                <>
                  <span className="animate-spin">⟳</span> Analyse en cours…
                </>
              ) : (
                <>
                  ↑ Importer un fichier DOCX ou PDF
                </>
              )}
              <input
                type="file"
                accept=".docx,.pdf,.txt"
                className="hidden"
                onChange={handleFileImport}
                disabled={parsing}
              />
            </label>

            {/* Résultat du parsing */}
            {parseConfiance !== null && (
              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className="text-emerald-600 font-medium">
                  ✓ Extraction réussie
                </span>
                <span className="text-gray-400">
                  Confiance : {Math.round(parseConfiance * 100)}%
                </span>
                {champManquants.length > 0 && (
                  <span className="text-amber-600">
                    {champManquants.length} champ(s) non détecté(s)
                  </span>
                )}
              </div>
            )}
            {parseError && (
              <p className="mt-3 text-sm text-red-600">✗ {parseError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'projet', label: 'Projet', count: null },
          { key: 'indicateurs', label: 'Indicateurs', count: indicateurs.length },
          { key: 'temoignages', label: 'Témoignages', count: temoignages.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-white text-[var(--oif-blue-dark)] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-[var(--oif-blue)]/10 text-[var(--oif-blue)] text-xs rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── ONGLET PROJET ─────────────────────────────────────────────────── */}
      {activeTab === 'projet' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Identifiant système <span className="text-red-400">*</span>
                <span className="ml-1.5 text-xs text-gray-400 font-normal">(clé primaire unique)</span>
              </label>
              <input
                type="text"
                placeholder="ex: PROJ_A14"
                value={projet.id}
                onChange={(e) => setProjet(p => ({ ...p, id: e.target.value }))}
                className="input-field uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Code officiel <span className="text-red-400">*</span>
                <span className="ml-1.5 text-xs text-gray-400 font-normal">(code CREXE officiel)</span>
              </label>
              <input
                type="text"
                placeholder="ex: PROJ_A14"
                value={projet.code_officiel ?? ''}
                onChange={(e) => setProjet(p => ({ ...p, code_officiel: e.target.value }))}
                className="input-field uppercase"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Programme stratégique
              </label>
              <select
                value={projet.ps_id}
                onChange={(e) => setProjet(p => ({ ...p, ps_id: e.target.value }))}
                className="input-field"
              >
                <option value="">— Sélectionner —</option>
                {PS_OPTIONS.map(ps => (
                  <option key={ps.value} value={ps.value}>{ps.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Statut de publication
              </label>
              <select
                value={projet.statut ?? 'brouillon'}
                onChange={(e) => setProjet(p => ({ ...p, statut: e.target.value }))}
                className="input-field"
              >
                <option value="brouillon">Brouillon</option>
                <option value="en_revue">En révision</option>
                <option value="publie">Publié ✓</option>
                <option value="archive">Archivé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom du projet <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="ex: La Francophonie avec Elles"
              value={projet.nom}
              onChange={(e) => setProjet(p => ({ ...p, nom: e.target.value }))}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Accroche
              <span className="ml-2 text-xs text-gray-400 font-normal">Sous-titre court et percutant</span>
            </label>
            <input
              type="text"
              placeholder="ex: D'une femme à toute une société"
              value={projet.accroche}
              onChange={(e) => setProjet(p => ({ ...p, accroche: e.target.value }))}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Narratif de présentation du projet (2-3 paragraphes)"
              value={projet.description}
              onChange={(e) => setProjet(p => ({ ...p, description: e.target.value }))}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget modifié (€)</label>
              <input type="number" placeholder="2915200" value={projet.budget_modifie}
                onChange={(e) => setProjet(p => ({ ...p, budget_modifie: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget engagé (€)</label>
              <input type="number" placeholder="2872348" value={projet.budget_engage}
                onChange={(e) => setProjet(p => ({ ...p, budget_engage: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Engagement global (€)</label>
              <input type="number" placeholder="4345000" value={projet.engagement_global}
                onChange={(e) => setProjet(p => ({ ...p, engagement_global: e.target.value }))}
                className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Taux exécution (%)</label>
              <input type="number" min="0" max="100" placeholder="99" value={projet.taux_execution}
                onChange={(e) => setProjet(p => ({ ...p, taux_execution: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nb pays</label>
              <input type="number" placeholder="31" value={projet.nombre_pays}
                onChange={(e) => setProjet(p => ({ ...p, nombre_pays: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Projets déposés</label>
              <input type="number" placeholder="1561" value={projet.nombre_projets_deposes}
                onChange={(e) => setProjet(p => ({ ...p, nombre_projets_deposes: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Projets retenus</label>
              <input type="number" placeholder="54" value={projet.nombre_projets_retenus}
                onChange={(e) => setProjet(p => ({ ...p, nombre_projets_retenus: e.target.value }))}
                className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Pays de couverture
              <span className="ml-2 text-xs text-gray-400 font-normal">Codes ISO3, séparés par des virgules</span>
            </label>
            <input
              type="text"
              placeholder="ex: BEN, MDG, SEN, CMR, CIV"
              value={paysCouverture}
              onChange={(e) => setPaysCouverture(e.target.value)}
              className="input-field font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Thématiques
                <span className="ml-2 text-xs text-gray-400 font-normal">Séparées par des virgules</span>
              </label>
              <input
                type="text"
                placeholder="egalite_femmes_hommes, entrepreneuriat"
                value={projet.thematiques}
                onChange={(e) => setProjet(p => ({ ...p, thematiques: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mots-clés</label>
              <input
                type="text"
                placeholder="AGR, formation, Kigali"
                value={projet.mots_cles}
                onChange={(e) => setProjet(p => ({ ...p, mots_cles: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── ONGLET INDICATEURS ────────────────────────────────────────────── */}
      {activeTab === 'indicateurs' && (
        <div className="space-y-4">
          {indicateurs.map((ind, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono bg-[var(--oif-neutral)] text-gray-500 px-2 py-1 rounded">
                  #{i + 1}
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ind.mise_en_avant}
                      onChange={(e) => updateIndicateur(i, 'mise_en_avant', e.target.checked)}
                      className="rounded"
                    />
                    Mise en avant (KPI)
                  </label>
                  <button
                    onClick={() => removeIndicateur(i)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Libellé de l'indicateur"
                  value={ind.libelle}
                  onChange={(e) => updateIndicateur(i, 'libelle', e.target.value)}
                  className="input-field"
                />
                <div className="grid grid-cols-4 gap-3">
                  <input type="number" placeholder="Valeur numérique"
                    value={ind.valeur_numerique}
                    onChange={(e) => updateIndicateur(i, 'valeur_numerique', e.target.value)}
                    className="input-field" />
                  <input type="number" placeholder="Pourcentage"
                    value={ind.valeur_pourcentage}
                    onChange={(e) => updateIndicateur(i, 'valeur_pourcentage', e.target.value)}
                    className="input-field" />
                  <input type="text" placeholder="Unité (femmes, %…)"
                    value={ind.unite}
                    onChange={(e) => updateIndicateur(i, 'unite', e.target.value)}
                    className="input-field" />
                  <select
                    value={ind.type_preuve}
                    onChange={(e) => updateIndicateur(i, 'type_preuve', e.target.value)}
                    className="input-field"
                  >
                    <option value="mesure">Mesure</option>
                    <option value="estimation">Estimation</option>
                    <option value="observation">Observation</option>
                    <option value="institutionnel">Institutionnel</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Catégorie"
                    value={ind.categorie}
                    onChange={(e) => updateIndicateur(i, 'categorie', e.target.value)}
                    className="input-field" />
                  <input type="text" placeholder="Source"
                    value={ind.source}
                    onChange={(e) => updateIndicateur(i, 'source', e.target.value)}
                    className="input-field" />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addIndicateur}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-[var(--oif-blue)] hover:text-[var(--oif-blue)] transition"
          >
            + Ajouter un indicateur
          </button>
        </div>
      )}

      {/* ─── ONGLET TÉMOIGNAGES ────────────────────────────────────────────── */}
      {activeTab === 'temoignages' && (
        <div className="space-y-4">
          {temoignages.map((t, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono bg-[var(--oif-neutral)] text-gray-500 px-2 py-1 rounded">
                  #{i + 1}
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.mise_en_avant}
                      onChange={(e) => updateTemoignage(i, 'mise_en_avant', e.target.checked)}
                      className="rounded"
                    />
                    Mise en avant
                  </label>
                  <button
                    onClick={() => removeTemoignage(i)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="Citation…"
                  value={t.citation}
                  onChange={(e) => updateTemoignage(i, 'citation', e.target.value)}
                  className="input-field resize-none"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" placeholder="Auteur"
                    value={t.auteur}
                    onChange={(e) => updateTemoignage(i, 'auteur', e.target.value)}
                    className="input-field" />
                  <input type="text" placeholder="Fonction"
                    value={t.fonction}
                    onChange={(e) => updateTemoignage(i, 'fonction', e.target.value)}
                    className="input-field" />
                  <input type="text" placeholder="Pays (ISO3)"
                    value={t.pays}
                    onChange={(e) => updateTemoignage(i, 'pays', e.target.value.toUpperCase())}
                    className="input-field font-mono uppercase" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Source"
                    value={t.source}
                    onChange={(e) => updateTemoignage(i, 'source', e.target.value)}
                    className="input-field" />
                  <input type="url" placeholder="URL source"
                    value={t.source_url}
                    onChange={(e) => updateTemoignage(i, 'source_url', e.target.value)}
                    className="input-field" />
                </div>
                <select
                  value={t.type_media}
                  onChange={(e) => updateTemoignage(i, 'type_media', e.target.value)}
                  className="input-field w-48"
                >
                  <option value="rapport">Rapport</option>
                  <option value="article">Article</option>
                  <option value="video">Vidéo</option>
                  <option value="interview">Interview</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
          ))}
          <button
            onClick={addTemoignage}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-[var(--oif-blue)] hover:text-[var(--oif-blue)] transition"
          >
            + Ajouter un témoignage
          </button>
        </div>
      )}

      {/* Barre de sauvegarde */}
      <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          ← Annuler
        </button>
        <div className="flex items-center gap-4">
          {saveError && (
            <p className="text-sm text-red-600">✗ {saveError}</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[var(--oif-blue)] text-white text-sm font-medium rounded-lg hover:bg-[var(--oif-blue-dark)] disabled:opacity-50 transition"
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder le projet'}
          </button>
        </div>
      </div>
    </div>
  )
}
