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

  // Sélectionner une édition : met à jour le cookie + navigue vers /projets
  async function handleSelect(annee: number, alreadyActive: boolean) {
    setEditionActiveCookie(annee)
    await fetch('/api/edition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ annee }),
    })
    // Si déjà actif → naviguer directement vers les projets
    // Sinon → d'abord activer l'édition puis naviguer
    if (alreadyActive) {
      router.push('/projets')
    } else {
      router.push('/projets')
    }
  }

  // N'afficher que les éditions avec des projets, + la première sans projets s'il y en a une
  const editionsAffichees = editions.filter(e => e.nbProjets > 0)

  return (
    <section className="bg-[var(--oif-navy)]/95 border-t border-white/10 pb-6 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Titre compact — réduit au minimum */}
        <div className="text-center pt-5 pb-4">
          <p className="text-white/70 text-sm font-medium">
            Sélectionnez une édition CREXE
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
                onClick={() => handleSelect(ed.annee, isActive)}
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

        {/* Trait de séparation discret */}
        <div className="border-t border-white/10 mt-4" />

      </div>
    </section>
  )
}
