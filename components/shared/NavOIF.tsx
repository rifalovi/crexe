// ─── NavOIF ──────────────────────────────────────────────────────────────────
// Barre de navigation institutionnelle partagée par toutes les pages publiques.
// Server Component — pas d'état client.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import Image from 'next/image'
import { CREX_ANNEE } from '@/lib/constants'
import EditionSwitcher from '@/components/shared/EditionSwitcher'

// ─── Re-export pour la rétrocompatibilité des imports existants ───────────────
export { CREX_ANNEE }

export function NavOIF() {
  return (
    <nav className="bg-[var(--oif-blue-dark)] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo OIF + identité CREX */}
        <Link href="/" className="flex items-center gap-4 group">
          {/* Logo OIF officiel — agrandi pour une meilleure lisibilité */}
          <div className="flex-shrink-0 border-r border-white/20 pr-4">
            <Image
              src="/images/logo-oif.svg"
              alt="Organisation internationale de la Francophonie"
              width={80}
              height={42}
              className="brightness-0 invert opacity-90 group-hover:opacity-100 transition"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-semibold text-sm tracking-wide">
              CREXE <span className="text-[var(--oif-gold)] font-bold">{CREX_ANNEE}</span>
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
