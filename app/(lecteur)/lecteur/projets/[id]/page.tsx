// ─── Vue lecteur — Fiche CREX projet ─────────────────────────────────────────
// Affiche les données CREXE d'un projet affecté au lecteur connecté.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function LecteurProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: projet } = await supabase
    .from('projets')
    .select(`
      id, nom, code_officiel, description, statut,
      budget_total, budget_execute, taux_execution,
      programmes_strategiques(titre, couleur_theme),
      pays_couverture(pays(nom, code_iso2))
    `)
    .eq('id', id)
    .single()

  if (!projet) notFound()

  const psRaw = projet.programmes_strategiques
  const ps = Array.isArray(psRaw) ? psRaw[0] : psRaw
  const accent = (ps as { couleur_theme?: string } | null)?.couleur_theme || '#003DA5'

  return (
    <div>
      {/* Fil d'Ariane */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/lecteur" className="hover:text-gray-600 transition">Mes projets</Link>
        <span>›</span>
        <span className="text-gray-600">{projet.nom}</span>
      </div>

      {/* En-tête projet */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="h-1.5" style={{ backgroundColor: accent }} />
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-white px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: accent }}>
                  {projet.code_officiel}
                </span>
                <span className="text-xs text-gray-400">
                  {(ps as { titre?: string } | null)?.titre}
                </span>
              </div>
              <h1 className="font-editorial text-2xl font-semibold text-[var(--oif-blue-dark)]">
                {projet.nom}
              </h1>
            </div>
            <Link
              href={`/lecteur/resultats-era/${id}`}
              className="flex-shrink-0 text-sm font-medium px-4 py-2 rounded-lg text-white transition"
              style={{ backgroundColor: '#B83A2D' }}
            >
              Résultats ERA →
            </Link>
          </div>

          {projet.description && (
            <p className="text-gray-600 text-sm leading-relaxed mt-4 max-w-3xl">
              {projet.description}
            </p>
          )}
        </div>
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Budget total', value: projet.budget_total ? `${Number(projet.budget_total).toLocaleString('fr-FR')} €` : '—' },
          { label: 'Exécuté', value: projet.budget_execute ? `${Number(projet.budget_execute).toLocaleString('fr-FR')} €` : '—' },
          { label: "Taux d'exécution", value: projet.taux_execution ? `${projet.taux_execution} %` : '—' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-400 mb-1">{m.label}</p>
            <p className="text-xl font-editorial font-bold text-[var(--oif-blue-dark)]">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Message pour données non encore disponibles */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-5 flex items-start gap-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C07A10" strokeWidth="2" className="flex-shrink-0 mt-0.5">
          <path strokeLinecap="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-800">Données CREX en cours de chargement</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Les indicateurs, témoignages et chaîne des résultats seront disponibles ici dès
            la publication complète de la fiche projet par l&apos;équipe SCS.
          </p>
        </div>
      </div>

      {/* Voir la fiche complète publique */}
      <div className="mt-6 text-center">
        <Link href={`/projets/${id}`} className="text-xs text-gray-400 hover:text-[var(--oif-blue)] transition underline-offset-2 hover:underline">
          Voir la fiche projet publique complète →
        </Link>
      </div>
    </div>
  )
}
