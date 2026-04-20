// ─── Page liste des projets publiés ─────────────────────────────────────────
// Route : /projets (+ ?ps=PS1|PS2|PS3 pour filtrer par programme)
// Server Component — lecture directe de Supabase via client SSR.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface Programme {
  id: string
  nom: string
  nom_court: string | null
  couleur_theme: string | null
  ordre: number | null
}

interface Projet {
  id: string
  code_officiel: string | null
  nom: string
  accroche: string | null
  ps_id: string | null
  taux_execution: number | null
  budget_engage: number | null
  nombre_pays: number | null
}

const PS_FALLBACK_COLOR: Record<string, string> = {
  PS1: '#003DA5',
  PS2: '#6B2C91',
  PS3: '#0F6E56',
}

function formatBudget(v: number | null): string | null {
  if (v == null) return null
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} M€`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)} k€`
  return `${v} €`
}

async function getData(psFilter: string | null) {
  const supabase = await createClient()

  const projetsQuery = supabase
    .from('projets')
    .select('id, code_officiel, nom, accroche, ps_id, taux_execution, budget_engage, nombre_pays')
    .eq('statut', 'publie')
    .order('id')

  if (psFilter) projetsQuery.eq('ps_id', psFilter)

  const [psRes, projetsRes] = await Promise.all([
    supabase
      .from('programmes_strategiques')
      .select('id, nom, nom_court, couleur_theme, ordre')
      .order('ordre', { ascending: true }),
    projetsQuery,
  ])

  return {
    programmes: (psRes.data ?? []) as Programme[],
    projets: (projetsRes.data ?? []) as Projet[],
  }
}

// ─── Composant pilule de filtre PS ───────────────────────────────────────────
function PSFilter({
  programmes,
  active,
  totalAll,
}: {
  programmes: Programme[]
  active: string | null
  totalAll: number
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par programme stratégique">
      <Link
        href="/projets"
        className={`text-xs font-medium px-3 py-1.5 rounded-full transition border ${
          active === null
            ? 'bg-[var(--oif-blue-dark)] text-white border-[var(--oif-blue-dark)]'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
        }`}
      >
        Tous {totalAll > 0 && <span className="opacity-60">· {totalAll}</span>}
      </Link>
      {programmes.map((ps) => {
        const color = ps.couleur_theme ?? PS_FALLBACK_COLOR[ps.id] ?? '#003DA5'
        const isActive = active === ps.id
        return (
          <Link
            key={ps.id}
            href={`/projets?ps=${ps.id}`}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition border"
            style={{
              backgroundColor: isActive ? color : '#ffffff',
              color: isActive ? '#ffffff' : color,
              borderColor: isActive ? color : `${color}55`,
            }}
          >
            {ps.id} · {ps.nom_court ?? ps.nom}
          </Link>
        )
      })}
    </div>
  )
}

// ─── Carte projet ────────────────────────────────────────────────────────────
function ProjetCard({ projet, color, psLabel }: { projet: Projet; color: string; psLabel?: string }) {
  const budget = formatBudget(projet.budget_engage)

  return (
    <Link
      href={`/projets/${projet.id}`}
      className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-xs font-mono font-medium px-2 py-1 rounded"
          style={{ backgroundColor: color + '20', color }}
        >
          {projet.code_officiel ?? projet.id}
        </span>
        {psLabel && (
          <span className="text-[10px] uppercase tracking-wider text-gray-400">
            {psLabel}
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold text-[var(--oif-blue-dark)] group-hover:text-[var(--oif-blue)] leading-snug mb-2">
        {projet.nom}
      </h3>

      {projet.accroche && (
        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {projet.accroche}
        </p>
      )}

      <div className="mt-auto grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-xs">
        {projet.nombre_pays != null && (
          <div>
            <p className="font-editorial text-lg font-semibold text-[var(--oif-blue-dark)]">
              {projet.nombre_pays}
            </p>
            <p className="text-gray-400">pays</p>
          </div>
        )}
        {budget && (
          <div>
            <p className="font-editorial text-lg font-semibold text-[var(--oif-blue-dark)]">
              {budget}
            </p>
            <p className="text-gray-400">engagé</p>
          </div>
        )}
        {projet.taux_execution != null && (
          <div>
            <p className="font-editorial text-lg font-semibold text-[var(--oif-blue-dark)]">
              {projet.taux_execution}%
            </p>
            <p className="text-gray-400">exécution</p>
          </div>
        )}
      </div>
    </Link>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function ProjetsListePage({
  searchParams,
}: {
  searchParams: Promise<{ ps?: string }>
}) {
  const sp = await searchParams
  const psParam = sp.ps ?? null
  const psFilter = psParam && ['PS1', 'PS2', 'PS3'].includes(psParam) ? psParam : null

  const { programmes, projets } = await getData(psFilter)

  // Nom court du PS filtré, pour l'affichage du titre.
  const psFiltered = psFilter
    ? programmes.find((p) => p.id === psFilter)
    : null

  return (
    <div>
      {/* ─── En-tête ──────────────────────────────────────────────────── */}
      <section className="bg-[var(--oif-cream)] border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold text-[var(--oif-blue)] uppercase tracking-widest mb-2">
            Catalogue public
          </p>
          <h1 className="font-editorial text-3xl md:text-5xl font-semibold text-[var(--oif-blue-dark)] mb-3">
            {psFiltered ? psFiltered.nom : 'Projets publiés'}
          </h1>
          <p className="text-gray-500 max-w-2xl mb-8">
            {psFiltered
              ? `Projets du programme stratégique ${psFiltered.id} — ${psFiltered.nom_court ?? psFiltered.nom}.`
              : "Tous les projets dont les données CREXE 2025 ont été validées et publiées sur la plateforme."}
          </p>

          <PSFilter
            programmes={programmes}
            active={psFilter}
            totalAll={projets.length}
          />
        </div>
      </section>

      {/* ─── Grille des projets ────────────────────────────────────────── */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {projets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projets.map((p) => {
                const psId = p.ps_id ?? 'PS1'
                const ps = programmes.find((x) => x.id === psId)
                const color =
                  ps?.couleur_theme ?? PS_FALLBACK_COLOR[psId] ?? '#003DA5'
                return (
                  <ProjetCard
                    key={p.id}
                    projet={p}
                    color={color}
                    psLabel={psFilter ? undefined : (ps?.nom_court ?? ps?.id)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="bg-[var(--oif-neutral)] rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 text-2xl">
                📂
              </div>
              <p className="font-semibold text-[var(--oif-blue-dark)] mb-2">
                {psFilter
                  ? `Aucun projet publié dans ${psFilter} pour le moment`
                  : 'Aucun projet publié pour le moment'}
              </p>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Les fiches sont publiées progressivement après validation
                éditoriale.
              </p>
              {psFilter && (
                <Link
                  href="/projets"
                  className="inline-block mt-4 text-sm text-[var(--oif-blue)] hover:underline"
                >
                  Voir tous les projets →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
