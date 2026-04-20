// ─── FooterOIF ───────────────────────────────────────────────────────────────
// Pied de page institutionnel partagé par les pages publiques.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'

export function FooterOIF() {
  return (
    <footer className="bg-[var(--oif-blue-dark)] text-white py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded bg-[var(--oif-gold)] flex items-center justify-center">
                <span className="text-white font-black text-xs">OIF</span>
              </div>
              <span className="font-semibold text-sm">CREXE 2025</span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">
              Plateforme de valorisation des projets de l&apos;Organisation
              internationale de la Francophonie. Données issues du Compte-Rendu
              d&apos;Exécution 2025.
            </p>
          </div>

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
  )
}
