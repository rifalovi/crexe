-- ─────────────────────────────────────────────────────────────────────────────
-- Témoignages PROJ_A14 — La Francophonie avec Elles
-- Sources : CREX PS3_V2.docx + Rapport P14 OIF 2025 + Enquête satisfaction
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM temoignages WHERE projet_id = 'PROJ_A14';

INSERT INTO temoignages (projet_id, citation, source, source_url, type_media, pays, mise_en_avant) VALUES

  ('PROJ_A14',
   'Les revenus des femmes accompagnées ont été, en moyenne, multipliés par trois. Elles gagnent en autonomie dans la gestion de leurs finances, de leurs activités et de leurs choix de vie.',
   'Synthèse de l''enquête de satisfaction bénéficiaires 2025 — OIF',
   NULL,
   'rapport', NULL, true),

  ('PROJ_A14',
   'À Madagascar, la mécanique automobile était une activité encore réservée aux hommes. Aujourd''hui, des femmes formées et équipées par le Fonds exercent ce métier et forment à leur tour d''autres femmes.',
   'Reportage RFI Afrique, 8 mars 2025',
   'https://www.rfi.fr/fr/afrique/20250308-madagascar-la-mécanique-automobile-une-activité-encore-réservée-aux-hommes-et-pourtant',
   'article', 'MDG', true),

  ('PROJ_A14',
   'Au Rwanda, des collectivités territoriales mettent désormais des terres cultivables à disposition des coopératives de femmes bénéficiaires, illustrant un ancrage institutionnel durable des initiatives.',
   'Rapport de mission OIF au Bénin, 30 novembre — 5 décembre 2025',
   NULL,
   'rapport', 'RWA', true),

  ('PROJ_A14',
   'Reportage vidéo — parcours de bénéficiaires du Fonds La Francophonie avec Elles.',
   'Chaîne YouTube OIF',
   'https://www.youtube.com/watch?v=bTnxE9-4XvU',
   'video', NULL, false),

  ('PROJ_A14',
   'Reportage vidéo — témoignages de femmes autonomisées par le Fonds.',
   'Chaîne YouTube OIF',
   'https://www.youtube.com/watch?v=g2fuGPv9sNI',
   'video', NULL, false);
