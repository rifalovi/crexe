// ─── Page 404 personnalisée ────────────────────────────────────────────────────
// En Next.js App Router, ce fichier gère toutes les routes introuvables.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--oif-neutral)] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">

        {/* Logo OIF */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-lg bg-[var(--oif-blue)] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm">OIF</span>
          </div>
          <span className="text-[var(--oif-blue-dark)] font-semibold text-sm tracking-wide">
            CREXE <span className="text-gray-400 font-normal">2025</span>
          </span>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Bande couleur OIF */}
          <div className="h-1.5 w-full" style={{
            background: 'linear-gradient(to right, var(--oif-blue) 0%, var(--oif-purple) 33%, #B83A2D 66%, var(--oif-green) 100%)'
          }} />

          <div className="px-8 py-10 md:px-12 md:py-14">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[var(--oif-blue)]/8 text-[var(--oif-blue)] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--oif-blue)]" />
              Page en cours de développement
            </div>

            {/* Message */}
            <h1 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)] leading-snug mb-6">
              Section bientôt disponible
            </h1>

            <div className="bg-[var(--oif-neutral)] rounded-xl px-6 py-5 border-l-4 border-[var(--oif-blue)] mb-8">
              <p className="text-gray-700 leading-relaxed text-base">
                Cher(e)s collègues,
              </p>
              <p className="text-gray-700 leading-relaxed text-base mt-3">
                Je suis toujours en train de développer cette partie de la plateforme.
                Dès qu&apos;elle sera achevée, je vous en tiendrai informé(e)s.
              </p>
              <p className="text-gray-700 leading-relaxed text-base mt-3">
                Bien cordialement,
              </p>
              <p className="text-[var(--oif-blue)] font-semibold mt-1">
                Carlos H.
              </p>
            </div>

            {/* Navigation de retour */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[var(--oif-blue)] hover:bg-[var(--oif-blue-dark)] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Retour à l&apos;accueil
              </Link>
              <Link
                href="/projets"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-[var(--oif-blue)] text-gray-700 hover:text-[var(--oif-blue)] text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                Voir les projets
              </Link>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Organisation internationale de la Francophonie — CREXE 2025
        </p>
      </div>
    </div>
  )
}
