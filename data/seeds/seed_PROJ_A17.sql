-- ─────────────────────────────────────────────────────────────────────────────
-- Seed PROJ_A17 — Promotion des échanges économiques et commerciaux francophones
-- PS3 · Source : CREX PS3_V2.docx
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO projets (id, ps_id, code_officiel, statut, nom, accroche, description,
  annee_exercice, budget_modifie, budget_engage, taux_execution,
  thematiques, mots_cles, cercles_impact)
VALUES (
  'PROJ_A17', 'PS3', 'PROJ_A17', 'publie',
  'Promotion des échanges économiques et commerciaux francophones',
  'Connecter les entrepreneurs francophones pour un commerce durable',
  'Le projet « Promotion des échanges économiques et commerciaux francophones » vise à stimuler les échanges commerciaux et les investissements au sein de l''espace francophone. En 2025, la Mission économique de la Francophonie au Bénin a permis la réalisation de 1 000 rendez-vous d''affaires entre 92 entreprises internationales, générant des partenariats commerciaux durables et contribuant aux priorités de transformation économique du Bénin.',
  2025, 1402553, 1310756, 93,
  ARRAY['commerce','entrepreneuriat','developpement_economique','partenariats','francophonie'],
  ARRAY['Mission économique','rendez-vous d''affaires','entrepreneurs','Bénin','investissement'],
  '{
    "coeur":   { "valeur": "1,3 M€", "label": "Budget engagé" },
    "niveau1": { "valeur": "1 000 RDV", "label": "Rendez-vous d''affaires", "description": "Entre 92 entreprises internationales francophones", "type_preuve": "mesure" },
    "niveau2": { "valeur": "92 entreprises", "label": "Participantes à la mission", "description": "Issues de l''espace francophone international", "type_preuve": "mesure" },
    "niveau3": { "label": "Filières économiques renforcées", "description": "Contribution aux priorités de transformation du Bénin", "type_preuve": "observation" },
    "niveau4": { "label": "Espace francophone", "description": "Commerce intra-francophone stimulé", "type_preuve": "institutionnel" }
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  nom=EXCLUDED.nom, statut=EXCLUDED.statut, description=EXCLUDED.description,
  annee_exercice=EXCLUDED.annee_exercice, budget_modifie=EXCLUDED.budget_modifie,
  budget_engage=EXCLUDED.budget_engage, taux_execution=EXCLUDED.taux_execution,
  thematiques=EXCLUDED.thematiques, mots_cles=EXCLUDED.mots_cles,
  cercles_impact=EXCLUDED.cercles_impact;

-- Indicateurs
DELETE FROM indicateurs WHERE projet_id = 'PROJ_A17';
INSERT INTO indicateurs (projet_id, libelle, valeur_numerique, valeur_pourcentage, unite, categorie, type_preuve, source, mise_en_avant, ordre) VALUES
  ('PROJ_A17','Rendez-vous d''affaires réalisés',1000,NULL,'RDV','activites','mesure','Rapport Mission économique OIF Bénin 2025',true,1),
  ('PROJ_A17','Entreprises participantes à la Mission économique',92,NULL,'entreprises','partenariats','mesure','Rapport Mission économique OIF Bénin 2025',true,2),
  ('PROJ_A17','Pays représentés à la Mission économique',NULL,NULL,'pays','couverture','mesure','Rapport Mission économique OIF Bénin 2025',true,3),
  ('PROJ_A17','Partenariats commerciaux conclus ou en cours de finalisation',NULL,NULL,'partenariats','effets','estimation','Rapport Mission économique OIF Bénin 2025',false,4);

-- Témoignages
DELETE FROM temoignages WHERE projet_id = 'PROJ_A17';
INSERT INTO temoignages (projet_id, citation, source, source_url, type_media, pays, mise_en_avant) VALUES
  ('PROJ_A17',
   'Grâce à la Mission économique, j''ai pu rencontrer en deux jours des partenaires que j''aurais mis des mois à identifier. Trois contrats sont déjà en cours de négociation.',
   'Rapport Mission économique de la Francophonie au Bénin 2025 — Pascaline Agassounon, Guidafrica.com',
   NULL,
   'rapport', 'BEN', true);

-- Partenariats
DELETE FROM partenariats WHERE projet_id = 'PROJ_A17';
INSERT INTO partenariats (projet_id, nom, type, description, ordre) VALUES
  ('PROJ_A17','Gouvernement du Bénin','institutionnel','Accueil et co-organisation de la 6e Mission économique de la Francophonie',1),
  ('PROJ_A17','Chambres de commerce francophones','technique','Facilitation des mises en relation entre entreprises',2);

-- Événements
DELETE FROM evenements WHERE projet_id = 'PROJ_A17';
INSERT INTO evenements (projet_id, titre, description, date_evenement, type, ordre) VALUES
  ('PROJ_A17','6e Mission économique de la Francophonie — Bénin','1 000 RDV d''affaires, 92 entreprises de l''espace francophone. Contribution aux priorités économiques du Bénin.','2025-06-17','mission',1);
