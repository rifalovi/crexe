'use client'

// ─── Page de connexion ────────────────────────────────────────────────────────
// Cette page utilise Supabase Auth pour l'authentification email/password.
//
// Concept "use client" :
// Next.js App Router rend les composants côté serveur par défaut (RSC).
// Dès qu'on a besoin d'interactivité (useState, événements, hooks), on ajoute
// 'use client' pour passer en mode Client Component.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Client Supabase côté navigateur (différent du client serveur)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Identifiants incorrects. Vérifiez votre email et mot de passe.')
      setLoading(false)
      return
    }

    // Redirection après connexion réussie
    router.push(redirect)
    router.refresh() // Force le rechargement des Server Components
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--oif-neutral)]">
      <div className="w-full max-w-md">
        {/* Logo / En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--oif-blue)] mb-4">
            <span className="text-white font-bold text-xl">OIF</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--oif-blue-dark)]">
            CREXE — Espace admin
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Connectez-vous pour gérer les projets
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)] focus:border-transparent transition text-sm"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)] focus:border-transparent transition text-sm"
                placeholder="••••••••"
              />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[var(--oif-blue)] hover:bg-[var(--oif-blue-dark)] text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Organisation internationale de la Francophonie — CREXE 2025
        </p>
      </div>
    </div>
  )
}
