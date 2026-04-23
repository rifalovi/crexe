'use client'

// ─── Page admin — Validation des demandes d'accès ─────────────────────────────
// Route : /admin/demandes
//
// L'admin voit toutes les demandes en attente, peut approuver ou rejeter.
// Approbation → Supabase crée le compte et envoie un lien d'invitation.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { approuverDemande, rejeterDemande } from '../actions'

interface Demande {
  id: string
  email: string
  nom_complet: string
  poste: string | null
  message: string | null
  statut: 'en_attente' | 'approuve' | 'rejete'
  created_at: string
  notes_admin: string | null
}

const STATUT_CONF = {
  en_attente: { label: 'En attente', css: 'bg-amber-100 text-amber-700' },
  approuve:   { label: 'Approuvé',  css: 'bg-emerald-100 text-emerald-700' },
  rejete:     { label: 'Rejeté',    css: 'bg-red-100 text-red-500' },
}

export default function DemandesPage() {
  const [demandes, setDemandes]   = useState<Demande[]>([])
  const [loading, setLoading]     = useState(true)
  const [busy, setBusy]           = useState<string | null>(null)
  const [flash, setFlash]         = useState<{ type: 'ok'|'err'; msg: string }|null>(null)
  const [notesMap, setNotesMap]   = useState<Record<string, string>>({})
  const [filtre, setFiltre]       = useState<'en_attente'|'tous'>('en_attente')
  const [rejectId, setRejectId]   = useState<string|null>(null)

  const showFlash = (type: 'ok'|'err', msg: string) => {
    setFlash({ type, msg })
    setTimeout(() => setFlash(null), 5000)
  }

  const charger = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/demandes')
    const data = await res.json()
    setDemandes(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { charger() }, [charger])

  async function handleApprouver(id: string) {
    setBusy(id)
    try {
      await approuverDemande(id)
      showFlash('ok', 'Compte créé et email d\'invitation envoyé.')
      await charger()
    } catch (e) {
      showFlash('err', e instanceof Error ? e.message : 'Erreur')
    } finally { setBusy(null) }
  }

  async function handleRejeter(id: string) {
    const notes = notesMap[id] || ''
    setBusy(id)
    try {
      await rejeterDemande(id, notes)
      showFlash('ok', 'Demande rejetée.')
      setRejectId(null)
      await charger()
    } catch (e) {
      showFlash('err', e instanceof Error ? e.message : 'Erreur')
    } finally { setBusy(null) }
  }

  const demandes_filtrees = filtre === 'en_attente'
    ? demandes.filter(d => d.statut === 'en_attente')
    : demandes

  const nbEnAttente = demandes.filter(d => d.statut === 'en_attente').length

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes d&apos;accès</h1>
          <p className="text-sm text-gray-500 mt-1">
            Validez les demandes d&apos;activation de compte @francophonie.org
          </p>
        </div>
        {nbEnAttente > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-sm font-semibold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {nbEnAttente} en attente
          </span>
        )}
      </div>

      {/* Flash */}
      {flash && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
          flash.type === 'ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'
        }`}>
          {flash.type === 'ok' ? '✓' : '✗'} {flash.msg}
        </div>
      )}

      {/* Filtre */}
      <div className="flex gap-2 mb-6">
        {(['en_attente', 'tous'] as const).map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${filtre === f ? 'bg-[var(--oif-blue)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'en_attente' ? `En attente (${nbEnAttente})` : `Toutes (${demandes.length})`}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Chargement…
        </div>
      ) : demandes_filtrees.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">✓</p>
          <p className="font-medium">Aucune demande en attente</p>
          <p className="text-sm mt-1">Toutes les demandes ont été traitées.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {demandes_filtrees.map(d => {
            const conf = STATUT_CONF[d.statut]
            const isRejecting = rejectId === d.id
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[var(--oif-blue)]/10 flex items-center justify-center text-sm font-bold text-[var(--oif-blue)] flex-shrink-0">
                    {d.nom_complet.charAt(0).toUpperCase()}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <p className="font-semibold text-gray-900">{d.nom_complet}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conf.css}`}>
                        {conf.label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--oif-blue)] font-medium">{d.email}</p>
                    {d.poste && <p className="text-xs text-gray-500 mt-0.5">{d.poste} · OIF</p>}
                    {d.message && (
                      <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2 italic">
                        &quot;{d.message}&quot;
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Soumis le {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions */}
                  {d.statut === 'en_attente' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprouver(d.id)}
                        disabled={!!busy}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50"
                      >
                        {busy === d.id ? '⏳' : '✓ Approuver'}
                      </button>
                      <button
                        onClick={() => setRejectId(isRejecting ? null : d.id)}
                        disabled={!!busy}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      >
                        ✗ Rejeter
                      </button>
                    </div>
                  )}
                </div>

                {/* Panneau rejet */}
                {isRejecting && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Note de rejet (optionnelle — visible dans le journal admin)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={notesMap[d.id] ?? ''}
                        onChange={e => setNotesMap(m => ({ ...m, [d.id]: e.target.value }))}
                        placeholder="ex: Compte déjà existant, profil non reconnu…"
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-200"
                      />
                      <button
                        onClick={() => handleRejeter(d.id)}
                        disabled={!!busy}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition disabled:opacity-50"
                      >
                        {busy === d.id ? '⏳' : 'Confirmer le rejet'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
