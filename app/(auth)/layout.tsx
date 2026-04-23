// Layout du groupe auth — exporte les métadonnées SEO pour la page de connexion.
// Concept : en Next.js App Router, `metadata` ne peut pas être exporté depuis
// un Client Component ('use client'). On utilise un Server Component layout
// intermédiaire pour injecter les métadonnées sans toucher au composant client.

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion — CREXE Administration',
  description: 'Accès à l\'interface d\'administration de la plateforme CREXE de l\'OIF.',
  robots: { index: false, follow: false }, // Page de login non indexable par Google
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
