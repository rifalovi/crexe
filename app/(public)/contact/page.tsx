// ─── Page Contact ─────────────────────────────────────────────────────────────
// Server Component — métadonnées SEO + structure de la page.
// Le formulaire interactif (avec Turnstile) est délégué au Client Component.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import {
  CREX_ANNEE, CONTACT_EMAIL, SERVICE_NOM, ORG_ACRONYME,
  URL_OIF_SITE, URL_OIF_PROJETS
} from '@/lib/constants'
import { ContactForm } from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: `Contact — CREXE ${CREX_ANNEE}`,
  description: `Contactez l'équipe du Service de Conception et Suivi des projets (SCS) de l'OIF pour toute question sur la plateforme CREXE ${CREX_ANNEE}.`,
}

// ─── Plateformes institutionnelles OIF ────────────────────────────────────────
const PLATEFORMES = [
  {
    nom:         'Site officiel OIF',
    url:         URL_OIF_SITE,
    affichage:   'francophonie.org',
    description: "Site institutionnel de l'Organisation internationale de la Francophonie",
    icone: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--oif-blue)" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    nom:         'Cartographie des projets',
    url:         URL_OIF_PROJETS,
    affichage:   'projets.francophonie.org',
    description: 'Cartographie interactive des projets de coopération OIF dans le monde',
    icone: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--oif-blue)" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
]

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
            présentées ou à la méthodologie, l&apos;équipe {SERVICE_NOM} est à votre disposition.
          </p>
        </div>
      </section>

      {/* ─── Contenu principal ───────────────────────────────────────────── */}
      <section className="flex-1 bg-[var(--oif-cream)] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

            {/* ── Formulaire de contact sécurisé (col principale) ─────────── */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>

            {/* ── Informations & liens institutionnels ────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Carte SCS */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--oif-blue)] flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--oif-blue-dark)] text-sm leading-snug">
                      {SERVICE_NOM}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ORG_ACRONYME} — Paris, France
                    </p>
                  </div>
                </div>

                {/* Courriel */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--oif-blue)]/10 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--oif-blue)" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Courriel direct</p>
                    <a href={`mailto:${CONTACT_EMAIL}`}
                      className="text-[var(--oif-blue)] hover:text-[var(--oif-blue-dark)] font-medium text-xs transition hover:underline underline-offset-2">
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>
              </div>

              {/* Plateformes institutionnelles */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-[var(--oif-blue-dark)] text-sm mb-4">
                  Plateformes institutionnelles
                </h2>
                <div className="space-y-4">
                  {PLATEFORMES.map(p => (
                    <a
                      key={p.url}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--oif-blue)]/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[var(--oif-blue)]/20 transition">
                        {p.icone}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-[var(--oif-blue)] font-medium text-xs group-hover:underline underline-offset-2">
                            {p.affichage}
                          </p>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--oif-blue)" strokeWidth="2" className="opacity-50 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{p.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* À propos CREXE */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-[var(--oif-blue-dark)] text-sm mb-3">
                  À propos de la plateforme
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  La plateforme CREXE {CREX_ANNEE} valorise les résultats des projets de
                  l&apos;{ORG_ACRONYME} de manière transparente, sourcée et accessible.
                </p>
                <div className="border-t border-gray-50 pt-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Source</p>
                  <p className="text-xs text-gray-500">
                    Compte-Rendu d&apos;Exécution {CREX_ANNEE} — {SERVICE_NOM}
                  </p>
                </div>
              </div>

              {/* Liens rapides internes */}
              <div className="bg-[var(--oif-neutral)] rounded-2xl p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Explorer la plateforme
                </p>
                <nav className="space-y-2">
                  {[
                    { href: '/projets',       label: 'Projets OIF' },
                    { href: '/resultats-era', label: 'Résultats ERA' },
                    { href: '/a-propos',      label: 'Méthodologie CREXE' },
                  ].map(({ href, label }) => (
                    <a key={href} href={href}
                      className="flex items-center justify-between group text-sm text-[var(--oif-blue)] hover:text-[var(--oif-blue-dark)] transition">
                      <span className="group-hover:underline underline-offset-2">{label}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40 group-hover:opacity-100 transition">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </a>
                  ))}
                </nav>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
