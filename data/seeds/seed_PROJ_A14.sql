-- ─────────────────────────────────────────────────────────────────────────────
-- Seed PROJ_A14 — La Francophonie avec Elles
-- À exécuter dans Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Mise à jour du projet principal
UPDATE projets SET
  ps_id              = 'PS3',
  code_officiel      = 'PROJ_A14',
  statut             = 'publie',
  nom                = 'La Francophonie avec Elles',
  accroche           = 'D''une femme à toute une société',
  description        = 'Le Fonds « La Francophonie avec Elles » constitue un dispositif visant à soutenir des initiatives concrètes de terrain portées par la société civile, afin de favoriser l''autonomisation économique et sociale des femmes vulnérables francophones, notamment à travers l''accès à la formation, à l''emploi et le développement d''activités génératrices de revenus.',
  annee_exercice     = 2025,
  budget_modifie     = 2915200,
  budget_engage      = 2872348,
  engagement_global  = 4345000,
  taux_execution     = 99,
  nombre_pays        = 31,
  nombre_projets_deposes = 1561,
  nombre_projets_retenus = 54,
  thematiques        = ARRAY['egalite_femmes_hommes','entrepreneuriat','autonomisation_economique','droits_humains','societe_civile'],
  mots_cles          = ARRAY['AGR','formation','coopératives','insertion économique','droits','Kigali'],
  cercles_impact     = '{
    "coeur":   { "valeur": "4,3 M€", "label": "Investissement" },
    "niveau1": { "valeur": "9 475 femmes", "label": "Bénéficiaires directes", "description": "Revenus multipliés par 3", "type_preuve": "mesure" },
    "niveau2": { "valeur": "≈ 47 000 personnes", "label": "Familles transformées", "description": "Scolarisation, santé, alimentation", "type_preuve": "estimation", "hypothese": "5 personnes par foyer en moyenne" },
    "niveau3": { "label": "Communautés mobilisées", "description": "Collectivités, coopératives, réduction documentée des violences", "type_preuve": "observation" },
    "niveau4": { "label": "Espace francophone", "description": "Appel de Kigali, ODD 5, 31 pays engagés", "type_preuve": "institutionnel" }
  }'::jsonb
WHERE id = 'PROJ_A14';

-- 2. Pays de couverture (31 pays)
DELETE FROM pays_couverture WHERE projet_id = 'PROJ_A14';
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A14','ARM'),('PROJ_A14','BEN'),('PROJ_A14','BGR'),('PROJ_A14','BFA'),
  ('PROJ_A14','BDI'),('PROJ_A14','CPV'),('PROJ_A14','CMR'),('PROJ_A14','COM'),
  ('PROJ_A14','COG'),('PROJ_A14','CIV'),('PROJ_A14','DJI'),('PROJ_A14','EGY'),
  ('PROJ_A14','GHA'),('PROJ_A14','GIN'),('PROJ_A14','GNB'),('PROJ_A14','HTI'),
  ('PROJ_A14','LBN'),('PROJ_A14','MDG'),('PROJ_A14','MLI'),('PROJ_A14','MAR'),
  ('PROJ_A14','MUS'),('PROJ_A14','MRT'),('PROJ_A14','MDA'),('PROJ_A14','NER'),
  ('PROJ_A14','COD'),('PROJ_A14','RWA'),('PROJ_A14','STP'),('PROJ_A14','SEN'),
  ('PROJ_A14','TCD'),('PROJ_A14','TGO'),('PROJ_A14','TUN');

-- 3. Indicateurs
DELETE FROM indicateurs WHERE projet_id = 'PROJ_A14';
INSERT INTO indicateurs (projet_id, libelle, valeur_numerique, valeur_pourcentage, unite, categorie, type_preuve, source, hypothese_calcul, mise_en_avant, ordre) VALUES
  ('PROJ_A14','Femmes ayant obtenu un accès direct à une activité génératrice de revenus (AGR)',9475,NULL,'femmes','insertion_economique','mesure','Rapport P14 OIF 2025',NULL,true,1),
  ('PROJ_A14','Femmes ayant vu leurs capacités renforcées en droits et égalité',9290,NULL,'femmes','renforcement_capacites','mesure','Rapport P14 OIF 2025',NULL,true,2),
  ('PROJ_A14','Actions de renforcement des capacités réalisées',1264,NULL,'actions','activites','mesure','Rapport P14 OIF 2025',NULL,true,3),
  ('PROJ_A14','Bénéficiaires satisfaites ou très satisfaites',NULL,87.4,'%','satisfaction','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,true,4),
  ('PROJ_A14','Bénéficiaires disposant d''un acte d''état civil',NULL,86.9,'%','droits','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,true,5),
  ('PROJ_A14','Bénéficiaires ayant créé une activité professionnelle',NULL,65.8,'%','insertion_economique','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,true,6),
  ('PROJ_A14','Jeunes femmes (18-34 ans) parmi les répondantes',NULL,65.8,'%','demographie','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,false,7),
  ('PROJ_A14','Compétences acquises en gestion d''AGR',NULL,59.8,'%','renforcement_capacites','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,false,8),
  ('PROJ_A14','Bénéficiaires ayant amélioré leurs compétences',NULL,58.6,'%','renforcement_capacites','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,false,9),
  ('PROJ_A14','Maîtrise de l''utilisation des réseaux sociaux',NULL,53.3,'%','competences_numeriques','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,false,10),
  ('PROJ_A14','Compétences développées en gestion financière',NULL,51.9,'%','renforcement_capacites','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,false,11),
  ('PROJ_A14','Meilleure organisation des activités',NULL,49.9,'%','structuration','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,false,12),
  ('PROJ_A14','Compétences acquises en commercialisation digitale',NULL,47.4,'%','commercialisation','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,false,13),
  ('PROJ_A14','Bénéficiaires devenues autonomes économiquement',NULL,45.6,'%','autonomie','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,false,14),
  ('PROJ_A14','Augmentation des revenus déclarée',NULL,44.3,'%','effet_revenus','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,false,15),
  ('PROJ_A14','Formation dans le domaine des TIC',NULL,34.5,'%','competences_avenir','mesure','Enquête de satisfaction bénéficiaires 2025',NULL,false,16),
  ('PROJ_A14','Familles transformées (bénéficiaires étendues)',47000,NULL,'personnes','rayonnement','estimation','Estimation CREXE','9475 bénéficiaires × 5 personnes par foyer (moyenne des pays d''intervention)',false,17),
  ('PROJ_A14','Multiplication moyenne des revenus des bénéficiaires',3,NULL,'x','effet_revenus','mesure','Rapport P14 OIF 2025',NULL,true,18);

-- 4. Témoignages
DELETE FROM temoignages WHERE projet_id = 'PROJ_A14';
INSERT INTO temoignages (projet_id, citation, source, source_url, type_media, pays, mise_en_avant) VALUES
  ('PROJ_A14','À Madagascar, la mécanique automobile était une activité encore réservée aux hommes. Aujourd''hui, des femmes formées et équipées par le Fonds exercent ce métier et forment à leur tour d''autres femmes.','Reportage RFI Afrique, 8 mars 2025','https://www.rfi.fr/fr/afrique/20250308-madagascar-la-mécanique-automobile-une-activité-encore-réservée-aux-hommes-et-pourtant','article','MDG',true),
  ('PROJ_A14','Au Rwanda, des collectivités territoriales mettent désormais des terres cultivables à disposition des coopératives de femmes bénéficiaires, illustrant un ancrage institutionnel durable des initiatives.','Rapport de mission OIF au Bénin, 30 novembre — 5 décembre 2025',NULL,'rapport','RWA',true),
  ('PROJ_A14','Les revenus des femmes accompagnées ont été, en moyenne, multipliés par trois. Elles gagnent en autonomie dans la gestion de leurs finances, de leurs activités et de leurs choix de vie.','Synthèse de l''enquête de satisfaction bénéficiaires 2025',NULL,'rapport',NULL,true),
  ('PROJ_A14','Reportage vidéo — parcours de bénéficiaires du Fonds La Francophonie avec Elles.','Chaîne YouTube OIF','https://www.youtube.com/watch?v=bTnxE9-4XvU','video',NULL,false),
  ('PROJ_A14','Reportage vidéo — témoignages de femmes autonomisées par le Fonds.','Chaîne YouTube OIF','https://www.youtube.com/watch?v=g2fuGPv9sNI','video',NULL,false);

-- 5. Partenariats
DELETE FROM partenariats WHERE projet_id = 'PROJ_A14';
INSERT INTO partenariats (projet_id, nom, type, description, ordre) VALUES
  ('PROJ_A14','Développement international Desjardins (DID)','technique','Accompagnement du renforcement du dispositif et développement de la culture de l''épargne chez les bénéficiaires.',1),
  ('PROJ_A14','ONU Femmes Haïti','institutionnel','Complémentarité opérationnelle et institutionnelle en contexte de crise.',2);

-- 6. Événements
DELETE FROM evenements WHERE projet_id = 'PROJ_A14';
INSERT INTO evenements (projet_id, titre, description, date_evenement, type, ordre) VALUES
  ('PROJ_A14','6ᵉ Mission économique de la Francophonie au Bénin','7 femmes bénéficiaires du Fonds ont pris part à la Mission économique : Coopérative Villageoise des Transformatrices de Soja, Coopérative Gbèwèsso, EFOI (Maurice, Seychelles), Fondation Mablé (Togo), KOAM Cosmetics (Bénin).','2025-06-17','mission',1),
  ('PROJ_A14','Conférence ministérielle de la Francophonie — Kigali','Livret sur les 30 ans d''engagements de la Francophonie en matière d''égalité femmes-hommes. Contribution active à l''Appel de Kigali.','2025-11-01','conference',2),
  ('PROJ_A14','Mission au Bénin de l''Administratrice de l''OIF','Mission conduite par Mme Caroline St-Hilaire avec 11 femmes du secteur privé de 6 pays francophones : conclusion de deux partenariats techniques.','2025-12-05','mission',3);
