'use client'

// ─── Sélecteur d'édition CREXE ───────────────────────────────────────────────
// Permet à l'utilisateur de basculer entre les éditions disponibles (2024, 2025…).
//
// Concept pédagogique — Rechargement après changement de cookie :
// Quand on change l'édition, on écrit un cookie PUIS on recharge la page via
// router.refresh(). Cela force Next.js à re-exécuter tous les Server Components
// et les fetch() côté serveur avec le nouveau cookie — garantissant que toutes
// les données (projets, stats, RAG) reflètent la bonne édition.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getEditionActiveCookie, setEditionActiveCookie } from '@/lib/edition-context'
import { CREX_ANNEE } from '@/lib/constants'

// ─── Éditions disponibles — à terme lues depuis Supabase via une API ─────────
// Pour l'instant, liste statique des deux exercices disponibles.
const EDITIONS_DISPONIBLES = [
  { annee: 2025, libelle: 'CREXE 2025', statut: 'en_cours' },
  { annee: 2024, libelle: 'CREXE 2024', statut: 'clos' },
]

interface Props {
  /** Affichage compact pour la nav (défaut false = pills visibles) */
  compact?: boolean
  /** Callback facultatif appelé après le changement */
  onEditionChange?: (annee: number) => void
}

export default function EditionSwitcher({ compact = false, onEditionChange }: Props) {
  const router = useRouter()
  const [editionActive, setEditionActive] = useState<number>(CREX_ANNEE)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Lire le cookie au montage (côté client)
  useEffect(() => {
    setEditionActive(getEditionActiveCookie())
  }, [])

  // Fermer le dropdown si clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSelect(annee: number) {
    if (annee === editionActive) { setOpen(false); return }
    setLoading(true)
    setOpen(false)

    // Écrire le cookie côté client immédiatement
    setEditionActiveCookie(annee)
    setEditionActive(annee)

    // Appeler la route API pour écrire le cookie côté serveur (SSR cohérent)
    try {
      await fetch('/api/edition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annee }),
      })
    } catch {
      // Silencieux : le cookie client suffit pour le comportement de base
    }

    onEditionChange?.(annee)

    // Recharger les Server Components avec le nouveau cookie
    router.refresh()
    setLoading(false)
  }

  const editionCourante = EDITIONS_DISPONIBLES.find(e => e.annee === editionActive)
    ?? EDITIONS_DISPONIBLES[0]

  // ── Mode compact : dropdown ──────────────────────────────────────────────
  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     bg-[var(--oif-blue)]/10 text-[var(--oif-blue)] hover:bg-[var(--oif-blue)]/20
                     border border-[var(--oif-blue)]/20 transition disabled:opacity-60"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--oif-gold)] inline-block" />
          {loading ? '…' : editionCourante.libelle}
          <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1"
               role="listbox">
            {EDITIONS_DISPONIBLES.map(ed => (
              <button
                key={ed.annee}
                role="option"
                aria-selected={ed.annee === editionActive}
                onClick={() => handleSelect(ed.annee)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition
                  ${ed.annee === editionActive
                    ? 'bg-[var(--oif-blue)]/8 text-[var(--oif-blue)] font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {ed.annee === editionActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--oif-blue)] flex-shrink-0" />
                )}
                {ed.annee !== editionActive && (
                  <span className="w-1.5 h-1.5 flex-shrink-0" />
                )}
                <span>{ed.libelle}</span>
                {ed.statut === 'clos' && (
                  <span className="ml-auto text-xs text-gray-400">Archivé</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Mode normal : pills visibles ─────────────────────────────────────────
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200">
      <span className="text-xs text-gray-500 px-2 font-medium hidden sm:inline">Édition</span>
      {EDITIONS_DISPONIBLES.map(ed => (
        <button
          key={ed.annee}
          onClick={() => handleSelect(ed.annee)}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-60
            ${ed.annee === editionActive
              ? 'bg-white text-[var(--oif-blue)] shadow-sm border border-gray-200'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          {ed.annee}
        </button>
      ))}
    </div>
  )
}
