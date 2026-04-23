// ─── API Route : Changer l'édition active ────────────────────────────────────
// POST /api/edition  { annee: 2024 | 2025 | ... }
//
// Concept pédagogique — Cookies côté serveur via Response headers :
// En Next.js App Router, pour écrire un cookie depuis un Route Handler,
// on utilise `cookies().set()` ou on ajoute un header Set-Cookie à la Response.
// Cela garantit que le cookie est présent dès la prochaine requête SSR,
// contrairement à document.cookie qui n'est visible qu'après le rendu client.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE_EDITION } from '@/lib/edition-context'
import { CREX_ANNEE } from '@/lib/constants'

// Éditions reconnues (protection contre des valeurs arbitraires)
const EDITIONS_VALIDES = [2024, 2025, 2026]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const annee = body?.annee

    if (!annee || !EDITIONS_VALIDES.includes(annee)) {
      return NextResponse.json({ error: 'Édition invalide' }, { status: 400 })
    }

    // Écrire le cookie côté serveur
    // next/headers cookies() est disponible dans les Route Handlers
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_EDITION, String(annee), {
      httpOnly: false,      // lisible par JS client (EditionSwitcher)
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    })

    return NextResponse.json({
      success: true,
      edition: annee,
      message: `Édition CREXE ${annee} activée`,
    })
  } catch (err) {
    console.error('[API Edition]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET /api/edition — deux usages :
//   1. Sans params : retourne l'édition active (JSON)
//   2. Avec ?annee=2025&redirect=/admin : change l'édition et redirige (dashboard switcher)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const anneeParam = searchParams.get('annee')
    const redirectTo = searchParams.get('redirect')

    if (anneeParam && redirectTo) {
      const annee = parseInt(anneeParam, 10)
      if (!EDITIONS_VALIDES.includes(annee)) {
        return NextResponse.json({ error: 'Édition invalide' }, { status: 400 })
      }
      const cookieStore = await cookies()
      cookieStore.set(COOKIE_EDITION, String(annee), {
        httpOnly: false, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
      })
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }

    const cookieStore = await cookies()
    const val  = cookieStore.get(COOKIE_EDITION)?.value
    const annee = val ? parseInt(val, 10) : CREX_ANNEE
    return NextResponse.json({ edition: isNaN(annee) ? CREX_ANNEE : annee })
  } catch {
    return NextResponse.json({ edition: CREX_ANNEE })
  }
}
