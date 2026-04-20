'use client'
// ─── Invite d'installation PWA ────────────────────────────────────────────────
// Composant Client qui détecte si la plateforme supporte l'installation
// de l'application comme raccourci sur le bureau / écran d'accueil.
//
// Concept pédagogique — Qu'est-ce qu'une PWA ?
// Une Progressive Web App (PWA) est une application web qui peut être
// installée sur l'appareil de l'utilisateur (bureau, mobile) comme une
// vraie application native. Elle apparaît dans le menu des applications,
// dispose d'une icône sur le bureau et s'ouvre sans barre d'adresse.
//
// Comment ça fonctionne ?
// 1. Le navigateur déclenche l'événement 'beforeinstallprompt' quand
//    les conditions PWA sont remplies (manifest.json + HTTPS + critères)
// 2. On intercepte et stocke cet événement
// 3. L'utilisateur clique "Installer" → on appelle prompt()
// 4. Le navigateur affiche la boîte de dialogue d'installation native
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'

// Type pour l'événement d'installation (non standard, absent de TypeScript standard)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed]       = useState(false)
  const [installed, setInstalled]       = useState(false)
  const [isIOS, setIsIOS]               = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Détecter iOS (Safari ne supporte pas beforeinstallprompt)
    const ua = navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream
    setIsIOS(ios)

    // Vérifier si déjà installée (standalone = lancée depuis l'icône)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    if (standalone) { setInstalled(true); return }

    // Vérifier si l'utilisateur a déjà refusé lors d'une session précédente
    const wasDismissed = sessionStorage.getItem('pwa-prompt-dismissed') === 'true'
    if (wasDismissed) { setDismissed(true); return }

    // Intercepter l'événement d'installation Chrome/Edge/Firefox
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Ne rien afficher si : déjà installé, refusé, ou pas d'événement disponible
  if (installed || dismissed) return null
  if (!installEvent && !isIOS) return null

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
    }
    setInstallEvent(null)
    setDismissed(true)
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  return (
    <>
      {/* ─── Bannière d'invitation d'installation ─── */}
      <div className="fixed bottom-20 right-4 z-40 max-w-xs w-full">
        <div className="bg-[var(--oif-blue-dark)] text-white rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* En-tête */}
          <div className="px-4 pt-4 pb-3 flex items-start gap-3">
            {/* Icône app */}
            <div className="w-10 h-10 rounded-xl bg-[var(--oif-gold)] flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-black text-xs leading-none">OIF</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">Installer CREXE</p>
              <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                Accédez rapidement à la plateforme depuis votre bureau
              </p>
            </div>
            {/* Bouton fermer */}
            <button
              onClick={handleDismiss}
              className="text-white/40 hover:text-white/80 transition flex-shrink-0 -mt-0.5 -mr-0.5"
              aria-label="Fermer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Avantages */}
          <div className="px-4 pb-3 space-y-1">
            {[
              'Accès rapide depuis votre bureau',
              'Fonctionne hors connexion (données mises en cache)',
              'Interface plein écran sans barre d\'adresse',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-white/70">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4A017" strokeWidth="2.5">
                  <path strokeLinecap="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </div>
            ))}
          </div>

          {/* Boutons */}
          <div className="px-4 pb-4 flex gap-2">
            {isIOS ? (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex-1 bg-[var(--oif-gold)] text-white text-xs font-semibold py-2.5 rounded-xl hover:opacity-90 transition"
              >
                Comment installer →
              </button>
            ) : (
              <button
                onClick={handleInstall}
                className="flex-1 bg-[var(--oif-gold)] text-white text-xs font-semibold py-2.5 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-1.5"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Installer l&apos;application
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="px-3 text-xs text-white/50 hover:text-white/80 transition"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>

      {/* ─── Guide iOS ─────────────────────────────────────────────── */}
      {isIOS && showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl w-full max-w-md px-6 py-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--oif-blue-dark)]">Installer sur iOS</h3>
              <button onClick={() => setShowIOSGuide(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Appuyez sur l\'icône Partager en bas de Safari', icon: '⬆️' },
                { step: '2', text: 'Faites défiler et choisissez « Sur l\'écran d\'accueil »', icon: '📱' },
                { step: '3', text: 'Appuyez sur « Ajouter » en haut à droite', icon: '✅' },
              ].map(({ step, text, icon }) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-[var(--oif-blue)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step}
                  </span>
                  <p className="text-sm text-gray-600 flex-1">
                    <span className="mr-1">{icon}</span>
                    {text}
                  </p>
                </li>
              ))}
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full bg-[var(--oif-blue)] text-white text-sm font-medium py-3 rounded-xl hover:bg-[var(--oif-blue-dark)] transition"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  )
}
