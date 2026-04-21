'use client'
// ─── HeroCarousel — Grande bannière photo de la page d'accueil ───────────────
// Composant client : gère le défilement automatique (toutes les 4,5 s),
// la navigation par points, et le survol (pause automatique).
//
// Concept pédagogique — useEffect & setInterval :
// `useEffect` s'exécute après le montage du composant (côté navigateur).
// On y démarre un intervalle qui avance le slide courant toutes les N ms.
// On nettoie l'intervalle dans la fonction de retour de useEffect pour éviter
// les fuites mémoire quand le composant est démonté ou quand `isPaused` change.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface Slide {
  src: string
  alt: string
  legende: string
  projet: string
  programme: string
  couleur: string   // couleur thème du programme (ex: '#003DA5')
}

const SLIDES: Slide[] = [
  {
    src: '/images/carousel/slide1-dclic-workshop.jpg',
    alt: 'Atelier D-CLIC — jeunes entrepreneurs numériques au travail',
    legende: 'Former les jeunes au numérique en Afrique francophone',
    projet: 'Projet D-CLIC Pro',
    programme: 'PS3 — Développement durable',
    couleur: '#0F6E56',
  },
  {
    src: '/images/carousel/slide2-dclic-groupe.jpg',
    alt: 'Groupe de participants au programme D-CLIC — célébration collective',
    legende: 'Des centaines de jeunes diplômés du numérique chaque année',
    projet: 'Projet D-CLIC',
    programme: 'PS3 — Développement durable',
    couleur: '#0F6E56',
  },
  {
    src: '/images/carousel/slide3-elan-dakar.jpg',
    alt: 'Comité scientifique ELAN — Dakar, décembre 2024',
    legende: 'Ensemble pour une éducation inclusive et de qualité en francophonie',
    projet: 'Projet ELAN Afrique',
    programme: 'PS1 — Langue française & Éducation',
    couleur: '#003DA5',
  },
  {
    src: '/images/carousel/slide4-clac-comores.jpg',
    alt: 'Bibliothèque CLAC aux Comores — lecteurs et livres',
    legende: 'Des bibliothèques communautaires pour tous aux Comores',
    projet: 'Programme CLAC',
    programme: 'PS1 — Langue française & Éducation',
    couleur: '#003DA5',
  },
  {
    src: '/images/carousel/slide5-mef-madagascar.jpg',
    alt: 'Mission économique et francophone 2024 à Madagascar',
    legende: 'Renforcer la gouvernance économique dans l\'espace francophone',
    projet: 'MEF 2024 Madagascar',
    programme: 'PS2 — Démocratie & Gouvernance',
    couleur: '#6B2C91',
  },
]

const INTERVALLE_MS = 4500
const TRANSITION_MS = 700

export default function HeroCarousel() {
  const [courant, setCourant] = useState(0)
  const [precedent, setPrecedent] = useState<number | null>(null)
  const [enTransition, setEnTransition] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Avancer au slide suivant avec animation de fondu
  const allerAu = useCallback((index: number) => {
    if (enTransition) return
    setEnTransition(true)
    setPrecedent(courant)
    setCourant(index)
    setTimeout(() => {
      setPrecedent(null)
      setEnTransition(false)
    }, TRANSITION_MS)
  }, [courant, enTransition])

  const suivant = useCallback(() => {
    allerAu((courant + 1) % SLIDES.length)
  }, [courant, allerAu])

  const precedentSlide = useCallback(() => {
    allerAu((courant - 1 + SLIDES.length) % SLIDES.length)
  }, [courant, allerAu])

  // Défilement automatique — s'arrête si l'utilisateur survole le carrousel
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(suivant, INTERVALLE_MS)
    return () => clearInterval(timer)
  }, [suivant, isPaused])

  const slide = SLIDES[courant]
  const slidePrec = precedent !== null ? SLIDES[precedent] : null

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(380px, 60vh, 680px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Carrousel de photos des projets OIF"
      role="region"
    >
      {/* ── Image précédente (fondu sortant) ─────────────────────────────────── */}
      {slidePrec && (
        <div
          className="absolute inset-0 z-10"
          style={{
            opacity: enTransition ? 0 : 1,
            transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
          }}
        >
          <Image
            src={slidePrec.src}
            alt={slidePrec.alt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        </div>
      )}

      {/* ── Image courante (fondu entrant) ───────────────────────────────────── */}
      <div
        className="absolute inset-0 z-20"
        style={{
          opacity: enTransition ? 1 : 1,
          transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
        }}
      >
        <Image
          src={slide.src}
          alt={slide.alt}
          fill
          className="object-cover"
          priority={courant === 0}
          sizes="100vw"
        />
        {/* Dégradé bas pour lisibilité de la légende */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
      </div>

      {/* ── Contenu superposé ─────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-30 flex flex-col justify-end pb-12 px-6 md:px-12 lg:px-20">
        <div
          className="max-w-2xl"
          style={{
            opacity: enTransition ? 0 : 1,
            transform: enTransition ? 'translateY(8px)' : 'translateY(0)',
            transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
          }}
        >
          {/* Badge programme */}
          <span
            className="inline-flex items-center gap-1.5 text-white text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3"
            style={{ backgroundColor: slide.couleur + 'CC' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
            {slide.programme}
          </span>

          {/* Légende principale */}
          <p className="text-white text-xl md:text-2xl lg:text-3xl font-semibold leading-snug mb-2 drop-shadow-md">
            {slide.legende}
          </p>

          {/* Nom du projet */}
          <p className="text-white/60 text-sm font-medium">
            {slide.projet}
          </p>
        </div>
      </div>

      {/* ── Navigation — flèches gauche / droite ─────────────────────────────── */}
      <button
        onClick={precedentSlide}
        aria-label="Slide précédent"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={suivant}
        aria-label="Slide suivant"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ── Navigation — points de progression ───────────────────────────────── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => allerAu(i)}
            aria-label={`Aller au slide ${i + 1}`}
            className="transition-all duration-300"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === courant
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          </button>
        ))}
      </div>

      {/* ── Barre de progression temporelle ──────────────────────────────────── */}
      {!isPaused && (
        <div className="absolute bottom-0 left-0 right-0 z-40 h-0.5 bg-white/10">
          <div
            key={courant}
            className="h-full bg-white/60 carousel-progress-bar"
          />
        </div>
      )}
    </div>
  )
}
