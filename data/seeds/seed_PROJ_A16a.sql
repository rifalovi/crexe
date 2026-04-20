-- ─────────────────────────────────────────────────────────────────────────────
-- Seed PROJ_A16a — D-CLIC : Formez-vous au numérique
-- PS3 · Source : CREX PS3_V2.docx
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO projets (id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution, nombre_pays,
  thematiques, mots_cles, cercles_impact)
VALUES (
  'PROJ_A16a', 'PS3', 'PROJ_A16a', 'publie',
  'D-CLIC : Formez-vous au numérique',
  'Employabilité numérique des jeunes francophones',
  'Le projet D-CLIC : « Formez-vous au numérique » a pour objectif de renforcer les compétences numériques et l''employabilité des jeunes francophones de 18 à 35 ans. En 2025, plus de 15 000 jeunes ont été formés en ligne via la plateforme D-CLIC dans des domaines allant du développement web au marketing numérique, en passant par la cybersécurité et la fibre optique. Des outils nationaux d''insertion (Inserjeune) ont été déployés à Madagascar, aux Comores et au Rwanda.',
  2025, 1502575, 1496810, 99, 16,
  ARRAY['numerique','formation_professionnelle','jeunesse','emploi','entrepreneuriat'],
  ARRAY['D-CLIC','Inserjeune','compétences numériques','EFTP','formation en ligne','VivaTech'],
  '{
    "coeur":   { "valeur": "1,5 M€", "label": "Budget engagé" },
    "niveau1": { "valeur": "15 000+ jeunes", "label": "Formés en ligne D-CLIC", "description": "Compétences numériques certifiées", "type_preuve": "mesure" },
    "niveau2": { "valeur": "16 pays", "label": "Couverts par le programme", "description": "Bénin, Cameroun, Comores, Congo, Gabon, Madagascar, Mauritanie, RDC, Rwanda, Sénégal, Tchad, Togo...", "type_preuve": "mesure" },
    "niveau3": { "label": "Systèmes nationaux renforcés", "description": "Inserjeune déployé, stratégies de numérisation EFTP", "type_preuve": "observation" },
    "niveau4": { "label": "Espace francophone", "description": "Transformation numérique de la formation professionnelle", "type_preuve": "institutionnel" }
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, statut=EXCLUDED.statut, description=EXCLUDED.description,
  annee_exercice=EXCLUDED.annee_exercice, budget_modifie=EXCLUDED.budget_modifie,
  budget_engage=EXCLUDED.budget_engage, taux_execution=EXCLUDED.taux_execution,
  nombre_pays=EXCLUDED.nombre_pays, thematiques=EXCLUDED.thematiques,
  mots_cles=EXCLUDED.mots_cles, cercles_impact=EXCLUDED.cercles_impact;

-- Pays de couverture D-CLIC
DELETE FROM pays_couverture WHERE projet_id = 'PROJ_A16a';
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A16a','BEN'),('PROJ_A16a','CMR'),('PROJ_A16a','COM'),('PROJ_A16a','COG'),
  ('PROJ_A16a','GAB'),('PROJ_A16a','MDG'),('PROJ_A16a','MRT'),('PROJ_A16a','COD'),
  ('PROJ_A16a','RWA'),('PROJ_A16a','SEN'),('PROJ_A16a','TCD'),('PROJ_A16a','TGO'),
  ('PROJ_A16a','MAR'),('PROJ_A16a','TUN'),('PROJ_A16a','CIV'),('PROJ_A16a','HTI');

-- Indicateurs
DELETE FROM indicateurs WHERE projet_id = 'PROJ_A16a';
INSERT INTO indicateurs (projet_id, libelle, valeur_numerique, valeur_pourcentage, unite, categorie, type_preuve, source, mise_en_avant, ordre) VALUES
  ('PROJ_A16a','Jeunes formés en ligne via la plateforme D-CLIC',15000,NULL,'jeunes','formation','mesure','Rapport D-CLIC OIF 2025',true,1),
  ('PROJ_A16a','Centres de formation partenaires actifs',17,NULL,'centres','partenariats','mesure','Rapport D-CLIC OIF 2025',true,2),
  ('PROJ_A16a','Pays bénéficiaires du programme',16,NULL,'pays','couverture','mesure','Rapport D-CLIC OIF 2025',true,3),
  ('PROJ_A16a','Outils nationaux Inserjeune déployés',3,NULL,'pays','systemes','mesure','Rapport D-CLIC OIF 2025',true,4),
  ('PROJ_A16a','Bénéficiaires ayant trouvé un emploi ou créé une activité',NULL,68,'%','insertion_economique','mesure','Enquête ERA P16a 2025',false,5),
  ('PROJ_A16a','Bénéficiaires satisfaits ou très satisfaits',NULL,85,'%','satisfaction','mesure','Enquête ERA P16a 2025',false,6),
  ('PROJ_A16a','Stratégies nationales de numérisation EFTP élaborées',4,NULL,'stratégies','politique_publique','mesure','Rapport D-CLIC OIF 2025',false,7);

-- Témoignages
DELETE FROM temoignages WHERE projet_id = 'PROJ_A16a';
INSERT INTO temoignages (projet_id, citation, source, source_url, type_media, pays, mise_en_avant) VALUES
  ('PROJ_A16a',
   'Khadijetou Mohamedou (Mauritanie), bénéficiaire de la formation D-CLIC en fibre optique, a trouvé un emploi dans son domaine trois mois après la fin de sa formation.',
   'Rapport de suivi D-CLIC OIF 2025',
   NULL,
   'rapport', 'MRT', true),
  ('PROJ_A16a',
   'Grâce à la formation D-CLIC en marketing numérique, j''ai pu lancer ma propre boutique en ligne et générer mes premiers revenus en moins de deux mois.',
   'Témoignage bénéficiaire — Enquête ERA P16a 2025',
   NULL,
   'rapport', 'SEN', true);

-- Partenariats
DELETE FROM partenariats WHERE projet_id = 'PROJ_A16a';
INSERT INTO partenariats (projet_id, nom, type, description, ordre) VALUES
  ('PROJ_A16a','Ministères EFTP et Emploi (16 pays)','institutionnel','Co-déploiement des outils Inserjeune et stratégies numériques',1),
  ('PROJ_A16a','Rwanda TVET Board','technique','Déploiement Inserjeune Rwanda — portail des carrières EFTP',2),
  ('PROJ_A16a','Orange Solidarité Madagascar (AUF)','technique','Orange Digital Center — formation couture numérique, IoT, énergie solaire',3),
  ('PROJ_A16a','Union Africaine','institutionnel','Co-organisation session numérique African Union Summit',4);

-- Événements
DELETE FROM evenements WHERE projet_id = 'PROJ_A16a';
INSERT INTO evenements (projet_id, titre, description, date_evenement, type, ordre) VALUES
  ('PROJ_A16a','Salon VivaTech 2025','Présence OIF au 9e salon VivaTech — showcase des innovations D-CLIC.','2025-06-11','conference',1),
  ('PROJ_A16a','eLearning Africa 2025','Participation à la conférence internationale sur le numérique éducatif.','2025-05-14','conference',2),
  ('PROJ_A16a','Lancement Inserjeune Madagascar','Atelier d''implantation de l''outil national de suivi de l''insertion.','2025-10-01','mission',3),
  ('PROJ_A16a','Atelier politique IA dans l''EFTP — Togo','Lancement du processus d''élaboration de la politique d''utilisation de l''IA.','2025-11-15','conference',4);
