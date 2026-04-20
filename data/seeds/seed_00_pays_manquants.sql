-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 00 — Pays manquants dans la table pays
-- À exécuter AVANT tous les autres seeds de projets
-- Source : ISO 3166-1 alpha-3
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO pays (code_iso3, nom_fr, nom_en, region, est_francophone)
VALUES
  ('GAB', 'Gabon',                     'Gabon',                    'Afrique centrale',  true),
  ('CAF', 'République centrafricaine', 'Central African Republic',  'Afrique centrale',  true),
  ('KHM', 'Cambodge',                  'Cambodia',                  'Asie-Pacifique',    true),
  ('VNM', 'Viet Nam',                  'Viet Nam',                  'Asie-Pacifique',    true),
  ('GNQ', 'Guinée équatoriale',        'Equatorial Guinea',         'Afrique centrale',  true),
  ('MOZ', 'Mozambique',                'Mozambique',                'Afrique australe',  false),
  ('BGD', 'Bangladesh',                'Bangladesh',                'Asie du Sud',       false)
ON CONFLICT (code_iso3) DO UPDATE SET
  nom_fr         = EXCLUDED.nom_fr,
  nom_en         = EXCLUDED.nom_en,
  region         = EXCLUDED.region,
  est_francophone = EXCLUDED.est_francophone;

SELECT 'Pays insérés/mis à jour : ' || count(*) || ' lignes' AS statut
FROM pays WHERE code_iso3 IN ('GAB','CAF','KHM','VNM','GNQ','MOZ','BGD');
