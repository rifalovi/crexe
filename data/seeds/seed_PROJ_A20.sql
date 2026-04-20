-- ─────────────────────────────────────────────────────────────────────────────
-- Seed PROJ_A20 — Promotion du tourisme durable
-- PS3 · Source : CREX PS3_V2.docx
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO projets (id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  thematiques, mots_cles, cercles_impact)
VALUES (
  'PROJ_A20', 'PS3', 'PROJ_A20', 'publie',
  'Promotion du tourisme durable',
  'Former les professionnels du tourisme pour un avenir durable et francophone',
  'Le projet « Promotion d''un tourisme durable » vise à faire du tourisme durable un levier de développement économique inclusif dans l''espace francophone. En 2025, 8 centres de formation professionnelle ont été accompagnés. Le projet a permis l''insertion et la création d''emplois et de stages pour 934 jeunes diplômés, grâce notamment au déploiement du projet Destination Eco-Talent au Cambodge.',
  2025, 1235840, 1234612, 99,
  ARRAY['tourisme','formation_professionnelle','developpement_durable','emploi','patrimoine'],
  ARRAY['tourisme durable','Destination Eco-Talent','Cambodge','Vietnam','centres formation','insertion'],
  '{
    "coeur":   { "valeur": "1,23 M€", "label": "Budget engagé" },
    "niveau1": { "valeur": "934 jeunes", "label": "Insérés ou en stage", "description": "Emplois et stages créés dans le tourisme durable", "type_preuve": "mesure" },
    "niveau2": { "valeur": "8 centres", "label": "De formation accompagnés", "description": "Offres de formation revisitées intégrant nouvelles tech.", "type_preuve": "mesure" },
    "niveau3": { "label": "Destinations valorisées", "description": "Cambodge, Cabo Verde, Vietnam, Sénégal... patrimoine mis en valeur", "type_preuve": "observation" },
    "niveau4": { "label": "Espace francophone", "description": "Tourisme durable francophone reconnu internationalement", "type_preuve": "institutionnel" }
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, statut=EXCLUDED.statut, description=EXCLUDED.description,
  annee_exercice=EXCLUDED.annee_exercice, budget_modifie=EXCLUDED.budget_modifie,
  budget_engage=EXCLUDED.budget_engage, taux_execution=EXCLUDED.taux_execution,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Pays de couverture
DELETE FROM pays_couverture WHERE projet_id = 'PROJ_A20';
INSERT INTO pays_couverture (projet_id, pays_code) VALUES
  ('PROJ_A20','KHM'),('PROJ_A20','CPV'),('PROJ_A20','VNM'),('PROJ_A20','SEN'),
  ('PROJ_A20','MAR'),('PROJ_A20','TUN'),('PROJ_A20','MDG'),('PROJ_A20','BEN');

-- Indicateurs
DELETE FROM indicateurs WHERE projet_id = 'PROJ_A20';
INSERT INTO indicateurs (projet_id, libelle, valeur_numerique, valeur_pourcentage, unite, categorie, type_preuve, source, mise_en_avant, ordre) VALUES
  ('PROJ_A20','Jeunes diplômés insérés ou en stage dans le tourisme',934,NULL,'jeunes','insertion_economique','mesure','Rapport P20 OIF 2025',true,1),
  ('PROJ_A20','Centres de formation professionnelle accompagnés',8,NULL,'centres','activites','mesure','Rapport P20 OIF 2025',true,2),
  ('PROJ_A20','Supports pédagogiques modernisés (Vietnam)',7,NULL,'supports','activites','mesure','Rapport P20 OIF 2025',false,3),
  ('PROJ_A20','Taux d''exécution budgétaire',NULL,99,'%','execution','mesure','CREXE 2025',true,4);

-- Témoignages
DELETE FROM temoignages WHERE projet_id = 'PROJ_A20';
INSERT INTO temoignages (projet_id, citation, source, source_url, type_media, pays, mise_en_avant) VALUES
  ('PROJ_A20',
   'Avant la mise en place du projet, je n''avais aucune source de revenu et depuis ma formation j''exerce comme guide touristique et je gagne bien ma vie.',
   'Témoignage bénéficiaire — Rapport de suivi P20 OIF 2025',
   NULL,
   'rapport', NULL, true);

-- Partenariats
DELETE FROM partenariats WHERE projet_id = 'PROJ_A20';
INSERT INTO partenariats (projet_id, nom, type, description, ordre) VALUES
  ('PROJ_A20','Université Senghor','institutionnel','Formation CLOM Tourisme durable et patrimoine culturel',1),
  ('PROJ_A20','École nationale du tourisme de Hué (Vietnam)','technique','Modernisation de 7 supports pédagogiques intégrant nouvelles technologies',2),
  ('PROJ_A20','Ministère du Tourisme du Cambodge','institutionnel','Co-lancement du projet Destination Eco-Talent',3),
  ('PROJ_A20','Université de Hanoï','institutionnel','Co-organisation du Forum de l''emploi touristique',4);

-- Événements
DELETE FROM evenements WHERE projet_id = 'PROJ_A20';
INSERT INTO evenements (projet_id, titre, description, date_evenement, type, ordre) VALUES
  ('PROJ_A20','Lancement Destination Eco-Talent — Cambodge','Atelier de lancement à Siem Reap, co-organisé avec le Ministère du Tourisme du Cambodge.','2025-04-01','mission',1),
  ('PROJ_A20','Forum de l''emploi touristique — Vietnam','Co-organisation avec Université de Hanoï et Ministères du tourisme de la région.','2025-09-15','conference',2);
