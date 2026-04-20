-- ─────────────────────────────────────────────────────────────────────────────
-- Seed PROJ_A18 — Accompagnement des transformations structurelles (Environnement)
-- PS3 · Source : CREX PS3_V2.docx
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO projets (id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  thematiques, mots_cles, cercles_impact)
VALUES (
  'PROJ_A18', 'PS3', 'PROJ_A18', 'publie',
  'Accompagnement des transformations structurelles en matière d''environnement',
  'Former les décideurs francophones à la finance climat et à la négociation internationale',
  'Le projet 18 accompagne les États francophones dans leurs transformations structurelles en matière d''environnement et de développement durable. En 2025, il a formé 3 900 décideurs publics et cadres administratifs aux fondamentaux de la finance climatique, de la biodiversité et des négociations internationales. L''impact est tangible : 3 négociatrices formées par l''OIF ont représenté leur pays lors des CdP internationaux.',
  2025, 1259300, 1251664, 99,
  ARRAY['environnement','climat','biodiversite','negociations_internationales','finance_climat'],
  ARRAY['finance climat','CdP','négociation','décideurs','IFDD','ODD'],
  '{
    "coeur":   { "valeur": "1,25 M€", "label": "Budget engagé" },
    "niveau1": { "valeur": "3 900 décideurs", "label": "Formés aux enjeux climatiques", "description": "Cadres publics, négociateurs, agents administratifs", "type_preuve": "mesure" },
    "niveau2": { "valeur": "3 négociatrices", "label": "Représentantes en CdP internationales", "description": "Formées par l''OIF et présentes aux grandes CdP", "type_preuve": "mesure" },
    "niveau3": { "label": "Politiques publiques renforcées", "description": "Stratégies nationales climat, guides de négociation", "type_preuve": "observation" },
    "niveau4": { "label": "Espace francophone", "description": "Voix francophone renforcée dans la gouvernance climatique mondiale", "type_preuve": "institutionnel" }
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, statut=EXCLUDED.statut, description=EXCLUDED.description,
  annee_exercice=EXCLUDED.annee_exercice, budget_modifie=EXCLUDED.budget_modifie,
  budget_engage=EXCLUDED.budget_engage, taux_execution=EXCLUDED.taux_execution,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Indicateurs
DELETE FROM indicateurs WHERE projet_id = 'PROJ_A18';
INSERT INTO indicateurs (projet_id, libelle, valeur_numerique, valeur_pourcentage, unite, categorie, type_preuve, source, mise_en_avant, ordre) VALUES
  ('PROJ_A18','Décideurs publics et cadres administratifs formés',3900,NULL,'personnes','formation','mesure','Rapport P18 OIF 2025',true,1),
  ('PROJ_A18','Négociatrices ayant représenté leur pays en CdP international',3,NULL,'personnes','effets','mesure','Rapport P18 OIF 2025',true,2),
  ('PROJ_A18','Publications et guides de négociation produits',6,NULL,'publications','activites','mesure','Rapport P18 OIF 2025',true,3),
  ('PROJ_A18','Taux d''exécution budgétaire',NULL,99,'%','execution','mesure','CREXE 2025',true,4);

-- Témoignages
DELETE FROM temoignages WHERE projet_id = 'PROJ_A18';
INSERT INTO temoignages (projet_id, citation, source, source_url, type_media, pays, mise_en_avant) VALUES
  ('PROJ_A18',
   'La formation de l''OIF nous a donné les outils pour comprendre les mécanismes de la finance climatique et défendre nos positions lors des négociations de la CdP29. Nous sommes rentrés avec un accord plus favorable pour Monaco.',
   'Témoignage de M. Carl Dudek, Point focal national négociateur pour la Principauté de Monaco — Rapport P18 OIF 2025',
   NULL,
   'rapport', 'MCO', true);

-- Partenariats
DELETE FROM partenariats WHERE projet_id = 'PROJ_A18';
INSERT INTO partenariats (projet_id, nom, type, description, ordre) VALUES
  ('PROJ_A18','IFDD (Institut de la Francophonie pour le développement durable)','technique','Mise en œuvre des formations et publications sur la finance climat',1),
  ('PROJ_A18','Climate Analytics','technique','Rédaction des notes techniques CdP29 et guide des négociations CdP30',2);

-- Événements
DELETE FROM evenements WHERE projet_id = 'PROJ_A18';
INSERT INTO evenements (projet_id, titre, description, date_evenement, type, ordre) VALUES
  ('PROJ_A18','CdP29 — Conférence des Nations Unies sur le climat','3 négociatrices formées par l''OIF représentent leur pays. Publication note de décryptage.','2024-11-11','conference',1),
  ('PROJ_A18','Publication Guide des négociations CdP30','Guide Climate Analytics — Résumé à l''intention des décideurs.','2025-10-01','conference',2);
