-- =====================================================================
-- SEED PROJ_A14 — La Francophonie avec Elles (PS3)
-- À exécuter dans le SQL Editor Supabase APRÈS files/schema_v3.sql
-- (qui a déjà créé la ligne PROJ_A14 en statut 'brouillon')
-- ---------------------------------------------------------------------
-- Ce script est idempotent : il peut être rejoué sans erreur.
-- =====================================================================

-- 1. COMPLÉTION DU PROJET PROJ_A14 ------------------------------------
update projets set
  nom               = 'La Francophonie avec Elles',
  accroche          = 'D''une femme à toute une société',
  description       = 'Le Fonds « La Francophonie avec Elles » constitue un dispositif visant à soutenir des initiatives concrètes de terrain portées par la société civile, afin de favoriser l''autonomisation économique et sociale des femmes vulnérables francophones, notamment à travers l''accès à la formation, à l''emploi et le développement d''activités génératrices de revenus.',
  annee_exercice    = 2025,
  budget_modifie    = 2915200,
  budget_engage     = 2872348,
  engagement_global = 4345000,
  taux_execution    = 99,
  nombre_pays       = 31,
  nombre_projets_deposes = 1561,
  nombre_projets_retenus = 54,
  thematiques = ARRAY[
    'egalite_femmes_hommes','entrepreneuriat','autonomisation_economique',
    'droits_humains','societe_civile'
  ],
  mots_cles = ARRAY[
    'AGR','formation','coopératives','insertion économique','droits','Kigali'
  ],
  cercles_impact = '{
    "coeur":   {"valeur": "4,3 M€", "label": "Investissement"},
    "niveau1": {"valeur": "9 475 femmes", "label": "Bénéficiaires directes", "description": "Revenus multipliés par 3", "type_preuve": "mesure"},
    "niveau2": {"valeur": "≈ 47 000 personnes", "label": "Familles transformées", "description": "Scolarisation, santé, alimentation", "type_preuve": "estimation", "hypothese": "5 personnes par foyer en moyenne"},
    "niveau3": {"label": "Communautés mobilisées", "description": "Collectivités, coopératives, réduction documentée des violences", "type_preuve": "observation"},
    "niveau4": {"label": "Espace francophone", "description": "Appel de Kigali, ODD 5, 31 pays engagés", "type_preuve": "institutionnel"}
  }'::jsonb
where id = 'PROJ_A14';

-- 2. PAYS DE COUVERTURE (31 pays francophones) ------------------------
insert into pays (code_iso3, nom_fr) values
  ('ARM', 'Arménie'), ('BEN', 'Bénin'), ('BGR', 'Bulgarie'),
  ('BFA', 'Burkina Faso'), ('BDI', 'Burundi'), ('CPV', 'Cabo Verde'),
  ('CMR', 'Cameroun'), ('COM', 'Comores'), ('COG', 'Congo'),
  ('CIV', 'Côte d''Ivoire'), ('DJI', 'Djibouti'), ('EGY', 'Égypte'),
  ('GHA', 'Ghana'), ('GIN', 'Guinée'), ('GNB', 'Guinée-Bissau'),
  ('HTI', 'Haïti'), ('LBN', 'Liban'), ('MDG', 'Madagascar'),
  ('MLI', 'Mali'), ('MAR', 'Maroc'), ('MUS', 'Maurice'),
  ('MRT', 'Mauritanie'), ('MDA', 'Moldova'), ('NER', 'Niger'),
  ('COD', 'République démocratique du Congo'), ('RWA', 'Rwanda'),
  ('STP', 'Sao Tomé-et-Principe'), ('SEN', 'Sénégal'),
  ('TCD', 'Tchad'), ('TGO', 'Togo'), ('TUN', 'Tunisie')
on conflict (code_iso3) do nothing;

insert into pays_couverture (projet_id, pays_code, annee)
select 'PROJ_A14', code, 2025 from unnest(ARRAY[
  'ARM','BEN','BGR','BFA','BDI','CPV','CMR','COM','COG','CIV',
  'DJI','EGY','GHA','GIN','GNB','HTI','LBN','MDG','MLI','MAR',
  'MUS','MRT','MDA','NER','COD','RWA','STP','SEN','TCD','TGO','TUN'
]) as t(code)
on conflict (projet_id, pays_code, annee) do nothing;

-- 3. INDICATEURS (18) -------------------------------------------------
-- Reset idempotent : on supprime d'abord les indicateurs existants
delete from indicateurs where projet_id = 'PROJ_A14';

insert into indicateurs (projet_id, libelle, valeur_numerique, valeur_pourcentage, unite, categorie, type_preuve, source, hypothese_calcul, mise_en_avant, ordre) values
('PROJ_A14', 'Femmes ayant obtenu un accès direct à une activité génératrice de revenus (AGR)', 9475, null, 'femmes', 'insertion_economique', 'mesure', 'Rapport PROJ_A14 OIF 2025', null, true, 1),
('PROJ_A14', 'Femmes ayant vu leurs capacités renforcées en droits et égalité', 9290, null, 'femmes', 'renforcement_capacites', 'mesure', 'Rapport PROJ_A14 OIF 2025', null, true, 2),
('PROJ_A14', 'Actions de renforcement des capacités réalisées', 1264, null, 'actions', 'activites', 'mesure', 'Rapport PROJ_A14 OIF 2025', null, true, 3),
('PROJ_A14', 'Bénéficiaires satisfaites ou très satisfaites', null, 87.4, '%', 'satisfaction', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, true, 4),
('PROJ_A14', 'Bénéficiaires disposant d''un acte d''état civil', null, 86.9, '%', 'droits', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, true, 5),
('PROJ_A14', 'Bénéficiaires ayant créé une activité professionnelle', null, 65.8, '%', 'insertion_economique', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, true, 6),
('PROJ_A14', 'Jeunes femmes (18-34 ans) parmi les répondantes', null, 65.8, '%', 'demographie', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 7),
('PROJ_A14', 'Compétences acquises en gestion d''AGR', null, 59.8, '%', 'renforcement_capacites', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 8),
('PROJ_A14', 'Bénéficiaires ayant amélioré leurs compétences', null, 58.6, '%', 'renforcement_capacites', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 9),
('PROJ_A14', 'Maîtrise de l''utilisation des réseaux sociaux', null, 53.3, '%', 'competences_numeriques', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 10),
('PROJ_A14', 'Compétences développées en gestion financière', null, 51.9, '%', 'renforcement_capacites', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 11),
('PROJ_A14', 'Meilleure organisation des activités', null, 49.9, '%', 'structuration', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 12),
('PROJ_A14', 'Compétences acquises en commercialisation digitale', null, 47.4, '%', 'commercialisation', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 13),
('PROJ_A14', 'Bénéficiaires devenues autonomes économiquement', null, 45.6, '%', 'autonomie', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 14),
('PROJ_A14', 'Augmentation des revenus déclarée', null, 44.3, '%', 'effet_revenus', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 15),
('PROJ_A14', 'Formation dans le domaine des TIC', null, 34.5, '%', 'competences_avenir', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 16),
('PROJ_A14', 'Familles transformées (bénéficiaires étendues)', 47000, null, 'personnes', 'rayonnement', 'estimation', 'Estimation CREXE', '9475 bénéficiaires × 5 personnes par foyer (moyenne des pays d''intervention)', false, 17),
('PROJ_A14', 'Multiplication moyenne des revenus des bénéficiaires', 3, null, 'x', 'effet_revenus', 'mesure', 'Rapport PROJ_A14 OIF 2025', null, true, 18);

-- 4. TÉMOIGNAGES (5) --------------------------------------------------
delete from temoignages where projet_id = 'PROJ_A14';

insert into temoignages (projet_id, citation, source, source_url, type_media, pays, mise_en_avant) values
('PROJ_A14', 'À Madagascar, la mécanique automobile était une activité encore réservée aux hommes. Aujourd''hui, des femmes formées et équipées par le Fonds exercent ce métier et forment à leur tour d''autres femmes.',
 'Reportage RFI Afrique, 8 mars 2025',
 'https://www.rfi.fr/fr/afrique/20250308-madagascar-la-mécanique-automobile-une-activité-encore-réservée-aux-hommes-et-pourtant',
 'article', 'MDG', true),
('PROJ_A14', 'Au Rwanda, des collectivités territoriales mettent désormais des terres cultivables à disposition des coopératives de femmes bénéficiaires, illustrant un ancrage institutionnel durable des initiatives.',
 'Rapport de mission OIF au Bénin, 30 novembre — 5 décembre 2025',
 null, 'rapport', 'RWA', true),
('PROJ_A14', 'Les revenus des femmes accompagnées ont été, en moyenne, multipliés par trois. Elles gagnent en autonomie dans la gestion de leurs finances, de leurs activités et de leurs choix de vie.',
 'Synthèse de l''enquête de satisfaction bénéficiaires 2025',
 null, 'rapport', null, true),
('PROJ_A14', 'Reportage vidéo — parcours de bénéficiaires du Fonds La Francophonie avec Elles.',
 'Chaîne YouTube OIF',
 'https://www.youtube.com/watch?v=bTnxE9-4XvU',
 'video', null, false),
('PROJ_A14', 'Reportage vidéo — témoignages de femmes autonomisées par le Fonds.',
 'Chaîne YouTube OIF',
 'https://www.youtube.com/watch?v=g2fuGPv9sNI',
 'video', null, false);

-- 5. PARTENARIATS (2) -------------------------------------------------
delete from partenariats where projet_id = 'PROJ_A14';

insert into partenariats (projet_id, nom, acronyme, type, description, ordre) values
('PROJ_A14', 'Développement international Desjardins', 'DID', 'technique',
 'Accompagnement du renforcement du dispositif et développement de la culture de l''épargne chez les bénéficiaires.', 1),
('PROJ_A14', 'ONU Femmes Haïti', null, 'institutionnel',
 'Complémentarité opérationnelle et institutionnelle en contexte de crise.', 2);

-- 6. ÉVÉNEMENTS MARQUANTS (3) ----------------------------------------
delete from evenements where projet_id = 'PROJ_A14';

insert into evenements (projet_id, titre, description, date_evenement, type, ordre) values
('PROJ_A14', '6ᵉ Mission économique de la Francophonie au Bénin',
 '7 femmes bénéficiaires du Fonds ont pris part à la Mission économique : Coopérative Villageoise des Transformatrices de Soja, Coopérative Gbèwèsso, EFOI (Maurice, Seychelles), Fondation Mablé (Togo), KOAM Cosmetics (Bénin).',
 '2025-06-17', 'mission', 1),
('PROJ_A14', 'Conférence ministérielle de la Francophonie — Kigali',
 'Livret sur les 30 ans d''engagements de la Francophonie en matière d''égalité femmes-hommes. Contribution active à l''Appel de Kigali.',
 '2025-11-01', 'conference', 2),
('PROJ_A14', 'Mission au Bénin de l''Administratrice de l''OIF',
 'Mission conduite par Mme Caroline St-Hilaire avec 11 femmes du secteur privé de 6 pays francophones : conclusion de deux partenariats techniques.',
 '2025-12-05', 'mission', 3);

-- 7. PUBLICATION DU PROJET -------------------------------------------
update projets
   set statut = 'publie',
       date_publication = coalesce(date_publication, now())
 where id = 'PROJ_A14';

-- 8. VÉRIFICATION FINALE ---------------------------------------------
select
  (select statut from projets where id = 'PROJ_A14')                  as statut,
  (select count(*) from indicateurs   where projet_id = 'PROJ_A14')    as indicateurs,
  (select count(*) from temoignages   where projet_id = 'PROJ_A14')    as temoignages,
  (select count(*) from pays_couverture where projet_id = 'PROJ_A14')  as pays,
  (select count(*) from partenariats  where projet_id = 'PROJ_A14')    as partenariats,
  (select count(*) from evenements    where projet_id = 'PROJ_A14')    as evenements;
