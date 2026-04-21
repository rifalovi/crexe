-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 00 — Pays manquants dans la table pays
-- À exécuter AVANT tous les autres seeds de projets
-- Source : ISO 3166-1 alpha-3 (XKX = Kosovo, code provisoire)
--
-- Concept pédagogique — Idempotence :
-- ON CONFLICT (code_iso3) DO UPDATE permet de ré-exécuter le script
-- sans créer de doublons. Les données existantes sont mises à jour si besoin.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO pays (code_iso3, nom_fr, nom_en, region, est_francophone)
VALUES
  -- ── Afrique centrale ────────────────────────────────────────────────────────
  ('GAB', 'Gabon',                     'Gabon',                    'Afrique centrale',   true),
  ('CAF', 'République centrafricaine', 'Central African Republic', 'Afrique centrale',   true),
  ('GNQ', 'Guinée équatoriale',        'Equatorial Guinea',        'Afrique centrale',   true),
  ('COG', 'Congo',                     'Congo',                    'Afrique centrale',   true),
  ('COD', 'République démocratique du Congo', 'Democratic Republic of the Congo', 'Afrique centrale', true),
  ('CMR', 'Cameroun',                  'Cameroon',                 'Afrique centrale',   true),
  ('TCD', 'Tchad',                     'Chad',                     'Afrique centrale',   true),

  -- ── Afrique de l'Ouest ──────────────────────────────────────────────────────
  ('BEN', 'Bénin',                     'Benin',                    'Afrique de l''Ouest', true),
  ('BFA', 'Burkina Faso',              'Burkina Faso',             'Afrique de l''Ouest', true),
  ('CIV', 'Côte d''Ivoire',            'Côte d''Ivoire',           'Afrique de l''Ouest', true),
  ('GIN', 'Guinée',                    'Guinea',                   'Afrique de l''Ouest', true),
  ('GNB', 'Guinée-Bissau',             'Guinea-Bissau',            'Afrique de l''Ouest', true),
  ('MLI', 'Mali',                      'Mali',                     'Afrique de l''Ouest', true),
  ('MRT', 'Mauritanie',                'Mauritania',               'Afrique de l''Ouest', true),
  ('NER', 'Niger',                     'Niger',                    'Afrique de l''Ouest', true),
  ('SEN', 'Sénégal',                   'Senegal',                  'Afrique de l''Ouest', true),
  ('TGO', 'Togo',                      'Togo',                     'Afrique de l''Ouest', true),
  ('NGA', 'Nigéria',                   'Nigeria',                  'Afrique de l''Ouest', false),
  ('GHA', 'Ghana',                     'Ghana',                    'Afrique de l''Ouest', false),
  ('CPV', 'Cabo Verde',                'Cabo Verde',               'Afrique de l''Ouest', true),

  -- ── Afrique de l'Est ────────────────────────────────────────────────────────
  ('BDI', 'Burundi',                   'Burundi',                  'Afrique de l''Est',   true),
  ('COM', 'Comores',                   'Comoros',                  'Afrique de l''Est',   true),
  ('DJI', 'Djibouti',                  'Djibouti',                 'Afrique de l''Est',   true),
  ('MDG', 'Madagascar',                'Madagascar',               'Afrique de l''Est',   true),
  ('MUS', 'Maurice',                   'Mauritius',                'Afrique de l''Est',   true),
  ('RWA', 'Rwanda',                    'Rwanda',                   'Afrique de l''Est',   true),
  ('SYC', 'Seychelles',                'Seychelles',               'Afrique de l''Est',   true),
  ('STP', 'Sao Tomé-et-Principe',      'Sao Tome and Principe',    'Afrique de l''Est',   true),

  -- ── Afrique du Nord ─────────────────────────────────────────────────────────
  ('DZA', 'Algérie',                   'Algeria',                  'Afrique du Nord',     true),
  ('EGY', 'Égypte',                    'Egypt',                    'Afrique du Nord',     true),
  ('MAR', 'Maroc',                     'Morocco',                  'Afrique du Nord',     true),
  ('TUN', 'Tunisie',                   'Tunisia',                  'Afrique du Nord',     true),

  -- ── Afrique australe ────────────────────────────────────────────────────────
  ('MOZ', 'Mozambique',                'Mozambique',               'Afrique australe',    false),
  ('AGO', 'Angola',                    'Angola',                   'Afrique australe',    false),

  -- ── Asie-Pacifique ──────────────────────────────────────────────────────────
  ('KHM', 'Cambodge',                  'Cambodia',                 'Asie-Pacifique',      true),
  ('VNM', 'Viet Nam',                  'Viet Nam',                 'Asie-Pacifique',      true),
  ('LAO', 'Laos',                      'Laos',                     'Asie-Pacifique',      true),

  -- ── Moyen-Orient / Asie occidentale ────────────────────────────────────────
  ('LBN', 'Liban',                     'Lebanon',                  'Moyen-Orient',        true),
  ('QAT', 'Qatar',                     'Qatar',                    'Moyen-Orient',        false),

  -- ── Europe ──────────────────────────────────────────────────────────────────
  ('AND', 'Andorre',                   'Andorra',                  'Europe',              true),
  ('ALB', 'Albanie',                   'Albania',                  'Europe',              true),
  ('ARM', 'Arménie',                   'Armenia',                  'Europe',              true),
  ('BEL', 'Belgique',                  'Belgium',                  'Europe',              true),
  ('BGR', 'Bulgarie',                  'Bulgaria',                 'Europe',              true),
  ('CAN', 'Canada',                    'Canada',                   'Amériques',           true),
  ('CHE', 'Suisse',                    'Switzerland',              'Europe',              true),
  ('FRA', 'France',                    'France',                   'Europe',              true),
  ('GEO', 'Géorgie',                   'Georgia',                  'Europe',              false),
  ('GRC', 'Grèce',                     'Greece',                   'Europe',              true),
  ('HTI', 'Haïti',                     'Haiti',                    'Amériques',           true),
  ('LUX', 'Luxembourg',                'Luxembourg',               'Europe',              true),
  ('LVA', 'Lettonie',                  'Latvia',                   'Europe',              true),
  ('MCO', 'Monaco',                    'Monaco',                   'Europe',              true),
  ('MDA', 'Moldova',                   'Moldova',                  'Europe',              true),
  ('MKD', 'Macédoine du Nord',         'North Macedonia',          'Europe',              true),
  ('MNE', 'Monténégro',                'Montenegro',               'Europe',              true),
  ('ROU', 'Roumanie',                  'Romania',                  'Europe',              true),
  ('SRB', 'Serbie',                    'Serbia',                   'Europe',              true),
  ('SVK', 'Slovaquie',                 'Slovakia',                 'Europe',              true),
  ('SVN', 'Slovénie',                  'Slovenia',                 'Europe',              true),
  ('UKR', 'Ukraine',                   'Ukraine',                  'Europe',              false),
  ('XKX', 'Kosovo',                    'Kosovo',                   'Europe',              false),

  -- ── Amériques ───────────────────────────────────────────────────────────────
  ('ARG', 'Argentine',                 'Argentina',                'Amériques',           false),
  ('CHL', 'Chili',                     'Chile',                    'Amériques',           false),
  ('MEX', 'Mexique',                   'Mexico',                   'Amériques',           false),

  -- ── Asie du Sud ─────────────────────────────────────────────────────────────
  ('BGD', 'Bangladesh',                'Bangladesh',               'Asie du Sud',         false)

ON CONFLICT (code_iso3) DO UPDATE SET
  nom_fr          = EXCLUDED.nom_fr,
  nom_en          = EXCLUDED.nom_en,
  region          = EXCLUDED.region,
  est_francophone = EXCLUDED.est_francophone;

-- Vérification rapide
SELECT count(*) AS total_pays FROM pays;
