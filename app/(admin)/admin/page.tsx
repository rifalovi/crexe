// ─── Tableau de bord administrateur ──────────────────────────────────────────
// Server Component — toutes les données sont chargées côté serveur.
// L'utilisateur voit les statistiques globales dès le premier rendu,
// sans attendre de fetch côté client.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

async function getStats() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const [projetsRes, psRes, indicateursRes, temoignagesRes] = await Promise.all([
    supabase.from('projets').select('id, nom, taux_execution', { count: 'exact' }),
    supabase.from('programmes_strategiques').select('id, nom', { count: 'exact' }),
    supabase.from('indicateurs').select('id', { count: 'exact' }),
    supabase.from('temoignages').select('id', { count: 'exact' }),
  ])

  return {
    projets: projetsRes.data ?? [],
    nbProjets: projetsRes.count ?? 0,
    nbPS: psRes.count ?? 0,
    nbIndicateurs: indicateursRes.count ?? 0,
    nbTemoignages: temoignagesRes.count ?? 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const kpis = [
    {
      label: 'Projets',
      value: stats.nbProjets,
      icon: '◉',
      href: '/admin/projets',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Programmes stratégiques',
      value: stats.nbPS,
      icon: '◆',
      href: '/admin/programmes',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Indicateurs',
      value: stats.nbIndicateurs,
      icon: '◈',
      href: '/admin/projets',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Témoignages',
      value: stats.nbTemoignages,
      icon: '❝',
      href: '/admin/projets',
      color: 'bg-emerald-50 text-emerald-600',
    },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--oif-blue-dark)]">
          Tableau de bord
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Vue d&apos;ensemble de la plateforme CREXE 2025
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition group"
          >
            <div
              className={`w-10 h-10 rounded-lg ${kpi.color} flex items-center justify-center text-lg mb-3`}
            >
              {kpi.icon}
            </div>
            <p className="text-3xl font-bold text-[var(--oif-blue-dark)]">
              {kpi.value}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
          </Link>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/projets/nouveau"
          className="flex items-center gap-4 bg-[var(--oif-blue)] text-white rounded-xl p-5 hover:bg-[var(--oif-blue-dark)] transition"
        >
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl">
            +
          </div>
          <div>
            <p className="font-semibold">Nouveau projet</p>
            <p className="text-white/70 text-xs mt-0.5">
              Importer depuis un fichier DOCX / PDF
            </p>
          </div>
        </Link>

        <Link
          href="/admin/projets"
          className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--oif-neutral)] flex items-center justify-center text-xl">
            ◉
          </div>
          <div>
            <p className="font-semibold text-[var(--oif-blue-dark)]">Gérer les projets</p>
            <p className="text-gray-400 text-xs mt-0.5">Éditer, archiver, réorganiser</p>
          </div>
        </Link>

        <Link
          href="/admin/utilisateurs"
          className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--oif-neutral)] flex items-center justify-center text-xl">
            ◎
          </div>
          <div>
            <p className="font-semibold text-[var(--oif-blue-dark)]">Utilisateurs</p>
            <p className="text-gray-400 text-xs mt-0.5">Rôles, accès, invitations</p>
          </div>
        </Link>
      </div>

      {/* Liste récente des projets */}
      {stats.projets.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-[var(--oif-blue-dark)] text-sm">
              Projets récents
            </h2>
            <Link
              href="/admin/projets"
              className="text-xs text-[var(--oif-blue)] hover:underline"
            >
              Voir tous →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.projets.slice(0, 5).map((projet) => (
              <Link
                key={projet.id}
                href={`/admin/projets/${projet.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-[var(--oif-neutral)] text-[var(--oif-blue)] px-2 py-0.5 rounded">
                    {projet.id}
                  </span>
                  <span className="text-sm text-gray-700">{projet.nom}</span>
                </div>
                {projet.taux_execution != null && (
                  <span className="text-xs text-gray-400">
                    {projet.taux_execution}% exécuté
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* État vide si aucun projet */}
      {stats.projets.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 border-dashed p-12 text-center">
          <p className="text-4xl mb-4">◉</p>
          <p className="font-semibold text-gray-700 mb-1">Aucun projet pour l&apos;instant</p>
          <p className="text-sm text-gray-400 mb-6">
            Commencez par importer un fichier DOCX ou PDF du CREXE
          </p>
          <Link
            href="/admin/projets/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--oif-blue)] text-white text-sm rounded-lg hover:bg-[var(--oif-blue-dark)] transition"
          >
            + Créer un premier projet
          </Link>
        </div>
      )}
    </div>
  )
}
