// ─── Programmes stratégiques ──────────────────────────────────────────────────
// Les 4 programmes stratégiques de l'OIF regroupent tous les projets CREXE.
// Cette page affiche leur structure et les projets rattachés à chacun.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

// Palette officielle v3 :
// PS1 = bleu institutionnel (#003DA5), PS2 = violet (#6B2C91), PS3 = vert (#0F6E56)
const PS_STYLES: Record<string, { bg: string; border: string; badge: string; dot: string }> = {
  PS1: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
  },
  PS2: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    badge: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-400',
  },
  PS3: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-400',
  },
}

async function getProgrammes() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: programmes } = await supabase
    .from('programmes_strategiques')
    .select('id, nom, description, ordre')
    .order('ordre')

  const { data: projets } = await supabase
    .from('projets')
    .select('id, nom, ps_id, taux_execution, budget_engage')
    .order('id')

  return { programmes: programmes ?? [], projets: projets ?? [] }
}

export default async function ProgrammesPage() {
  const { programmes, projets } = await getProgrammes()

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--oif-blue-dark)]">
            Programmes stratégiques
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Les 4 axes programmatiques de l&apos;OIF — CREXE 2025
          </p>
        </div>
      </div>

      {programmes.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm mb-2">Aucun programme stratégique en base</p>
          <p className="text-xs text-gray-300">
            Exécutez le seed initial dans Supabase SQL Editor (déjà inclus dans schema.sql)
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {programmes.map((ps) => {
            const style = PS_STYLES[ps.id] ?? PS_STYLES['PS1']
            const projetsDuPS = projets.filter((p) => p.ps_id === ps.id)
            const budgetTotal = projetsDuPS.reduce(
              (sum, p) => sum + (p.budget_engage ?? 0),
              0
            )

            return (
              <div
                key={ps.id}
                className={`rounded-xl border ${style.border} ${style.bg} p-6`}
              >
                {/* En-tête du programme */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${style.badge}`}
                    >
                      {ps.id}
                    </span>
                    <div>
                      <h2 className="font-semibold text-[var(--oif-blue-dark)] text-base">
                        {ps.nom}
                      </h2>
                      {ps.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{ps.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-semibold text-[var(--oif-blue-dark)]">
                      {projetsDuPS.length} projet{projetsDuPS.length !== 1 ? 's' : ''}
                    </p>
                    {budgetTotal > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {(budgetTotal / 1_000_000).toFixed(2)} M€ engagés
                      </p>
                    )}
                  </div>
                </div>

                {/* Liste des projets du programme */}
                {projetsDuPS.length > 0 ? (
                  <div className="space-y-2">
                    {projetsDuPS.map((projet) => (
                      <Link
                        key={projet.id}
                        href={`/admin/projets/${projet.id}`}
                        className="flex items-center justify-between bg-white/70 hover:bg-white rounded-lg px-4 py-2.5 transition group"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          <span className="text-xs font-mono text-gray-400">{projet.id}</span>
                          <span className="text-sm text-gray-700 group-hover:text-[var(--oif-blue-dark)]">
                            {projet.nom}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          {projet.taux_execution != null && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${style.dot} rounded-full`}
                                  style={{ width: `${projet.taux_execution}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400">
                                {projet.taux_execution}%
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-[var(--oif-blue)] opacity-0 group-hover:opacity-100 transition">
                            Éditer →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/50 rounded-lg px-4 py-3 text-center">
                    <p className="text-xs text-gray-400">Aucun projet dans ce programme</p>
                    <Link
                      href="/admin/projets/nouveau"
                      className="text-xs text-[var(--oif-blue)] hover:underline mt-1 inline-block"
                    >
                      + Ajouter un projet →
                    </Link>
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
