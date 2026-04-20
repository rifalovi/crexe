// ─── Landing page publique CREXE ─────────────────────────────────────────────
// Server Component — données chargées côté serveur à chaque requête.
//
// Concept clé : pourquoi Server Component ici ?
// - Pas de 'use client' → Next.js exécute ce fichier sur le serveur
// - Les requêtes Supabase s'exécutent avant que le HTML soit envoyé au navigateur
// - Résultat : le visiteur voit les données immédiatement, sans spinner
// - Avantage SEO : Google indexe le contenu complet dès le premier rendu
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'

// ─── Palette PS (fallback si la DB n'a pas encore couleur_theme) ──────────────
// Chaque programme stratégique a une couleur signature définie dans les specs v3.
// On définit une map statique comme filet de sécurité si la DB n'est pas encore migrée.
const PS_PALETTE: Record<string, { bg: string; text: string; border: string; accent: string; icon: string }> = {
  PS1: {
    bg: '#EBF0FA',
    text: '#003DA5',
    border: '#C7D5F5',
    accent: '#003DA5',
    icon: '📚',
  },
  PS2: {
    bg: '#F3EAF9',
    text: '#6B2C91',
    border: '#DEC5EE',
    accent: '#6B2C91',
    icon: '⚖️',
  },
  PS3: {
    bg: '#E6F4F1',
    text: '#0F6E56',
    border: '#B3DDD7',
    accent: '#0F6E56',
    icon: '🌿',
  },
}

// ─── Chargement des données (exécuté côté serveur) ───────────────────────────
// La fonction getData() est appelée une seule fois au moment du rendu serveur.
// Elle récupère en parallèle les programmes et les projets publiés.

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
}

async function getData() {
  // Client Supabase en lecture seule — pas besoin de cookies pour les routes publiques
  // Le client utilise la clé ANON, qui respecte les politiques RLS :
  // seuls les projets en statut 'publie' sont visibles.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Les requêtes s'exécutent en parallèle grâce à Promise.all
  // C'est un pattern important pour ne pas attendre séquentiellement chaque requête
  const [psRes, projetsPubliesRes, tousProjetRes] = await Promise.all([
    supabase
      .from('programmes_strategiques')
      .select('id, nom, nom_court, description, couleur_theme, ordre')
      .order('ordre', { ascending: true }),

    supabase
      .from('projets')
      .select('id, code_officiel, nom, accroche, ps_id, taux_execution, budget_engage, statut, nombre_pays')
      .eq('statut', 'publie')
      .order('id'),

    supabase
      .from('projets')
      .select('id', { count: 'exact', head: true }),
  ])

  const programmes: Programme[] = psRes.data ?? []
  const projetsPublies: Projet[] = projetsPubliesRes.data ?? []
  const totalProjets = tousProjetRes.count ?? 0

  // Calcul des statistiques agrégées
  const budgetTotal = projetsPublies.reduce(
    (sum, p) => sum + (p.budget_engage ?? 0),
    0
  )
  const paysCouverts = projetsPublies.reduce(
    (max, p) => Math.max(max, p.nombre_pays ?? 0),
    0
  )

  // Regrouper les projets publiés par programme stratégique
  const projetsByPS: Record<string, Projet[]> = {}
  for (const ps of programmes) {
    projetsByPS[ps.id] = projetsPublies.filter((p) => p.ps_id === ps.id)
  }

  return {
    programmes,
    projetsPublies,
    totalProjets,
    budgetTotal,
    paysCouverts,
    projetsByPS,
  }
}

// ─── Composant de statistique (hero) ─────────────────────────────────────────
function StatCard({
  value,
  label,
  sublabel,
}: {
  value: string
  label: string
  sublabel?: string
}) {
  return (
    <div className="text-center px-6 py-4 border-r border-white/10 last:border-r-0">
      <p className="text-3xl md:text-4xl font-bold text-white font-editorial">{value}</p>
      <p className="text-sm text-white/70 mt-1 font-medium">{label}</p>
      {sublabel && <p className="text-xs text-white/40 mt-0.5">{sublabel}</p>}
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
      {/* Badge code officiel */}
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

      {/* Nom du projet */}
      <h3 className="text-sm font-semibold text-[var(--oif-blue-dark)] group-hover:text-[var(--oif-blue)] leading-snug flex-1 mb-2">
        {projet.nom}
      </h3>

      {/* Accroche */}
      {projet.accroche && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{projet.accroche}</p>
      )}

      {/* Barre de progression */}
      {projet.taux_execution != null && (
        <div className="mt-auto">
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(projet.taux_execution, 100)}%`,
                backgroundColor: psColor,
              }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default async function HomePage() {
  const {
    programmes,
    projetsPublies,
    totalProjets,
    budgetTotal,
    paysCouverts,
    projetsByPS,
  } = await getData()

  // Fallback pour les statistiques si aucun projet publié
  const isDataReady = projetsPublies.length > 0

  return (
    <main className="min-h-screen">

      {/* ─── Barre de navigation institutionnelle ───────────────────── */}
      <nav className="bg-[var(--oif-blue-dark)] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo + nom */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-[var(--oif-gold)] flex items-center justify-center">
              <span className="text-white font-black text-xs">OIF</span>
            </div>
            <span className="text-white font-semibold text-sm">
              CREXE <span className="text-white/40 font-normal">2025</span>
            </span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/projets" className="text-white/60 hover:text-white text-sm transition">
              Projets
            </Link>
            <Link href="/resultats-era" className="text-white/60 hover:text-white text-sm transition">
              Résultats ERA
            </Link>
            <Link href="/a-propos" className="text-white/60 hover:text-white text-sm transition">
              Méthodologie
            </Link>
          </div>

          {/* Connexion admin */}
          <Link
            href="/admin"
            className="text-xs text-white/40 hover:text-white/80 transition"
          >
            Espace admin →
          </Link>
        </div>
      </nav>

      {/* ─── Section Hero ────────────────────────────────────────────── */}
      {/* Le hero est le premier message que voit le visiteur.
          Fond gradient sombre, grand titre éditorial, statistiques clés. */}
      <section
        className="bg-[var(--oif-blue-dark)] text-white"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 80% 20%, rgba(0,61,165,0.3) 0%, transparent 60%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
          {/* Badge de contexte */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--oif-gold)]" />
            Organisation internationale de la Francophonie — Exercice 2025
          </div>

          {/* Titre principal — police éditoriale Source Serif 4 */}
          <h1 className="font-editorial text-4xl md:text-6xl font-semibold leading-tight max-w-3xl mb-4">
            Compte rendu d&apos;exécution des actions{' '}
            <span className="text-[var(--oif-gold)]">de l&apos;OIF</span>
          </h1>

          <p className="text-white/60 text-lg max-w-2xl leading-relaxed mb-10">
            Découvrez l&apos;impact concret des projets de l&apos;OIF à travers les données
            du Compte-Rendu d&apos;Exécution 2025 — chiffres sourcés, récits de terrain,
            visualisations interactives.
          </p>

          {/* Statistiques globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
            <StatCard
              value={isDataReady ? String(projetsPublies.length) : String(totalProjets)}
              label={isDataReady ? 'Projets publiés' : 'Projets documentés'}
              sublabel="CREXE 2025"
            />
            <StatCard
              value={programmes.length > 0 ? String(programmes.length) : '3'}
              label="Programmes stratégiques"
              sublabel="PS1 · PS2 · PS3"
            />
            <StatCard
              value={
                isDataReady && paysCouverts > 0
                  ? String(paysCouverts) + '+'
                  : '88'
              }
              label="États et gouvernements"
              sublabel="membres de la Francophonie"
            />
            <StatCard
              value={
                isDataReady && budgetTotal > 0
                  ? (budgetTotal / 1_000_000).toFixed(1) + ' M€'
                  : '—'
              }
              label="Budget engagé"
              sublabel={isDataReady ? 'données publiées' : "en cours d'intégration"}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/projets"
              className="inline-flex items-center gap-2 bg-white text-[var(--oif-blue-dark)] font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[var(--oif-cream)] transition"
            >
              Explorer les projets →
            </Link>
            <Link
              href="/resultats-era"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-white/15 transition"
            >
              Résultats ERA
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Bandeau avertissement MVP PS3 ──────────────────────────── */}
      {/* Notice institutionnelle : seuls les projets PS3 sont disponibles dans ce MVP */}
      <div className="bg-[#B83A2D] text-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm">
            <span className="font-bold">Version de démonstration — MVP</span>
            {' '}· Seuls les projets du{' '}
            <span className="font-bold underline">Programme stratégique 3 (PS3)</span>
            {' '}sont disponibles pour cette validation. Les données PS1 et PS2 seront intégrées progressivement.
          </p>
        </div>
      </div>

      {/* ─── Section Programmes stratégiques ─────────────────────────── */}
      {/* Les 3 PS structurent TOUS les projets OIF.
          Chaque PS a une couleur et une thématique distincte. */}
      <section className="bg-[var(--oif-cream)] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold text-[var(--oif-blue)] uppercase tracking-widest mb-2">
              Structure programmatique
            </p>
            <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)]">
              3 Programmes stratégiques
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl">
              L&apos;action de l&apos;OIF s&apos;organise autour de trois grands axes qui guident
              l&apos;ensemble des 20 projets du CREXE 2025.
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
                  style={{
                    backgroundColor: palette.bg,
                    borderColor: palette.border,
                  }}
                >
                  {/* En-tête */}
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className="text-2xl"
                      role="img"
                      aria-label={ps.nom_court ?? ps.nom}
                    >
                      {palette.icon}
                    </span>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: accentColor + '20',
                        color: accentColor,
                      }}
                    >
                      {ps.id}
                    </span>
                  </div>

                  {/* Nom court du programme */}
                  <h3
                    className="font-semibold text-base leading-snug mb-2"
                    style={{ color: accentColor }}
                  >
                    {ps.nom_court ?? ps.nom}
                  </h3>

                  {/* Description */}
                  {ps.description && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {ps.description}
                    </p>
                  )}

                  {/* Compteur projets */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: palette.border }}>
                    <span className="text-xs text-gray-400">
                      {nbProjets > 0
                        ? `${nbProjets} projet${nbProjets > 1 ? 's' : ''} publié${nbProjets > 1 ? 's' : ''}`
                        : 'Données en cours d\'intégration'}
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

            {/* État vide si aucun programme en DB */}
            {programmes.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-400 text-sm">
                Exécutez la migration SQL pour initialiser les programmes stratégiques.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Section Projets publiés ──────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-[var(--oif-blue)] uppercase tracking-widest mb-2">
                Données publiées
              </p>
              <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)]">
                Projets en accès libre
              </h2>
            </div>
            {projetsPublies.length > 6 && (
              <Link
                href="/projets"
                className="text-sm text-[var(--oif-blue)] hover:underline"
              >
                Voir tous les projets →
              </Link>
            )}
          </div>

          {projetsPublies.length > 0 ? (
            /* Grille des projets publiés */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projetsPublies.slice(0, 6).map((projet) => {
                const psId = projet.ps_id ?? 'PS1'
                const palette = PS_PALETTE[psId] ?? PS_PALETTE.PS1
                return (
                  <ProjetCard
                    key={projet.id}
                    projet={projet}
                    psColor={palette.accent}
                  />
                )
              })}
            </div>
          ) : (
            /* État vide — affiché tant qu'aucun projet n'est publié */
            <div className="bg-[var(--oif-neutral)] rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 text-2xl">
                📊
              </div>
              <p className="font-semibold text-[var(--oif-blue-dark)] mb-2">
                Données en cours d&apos;intégration
              </p>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                Les {totalProjets > 0 ? totalProjets : 20} projets du CREXE 2025 sont en cours
                de documentation et de validation. Les fiches seront publiées progressivement.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  En cours de documentation
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  En revue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Publié
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Section callout « À propos de la méthodologie » ──────────── */}
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

      {/* ─── Pied de page institutionnel ────────────────────────────────── */}
      <footer className="bg-[var(--oif-blue-dark)] text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            {/* Identité OIF */}
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded bg-[var(--oif-gold)] flex items-center justify-center">
                  <span className="text-white font-black text-xs">OIF</span>
                </div>
                <span className="font-semibold text-sm">CREXE 2025</span>
              </div>
              <p className="text-white/50 text-xs leading-relaxed">
                Plateforme de valorisation des projets de l&apos;Organisation internationale
                de la Francophonie. Données issues du Compte-Rendu d&apos;Exécution 2025.
              </p>
            </div>

            {/* Liens rapides */}
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                  Plateforme
                </p>
                <ul className="space-y-1.5 text-sm">
                  <li>
                    <Link href="/projets" className="text-white/60 hover:text-white transition">
                      Projets
                    </Link>
                  </li>
                  <li>
                    <Link href="/explorer" className="text-white/60 hover:text-white transition">
                      Explorer
                    </Link>
                  </li>
                  <li>
                    <Link href="/a-propos" className="text-white/60 hover:text-white transition">
                      À propos
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                  OIF
                </p>
                <ul className="space-y-1.5 text-sm">
                  <li>
                    <a
                      href="https://www.oif.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition"
                    >
                      oif.org ↗
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.oif.org/oif-francophonie/que-faisons-nous/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition"
                    >
                      Nos actions ↗
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/30">
            <span>
              © {new Date().getFullYear()} Organisation internationale de la Francophonie
            </span>
            <span>
              Données CREXE 2025 · Licence{' '}
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                className="underline hover:text-white/60 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                CC BY-NC-SA 4.0
              </a>
            </span>
          </div>
        </div>
      </footer>
    </main>
  )
}
