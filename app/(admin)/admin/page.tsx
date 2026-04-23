// ─── Tableau de bord administrateur — redesign ────────────────────────────────
// Server Component — données chargées côté serveur, rendu immédiat.
// Design : cartes métriques avec barres visuelles, répartition par PS,
// liste projets récents enrichie, accès rapide aux éditions.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getEditionActive } from '@/lib/edition-context'

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProjetRow {
  id: string
  nom: string
  ps_id: string | null
  taux_execution: number | null
  statut: string | null
  annee_exercice: number | null
  budget_modifie: number | null
  budget_engage: number | null
}

// ─── Palette PS ───────────────────────────────────────────────────────────────
const PS_COLOR: Record<string, { bg: string; text: string; bar: string }> = {
  PS1: { bg: '#EBF0FA', text: '#003DA5', bar: '#003DA5' },
  PS2: { bg: '#F3EAF9', text: '#6B2C91', bar: '#6B2C91' },
  PS3: { bg: '#E6F4F1', text: '#0F6E56', bar: '#0F6E56' },
}

// ─── Chargement données ───────────────────────────────────────────────────────
async function getStats(edition: number) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const [projetsRes, indicateursRes, temoignagesRes, psRes] = await Promise.all([
    supabase.from('projets').select('id, nom, ps_id, taux_execution, statut, annee_exercice, budget_modifie, budget_engage'),
    supabase.from('indicateurs').select('id', { count: 'exact' }),
    supabase.from('temoignages').select('id', { count: 'exact' }),
    supabase.from('programmes_strategiques').select('id, nom'),
  ])

  const allProjets: ProjetRow[] = (projetsRes.data ?? []) as ProjetRow[]
  const projetsEdition = allProjets.filter(p => p.annee_exercice === edition)
  const nbPublies      = projetsEdition.filter(p => p.statut === 'publie').length
  const nbBrouillons   = projetsEdition.filter(p => p.statut === 'brouillon').length
  const nbEnRevue      = projetsEdition.filter(p => p.statut === 'en_revue').length

  const budgetTotal    = projetsEdition.reduce((s, p) => s + (p.budget_modifie ?? 0), 0)
  const budgetEngage   = projetsEdition.reduce((s, p) => s + (p.budget_engage ?? 0), 0)
  const tauxMoyen      = projetsEdition.filter(p => p.taux_execution != null)
  const tauxMoyenVal   = tauxMoyen.length > 0
    ? Math.round(tauxMoyen.reduce((s, p) => s + (p.taux_execution ?? 0), 0) / tauxMoyen.length)
    : null

  // Répartition par PS
  const parPS: Record<string, number> = { PS1: 0, PS2: 0, PS3: 0 }
  projetsEdition.forEach(p => { if (p.ps_id && p.ps_id in parPS) parPS[p.ps_id]++ })

  return {
    projets: projetsEdition,
    allProjets,
    nbProjets: projetsEdition.length,
    nbPublies, nbBrouillons, nbEnRevue,
    nbIndicateurs: indicateursRes.count ?? 0,
    nbTemoignages: temoignagesRes.count ?? 0,
    budgetTotal, budgetEngage, tauxMoyenVal, parPS,
    nbPS: psRes.count ?? 0,
  }
}

function formatBudget(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' M€'
  if (n >= 1000) return (n / 1000).toFixed(0) + ' K€'
  return n + ' €'
}

const STATUT_DOT: Record<string, string> = {
  publie:    'bg-emerald-500',
  en_revue:  'bg-amber-400',
  brouillon: 'bg-gray-300',
  archive:   'bg-red-400',
}
const STATUT_LABEL: Record<string, string> = {
  publie: 'Publié', en_revue: 'En révision', brouillon: 'Brouillon', archive: 'Archivé',
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default async function AdminDashboard() {
  const edition = await getEditionActive()
  const stats = await getStats(edition)

  const publisPct = stats.nbProjets > 0 ? Math.round((stats.nbPublies / stats.nbProjets) * 100) : 0

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* ── En-tête ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--oif-blue-dark)]">Tableau de bord</h1>
          <p className="text-gray-400 mt-1 text-sm">CREXE {edition} — {stats.nbProjets} projets chargés</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/editions"
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            Gérer les éditions →
          </Link>
          <Link href="/admin/projets/nouveau"
            className="px-4 py-2 text-sm font-semibold text-white bg-[var(--oif-blue)] rounded-xl hover:bg-[var(--oif-blue-dark)] transition">
            + Nouveau projet
          </Link>
        </div>
      </div>

      {/* ── Métriques principales ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Projets publiés */}
        <div className="bg-[var(--oif-blue-dark)] rounded-2xl p-5 text-white">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">Projets publiés</p>
          <p className="text-4xl font-bold mb-1">{stats.nbPublies}</p>
          <p className="text-white/50 text-xs mb-3">sur {stats.nbProjets} dans CREXE {edition}</p>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--oif-gold)] rounded-full transition-all" style={{ width: `${publisPct}%` }} />
          </div>
          <p className="text-white/50 text-xs mt-1">{publisPct}% publiés</p>
        </div>

        {/* Taux d'exécution moyen */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">Taux d&apos;exécution</p>
          <p className="text-4xl font-bold text-[var(--oif-blue)]">
            {stats.tauxMoyenVal != null ? `${stats.tauxMoyenVal}%` : '—'}
          </p>
          <p className="text-gray-400 text-xs mt-1 mb-3">Moyenne CREXE {edition}</p>
          {stats.tauxMoyenVal != null && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--oif-blue)] rounded-full" style={{ width: `${stats.tauxMoyenVal}%` }} />
            </div>
          )}
        </div>

        {/* Budget engagé */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">Budget engagé</p>
          <p className="text-3xl font-bold text-[var(--oif-gold)]">{formatBudget(stats.budgetEngage)}</p>
          <p className="text-gray-400 text-xs mt-1 mb-3">sur {formatBudget(stats.budgetTotal)} alloués</p>
          {stats.budgetTotal > 0 && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--oif-gold)] rounded-full"
                style={{ width: `${Math.min(100, Math.round((stats.budgetEngage / stats.budgetTotal) * 100))}%` }} />
            </div>
          )}
        </div>

        {/* Indicateurs + Témoignages */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Indicateurs</p>
            <p className="text-3xl font-bold text-[var(--oif-blue-dark)]">{stats.nbIndicateurs}</p>
          </div>
          <div className="border-t border-gray-50 pt-3">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Témoignages</p>
            <p className="text-3xl font-bold text-[var(--oif-blue-dark)]">{stats.nbTemoignages}</p>
          </div>
        </div>
      </div>

      {/* ── Répartition PS + Statuts ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Répartition par Programme Stratégique */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Répartition par Programme Stratégique</h2>
          <div className="space-y-4">
            {(['PS1', 'PS2', 'PS3'] as const).map(ps => {
              const n    = stats.parPS[ps] ?? 0
              const pct  = stats.nbProjets > 0 ? Math.round((n / stats.nbProjets) * 100) : 0
              const cfg  = PS_COLOR[ps]
              return (
                <div key={ps}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: cfg.bg, color: cfg.text }}>{ps}</span>
                      <span className="text-xs text-gray-500">{n} projet{n !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: cfg.text }}>{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.bar }} />
                  </div>
                </div>
              )
            })}
          </div>
          <Link href="/admin/editions" className="inline-block mt-4 text-xs text-[var(--oif-blue)] hover:underline">
            Gérer les projets par édition →
          </Link>
        </div>

        {/* Statuts de publication */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Statuts de publication — CREXE {edition}</h2>
          <div className="space-y-3">
            {[
              { key: 'publie',    count: stats.nbPublies,    label: 'Publiés — visibles sur le site public' },
              { key: 'en_revue',  count: stats.nbEnRevue,    label: 'En révision — relecture en cours' },
              { key: 'brouillon', count: stats.nbBrouillons, label: 'Brouillons — non visibles' },
            ].map(({ key, count, label }) => (
              <div key={key} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUT_DOT[key]}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{label}</span>
                    <span className="text-xs font-bold text-gray-800">{count}</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${stats.nbProjets > 0 ? Math.round((count / stats.nbProjets) * 100) : 0}%`,
                      backgroundColor: key === 'publie' ? '#10b981' : key === 'en_revue' ? '#f59e0b' : '#d1d5db'
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Accès rapides ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/editions',   icon: '◑', label: 'Éditions CREXE',   desc: 'Gérer 2024, 2025, créer 2026…',  bg: 'bg-[var(--oif-blue)]',  text: 'text-white' },
          { href: '/admin/era',        icon: '📊', label: 'Résultats ERA',    desc: 'Données enquêtes bénéficiaires', bg: 'bg-[#0F6E56]',           text: 'text-white' },
          { href: '/admin/utilisateurs', icon: '◎', label: 'Utilisateurs',  desc: 'Créer comptes, gérer accès',     bg: 'bg-white border border-gray-100', text: 'text-[var(--oif-blue-dark)]' },
        ].map(({ href, icon, label, desc, bg, text }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-4 ${bg} rounded-2xl p-5 hover:opacity-90 transition group`}>
            <span className="text-2xl">{icon}</span>
            <div>
              <p className={`font-semibold text-sm ${text}`}>{label}</p>
              <p className={`text-xs mt-0.5 ${text} opacity-60`}>{desc}</p>
            </div>
            <span className={`ml-auto text-lg opacity-30 group-hover:opacity-60 transition ${text}`}>→</span>
          </Link>
        ))}
      </div>

      {/* ── Projets récents enrichis ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-[var(--oif-blue-dark)] text-sm">
            Projets — CREXE {edition}
          </h2>
          <Link href="/admin/editions" className="text-xs text-[var(--oif-blue)] hover:underline">
            Voir tous par PS →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.projets.slice(0, 8).map(projet => {
            const cfg = PS_COLOR[projet.ps_id ?? ''] ?? { bg: '#F3F4F6', text: '#6B7280', bar: '#9CA3AF' }
            const badge = STATUT_LABEL[projet.statut ?? 'brouillon']
            const dot   = STATUT_DOT[projet.statut ?? 'brouillon']
            return (
              <Link key={projet.id} href={`/admin/projets/${projet.id}/edit`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition group">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded flex-shrink-0"
                  style={{ backgroundColor: cfg.bg, color: cfg.text }}>
                  {projet.id}
                </span>
                <span className="flex-1 text-sm text-gray-700 group-hover:text-[var(--oif-blue)] transition truncate">
                  {projet.nom}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {projet.taux_execution != null && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${projet.taux_execution}%`, backgroundColor: cfg.bar }} />
                      </div>
                      <span className="text-xs text-gray-400">{projet.taux_execution}%</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${dot}`} />
                    <span className="text-xs text-gray-400">{badge}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
