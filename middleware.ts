// ─── Middleware Supabase + protection des routes admin ────────────────────────
//
// Concept pédagogique — Pourquoi ce fichier est CRITIQUE :
// Next.js App Router gère les requêtes via Edge Middleware AVANT de rendre les
// pages. Supabase SSR utilise ce middleware pour deux choses essentielles :
//
//  1. RAFRAÎCHIR LE TOKEN JWT — Le token d'authentification expire toutes les
//     60 min. Sans ce middleware, après expiration, auth.uid() retourne null
//     et toutes les politiques RLS bloquent les écritures (même pour les admins).
//
//  2. PROPAGER LES COOKIES — Les cookies de session doivent être lus dans la
//     requête entrante ET réécrits dans la réponse sortante à chaque page.
//     Sans ça, le Server Component et le Client Component voient des sessions
//     différentes.
//
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Préparer la réponse — elle sera enrichie avec les cookies de session
  let supabaseResponse = NextResponse.next({ request })

  // Créer un client Supabase capable de lire ET d'écrire les cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Écrire dans la requête (pour les Server Components de cette passe)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Recréer la réponse avec les nouveaux cookies
          supabaseResponse = NextResponse.next({ request })
          // Écrire dans la réponse (pour le navigateur)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ── Rafraîchir la session (opération clé) ──────────────────────────────────
  // Ne PAS utiliser getSession() ici — getUser() est plus sûr car il valide
  // le token côté serveur Supabase, pas seulement en local.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Protection des routes admin ────────────────────────────────────────────
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute && !user) {
    // Rediriger vers la page de connexion en conservant la destination
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Retourner la réponse avec les cookies de session mis à jour
  return supabaseResponse
}

// ── Matcher — routes sur lesquelles le middleware s'exécute ───────────────────
// On exclut les fichiers statiques (_next/, images, fonts) pour éviter de
// ralentir le chargement des assets.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
