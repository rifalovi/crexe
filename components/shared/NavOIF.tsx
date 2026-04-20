// ─── NavOIF ──────────────────────────────────────────────────────────────────
// Barre de navigation institutionnelle partagée par toutes les pages publiques.
// Server Component — pas d'état client.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'

export function NavOIF() {
  return (
    <nav className="bg-[var(--oif-blue-dark)] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded bg-[var(--oif-gold)] flex items-center justify-center">
            <span className="text-white font-black text-xs">OIF</span>
          </div>
          <span className="text-white font-semibold text-sm">
            CREXE <span className="text-white/40 font-normal">2025</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/projets"
            className="text-white/60 hover:text-white text-sm transition"
          >
            Projets
          </Link>
          <Link
            href="/explorer"
            className="text-white/60 hover:text-white text-sm transition"
          >
            Explorer
          </Link>
          <Link
            href="/a-propos"
            className="text-white/60 hover:text-white text-sm transition"
          >
            Méthodologie
          </Link>
        </div>

        <Link
          href="/admin"
          className="text-xs text-white/40 hover:text-white/80 transition"
        >
          Espace admin →
        </Link>
      </div>
    </nav>
  )
}
