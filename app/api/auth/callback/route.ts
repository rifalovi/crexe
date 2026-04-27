// ─── Route API auth/callback — échange de code Supabase ──────────────────────
//
// Concept pédagogique — Pourquoi cette route ?
// Supabase envoie des liens magiques (réinitialisation mdp, invitation) sous la
// forme : https://monsite.com/auth/callback?code=xxxx
// Le "code" est un token à usage unique que l'on échange contre une session JWT
// via supabase.auth.exchangeCodeForSession(code).
// Sans cette route, les liens Supabase ne fonctionnent pas — l'utilisateur
// arrive sur une page blanche sans être connecté.
//
// Flux :
//   1. Supabase envoie l'email avec un lien → /auth/callback?code=xxx&type=recovery
//   2. Cette route échange le code contre une session (cookie HTTP-only)
//   3. Elle redirige vers /nouveau-mot-de-passe (si type=recovery) ou /admin
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const type  = searchParams.get('type')   // 'recovery' | 'invite' | 'signup' | null
  const next  = searchParams.get('next') ?? '/admin'

  // URL de base pour les redirections
  const baseUrl = request.nextUrl.origin

  if (!code) {
    // Pas de code → redirection vers login avec message d'erreur
    return NextResponse.redirect(`${baseUrl}/login?error=lien_invalide`)
  }

  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // ── Échange du code OTP contre une session ────────────────────────────────
    // exchangeCodeForSession() valide le token, crée une session et pose
    // les cookies sb-* (access_token + refresh_token) dans la réponse.
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession :', error.message)
      return NextResponse.redirect(`${baseUrl}/login?error=lien_expire`)
    }

    // ── Redirection post-échange ──────────────────────────────────────────────
    // Si c'est une récupération de mot de passe → page de saisie du nouveau mdp
    if (type === 'recovery') {
      return NextResponse.redirect(`${baseUrl}/nouveau-mot-de-passe`)
    }

    // Invitation ou connexion normale → destination demandée (ou /admin)
    return NextResponse.redirect(`${baseUrl}${next}`)

  } catch (e) {
    console.error('[auth/callback] exception :', e)
    return NextResponse.redirect(`${baseUrl}/login?error=erreur_interne`)
  }
}
