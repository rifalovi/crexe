// ─── Projets par Programme Stratégique ───────────────────────────────────────
// Route : /admin/projets?edition=2025
//
// Concept pédagogique — Server Component avec searchParams :
// Les searchParams (paramètres GET de l'URL) sont accessibles directement dans
// les Page Server Components via la prop `searchParams`. On les utilise pour
// filtrer les projets par édition sans JavaScript côté client.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { CREX_ANNEE } from '@/lib/constants'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Projet {
  id: string
  nom: string
  accroche: string | null
  ps_id: string | null
  taux_execution: number | null
  nombre_pays: number | null
  statut: string
  code_officiel: string | null
  annee_exercice: number | null
}

// ─── Config PS ────────────────────────────────────────────────────────────────
const PS_CONFIG = {
  PS1: { couleur: '#003DA5', bg: '#EBF0FA', border: '#C7D5F5', nom: 'Langue, cultures et éducation', icon: '📚' },
  PS2: { couleur: '#6B2C91', bg: '#F3EAF9', border: '#DEC5EE', nom: 'Démocratie et gouvernance',     icon: '⚖️' },
  PS3: { couleur: '#0F6E56', bg: '#E6F4F1', border: '#B3DDD7', nom: 'Développement durable',          icon: '🌿' },
} as const

const STATUT_BADGES: Record<string, { label: string; css: string }> = {
  brouillon: { label: 'Brouillon',   css: 'bg-gray-100 text-gray-500' },
  en_revue:  { label: 'En révision', css: 'bg-amber-100 text-amber-700' },
  publie:    { label: 'Publié',      css: 'bg-emerald-100 text-emerald-700' },
  archive:   { label: 'Archivé',    css: 'bg-red-100 text-red-500' },
}

// ─── Chargement des données ───────────────────────────────────────────────────
async function getProjetsParEdition(edition: number): Promise<Projet[]> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data, error } = await supabase
    .from('projets')
    .select('id, nom, accroche, ps_id, taux_execution, nombre_pays, statut, code_officiel, annee_exercice')
    .eq('annee_exercice', edition)
    .order('id')

  if (error) console.error('Erreur projets:', error)
  return (data ?? []) as Projet[]
}

// ─── Composant carte projet ───────────────────────────────────────────────────
function CarteProjet({ projet, psColor }: { projet: Projet; psColor: string }) {
  const badge = STATUT_BADGES[projet.statut] ?? { label: projet.statut, css: 'bg-gray-100 text-gray-500' }
  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition group">
      <div className="px-4 py-4 flex items-start gap-3">
        {/* Code */}
        <span
          className="mt-0.5 text-xs font-mono font-bold px-2 py-0.5 rounded flex-shrink-0"
          style={{ backgroundColor: psColor + '15', color: psColor }}
        >
          {projet.code_officiel ?? projet.id}
        </span>

        {/* Nom + accroche */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm leading-snug">{projet.nom}</p>
          {projet.accroche && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{projet.accroche}</p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.css}`}>
              {badge.label}
            </span>
            {projet.nombre_pays && (
              <span className="text-[10px] text-gray-400">{projet.nombre_pays} pays</span>
            )}
            {projet.taux_execution != null && (
              <span className="text-[10px] text-gray-500 font-medium">{projet.taux_execution}% exéc.</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <Link
            href={`/admin/projets/${projet.id}/edit`}
            className="text-[11px] font-semibold text-white px-2.5 py-1 rounded-lg transition"
            style={{ backgroundColor: psColor }}
          >
            Éditer
          </Link>
          <Link
            href={`/projets/${projet.id}`}
            target="_blank"
            className="text-[11px] text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg border border-gray-200 transition"
          >
            ↗
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default async function ProjetsListPage({
  searchParams,
}: {
  searchParams: Promise<{ edition?: string }>
}) {
  const params = await searchParams
  const edition = parseInt(params.edition ?? String(CREX_ANNEE)) || CREX_ANNEE

  const projets = await getProjetsParEdition(edition)

  // Grouper par PS
  const parPS: Record<string, Projet[]> = { PS1: [], PS2: [], PS3: [], autre: [] }
  for (const p of projets) {
    const key = p.ps_id && p.ps_id in parPS ? p.ps_id : 'autre'
    parPS[key].push(p)
  }

  const totalProjets   = projets.length
  const nbPublies      = projets.filter(p => p.statut === 'publie').length
  const nbBrouillons   = projets.filter(p => p.statut === 'brouillon').length

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* ── En-tête ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin/editions"
              className="text-sm text-gray-400 hover:text-[var(--oif-blue)] transition"
            >
              ← Éditions CREXE
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[var(--oif-blue-dark)]">
            Projets — CREXE {edition}
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-gray-500">
              {totalProjets} projet{totalProjets > 1 ? 's' : ''} au total
            </span>
            <span className="text-sm text-emerald-600 font-medium">{nbPublies} publiés</span>
            <span className="text-sm text-gray-400">{nbBrouillons} brouillons</span>
          </div>
        </div>
        <Link
          href="/admin/projets/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--oif-blue)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--oif-blue-dark)] transition"
        >
          + Nouveau projet
        </Link>
      </div>

      {/* ── Filtres par édition (liens rapides) ───────────────────────────── */}
      <div className="flex gap-2 mb-8">
        {[2025, 2024].map(yr => (
          <Link
            key={yr}
            href={`/admin/projets?edition=${yr}`}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
              edition === yr
                ? 'bg-[var(--oif-blue)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            CREXE {yr}
          </Link>
        ))}
      </div>

      {/* ── Sections par Programme Stratégique ────────────────────────────── */}
      {(['PS1', 'PS2', 'PS3'] as const).map(ps => {
        const cfg = PS_CONFIG[ps]
        const projetsPS = parPS[ps] ?? []

        return (
          <section key={ps} className="mb-10">
            {/* En-tête PS */}
            <div
              className="rounded-2xl px-5 py-4 mb-4 flex items-center justify-between border"
              style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{cfg.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ backgroundColor: cfg.couleur + '20', color: cfg.couleur }}
                    >
                      {ps}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: cfg.couleur }}>
                      {cfg.nom}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {projetsPS.length} projet{projetsPS.length !== 1 ? 's' : ''} dans cette édition
                  </p>
                </div>
              </div>
              <Link
                href={`/admin/projets/nouveau?ps=${ps}&edition=${edition}`}
                className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition"
                style={{ backgroundColor: cfg.couleur }}
              >
                + Ajouter un projet
              </Link>
            </div>

            {/* Liste projets */}
            {projetsPS.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                Aucun projet dans {ps} pour CREXE {edition}.{' '}
                <Link
                  href={`/admin/projets/nouveau?ps=${ps}&edition=${edition}`}
                  className="text-[var(--oif-blue)] hover:underline"
                >
                  Ajouter le premier →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {projetsPS.map(projet => (
                  <CarteProjet key={projet.id} projet={projet} psColor={cfg.couleur} />
                ))}
              </div>
            )}
          </section>
        )
      })}

      {/* ── Projets sans PS ───────────────────────────────────────────────── */}
      {parPS.autre.length > 0 && (
        <section className="mb-10">
          <div className="rounded-2xl px-5 py-4 mb-4 bg-gray-50 border border-gray-200 flex items-center gap-3">
            <span className="text-xl">📁</span>
            <div>
              <p className="text-sm font-semibold text-gray-700">Sans programme stratégique</p>
              <p className="text-xs text-gray-500">{parPS.autre.length} projet(s) à classer</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {parPS.autre.map(projet => (
              <CarteProjet key={projet.id} projet={projet} psColor="#6B7280" />
            ))}
          </div>
        </section>
      )}

      {totalProjets === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">Aucun projet pour CREXE {edition}</p>
          <Link href="/admin/projets/nouveau" className="text-[var(--oif-blue)] hover:underline text-sm">
            Créer le premier projet →
          </Link>
        </div>
      )}
    </div>
  )
}
