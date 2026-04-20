// ─── Liste des projets — Back-office ─────────────────────────────────────────
// Server Component : les données sont chargées côté serveur avant rendu.
// Chaque projet affiché est cliquable et mène à la page d'édition.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

async function getProjets() {
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

  const { data, error } = await supabase
    .from('projets')
    .select(`
      id,
      nom,
      accroche,
      annee_exercice,
      taux_execution,
      nombre_pays,
      budget_engage,
      ps_id,
      statut,
      programmes_strategiques (nom)
    `)
    .order('id')

  if (error) console.error('Erreur chargement projets:', error)
  return data ?? []
}

// Couleurs par programme stratégique
const PS_COLORS: Record<string, string> = {
  PS1: 'bg-blue-100 text-blue-700',
  PS2: 'bg-purple-100 text-purple-700',
  PS3: 'bg-emerald-100 text-emerald-700',
}

// Badge de statut de publication
const STATUT_BADGES: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-500',
  en_revue:  'bg-amber-100 text-amber-700',
  publie:    'bg-emerald-100 text-emerald-700',
  archive:   'bg-red-100 text-red-500',
}
const STATUT_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  en_revue:  'En révision',
  publie:    'Publié',
  archive:   'Archivé',
}

export default async function ProjetsListPage() {
  const projets = await getProjets()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--oif-blue-dark)]">Projets</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {projets.length} projet{projets.length > 1 ? 's' : ''} — CREXE 2025
          </p>
        </div>
        <Link
          href="/admin/projets/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--oif-blue)] text-white text-sm font-medium rounded-lg hover:bg-[var(--oif-blue-dark)] transition"
        >
          + Nouveau projet
        </Link>
      </div>

      {/* Tableau */}
      {projets.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  ID
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nom du projet
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Programme
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Pays
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Exécution
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Statut
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projets.map((projet) => {
                // Gestion du champ programmes_strategiques (relation)
                const ps = Array.isArray(projet.programmes_strategiques)
                  ? projet.programmes_strategiques[0]
                  : projet.programmes_strategiques

                return (
                  <tr key={projet.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-[var(--oif-neutral)] text-[var(--oif-blue)] px-2 py-1 rounded">
                        {projet.id}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{projet.nom}</p>
                      {projet.accroche && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {projet.accroche}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {projet.ps_id && (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PS_COLORS[projet.ps_id] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {projet.ps_id}
                          {ps && ` — ${ps.nom?.substring(0, 20)}…`}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {projet.nombre_pays ? `${projet.nombre_pays} pays` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      {projet.taux_execution != null ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                            <div
                              className="h-full bg-[var(--oif-blue)] rounded-full"
                              style={{ width: `${projet.taux_execution}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {projet.taux_execution}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {projet.statut && (
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${STATUT_BADGES[projet.statut] ?? 'bg-gray-100 text-gray-500'}`}>
                          {STATUT_LABELS[projet.statut] ?? projet.statut}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/projets/${projet.id}`}
                          target="_blank"
                          className="text-xs text-gray-400 hover:text-gray-600 transition"
                        >
                          ↗
                        </Link>
                        <Link
                          href={`/admin/projets/${projet.id}/edit`}
                          className="text-xs text-[var(--oif-blue)] hover:underline font-medium"
                        >
                          Éditer →
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 border-dashed p-12 text-center">
          <p className="text-4xl mb-4">◉</p>
          <p className="font-semibold text-gray-700 mb-1">Aucun projet</p>
          <p className="text-sm text-gray-400 mb-6">
            Importez un fichier DOCX ou PDF pour créer votre premier projet
          </p>
          <Link
            href="/admin/projets/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--oif-blue)] text-white text-sm rounded-lg hover:bg-[var(--oif-blue-dark)] transition"
          >
            + Créer un projet
          </Link>
        </div>
      )}
    </div>
  )
}
