-- ─── Migration : Table parametres — configuration de la plateforme ────────────
-- Stocke tous les libellés, labels et paramètres éditables par l'administrateur.
-- Chaque paramètre est identifié par une clé unique (ex: 'ps1_nom') et stocke
-- une valeur textuelle modifiable depuis l'interface admin.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS parametres (
  cle         TEXT        PRIMARY KEY,   -- ex: 'ps1_nom', 'niveau_acquisition_label'
  valeur      TEXT        NOT NULL,      -- valeur actuelle (modifiable)
  valeur_defaut TEXT      NOT NULL,      -- valeur d'origine (pour réinitialiser)
  categorie   TEXT        NOT NULL DEFAULT 'general',  -- regroupement pour l'UI
  description TEXT        DEFAULT '',   -- explication destinée à l'admin
  actif       BOOLEAN     NOT NULL DEFAULT true,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  updated_by  UUID        REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE parametres ENABLE ROW LEVEL SECURITY;

-- Lecture publique (les labels sont utilisés côté front)
CREATE POLICY "parametres_public_read" ON parametres
  FOR SELECT USING (true);

-- Écriture admin uniquement
CREATE POLICY "parametres_admin_write" ON parametres
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ─── Seed — Valeurs par défaut ────────────────────────────────────────────────
INSERT INTO parametres (cle, valeur, valeur_defaut, categorie, description) VALUES

  -- Programmes Stratégiques
  ('ps1_nom',      'La langue française au service des cultures et de l''éducation',    'La langue française au service des cultures et de l''éducation',    'programmes_strategiques', 'Nom complet du Programme Stratégique 1'),
  ('ps1_nom_court','Langue, cultures et éducation',   'Langue, cultures et éducation',   'programmes_strategiques', 'Nom court du PS1 (affiché dans les filtres)'),
  ('ps2_nom',      'La langue française au service de la démocratie et de la gouvernance', 'La langue française au service de la démocratie et de la gouvernance', 'programmes_strategiques', 'Nom complet du Programme Stratégique 2'),
  ('ps2_nom_court','Démocratie et gouvernance',        'Démocratie et gouvernance',        'programmes_strategiques', 'Nom court du PS2'),
  ('ps3_nom',      'La langue française, vecteur de développement durable',              'La langue française, vecteur de développement durable',              'programmes_strategiques', 'Nom complet du Programme Stratégique 3'),
  ('ps3_nom_court','Développement durable',            'Développement durable',            'programmes_strategiques', 'Nom court du PS3'),

  -- Niveaux ERA
  ('era_niveau_acquisition_label', 'Acquisition des compétences', 'Acquisition des compétences', 'era', 'Label du niveau ERA : résultats immédiats'),
  ('era_niveau_effets_label',      'Effets intermédiaires',       'Effets intermédiaires',       'era', 'Label du niveau ERA : effets à moyen terme'),
  ('era_niveau_retombees_label',   'Retombées observées',         'Retombées observées',         'era', 'Label du niveau ERA : impacts observés'),
  ('era_niveau_extrants_label',    'Extrants',                    'Extrants',                    'era', 'Label du niveau ERA : produits directs'),
  ('era_niveau_synthese_label',    'Résultats globaux',           'Résultats globaux',           'era', 'Label du niveau ERA : vue synthétique'),
  ('era_titre_section',            'Résultats de l''Enquête Rapide Annuelle (ERA)', 'Résultats de l''Enquête Rapide Annuelle (ERA)', 'era', 'Titre de la section ERA sur les pages publiques'),

  -- Statuts projets
  ('statut_brouillon_label', 'Brouillon',    'Brouillon',    'statuts', 'Label du statut brouillon'),
  ('statut_en_revue_label',  'En révision',   'En révision',   'statuts', 'Label du statut en révision'),
  ('statut_publie_label',    'Publié',        'Publié',        'statuts', 'Label du statut publié'),
  ('statut_archive_label',   'Archivé',      'Archivé',      'statuts', 'Label du statut archivé'),

  -- Thématiques
  ('thematique_1', 'Développement durable',                     'Développement durable',                     'thematiques', 'Thématique 1 — affichée dans les filtres projet'),
  ('thematique_2', 'Langue française et diversité culturelles',  'Langue française et diversité culturelles',  'thematiques', 'Thématique 2'),
  ('thematique_3', 'Paix, démocratie et droits de l''homme',    'Paix, démocratie et droits de l''homme',    'thematiques', 'Thématique 3'),
  ('thematique_4', 'Transversalité',                             'Transversalité',                             'thematiques', 'Thématique 4'),
  ('thematique_5', 'Économie et numérique',                      'Économie et numérique',                      'thematiques', 'Thématique 5'),
  ('thematique_6', 'Éducation et formation',                     'Éducation et formation',                     'thematiques', 'Thématique 6'),

  -- Chaîne des résultats (CAD-OCDE)
  ('chaine_extrants_label',          'Extrants',                 'Extrants',                 'chaine_resultats', 'Niveau 1 de la chaîne CAD-OCDE'),
  ('chaine_effets_immediats_label',  'Effets immédiats',         'Effets immédiats',         'chaine_resultats', 'Niveau 2 de la chaîne CAD-OCDE'),
  ('chaine_effets_inter_label',      'Effets intermédiaires',    'Effets intermédiaires',    'chaine_resultats', 'Niveau 3 de la chaîne CAD-OCDE'),
  ('chaine_impact_label',            'Impact',                   'Impact',                   'chaine_resultats', 'Niveau 4 de la chaîne CAD-OCDE'),

  -- Plateforme générale
  ('plateforme_nom',        'CREXE',                                       'CREXE',                                       'general', 'Nom de la plateforme (affiché dans la nav)'),
  ('plateforme_sous_titre', 'Compte-Rendu d''Exécution',                   'Compte-Rendu d''Exécution',                   'general', 'Sous-titre de la plateforme'),
  ('org_nom',               'Organisation internationale de la Francophonie', 'Organisation internationale de la Francophonie', 'general', 'Nom complet de l''organisation'),
  ('service_nom',           'Service de Conception et Suivi des projets (SCS)', 'Service de Conception et Suivi des projets (SCS)', 'general', 'Nom du service interne OIF responsable')

ON CONFLICT (cle) DO NOTHING;

COMMENT ON TABLE parametres IS 'Configuration éditable de la plateforme CREXE — labels, noms de champs, libellés UI';
