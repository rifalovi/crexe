// ─── FooterOIF ───────────────────────────────────────────────────────────────
// Pied de page institutionnel partagé par les pages publiques.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import Image from 'next/image'
import { CREX_ANNEE } from '@/components/shared/NavOIF'

export function FooterOIF() {
  return (
    <footer className="bg-[var(--oif-blue-dark)] text-white py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
          {/* Logo + identité */}
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/images/logo-oif.svg"
                alt="Organisation internationale de la Francophonie"
                width={40}
                height={22}
                className="brightness-0 invert opacity-80"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-sm">
                  CREXE <span className="text-[var(--oif-gold)] font-bold">{CREX_ANNEE}</span>
                </span>
                <span className="text-white/40 text-[9px] font-normal tracking-wide">
                  Service de Conception et Suivi des projets (SCS)
                </span>
              </div>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">
              Plateforme de valorisation des projets de l&apos;Organisation
              internationale de la Francophonie. Données issues du Compte-Rendu
              d&apos;Exécution {CREX_ANNEE}.
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
                  <Link href="/resultats-era" className="text-white/60 hover:text-white transition">
                    Résultats ERA
                  </Link>
                </li>
                <li>
                  <Link href="/a-propos" className="text-white/60 hover:text-white transition">
                    Méthodologie
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/60 hover:text-white transition">
                    Contact
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
            Données CREXE {CREX_ANNEE} · Service conception et suivi de projet (SCS)
          </span>
        </div>
      </div>
    </footer>
  )
}
