'use client'
// ─── Chaîne des résultats — Pipeline interactif ───────────────────────────────
// Visualisation de la théorie du changement CAD-OCDE :
//   Impact → Effets intermédiaires → Effets immédiats → Extrants
//
// Concept pédagogique :
//   La chaîne de résultats est une lecture ascendante : les extrants (ce qu'on
//   a produit) alimentent les effets immédiats (ce qui a changé à court terme),
//   qui génèrent des effets intermédiaires (changements de comportements), qui
//   contribuent in fine à l'impact (transformation structurelle durable).
//
// Design : inspiré du "Tableau 3 — Chaîne d'impact reconstituée" de l'ERA 2024
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NiveauData {
  titre: string
  items: string[]
}

export interface ChaineResultatsData {
  impact:                 NiveauData
  effets_intermediaires:  NiveauData
  effets_immediats:       NiveauData
  extrants:               NiveauData
}

export interface ActiviteStructurante {
  volume: string
  action: string
}

// ─── Configuration visuelle des 4 niveaux ────────────────────────────────────
// Ordre d'affichage : IMPACT en haut → EXTRANTS en bas (lecture ascendante ↑)
const NIVEAUX = [
  {
    key:       'impact'               as const,
    label:     'Impact',
    sublabel:  'Long terme · Transformation structurelle',
    color:     '#6B2C91',
    bgLight:   '#F5EEFA',
    bgDark:    '#6B2C91',
    numero:    'Niveau 4',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
      </svg>
    ),
  },
  {
    key:       'effets_intermediaires' as const,
    label:     'Effets intermédiaires',
    sublabel:  'Moyen terme · Changements de comportement',
    color:     '#B83A2D',
    bgLight:   '#FEF2F1',
    bgDark:    '#B83A2D',
    numero:    'Niveau 3',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
      </svg>
    ),
  },
  {
    key:       'effets_immediats' as const,
    label:     'Effets immédiats',
    sublabel:  'Court terme · Compétences et accès',
    color:     '#C07A10',
    bgLight:   '#FFF8ED',
    bgDark:    '#C07A10',
    numero:    'Niveau 2',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.091z"/>
      </svg>
    ),
  },
  {
    key:       'extrants' as const,
    label:     'Extrants',
    sublabel:  'Réalisations directes · Données quantifiées',
    color:     '#0F6E56',
    bgLight:   '#EEF9F6',
    bgDark:    '#0F6E56',
    numero:    'Niveau 1',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
      </svg>
    ),
  },
]

// ─── Composant principal ──────────────────────────────────────────────────────
interface Props {
  data: ChaineResultatsData
  activites?: ActiviteStructurante[]
  accentColor?: string
}

export function ChaineResultats({ data, activites = [], accentColor = '#003DA5' }: Props) {
  // Par défaut : le premier niveau ouvert est "extrants" (point de départ logique)
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set(['extrants', 'impact']))

  const toggle = (key: string) =>
    setOpenKeys(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const openAll  = () => setOpenKeys(new Set(NIVEAUX.map(n => n.key)))
  const closeAll = () => setOpenKeys(new Set())

  // Filtre les niveaux qui ont des données
  const niveauxAvecDonnees = NIVEAUX.filter(n => {
    const d = data[n.key]
    return d && (d.titre?.trim() || d.items?.length > 0)
  })

  if (niveauxAvecDonnees.length === 0) return null

  return (
    <div className="relative">

      {/* ─── Légende + contrôles ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {/* Légende couleurs */}
        <div className="flex flex-wrap items-center gap-3">
          {NIVEAUX.map(n => (
            <span key={n.key} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: n.color }} />
              {n.label}
            </span>
          ))}
        </div>
        {/* Contrôles */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <button onClick={openAll}  className="hover:text-gray-600 transition underline-offset-2 hover:underline">
            Tout développer
          </button>
          <span className="text-gray-200">·</span>
          <button onClick={closeAll} className="hover:text-gray-600 transition underline-offset-2 hover:underline">
            Tout réduire
          </button>
        </div>
      </div>

      {/* ─── Pipeline vertical ───────────────────────────────────────────── */}
      <div className="flex gap-0 md:gap-5">

        {/* Indicateur de lecture latéral (desktop) */}
        <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0 w-10 select-none">
          <div className="flex flex-col items-center gap-2 text-gray-300">
            {/* Flèche vers le haut */}
            <svg width="12" height="48" viewBox="0 0 12 48" fill="none">
              <path d="M6 48V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M1 9L6 1L11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span
              className="text-[9px] uppercase tracking-[0.15em] font-semibold text-gray-300"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Lecture ascendante
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 12V2M1 7L6 12L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Les 4 niveaux */}
        <div className="flex-1 flex flex-col gap-0">
          {niveauxAvecDonnees.map((niveau, index) => {
            const d       = data[niveau.key]
            const isOpen  = openKeys.has(niveau.key)
            const isLast  = index === niveauxAvecDonnees.length - 1

            return (
              <div key={niveau.key} className="flex flex-col">

                {/* ─── Carte du niveau ─────────────────────────────────── */}
                <div
                  className="rounded-xl overflow-hidden border transition-all duration-200"
                  style={{ borderColor: niveau.color + '50' }}
                >
                  {/* En-tête cliquable */}
                  <button
                    onClick={() => toggle(niveau.key)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start gap-3 px-5 py-4 text-left group transition-all duration-200"
                    style={{ backgroundColor: niveau.bgLight }}
                  >
                    {/* Badge niveau + icône */}
                    <div className="flex-shrink-0 flex items-center gap-2 mt-0.5">
                      <span
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: niveau.color }}
                      >
                        <span className="hidden sm:inline">{niveau.color && (
                          <span style={{ color: 'rgba(255,255,255,0.8)' }}>{niveau.numero} · </span>
                        )}</span>
                        {niveau.label}
                      </span>
                    </div>

                    {/* Titre + sous-label */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug" style={{ color: niveau.color }}>
                        {d.titre || niveau.sublabel}
                      </p>
                      <p className="text-xs mt-0.5 text-gray-400">{niveau.sublabel}</p>
                    </div>

                    {/* Compteur d'items + chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                      {d.items.length > 0 && (
                        <span
                          className="text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: niveau.color + 'CC' }}
                        >
                          {d.items.length}
                        </span>
                      )}
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke={niveau.color} strokeWidth="2.5"
                        className="flex-shrink-0 transition-transform duration-300"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Contenu développable */}
                  {isOpen && d.items.length > 0 && (
                    <div
                      className="px-5 py-5 bg-white border-t"
                      style={{ borderColor: niveau.color + '20' }}
                    >
                      <ul className="space-y-3">
                        {d.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-gray-700">
                            <span
                              className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: niveau.color }}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* ─── Connecteur flèche entre niveaux ─────────────────── */}
                {!isLast && (
                  <div className="flex flex-col items-center py-1" aria-hidden="true">
                    <div className="w-px h-3" style={{ backgroundColor: niveau.color + '60' }} />
                    {/* Flèche pointant vers le haut = extrants GÉNÈRENT les effets au-dessus */}
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                      <path
                        d="M7 0L1 7H13L7 0Z"
                        fill={(niveauxAvecDonnees[index + 1]?.color ?? '#ccc') + '70'}
                      />
                    </svg>
                    <div
                      className="w-px h-3"
                      style={{ backgroundColor: (niveauxAvecDonnees[index + 1]?.color ?? '#ccc') + '60' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Tableau des activités structurantes ─────────────────────────── */}
      {activites.length > 0 && (
        <div className="mt-10 rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
          {/* En-tête */}
          <div
            className="px-6 py-4 border-b flex items-center gap-3"
            style={{ backgroundColor: accentColor + '08', borderColor: accentColor + '20' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: accentColor + '20' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.2">
                <path strokeLinecap="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                Activités structurantes
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Volumes d&apos;actions déployées — exercice {new Date().getFullYear() - 1}
              </p>
            </div>
          </div>

          {/* Grille */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-50">
            {activites.map((a, i) => (
              <div key={i} className="px-5 py-4 group hover:bg-gray-50 transition-colors">
                <p
                  className="font-editorial text-2xl font-bold leading-tight mb-1"
                  style={{ color: accentColor }}
                >
                  {a.volume}
                </p>
                <p className="text-xs text-gray-600 leading-snug">{a.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
