'use client'

// ─── Formulaire de contact CREXE — sécurisé Turnstile + Resend ───────────────
// Client Component — état React + intégration Cloudflare Turnstile.
//
// Concept pédagogique — Architecture du formulaire sécurisé :
//
//   Navigateur                    Serveur Next.js          Services tiers
//   ─────────────────────────     ────────────────────     ───────────────
//   1. Utilisateur remplit         3. Vérifie token         Cloudflare
//      le formulaire                  auprès Cloudflare  ←────────────────
//   2. Turnstile génère un         4. Si OK → envoie        Resend (email)
//      token anti-bot                 via Resend API   ─────────────────→
//   3. POST /api/contact ──────→
//   5. Affiche confirmation  ←──
//
// Turnstile (étape 2) : widget invisible ou minimal de Cloudflare.
// Il analyse le comportement utilisateur (mouvements souris, timing, etc.)
// pour distinguer humains et bots — sans stocker de données personnelles.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, FormEvent } from 'react'
import { SERVICE_NOM } from '@/lib/constants'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  nom: string
  email: string
  organisation: string
  sujet: string
  message: string
}

// Déclaration globale pour le script Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileOptions {
  sitekey: string
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const SUJETS = [
  'Question sur un projet',
  'Signaler une erreur dans les données',
  'Demande de partenariat',
  'Question sur la méthodologie',
  'Accès à la plateforme (compte)',
  'Autre',
]

// Clé publique Turnstile (depuis les variables d'environnement)
// En développement, Cloudflare fournit une clé test universelle :
// '1x00000000000000000000AA' (bypass automatique)
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'

// ─── Composant principal ──────────────────────────────────────────────────────

export function ContactForm() {
  const [form, setForm]           = useState<FormData>({ nom: '', email: '', organisation: '', sujet: SUJETS[0], message: '' })
  const [envoye, setEnvoye]       = useState(false)
  const [envoi, setEnvoi]         = useState(false)        // en cours d'envoi
  const [erreur, setErreur]       = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileOk, setTurnstileOk]       = useState(false)

  const turnstileRef    = useRef<HTMLDivElement>(null)
  const widgetIdRef     = useRef<string | null>(null)
  const scriptLoadedRef = useRef(false)

  // ── Charger le script Turnstile une seule fois ──────────────────────────────
  // Concept : useEffect avec [] s'exécute exactement une fois après le
  // premier rendu (montage du composant). On y injecte le script externe
  // de Cloudflare. On utilise un callback global `onTurnstileLoad` que
  // Turnstile appelle quand il est prêt.
  useEffect(() => {
    if (scriptLoadedRef.current) return
    scriptLoadedRef.current = true

    // Callback global appelé par Turnstile quand son script est chargé
    window.onTurnstileLoad = () => {
      if (!turnstileRef.current || !window.turnstile) return
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
        callback: (token: string) => {
          setTurnstileToken(token)
          setTurnstileOk(true)
        },
        'expired-callback': () => {
          setTurnstileToken(null)
          setTurnstileOk(false)
        },
        'error-callback': () => {
          setTurnstileToken(null)
          setTurnstileOk(false)
        },
      })
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    return () => {
      // Nettoyage : supprimer le widget si le composant est démonté
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function maj(champ: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [champ]: e.target.value }))
      setErreur(null)
    }
  }

  function valider(): string | null {
    if (!form.nom.trim())     return 'Veuillez indiquer votre nom.'
    if (!form.email.trim())   return 'Veuillez indiquer votre adresse courriel.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Format de courriel invalide.'
    if (!form.message.trim()) return 'Veuillez rédiger votre message.'
    if (form.message.trim().length < 20) return 'Le message doit contenir au moins 20 caractères.'
    return null
  }

  // ── Soumission ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const err = valider()
    if (err) { setErreur(err); return }

    if (!turnstileOk || !turnstileToken) {
      setErreur('Veuillez compléter la vérification de sécurité.')
      return
    }

    setEnvoi(true)
    setErreur(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          turnstileToken,
        }),
      })

      const data = await res.json() as { success?: boolean; error?: string }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'envoi.')
      }

      setEnvoye(true)

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'envoi.'
      setErreur(msg)
      // Réinitialiser Turnstile après une erreur
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current)
        setTurnstileToken(null)
        setTurnstileOk(false)
      }
    } finally {
      setEnvoi(false)
    }
  }

  // ── Écran de confirmation ────────────────────────────────────────────────────
  if (envoye) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="font-semibold text-[#042C53] text-xl mb-2">
          Message envoyé avec succès
        </h3>
        <p className="text-sm text-gray-500 mb-2 max-w-sm mx-auto leading-relaxed">
          Votre message a été transmis à l&apos;équipe {SERVICE_NOM}.
        </p>
        <p className="text-xs text-gray-400 mb-8">
          Une réponse vous sera apportée dans les meilleurs délais.
        </p>
        <button
          onClick={() => {
            setEnvoye(false)
            setForm({ nom: '', email: '', organisation: '', sujet: SUJETS[0], message: '' })
            setTurnstileToken(null)
            setTurnstileOk(false)
            if (window.turnstile && widgetIdRef.current) {
              window.turnstile.reset(widgetIdRef.current)
            }
          }}
          className="text-sm text-[#003DA5] hover:underline underline-offset-2"
        >
          ← Envoyer un autre message
        </button>
      </div>
    )
  }

  // ── Formulaire ──────────────────────────────────────────────────────────────
  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5] transition placeholder-gray-300 bg-white'
  const labelCls = 'block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5'

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
      <div className="mb-2">
        <h2 className="font-semibold text-[#042C53] text-lg">
          Envoyer un message
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Votre demande sera transmise directement à l&apos;équipe {SERVICE_NOM}.
          Les champs marqués <span className="text-red-400">*</span> sont obligatoires.
        </p>
      </div>

      {/* Nom + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Nom complet <span className="text-red-400">*</span>
          </label>
          <input type="text" value={form.nom} onChange={maj('nom')}
            placeholder="Votre nom et prénom" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>
            Courriel <span className="text-red-400">*</span>
          </label>
          <input type="email" value={form.email} onChange={maj('email')}
            placeholder="votre@email.org" className={inputCls} />
        </div>
      </div>

      {/* Organisation */}
      <div>
        <label className={labelCls}>
          Organisation <span className="text-gray-300 font-normal normal-case">(optionnel)</span>
        </label>
        <input type="text" value={form.organisation} onChange={maj('organisation')}
          placeholder="Ministère, université, ONG…" className={inputCls} />
      </div>

      {/* Sujet */}
      <div>
        <label className={labelCls}>
          Sujet <span className="text-red-400">*</span>
        </label>
        <select value={form.sujet} onChange={maj('sujet')} className={inputCls}>
          {SUJETS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className={labelCls}>
          Message <span className="text-red-400">*</span>
        </label>
        <textarea value={form.message} onChange={maj('message')} rows={5}
          placeholder="Décrivez votre demande avec précision…"
          className={`${inputCls} resize-none`} />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {form.message.length} caractère{form.message.length > 1 ? 's' : ''}
          {form.message.length < 20 && form.message.length > 0 && (
            <span className="text-amber-500 ml-2">minimum 20</span>
          )}
        </p>
      </div>

      {/* ── Turnstile CAPTCHA ──────────────────────────────────────────────── */}
      {/* Concept : le div ci-dessous est le "container" dans lequel
          Turnstile rend son widget. Le ref pointe vers ce DOM node
          pour que notre useEffect puisse appeler turnstile.render(). */}
      <div>
        <label className={`${labelCls} mb-2`}>
          Vérification de sécurité <span className="text-red-400">*</span>
        </label>
        <div ref={turnstileRef} className="min-h-[65px]" />
        {!turnstileOk && (
          <p className="text-xs text-gray-400 mt-1">
            Cochez la case ci-dessus pour confirmer que vous n&apos;êtes pas un robot.
          </p>
        )}
        {turnstileOk && (
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Vérification réussie
          </p>
        )}
      </div>

      {/* Erreur de validation */}
      {erreur && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-600">{erreur}</p>
        </div>
      )}

      {/* Bouton d'envoi */}
      <button
        type="submit"
        disabled={envoi}
        className="w-full bg-[#003DA5] hover:bg-[#042C53] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition flex items-center justify-center gap-2"
      >
        {envoi ? (
          <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Envoi en cours…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            Envoyer le message
          </>
        )}
      </button>

      {/* Note sécurité */}
      <p className="text-xs text-gray-400 text-center leading-relaxed">
        Sécurisé par{' '}
        <a href="https://www.cloudflare.com/products/turnstile/" target="_blank" rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-gray-600">Cloudflare Turnstile</a>.
        {' '}Vos données sont transmises directement à l&apos;équipe SCS/OIF.
      </p>
    </form>
  )
}
