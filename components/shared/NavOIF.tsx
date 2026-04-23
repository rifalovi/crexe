// ─── NavOIF ──────────────────────────────────────────────────────────────────
// Barre de navigation institutionnelle partagée par toutes les pages publiques.
// Server Component — pas d'état client.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import Image from 'next/image'
import { CREX_ANNEE } from '@/lib/constants'
import { getEditionActive } from '@/lib/edition-context'
import EditionSwitcher from '@/components/shared/EditionSwitcher'

// ─── Re-export pour la rétrocompatibilité des imports existants ───────────────
export { CREX_ANNEE }

// Concept : NavOIF est un Server Component async — il lit le cookie d'édition
// côté serveur et affiche l'année correcte dès le premier rendu (SSR).
export async function NavOIF() {
  const anneeActive = await getEditionActive()
  return (
    <nav className="bg-[var(--oif-navy)] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo OIF officiel + identité CREX */}
        {/* Conforme charte OIF — version quadri texte blanc sur fond sombre */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="flex-shrink-0 border-r border-white/20 pr-4">
            <Image
              src="/assets/branding/oif/logo-oif-quadri-texte-blanc.png"
              alt="Logo officiel de l'Organisation internationale de la Francophonie"
              width={110}
              height={52}
              sizes="110px"
              className="opacity-95 group-hover:opacity-100 transition"
              style={{ minWidth: 96, height: 'auto' }}
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-semibold text-sm tracking-wide">
              CREXE <span className="text-[var(--oif-gold)] font-bold">{anneeActive}</span>
            </span>
            <span className="text-white/40 text-[9px] font-normal tracking-wide hidden md:block">
              Service de Conception et Suivi des projets (SCS)
            </span>
          </div>
        </Link>

        {/* Navigation principale */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/projets"
            className="text-white/60 hover:text-white text-sm transition"
          >
            Projets
          </Link>
          <Link
            href="/resultats-era"
            className="text-white/60 hover:text-white text-sm transition"
          >
            Résultats ERA
          </Link>
          <Link
            href="/a-propos"
            className="text-white/60 hover:text-white text-sm transition"
          >
            Méthodologie
          </Link>
          <Link
            href="/contact"
            className="text-white/60 hover:text-white text-sm transition"
          >
            Contact
          </Link>
        </div>

        {/* Sélecteur d'édition — Client Component intégré dans le Server Component */}
        <div className="flex items-center gap-3">
          <EditionSwitcher compact />
          <Link
            href="/admin"
            className="text-xs text-white/40 hover:text-white/80 transition hidden md:block"
          >
            Admin →
          </Link>
        </div>
      </div>
    </nav>
  )
}
