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
    // Source officielle : Code_couleur_programmation_OIF.pdf
    couleur:    '#0198E9',   // Pantone Process Cyan C · C 100, M 0, J 0, N 0 · R 1, V 152, B 233
    couleurClaire: '#E0F3FD',
    couleurBord:   '#9ED8F8',
    pantone:    'Process Cyan C',
    rgb:        '1, 152, 233',
    ral:        '5015',
    icon:       '📚',
    ordre:      1,
  },
  PS2: {
    id:         'PS2',
    nom:        'La langue française au service de la démocratie et de la gouvernance',
    nomCourt:   'Démocratie et gouvernance',
    // Source officielle : Code_couleur_programmation_OIF.pdf
    couleur:    '#5D0073',   // Pantone 2603 C · C 70, M 100, J 0, N 0 · R 93, V 0, B 115
    couleurClaire: '#F0E0F7',
    couleurBord:   '#C880E0',
    pantone:    '2603 C',
    rgb:        '93, 0, 115',
    ral:        '320 30 37',
    icon:       '⚖️',
    ordre:      2,
  },
  PS3: {
    id:         'PS3',
    nom:        'La langue française, vecteur de développement durable',
    nomCourt:   'Développement durable',
    // Source officielle : Code_couleur_programmation_OIF.pdf
    couleur:    '#7EB301',   // Pantone 376 C · C 53, M 0, J 100, N 0 · R 126, V 179, B 1
    couleurClaire: '#EEF7DC',
    couleurBord:   '#BBDE6A',
    pantone:    '376 C',
    rgb:        '126, 179, 1',
    ral:        '120 70 75',
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
