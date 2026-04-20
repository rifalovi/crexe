-- ─────────────────────────────────────────────────────────────────────────────
-- Migration : tables partenariats + evenements
-- À exécuter dans le SQL Editor Supabase (une seule fois)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── TABLE PARTENARIATS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partenariats (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  projet_id   text REFERENCES projets(id) ON DELETE CASCADE NOT NULL,
  nom         text NOT NULL,
  acronyme    text,
  type        text CHECK (type IN ('bailleur', 'operateur', 'partenaire_technique', 'gouvernemental', 'societe_civile', 'autre')),
  description text,
  site_web    text,
  ordre       integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partenariats_projet ON partenariats(projet_id);

-- RLS partenariats
ALTER TABLE partenariats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partenariats lecture publique si projet publié" ON partenariats
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projets WHERE id = partenariats.projet_id AND statut = 'publie')
  );

CREATE POLICY "Partenariats visibles aux éditeurs assignés" ON partenariats
  FOR SELECT USING (can_edit_projet(projet_id) OR is_admin());

CREATE POLICY "Partenariats éditables par éditeurs assignés" ON partenariats
  FOR ALL USING (can_edit_projet(projet_id) OR is_admin());

-- ── TABLE ÉVÉNEMENTS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evenements (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  projet_id        text REFERENCES projets(id) ON DELETE CASCADE NOT NULL,
  titre            text NOT NULL,
  description      text,
  date_evenement   date,
  date_fin         date,
  type             text CHECK (type IN ('conference', 'formation', 'forum', 'lancement', 'reunion', 'remise_prix', 'publication', 'autre')),
  lieu             text,
  pays_code        text,
  url              text,
  mise_en_avant    boolean DEFAULT false,
  ordre            integer DEFAULT 0,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evenements_projet ON evenements(projet_id);
CREATE INDEX IF NOT EXISTS idx_evenements_date ON evenements(date_evenement);

-- RLS événements
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Événements lecture publique si projet publié" ON evenements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projets WHERE id = evenements.projet_id AND statut = 'publie')
  );

CREATE POLICY "Événements visibles aux éditeurs assignés" ON evenements
  FOR SELECT USING (can_edit_projet(projet_id) OR is_admin());

CREATE POLICY "Événements éditables par éditeurs assignés" ON evenements
  FOR ALL USING (can_edit_projet(projet_id) OR is_admin());

SELECT 'Migration partenariats + evenements appliquée avec succès.' AS statut;
