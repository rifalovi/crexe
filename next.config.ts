// ─── Configuration Next.js — Performance et optimisation ─────────────────────
// Concept pédagogique — Optimisation automatique des images :
// Next.js convertit les JPEG/PNG en WebP ou AVIF à la volée (30-50% plus légers).
// Le navigateur reçoit automatiquement le meilleur format qu'il supporte.
// Le logo OIF de 422Ko JPEG devient ~80Ko WebP sans aucun changement de code.
// ─────────────────────────────────────────────────────────────────────────────

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  // ── Optimisation images ────────────────────────────────────────────────────
  images: {
    // Formats servis selon support navigateur : AVIF (meilleur) → WebP → original
    formats: ['image/avif', 'image/webp'],

    // Largeurs de breakpoints pour images responsives
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache images optimisées : 30 jours (logos, témoignages ne changent pas souvent)
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // ── En-têtes HTTP — cache des assets statiques ─────────────────────────────
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
        ],
      },
    ]
  },
}

export default nextConfig
