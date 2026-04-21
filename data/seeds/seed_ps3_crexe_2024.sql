-- CREXE 2024 — Programme Stratégique 3
-- La langue française, vecteur de développement durable
-- Exercice 1er janvier – 31 décembre 2024
-- Généré le 2026-04-21 à partir du document PS3_CREX 2024_17.04.2025.docx
-- Budget total PS3 engagé : 8 631 767 € — Taux d'exécution global : 98 %
-- 46 États et gouvernements concernés
-- 7 projets : PROJ_A14 à PROJ_A20

-- =============================================================================
-- SECTION 1 : PROJETS
-- =============================================================================

-- Projet 14 — La Francophonie avec Elles
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A14_2024', 'PS3', 'PROJ_A14', 'brouillon',
  'La Francophonie avec Elles — Autonomisation économique des femmes',
  '10 408 femmes soutenues dans 23 pays en 2024 — 92,6 % déclarent une activité professionnelle stabilisée grâce au projet.',
  'Le Fonds « La Francophonie avec Elles » renforce l''autonomie économique et sociale des femmes en situation de vulnérabilité. En 2024, la 5e édition a soutenu 50 projets dans 23 pays avec une subvention moyenne de 74 000 €. 46 % des projets sont de nature coopérative. Le financement aux femmes a été rééquilibré géographiquement avec une hausse en Afrique centrale (28 %) et au Moyen-Orient (15 %). 58 % des bénéficiaires déclarent une augmentation de leurs revenus.',
  2024,
  2136500,
  2082104,
  97,
  23,
  ARRAY['égalité femmes-hommes', 'entrepreneuriat féminin', 'autonomisation économique', 'coopératives'],
  ARRAY['Fonds FAE', 'RF-EFH', 'AGR', 'coopératives', 'inclusion financière', 'EFH'],
  '{
    "coeur":   { "valeur": "2 082 104 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "10 408", "label": "Femmes bénéficiaires directes dans 23 pays", "type_preuve": "mesure" },
    "niveau2": { "valeur": "50", "label": "Projets sélectionnés et mis en œuvre", "type_preuve": "mesure" },
    "niveau3": { "valeur": "92,6 %", "label": "Des femmes ayant une activité professionnelle stabilisée", "type_preuve": "observation" },
    "niveau4": { "label": "Espace francophone inclusif", "description": "Autonomisation économique et sociale des femmes francophones les plus vulnérables", "type_preuve": "institutionnel" }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 15 — Innovations et plaidoyers francophones
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A15_2024', 'PS3', 'PROJ_A15', 'brouillon',
  'Innovations et plaidoyers francophones',
  '1 000 jeunes mobilisés pour le concours « Innovons aujourd''hui, créons l''avenir ! » — 5 projets lauréats financés en 2024.',
  'Ce nouveau projet fait émerger des solutions innovantes portées par des jeunes, des femmes et la société civile. En 2024, le concours jeunesse a financé 5 projets issus d''Haïti, du Maroc, du Cameroun, de France et du Sénégal. La 13e Assemblée plénière de la COING a réuni 100+ organisations. Le RIJF regroupe 380+ organisations dans 30 pays. Le Forum de la jeunesse francophone d''Asie-Pacifique à Hanoï a réuni une soixantaine de jeunes leaders.',
  2024,
  636940,
  593002,
  93,
  6,
  ARRAY['innovation', 'jeunesse', 'société civile', 'entrepreneuriat', 'Asie-Pacifique'],
  ARRAY['RIJF', 'COING', 'concours jeunesse', 'micro-projets', 'Forum Asie-Pacifique', 'innovation sociale'],
  '{
    "coeur":   { "valeur": "593 002 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "1 000", "label": "Jeunes ayant participé aux ateliers du concours jeunesse", "type_preuve": "mesure" },
    "niveau2": { "valeur": "5", "label": "Projets de jeunes lauréats financés (Haïti, Maroc, Cameroun, France, Sénégal)", "type_preuve": "mesure" },
    "niveau3": { "valeur": "380+", "label": "Organisations membres du Réseau international de la jeunesse francophone (30 pays)", "type_preuve": "mesure" },
    "niveau4": { "label": "Société civile francophone", "description": "Émergence d''une nouvelle génération de porteurs de projets au service de la Francophonie", "type_preuve": "institutionnel" }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 16 — D-CLIC : Formation au numérique
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A16_2024', 'PS3', 'PROJ_A16', 'brouillon',
  'D-CLIC : Formez-vous au numérique',
  '3 510 jeunes et femmes formés aux métiers du numérique, 80 % certifiés — l''employabilité numérique au cœur du développement francophone.',
  'D-CLIC renforce les compétences numériques des jeunes et femmes pour leur insertion professionnelle. En 2024, 3 510 jeunes ont été formés en présentiel et 1 528 en ligne. 10 stratégies nationales EFTP élaborées. 15 événements de plaidoyer organisés dans 6 villes mondiales. L''OIF a contribué à l''intégration du multilinguisme dans le Pacte numérique mondial adopté à l''ONU en septembre 2024. 40 % des bénéficiaires insérés professionnellement.',
  2024,
  1534186,
  1516388,
  99,
  25,
  ARRAY['numérique', 'formation professionnelle', 'employabilité', 'gouvernance numérique', 'intelligence artificielle'],
  ARRAY['D-CLIC', 'EFTP', 'Pacte numérique mondial', 'GTEN', 'GenIA', 'cybersécurité', 'marketing numérique'],
  '{
    "coeur":   { "valeur": "1 516 388 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "5 038", "label": "Jeunes et femmes formés aux métiers du numérique (présentiel + ligne)", "type_preuve": "mesure" },
    "niveau2": { "valeur": "80 %", "label": "Des participants ayant obtenu une certification numérique", "type_preuve": "mesure" },
    "niveau3": { "valeur": "40 %", "label": "Des bénéficiaires insérés professionnellement dans le numérique", "type_preuve": "observation" },
    "niveau4": { "label": "Gouvernance numérique francophone", "description": "Diversité culturelle et linguistique intégrée dans le Pacte numérique mondial de l''ONU", "type_preuve": "institutionnel" }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 17 — Promotion des échanges économiques et commerciaux francophones
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A17_2024', 'PS3', 'PROJ_A17', 'brouillon',
  'Promotion des échanges économiques et commerciaux francophones',
  '5,5 millions € de chiffre d''affaires additionnel générés lors des deux Missions économiques 2024 — à Bucarest et Montréal-Québec.',
  'Ce projet renforce la diplomatie économique francophone. En 2024, deux MEF ont été organisées : la 4e à Bucarest (106 entreprises, 25 États, 1 000 B2B, 2,5 M€ CA additionnel) et la 5e à Montréal-Québec (76 entreprises, 22 États, 880 B2B, 3 M€ CA additionnel). 130 dirigeants de PME de 14 pays ont été formés via le RIAFPI. L''OIF a plaidé pour un indice de vulnérabilité multidimensionnelle à l''ONU.',
  2024,
  947501,
  923851,
  98,
  33,
  ARRAY['économie', 'commerce', 'diplomatie économique', 'PME', 'investissements', 'B2B'],
  ARRAY['MEF', 'RIAFPI', 'Alliance des Patronats', 'Bucarest', 'Montréal', 'CNUDCI', 'RSE'],
  '{
    "coeur":   { "valeur": "923 851 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "5 500 000", "label": "Volume additionnel de chiffre d''affaires généré (2 MEF)", "unite": "€", "type_preuve": "estimation" },
    "niveau2": { "valeur": "1 880", "label": "Rencontres d''affaires B2B organisées lors des deux MEF", "type_preuve": "mesure" },
    "niveau3": { "valeur": "130", "label": "Dirigeants de PME formés et mis en réseau (14 pays)", "type_preuve": "mesure" },
    "niveau4": { "label": "Espace économique francophone", "description": "Renforcement des échanges commerciaux et de la diplomatie économique entre pays membres", "type_preuve": "institutionnel" }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 18 — Environnement et climat
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A18_2024', 'PS3', 'PROJ_A18', 'brouillon',
  'Accompagnement des transformations structurelles en matière d''environnement et de climat',
  '43 248 apprenants formés en ligne sur la gestion durable de l''environnement — 100 millions $ de projets environnementaux soutenus.',
  'Ce projet renforce la résilience des pays francophones face aux changements climatiques. En 2024, 2 196 délégués ont été formés aux techniques de négociation internationale (climat, biodiversité, désertification). 58 négociatrices ont été financées. Un portefeuille de 21 projets de plus de 100 millions $ a été soutenu dans 15 pays. 171 éco-innovations incubées, 63 brevets déposés. 240 jeunes haïtiens formés en agriculture durable.',
  2024,
  1201000,
  1179000,
  98,
  18,
  ARRAY['environnement', 'climat', 'biodiversité', 'négociations climatiques', 'éco-innovations', 'ODD'],
  ARRAY['IFDD', 'CdP', 'Fonds vert', 'CDN', 'Accord de Paris', 'biodiversité', 'éco-innovations', 'Fab Labs'],
  '{
    "coeur":   { "valeur": "1 179 000 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "43 248", "label": "Apprenants formés en ligne sur la gestion durable de l''environnement (40 pays)", "type_preuve": "mesure" },
    "niveau2": { "valeur": "2 196", "label": "Délégués formés aux négociations sur le climat et la biodiversité", "type_preuve": "mesure" },
    "niveau3": { "valeur": "171", "label": "Éco-innovations frugales incubées (63 brevets déposés, 100+ articles scientifiques)", "type_preuve": "mesure" },
    "niveau4": { "label": "Résilience climatique francophone", "description": "Renforcement de la position francophone dans les négociations climatiques internationales", "type_preuve": "institutionnel" }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 19 — Soutien aux initiatives environnementales dans le Bassin du Congo
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A19_2024', 'PS3', 'PROJ_A19', 'brouillon',
  'Soutien aux initiatives environnementales dans le Bassin du Congo',
  '431 jeunes agri-preneurs du Bassin du Congo accompagnés — 60 prototypes d''innovations environnementales développés.',
  'Ce projet améliore la résilience des populations et des écosystèmes du Bassin du Congo. En 2024, 431 jeunes dont 43 % de femmes ont été formés et accompagnés dans des projets agricoles durables. 3 laboratoires vivants d''éco-innovation ont été lancés au Cameroun, Congo et RDC. 60 prototypes développés dont 16 valorisés lors de Salons des innovations. Un séminaire régional a réuni 60 participants de 6 pays à Libreville.',
  2024,
  1248000,
  1246515,
  100,
  6,
  ARRAY['Bassin du Congo', 'agriculture durable', 'éco-innovation', 'jeunesse', 'résilience climatique'],
  ARRAY['PADTIE', 'laboratoires vivants', 'agri-preneurs', 'REPAC', 'CEEAC', 'Commission Climat Bassin Congo'],
  '{
    "coeur":   { "valeur": "1 246 515 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "431", "label": "Jeunes agri-preneurs formés et accompagnés (43 % femmes)", "type_preuve": "mesure" },
    "niveau2": { "valeur": "60", "label": "Prototypes d''innovations environnementales développés (dont 28 par des femmes)", "type_preuve": "mesure" },
    "niveau3": { "valeur": "4,25", "label": "Emplois générés en moyenne par bénéficiaire (estimation terrain)", "type_preuve": "observation" },
    "niveau4": { "label": "Écosystèmes du Bassin du Congo", "description": "Agriculture durable et économie circulaire comme leviers de résilience climatique régionale", "type_preuve": "institutionnel" }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 20 — Promotion du tourisme durable
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A20_2024', 'PS3', 'PROJ_A20', 'brouillon',
  'Promotion du tourisme durable — Destination Eco-Talents',
  '1 106 jeunes formés aux métiers du tourisme durable dans 4 pays pilotes — 52 emplois créés au Vietnam dès la première édition.',
  'L''initiative Destination Eco-Talents (DET) renforce les compétences des jeunes et femmes dans les métiers du tourisme durable. En 2024, la phase pilote est déployée au Cabo Verde, Cambodge, Comores et Vietnam. 1 106 jeunes dont 406 étudiants au Vietnam et 700 jeunes dans les 3 autres pays pilotes ont été formés. 5 référentiels de formation ont été élaborés pour Cabo Verde. 403 jeunes sensibilisés au tourisme durable dans 3 villes du Vietnam.',
  2024,
  1094996,
  1090776,
  100,
  6,
  ARRAY['tourisme durable', 'hôtellerie', 'écotourisme', 'employabilité', 'jeunesse'],
  ARRAY['DET', 'Destination Eco-Talents', 'Cabo Verde', 'Cambodge', 'Comores', 'Vietnam', 'Horizon.eco'],
  '{
    "coeur":   { "valeur": "1 090 776 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "1 106", "label": "Jeunes formés aux métiers du tourisme durable (4 pays pilotes)", "type_preuve": "mesure" },
    "niveau2": { "valeur": "52", "label": "Jeunes recrutés à des emplois ou stages à l''issue d''une rencontre professionnelle au Vietnam", "type_preuve": "mesure" },
    "niveau3": { "valeur": "200", "label": "Postes proposés lors d''une table ronde dédiée au tourisme durable", "type_preuve": "mesure" },
    "niveau4": { "label": "Tourisme francophone durable", "description": "Développement d''une filière touristique compétitive et écoresponsable dans les pays francophones", "type_preuve": "institutionnel" }
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

-- PROJ_A14_2024 — La Francophonie avec Elles (23 pays)
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A14_2024', 'BEN'), ('PROJ_A14_2024', 'BFA'), ('PROJ_A14_2024', 'BDI'),
  ('PROJ_A14_2024', 'CPV'), ('PROJ_A14_2024', 'KHM'), ('PROJ_A14_2024', 'CMR'),
  ('PROJ_A14_2024', 'COM'), ('PROJ_A14_2024', 'COD'), ('PROJ_A14_2024', 'DJI'),
  ('PROJ_A14_2024', 'GAB'), ('PROJ_A14_2024', 'GIN'), ('PROJ_A14_2024', 'HTI'),
  ('PROJ_A14_2024', 'LBN'), ('PROJ_A14_2024', 'MDG'), ('PROJ_A14_2024', 'MLI'),
  ('PROJ_A14_2024', 'MUS'), ('PROJ_A14_2024', 'CAF'), ('PROJ_A14_2024', 'RWA'),
  ('PROJ_A14_2024', 'SEN'), ('PROJ_A14_2024', 'SYC'), ('PROJ_A14_2024', 'TCD'),
  ('PROJ_A14_2024', 'TGO'), ('PROJ_A14_2024', 'VNM')
ON CONFLICT DO NOTHING;

-- PROJ_A15_2024 — Innovations (6 pays)
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A15_2024', 'CMR'), ('PROJ_A15_2024', 'FRA'), ('PROJ_A15_2024', 'HTI'),
  ('PROJ_A15_2024', 'LBN'), ('PROJ_A15_2024', 'MAR'), ('PROJ_A15_2024', 'SEN')
ON CONFLICT DO NOTHING;

-- PROJ_A16_2024 — D-CLIC (25 pays)
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A16_2024', 'BEN'), ('PROJ_A16_2024', 'BFA'), ('PROJ_A16_2024', 'BDI'),
  ('PROJ_A16_2024', 'CMR'), ('PROJ_A16_2024', 'CAF'), ('PROJ_A16_2024', 'COM'),
  ('PROJ_A16_2024', 'COD'), ('PROJ_A16_2024', 'CIV'), ('PROJ_A16_2024', 'DJI'),
  ('PROJ_A16_2024', 'GAB'), ('PROJ_A16_2024', 'GIN'), ('PROJ_A16_2024', 'HTI'),
  ('PROJ_A16_2024', 'MDG'), ('PROJ_A16_2024', 'MLI'), ('PROJ_A16_2024', 'MAR'),
  ('PROJ_A16_2024', 'MRT'), ('PROJ_A16_2024', 'MUS'), ('PROJ_A16_2024', 'NER'),
  ('PROJ_A16_2024', 'NGA'), ('PROJ_A16_2024', 'RWA'), ('PROJ_A16_2024', 'SYC'),
  ('PROJ_A16_2024', 'TCD'), ('PROJ_A16_2024', 'TGO'), ('PROJ_A16_2024', 'TUN')
ON CONFLICT DO NOTHING;

-- PROJ_A17_2024 — Échanges économiques (33 pays — liste partielle)
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A17_2024', 'BEL'), ('PROJ_A17_2024', 'BEN'), ('PROJ_A17_2024', 'BFA'),
  ('PROJ_A17_2024', 'BDI'), ('PROJ_A17_2024', 'KHM'), ('PROJ_A17_2024', 'CMR'),
  ('PROJ_A17_2024', 'CAN'), ('PROJ_A17_2024', 'COM'), ('PROJ_A17_2024', 'COG'),
  ('PROJ_A17_2024', 'COD'), ('PROJ_A17_2024', 'CIV'), ('PROJ_A17_2024', 'DJI'),
  ('PROJ_A17_2024', 'FRA'), ('PROJ_A17_2024', 'GAB'), ('PROJ_A17_2024', 'GIN'),
  ('PROJ_A17_2024', 'HTI'), ('PROJ_A17_2024', 'LBN'), ('PROJ_A17_2024', 'MDG'),
  ('PROJ_A17_2024', 'MLI'), ('PROJ_A17_2024', 'MAR'), ('PROJ_A17_2024', 'MDA'),
  ('PROJ_A17_2024', 'QAT'), ('PROJ_A17_2024', 'ROU'), ('PROJ_A17_2024', 'SEN'),
  ('PROJ_A17_2024', 'SVK'), ('PROJ_A17_2024', 'CHE'), ('PROJ_A17_2024', 'TCD'),
  ('PROJ_A17_2024', 'TUN'), ('PROJ_A17_2024', 'UKR'), ('PROJ_A17_2024', 'VNM')
ON CONFLICT DO NOTHING;

-- PROJ_A18_2024 — Environnement et climat (18 pays)
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A18_2024', 'ARM'), ('PROJ_A18_2024', 'BEN'), ('PROJ_A18_2024', 'BGR'),
  ('PROJ_A18_2024', 'BFA'), ('PROJ_A18_2024', 'BDI'), ('PROJ_A18_2024', 'CMR'),
  ('PROJ_A18_2024', 'CAN'), ('PROJ_A18_2024', 'CAF'), ('PROJ_A18_2024', 'COM'),
  ('PROJ_A18_2024', 'GAB'), ('PROJ_A18_2024', 'GIN'), ('PROJ_A18_2024', 'GNQ'),
  ('PROJ_A18_2024', 'HTI'), ('PROJ_A18_2024', 'MDG'), ('PROJ_A18_2024', 'MRT'),
  ('PROJ_A18_2024', 'MDA'), ('PROJ_A18_2024', 'ROU'), ('PROJ_A18_2024', 'TCD')
ON CONFLICT DO NOTHING;

-- PROJ_A19_2024 — Bassin du Congo (6 pays)
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A19_2024', 'CMR'), ('PROJ_A19_2024', 'CAF'), ('PROJ_A19_2024', 'COG'),
  ('PROJ_A19_2024', 'COD'), ('PROJ_A19_2024', 'GAB'), ('PROJ_A19_2024', 'GNQ')
ON CONFLICT DO NOTHING;

-- PROJ_A20_2024 — Tourisme durable (6 pays)
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A20_2024', 'CPV'), ('PROJ_A20_2024', 'KHM'), ('PROJ_A20_2024', 'COM'),
  ('PROJ_A20_2024', 'MDG'), ('PROJ_A20_2024', 'MAR'), ('PROJ_A20_2024', 'VNM')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 3 : INDICATEURS
-- =============================================================================

INSERT INTO indicateurs (projet_id, libelle, valeur_numerique, unite, type_preuve) VALUES
  -- P14
  ('PROJ_A14_2024', 'Femmes bénéficiaires directes', 10408, 'femmes', 'mesure'),
  ('PROJ_A14_2024', 'Projets sélectionnés et mis en œuvre', 50, 'projets', 'mesure'),
  ('PROJ_A14_2024', 'Pays couverts', 23, 'pays', 'mesure'),
  ('PROJ_A14_2024', 'Subvention moyenne par projet', 74000, '€', 'mesure'),
  ('PROJ_A14_2024', 'Coût par bénéficiaire', 350, '€', 'mesure'),
  ('PROJ_A14_2024', 'Femmes ayant une activité professionnelle stabilisée', 92.6, '%', 'observation'),
  ('PROJ_A14_2024', 'Femmes déclarant une augmentation de revenus', 58, '%', 'observation'),
  ('PROJ_A14_2024', 'Projets de nature coopérative', 46, '%', 'mesure'),
  -- P15
  ('PROJ_A15_2024', 'Jeunes ayant participé aux ateliers du concours', 1000, 'jeunes', 'mesure'),
  ('PROJ_A15_2024', 'Projets de jeunes lauréats financés', 5, 'projets', 'mesure'),
  ('PROJ_A15_2024', 'Organisations membres du RIJF', 380, 'organisations', 'mesure'),
  ('PROJ_A15_2024', 'Pays représentés dans le RIJF', 30, 'pays', 'mesure'),
  ('PROJ_A15_2024', 'Organisations présentes à la 13e Assemblée COING', 100, 'organisations', 'estimation'),
  -- P16
  ('PROJ_A16_2024', 'Jeunes et femmes formés en présentiel aux métiers du numérique', 3510, 'personnes', 'mesure'),
  ('PROJ_A16_2024', 'Jeunes et femmes formés en ligne', 1528, 'personnes', 'mesure'),
  ('PROJ_A16_2024', 'Stratégies nationales EFTP élaborées', 10, 'stratégies', 'mesure'),
  ('PROJ_A16_2024', 'Décideurs ciblés par les actions de plaidoyer', 500, 'décideurs', 'estimation'),
  ('PROJ_A16_2024', 'Taux de certification des participants', 80, '%', 'mesure'),
  ('PROJ_A16_2024', 'Taux d''insertion professionnelle des bénéficiaires', 40, '%', 'observation'),
  -- P17
  ('PROJ_A17_2024', 'Volume de CA additionnel généré (MEF Bucarest)', 2500000, '€', 'estimation'),
  ('PROJ_A17_2024', 'Volume de CA additionnel généré (MEF Montréal-Québec)', 3000000, '€', 'estimation'),
  ('PROJ_A17_2024', 'Rencontres d''affaires B2B organisées (total 2 MEF)', 1880, 'B2B', 'mesure'),
  ('PROJ_A17_2024', 'Dirigeants de PME formés et mis en réseau', 130, 'dirigeants', 'mesure'),
  ('PROJ_A17_2024', 'Pays représentés à la 4e MEF Bucarest', 25, 'pays', 'mesure'),
  ('PROJ_A17_2024', 'Pays représentés à la 5e MEF Montréal-Québec', 22, 'pays', 'mesure'),
  -- P18
  ('PROJ_A18_2024', 'Apprenants formés en ligne sur la gestion durable', 43248, 'apprenants', 'mesure'),
  ('PROJ_A18_2024', 'Délégués formés aux négociations climatiques', 2196, 'délégués', 'mesure'),
  ('PROJ_A18_2024', 'Négociatrices financées pour participer aux COP', 58, 'femmes', 'mesure'),
  ('PROJ_A18_2024', 'Projets environnementaux soutenus (budget cumulé >100 M$)', 21, 'projets', 'mesure'),
  ('PROJ_A18_2024', 'Pays bénéficiaires du portefeuille de projets', 15, 'pays', 'mesure'),
  ('PROJ_A18_2024', 'Éco-innovations frugales incubées', 171, 'innovations', 'mesure'),
  ('PROJ_A18_2024', 'Brevets déposés', 63, 'brevets', 'mesure'),
  ('PROJ_A18_2024', 'Articles scientifiques publiés', 100, 'articles', 'estimation'),
  ('PROJ_A18_2024', 'Jeunes haïtiens formés en agriculture durable', 240, 'jeunes', 'mesure'),
  -- P19
  ('PROJ_A19_2024', 'Jeunes agri-preneurs formés et accompagnés', 431, 'jeunes', 'mesure'),
  ('PROJ_A19_2024', 'Femmes parmi les bénéficiaires', 43, '%', 'mesure'),
  ('PROJ_A19_2024', 'Prototypes d''innovations environnementales développés', 60, 'prototypes', 'mesure'),
  ('PROJ_A19_2024', 'Prototypes valorisés lors de Salons des innovations', 16, 'prototypes', 'mesure'),
  ('PROJ_A19_2024', 'Bénéficiaires mobilisés pour les laboratoires vivants', 150, 'personnes', 'mesure'),
  ('PROJ_A19_2024', 'Bénéficiaires ayant adopté de nouvelles pratiques agricoles', 60, '%', 'observation'),
  -- P20
  ('PROJ_A20_2024', 'Jeunes formés aux métiers du tourisme durable', 1106, 'jeunes', 'mesure'),
  ('PROJ_A20_2024', 'Étudiants en cours de formation au Cabo Verde, Cambodge et Comores', 700, 'étudiants', 'mesure'),
  ('PROJ_A20_2024', 'Étudiants formés au Vietnam', 406, 'étudiants', 'mesure'),
  ('PROJ_A20_2024', 'Jeunes sensibilisés au tourisme durable au Vietnam', 403, 'jeunes', 'mesure'),
  ('PROJ_A20_2024', 'Emplois ou stages créés au Vietnam', 52, 'emplois/stages', 'mesure'),
  ('PROJ_A20_2024', 'Référentiels de formation élaborés pour le Cabo Verde', 5, 'référentiels', 'mesure')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 4 : TÉMOIGNAGES
-- =============================================================================

INSERT INTO temoignages (projet_id, auteur, fonction, pays, citation) VALUES
  (
    'PROJ_A14_2024',
    'Sesseao Déagoulé',
    'Bénéficiaire du Fonds « La Francophonie avec Elles »',
    'TGO',
    'Je vais persévérer. Ma ferme, je vais l''agrandir, en avoir deux et ouvrir un magasin, et je le ferai. [...] Aujourd''hui, je suis contente, je marche la tête haute.'
  ),
  (
    'PROJ_A15_2024',
    'Charles Claudel',
    'Lauréat dans la catégorie Emploi et entrepreneuriat',
    'HTI',
    'Très content de recevoir ce prestigieux prix. Je continue à donner mon soutien aux causes communautaires.'
  ),
  (
    'PROJ_A15_2024',
    'Duangmala Phommavong',
    'Experte, participant au Forum de la jeunesse d''Asie-Pacifique',
    'LAO',
    'Cette conférence de la jeunesse francophone est capitale pour marquer l''importance de la francophonie pour la jeunesse d''Asie-Pacifique. La Francophonie peut contribuer à la formation des jeunes en Asie – le Laos, le Cambodge, le Vietnam – parce qu''aujourd''hui on a besoin de jeunes formés en technologies, en gestion, etc.'
  ),
  (
    'PROJ_A16_2024',
    'Sadou Félix NA''ATMEM',
    'Bénéficiaire D-CLIC, formation Développement Web',
    'CMR',
    'Excellente formation, alliant qualité pédagogique et pratique. Elle m''a offert des compétences clés en programmation web et ouvert de nouvelles opportunités professionnelles prometteuses. Cette expérience a renforcé ma confiance et m''a donné les bases solides pour poursuivre mon parcours dans le développement web.'
  ),
  (
    'PROJ_A16_2024',
    'Marie Danielle Pierre-Louis',
    'Bénéficiaire D-CLIC, formation Développement Web',
    'HTI',
    'Après ma participation à la formation sur la plateforme D-CLIC j''ai lancé mon entreprise, un journal numérique en ligne consacré aux femmes, intitulé "Journal des Femmes Inspirantes". Cette formation m''a permis d''acquérir des compétences essentielles en numérique qui m''ont permis de développer et gérer un média en ligne dédié à la mise en valeur des parcours inspirants des femmes.'
  ),
  (
    'PROJ_A17_2024',
    'M. TRUONG Duc Luong',
    'Directeur de VSEC Cybersecurity (Vietnam)',
    'VNM',
    'La MEF à Bucarest a constitué un tournant majeur dans le développement de VSEC en Europe, marqué par la signature de plusieurs accords clés qui renforcent sa position sur les marchés européens et mondiaux francophones.'
  ),
  (
    'PROJ_A18_2024',
    'Ambinintsoa Heritokilalaina (Lalaina)',
    'Négociatrice climatique, co-coordinatrice thématique transparence (groupe des PMA)',
    'MDG',
    'J''adresse mes reconnaissances les plus sincères à l''IFDD pour les formations sur les négociations climatiques. Grâce à ces différentes formations, j''ai pu avancer dans le processus. Dans ce sens, j''ai été choisie par le président du groupe des PMA pour être co-coordinatrice de la thématique « transparence ». Je suis fière de représenter les négociatrices francophones dans ce groupe.'
  ),
  (
    'PROJ_A19_2024',
    'Edith Nanette DIBA',
    'Porteuse de projet, bénéficiaire du PADTIE',
    'COG',
    'Grâce à l''accompagnement du Projet d''accélération des technologies et innovations environnementales (PADTIE) mis en place au Congo par l''OIF, notre projet a été restructuré. Aujourd''hui, notre projet ne se limite plus à un seul produit. Nous avons développé une approche intégrée, combinant énergie propre, réduction du gaspillage alimentaire et valorisation des ressources locales. Grâce à l''OIF, nous avons pu transformer une simple idée en une véritable solution écologique et innovante.'
  ),
  (
    'PROJ_A20_2024',
    'Ha Duc Manh',
    'Directeur de l''agence de voyage Amical Travel',
    'VNM',
    'Le secteur du tourisme durable ne manque pas de travail, il manque de main-d''œuvre. Chers étudiants, apprenez le français, nous vous assurons que vous aurez du travail.'
  ),
  (
    'PROJ_A20_2024',
    'Tam',
    'Étudiante en 3e année de l''option tourisme, Université de Hanoi',
    'VNM',
    'Ce qui me plaît dans le Salon de l''emploi, c''est de rencontrer des professionnels du secteur, d''échanger avec eux et, surtout, de décrocher un emploi à temps partiel.'
  )
ON CONFLICT DO NOTHING;
