// ─── Design System OIF — Couleurs officielles ────────────────────────────────
// Source : OIF_mini_charte.pdf (charte graphique officielle, éd. 2007, W & Cie)
// Ces valeurs sont VERROUILLÉES — aucune variation créative autorisée.
// Tout changement doit être validé par le Service Communication OIF.
// Contact : com@francophonie.org
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Couleurs institutionnelles du logotype OIF
 * Source : charte graphique p. 8
 * Ces 6 couleurs composent le logotype officiel.
 */
export const OIF_COLORS = {
  // ── Couleurs du logotype (source : charte p. 8) ───────────────────────────
  gris: {
    hex:     '#2E292D',
    pantone: 'Cool Gray 11 C',
    rgb:     '46, 41, 45',
    cmyk:    '0, 5, 0, 82',
    usage:   'Texte du logotype "la Francophonie" + éléments structurants',
  },
  jaune: {
    hex:     '#FDCD00',
    pantone: '116 C',
    rgb:     '253, 205, 0',
    cmyk:    '0, 18, 100, 0',
    usage:   'Globe — secteur principal, accents chauds',
  },
  vert: {
    hex:     '#7EB301',
    pantone: '376 C',
    rgb:     '126, 179, 1',
    cmyk:    '29, 0, 99, 30',
    usage:   'Globe — secteur végétation, indicateurs positifs',
  },
  violet: {
    hex:     '#5D0073',
    pantone: '2603 C',
    rgb:     '93, 0, 115',
    cmyk:    '19, 100, 0, 55',
    usage:   'Globe — secteur supérieur, éléments institutionnels',
  },
  rouge: {
    hex:     '#E40001',
    pantone: '485 C',
    rgb:     '228, 0, 1',
    cmyk:    '0, 100, 100, 10',
    usage:   'Globe — secteur gauche, alertes, actions destructives',
  },
  bleuCyan: {
    hex:     '#0198E9',
    pantone: 'Process Cyan C',
    rgb:     '1, 152, 233',
    cmyk:    '100, 35, 0, 0',
    usage:   'Globe — secteur océan/eau, liens, actions principales',
  },

  // ── Couleurs complémentaires des entités OIF (source : charte p. 8) ───────
  bleu: {
    hex:     '#3878DB',
    pantone: '2727 C',
    usage:   'CMF (Conférence Ministérielle de la Francophonie)',
  },
  jauneAlt: {
    hex:     '#FDCD00',
    pantone: '116 C',
    usage:   'CPF (Conférence Parlementaire de la Francophonie)',
  },
  violetAlt: {
    hex:     '#7D0996',
    pantone: '2602 C',
    usage:   'Sommets des Chefs d\'État et de Gouvernement',
  },
  grisClair: {
    hex:     '#DFDCD8',
    pantone: 'Warm Gray 1 C',
    usage:   'Autres éditions — fond neutre institutionnel',
  },

  // ── Neutres système (non logotype, usage UI) ──────────────────────────────
  blanc: { hex: '#FFFFFF', usage: 'Fond principal, texte sur fond sombre' },
  noir:  { hex: '#000000', usage: 'Texte haute contraste (usage limité)' },
} as const

/**
 * Valeurs hex directement utilisables en CSS/Tailwind
 */
export const OIF_HEX = {
  gris:        '#2E292D',
  jaune:       '#FDCD00',
  vert:        '#7EB301',
  violet:      '#5D0073',
  rouge:       '#E40001',
  bleuCyan:    '#0198E9',
  bleu:        '#3878DB',
  violetAlt:   '#7D0996',
  grisClair:   '#DFDCD8',
  blanc:       '#FFFFFF',
  noir:        '#000000',
} as const

export type OIFColorKey = keyof typeof OIF_HEX
