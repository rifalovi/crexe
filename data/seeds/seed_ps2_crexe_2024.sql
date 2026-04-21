-- CREXE 2024 — Programme Stratégique 2
-- La langue française au service de la démocratie et de la gouvernance
-- Exercice 1er janvier – 31 décembre 2024
-- Généré le 2026-04-21 à partir du document PS2 CREX 2024_V2_17.04.2025.docx
-- Budget total PS2 engagé : 5 339 199 € — Taux d'exécution global : 96 %
-- 59 États et gouvernements concernés

-- =============================================================================
-- SECTION 1 : PROJETS
-- =============================================================================

-- Projet 9 — État civil
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A09_2024', 'PS2', 'PROJ_A09', 'brouillon',
  'État civil — Modernisation de l''enregistrement des naissances',
  '125 000 personnes dotées d''un acte d''état civil en 2024 — une identité légale pour sortir de l''invisibilité.',
  'Ce projet renforce et modernise les systèmes d''état civil dans 6 États membres francophones. En 2024, plus de 858 000 personnes ont été sensibilisées à l''enregistrement des naissances. Plus de 1 300 acteurs ont été formés dont 1 059 agents de l''état civil. Des études ont été menées au Togo, en Guinée et au Cambodge. Le taux de satisfaction des bénéficiaires atteint 100 %.',
  2024,
  800125,
  794239,
  99,
  6,
  ARRAY['état civil', 'droits civiques', 'identité légale', 'gouvernance', 'protection sociale'],
  ARRAY['enregistrement naissances', 'APAI-CRVS', 'UNICEF', 'PN-RAVEC', 'Guinée', 'Madagascar', 'Togo'],
  '{
    "coeur":   { "valeur": "794 239 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "125 000+", "label": "Personnes dotées d''un acte d''état civil", "type_preuve": "mesure" },
    "niveau2": { "valeur": "1 254", "label": "Agents et professionnels de l''état civil formés", "type_preuve": "mesure" },
    "niveau3": { "valeur": "858 000+", "label": "Personnes sensibilisées à l''importance de l''enregistrement des naissances", "type_preuve": "mesure" },
    "niveau4": { "label": "Droits civiques dans l''espace francophone", "description": "Accès facilité aux droits civils, à l''éducation et aux dispositifs de protection sociale", "type_preuve": "institutionnel" }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 10 — État de droit, droits de l'Homme et justice
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A10_2024', 'PS2', 'PROJ_A10', 'brouillon',
  'Renforcement de l''État de droit, des droits de l''Homme et de la justice',
  '2 131 acteurs des institutions judiciaires et parlementaires renforcés pour consolider la démocratie dans l''espace francophone.',
  'Ce projet accompagne les institutions garantes de l''État de droit. En 2024, l''OIF a soutenu l''APF pour former 558 participants dont 295 femmes dans 32 parlements. 19 institutions nationales des droits de l''Homme ont été renforcées via l''AFCNDH. Plus de 1 300 avocats ont été sensibilisés à la lutte anticorruption. 8 États ont été accompagnés dans leur EPU. 47 institutions garantes de l''État de droit ont été accompagnées.',
  2024,
  1228449,
  1208189,
  98,
  50,
  ARRAY['état de droit', 'droits de l''Homme', 'justice', 'parlements', 'EPU', 'corruption'],
  ARRAY['APF', 'AFCNDH', 'INDH', 'EPU', 'CPI', 'PFJ', 'PIFP', 'droits humains'],
  '{
    "coeur":   { "valeur": "1 208 189 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "2 131", "label": "Agents et acteurs des institutions renforcés", "type_preuve": "mesure" },
    "niveau2": { "valeur": "47", "label": "Institutions garantes de l''État de droit accompagnées", "type_preuve": "mesure" },
    "niveau3": { "valeur": "8", "label": "États accompagnés dans les différentes phases de l''EPU", "type_preuve": "mesure" },
    "niveau4": { "label": "Démocratie en Afrique francophone", "description": "Consolidation d''institutions judiciaires indépendantes et respectueuses des droits fondamentaux", "type_preuve": "institutionnel" }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 11 — Prévention et lutte contre les désordres de l'information
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A11_2024', 'PS2', 'PROJ_A11', 'brouillon',
  'Prévention et lutte contre les désordres de l''information',
  '1 138 professionnels formés au fact-checking et à l''éducation aux médias pour combattre la désinformation dans 10 pays.',
  'Ce projet crée les conditions d''une meilleure qualité et intégrité de l''information. En 2024, 11 projets de jumelages francophones ont été soutenus, mobilisant 29 organisations dans 12 pays. L''OIF a accompagné la Moldavie avant l''élection présidentielle et mené une mission d''expertise en Arménie. 68 % des acteurs formés ont mis en pratique les compétences acquises. 30 initiatives de lutte contre la désinformation ont été soutenues.',
  2024,
  850000,
  843855,
  99,
  10,
  ARRAY['désinformation', 'liberté de la presse', 'médias', 'fact-checking', 'éducation aux médias'],
  ARRAY['jumelages médias', 'EMI', 'fact-checking', 'régulation électorale', 'UNESCO', 'RECEF'],
  '{
    "coeur":   { "valeur": "843 855 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "1 138", "label": "Acteurs des médias et de la société civile formés", "type_preuve": "mesure" },
    "niveau2": { "valeur": "30", "label": "Initiatives de lutte contre la désinformation soutenues", "type_preuve": "mesure" },
    "niveau3": { "valeur": "68 %", "label": "Des acteurs formés qui ont mis en pratique les compétences acquises", "type_preuve": "observation" },
    "niveau4": { "label": "Espace informationnel francophone", "description": "Meilleure qualité et intégrité de l''information comme levier de démocratie", "type_preuve": "institutionnel" }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 12 — Accompagnement des processus démocratiques
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A12_2024', 'PS2', 'PROJ_A12', 'brouillon',
  'Accompagnement des processus démocratiques',
  '614 femmes candidates et élues formées — la participation politique inclusive au cœur de la démocratie francophone.',
  'Ce projet contribue à renforcer la démocratie et prévenir les crises électorales. En 2024, des MEF ont été déployées dans 10 pays (Madagascar, Mauritanie, Tchad, Togo, Maurice, Moldavie, Sénégal, Tunisie, Rwanda, Comores). 70 organes électoraux ont été renforcés. 2 100 acteurs ont été formés. 43 % déclarent avoir mis en pratique les compétences acquises avec 79 % de retombées positives dans leurs structures.',
  2024,
  1385000,
  1346720,
  97,
  35,
  ARRAY['démocratie', 'élections', 'processus électoraux', 'femmes', 'gouvernance'],
  ARRAY['MEF', 'RECEF', 'ACCF', 'missions d''observation', 'élections', 'participation féminine'],
  '{
    "coeur":   { "valeur": "1 346 720 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "2 100", "label": "Acteurs des processus démocratiques formés", "type_preuve": "mesure" },
    "niveau2": { "valeur": "614", "label": "Femmes candidates et/ou élues formées", "type_preuve": "mesure" },
    "niveau3": { "valeur": "70", "label": "Organes de gestion et de contrôle des élections renforcés", "type_preuve": "mesure" },
    "niveau4": { "label": "Démocratie dans l''espace francophone", "description": "Transparence et crédibilité accrue des processus électoraux dans les pays membres", "type_preuve": "institutionnel" }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 13 — Soutien à la paix et à la stabilité
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A13_2024', 'PS2', 'PROJ_A13', 'brouillon',
  'Soutien à la paix et à la stabilité',
  '1 528 personnels des opérations de paix formés en français pour renforcer l''efficacité des missions onusiennes.',
  'Ce projet renforce la paix et la sécurité dans l''espace francophone. En 2024, 330 militaires, policiers et civils ont été formés en français pour les opérations de paix. 1 200 personnels de la Mission multinationale Haïti (MMAS) ont reçu une formation linguistique. Deux applications mobiles ont été développées (Lexicopaix, Lexikozé). 6 pays en fragilité ont été accompagnés. 120 femmes et jeunes ont suivi des cours en ligne sur les agendas paix et sécurité.',
  2024,
  1271551,
  1146197,
  90,
  35,
  ARRAY['paix', 'sécurité', 'opérations de maintien de la paix', 'médiation', 'prévention des conflits'],
  ARRAY['MMAS', 'Haïti', 'Lexicopaix', 'Lexikozé', 'ONU Femmes', 'Université Senghor', 'maintien de la paix'],
  '{
    "coeur":   { "valeur": "1 146 197 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "1 528", "label": "Personnels formés en et au français pour les missions de paix", "type_preuve": "mesure" },
    "niveau2": { "valeur": "6", "label": "Pays en fragilité ou en transition bénéficiant d''un accompagnement spécifique", "type_preuve": "mesure" },
    "niveau3": { "valeur": "75 %", "label": "Des personnes formées ayant mis en pratique les compétences acquises", "type_preuve": "observation" },
    "niveau4": { "label": "Espace francophone de paix", "description": "Renforcement de la présence francophone dans les opérations de paix onusiennes", "type_preuve": "institutionnel" }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- =============================================================================
-- SECTION 2 : PAYS DE COUVERTURE
-- =============================================================================

-- PROJ_A09_2024 — État civil (6 pays)
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A09_2024', 'KHM'), ('PROJ_A09_2024', 'CMR'), ('PROJ_A09_2024', 'GIN'),
  ('PROJ_A09_2024', 'MDG'), ('PROJ_A09_2024', 'TGO'), ('PROJ_A09_2024', 'TCD')
ON CONFLICT DO NOTHING;

-- PROJ_A10_2024 — État de droit (50 pays — liste partielle des principaux)
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A10_2024', 'ALB'), ('PROJ_A10_2024', 'AND'), ('PROJ_A10_2024', 'ARM'),
  ('PROJ_A10_2024', 'BEL'), ('PROJ_A10_2024', 'BEN'), ('PROJ_A10_2024', 'BFA'),
  ('PROJ_A10_2024', 'BDI'), ('PROJ_A10_2024', 'CPV'), ('PROJ_A10_2024', 'KHM'),
  ('PROJ_A10_2024', 'CMR'), ('PROJ_A10_2024', 'CAN'), ('PROJ_A10_2024', 'CAF'),
  ('PROJ_A10_2024', 'COM'), ('PROJ_A10_2024', 'COG'), ('PROJ_A10_2024', 'COD'),
  ('PROJ_A10_2024', 'CIV'), ('PROJ_A10_2024', 'DJI'), ('PROJ_A10_2024', 'EGY'),
  ('PROJ_A10_2024', 'FRA'), ('PROJ_A10_2024', 'GAB'), ('PROJ_A10_2024', 'GEO'),
  ('PROJ_A10_2024', 'GRC'), ('PROJ_A10_2024', 'GIN'), ('PROJ_A10_2024', 'GNQ'),
  ('PROJ_A10_2024', 'HTI'), ('PROJ_A10_2024', 'XKX'), ('PROJ_A10_2024', 'LAO'),
  ('PROJ_A10_2024', 'LBN'), ('PROJ_A10_2024', 'LUX'), ('PROJ_A10_2024', 'MKD'),
  ('PROJ_A10_2024', 'MDG'), ('PROJ_A10_2024', 'MLI'), ('PROJ_A10_2024', 'MAR'),
  ('PROJ_A10_2024', 'MUS'), ('PROJ_A10_2024', 'MRT'), ('PROJ_A10_2024', 'MDA'),
  ('PROJ_A10_2024', 'MNE'), ('PROJ_A10_2024', 'ROU'), ('PROJ_A10_2024', 'RWA'),
  ('PROJ_A10_2024', 'SEN'), ('PROJ_A10_2024', 'SYC'), ('PROJ_A10_2024', 'CHE'),
  ('PROJ_A10_2024', 'TCD'), ('PROJ_A10_2024', 'TGO'), ('PROJ_A10_2024', 'VNM')
ON CONFLICT DO NOTHING;

-- PROJ_A11_2024 — Désordres de l'information (10 pays)
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A11_2024', 'ARM'), ('PROJ_A11_2024', 'BEN'), ('PROJ_A11_2024', 'COD'),
  ('PROJ_A11_2024', 'CIV'), ('PROJ_A11_2024', 'HTI'), ('PROJ_A11_2024', 'MLI'),
  ('PROJ_A11_2024', 'MDA'), ('PROJ_A11_2024', 'NER'), ('PROJ_A11_2024', 'SEN'),
  ('PROJ_A11_2024', 'TCD')
ON CONFLICT DO NOTHING;

-- PROJ_A12_2024 — Processus démocratiques (35 pays — liste partielle)
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A12_2024', 'ALB'), ('PROJ_A12_2024', 'AND'), ('PROJ_A12_2024', 'ARM'),
  ('PROJ_A12_2024', 'BEL'), ('PROJ_A12_2024', 'BEN'), ('PROJ_A12_2024', 'BFA'),
  ('PROJ_A12_2024', 'BDI'), ('PROJ_A12_2024', 'KHM'), ('PROJ_A12_2024', 'CMR'),
  ('PROJ_A12_2024', 'CAN'), ('PROJ_A12_2024', 'CPV'), ('PROJ_A12_2024', 'CAF'),
  ('PROJ_A12_2024', 'COM'), ('PROJ_A12_2024', 'COD'), ('PROJ_A12_2024', 'CIV'),
  ('PROJ_A12_2024', 'DJI'), ('PROJ_A12_2024', 'EGY'), ('PROJ_A12_2024', 'FRA'),
  ('PROJ_A12_2024', 'GAB'), ('PROJ_A12_2024', 'GIN'), ('PROJ_A12_2024', 'GNQ'),
  ('PROJ_A12_2024', 'HTI'), ('PROJ_A12_2024', 'LBN'), ('PROJ_A12_2024', 'LUX'),
  ('PROJ_A12_2024', 'MDG'), ('PROJ_A12_2024', 'MAR'), ('PROJ_A12_2024', 'MDA'),
  ('PROJ_A12_2024', 'MRT'), ('PROJ_A12_2024', 'MUS'), ('PROJ_A12_2024', 'RWA'),
  ('PROJ_A12_2024', 'SEN'), ('PROJ_A12_2024', 'TCD'), ('PROJ_A12_2024', 'TGO'),
  ('PROJ_A12_2024', 'TUN')
ON CONFLICT DO NOTHING;

-- PROJ_A13_2024 — Paix et stabilité (35 pays — liste partielle)
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A13_2024', 'ALB'), ('PROJ_A13_2024', 'ARG'), ('PROJ_A13_2024', 'BEN'),
  ('PROJ_A13_2024', 'BGR'), ('PROJ_A13_2024', 'BFA'), ('PROJ_A13_2024', 'BDI'),
  ('PROJ_A13_2024', 'KHM'), ('PROJ_A13_2024', 'CMR'), ('PROJ_A13_2024', 'CAF'),
  ('PROJ_A13_2024', 'COM'), ('PROJ_A13_2024', 'COG'), ('PROJ_A13_2024', 'COD'),
  ('PROJ_A13_2024', 'CIV'), ('PROJ_A13_2024', 'EGY'), ('PROJ_A13_2024', 'FRA'),
  ('PROJ_A13_2024', 'GAB'), ('PROJ_A13_2024', 'GIN'), ('PROJ_A13_2024', 'HTI'),
  ('PROJ_A13_2024', 'LBN'), ('PROJ_A13_2024', 'MDG'), ('PROJ_A13_2024', 'MLI'),
  ('PROJ_A13_2024', 'MAR'), ('PROJ_A13_2024', 'MDA'), ('PROJ_A13_2024', 'NER'),
  ('PROJ_A13_2024', 'QAT'), ('PROJ_A13_2024', 'ROU'), ('PROJ_A13_2024', 'RWA'),
  ('PROJ_A13_2024', 'SEN'), ('PROJ_A13_2024', 'TCD'), ('PROJ_A13_2024', 'TGO'),
  ('PROJ_A13_2024', 'TUN'), ('PROJ_A13_2024', 'UKR')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 3 : INDICATEURS
-- =============================================================================

INSERT INTO indicateurs (projet_id, libelle, valeur_numerique, unite, type_preuve) VALUES
  -- P9
  ('PROJ_A09_2024', 'Personnes dotées d''un acte d''état civil', 125000, 'personnes', 'mesure'),
  ('PROJ_A09_2024', 'Agents et professionnels de l''état civil formés', 1254, 'personnes', 'mesure'),
  ('PROJ_A09_2024', 'Personnes sensibilisées à l''enregistrement des naissances', 858000, 'personnes', 'mesure'),
  ('PROJ_A09_2024', 'Valorisation des connaissances par les personnes formées', 83, '%', 'observation'),
  ('PROJ_A09_2024', 'Taux de satisfaction des bénéficiaires', 100, '%', 'observation'),
  -- P10
  ('PROJ_A10_2024', 'Agents et acteurs des institutions renforcés en capacités', 2131, 'personnes', 'mesure'),
  ('PROJ_A10_2024', 'Institutions garantes de l''État de droit accompagnées', 47, 'institutions', 'mesure'),
  ('PROJ_A10_2024', 'États accompagnés dans les phases de l''EPU', 8, 'États', 'mesure'),
  ('PROJ_A10_2024', 'Parlementaires formés (APF) dont femmes et jeunes délégués', 558, 'personnes', 'mesure'),
  ('PROJ_A10_2024', 'INDH renforcées via l''AFCNDH', 19, 'institutions', 'mesure'),
  ('PROJ_A10_2024', 'Avocats sensibilisés à la lutte anticorruption et blanchiment', 1300, 'avocats', 'estimation'),
  -- P11
  ('PROJ_A11_2024', 'Acteurs des médias et de la société civile formés', 1138, 'personnes', 'mesure'),
  ('PROJ_A11_2024', 'Initiatives de lutte contre la désinformation soutenues', 30, 'initiatives', 'mesure'),
  ('PROJ_A11_2024', 'Acteurs ayant mis en pratique les compétences acquises', 68, '%', 'observation'),
  ('PROJ_A11_2024', 'Organisations mobilisées dans 12 pays via les jumelages', 29, 'organisations', 'mesure'),
  -- P12
  ('PROJ_A12_2024', 'Acteurs des processus démocratiques formés', 2100, 'personnes', 'mesure'),
  ('PROJ_A12_2024', 'Femmes candidates et/ou élues formées', 614, 'femmes', 'mesure'),
  ('PROJ_A12_2024', 'Organes électoraux renforcés', 70, 'organes', 'mesure'),
  ('PROJ_A12_2024', 'Missions d''Évaluation et de Formation déployées', 10, 'missions', 'mesure'),
  ('PROJ_A12_2024', 'Acteurs ayant mis en pratique les compétences acquises', 43, '%', 'observation'),
  -- P13
  ('PROJ_A13_2024', 'Personnels formés en et au français pour les missions de paix', 1528, 'personnes', 'mesure'),
  ('PROJ_A13_2024', 'Pays en fragilité ou en transition accompagnés', 6, 'pays', 'mesure'),
  ('PROJ_A13_2024', 'Jeunes et femmes renforcés dans les processus de paix', 124, 'personnes', 'mesure'),
  ('PROJ_A13_2024', 'Personnels MMAS Haïti formés (linguistique et interculturel)', 1200, 'personnels', 'estimation'),
  ('PROJ_A13_2024', 'Personnes formées ayant mis en pratique les compétences', 75, '%', 'observation')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 4 : TÉMOIGNAGES
-- =============================================================================

INSERT INTO temoignages (projet_id, auteur, fonction, pays, citation) VALUES
  (
    'PROJ_A09_2024',
    'Mme RAHARISOA Lalao',
    'Directrice de l''école primaire publique de Soarano, Antananarivo',
    'MDG',
    'À l''École Primaire Publique que j''ai dirigée, il y a encore eu des enfants réduits à n''exister qu''à travers des sobriquets liés à leur physique faute de nom officiel dû à l''absence d''acte de naissance. Cette initiative a permis à ces "enfants fantômes" d''obtenir gratuitement leur précieux sésame vers l''éducation et la citoyenneté, transformant leur surnom stigmatisant en une identité juridique reconnue par l''État.'
  ),
  (
    'PROJ_A09_2024',
    'Bénéficiaire de 16 ans',
    'Élève',
    'MDG',
    'L''obtention de mon acte de naissance était très importante pour moi. Je vais pouvoir poursuivre mes études, passer l''examen du CEPE (Certificat d''Études Primaires Élémentaires), et obtenir des papiers administratifs importants. J''ai 16 ans, et avec mon acte de naissance je vais enfin pouvoir bénéficier d''une carte d''identité nationale.'
  ),
  (
    'PROJ_A10_2024',
    'Mme Esther Ngo MOUNTGUI',
    'Première présidente de la Cour commune de justice et d''arbitrage de l''OHADA',
    'CIV',
    'Ma participation à ce colloque international a été une expérience particulièrement enrichissante, tant sur le plan intellectuel que professionnel. J''ai été particulièrement marquée par la richesse des interventions portant sur l''indépendance de la justice, la lutte contre l''impunité, et la participation citoyenne dans les processus démocratiques.'
  ),
  (
    'PROJ_A13_2024',
    'Beverly',
    'Policière kényane de la Mission multinationale d''appui à la sécurité (MMAS) en Haïti',
    'KEN',
    'Grâce à la formation, j''ai appris à saluer quelqu''un, à me présenter, à exprimer des besoins, à donner et demander des informations personnelles et à donner quelques instructions. J''ai aimé la présentation sur le contexte socio-culturel. Je vais continuer d''apprendre avec l''application Lexicopaix et Lexikozé.'
  )
ON CONFLICT DO NOTHING;
