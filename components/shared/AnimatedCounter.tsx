'use client'
// ─── Compteur animé : compte de 0 à la valeur cible quand visible ──────────
// Usage : <AnimatedCounter value={9475} suffix=" femmes" duration={1800} />
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  /** Valeur cible numérique (ex : 9475) */
  value: number
  /** Préfixe optionnel (ex : "≈") */
  prefix?: string
  /** Suffixe optionnel (ex : " femmes", "%") */
  suffix?: string
  /** Durée de l'animation en ms (défaut : 1600) */
  duration?: number
  /** Nombre de décimales (défaut : 0) */
  decimals?: number
  /** Classes CSS supplémentaires */
  className?: string
  /** Locale pour le formatage (défaut : fr-FR) */
  locale?: string
}

// Easing : easeOutExpo — rapide au début, ralentit à la fin (effet "choc")
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1600,
  decimals = 0,
  className = '',
  locale = 'fr-FR',
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState<string>('0')
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number | null>(null)

  // Observer : démarre l'animation quand l'élément entre dans le viewport
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  // Animation : requestAnimationFrame avec easing
  useEffect(() => {
    if (!started) return

    const startTime = performance.now()
    const from = 0

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      const current = from + (value - from) * eased

      const formatted = current.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
      setDisplay(formatted)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [started, value, duration, decimals, locale])

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${value.toLocaleString(locale, { maximumFractionDigits: decimals })}${suffix}`}>
      {prefix}{display}{suffix}
    </span>
  )
}
