'use client'
// ─── Admin — Gestion des résultats ERA ────────────────────────────────────────
// Route : /admin/era
//
// Architecture : READ via createBrowserClient (anon key suffît pour SELECT)
//                WRITE via Server Actions (service_role, contourne les RLS)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { mettreAJourResultatEra, supprimerResultatEra } from '../actions'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ResultatEra {
  id: string
  ps_id: string
  projet_code: string | null
  projet_nom: string
  titre_section: string
  niveau: string
  contenu: string
  chiffre_cle: string | null
  annee_exercice: number
  ordre: number
  created_at: string
}

// ─── Config ───────────────────────────────────────────────────────────────────
const PS_COLORS = {
  PS1: { bg: '#EBF0FA', border: '#C7D5F5', text: '#003DA5', label: 'Langue & Éducation' },
  PS2: { bg: '#F3EAF9', border: '#DEC5EE', text: '#6B2C91', label: 'Démocratie & Gouvernance' },
  PS3: { bg: '#E6F4F1', border: '#B3DDD7', text: '#0F6E56', label: 'Développement durable' },
} as const

const NIVEAU_OPTIONS = [
  { value: 'acquisition_competences', label: 'Acquisition des compétences' },
  { value: 'effets_intermediaires',   label: 'Effets intermédiaires' },
  { value: 'retombees',               label: 'Retombées observées' },
  { value: 'extrants',                label: 'Extrants' },
  { value: 'synthese',                label: 'Résultats globaux' },
]

// ─── Modal d'édition ──────────────────────────────────────────────────────────
function ModalEdition({
  resultat,
  onClose,
  onSave,
}: {
  resultat: ResultatEra
  onClose: () => void
  onSave: (updated: Partial<ResultatEra>) => Promise<void>
}) {
  const [form, setForm] = useState({
    projet_nom:    resultat.projet_nom,
    projet_code:   resultat.projet_code ?? '',
    titre_section: resultat.titre_section,
    niveau:        resultat.niveau,
    contenu:       resultat.contenu,
    chiffre_cle:   resultat.chiffre_cle ?? '',
    ordre:         resultat.ordre,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      projet_nom:    form.projet_nom,
      projet_code:   form.projet_code || null,
      titre_section: form.titre_section,
      niveau:        form.niveau,
      contenu:       form.contenu,
      chiffre_cle:   form.chiffre_cle || null,
      ordre:         Number(form.ordre),
    })
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-[var(--oif-blue-dark)] text-base">
              Modifier un bloc ERA
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {resultat.ps_id} · {resultat.annee_exercice} · ID : {resultat.id.slice(0, 8)}…
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Formulaire */}
        <div className="p-6 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nom du projet *</label>
              <input
                type="text"
                value={form.projet_nom}
                onChange={e => setForm(f => ({ ...f, projet_nom: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Code projet</label>
              <input
                type="text"
                value={form.projet_code}
                onChange={e => setForm(f => ({ ...f, projet_code: e.target.value }))}
                placeholder="ex: PROJ_A01"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Titre de section *</label>
            <input
              type="text"
              value={form.titre_section}
              onChange={e => setForm(f => ({ ...f, titre_section: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Niveau ERA *</label>
              <select
                value={form.niveau}
                onChange={e => setForm(f => ({ ...f, niveau: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30"
              >
                {NIVEAU_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Chiffre clé</label>
              <input
                type="text"
                value={form.chiffre_cle}
                onChange={e => setForm(f => ({ ...f, chiffre_cle: e.target.value }))}
                placeholder="ex: 75 %, 9 706"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Contenu *
              <span className="ml-2 font-normal text-gray-400">({form.contenu.length} caractères)</span>
            </label>
            <textarea
              value={form.contenu}
              onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))}
              rows={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 resize-y font-mono"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Chaque ligne vide crée un nouveau paragraphe dans l&apos;affichage public.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ordre d&apos;affichage</label>
            <input
              type="number"
              value={form.ordre}
              onChange={e => setForm(f => ({ ...f, ordre: Number(e.target.value) }))}
              className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30"
            />
          </div>
        </div>

        {/* Footer modal */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving || !form.projet_nom || !form.contenu}
            className="flex-1 bg-[var(--oif-blue)] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[var(--oif-blue-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? '⏳ Enregistrement…' : '✓ Enregistrer les modifications'}
          </button>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 bg-gray-100 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AdminEraPage() {
  const [resultats, setResultats]       = useState<ResultatEra[]>([])
  const [loading, setLoading]           = useState(true)
  const [filtrePS, setFiltrePS]         = useState<string>('TOUS')
  const [filtreAnnee, setFiltreAnnee]   = useState<number>(2024)
  const [recherche, setRecherche]       = useState('')
  const [enEdition, setEnEdition]       = useState<ResultatEra | null>(null)
  const [aSupprimer, setASupprimer]     = useState<ResultatEra | null>(null)
  const [message, setMessage]           = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Lecture uniquement — anon key suffit pour SELECT
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ── Chargement ──────────────────────────────────────────────────────────────
  const charger = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('resultats_era')
      .select('*')
      .eq('annee_exercice', filtreAnnee)
      .order('ps_id')
      .order('ordre')

    if (error) {
      setMessage({ type: 'err', text: `Erreur de chargement : ${error.message}` })
    } else {
      setResultats(data ?? [])
    }
    setLoading(false)
  }, [filtreAnnee]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { charger() }, [charger])

  // ── Sauvegarde via Server Action ────────────────────────────────────────────
  const sauvegarder = async (id: string, updates: Partial<ResultatEra>) => {
    try {
      await mettreAJourResultatEra(id, {
        projet_nom:    updates.projet_nom!,
        projet_code:   updates.projet_code ?? null,
        titre_section: updates.titre_section!,
        niveau:        updates.niveau!,
        contenu:       updates.contenu!,
        chiffre_cle:   updates.chiffre_cle ?? null,
        ordre:         updates.ordre ?? 0,
      })
      setMessage({ type: 'ok', text: 'Bloc ERA mis à jour avec succès.' })
      setEnEdition(null)
      charger()
    } catch (e) {
      setMessage({ type: 'err', text: `Erreur : ${e instanceof Error ? e.message : String(e)}` })
    }
    setTimeout(() => setMessage(null), 4000)
  }

  // ── Suppression via Server Action ───────────────────────────────────────────
  const supprimer = async (id: string) => {
    try {
      await supprimerResultatEra(id)
      setMessage({ type: 'ok', text: 'Bloc ERA supprimé.' })
      setASupprimer(null)
      charger()
    } catch (e) {
      setMessage({ type: 'err', text: `Erreur suppression : ${e instanceof Error ? e.message : String(e)}` })
    }
    setTimeout(() => setMessage(null), 4000)
  }

  // ── Filtrage ─────────────────────────────────────────────────────────────────
  const filtres = resultats.filter(r => {
    if (filtrePS !== 'TOUS' && r.ps_id !== filtrePS) return false
    if (recherche) {
      const q = recherche.toLowerCase()
      return (
        r.projet_nom.toLowerCase().includes(q) ||
        (r.projet_code ?? '').toLowerCase().includes(q) ||
        r.titre_section.toLowerCase().includes(q) ||
        r.contenu.toLowerCase().includes(q)
      )
    }
    return true
  })

  const annees = [...new Set(resultats.map(r => r.annee_exercice))].sort()

  return (
    <div className="p-6 max-w-7xl">

      {/* ── En-tête ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--oif-blue-dark)]">
            Résultats ERA
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion des blocs de l&apos;Enquête Rapide Annuelle — édition, suppression.
          </p>
        </div>
        <Link
          href="/resultats-era"
          target="_blank"
          className="flex items-center gap-2 text-xs text-[var(--oif-blue)] bg-[var(--oif-blue)]/8 px-3 py-2 rounded-lg hover:bg-[var(--oif-blue)]/15 transition"
        >
          👁 Voir la page publique →
        </Link>
      </div>

      {/* ── Message flash ─────────────────────────────────────────────────── */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'ok'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'ok' ? '✓' : '✗'} {message.text}
        </div>
      )}

      {/* ── Filtres ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">

        {/* Filtre année */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Année :</span>
          <select
            value={filtreAnnee}
            onChange={e => setFiltreAnnee(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30"
          >
            <option value={2024}>ERA 2024</option>
            <option value={2025}>ERA 2025</option>
            <option value={2026}>ERA 2026</option>
          </select>
        </div>

        <span className="text-gray-200">|</span>

        {/* Filtre PS */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Programme :</span>
          <div className="flex gap-1">
            {['TOUS', 'PS1', 'PS2', 'PS3'].map(ps => (
              <button
                key={ps}
                onClick={() => setFiltrePS(ps)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filtrePS === ps
                    ? ps === 'TOUS'
                      ? 'bg-[var(--oif-blue-dark)] text-white'
                      : ps === 'PS1' ? 'bg-[#003DA5] text-white'
                      : ps === 'PS2' ? 'bg-[#6B2C91] text-white'
                      : 'bg-[#0F6E56] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {ps}
              </button>
            ))}
          </div>
        </div>

        <span className="text-gray-200">|</span>

        {/* Recherche */}
        <div className="flex-1 min-w-48">
          <input
            type="text"
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="🔍 Rechercher un projet, un titre, du contenu…"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30"
          />
        </div>

        <span className="text-xs text-gray-400 ml-auto">
          {filtres.length} bloc{filtres.length > 1 ? 's' : ''} affiché{filtres.length > 1 ? 's' : ''}
          {resultats.length !== filtres.length && ` sur ${resultats.length}`}
        </span>
      </div>

      {/* ── Tableau des résultats ─────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-3xl mb-3">⏳</div>
          <p className="text-sm">Chargement…</p>
        </div>
      ) : filtres.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <div className="text-3xl mb-3">📭</div>
          <p className="text-sm text-gray-500">Aucun résultat ERA pour ces critères.</p>
          {recherche && (
            <button onClick={() => setRecherche('')} className="mt-3 text-xs text-[var(--oif-blue)] hover:underline">
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtres.map(r => {
            const ps = r.ps_id as keyof typeof PS_COLORS
            const cfg = PS_COLORS[ps] ?? PS_COLORS.PS1
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition overflow-hidden"
              >
                <div className="flex items-start gap-4 p-4">

                  {/* Badge PS */}
                  <div className="flex-shrink-0">
                    <span
                      className="inline-block text-xs font-bold px-2 py-1 rounded-lg"
                      style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
                    >
                      {r.ps_id}
                    </span>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {r.projet_code && (
                        <span className="text-xs font-mono font-bold text-gray-400">{r.projet_code}</span>
                      )}
                      <span className="font-semibold text-[var(--oif-blue-dark)] text-sm truncate">
                        {r.projet_nom}
                      </span>
                      {r.chiffre_cle && (
                        <span className="text-xs font-black text-[var(--oif-gold)] bg-amber-50 px-2 py-0.5 rounded">
                          {r.chiffre_cle}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{r.titre_section}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                        style={{ borderColor: cfg.border, color: cfg.text, backgroundColor: cfg.bg }}
                      >
                        {NIVEAU_OPTIONS.find(n => n.value === r.niveau)?.label ?? r.niveau}
                      </span>
                      <span className="text-[10px] text-gray-300">·</span>
                      <span className="text-[10px] text-gray-400">
                        {r.contenu.length} car. · ordre {r.ordre}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex gap-2">
                    <button
                      onClick={() => setEnEdition(r)}
                      className="text-xs font-semibold text-[var(--oif-blue)] bg-[var(--oif-blue)]/8 px-3 py-1.5 rounded-lg hover:bg-[var(--oif-blue)]/15 transition"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => setASupprimer(r)}
                      className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                    >
                      🗑 Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal édition ─────────────────────────────────────────────────── */}
      {enEdition && (
        <ModalEdition
          resultat={enEdition}
          onClose={() => setEnEdition(null)}
          onSave={async (updates) => {
            await sauvegarder(enEdition.id, updates)
          }}
        />
      )}

      {/* ── Confirmation suppression ──────────────────────────────────────── */}
      {aSupprimer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setASupprimer(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="font-semibold text-[var(--oif-blue-dark)] text-lg mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              Supprimer le bloc ERA :
            </p>
            <p className="text-sm font-semibold text-gray-800 mb-1">
              {aSupprimer.projet_nom}
            </p>
            <p className="text-xs text-gray-400 mb-6">
              {aSupprimer.ps_id} · {NIVEAU_OPTIONS.find(n => n.value === aSupprimer.niveau)?.label}
            </p>
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-6 border border-red-100">
              ⚠️ Cette action est irréversible. Le bloc sera définitivement supprimé de la base de données.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => supprimer(aSupprimer.id)}
                className="flex-1 bg-red-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-red-600 transition"
              >
                Oui, supprimer
              </button>
              <button
                onClick={() => setASupprimer(null)}
                className="flex-1 text-sm text-gray-500 bg-gray-100 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
