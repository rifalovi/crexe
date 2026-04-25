-- CREXE 2024 — Programme Stratégique 1
-- La langue française au service des cultures et de l'éducation
-- Exercice 1er janvier – 31 décembre 2024
-- Généré le 2026-04-25 à partir du document CREX 2024_V2_18.04.2025.docx
-- Budget total PS1 engagé : 10 373 382 € — Taux d'exécution global : 97 %
-- 76 États et gouvernements concernés
-- 7 projets (Projets 1 à 7 — PROJ_A01 à PROJ_A07)
-- Note : PROJ_A01 comporte 3 volets (1a, 1b, 1c) agrégés en une seule fiche.

-- =============================================================================
-- SECTION 1 : PROJETS PS1
-- =============================================================================

-- Projet 1 — La langue française, langue internationale
-- Volets : 1a (diplomatie/RI), 1b (Observatoire), 1c (création culturelle)
-- Budget cumulé volets a+b+c : planifié 1 841 340 € / engagé 1 840 235 €
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A01_2024', 'PS1', 'PROJ_A01', 'brouillon',
  'La langue française, langue internationale',
  '8 initiatives diplomatiques de haut niveau pour hisser le français au cœur des espaces multilatéraux — un rayonnement mondial amplifié.',
  'Ce projet vise à renforcer l''usage et la visibilité du français comme langue de travail, d''analyse et de décision dans les espaces diplomatiques, multilatéraux et culturels. Il se déploie en trois volets : (1a) diplomatie et relations internationales avec 8 initiatives de haut niveau dans les enceintes onusiennes et diplomatiques, plus de 60 % des participants déclarant une amélioration significative de leur aisance à l''oral ; (1b) l''Observatoire de la langue française, outil de référence pour analyser les dynamiques linguistiques mondiales ; (1c) création culturelle, artistique et production de connaissance, avec 10 finalistes et 3 auteurs récompensés aux Prix des Cinq Continents et Ibn Khaldoun-Senghor, et 11 événements artistiques francophones organisés.',
  2024,
  1841340,
  1840235,
  94,
  76,
  ARRAY['langue française', 'diplomatie', 'multilinguisme', 'culture', 'Observatoire', 'rayonnement'],
  ARRAY['RPGV', 'GAF', 'ONU', 'UNESCO', 'multilinguisme', 'Prix des 5 continents', 'Ibn Khaldoun-Senghor'],
  '{
    "coeur":   { "valeur": "1 840 235 €", "label": "Budget engagé (3 volets)" },
    "niveau1": { "valeur": "8", "label": "Initiatives diplomatiques de haut niveau pour promouvoir le français", "type_preuve": "mesure" },
    "niveau2": { "valeur": "60 %+", "label": "Des participants déclarent une amélioration significative de l''aisance à l''oral", "type_preuve": "observation" },
    "niveau3": { "valeur": "3", "label": "Auteurs et traducteurs récompensés par des prix littéraires internationaux francophones", "type_preuve": "mesure" },
    "niveau4": { "label": "Rayonnement mondial du français", "description": "La langue française renforcée comme vecteur de coopération diplomatique, culturelle et intellectuelle internationale", "type_preuve": "institutionnel" }
  }''::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 2 — La langue française, langue d'enseignement et d'apprentissage
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A02_2024', 'PS1', 'PROJ_A02', 'brouillon',
  'La langue française, langue d''enseignement et d''apprentissage',
  '90 enseignants volontaires déployés dans 3 pays, 20 États accompagnés — la qualité du français à l''école comme levier de développement.',
  'Ce projet promeut et soutient un enseignement de et en langue française de qualité, pour favoriser l''émergence et le renforcement des compétences des apprenants dans l''espace francophone. En 2024, 90 enseignants volontaires étaient en poste dans trois pays partenaires (Ghana, Rwanda, Seychelles). Vingt États et gouvernements ont été accompagnés techniquement pour la mise en œuvre de leurs politiques linguistiques éducatives. À l''issue des formations, de nombreux enseignants ont progressé linguistiquement, avec des passages observés de niveau A2/B1 à B1/B2 selon le CECRL. Le projet couvre 20 pays d''Afrique, d''Asie et d''Europe.',
  2024,
  1580000,
  1552828,
  98,
  20,
  ARRAY['éducation', 'enseignement du français', 'formation enseignants', 'politiques linguistiques', 'qualité éducative'],
  ARRAY['enseignants volontaires', 'CECRL', 'Ghana', 'Rwanda', 'Seychelles', 'Djibouti', 'politiques linguistiques'],
  '{
    "coeur":   { "valeur": "1 552 828 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "90", "label": "Enseignants volontaires en poste dans 3 pays partenaires (Ghana, Rwanda, Seychelles)", "type_preuve": "mesure" },
    "niveau2": { "valeur": "20", "label": "États et gouvernements accompagnés techniquement pour leurs politiques linguistiques", "type_preuve": "mesure" },
    "niveau3": { "valeur": "A2→B2", "label": "Progression observée du niveau de français des enseignants formés (CECRL)", "type_preuve": "observation" },
    "niveau4": { "label": "Qualité éducative dans l''espace francophone", "description": "Des enseignants mieux formés pour garantir un enseignement en français de qualité dans les pays membres", "type_preuve": "institutionnel" }
  }''::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 3 — IFADEM (Initiative francophone pour la formation à distance des maîtres)
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A03_2024', 'PS1', 'PROJ_A03', 'brouillon',
  'Initiative francophone pour la formation à distance des maîtres (IFADEM)',
  '17 810 enseignants et directeurs d''école formés dans 10 pays — 98 % ont appliqué concrètement les apprentissages en classe.',
  'IFADEM a pour objectif de renforcer l''usage du français comme langue d''enseignement et d''apprentissage, en améliorant les compétences pédagogiques des enseignants du primaire et secondaire grâce à la formation à distance. En 2024, 17 810 enseignants et directeurs d''école ont été formés : 16 431 enseignants de l''élémentaire, 829 du secondaire et 550 chefs d''établissement dans 10 pays partenaires (Bénin, Burkina Faso, Côte d''Ivoire, Burundi, Cameroun, Comores, Congo RD, Gabon, Guinée, Haïti). 97 % des formés estiment que les contenus sont adaptés à leur rôle et 98 % déclarent avoir pu les mettre en pratique dans leurs classes.',
  2024,
  850000,
  842379,
  99,
  10,
  ARRAY['éducation', 'formation à distance', 'enseignants', 'FOAD', 'primaire', 'qualité éducative'],
  ARRAY['IFADEM', 'formation maîtres', 'Bénin', 'Burkina Faso', 'Haïti', 'Cameroun', 'e-learning'],
  '{
    "coeur":   { "valeur": "842 379 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "17 810", "label": "Enseignants et directeurs d''école formés dans 10 pays partenaires", "type_preuve": "mesure" },
    "niveau2": { "valeur": "98 %", "label": "Des formés déclarent avoir mis en pratique les compétences acquises en classe", "type_preuve": "observation" },
    "niveau3": { "valeur": "10", "label": "Pays partenaires couverts par le dispositif IFADEM en 2024", "type_preuve": "mesure" },
    "niveau4": { "label": "Qualité de l''enseignement en Afrique francophone", "description": "Des enseignants mieux outillés pour transmettre le français et favoriser la réussite scolaire", "type_preuve": "institutionnel" }
  }''::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 4 — ELAN (École et langues nationales en Afrique)
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A04_2024', 'PS1', 'PROJ_A04', 'brouillon',
  'École et langues nationales en Afrique (ELAN)',
  '2 834 acteurs éducatifs formés à l''enseignement bilingue dans 12 pays — l''apprentissage en langue maternelle comme socle du français.',
  'Le projet ELAN œuvre à améliorer la qualité des apprentissages en intégrant les langues nationales dans les systèmes éducatifs francophones. Son approche pédagogique bilingue (langue nationale + français) améliore les résultats scolaires et réduit les abandons. En 2024, 2 834 acteurs éducatifs ont été formés sur les approches liées à l''enseignement bilingue, incluant des enseignants, formatrices, formateurs et cadres institutionnels dans 12 pays d''Afrique subsaharienne. Un modèle de simulation financière pour la pérennisation de l''enseignement bilingue a été développé et partagé avec les États partenaires.',
  2024,
  830000,
  800023,
  99,
  12,
  ARRAY['éducation bilingue', 'langues nationales', 'apprentissage', 'Afrique subsaharienne', 'qualité éducative'],
  ARRAY['ELAN', 'bilingue', 'langues nationales', 'Burkina Faso', 'Mali', 'Niger', 'Togo', 'Sénégal'],
  '{
    "coeur":   { "valeur": "800 023 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "2 834", "label": "Acteurs éducatifs formés à l''enseignement bilingue (enseignants, formateurs, cadres)", "type_preuve": "mesure" },
    "niveau2": { "valeur": "12", "label": "Pays d''Afrique subsaharienne couverts par l''approche pédagogique bilingue ELAN", "type_preuve": "mesure" },
    "niveau3": { "valeur": "1", "label": "Modèle de simulation financière développé pour pérenniser l''enseignement bilingue", "type_preuve": "institutionnel" },
    "niveau4": { "label": "Accès à l''éducation de qualité en Afrique", "description": "L''enseignement dans les langues nationales améliore la compréhension, réduit l''échec scolaire et consolide l''apprentissage du français", "type_preuve": "observation" }
  }''::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 5 — Acquérir des savoirs, découvrir le monde (CLAC)
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A05_2024', 'PS1', 'PROJ_A05', 'brouillon',
  'Acquérir des savoirs, découvrir le monde (CLAC)',
  '178 acteurs culturels formés dans 5 pays — les Centres de lecture et d''animation culturelle, lieux de vie et de transmission du français.',
  'Le projet CLAC – Centres de lecture et d''animation culturelle est un dispositif phare de l''action culturelle de proximité de la Francophonie. Il favorise l''accès des populations, en particulier des jeunes et des femmes, à la lecture, à l''information et aux pratiques culturelles en français dans des pays où les ressources éducatives sont rares. En 2024, 178 acteurs ont été formés à la lecture publique et à l''animation culturelle dans 5 pays. Six actions de plaidoyer ont été menées pour appuyer la structuration nationale des politiques culturelles. Les CLAC accueillent une population majoritairement jeune (78 % ont moins de 35 ans) sur 13 pays de présence.',
  2024,
  1040000,
  1032619,
  99,
  13,
  ARRAY['culture', 'lecture publique', 'animation culturelle', 'accès à l''information', 'jeunesse', 'bibliothèques'],
  ARRAY['CLAC', 'lecture', 'culture francophone', 'jeunes', 'Bénin', 'Comores', 'Madagascar', 'Sénégal'],
  '{
    "coeur":   { "valeur": "1 032 619 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "178", "label": "Acteurs formés à la lecture publique et à l''animation culturelle dans 5 pays", "type_preuve": "mesure" },
    "niveau2": { "valeur": "78 %", "label": "Des fréquentants des CLAC ont moins de 35 ans — une jeunesse culturellement connectée", "type_preuve": "observation" },
    "niveau3": { "valeur": "6", "label": "Actions de plaidoyer menées pour structurer les politiques culturelles nationales", "type_preuve": "mesure" },
    "niveau4": { "label": "Accès à la culture et à la lecture en francophonie", "description": "Des espaces de lecture et d''expression culturelle accessibles aux populations dans 13 pays", "type_preuve": "institutionnel" }
  }''::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 6 — Industries culturelles et découvrabilité
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A06_2024', 'PS1', 'PROJ_A06', 'brouillon',
  'Industries culturelles et découvrabilité',
  '59 sociétés du Sud soutenues dans 20 États membres — la création culturelle francophone rayonne à l''ère du numérique.',
  'Le projet Industries culturelles et découvrabilité vise à promouvoir la diversité culturelle francophone dans un environnement numérique en pleine mutation. Il soutient la création, la diffusion et la découvrabilité des contenus culturels en français, notamment à travers le Fonds Image de la Francophonie et les Fonds audio-visuels. En 2024, 59 sociétés de pays du Sud ont été soutenues via le Fonds Image de la Francophonie (11 pour la production, 8 pour le développement, 4 pour la finition), touchant 20 États membres. 41 % des financements ont bénéficié à des structures dirigées par des femmes. Les bénéficiaires témoignent de transformations concrètes de leurs trajectoires professionnelles et artistiques.',
  2024,
  2363223,
  2301143,
  97,
  20,
  ARRAY['industries culturelles', 'cinéma', 'audiovisuel', 'découvrabilité', 'numérique', 'création artistique'],
  ARRAY['Fonds Image', 'cinéma francophone', 'audiovisuel', 'diversité culturelle', 'MASA', 'FESPACO', 'streaming'],
  '{
    "coeur":   { "valeur": "2 301 143 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "59", "label": "Sociétés de pays du Sud soutenues via le Fonds Image de la Francophonie dans 20 États", "type_preuve": "mesure" },
    "niveau2": { "valeur": "41 %", "label": "Des financements ont bénéficié à des structures dirigées par des femmes", "type_preuve": "mesure" },
    "niveau3": { "valeur": "20", "label": "États membres touchés par les projets audiovisuels et culturels soutenus", "type_preuve": "mesure" },
    "niveau4": { "label": "Diversité culturelle et créativité francophone", "description": "Une industrie culturelle francophone plus visible, compétitive et ancrée dans le numérique", "type_preuve": "institutionnel" }
  }''::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Projet 7 — Jeux de la Francophonie
INSERT INTO projets (
  id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  nombre_pays, thematiques, mots_cles, cercles_impact
)
VALUES (
  'PROJ_A07_2024', 'PS1', 'PROJ_A07', 'brouillon',
  'Jeux de la Francophonie',
  '16 pays participants au Championnat des Jeunes en Tennis de Table en Côte d''Ivoire — la Francophonie, espace de rencontre sportive et culturelle.',
  'Le projet Jeux de la Francophonie vise à faire de cet événement un espace de rencontre interculturelle, un outil de rayonnement du français et un levier stratégique pour l''insertion des jeunes talents francophones dans l''espace sportif et artistique international. En 2024, l''année de préparation des prochains Jeux (2025, Nice), 3 rencontres de haut niveau (conseil d''orientation et séminaires de réflexion) ont été organisées. Un Championnat des Jeunes de la Francophonie en Tennis de Table a été organisé en Côte d''Ivoire, rassemblant 16 pays. Le projet contribue à renforcer l''esprit francophone et la solidarité entre les jeunes athlètes et artistes de l''espace francophone.',
  2024,
  401050,
  381962,
  95,
  16,
  ARRAY['sport', 'culture', 'jeunesse', 'jeux', 'inclusion', 'échange interculturel'],
  ARRAY['Jeux de la Francophonie', 'Nice 2025', 'Tennis de Table', 'Côte d''Ivoire', 'athlètes francophones', 'CIJF'],
  '{
    "coeur":   { "valeur": "381 962 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "16", "label": "Pays représentés au Championnat des Jeunes de la Francophonie en Tennis de Table", "type_preuve": "mesure" },
    "niveau2": { "valeur": "3", "label": "Rencontres de haut niveau organisées pour préparer les Jeux de la Francophonie 2025", "type_preuve": "mesure" },
    "niveau3": { "valeur": "2025", "label": "Prochaine édition des Jeux de la Francophonie à Nice (préparation en cours)", "type_preuve": "institutionnel" },
    "niveau4": { "label": "Jeunesse francophone unie", "description": "Les Jeux de la Francophonie comme outil de cohésion, de rayonnement et d''insertion des jeunes dans l''espace sportif et culturel international", "type_preuve": "institutionnel" }
  }''::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  budget_modifie=EXCLUDED.budget_modifie, budget_engage=EXCLUDED.budget_engage,
  taux_execution=EXCLUDED.taux_execution, nombre_pays=EXCLUDED.nombre_pays,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;


-- =============================================================================
-- SECTION 2 : INDICATEURS PS1
-- =============================================================================

-- Indicateurs agrégés PS1 (données globales du programme)
INSERT INTO indicateurs (
  projet_id, libelle, valeur_realisee, unite, type_preuve, annee, source
) VALUES
  ('PROJ_A01_2024', 'Initiatives diplomatiques de haut niveau pour le rayonnement du français', '8', 'initiatives', 'mesure', 2024, 'CREX 2024, Tableau de bord PS1'),
  ('PROJ_A01_2024', 'Participation des formés améliorant leur aisance à l''oral en français', '60', '%', 'observation', 2024, 'CREX 2024, Projet 1a'),
  ('PROJ_A01_2024', 'Auteurs et traducteurs récompensés par des prix littéraires francophones internationaux', '3', 'lauréats', 'mesure', 2024, 'CREX 2024, Projet 1c'),
  ('PROJ_A02_2024', 'Enseignants volontaires en poste dans les pays partenaires', '90', 'enseignants', 'mesure', 2024, 'CREX 2024, Projet 2'),
  ('PROJ_A02_2024', 'États accompagnés techniquement pour leurs politiques linguistiques éducatives', '20', 'États', 'mesure', 2024, 'CREX 2024, Projet 2'),
  ('PROJ_A03_2024', 'Enseignants et directeurs d''école formés via IFADEM', '17810', 'personnes', 'mesure', 2024, 'CREX 2024, Projet 3'),
  ('PROJ_A03_2024', 'Formés déclarant avoir mis en pratique les compétences acquises', '98', '%', 'observation', 2024, 'CREX 2024, Projet 3'),
  ('PROJ_A04_2024', 'Acteurs éducatifs formés à l''enseignement bilingue (enseignants, formateurs, cadres)', '2834', 'acteurs', 'mesure', 2024, 'CREX 2024, Projet 4 ELAN'),
  ('PROJ_A05_2024', 'Acteurs formés à la lecture publique et à l''animation culturelle', '178', 'acteurs', 'mesure', 2024, 'CREX 2024, Projet 5 CLAC'),
  ('PROJ_A05_2024', 'Fréquentants des CLAC de moins de 35 ans', '78', '%', 'observation', 2024, 'CREX 2024, Projet 5 CLAC'),
  ('PROJ_A06_2024', 'Sociétés de pays du Sud soutenues via le Fonds Image de la Francophonie', '59', 'sociétés', 'mesure', 2024, 'CREX 2024, Projet 6'),
  ('PROJ_A06_2024', 'Financements bénéficiant à des structures dirigées par des femmes', '41', '%', 'mesure', 2024, 'CREX 2024, Projet 6'),
  ('PROJ_A07_2024', 'Pays représentés au Championnat des Jeunes de la Francophonie', '16', 'pays', 'mesure', 2024, 'CREX 2024, Projet 7')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- SECTION 3 : TÉMOIGNAGES PS1
-- =============================================================================

INSERT INTO temoignages (
  projet_id, auteur, role, texte, source_url, type_media
) VALUES
  (
    'PROJ_A01_2024',
    'Eric Chacour',
    'Prix des 5 continents de la Francophonie 2024',
    'C''est une formidable tape dans le dos, car il est remis par un jury prestigieux et il est attribué à un texte francophone parmi des auteurs qui viennent de partout dans le monde.',
    NULL,
    'citation'
  ),
  (
    'PROJ_A03_2024',
    'Justin HOVOZOUNKOU',
    'Conseiller Pédagogique, ministère des Enseignements Maternel et Primaires, Bénin',
    'Grâce à IFADEM, j''ai pu améliorer mes pratiques pédagogiques et mieux accompagner mes élèves dans l''apprentissage du français. Les contenus sont vraiment adaptés à notre réalité terrain.',
    NULL,
    'citation'
  ),
  (
    'PROJ_A04_2024',
    'M. Fausséni Dembélé',
    'Directeur de cabinet représentant du Ministère de l''Éducation, Mali',
    'L''enseignement bilingue représente une avancée majeure dans notre quête commune pour une éducation qui répond au besoin de nos enfants.',
    NULL,
    'citation'
  ),
  (
    'PROJ_A05_2024',
    'Responsable du CLAC',
    'Bénéficiaire du programme de solarisation des CLAC',
    'Avant la solarisation, le CLAC accueillait peu de lecteurs. En effet, le centre était mal éclairé et les fréquents délestages d''électricité limitaient encore plus les visites. Maintenant, le centre est plein même le soir !',
    NULL,
    'citation'
  ),
  (
    'PROJ_A07_2024',
    'Djenebou Dante',
    'Médaillée d''or, Athlétisme féminin 400m, Mali — Jeux de la Francophonie',
    'Il faut les vivre fort les Jeux de la Francophonie, c''est une chance !',
    NULL,
    'citation'
  )
ON CONFLICT DO NOTHING;
