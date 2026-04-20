// ─── Constantes globales de la plateforme CREXE ──────────────────────────────
// Ce fichier est la source unique de vérité pour les valeurs partagées.
// Importable dans Server Components, Client Components et exports metadata.
// ─────────────────────────────────────────────────────────────────────────────

// Année de l'édition CREXE en cours.
// Changer cette valeur pour passer à une nouvelle édition.
// À terme, sera lu depuis la table crex_editions (est_actif = true).
export const CREX_ANNEE = 2025

// Courriel officiel de contact SCS/OIF
export const CONTACT_EMAIL = 'projets@francophonie.org'

// Nom de la plateforme
export const PLATEFORME_NOM = 'CREXE'

// Organisation
export const ORG_NOM = 'Organisation internationale de la Francophonie'
export const ORG_ACRONYME = 'OIF'
export const SERVICE_NOM = 'Service de Conception et Suivi des projets (SCS)'

// URLs institutionnels
export const URL_OIF_SITE       = 'https://www.francophonie.org'
export const URL_OIF_PROJETS    = 'https://projets.francophonie.org'
