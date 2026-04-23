// ─── Design System OIF — Couleurs des Programmes Stratégiques ────────────────
// Source : Code_couleur_programmation_OIF.pdf
// Ces couleurs sont assignées aux 3 Programmes Stratégiques de l'OIF
// pour les dashboards, cartes, filtres et visualisations analytiques.
// ─────────────────────────────────────────────────────────────────────────────

export const OIF_PROGRAMMES = {
  PS1: {
    id:         'PS1',
    nom:        'La langue française au service des cultures et de l\'éducation',
    nomCourt:   'Langue, cultures et éducation',
    // Bleu institutionnel — confiance, savoir, culture
    couleur:    '#003DA5',
    couleurClaire: '#EBF0FA',
    couleurBord:   '#C7D5F5',
    pantone:    '286 C',
    rgb:        '0, 61, 165',
    icon:       '📚',
    ordre:      1,
  },
  PS2: {
    id:         'PS2',
    nom:        'La langue française au service de la démocratie et de la gouvernance',
    nomCourt:   'Démocratie et gouvernance',
    // Violet — profondeur, gouvernance, institutions
    couleur:    '#6B2C91',
    couleurClaire: '#F3EAF9',
    couleurBord:   '#DEC5EE',
    pantone:    '2603 C',
    rgb:        '107, 44, 145',
    icon:       '⚖️',
    ordre:      2,
  },
  PS3: {
    id:         'PS3',
    nom:        'La langue française, vecteur de développement durable',
    nomCourt:   'Développement durable',
    // Vert — durabilité, environnement, croissance
    couleur:    '#0F6E56',
    couleurClaire: '#E6F4F1',
    couleurBord:   '#B3DDD7',
    pantone:    '3295 C',
    rgb:        '15, 110, 86',
    icon:       '🌿',
    ordre:      3,
  },
} as const

export type PSId = keyof typeof OIF_PROGRAMMES
export type PSConfig = (typeof OIF_PROGRAMMES)[PSId]

/**
 * Récupère la config d'un programme par son ID
 */
export function getPSConfig(psId: string): PSConfig | undefined {
  return OIF_PROGRAMMES[psId as PSId]
}

/**
 * Tableau ordonné des programmes (utilisation dans les boucles)
 */
export const PS_LISTE = Object.values(OIF_PROGRAMMES).sort((a, b) => a.ordre - b.ordre)
