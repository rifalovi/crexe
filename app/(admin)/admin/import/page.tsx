'use client'

// ─── Page d'import en lot ─────────────────────────────────────────────────────
// Route : /admin/import
//
// Permet d'importer un document CREXE ou ERA et d'appliquer les données
// extraites à un projet existant ou de créer un nouveau projet.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import DocImporter, { ImportResult } from '@/components/admin/DocImporter'

export default function ImportPage() {
  const router = useRouter()
  const [projetCible, setProjetCible] = useState('')
  const [projets, setProjets] = useState<{ id: string; nom: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [imported, setImported] = useState<ImportResult | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Charger la liste des projets
  const chargerProjets = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('projets').select('id, nom').order('id')
    setProjets(data ?? [])
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Concept : useEffect déclenche le chargement APRÈS le premier rendu
  // useState(() => {...}) est incorrect ici — c'est une initializer function React,
  // pas un hook de cycle de vie. useEffect est la bonne approche.
  useEffect(() => { chargerProjets() }, [chargerProjets])

  const showFlash = (type: 'ok' | 'err', msg: string) => {
    setFlash({ type, msg })
    setTimeout(() => setFlash(null), 5000)
  }

  // Appliquer les données importées à un projet existant
  async function appliquerSurProjet(result: ImportResult) {
    setImported(result)
    if (!projetCible) {
      showFlash('err', 'Sélectionnez un projet cible avant d\'appliquer.')
      return
    }

    setApplying(true)
    let nbOk = 0

    // Données projet
    if (result.projet) {
      const payload: Record<string, unknown> = {}
      const p = result.projet
      if (p.nom)                payload.nom                = p.nom
      if (p.accroche)           payload.accroche           = p.accroche
      if (p.description)        payload.description        = p.description
      if (p.ps_id)              payload.ps_id              = p.ps_id
      if (p.budget_modifie)     payload.budget_modifie     = p.budget_modifie
      if (p.budget_engage)      payload.budget_engage      = p.budget_engage
      if (p.taux_execution != null) payload.taux_execution = p.taux_execution
      if (p.nombre_pays)        payload.nombre_pays        = p.nombre_pays
      if (p.thematiques)        payload.thematiques        = p.thematiques
      if (p.mots_cles)          payload.mots_cles          = p.mots_cles
      payload.updated_at = new Date().toISOString()
      const { error } = await supabase.from('projets').update(payload).eq('id', projetCible)
      if (!error) nbOk++
    }

    // Indicateurs
    if (result.indicateurs?.length) {
      for (const ind of result.indicateurs as Record<string, unknown>[]) {
        await supabase.from('indicateurs').insert({ ...ind, projet_id: projetCible })
      }
      nbOk++
    }

    // Témoignages
    if (result.temoignages?.length) {
      for (const t of result.temoignages as Record<string, unknown>[]) {
        await supabase.from('temoignages').insert({ ...t, projet_id: projetCible })
      }
      nbOk++
    }

    // Chaîne des résultats
    if (result.chaine && Object.keys(result.chaine).length > 0) {
      const cr = result.chaine
      const chainePayload = {
        projet_id:                   projetCible,
        extrants_titre:              cr.extrants_titre,
        extrants_items:              cr.extrants_items,
        effets_immediats_titre:      cr.effets_immediats_titre,
        effets_immediats_items:      cr.effets_immediats_items,
        effets_intermediaires_titre: cr.effets_intermediaires_titre,
        effets_intermediaires_items: cr.effets_intermediaires_items,
        impact_titre:                cr.impact_titre,
        impact_items:                cr.impact_items,
        activites_structurantes:     cr.activites_structurantes,
      }
      await supabase.from('chaine_resultats').upsert(chainePayload, { onConflict: 'projet_id' })
      nbOk++
    }

    // ERA
    if (result.era?.length) {
      for (const section of result.era as Record<string, unknown>[]) {
        await supabase.from('resultats_era').insert({
          ps_id: (result.projet as Record<string,unknown>)?.ps_id ?? 'PS1',
          projet_code:   projetCible,
          projet_nom:    (result.projet as Record<string,unknown>)?.nom ?? '',
          ...section,
          annee_exercice: 2024,
        })
      }
      nbOk++
    }

    setApplying(false)
    if (nbOk > 0) {
      showFlash('ok', `${nbOk} bloc(s) importé(s) avec succès dans ${projetCible}.`)
      router.push(`/admin/projets/${projetCible}/edit`)
    } else {
      showFlash('err', 'Aucune donnée n\'a pu être appliquée.')
    }
  }

  // Créer un nouveau projet à partir des données importées
  async function creerNouveauProjet(result: ImportResult) {
    if (!result.projet?.nom) {
      showFlash('err', 'Le document ne contient pas de nom de projet. Sélectionnez un projet existant.')
      return
    }
    const p = result.projet as Record<string, unknown>
    const { data, error } = await supabase.from('projets').insert({
      id:             p.code_officiel ?? `IMPORT_${Date.now()}`,
      code_officiel:  p.code_officiel ?? `IMPORT_${Date.now()}`,
      nom:            p.nom,
      accroche:       p.accroche,
      description:    p.description,
      ps_id:          p.ps_id,
      budget_modifie: p.budget_modifie,
      budget_engage:  p.budget_engage,
      taux_execution: p.taux_execution,
      nombre_pays:    p.nombre_pays,
      thematiques:    p.thematiques,
      mots_cles:      p.mots_cles,
      statut:         'brouillon',
      annee_exercice: 2025,
    }).select().maybeSingle()
    if (error) { showFlash('err', `Erreur : ${error.message}`); return }
    if (data) router.push(`/admin/projets/${data.id}/edit`)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Import de documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          Téléversez un rapport CREXE ou une enquête ERA — Claude extrait automatiquement les données et remplit les formulaires.
        </p>
      </div>

      {flash && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${
          flash.type === 'ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'
        }`}>
          {flash.type === 'ok' ? '✓' : '✗'} {flash.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne gauche : import */}
        <div className="lg:col-span-2">
          <DocImporter
            modesDisponibles={['global', 'projet', 'indicateurs', 'era', 'chaine', 'temoignages']}
            onResult={result => {
              setImported(result)
              if (projetCible) {
                appliquerSurProjet(result)
              } else {
                showFlash('ok', `${Object.keys(result).filter(k => k !== 'ok' && k !== 'mode' && k !== 'fichier').length} blocs extraits. Choisissez un projet cible ou créez-en un nouveau.`)
              }
            }}
          />
        </div>

        {/* Colonne droite : projet cible */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-900 mb-3">Projet cible</p>
            <p className="text-xs text-gray-500 mb-3">
              Sélectionnez le projet dans lequel injecter les données extraites.
            </p>
            {loading ? (
              <p className="text-xs text-gray-400">Chargement…</p>
            ) : (
              <select
                value={projetCible}
                onChange={e => setProjetCible(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/20"
              >
                <option value="">— Sélectionner un projet —</option>
                {projets.map(p => (
                  <option key={p.id} value={p.id}>{p.id} — {p.nom?.substring(0, 35)}</option>
                ))}
              </select>
            )}

            {projetCible && imported && (
              <button
                onClick={() => appliquerSurProjet(imported)}
                disabled={applying}
                className="mt-3 w-full py-2.5 text-sm font-semibold text-white bg-[var(--oif-blue)] hover:bg-[var(--oif-blue-dark)] rounded-xl transition disabled:opacity-50"
              >
                {applying ? '⏳ Application…' : `✓ Appliquer sur ${projetCible}`}
              </button>
            )}
          </div>

          {!!(imported?.projet?.nom) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-900 mb-3">Créer un nouveau projet</p>
              <p className="text-xs text-gray-500 mb-3">
                Le document contient un projet &quot;{String(imported.projet.nom).substring(0, 40)}&quot;. Créer une nouvelle fiche ?
              </p>
              <button
                onClick={() => creerNouveauProjet(imported)}
                className="w-full py-2.5 text-sm font-semibold text-[var(--oif-blue)] border-2 border-[var(--oif-blue)]/20 hover:bg-[var(--oif-blue)]/5 rounded-xl transition"
              >
                + Créer une nouvelle fiche projet
              </button>
            </div>
          )}

          <div className="bg-[var(--oif-blue)]/5 rounded-2xl p-4">
            <p className="text-xs font-semibold text-[var(--oif-blue)] mb-2">💡 Conseils</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Préférez le format DOCX pour une meilleure extraction</li>
              <li>• Les PDF textuels fonctionnent — les scans non</li>
              <li>• Choisissez le mode selon la section du rapport</li>
              <li>• L'extraction est toujours vérifiable avant application</li>
              <li>• Les champs extraits restent modifiables après import</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
