'use client'

// ─── Page de connexion ────────────────────────────────────────────────────────
//
// Concept pédagogique — Deux modes dans le même composant :
//   Mode 'login'   → formulaire email + mot de passe (connexion normale)
//   Mode 'forgot'  → formulaire email seul (envoi du lien de réinitialisation)
//
// useSearchParams() exige un <Suspense> parent en Next.js App Router.
// On sépare LoginForm (qui lit les searchParams) de la page wrapper.
//
// Flux "mot de passe oublié" :
//   1. Clic "Mot de passe oublié ?" → mode 'forgot'
//   2. Saisie email → supabase.auth.resetPasswordForEmail()
//      → Supabase envoie un email avec un lien /auth/callback?code=xxx&type=recovery
//   3. Utilisateur clique le lien → /auth/callback échange le code → /nouveau-mot-de-passe
//
// Gestion des erreurs de callback (lien invalide, lien expiré) :
//   /auth/callback redirige vers /login?error=lien_expire → on affiche un message
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// ─── Formulaire intérieur (accès aux searchParams) ────────────────────────────
function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') || '/admin'

  // Message d'erreur venant de /auth/callback (lien expiré, invalide…)
  const callbackError = searchParams.get('error')
  const callbackMessages: Record<string, string> = {
    lien_invalide: 'Ce lien est invalide. Demandez un nouveau lien ci-dessous.',
    lien_expire:   'Ce lien a expiré (validité 1 heure). Demandez un nouveau lien ci-dessous.',
    erreur_interne: 'Une erreur est survenue. Réessayez ou contactez l\'administrateur.',
  }

  const [mode,    setMode]    = useState<'login' | 'forgot'>('login')
  const [email,   setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(
    callbackError ? (callbackMessages[callbackError] ?? 'Une erreur est survenue.') : null
  )
  const [forgotSent, setForgotSent] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ── Connexion normale ─────────────────────────────────────────────────────
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

    router.push(redirectTo)
    router.refresh()
  }

  // ── Envoi du lien de réinitialisation ─────────────────────────────────────
  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Concept : resetPasswordForEmail() envoie un email avec un lien unique.
    // Le paramètre redirectTo indique à Supabase où envoyer l'utilisateur
    // APRÈS avoir cliqué le lien. Notre route /auth/callback se chargera
    // d'échanger le code et de rediriger vers /nouveau-mot-de-passe.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    if (error) {
      setError(`Impossible d'envoyer l'email : ${error.message}`)
      setLoading(false)
      return
    }

    setForgotSent(true)
    setLoading(false)
  }

  // ── Mode "lien envoyé" ────────────────────────────────────────────────────
  if (forgotSent) {
    return (
      <div className="text-center space-y-4 py-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50 mx-auto">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="font-medium text-gray-800">Email envoyé !</p>
        <p className="text-sm text-gray-500">
          Vérifiez votre boîte {email} et cliquez le lien de réinitialisation.
          <br />Le lien est valable <strong>1 heure</strong>.
        </p>
        <button
          onClick={() => { setForgotSent(false); setMode('login'); setError(null) }}
          className="text-sm text-[var(--oif-blue)] hover:underline font-medium"
        >
          ← Retour à la connexion
        </button>
      </div>
    )
  }

  // ── Mode "mot de passe oublié" ────────────────────────────────────────────
  if (mode === 'forgot') {
    return (
      <form onSubmit={handleForgot} className="space-y-5">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Saisissez votre adresse e-mail. Vous recevrez un lien pour définir un nouveau mot de passe.
          </p>
          <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Adresse e-mail
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)] focus:border-transparent transition text-sm"
            placeholder="vous@exemple.com"
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
          {loading ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
        </button>

        <button
          type="button"
          onClick={() => { setMode('login'); setError(null) }}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          ← Retour à la connexion
        </button>
      </form>
    )
  }

  // ── Mode connexion (défaut) ───────────────────────────────────────────────
  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
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
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          {/* ── Lien "Mot de passe oublié ?" ─────────────────────────────── */}
          <button
            type="button"
            onClick={() => { setMode('forgot'); setError(null) }}
            className="text-xs text-[var(--oif-blue)] hover:underline font-medium"
          >
            Mot de passe oublié ?
          </button>
        </div>
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
  )
}

// ─── Page wrapper avec Suspense (obligatoire pour useSearchParams) ─────────────
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--oif-neutral)]">
      <div className="w-full max-w-md">
        {/* En-tête */}
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

        {/* Formulaire dans Suspense */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Suspense fallback={<div className="text-center text-sm text-gray-400 py-4">Chargement…</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-gray-400">
            Organisation internationale de la Francophonie · CREXE
          </p>
          <p className="text-xs text-gray-400">
            Pas encore de compte ?{' '}
            <a href="/demande-acces" className="text-[var(--oif-blue)] hover:underline font-medium">
              Demander l&apos;accès →
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
