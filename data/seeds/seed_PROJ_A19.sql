-- ─────────────────────────────────────────────────────────────────────────────
-- Seed PROJ_A19 — Soutien aux initiatives environnementales dans le bassin du Congo
-- PS3 · Source : CREX PS3_V2.docx
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO projets (id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  thematiques, mots_cles, cercles_impact)
VALUES (
  'PROJ_A19', 'PS3', 'PROJ_A19', 'publie',
  'Soutien aux initiatives environnementales dans le bassin du Congo',
  'Jeunes éco-innovateurs au service de la forêt tropicale',
  'Le projet 19 « Soutien aux initiatives environnementales dans le Bassin du Congo » accompagne les jeunes innovateurs dans le développement de solutions durables pour la préservation de ce poumon vert mondial. En 2025, 70 jeunes innovateurs (dont 30% de femmes) ont été accompagnés. L''Enquête Rapide Annuelle révèle un impact fort sur l''employabilité et la conscience environnementale des bénéficiaires.',
  2025, 1348805, 1346294, 100,
  ARRAY['environnement','foret','bassin_congo','innovation','jeunesse','biodiversite'],
  ARRAY['bassin du Congo','éco-innovation','forêt tropicale','jeunes','entrepreneuriat vert'],
  '{
    "coeur":   { "valeur": "1,35 M€", "label": "Budget engagé" },
    "niveau1": { "valeur": "70 innovateurs", "label": "Jeunes accompagnés", "description": "dont 30% de femmes · solutions durables bassin Congo", "type_preuve": "mesure" },
    "niveau2": { "label": "Projets éco-innovants déployés", "description": "Solutions durables pour la préservation forestière", "type_preuve": "observation" },
    "niveau3": { "label": "Communautés riveraines", "description": "Sensibilisation et co-bénéfices des forêts tropicales", "type_preuve": "observation" },
    "niveau4": { "label": "Bassin du Congo", "description": "2e poumon vert mondial préservé, engagement francophone", "type_preuve": "institutionnel" }
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, statut=EXCLUDED.statut, description=EXCLUDED.description,
  annee_exercice=EXCLUDED.annee_exercice, budget_modifie=EXCLUDED.budget_modifie,
  budget_engage=EXCLUDED.budget_engage, taux_execution=EXCLUDED.taux_execution,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Pays de couverture (pays du bassin du Congo francophones)
DELETE FROM pays_couverture WHERE projet_id = 'PROJ_A19';
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A19','COD'),('PROJ_A19','COG'),('PROJ_A19','CMR'),('PROJ_A19','CAF'),
  ('PROJ_A19','GAB'),('PROJ_A19','GNQ'),('PROJ_A19','BDI'),('PROJ_A19','RWA');

-- Indicateurs
DELETE FROM indicateurs WHERE projet_id = 'PROJ_A19';
INSERT INTO indicateurs (projet_id, libelle, valeur_numerique, valeur_pourcentage, unite, categorie, type_preuve, source, mise_en_avant, ordre) VALUES
  ('PROJ_A19','Jeunes innovateurs accompagnés',70,NULL,'jeunes','activites','mesure','Rapport P19 OIF 2025',true,1),
  ('PROJ_A19','Part de femmes parmi les innovateurs accompagnés',NULL,30,'%','demographie','mesure','Rapport P19 OIF 2025',true,2),
  ('PROJ_A19','Taux d''exécution budgétaire',NULL,100,'%','execution','mesure','CREXE 2025',true,3),
  ('PROJ_A19','Bénéficiaires ayant amélioré leur employabilité',NULL,NULL,'%','insertion_economique','mesure','Enquête ERA P19 2025',false,4);

-- Témoignages
DELETE FROM temoignages WHERE projet_id = 'PROJ_A19';
INSERT INTO temoignages (projet_id, citation, source, source_url, type_media, pays, mise_en_avant) VALUES
  ('PROJ_A19',
   'Duthie Chancel Mbombet est une jeune entrepreneuse gabonaise qui a fondé DutCh''Made, une marque de cosmétiques naturels à base de plantes du bassin du Congo. Accompagnée par le projet P19, elle a pu structurer son entreprise et accéder à de nouveaux marchés francophones.',
   'Rapport de suivi P19 OIF 2025',
   NULL,
   'rapport', 'GAB', true);

-- Partenariats
DELETE FROM partenariats WHERE projet_id = 'PROJ_A19';
INSERT INTO partenariats (projet_id, nom, type, description, ordre) VALUES
  ('PROJ_A19','OIF — Représentation pour l''Afrique centrale','institutionnel','Coordination régionale du programme dans le bassin du Congo',1);
