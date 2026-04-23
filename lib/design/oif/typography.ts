// ─── Design System OIF — Typographie officielle ──────────────────────────────
// Source : OIF_mini_charte.pdf
// Police officielle : Helvetica Neue (propriétaire, usage print)
// Alternative web : Inter (open source, optimisée écran, visuellement proche)
// ─────────────────────────────────────────────────────────────────────────────

export const OIF_FONTS = {
  /**
   * Police sans-serif principale
   * - Officielle (print) : Helvetica Neue
   * - Web (production)   : Inter (next/font/google — gratuite, performante)
   * - Fallback système   : Helvetica Neue si installée, puis system fonts
   */
  sansFallback: [
    'Inter',
    '"Helvetica Neue"',
    'Helvetica',
    'Arial',
    'sans-serif',
  ].join(', '),

  /** Variable CSS injectée par next/font */
  sansVar: 'var(--font-inter)',

  /**
   * Stack complète pour Tailwind fontFamily.sans
   */
  tailwindSans: [
    'var(--font-inter)',
    '"Helvetica Neue"',
    'Helvetica',
    'Arial',
    'sans-serif',
  ],
} as const

/**
 * Échelle typographique recommandée (conforme charte institutionnelle)
 * - Titres       : font-bold, suivi d'un espacement généreux
 * - Corps        : text-sm / text-base, line-height: 1.6
 * - Légendes     : text-xs, uppercase + tracking-wide pour les labels
 * - Citations    : italic, border-left pour les témoignages
 */
export const OIF_TYPE_SCALE = {
  h1:      'text-3xl md:text-4xl font-bold leading-tight',
  h2:      'text-2xl font-bold leading-snug',
  h3:      'text-xl font-semibold leading-snug',
  h4:      'text-lg font-semibold',
  body:    'text-base leading-relaxed',
  small:   'text-sm leading-relaxed',
  caption: 'text-xs uppercase tracking-wider font-semibold',
  label:   'text-xs font-medium text-gray-500',
} as const
