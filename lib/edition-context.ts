// ─── Contexte d'édition CREXE ────────────────────────────────────────────────
// Gère l'édition active (2024, 2025, 2026…) côté serveur et côté client.
//
// Concept pédagogique — Cookies HTTP vs localStorage :
// Les cookies sont lisibles côté serveur (dans les Server Components et API routes)
// contrairement à localStorage qui n'existe que dans le navigateur. Pour un
// filtre d'édition qui doit s'appliquer dès le SSR (Server-Side Rendering),
// on utilise un cookie.
//
// Valeur par défaut : CREX_ANNEE (2025) défini dans lib/constants.ts
// Nom du cookie : "crexe_edition"
// ─────────────────────────────────────────────────────────────────────────────

import { CREX_ANNEE } from '@/lib/constants'

export const COOKIE_EDITION = 'crexe_edition'

// ─── 1. Lecture serveur (Server Components + API routes) ─────────────────────
/**
 * Lit l'édition active depuis le cookie HTTP (côté serveur).
 * Si le cookie est absent ou invalide, retourne l'édition par défaut (CREX_ANNEE).
 *
 * Concept : Next.js 14+ expose `cookies()` uniquement dans les Server Components
 * et les Route Handlers. Ne pas appeler depuis un composant client.
 */
export async function getEditionActive(): Promise<number> {
  try {
    // Import dynamique — 'next/headers' reste invisible du bundler client.
    // Concept : un import() dynamique n'est résolu qu'à l'exécution, pas au
    // moment où le module est analysé par Turbopack. Les Client Components ne
    // voient jamais ce module dans leur bundle.
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const val = cookieStore.get(COOKIE_EDITION)?.value
    if (val) {
      const parsed = parseInt(val, 10)
      if (!isNaN(parsed) && parsed >= 2024 && parsed <= 2030) {
        return parsed
      }
    }
  } catch {
    // cookies() lance une exception hors contexte request (ex: build statique)
  }
  return CREX_ANNEE
}

// ─── 2. Lecture depuis les headers de la requête (Route Handlers) ─────────────
/**
 * Lit l'édition depuis les headers ou le body d'une requête Next.js Route Handler.
 * Priorité : header "x-crexe-edition" > cookie > corps JSON > défaut.
 *
 * Permet au client JS d'envoyer l'édition explicitement dans la requête fetch
 * (ex: le ChatWidget connaît l'édition active via son état local).
 */
export function getEditionFromRequest(
  headers: Headers,
  bodyEdition?: number | null
): number {
  // 1. Header HTTP explicite (le plus direct)
  const headerVal = headers.get('x-crexe-edition')
  if (headerVal) {
    const parsed = parseInt(headerVal, 10)
    if (!isNaN(parsed) && parsed >= 2024) return parsed
  }

  // 2. Cookie dans les headers
  const cookieHeader = headers.get('cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`${COOKIE_EDITION}=(\\d+)`))
  if (match) {
    const parsed = parseInt(match[1], 10)
    if (!isNaN(parsed) && parsed >= 2024) return parsed
  }

  // 3. Valeur envoyée dans le corps JSON
  if (bodyEdition && typeof bodyEdition === 'number' && bodyEdition >= 2024) {
    return bodyEdition
  }

  // 4. Défaut
  return CREX_ANNEE
}

// ─── 3. Utilitaires côté client (lecture du cookie depuis le navigateur) ──────
/**
 * Lit le cookie d'édition depuis document.cookie (côté client uniquement).
 * À appeler depuis un composant 'use client'.
 */
export function getEditionActiveCookie(): number {
  if (typeof document === 'undefined') return CREX_ANNEE
  const match = document.cookie.match(new RegExp(`${COOKIE_EDITION}=(\\d+)`))
  if (match) {
    const parsed = parseInt(match[1], 10)
    if (!isNaN(parsed) && parsed >= 2024) return parsed
  }
  return CREX_ANNEE
}

/**
 * Écrit le cookie d'édition côté client.
 * Durée : 7 jours. SameSite=Lax pour la sécurité.
 */
export function setEditionActiveCookie(annee: number): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${COOKIE_EDITION}=${annee};expires=${expires};path=/;SameSite=Lax`
}

// ─── 4. Route API pour changer l'édition ─────────────────────────────────────
// Voir app/api/edition/route.ts (à créer) — met à jour le cookie côté serveur
// via Response.headers pour que le SSR soit cohérent immédiatement.
