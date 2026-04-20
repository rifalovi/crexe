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

  // ─── Redirection si non authentifié sur les routes admin ─────────────────
  if (pathname.startsWith('/admin') && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname) // on mémorise la destination
    return NextResponse.redirect(loginUrl)
  }

  // ─── Redirection si déjà connecté et visite /login ────────────────────────
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

// ─── Quelles routes passent par le middleware ? ──────────────────────────────
// On exclut les fichiers statiques, images, et l'API pour ne pas alourdir
// inutilement les requêtes sur les assets.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
