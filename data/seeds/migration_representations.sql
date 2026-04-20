-- ─── Migration : Table representations (REPEX) ─────────────────────────────
-- Les représentations de l'OIF dans les régions — différentes des partenaires.
-- Ex. : "Représentation OIF pour l'Afrique de l'Ouest", "Bureau Régional Asie-Pacifique"
-- ─────────────────────────────────────────────────────────────────────────────

-- Enum type pour les représentations
DO $$ BEGIN
  CREATE TYPE type_representation AS ENUM (
    'representation_regionale',
    'bureau_regional',
    'antenne',
    'point_focal',
    'delegation_permanente'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Table representations
CREATE TABLE IF NOT EXISTS representations (
  id            SERIAL PRIMARY KEY,
  projet_id     TEXT        NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  nom           TEXT        NOT NULL,              -- ex: "Représentation OIF pour l'Afrique de l'Ouest"
  acronyme      TEXT,                               -- ex: "REPEX-AOF"
  type          type_representation DEFAULT 'representation_regionale',
  region        TEXT,                               -- ex: "Afrique de l'Ouest"
  ville         TEXT,                               -- ex: "Dakar"
  pays_code     CHAR(2),                            -- code ISO2 du pays d'accueil
  role_dans_projet TEXT,                            -- rôle spécifique dans ce projet
  description   TEXT,
  contact_email TEXT,
  site_web      TEXT,
  mise_en_avant BOOLEAN     DEFAULT FALSE,
  ordre         INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_representations_projet_id ON representations(projet_id);
CREATE INDEX IF NOT EXISTS idx_representations_ordre      ON representations(projet_id, ordre);

-- RLS
ALTER TABLE representations ENABLE ROW LEVEL SECURITY;

-- Lecture publique si le projet est publié
CREATE POLICY "representations_public_read" ON representations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projets p
      WHERE p.id = representations.projet_id
        AND p.statut = 'publie'
    )
  );

-- Écriture : admin ou éditeur assigné
CREATE POLICY "representations_edit" ON representations
  FOR ALL
  USING (is_admin() OR can_edit_projet(projet_id))
  WITH CHECK (is_admin() OR can_edit_projet(projet_id));

-- ─── Données démo pour P14 ────────────────────────────────────────────────────
INSERT INTO representations (projet_id, nom, acronyme, type, region, ville, pays_code, role_dans_projet, description, mise_en_avant, ordre)
VALUES
  ('PROJ_A14', 'Représentation OIF pour l''Afrique de l''Ouest', 'REPEX-AOF',
   'representation_regionale', 'Afrique de l''Ouest', 'Dakar', 'SN',
   'Coordination opérationnelle et suivi des 14 projets financés en Afrique subsaharienne',
   'Bureau régional OIF assurant la liaison avec les États membres de la sous-région et le suivi des décaissements du Fonds.',
   TRUE, 1),
  ('PROJ_A14', 'Représentation OIF pour l''Afrique centrale et les Grands Lacs', 'REPEX-ACG',
   'representation_regionale', 'Afrique centrale', 'Libreville', 'GA',
   'Accompagnement des projets éducatifs et des formations AGR au Cameroun et au Gabon',
   'Bureau régional OIF avec une expertise spécifique sur l''égalité femmes-hommes dans les contextes post-conflits.',
   FALSE, 2),
  ('PROJ_A14', 'Délégation permanente auprès des Nations Unies (Genève)', 'DPOIF-GE',
   'delegation_permanente', 'Europe / Organisations internationales', 'Genève', 'CH',
   'Représentation institutionnelle et plaidoyer ODD 5 dans les enceintes multilatérales',
   'Assure la visibilité des résultats du projet dans les rapports soumis aux mécanismes ONU Femmes et CEDAW.',
   FALSE, 3)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE representations IS 'Représentations régionales et délégations OIF impliquées dans les projets CREXE (bloc REPEX)';
