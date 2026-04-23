'use client'

// ─── Page Paramètres — Configuration de la plateforme ─────────────────────────
// Route : /admin/parametres
//
// Concept pédagogique — Séparation contenu / présentation :
// Les labels, noms de champs et libellés ne sont pas codés "en dur" dans
// le code source, mais stockés dans une table `parametres`. Cela permet à
// un administrateur non-technique de modifier n'importe quel texte de la
// plateforme sans intervention du développeur.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Parametre {
  cle: string
  valeur: string
  valeur_defaut: string
  categorie: string
  description: string
  actif: boolean
}

// ─── Libellés des catégories ──────────────────────────────────────────────────
const CATEGORIE_CONFIG: Record<string, { label: string; icon: string; desc: string }> = {
  general:             { label: 'Plateforme générale',      icon: '🏛️', desc: 'Nom de la plateforme, de l\'organisation, du service' },
  programmes_strategiques: { label: 'Programmes Stratégiques', icon: '🗂️', desc: 'Noms et libellés des PS1, PS2, PS3' },
  era:                 { label: 'Enquête ERA',              icon: '📊', desc: 'Labels des niveaux de résultats ERA' },
  statuts:             { label: 'Statuts de publication',   icon: '🏷️', desc: 'Libellés des statuts : Brouillon, Publié…' },
  thematiques:         { label: 'Thématiques',              icon: '🏷️', desc: 'Les 6 thématiques sélectionnables pour les projets' },
  chaine_resultats:    { label: 'Chaîne des résultats',     icon: '⛓️', desc: 'Labels des niveaux CAD-OCDE (Extrants → Impact)' },
}

export default function ParametresPage() {
  const [params, setParams]     = useState<Parametre[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState<string | null>(null)
  const [modified, setModified] = useState<Record<string, string>>({})
  const [flash, setFlash]       = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [catOuverte, setCatOuverte] = useState<string | null>('general')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const showFlash = (type: 'ok' | 'err', msg: string) => {
    setFlash({ type, msg })
    setTimeout(() => setFlash(null), 4000)
  }

  const charger = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('parametres')
      .select('*')
      .order('categorie')
      .order('cle')
    if (error) {
      showFlash('err', `Erreur de chargement : ${error.message}. Avez-vous appliqué migration_parametres.sql ?`)
    } else {
      setParams(data ?? [])
    }
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { charger() }, [charger])

  // Mettre à jour localement (avant sauvegarde)
  const update = (cle: string, valeur: string) => {
    setModified(prev => ({ ...prev, [cle]: valeur }))
  }

  // Réinitialiser à la valeur par défaut
  const reset = (param: Parametre) => {
    update(param.cle, param.valeur_defaut)
  }

  // Sauvegarder un paramètre
  const save = async (cle: string) => {
    const valeur = modified[cle] ?? params.find(p => p.cle === cle)?.valeur ?? ''
    setSaving(cle)
    const { error } = await supabase
      .from('parametres')
      .update({ valeur, updated_at: new Date().toISOString() })
      .eq('cle', cle)
    setSaving(null)
    if (error) {
      showFlash('err', `Erreur : ${error.message}`)
    } else {
      showFlash('ok', `Paramètre "${cle}" mis à jour.`)
      setModified(prev => { const n = { ...prev }; delete n[cle]; return n })
      await charger()
    }
  }

  // Sauvegarder tous les paramètres modifiés
  const saveAll = async () => {
    const cles = Object.keys(modified)
    if (cles.length === 0) { showFlash('ok', 'Aucune modification à enregistrer.'); return }
    setSaving('__all__')
    let errCount = 0
    for (const cle of cles) {
      const { error } = await supabase
        .from('parametres')
        .update({ valeur: modified[cle], updated_at: new Date().toISOString() })
        .eq('cle', cle)
      if (error) errCount++
    }
    setSaving(null)
    setModified({})
    if (errCount > 0) {
      showFlash('err', `${errCount} paramètre(s) non sauvegardé(s). Vérifiez vos droits admin.`)
    } else {
      showFlash('ok', `${cles.length} paramètre(s) mis à jour avec succès.`)
    }
    await charger()
  }

  // Grouper par catégorie
  const parCategorie: Record<string, Parametre[]> = {}
  params.forEach(p => {
    if (!parCategorie[p.categorie]) parCategorie[p.categorie] = []
    parCategorie[p.categorie].push(p)
  })

  const nbModified = Object.keys(modified).length

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres de la plateforme</h1>
          <p className="text-sm text-gray-500 mt-1">
            Modifiez les libellés, noms de champs et labels affichés sur la plateforme — sans toucher au code.
          </p>
        </div>
        {nbModified > 0 && (
          <button
            onClick={saveAll}
            disabled={saving === '__all__'}
            className="flex items-center gap-2 bg-[var(--oif-blue)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[var(--oif-blue-dark)] transition disabled:opacity-50"
          >
            {saving === '__all__' ? '⏳ Enregistrement…' : `✓ Enregistrer tout (${nbModified})`}
          </button>
        )}
      </div>

      {/* ── Flash ────────────────────────────────────────────────────────────── */}
      {flash && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
          flash.type === 'ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'
        }`}>
          {flash.type === 'ok' ? '✓' : '✗'} {flash.msg}
        </div>
      )}

      {/* ── Alerte si table non créée ─────────────────────────────────────── */}
      {!loading && params.length === 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-semibold text-amber-800 mb-1">⚠️ Table &quot;parametres&quot; introuvable</p>
          <p className="text-sm text-amber-700">
            Appliquez d&apos;abord la migration dans Supabase SQL Editor :<br/>
            <code className="bg-amber-100 px-1 rounded text-xs">data/seeds/migration_parametres.sql</code>
          </p>
        </div>
      )}

      {/* ── Chargement ───────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Chargement des paramètres…
        </div>
      )}

      {/* ── Accordéon par catégorie ─────────────────────────────────────────── */}
      <div className="space-y-3">
        {Object.entries(parCategorie).map(([cat, items]) => {
          const cfg = CATEGORIE_CONFIG[cat] ?? { label: cat, icon: '⚙️', desc: '' }
          const isOpen = catOuverte === cat
          const nbModifiedInCat = items.filter(p => p.cle in modified).length

          return (
            <div key={cat} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

              {/* En-tête de catégorie (cliquable) */}
              <button
                onClick={() => setCatOuverte(isOpen ? null : cat)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cfg.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{cfg.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{cfg.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {nbModifiedInCat > 0 && (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      {nbModifiedInCat} modifié{nbModifiedInCat > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="text-gray-300 text-sm">{items.length} param.</span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''} text-gray-400`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Corps de la catégorie */}
              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {items.map(param => {
                    const currentVal = modified[param.cle] ?? param.valeur
                    const isModified = param.cle in modified
                    const isChanged  = currentVal !== param.valeur_defaut
                    const isSaving   = saving === param.cle

                    return (
                      <div key={param.cle} className={`px-6 py-4 ${isModified ? 'bg-amber-50/50' : ''}`}>
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Clé + description */}
                            <div className="flex items-center gap-2 mb-1.5">
                              <code className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                {param.cle}
                              </code>
                              {isChanged && (
                                <span className="text-[10px] text-amber-600 font-medium">modifié</span>
                              )}
                            </div>
                            {param.description && (
                              <p className="text-xs text-gray-500 mb-2">{param.description}</p>
                            )}
                            {/* Champ de saisie */}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={currentVal}
                                onChange={e => update(param.cle, e.target.value)}
                                className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                                  isModified
                                    ? 'border-amber-300 bg-amber-50 focus:ring-amber-200'
                                    : 'border-gray-200 focus:ring-[var(--oif-blue)]/20 focus:border-[var(--oif-blue)]'
                                }`}
                              />
                            </div>
                            {/* Valeur par défaut */}
                            {isChanged && (
                              <p className="text-xs text-gray-400 mt-1">
                                Valeur d&apos;origine : <em>{param.valeur_defaut}</em>
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pt-0.5">
                            {isModified && (
                              <button
                                onClick={() => save(param.cle)}
                                disabled={isSaving}
                                className="text-xs font-semibold text-white bg-[var(--oif-blue)] hover:bg-[var(--oif-blue-dark)] px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                              >
                                {isSaving ? '⏳' : '✓ Sauver'}
                              </button>
                            )}
                            {isChanged && (
                              <button
                                onClick={() => reset(param)}
                                className="text-xs text-gray-400 hover:text-gray-600 transition px-2 py-1"
                              >
                                ↺ Réinitialiser
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Note bas de page ────────────────────────────────────────────────── */}
      {!loading && params.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-8">
          Les modifications sont effectives immédiatement après sauvegarde.
          Certains labels nécessitent un rechargement de page pour être visibles.
        </p>
      )}
    </div>
  )
}
