// ─── Landing page publique CREXE ─────────────────────────────────────────────
// Server Component — données chargées côté serveur à chaque requête.
//
// Concept clé : pourquoi Server Component ici ?
// - Pas de 'use client' → Next.js exécute ce fichier sur le serveur
// - Les requêtes Supabase s'exécutent avant que le HTML soit envoyé au navigateur
// - Résultat : le visiteur voit les données immédiatement, sans spinner
// - Avantage SEO : Google indexe le contenu complet dès le premier rendu
// ─────────────────────────────────────────────────────────────────────────────

// IMPORTANT : pas de revalidate ici — cette page utilise cookies() pour détecter
// l'édition active (CREXE 2024 vs 2025). ISR rendrait le cookie inopérant :
// tous les visiteurs verraient la même édition en cache. La page doit rester DYNAMIC.
export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'
import ChatWidget from '@/components/chat/ChatWidget'
import EditionBanner, { type EditionInfo } from '@/components/shared/EditionBanner'
import HeroCarousel from '@/components/shared/HeroCarousel'
import EraHomepageBlock from '@/components/shared/EraHomepageBlock'
import { COOKIE_EDITION } from '@/lib/edition-context'
import { CREX_ANNEE } from '@/lib/constants'

export const metadata: Metadata = {
  title: `CREXE ${CREX_ANNEE} — Plateforme de valorisation des projets OIF`,
  description: `Explorez les projets, indicateurs d'impact et résultats ERA de l'Organisation internationale de la Francophonie — Compte-Rendu d'Exécution ${CREX_ANNEE}.`,
  openGraph: {
    title: `CREXE ${CREX_ANNEE} — Projets OIF`,
    description: `Données d'impact, résultats ERA et fiches projets de la Francophonie.`,
    type: 'website',
  },
}

// ─── Palette PS ───────────────────────────────────────────────────────────────
const PS_PALETTE: Record<string, { bg: string; text: string; border: string; accent: string; icon: string }> = {
  PS1: { bg: '#EBF0FA', text: '#003DA5', border: '#C7D5F5', accent: '#003DA5', icon: '📚' },
  PS2: { bg: '#F3EAF9', text: '#6B2C91', border: '#DEC5EE', accent: '#6B2C91', icon: '⚖️' },
  PS3: { bg: '#E6F4F1', text: '#0F6E56', border: '#B3DDD7', accent: '#0F6E56', icon: '🌿' },
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Programme {
  id: string
  nom: string
  nom_court: string | null
  description: string | null
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
  statut: string | null
  nombre_pays: number | null
  annee_exercice: number | null
}

interface EditionRow {
  annee: number
  libelle: string
  statut: string
}

// ─── Lecture de l'édition active depuis le cookie ─────────────────────────────
async function getEditionActivePage(): Promise<number> {
  try {
    const cookieStore = await cookies()
    const val = cookieStore.get(COOKIE_EDITION)?.value
    if (val) {
      const parsed = parseInt(val, 10)
      if (!isNaN(parsed) && parsed >= 2024) return parsed
    }
  } catch { /* hors contexte request (build statique) */ }
  return CREX_ANNEE
}

// ─── Chargement des données ───────────────────────────────────────────────────
async function getData(editionActive: number) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Concept performance : 4 requêtes en PARALLÈLE via Promise.all
  // Aucune n'attend la fin d'une autre — temps total ≈ requête la plus lente (~150ms)
  // Au lieu de 4 requêtes séquentielles (~600ms)
  const [psRes, projetsRes, editionsRes, statsRes] = await Promise.all([
    // Programmes stratégiques
    supabase
      .from('programmes_strategiques')
      .select('id, nom, nom_court, description, couleur_theme, ordre')
      .order('ordre', { ascending: true }),

    // Projets de l'édition active uniquement
    supabase
      .from('projets')
      .select('id, code_officiel, nom, accroche, ps_id, taux_execution, budget_engage, statut, nombre_pays, annee_exercice')
      .eq('statut', 'publie')
      .eq('annee_exercice', editionActive)
      .order('code_officiel'),

    // Toutes les éditions disponibles (pour la bannière)
    supabase
      .from('crex_editions')
      .select('annee, libelle, statut')
      .order('annee', { ascending: true }),

    // Stats toutes éditions (bannière) — fusionnée dans le Promise.all, plus de requête séquentielle
    supabase
      .from('projets')
      .select('annee_exercice, budget_engage, taux_execution')
      .eq('statut', 'publie'),
  ])

  const programmes: Programme[] = psRes.data ?? []
  const projetsPublies: Projet[] = projetsRes.data ?? []
  const editionsRows: EditionRow[] = editionsRes.data ?? []
  const statsParEdition = statsRes.data ?? []

  // Statistiques de l'édition active (calculées à partir des données déjà chargées)
  const budgetTotal = projetsPublies.reduce((sum, p) => sum + (p.budget_engage ?? 0), 0)
  const tauxMoyen = projetsPublies.length > 0
    ? Math.round(projetsPublies.reduce((sum, p) => sum + (p.taux_execution ?? 0), 0) / projetsPublies.length)
    : null

  const editionStats = editionsRows.map((ed): EditionInfo => {
    const projetsEd = (statsParEdition ?? []).filter(p => p.annee_exercice === ed.annee)
    const budget = projetsEd.reduce((sum, p) => sum + (p.budget_engage ?? 0), 0)
    const taux = projetsEd.length > 0
      ? Math.round(projetsEd.reduce((sum, p) => sum + (p.taux_execution ?? 0), 0) / projetsEd.length)
      : null
    return {
      annee: ed.annee,
      libelle: ed.libelle,
      statut: ed.statut,
      nbProjets: projetsEd.length,
      budgetEngage: budget,
      tauxMoyen: taux,
    }
  })

  // Projets par programme stratégique (édition active)
  const projetsByPS: Record<string, Projet[]> = {}
  for (const ps of programmes) {
    projetsByPS[ps.id] = projetsPublies.filter(p => p.ps_id === ps.id)
  }

  return { programmes, projetsPublies, budgetTotal, tauxMoyen, projetsByPS, editionStats }
}

// ─── Composant statistique hero ───────────────────────────────────────────────
function StatCard({ value, label, sublabel }: { value: string; label: string; sublabel?: string }) {
  return (
    <div className="text-center px-6 py-4 last:border-r-0">
      <p className="text-2xl md:text-3xl font-bold text-[var(--oif-blue-dark)] font-editorial">{value}</p>
      <p className="text-sm text-gray-600 mt-1 font-medium">{label}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  )
}

// ─── Composant carte projet ───────────────────────────────────────────────────
function ProjetCard({ projet, psColor }: { projet: Projet; psColor: string }) {
  return (
    <Link
      href={`/projets/${projet.id}`}
      className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-xs font-mono font-medium px-2 py-1 rounded"
          style={{ backgroundColor: psColor + '20', color: psColor }}
        >
          {projet.code_officiel ?? projet.id}
        </span>
        {projet.taux_execution != null && (
          <span className="text-xs text-gray-400">{projet.taux_execution}%</span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-[var(--oif-blue-dark)] group-hover:text-[var(--oif-blue)] leading-snug flex-1 mb-2">
        {projet.nom}
      </h3>
      {projet.accroche && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{projet.accroche}</p>
      )}
      {projet.taux_execution != null && (
        <div className="mt-auto">
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(projet.taux_execution, 100)}%`, backgroundColor: psColor }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default async function HomePage() {
  const editionActive = await getEditionActivePage()
  const { programmes, projetsPublies, budgetTotal, tauxMoyen, projetsByPS, editionStats } = await getData(editionActive)

  const anneeLabel = editionActive
  const isDataReady = projetsPublies.length > 0

  return (
    <main className="min-h-screen">

      {/* ─── Navigation ────────────────────────────────────────────────── */}
      <nav className="bg-[var(--oif-blue-dark)] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-[var(--oif-gold)] flex items-center justify-center">
              <span className="text-white font-black text-xs">OIF</span>
            </div>
            <span className="text-white font-semibold text-sm">
              CREXE <span className="text-[var(--oif-gold)] font-bold">{anneeLabel}</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/projets" className="text-white/60 hover:text-white text-sm transition">Projets</Link>
            <Link href="/resultats-era" className="text-white/60 hover:text-white text-sm transition">Résultats ERA</Link>
            <Link href="/a-propos" className="text-white/60 hover:text-white text-sm transition">Méthodologie</Link>
          </div>
          <Link href="/admin" className="text-xs text-white/40 hover:text-white/80 transition">
            Espace admin →
          </Link>
        </div>
      </nav>

      {/* ─── Grande bannière photo — Carrousel ─────────────────────────── */}
      {/* Concept UX : les photos s'affichent en premier, immersives,
          pour montrer concrètement l'impact terrain de l'OIF avant
          tout texte. Le carrousel tourne automatiquement toutes les 4,5 s. */}
      <HeroCarousel />

      {/* ─── Hero titre + Sélecteur d'édition ──────────────────────────── */}
      {/* Concept UX : l'utilisateur choisit son édition DANS le hero,
          avant de voir les données. La sélection est l'action principale.
          Les projets et programmes apparaissent en dessous, filtrés. */}
      <section
        className="bg-[var(--oif-blue-dark)] text-white"
        style={{ backgroundImage: 'radial-gradient(ellipse at 70% 10%, rgba(0,61,165,0.4) 0%, transparent 60%)' }}
      >
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--oif-gold)]" />
            Organisation internationale de la Francophonie
          </div>

          <h1 className="font-editorial text-4xl md:text-5xl font-semibold leading-tight max-w-3xl mb-3">
            Compte rendu d&apos;exécution des actions{' '}
            <span className="text-[var(--oif-gold)]">de l&apos;OIF</span>
          </h1>

          <p className="text-white/50 text-base max-w-xl leading-relaxed mb-10">
            Chiffres sourcés, récits de terrain et visualisations interactives —
            pour chaque édition du CREXE.
          </p>
        </div>

        {/* Sélecteur d'édition — intégré dans le hero, avant tout contenu */}
        {editionStats.length > 0 && (
          <EditionBanner editions={editionStats} editionActive={editionActive} />
        )}
      </section>

      {/* ─── Statistiques de l'édition active ───────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            <StatCard
              value={isDataReady ? String(projetsPublies.length) : '—'}
              label="Projets publiés"
              sublabel={`CREXE ${anneeLabel}`}
            />
            <StatCard
              value={String(programmes.length || 3)}
              label="Programmes stratégiques"
              sublabel="PS1 · PS2 · PS3"
            />
            <StatCard
              value={isDataReady && tauxMoyen != null ? tauxMoyen + '%' : '—'}
              label="Taux d'exécution moyen"
              sublabel="tous projets"
            />
            <StatCard
              value={isDataReady && budgetTotal > 0 ? (budgetTotal / 1_000_000).toFixed(1) + ' M€' : '—'}
              label="Budget engagé"
              sublabel={`CREXE ${anneeLabel}`}
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
            <Link
              href="/projets"
              className="inline-flex items-center gap-2 bg-[var(--oif-blue-dark)] text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition"
            >
              Explorer les {projetsPublies.length || ''} projets {anneeLabel} →
            </Link>
            <Link
              href="/resultats-era"
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition"
            >
              Résultats ERA
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Programmes stratégiques ─────────────────────────────────── */}
      <section className="bg-[var(--oif-cream)] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold text-[var(--oif-blue)] uppercase tracking-widest mb-2">
              Structure programmatique · {anneeLabel}
            </p>
            <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)]">
              3 Programmes stratégiques
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl">
              L&apos;action de l&apos;OIF s&apos;organise autour de trois grands axes qui guident
              l&apos;ensemble des projets du CREXE {anneeLabel}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {programmes.map((ps) => {
              const palette = PS_PALETTE[ps.id] ?? PS_PALETTE.PS1
              const accentColor = ps.couleur_theme ?? palette.accent
              const nbProjets = (projetsByPS[ps.id] ?? []).length

              return (
                <div
                  key={ps.id}
                  className="rounded-2xl p-7 border transition-shadow hover:shadow-md"
                  style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl" role="img" aria-label={ps.nom_court ?? ps.nom}>
                      {palette.icon}
                    </span>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: accentColor + '20', color: accentColor }}
                    >
                      {ps.id}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base leading-snug mb-2" style={{ color: accentColor }}>
                    {ps.nom_court ?? ps.nom}
                  </h3>
                  {ps.description && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {ps.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: palette.border }}>
                    <span className="text-xs text-gray-400">
                      {nbProjets > 0
                        ? `${nbProjets} projet${nbProjets > 1 ? 's' : ''} publié${nbProjets > 1 ? 's' : ''}`
                        : 'Aucun projet publié'}
                    </span>
                    <Link
                      href={`/projets?ps=${ps.id}`}
                      className="text-xs font-medium transition"
                      style={{ color: accentColor }}
                    >
                      Voir tous →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Projets publiés ─────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-[var(--oif-blue)] uppercase tracking-widest mb-2">
                CREXE {anneeLabel} · Données publiées
              </p>
              <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)]">
                Projets en accès libre
              </h2>
            </div>
            {projetsPublies.length > 6 && (
              <Link href="/projets" className="text-sm text-[var(--oif-blue)] hover:underline">
                Voir les {projetsPublies.length} projets →
              </Link>
            )}
          </div>

          {projetsPublies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projetsPublies.slice(0, 6).map((projet) => {
                const psId = projet.ps_id ?? 'PS1'
                const palette = PS_PALETTE[psId] ?? PS_PALETTE.PS1
                return <ProjetCard key={projet.id} projet={projet} psColor={palette.accent} />
              })}
            </div>
          ) : (
            <div className="bg-[var(--oif-neutral)] rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <p className="font-semibold text-[var(--oif-blue-dark)] mb-2">
                Aucun projet publié pour cette édition
              </p>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Sélectionnez une autre édition ci-dessus ou revenez plus tard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Bloc ERA — sélecteur d'éditions ERA ────────────────────── */}
      <EraHomepageBlock />

      {/* ─── Rigueur méthodologique ──────────────────────────────────── */}
      <section className="bg-[var(--oif-cream)] py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 flex flex-col md:flex-row gap-6 items-start">
            <div className="text-3xl flex-shrink-0">🔬</div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--oif-blue-dark)] mb-2">
                Rigueur méthodologique
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                Chaque chiffre affiché sur cette plateforme est sourcé et qualifié selon
                un niveau de preuve : <strong>mesuré</strong> (données vérifiées),{' '}
                <strong>estimé</strong> (projection méthodique), <strong>observé</strong> (constat
                terrain) ou <strong>institutionnel</strong> (validation officielle). Aucun
                chiffre n&apos;est publié sans source explicite.
              </p>
            </div>
            <Link
              href="/a-propos"
              className="flex-shrink-0 inline-flex items-center gap-2 text-sm text-[var(--oif-blue)] hover:underline font-medium"
            >
              Voir la méthodologie →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-[var(--oif-blue-dark)] text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded bg-[var(--oif-gold)] flex items-center justify-center">
                  <span className="text-white font-black text-xs">OIF</span>
                </div>
                <span className="font-semibold text-sm">CREXE {anneeLabel}</span>
              </div>
              <p className="text-white/50 text-xs leading-relaxed">
                Plateforme de valorisation des projets de l&apos;Organisation internationale
                de la Francophonie. Données issues du Compte-Rendu d&apos;Exécution {anneeLabel}.
              </p>
              {/* Liens éditions dans le footer */}
              <div className="mt-4 flex gap-2">
                {editionStats.map(ed => (
                  <span key={ed.annee} className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded">
                    CREXE {ed.annee}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Plateforme</p>
                <ul className="space-y-1.5 text-sm">
                  <li><Link href="/projets" className="text-white/60 hover:text-white transition">Projets</Link></li>
                  <li><Link href="/explorer" className="text-white/60 hover:text-white transition">Explorer</Link></li>
                  <li><Link href="/a-propos" className="text-white/60 hover:text-white transition">À propos</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">OIF</p>
                <ul className="space-y-1.5 text-sm">
                  <li>
                    <a href="https://www.oif.org" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition">
                      oif.org ↗
                    </a>
                  </li>
                  <li>
                    <a href="https://www.oif.org/oif-francophonie/que-faisons-nous/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition">
                      Nos actions ↗
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/30">
            <span>© {new Date().getFullYear()} Organisation internationale de la Francophonie</span>
            <span>
              Données CREXE {anneeLabel} · Licence{' '}
              <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" className="underline hover:text-white/60 transition" target="_blank" rel="noopener noreferrer">
                CC BY-NC-SA 4.0
              </a>
            </span>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </main>
  )
}
