// ─── Composant LogoOIF — Logotype officiel de l'OIF ──────────────────────────
// Conforme à la charte graphique OIF (éd. 2007, W & Cie)
//
// Règles d'usage (source : charte p. 6-11) :
//   - Taille minimum : 96px de largeur (≈ 25mm en impression)
//   - Espace protégé : équivalent à la hauteur du "L" de "la Francophonie"
//     (géré automatiquement par la prop withProtectedSpace)
//   - Ratio proportionnel TOUJOURS préservé (pas de déformation)
//
// Interdits formels :
//   - Déformation du logo (stretch/squeeze)
//   - Changement de couleurs ou valeurs
//   - Fond proche d'une couleur du logo sans cartouche blanc
//   - Taille sous 96px
//   - Association avec d'autres symboles dans le logo
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image'

// ─── Types ───────────────────────────────────────────────────────────────────
export type LogoVariant = 'quadri' | 'quadri-texte-blanc' | 'noir' | 'blanc'
export type LogoSize    = 'sm' | 'md' | 'lg' | 'xl' | number

// ─── Mapping variante → fichier image ────────────────────────────────────────
// Sources officielles : PNG fournis par le Service Communication OIF
// Conversion EPS → SVG disponible via : inkscape --export-type=svg Logo_OIF_quadri.eps
// (Inkscape requis localement — voir docs/branding/convert-eps-to-svg.sh)
const LOGO_SOURCES: Record<LogoVariant, string> = {
  'quadri':             '/assets/branding/oif/logo-oif-quadri.png',
  'quadri-texte-blanc': '/assets/branding/oif/logo-oif-quadri-texte-blanc.png',
  'noir':               '/assets/branding/oif/logo-oif-noir.png',
  'blanc':              '/assets/branding/oif/logo-oif-blanc.png',
}

// ─── Mapping taille → largeur en px ──────────────────────────────────────────
// Taille minimum charte : 96px (≈ 25mm à 96dpi)
const LOGO_WIDTHS: Record<Exclude<LogoSize, number>, number> = {
  sm: 96,   // taille minimum charte
  md: 160,  // usage courant (nav, headers)
  lg: 240,  // pages dédiées (connexion, landing)
  xl: 400,  // grands formats (hero, bannières)
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface LogoOIFProps {
  /** Variante du logo — quadri (défaut) pour fonds clairs */
  variant?: LogoVariant

  /** Taille prédéfinie ou largeur custom en px */
  size?: LogoSize

  /** Ajoute l'espace protégé (padding) autour du logo — recommandé charte */
  withProtectedSpace?: boolean

  /** Classes Tailwind supplémentaires sur le conteneur */
  className?: string

  /** Priorité de chargement (mettre true pour les logos above-the-fold) */
  priority?: boolean
}

// ─── Composant ───────────────────────────────────────────────────────────────
export default function LogoOIF({
  variant            = 'quadri',
  size               = 'md',
  withProtectedSpace = true,
  className          = '',
  priority           = false,
}: LogoOIFProps) {
  // Calcul de la largeur
  const width  = typeof size === 'number' ? size : LOGO_WIDTHS[size]

  // Rapport d'aspect officiel du logo OIF : ~2:1 (source : PNG fourni par l'OIF — 881×438 px)
  // Variante quadri : ratio 2.01 · Variante noir : ratio 2.35 (plus condensé avec le texte)
  const height = Math.round(width / 2.1)

  // Espace protégé = ~7% de la largeur (équivalent hauteur du "L")
  const padding = withProtectedSpace ? Math.round(width * 0.07) : 0

  const src = LOGO_SOURCES[variant]

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={withProtectedSpace ? { padding } : undefined}
    >
      <Image
        src={src}
        alt="Logo officiel de l'Organisation internationale de la Francophonie"
        width={width}
        height={height}
        priority={priority}
        style={{
          width,
          height: 'auto', // Préserve le ratio — ne jamais fixer height et width simultanément
          minWidth: 96,   // Respect taille minimum charte
        }}
      />
    </div>
  )
}

// ─── Export des tailles pour usage externe ────────────────────────────────────
export { LOGO_WIDTHS, LOGO_SOURCES }
