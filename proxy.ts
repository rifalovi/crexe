import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Routes protégées ────────────────────────────────────────────────────────
// Toutes les routes commençant par /admin nécessitent une authentification.
// Le middleware s'exécute côté serveur AVANT que la page soit rendue :
// c'est le premier "gardien" de l'application.

export async function proxy(request: NextRequest) {
  // On crée une réponse vide que l'on va potentiellement modifier
  let supabaseResponse = NextResponse.next({
    request,
  })

  // createServerClient lit/écrit les cookies de session Supabase
  // Note : le middleware ne peut PAS utiliser le client "serveur" classique
  // car il n'a pas accès aux server actions — il utilise un client spécial SSR.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // On propage les cookies mis à jour vers la réponse
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT : getUser() est la seule méthode fiable pour vérifier l'auth
  // getSession() peut retourner une session expirée non détectée côté serveur
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ─── Routes publiques (accessibles sans connexion) ────────────────────────
  // Seules ces routes restent accessibles sans authentification :
  //  - /login           → page de connexion
  //  - /demande-acces   → formulaire de demande d'activation de compte
  //  - /api/edition     → cookie d'édition (lecture seule)
  //  - /api/contact     → formulaire de contact public
  const PUBLIC_PATHS = ['/login', '/demande-acces']
  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p))
    || pathname.startsWith('/api/edition')
    || pathname.startsWith('/api/contact')

  // ─── Redirection si non authentifié ──────────────────────────────────────
  // TOUTES les routes (publiques + admin) nécessitent maintenant une connexion.
  // L'exception : les chemins publics listés ci-dessus.
  if (!user && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ─── Redirection si déjà connecté et visite /login ────────────────────────
  if (pathname === '/login' && user) {
    const redirect = request.nextUrl.searchParams.get('redirect')
    return NextResponse.redirect(new URL(redirect ?? '/', request.url))
  }

  return supabaseResponse
}

// ─── Quelles routes passent par le middleware ? ──────────────────────────────
// On exclut les fichiers statiques, images, fonts et favicon pour ne pas
// alourdir le chargement des assets côté navigateur.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
