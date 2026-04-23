'use client'

// ─── Page admin — Gestion des éditions CREXE ──────────────────────────────────
// Route : /admin/editions
//
// Architecture corrigée :
// - READ  : createBrowserClient (lecture publique, OK avec anon key)
// - WRITE : Server Actions dans ../actions.ts (service_role, contourne RLS)
//
// Avant cette correction, les écritures échouaient car :
//   1. Pas de middleware.ts → token JWT expiré → auth.uid() = null
//   2. RLS bloquait toute écriture car l'utilisateur semblait anonyme
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import {
  activerEdition,
  changerStatutEdition,
  creerEdition,
} from '../actions'

interface Edition {
  annee: number
  libelle: string
  description: string
  statut: 'en_cours' | 'clos' | 'archive'
  est_actif: boolean
  date_debut: string | null
  date_fin: string | null
  nb_projets?: number
  nb_projets_publies?: number
  budget_total?: number
  nb_pays?: number
}

const STATUT_LABELS: Record<string, { label: string; color: string }> = {
  en_cours: { label: 'En cours',  color: 'bg-emerald-100 text-emerald-700' },
  clos:     { label: 'Clôturé',  color: 'bg-amber-100 text-amber-700' },
  archive:  { label: 'Archivé',  color: 'bg-gray-100 text-gray-500' },
}

export default function EditionsPage() {
  const [editions, setEditions]     = useState<Edition[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState<number | null>(null)
  const [erreur, setErreur]         = useState<string | null>(null)
  const [succes, setSucces]         = useState<string | null>(null)
  const [showNew, setShowNew]       = useState(false)
  const [newAnnee, setNewAnnee]     = useState('')
  const [newLibelle, setNewLibelle] = useState('')
  const [newDesc, setNewDesc]       = useState('')

  // Lecture uniquement — la clé anon suffit pour SELECT
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const flash = (type: 'ok' | 'err', text: string) => {
    if (type === 'ok') { setSucces(text); setErreur(null) }
    else               { setErreur(text); setSucces(null) }
    setTimeout(() => { setSucces(null); setErreur(null) }, 5000)
  }

  const chargerEditions = useCallback(async () => {
    setLoading(true)
    // Essayer la vue enrichie, sinon la table de base
    const { data: eds, error } = await supabase
      .from('v_stats_par_edition')
      .select('*')
      .order('annee', { ascending: false })

    if (error) {
      const { data: eds2 } = await supabase
        .from('crex_editions')
        .select('*')
        .order('annee', { ascending: false })
      setEditions(eds2 ?? [])
    } else {
      setEditions(eds ?? [])
    }
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { chargerEditions() }, [chargerEditions])

  // ── Activer une édition (Server Action) ──────────────────────────────────
  async function handleActiver(annee: number) {
    setSaving(annee)
    try {
      await activerEdition(annee)
      flash('ok', `Édition ${annee} activée — c'est maintenant l'édition par défaut.`)
      await chargerEditions()
    } catch (e) {
      flash('err', `Erreur : ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSaving(null)
    }
  }

  // ── Changer statut (Server Action) ───────────────────────────────────────
  async function handleStatut(annee: number, statut: string) {
    setSaving(annee)
    try {
      await changerStatutEdition(annee, statut)
      await chargerEditions()
    } catch (e) {
      flash('err', `Erreur : ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSaving(null)
    }
  }

  // ── Créer une édition (Server Action) ────────────────────────────────────
  async function handleCreer() {
    const annee = parseInt(newAnnee)
    if (!annee || annee < 2020 || annee > 2040) {
      flash('err', 'Année invalide (entre 2020 et 2040).')
      return
    }
    setSaving(annee)
    try {
      await creerEdition({
        annee,
        libelle:     newLibelle || `CREXE ${annee}`,
        description: newDesc || `Compte-Rendu d'Exécution exercice ${annee}`,
      })
      flash('ok', `Édition ${annee} créée avec succès.`)
      setShowNew(false)
      setNewAnnee(''); setNewLibelle(''); setNewDesc('')
      await chargerEditions()
    } catch (e) {
      flash('err', `Erreur : ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* ─── En-tête ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Éditions CREXE</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les exercices annuels (2024, 2025, 2026…). Une seule édition
            est active à la fois sur la plateforme publique.
          </p>
        </div>
        <button
          onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-2 bg-[#003DA5] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#042C53] transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nouvelle édition
        </button>
      </div>

      {/* ─── Messages flash ───────────────────────────────────────────────── */}
      {erreur && (
        <div className="mb-4 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          {erreur}
        </div>
      )}
      {succes && (
        <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          {succes}
        </div>
      )}

      {/* ─── Formulaire nouvelle édition ─────────────────────────────────── */}
      {showNew && (
        <div className="mb-6 bg-white border border-[#003DA5]/20 rounded-2xl p-6">
          <h3 className="font-semibold text-[#042C53] mb-4">Créer une nouvelle édition</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Année <span className="text-red-400">*</span>
              </label>
              <input
                type="number" value={newAnnee} onChange={e => setNewAnnee(e.target.value)}
                placeholder="2026" min="2020" max="2040"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Libellé</label>
              <input
                type="text" value={newLibelle} onChange={e => setNewLibelle(e.target.value)}
                placeholder={`CREXE ${newAnnee || '2026'}`}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Description</label>
            <input
              type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)}
              placeholder="Description de cette édition…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreer} disabled={!!saving}
              className="bg-[#003DA5] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#042C53] transition disabled:opacity-50">
              {saving ? '⏳ Création…' : 'Créer l\'édition'}
            </button>
            <button onClick={() => setShowNew(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* ─── Liste des éditions ───────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <svg className="animate-spin mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Chargement…
        </div>
      ) : (
        <div className="space-y-4">
          {editions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Aucune édition trouvée.{' '}
              <button onClick={() => setShowNew(true)} className="text-[#003DA5] hover:underline">
                Créer la première édition →
              </button>
            </div>
          ) : (
            editions.map(ed => (
              <div
                key={ed.annee}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition ${
                  ed.est_actif ? 'border-[#003DA5]/30 ring-1 ring-[#003DA5]/20' : 'border-gray-100'
                }`}
              >
                <div className="px-6 py-5 flex items-center gap-6">

                  {/* Année + badge actif */}
                  <div className="flex-shrink-0 text-center w-16">
                    <p className="text-3xl font-bold text-[#003DA5]">{ed.annee}</p>
                    {ed.est_actif && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-[#003DA5] bg-[#003DA5]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 text-base">{ed.libelle}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUT_LABELS[ed.statut]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUT_LABELS[ed.statut]?.label ?? ed.statut}
                      </span>
                    </div>
                    {ed.description && (
                      <p className="text-sm text-gray-500 truncate">{ed.description}</p>
                    )}
                    <div className="flex items-center gap-5 mt-2">
                      {ed.nb_projets_publies !== undefined && (
                        <span className="text-xs text-gray-500">
                          <strong className="text-gray-800">{ed.nb_projets_publies ?? 0}</strong> / {ed.nb_projets ?? 0} projets publiés
                        </span>
                      )}
                      {ed.nb_pays !== undefined && ed.nb_pays > 0 && (
                        <span className="text-xs text-gray-500">
                          <strong className="text-gray-800">{ed.nb_pays}</strong> pays
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <select
                      value={ed.statut}
                      disabled={saving === ed.annee}
                      onChange={e => handleStatut(ed.annee, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 disabled:opacity-50"
                    >
                      <option value="en_cours">En cours</option>
                      <option value="clos">Clôturé</option>
                      <option value="archive">Archivé</option>
                    </select>

                    {!ed.est_actif && (
                      <button
                        onClick={() => handleActiver(ed.annee)}
                        disabled={saving === ed.annee}
                        className="text-xs font-semibold text-[#003DA5] border border-[#003DA5]/30 px-3 py-1.5 rounded-lg hover:bg-[#003DA5]/5 transition disabled:opacity-50"
                      >
                        {saving === ed.annee ? '⏳' : 'Activer'}
                      </button>
                    )}

                    <Link
                      href={`/admin/projets?edition=${ed.annee}`}
                      className="text-xs font-semibold text-white bg-[#003DA5] hover:bg-[#042C53] px-4 py-1.5 rounded-lg transition"
                    >
                      Gérer les projets →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
