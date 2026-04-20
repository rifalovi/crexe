// ─── Vue lecteur — Résultats ERA d'un projet ─────────────────────────────────
// Affiche les résultats de l'enquête ERA pour un projet affecté au lecteur.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function LecteurResultatsEraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: projet } = await supabase
    .from('projets')
    .select('id, nom, code_officiel, programmes_strategiques(couleur_theme)')
    .eq('id', id)
    .single()

  const { data: era } = await supabase
    .from('era_resultats')
    .select('*')
    .eq('projet_id', id)
    .order('edition_annee', { ascending: false })

  const psRaw = projet?.programmes_strategiques
  const ps = Array.isArray(psRaw) ? psRaw[0] : psRaw
  const accent = (ps as { couleur_theme?: string } | null)?.couleur_theme || '#B83A2D'
  const eraActif = era?.[0] || null

  return (
    <div>
      {/* Fil d'Ariane */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/lecteur" className="hover:text-gray-600 transition">Mes projets</Link>
        <span>›</span>
        <Link href={`/lecteur/projets/${id}`} className="hover:text-gray-600 transition">{projet?.nom || id}</Link>
        <span>›</span>
        <span className="text-gray-600">Résultats ERA</span>
      </div>

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full text-white mb-3"
            style={{ backgroundColor: '#B83A2D' }}>
            Mesure ERA · {eraActif?.edition_annee || new Date().getFullYear()}
          </div>
          <h1 className="font-editorial text-2xl md:text-3xl font-semibold text-[var(--oif-blue-dark)]">
            Résultats de l&apos;enquête ERA
          </h1>
          <p className="text-gray-500 text-sm mt-1">{projet?.nom}</p>
        </div>
        {/* Sélecteur d'édition si plusieurs */}
        {era && era.length > 1 && (
          <div className="flex items-center gap-2">
            {era.map((e: Record<string, unknown>) => (
              <span key={e.id as number} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600">
                {e.edition_annee as number}
              </span>
            ))}
          </div>
        )}
      </div>

      {!eraActif ? (
        /* Pas encore de résultats */
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[#B83A2D]/8 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B83A2D" strokeWidth="1.5">
              <path strokeLinecap="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 mb-1">Résultats ERA non encore disponibles</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            Les résultats de l&apos;enquête ERA pour ce projet sont en cours de traitement.
            Ils seront publiés dès validation par l&apos;équipe SCS.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section Rappel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3"
              style={{ backgroundColor: '#B83A2D08' }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#B83A2D' }}>
                Section Rappel
              </span>
            </div>
            <div className="px-6 py-5 grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Objectif ERA</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {eraActif.objectif_era || <span className="text-gray-300 italic">Non renseigné</span>}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Méthodologie</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {eraActif.methodologie || <span className="text-gray-300 italic">Non renseignée</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Section Résultats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3"
              style={{ backgroundColor: '#B83A2D08' }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#B83A2D' }}>
                Section Résultats
              </span>
            </div>
            <div className="px-6 py-5">
              {/* KPIs enquête */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Population estimée", value: eraActif.population_estimee ? eraActif.population_estimee.toLocaleString('fr-FR') : '—' },
                  { label: "Échantillon prévu", value: eraActif.echantillon_prevu ? eraActif.echantillon_prevu.toLocaleString('fr-FR') : '—' },
                  { label: "Nombre de retours", value: eraActif.nombre_retours ? eraActif.nombre_retours.toLocaleString('fr-FR') : '—' },
                  { label: "Taux de complétion", value: eraActif.taux_completude ? `${eraActif.taux_completude} %` : '—' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-editorial font-bold text-[var(--oif-blue-dark)]">{kpi.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{kpi.label}</p>
                  </div>
                ))}
              </div>

              {/* Tableaux de résultats */}
              {eraActif.tableaux_resultats && Array.isArray(eraActif.tableaux_resultats) && eraActif.tableaux_resultats.length > 0 ? (
                <div className="space-y-6">
                  {(eraActif.tableaux_resultats as Array<Record<string, unknown>>).map((tableau, idx) => (
                    <div key={idx}>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        {String(tableau.titre || `Tableau ${idx + 1}`)}
                      </p>
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Libellé</th>
                              {(tableau.colonnes as string[])?.map((col: string) => (
                                <th key={col} className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {(tableau.lignes as Array<Record<string, unknown>>)?.map((ligne: Record<string, unknown>, i: number) => (
                              <tr key={i} className="hover:bg-gray-50/50">
                                <td className="px-4 py-2.5 text-gray-700">{String(ligne.libelle || '')}</td>
                                {(tableau.colonnes as string[])?.map((col: string) => (
                                  <td key={col} className="px-4 py-2.5 text-right text-gray-600">{String(ligne[col] ?? '—')}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-100 rounded-xl">
                  Les tableaux de résultats détaillés seront disponibles dès leur saisie par l&apos;équipe SCS.
                </div>
              )}

              {/* Analyse IA */}
              {eraActif.analyse_ia && (
                <div className="mt-6 bg-[var(--oif-blue-dark)] text-white rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.091z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/60">Analyse IA</span>
                  </div>
                  <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                    {eraActif.analyse_ia}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
