-- ─────────────────────────────────────────────────────────────────────────────
-- Migration : ajout de la colonne photo_url à la table temoignages
-- À exécuter UNE SEULE FOIS avant seed_temoignages_ps3.sql
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE temoignages
  ADD COLUMN IF NOT EXISTS photo_url text;

COMMENT ON COLUMN temoignages.photo_url IS
  'URL de la photo de la personne citée (portrait), stockée dans Supabase Storage ou en chemin relatif /images/temoignages/';

SELECT 'Migration photo_url appliquée avec succès.' AS statut;
