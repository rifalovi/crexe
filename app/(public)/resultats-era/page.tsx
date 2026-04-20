// ─── Résultats ERA — Page publique ────────────────────────────────────────────
// Page en cours de développement. Affiche un message d'attente institutionnel.
// Structure prête pour accueillir les résultats d'enquête ERA par projet.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'

export const metadata = {
  title: 'Résultats ERA — CREXE 2025',
  description: "Résultats de la Mesure des Résultats et Apprentissages (ERA) par projet OIF.",
}

export default function ResultatsEraPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[var(--oif-blue)]/8 text-[var(--oif-blue)] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--oif-blue)] animate-pulse" />
          En cours de développement
        </div>

        <h1 className="font-editorial text-3xl md:text-4xl font-semibold text-[var(--oif-blue-dark)] mb-4">
          Résultats de l&apos;enquête ERA
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Mesure des Résultats et Apprentissages — Programmation 2024-2027
        </p>

        {/* Message Carlos */}
        <div className="bg-[var(--oif-neutral)] rounded-2xl border border-gray-100 px-7 py-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--oif-blue)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">CH</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Carlos H. · Responsable SCS</p>
              <p className="text-gray-700 leading-relaxed">
                Cher(e)s collègues, je suis toujours en train de développer cette partie de
                la plateforme. Dès qu&apos;elle sera achevée, je vous en tiendrai informé(e)s.
              </p>
              <p className="text-[var(--oif-blue)] font-semibold mt-3 text-sm">
                Bien cordialement, Carlos H.
              </p>
            </div>
          </div>
        </div>

        {/* Aperçu de la structure à venir */}
        <div className="rounded-2xl border border-dashed border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-dashed border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Structure prévue de cette section
            </p>
          </div>
          <div className="divide-y divide-dashed divide-gray-100">
            {[
              { icon: '📋', titre: 'Section Rappel', desc: 'Objectif ERA, périmètre, méthodologie et protocole d\'enquête par projet' },
              { icon: '📊', titre: 'Résultats par projet', desc: 'Questionnaire, population, échantillon, taux de complétion, tableaux détaillés' },
              { icon: '🤖', titre: 'Analyse IA intégrée', desc: 'Analyse automatique des résultats avec graphiques, rapport DOCX téléchargeable' },
              { icon: '📅', titre: 'Historique CREX', desc: 'Résultats ERA 2024 · 2025 · 2026 — comparaison inter-éditions' },
            ].map((item) => (
              <div key={item.titre} className="px-5 py-4 flex items-start gap-3 opacity-60">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{item.titre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Link href="/" className="inline-flex items-center gap-2 bg-[var(--oif-blue)] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[var(--oif-blue-dark)] transition">
            ← Accueil
          </Link>
          <Link href="/projets" className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-lg hover:border-[var(--oif-blue)] hover:text-[var(--oif-blue)] transition">
            Voir les projets
          </Link>
        </div>
      </div>
    </div>
  )
}
