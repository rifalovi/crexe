'use client'
// ─── EraHomepageBlock — Bloc ERA sur la page d'accueil ───────────────────────
// Présente les éditions ERA disponibles avec sélecteur.
// ERA 2024 → navigation vers /resultats-era
// ERA 2025 → popup "Bientôt disponible"
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import Link from 'next/link'

export default function EraHomepageBlock() {
  const [showPopup, setShowPopup] = useState(false)

  return (
    <>
      <section className="bg-white border-t border-gray-100 py-14">
        <div className="max-w-7xl mx-auto px-6">

          {/* En-tête section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-[var(--oif-blue)] uppercase tracking-widest mb-2">
                Enquête Rapide Annuelle
              </p>
              <h2 className="font-editorial text-2xl md:text-3xl font-semibold text-[var(--oif-blue-dark)]">
                Résultats ERA — Effets mesurés sur le terrain
              </h2>
              <p className="text-gray-500 text-sm mt-2 max-w-xl leading-relaxed">
                Chaque année, l&apos;OIF enquête ses bénéficiaires directs pour mesurer les effets
                réels de ses interventions. Sélectionnez une édition pour consulter les résultats.
              </p>
            </div>
            <Link
              href="/a-propos"
              className="flex-shrink-0 text-xs text-gray-400 hover:text-[var(--oif-blue)] transition flex items-center gap-1"
            >
              🔬 Méthodologie ERA →
            </Link>
          </div>

          {/* Grille des éditions ERA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* ── ERA 2024 — Disponible ─────────────────────────────────────── */}
            <Link
              href="/resultats-era"
              className="group relative rounded-2xl border-2 border-[var(--oif-blue)] bg-[var(--oif-blue)]/3 hover:bg-[var(--oif-blue)]/6 p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.01]"
            >
              {/* Badge disponible */}
              <span className="absolute -top-3 left-5 bg-[var(--oif-blue)] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                ✓ Disponible
              </span>

              <div className="flex items-center gap-3 mb-5 mt-1">
                <div className="w-12 h-12 rounded-xl bg-[var(--oif-blue)] flex items-center justify-center text-white font-black text-base flex-shrink-0">
                  24
                </div>
                <div>
                  <p className="font-bold text-[var(--oif-blue-dark)] text-base leading-tight">
                    Résultats ERA 2024
                  </p>
                  <p className="text-xs text-[var(--oif-blue)] font-medium mt-0.5">
                    Rapport publié · Août 2025
                  </p>
                </div>
              </div>

              {/* Chiffres-clés */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { val: '13', label: 'projets enquêtés' },
                  { val: '3', label: 'programmes' },
                  { val: '34', label: 'États membres' },
                ].map(({ val, label }) => (
                  <div key={label} className="bg-white/70 rounded-xl p-2.5 text-center border border-[var(--oif-blue)]/10">
                    <p className="text-base font-black text-[var(--oif-blue)] leading-tight">{val}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Aperçu des PS */}
              <div className="space-y-1.5 mb-5">
                {[
                  { ps: 'PS1', label: 'Langue & Éducation', taux: '75–99%', couleur: '#003DA5' },
                  { ps: 'PS2', label: 'Démocratie & Gouvernance', taux: '49–94%', couleur: '#6B2C91' },
                  { ps: 'PS3', label: 'Développement durable', taux: '55–100%', couleur: '#0F6E56' },
                ].map(({ ps, label, taux, couleur }) => (
                  <div key={ps} className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ backgroundColor: couleur + '20', color: couleur }}
                    >
                      {ps}
                    </span>
                    <span className="text-xs text-gray-600 flex-1 truncate">{label}</span>
                    <span className="text-xs font-bold flex-shrink-0" style={{ color: couleur }}>{taux}</span>
                  </div>
                ))}
              </div>

              <div className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-[var(--oif-blue)] text-white group-hover:bg-[var(--oif-blue-dark)] transition-colors">
                Consulter les résultats →
              </div>
            </Link>

            {/* ── ERA 2025 — Bientôt disponible ─────────────────────────────── */}
            <button
              onClick={() => setShowPopup(true)}
              className="group relative rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 p-6 transition-all duration-200 text-left hover:border-gray-300"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 font-black text-base flex-shrink-0">
                  25
                </div>
                <div>
                  <p className="font-bold text-gray-600 text-base leading-tight">
                    Résultats ERA 2025
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    En cours · Programmation 2024–2027
                  </p>
                </div>
              </div>

              {/* Placeholder stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {['—', '—', '—'].map((v, i) => (
                  <div key={i} className="bg-white/80 rounded-xl p-2.5 text-center border border-gray-100">
                    <p className="text-base font-black text-gray-300 leading-tight">{v}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">à venir</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-xs text-gray-400">
                  Enquête en cours auprès des bénéficiaires OIF
                </p>
              </div>

              <div className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-gray-200 text-gray-400 group-hover:bg-gray-300 transition-colors">
                Bientôt disponible
              </div>
            </button>

            {/* ── ERA 2026 — Prévu ──────────────────────────────────────────── */}
            <div className="rounded-2xl border border-dashed border-gray-100 bg-gray-50/30 p-6 flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 font-black text-base mb-3">
                26
              </div>
              <p className="text-sm font-semibold text-gray-400">ERA 2026</p>
              <p className="text-xs text-gray-300 mt-1">Prévu fin 2026</p>
            </div>

          </div>

          {/* Légende niveaux ERA */}
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Niveaux ERA :
            </p>
            {[
              { icon: '🎓', label: 'Acquisition des compétences' },
              { icon: '🔄', label: 'Effets intermédiaires' },
              { icon: '🌱', label: 'Retombées observées' },
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                {icon} {label}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* ── Popup "Bientôt disponible" ─────────────────────────────────────── */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-3xl mx-auto mb-5">
              🔔
            </div>
            <h3 className="font-semibold text-[var(--oif-blue-dark)] text-lg mb-2">
              Résultats ERA 2025
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              L&apos;enquête ERA 2025 est actuellement en cours auprès des bénéficiaires
              des projets OIF. Les résultats seront disponibles sur cette plateforme
              dès la publication du rapport.
            </p>
            <div className="flex items-center gap-2 justify-center mb-6 text-xs text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Publication prévue : courant 2026
            </div>
            <div className="flex gap-3">
              <Link
                href="/resultats-era"
                className="flex-1 text-sm font-semibold text-[var(--oif-blue)] bg-[var(--oif-blue)]/8 px-4 py-2.5 rounded-xl hover:bg-[var(--oif-blue)]/15 transition"
                onClick={() => setShowPopup(false)}
              >
                Voir ERA 2024 →
              </Link>
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 text-sm text-gray-500 bg-gray-100 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
