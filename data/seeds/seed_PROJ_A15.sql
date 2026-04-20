-- ─────────────────────────────────────────────────────────────────────────────
-- Seed PROJ_A15 — Innovations et plaidoyers francophones
-- PS3 · Source : CREX PS3_V2.docx
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Projet parent
INSERT INTO projets (id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  thematiques, mots_cles, cercles_impact)
VALUES (
  'PROJ_A15', 'PS3', 'PROJ_A15', 'publie',
  'Innovations et plaidoyers francophones',
  'Jeunesse, créativité et société civile au cœur de la Francophonie',
  'Le projet « Innovations et plaidoyers francophones » constitue un dispositif structurant pour la jeunesse et la société civile francophone. Il comprend deux volets complémentaires : le Programme d''accompagnement #CAP Innovation, qui soutient les jeunes entrepreneurs francophones innovants, et le volet Société civile (COING et RIJF), qui renforce la structuration des organisations de la société civile dans l''espace francophone.',
  2025, 905378, 880642, 97,
  ARRAY['jeunesse','innovation','entrepreneuriat','societe_civile','francophonie'],
  ARRAY['CAP Innovation','COING','RIJF','jeunes entrepreneurs','plaidoyer'],
  '{
    "coeur":   { "valeur": "880 642 €", "label": "Budget engagé" },
    "niveau1": { "valeur": "100 lauréats", "label": "Programme CAP Innovation", "description": "Accompagnés sur 3 mois", "type_preuve": "mesure" },
    "niveau2": { "valeur": "3 000 personnes", "label": "Touchées par les projets", "description": "Bénéficiaires indirects des innovations", "type_preuve": "estimation" },
    "niveau3": { "label": "Sociétés civiles structurées", "description": "127 organisations membres COING, 25 pays", "type_preuve": "mesure" },
    "niveau4": { "label": "Espace francophone", "description": "43 pays concernés par le réseau RIJF", "type_preuve": "institutionnel" }
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  ps_id=EXCLUDED.ps_id, code_officiel=EXCLUDED.code_officiel, statut=EXCLUDED.statut,
  nom=EXCLUDED.nom, accroche=EXCLUDED.accroche, description=EXCLUDED.description,
  annee_exercice=EXCLUDED.annee_exercice, budget_modifie=EXCLUDED.budget_modifie,
  budget_engage=EXCLUDED.budget_engage, taux_execution=EXCLUDED.taux_execution,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- 2. Sous-projet A : CAP Innovation
INSERT INTO projets (id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  projet_parent_id, est_sous_projet, thematiques, mots_cles, cercles_impact)
VALUES (
  'PROJ_A15a', 'PS3', 'PROJ_A15a', 'publie',
  'Volet Jeunesse — Programme #CAP Innovation',
  'Accélérer les projets innovants de la jeunesse francophone',
  'Le programme d''accompagnement #CAP Innovation, mis en œuvre dans le cadre du projet 15, vise à soutenir les jeunes entrepreneurs et innovateurs francophones. Sur l''exercice 2025, 100 lauréats ont participé au programme et 3 000 personnes ont été touchées par les projets innovants.',
  2025, NULL, NULL, NULL,
  'PROJ_A15', true,
  ARRAY['jeunesse','innovation','entrepreneuriat'],
  ARRAY['CAP Innovation','lauréats','incubation','francophonie'],
  '{
    "coeur":   { "valeur": "100", "label": "Lauréats accompagnés" },
    "niveau1": { "valeur": "3 000", "label": "Personnes touchées", "description": "Par les projets des lauréats", "type_preuve": "estimation" },
    "niveau2": { "label": "Réseaux renforcés", "description": "OFQJ, EY, Green Nations, Hit Radio", "type_preuve": "observation" },
    "niveau3": { "label": "Espace francophone", "description": "Jeunes de 43 pays représentés", "type_preuve": "institutionnel" }
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, statut=EXCLUDED.statut, description=EXCLUDED.description,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- 3. Sous-projet B : Société civile (COING + RIJF)
INSERT INTO projets (id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  projet_parent_id, est_sous_projet, nombre_pays, thematiques, mots_cles, cercles_impact)
VALUES (
  'PROJ_A15b', 'PS3', 'PROJ_A15b', 'publie',
  'Volet Société civile — COING & RIJF',
  'Structurer et renforcer la société civile francophone',
  'Ce volet du projet 15 œuvre à la structuration de la société civile francophone et au renforcement de la représentativité des organisations francophones. La COING compte 127 organisations membres actives dans 25 pays. Le RIJF (Réseau International des Journalistes Francophones) couvre 30 pays.',
  2025, NULL, NULL, NULL,
  'PROJ_A15', true, 30,
  ARRAY['societe_civile','journalisme','gouvernance','francophonie'],
  ARRAY['COING','RIJF','organisations','journalistes','plaidoyer'],
  '{
    "coeur":   { "valeur": "127", "label": "Organisations membres COING" },
    "niveau1": { "valeur": "25 pays", "label": "Représentés à la COING", "description": "Stabilisation et renforcement de la gouvernance", "type_preuve": "mesure" },
    "niveau2": { "valeur": "30 pays", "label": "Réseau RIJF", "description": "Journalistes francophones organisés", "type_preuve": "mesure" },
    "niveau3": { "label": "Espace francophone", "description": "Société civile structurée à l''échelle internationale", "type_preuve": "institutionnel" }
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, statut=EXCLUDED.statut, description=EXCLUDED.description,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- 4. Indicateurs PROJ_A15
DELETE FROM indicateurs WHERE projet_id IN ('PROJ_A15','PROJ_A15a','PROJ_A15b');
INSERT INTO indicateurs (projet_id, libelle, valeur_numerique, valeur_pourcentage, unite, categorie, type_preuve, source, mise_en_avant, ordre) VALUES
  ('PROJ_A15a','Lauréats ayant participé au Programme CAP Innovation',100,NULL,'lauréats','activites','mesure','Rapport P15 OIF 2025',true,1),
  ('PROJ_A15a','Personnes touchées par les projets innovants des lauréats',3000,NULL,'personnes','rayonnement','estimation','Rapport P15 OIF 2025',true,2),
  ('PROJ_A15a','Bénéficiaires ayant amélioré leur situation professionnelle',NULL,72,'%','insertion_economique','mesure','Enquête ERA P15 2025',true,3),
  ('PROJ_A15a','Bénéficiaires satisfaits ou très satisfaits',NULL,89,'%','satisfaction','mesure','Enquête ERA P15 2025',true,4),
  ('PROJ_A15a','Initiatives innovantes valorisant la diversité francophone',14,NULL,'initiatives','activites','mesure','Rapport P15 OIF 2025',true,5),
  ('PROJ_A15b','Organisations membres actives au sein de la COING',127,NULL,'organisations','structuration','mesure','Rapport COING 2025',true,1),
  ('PROJ_A15b','Pays représentés à la COING',25,NULL,'pays','couverture','mesure','Rapport COING 2025',true,2),
  ('PROJ_A15b','Pays couverts par le RIJF',30,NULL,'pays','couverture','mesure','Rapport RIJF 2025',true,3);

-- 5. Témoignages
DELETE FROM temoignages WHERE projet_id IN ('PROJ_A15','PROJ_A15a','PROJ_A15b');
INSERT INTO temoignages (projet_id, citation, source, source_url, type_media, pays, mise_en_avant) VALUES
  ('PROJ_A15a',
   'Pour Valérie Levesque (Canada, NB), le Réseau est un espace où la jeunesse francophone peut s''exprimer, innover et peser sur les décisions qui la concernent.',
   'Livret des 100 lauréats CAP Innovation — OIF 2026',
   NULL,
   'rapport', 'CAN', true);

-- 6. Partenariats
DELETE FROM partenariats WHERE projet_id IN ('PROJ_A15','PROJ_A15a','PROJ_A15b');
INSERT INTO partenariats (projet_id, nom, type, description, ordre) VALUES
  ('PROJ_A15a','EY (Ernst & Young)','technique','Accompagnement des lauréats CAP Innovation',1),
  ('PROJ_A15a','OFQJ (Office franco-québécois pour la jeunesse)','institutionnel','Co-organisation de la Grande Rencontre des Entrepreneurs francophones',2),
  ('PROJ_A15a','Green Nations','technique','Partenaire de l''accélération des projets à impact',3),
  ('PROJ_A15a','Hit Radio','autre','Médiatisation des lauréats dans l''espace francophone',4);

-- 7. Événements
DELETE FROM evenements WHERE projet_id IN ('PROJ_A15','PROJ_A15a','PROJ_A15b');
INSERT INTO evenements (projet_id, titre, description, date_evenement, type, ordre) VALUES
  ('PROJ_A15a','CAP Innovation — Sélection des 20 meilleurs projets','Annonce des 8 grands lauréats et dauphins, en partenariat avec EY, Green Nations, OFQJ.','2025-11-01','conference',1),
  ('PROJ_A15a','5e Grande Rencontre des Entrepreneurs francophones','Co-organisée par l''OFQJ à Dakar. Participation de la jeunesse francophone de 43 pays.','2025-11-23','mission',2),
  ('PROJ_A15a','Journée internationale de la Francophonie — Marseille','Célébration avec la participation d''une délégation de lauréats CAP Innovation.','2025-03-18','conference',3);
