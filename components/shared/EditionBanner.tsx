'use client'
// ─── EditionBanner — Sélecteur d'édition (homepage hero) ─────────────────────
// Composant client : gère le clic, le cookie, et le refresh.
// Les données (stats par édition) viennent du Server Component parent via props.
// ─────────────────────────────────────────────────────────────────────────────

import { useRouter } from 'next/navigation'
import { setEditionActiveCookie } from '@/lib/edition-context'

export interface EditionInfo {
  annee: number
  libelle: string
  statut: string
  nbProjets: number
  budgetEngage: number
  tauxMoyen: number | null
}

interface EditionBannerProps {
  editions: EditionInfo[]   // triées chronologiquement par le parent (2024 → 2025 → …)
  editionActive: number
}

function formatBudget(montant: number): string {
  if (montant >= 1_000_000) return (montant / 1_000_000).toFixed(1) + ' M€'
  if (montant > 0) return new Intl.NumberFormat('fr-FR').format(montant) + ' €'
  return '—'
}

export default function EditionBanner({ editions, editionActive }: EditionBannerProps) {
  const router = useRouter()

  async function handleSelect(annee: number) {
    setEditionActiveCookie(annee)
    await fetch('/api/edition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ annee }),
    })
    router.refresh()
  }

  // N'afficher que les éditions avec des projets, + la première sans projets s'il y en a une
  const editionsAffichees = editions.filter(e => e.nbProjets > 0)

  return (
    <section className="bg-[var(--oif-blue-dark)] border-t border-white/10 pb-14 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Titre de la sélection */}
        <div className="text-center pt-10 pb-8">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
            Étape 1
          </p>
          <h2 className="font-editorial text-2xl md:text-3xl font-semibold text-white mb-2">
            Quelle édition souhaitez-vous explorer ?
          </h2>
          <p className="text-white/50 text-sm">
            Sélectionnez une édition pour accéder à ses projets, données et analyses
          </p>
        </div>

        {/* Grille des éditions */}
        <div className={`grid gap-4 ${editionsAffichees.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'} max-w-4xl mx-auto`}>
          {editionsAffichees.map((ed) => {
            const isActive = ed.annee === editionActive
            const isClos = ed.statut === 'clos'

            return (
              <button
                key={ed.annee}
                onClick={() => handleSelect(ed.annee)}
                className={`
                  relative text-left rounded-2xl border-2 p-6 transition-all duration-200 group
                  ${isActive
                    ? 'border-[var(--oif-gold)] bg-white shadow-xl scale-[1.02]'
                    : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40'
                  }
                `}
              >
                {/* Badge actif */}
                {isActive && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--oif-gold)] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shadow">
                    ✓ Édition sélectionnée
                  </span>
                )}

                {/* En-tête année */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black font-mono flex-shrink-0
                    ${isActive ? 'bg-[var(--oif-blue-dark)] text-white' : 'bg-white/10 text-white/70'}
                  `}>
                    {String(ed.annee).slice(2)}
                  </div>
                  <div>
                    <p className={`text-base font-bold leading-tight ${isActive ? 'text-[var(--oif-blue-dark)]' : 'text-white'}`}>
                      {ed.libelle}
                    </p>
                    <span className={`
                      inline-flex items-center gap-1 text-xs font-medium mt-0.5
                      ${isClos
                        ? isActive ? 'text-gray-500' : 'text-white/40'
                        : isActive ? 'text-emerald-600' : 'text-emerald-400'
                      }
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isClos ? 'bg-gray-400' : 'bg-emerald-500'}`} />
                      {isClos ? 'Exercice clos' : 'En cours'}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { val: String(ed.nbProjets), label: 'projets' },
                    { val: formatBudget(ed.budgetEngage), label: 'engagé' },
                    { val: ed.tauxMoyen != null ? ed.tauxMoyen + '%' : '—', label: 'exécution' },
                  ].map(({ val, label }) => (
                    <div
                      key={label}
                      className={`rounded-xl p-2.5 text-center ${isActive ? 'bg-[var(--oif-neutral)]' : 'bg-white/5'}`}
                    >
                      <p className={`text-base font-bold leading-tight ${isActive ? 'text-[var(--oif-blue)]' : 'text-white'}`}>
                        {val}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${isActive ? 'text-gray-500' : 'text-white/40'}`}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className={`
                  w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${isActive
                    ? 'bg-[var(--oif-blue-dark)] text-white'
                    : 'bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white'
                  }
                `}>
                  {isActive ? 'Explorer les projets →' : `Choisir ${ed.annee}`}
                </div>
              </button>
            )
          })}
        </div>

        {/* Flèche vers le contenu */}
        <div className="flex justify-center mt-8">
          <div className="flex flex-col items-center gap-1 text-white/30">
            <p className="text-xs">Données de l&apos;édition {editionActive}</p>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

      </div>
    </section>
  )
}
