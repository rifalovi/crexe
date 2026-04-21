'use client'
// ─── EraEditionSwitcher — Sélecteur d'édition ERA sur la page des résultats ──
// Permet de naviguer entre les éditions ERA disponibles.
// ERA 2024 → page courante (actif)
// ERA 2025 → popup "Bientôt disponible"
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'

export default function EraEditionSwitcher() {
  const [showPopup, setShowPopup] = useState(false)

  return (
    <>
      {/* ── Bandeau sélecteur d'édition ───────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
            Édition :
          </span>

          {/* ERA 2024 — actif */}
          <div className="flex items-center gap-2 bg-[var(--oif-blue)] text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white/80" />
            ERA 2024
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full ml-1">
              En ligne
            </span>
          </div>

          {/* ERA 2025 — bientôt disponible */}
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center gap-2 border-2 border-dashed border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-600 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 group"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            ERA 2025
            <span className="text-[10px] bg-amber-50 text-amber-500 group-hover:bg-amber-100 px-2 py-0.5 rounded-full ml-1 border border-amber-200 transition">
              Bientôt
            </span>
          </button>

          {/* ERA 2026 — prévu */}
          <div className="flex items-center gap-2 border border-gray-100 text-gray-300 px-4 py-2 rounded-full text-sm font-semibold opacity-60 cursor-not-allowed">
            ERA 2026
            <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded-full ml-1 border border-gray-100">
              Prévu
            </span>
          </div>

          {/* Indicateur résultats chargés */}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-[var(--oif-green)] bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--oif-green)]" />
            Rapport publié · Août 2025
          </div>
        </div>
      </div>

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
            <button
              onClick={() => setShowPopup(false)}
              className="w-full text-sm text-gray-500 bg-gray-100 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  )
}
