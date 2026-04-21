-- ─── Seed CREXE 2024 — Données à remplir ────────────────────────────────────
-- Ce script charge les projets, indicateurs et témoignages du CREXE 2024.
--
-- Mode d'emploi :
--   1. Remplis les sections marquées [À COMPLÉTER] avec les données réelles.
--   2. Exécute ce script dans le SQL Editor de Supabase (APRÈS migration_multi_editions.sql).
--   3. Les projets sont insérés en statut 'brouillon'. Passe-les en 'publie'
--      dans l'admin une fois les données vérifiées.
--
-- Concept pédagogique — Idempotence :
-- ON CONFLICT (id) DO UPDATE permet de ré-exécuter le script sans créer de doublons.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 0. S'assurer que l'édition 2024 existe ──────────────────────────────────
INSERT INTO crex_editions (annee, libelle, description, statut, date_debut, date_fin, est_actif)
VALUES (
  2024,
  'CREXE 2024',
  'Compte-Rendu d''Exécution exercice 2024',
  'clos',
  '2024-01-01',
  '2024-12-31',
  false   -- 2025 reste l'édition active par défaut
)
ON CONFLICT (annee) DO UPDATE SET
  libelle      = EXCLUDED.libelle,
  description  = EXCLUDED.description,
  statut       = EXCLUDED.statut;

-- ─── 1. Programmes stratégiques ───────────────────────────────────────────────
-- Partagés entre toutes les éditions — idempotent.
INSERT INTO programmes_strategiques (id, code, nom, description, couleur_theme, ordre)
VALUES
  ('PS1', 'PS1', 'La langue française au service des cultures et de l''éducation',
   'Promouvoir la langue française et soutenir l''éducation dans l''espace francophone.',
   '#003DA5', 1),
  ('PS2', 'PS2', 'La langue française au service de la démocratie et de la gouvernance',
   'Renforcer la démocratie, l''état de droit et la bonne gouvernance.',
   '#6B2C91', 2),
  ('PS3', 'PS3', 'La langue française, vecteur de développement durable',
   'Appuyer le développement économique durable et solidaire dans la Francophonie.',
   '#0F6E56', 3)
ON CONFLICT (id) DO NOTHING;

-- ─── 2. Projets CREXE 2024 ────────────────────────────────────────────────────
-- Colonnes disponibles (voir seeds 2025 pour référence) :
--   id, ps_id, code_officiel, statut, nom, accroche, description,
--   annee_exercice, budget_modifie, budget_engage, engagement_global,
--   taux_execution, nombre_pays, nombre_projets_deposes, nombre_projets_retenus,
--   nombre_beneficiaires, thematiques (ARRAY), mots_cles (ARRAY), cercles_impact (JSONB)
--
-- Note : les IDs sont des strings (ex: 'PROJ_A14_2024') — conventions :
--   - Utilise le code_officiel + '_2024' pour distinguer de l'édition 2025
--   - Ou utilise les mêmes IDs si les projets sont strictement les mêmes

-- [À COMPLÉTER] Décommente et remplis chaque projet avec les données réelles du CREXE 2024.

-- EXEMPLE DE STRUCTURE (à dupliquer pour chaque projet) :
-- INSERT INTO projets (
--   id, ps_id, code_officiel, statut, nom, accroche, description,
--   annee_exercice, budget_modifie, budget_engage, engagement_global,
--   taux_execution, nombre_pays, nombre_beneficiaires,
--   thematiques, mots_cles, cercles_impact
-- )
-- VALUES (
--   'PROJ_A14_2024',                  -- id
--   'PS3',                             -- ps_id
--   'PROJ_A14',                        -- code_officiel (même code, année différente)
--   'brouillon',                       -- statut
--   'La Francophonie avec Elles',      -- nom
--   'Accroche 2024...',                -- accroche
--   'Description complète 2024...',    -- description
--   2024,                              -- annee_exercice ← OBLIGATOIRE
--   NULL,                              -- budget_modifie (EUR)
--   NULL,                              -- budget_engage (EUR)
--   NULL,                              -- engagement_global (EUR)
--   NULL,                              -- taux_execution (%)
--   NULL,                              -- nombre_pays
--   NULL,                              -- nombre_beneficiaires
--   ARRAY['egalite_femmes_hommes'],    -- thematiques
--   ARRAY['AGR','formation'],          -- mots_cles
--   '{
--     "coeur":   { "valeur": "X M€", "label": "Investissement" },
--     "niveau1": { "valeur": "X personnes", "label": "Bénéficiaires", "type_preuve": "mesure" },
--     "niveau2": { "valeur": "X personnes", "label": "Impact élargi", "type_preuve": "estimation" },
--     "niveau3": { "label": "Contexte", "description": "...", "type_preuve": "observation" },
--     "niveau4": { "label": "Espace francophone", "description": "...", "type_preuve": "institutionnel" }
--   }'::jsonb
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
--   budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
--   taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
--   cercles_impact=EXCLUDED.cercles_impact;

-- ─── 3. Pays de couverture ────────────────────────────────────────────────────
-- À ajouter après les projets. Exemple :
--
-- INSERT INTO pays_couverture (projet_id, pays_code)
-- VALUES
--   ('PROJ_A14_2024', 'SEN'),
--   ('PROJ_A14_2024', 'MLI'),
--   ('PROJ_A14_2024', 'BEN')
-- ON CONFLICT (projet_id, pays_code) DO NOTHING;

-- ─── 4. Indicateurs ───────────────────────────────────────────────────────────
-- Colonnes : projet_id, libelle, valeur_numerique, valeur_pourcentage, unite,
--            categorie, type_preuve, source, hypothese_calcul, mise_en_avant, ordre
--
-- INSERT INTO indicateurs (
--   projet_id, libelle, valeur_numerique, valeur_pourcentage, unite,
--   categorie, type_preuve, source, mise_en_avant, ordre
-- ) VALUES
--   ('PROJ_A14_2024', 'Bénéficiaires directes', 8500, NULL, 'personnes',
--    'impact', 'mesure', 'Rapport CREXE 2024', true, 1),
--   ...
-- ;

-- ─── 5. Témoignages ───────────────────────────────────────────────────────────
-- Colonnes : projet_id, citation, source, source_url, type_media, pays, mise_en_avant
--
-- INSERT INTO temoignages (projet_id, citation, source, source_url, type_media, pays, mise_en_avant)
-- VALUES
--   ('PROJ_A14_2024', 'Citation...', 'Source document', 'https://...', 'rapport', 'SEN', true)
-- ;

-- ─── 6. Documents RAG (base de connaissance) ─────────────────────────────────
-- Les documents 2024 (PDF, DOCX) se chargent via l'admin :
--   → /admin/base-connaissance → Upload → sélectionner "Édition 2024"
-- Les chunks seront automatiquement marqués edition_annee = 2024.
-- La méthodologie ERA reste partagée (edition_annee = NULL).

-- ─── 7. Résultats ERA 2024 ────────────────────────────────────────────────────
-- Vérifie d'abord que la table era_resultats existe (migration_era_resultats.sql).
--
-- INSERT INTO era_resultats (projet_id, domaine, score, niveau, commentaire, annee_exercice)
-- SELECT p.id, 'efficacite', 3.5, 'bon', 'Commentaire ERA 2024...', 2024
-- FROM projets p WHERE p.code_officiel = 'PROJ_A14' AND p.annee_exercice = 2024;

-- ─── 8. Vérification finale ────────────────────────────────────────────────────
-- Après import, vérifie les données avec :
--
-- SELECT ce.libelle, p.code_officiel, p.statut, p.budget_engage, p.taux_execution
-- FROM crex_editions ce
-- JOIN projets p ON p.annee_exercice = ce.annee
-- WHERE ce.annee = 2024
-- ORDER BY p.code_officiel;

-- ─────────────────────────────────────────────────────────────────────────────
-- Une fois les données chargées et vérifiées, publie les projets :
--
-- UPDATE projets SET statut = 'publie' WHERE annee_exercice = 2024;
-- ─────────────────────────────────────────────────────────────────────────────
