'use client'

// ─── Page de définition du nouveau mot de passe ───────────────────────────────
//
// Concept pédagogique — Flux de réinitialisation Supabase :
//   1. Utilisateur clique "Mot de passe oublié" sur /login
//   2. supabase.auth.resetPasswordForEmail() envoie un email avec un lien
//   3. Le lien pointe vers /auth/callback?code=xxx&type=recovery
//   4. /auth/callback échange le code → crée une session temporaire → redirige ici
//   5. Cette page appelle supabase.auth.updateUser({ password: nouveauMdp })
//      — l'utilisateur EST authentifié grâce à la session créée à l'étape 4
//
// Important : cette page doit être accessible UNIQUEMENT depuis le flux de
// récupération (l'utilisateur possède une session valide grâce au lien magique).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function NouveauMotDePassePage() {
  const router = useRouter()

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // ── Validation côté client ────────────────────────────────────────────────
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    // ── Mise à jour via Supabase Auth ─────────────────────────────────────────
    // updateUser() fonctionne car l'utilisateur est authentifié grâce à la
    // session créée par exchangeCodeForSession() dans /auth/callback.
    const { error: updErr } = await supabase.auth.updateUser({ password })

    if (updErr) {
      setError(`Impossible de mettre à jour : ${updErr.message}`)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // Redirection vers /admin après 2 secondes
    setTimeout(() => router.push('/admin'), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--oif-neutral)]">
      <div className="w-full max-w-md">

        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--oif-blue)] mb-4">
            <span className="text-white font-bold text-xl">OIF</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--oif-blue-dark)]">
            Nouveau mot de passe
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Choisissez un mot de passe sécurisé pour votre compte
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {success ? (
            /* ── Message de succès ─────────────────────────────────────────── */
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">Mot de passe mis à jour !</p>
              <p className="text-sm text-gray-500">Redirection vers l&apos;espace admin…</p>
            </div>
          ) : (
            /* ── Formulaire ────────────────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nouveau mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)] focus:border-transparent transition text-sm"
                  placeholder="8 caractères minimum"
                />
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)] focus:border-transparent transition text-sm"
                  placeholder="••••••••"
                />
              </div>

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
                {loading ? 'Mise à jour…' : 'Enregistrer le mot de passe'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Organisation internationale de la Francophonie · CREXE
        </p>
      </div>
    </div>
  )
}
