// ─── Page Contact ─────────────────────────────────────────────────────────────
// Point de contact institutionnel pour la plateforme CREXE.
// Server Component — pas d'état client.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import { CREX_ANNEE } from '@/components/shared/NavOIF'

export const metadata: Metadata = {
  title: `Contact — CREXE ${CREX_ANNEE}`,
  description: `Contactez l'équipe du Service de Conception et Suivi des projets (SCS) de l'OIF pour toute question sur la plateforme CREXE ${CREX_ANNEE}.`,
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── En-tête de page ────────────────────────────────────────────── */}
      <section className="bg-[var(--oif-blue-dark)] text-white py-14">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold text-[var(--oif-gold)] uppercase tracking-widest mb-3">
            Contact
          </p>
          <h1 className="font-editorial text-3xl md:text-4xl font-semibold mb-3">
            Nous contacter
          </h1>
          <p className="text-white/60 max-w-xl text-sm leading-relaxed">
            Pour toute question relative à la plateforme CREXE {CREX_ANNEE}, aux données
            présentées ou à la méthodologie, contactez directement l&apos;équipe du Service
            de Conception et Suivi des projets (SCS) de l&apos;OIF.
          </p>
        </div>
      </section>

      {/* ─── Contenu principal ───────────────────────────────────────────── */}
      <section className="flex-1 bg-[var(--oif-cream)] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Carte de contact SCS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--oif-blue)] flex items-center justify-center flex-shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[var(--oif-blue-dark)]">
                    Service de Conception et Suivi des projets
                  </p>
                  <p className="text-sm text-gray-500">
                    Organisation internationale de la Francophonie
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--oif-blue)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--oif-blue)" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Courriel</p>
                    <a
                      href="mailto:carlos.hounsinou@francophonie.org"
                      className="text-[var(--oif-blue)] hover:text-[var(--oif-blue-dark)] font-medium text-sm transition underline-offset-2 hover:underline"
                    >
                      carlos.hounsinou@francophonie.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--oif-blue)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--oif-blue)" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Site institutionnel</p>
                    <a
                      href="https://www.oif.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--oif-blue)] hover:text-[var(--oif-blue-dark)] font-medium text-sm transition underline-offset-2 hover:underline"
                    >
                      oif.org ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations sur la plateforme */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="font-semibold text-[var(--oif-blue-dark)] mb-4">
                À propos de la plateforme
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                La plateforme CREXE {CREX_ANNEE} est une initiative du Service de Conception
                et Suivi des projets (SCS) de l&apos;Organisation internationale de la
                Francophonie, visant à valoriser les résultats des projets OIF de manière
                transparente et accessible.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Pour toute question technique sur la plateforme, pour signaler une erreur
                dans les données, ou pour demander des informations complémentaires sur
                un projet, n&apos;hésitez pas à nous écrire.
              </p>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Données du rapport
                </p>
                <p className="text-sm text-gray-600">
                  Compte-Rendu d&apos;Exécution {CREX_ANNEE} (CREXE {CREX_ANNEE}) —
                  Service de Conception et Suivi des projets, OIF
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
