-- =====================================================================
-- SEED P14 — La Francophonie avec Elles
-- À exécuter dans le SQL Editor Supabase après le schema.sql
-- =====================================================================

-- 1. PROJET P14
insert into projets (
  id, ps_id, nom, accroche, description, annee_exercice,
  budget_modifie, budget_engage, engagement_global, taux_execution,
  nombre_pays, nombre_projets_deposes, nombre_projets_retenus,
  thematiques, mots_cles, cercles_impact
) values (
  'P14', 'PS3',
  'La Francophonie avec Elles',
  'D''une femme à toute une société',
  'Le Fonds « La Francophonie avec Elles » constitue un dispositif visant à soutenir des initiatives concrètes de terrain portées par la société civile, afin de favoriser l''autonomisation économique et sociale des femmes vulnérables francophones, notamment à travers l''accès à la formation, à l''emploi et le développement d''activités génératrices de revenus.',
  2025,
  2915200, 2872348, 4345000, 99,
  31, 1561, 54,
  ARRAY['egalite_femmes_hommes','entrepreneuriat','autonomisation_economique','droits_humains','societe_civile'],
  ARRAY['AGR','formation','coopératives','insertion économique','droits','Kigali'],
  '{
    "coeur":   {"valeur": "4,3 M€", "label": "Investissement"},
    "niveau1": {"valeur": "9 475 femmes", "label": "Bénéficiaires directes", "description": "Revenus multipliés par 3", "type_preuve": "mesure"},
    "niveau2": {"valeur": "≈ 47 000 personnes", "label": "Familles transformées", "description": "Scolarisation, santé, alimentation", "type_preuve": "estimation", "hypothese": "5 personnes par foyer en moyenne"},
    "niveau3": {"label": "Communautés mobilisées", "description": "Collectivités, coopératives, réduction documentée des violences", "type_preuve": "observation"},
    "niveau4": {"label": "Espace francophone", "description": "Appel de Kigali, ODD 5, 31 pays engagés", "type_preuve": "institutionnel"}
  }'::jsonb
) on conflict (id) do nothing;

-- 2. PAYS DE COUVERTURE (31 pays)
-- D'abord insérer les pays dans la table pays (si absents)
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

-- Lier les pays au projet P14
insert into pays_couverture (projet_id, pays_code, annee) 
select 'P14', code, 2025 from unnest(ARRAY[
  'ARM','BEN','BGR','BFA','BDI','CPV','CMR','COM','COG','CIV',
  'DJI','EGY','GHA','GIN','GNB','HTI','LBN','MDG','MLI','MAR',
  'MUS','MRT','MDA','NER','COD','RWA','STP','SEN','TCD','TGO','TUN'
]) as t(code)
on conflict (projet_id, pays_code, annee) do nothing;

-- 3. INDICATEURS (18 indicateurs)
insert into indicateurs (projet_id, libelle, valeur_numerique, valeur_pourcentage, unite, categorie, type_preuve, source, hypothese_calcul, mise_en_avant, ordre) values
('P14', 'Femmes ayant obtenu un accès direct à une activité génératrice de revenus (AGR)', 9475, null, 'femmes', 'insertion_economique', 'mesure', 'Rapport P14 OIF 2025', null, true, 1),
('P14', 'Femmes ayant vu leurs capacités renforcées en droits et égalité', 9290, null, 'femmes', 'renforcement_capacites', 'mesure', 'Rapport P14 OIF 2025', null, true, 2),
('P14', 'Actions de renforcement des capacités réalisées', 1264, null, 'actions', 'activites', 'mesure', 'Rapport P14 OIF 2025', null, true, 3),
('P14', 'Bénéficiaires satisfaites ou très satisfaites', null, 87.4, '%', 'satisfaction', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, true, 4),
('P14', 'Bénéficiaires disposant d''un acte d''état civil', null, 86.9, '%', 'droits', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, true, 5),
('P14', 'Bénéficiaires ayant créé une activité professionnelle', null, 65.8, '%', 'insertion_economique', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, true, 6),
('P14', 'Jeunes femmes (18-34 ans) parmi les répondantes', null, 65.8, '%', 'demographie', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 7),
('P14', 'Compétences acquises en gestion d''AGR', null, 59.8, '%', 'renforcement_capacites', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 8),
('P14', 'Bénéficiaires ayant amélioré leurs compétences', null, 58.6, '%', 'renforcement_capacites', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 9),
('P14', 'Maîtrise de l''utilisation des réseaux sociaux', null, 53.3, '%', 'competences_numeriques', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 10),
('P14', 'Compétences développées en gestion financière', null, 51.9, '%', 'renforcement_capacites', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 11),
('P14', 'Meilleure organisation des activités', null, 49.9, '%', 'structuration', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 12),
('P14', 'Compétences acquises en commercialisation digitale', null, 47.4, '%', 'commercialisation', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 13),
('P14', 'Bénéficiaires devenues autonomes économiquement', null, 45.6, '%', 'autonomie', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 14),
('P14', 'Augmentation des revenus déclarée', null, 44.3, '%', 'effet_revenus', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 15),
('P14', 'Formation dans le domaine des TIC', null, 34.5, '%', 'competences_avenir', 'mesure', 'Enquête de satisfaction bénéficiaires 2025', null, false, 16),
('P14', 'Familles transformées (bénéficiaires étendues)', 47000, null, 'personnes', 'rayonnement', 'estimation', 'Estimation CREXE', '9475 bénéficiaires × 5 personnes par foyer (moyenne des pays d''intervention)', false, 17),
('P14', 'Multiplication moyenne des revenus des bénéficiaires', 3, null, 'x', 'effet_revenus', 'mesure', 'Rapport P14 OIF 2025', null, true, 18);

-- 4. TÉMOIGNAGES (5 témoignages)
insert into temoignages (projet_id, citation, source, source_url, type_media, pays, mise_en_avant) values
('P14', 'À Madagascar, la mécanique automobile était une activité encore réservée aux hommes. Aujourd''hui, des femmes formées et équipées par le Fonds exercent ce métier et forment à leur tour d''autres femmes.', 'Reportage RFI Afrique, 8 mars 2025', 'https://www.rfi.fr/fr/afrique/20250308-madagascar-la-mécanique-automobile-une-activité-encore-réservée-aux-hommes-et-pourtant', 'article', 'MDG', true),
('P14', 'Au Rwanda, des collectivités territoriales mettent désormais des terres cultivables à disposition des coopératives de femmes bénéficiaires, illustrant un ancrage institutionnel durable des initiatives.', 'Rapport de mission OIF au Bénin, 30 novembre — 5 décembre 2025', null, 'rapport', 'RWA', true),
('P14', 'Les revenus des femmes accompagnées ont été, en moyenne, multipliés par trois. Elles gagnent en autonomie dans la gestion de leurs finances, de leurs activités et de leurs choix de vie.', 'Synthèse de l''enquête de satisfaction bénéficiaires 2025', null, 'rapport', null, true),
('P14', 'Reportage vidéo — parcours de bénéficiaires du Fonds La Francophonie avec Elles.', 'Chaîne YouTube OIF', 'https://www.youtube.com/watch?v=bTnxE9-4XvU', 'video', null, false),
('P14', 'Reportage vidéo — témoignages de femmes autonomisées par le Fonds.', 'Chaîne YouTube OIF', 'https://www.youtube.com/watch?v=g2fuGPv9sNI', 'video', null, false);

-- 5. VÉRIFICATION FINALE
select 
  (select count(*) from projets where id = 'P14') as projets,
  (select count(*) from indicateurs where projet_id = 'P14') as indicateurs,
  (select count(*) from temoignages where projet_id = 'P14') as temoignages,
  (select count(*) from pays_couverture where projet_id = 'P14') as pays;
