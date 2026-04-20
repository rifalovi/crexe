-- ─── Migration : era_resultats + crex_editions ────────────────────────────────
-- Structure complète pour stocker les résultats d'enquête ERA par projet
-- et gérer le versioning des éditions CREX (2024, 2025, 2026, 2027...).
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Table des éditions CREX ───────────────────────────────────────────────
-- Permet de gérer plusieurs exercices CREX en parallèle ou en historique.
CREATE TABLE IF NOT EXISTS crex_editions (
  id          SERIAL PRIMARY KEY,
  annee       INTEGER     NOT NULL UNIQUE,  -- ex: 2024, 2025, 2026
  libelle     TEXT        NOT NULL,         -- ex: "CREX 2025"
  description TEXT        DEFAULT '',
  statut      TEXT        NOT NULL DEFAULT 'en_cours'
              CHECK (statut IN ('en_cours', 'clos', 'archive')),
  date_debut  DATE,
  date_fin    DATE,
  est_actif   BOOLEAN     NOT NULL DEFAULT false,  -- édition courante affichée par défaut
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Une seule édition peut être active à la fois
CREATE UNIQUE INDEX IF NOT EXISTS idx_crex_editions_actif
  ON crex_editions(est_actif) WHERE est_actif = true;

-- Seed des éditions existantes
INSERT INTO crex_editions (annee, libelle, description, statut, date_debut, date_fin, est_actif) VALUES
  (2024, 'CREX 2024', 'Compte-Rendu d''Exécution exercice 2024 — rétroactif', 'clos',    '2024-01-01', '2024-12-31', false),
  (2025, 'CREX 2025', 'Compte-Rendu d''Exécution exercice 2025 — édition active',  'en_cours', '2025-01-01', '2025-12-31', true),
  (2026, 'CREX 2026', 'Compte-Rendu d''Exécution exercice 2026 — préparation',     'en_cours', '2026-01-01', '2026-12-31', false)
ON CONFLICT (annee) DO NOTHING;

-- ─── 2. Table des résultats ERA par projet + édition ──────────────────────────
CREATE TABLE IF NOT EXISTS era_resultats (
  id                    SERIAL PRIMARY KEY,
  projet_id             TEXT        NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  edition_annee         INTEGER     NOT NULL DEFAULT 2025 REFERENCES crex_editions(annee),

  -- Section Rappel
  objectif_era          TEXT        DEFAULT '',
  methodologie          TEXT        DEFAULT '',
  questionnaire         TEXT        DEFAULT '',  -- copie texte du questionnaire

  -- Statistiques de collecte
  population_estimee    INTEGER,                -- population d'enquête estimée
  echantillon_prevu     INTEGER,                -- taille d'échantillon calculée
  nombre_retours        INTEGER,                -- questionnaires reçus
  taux_completude       NUMERIC(5,2),           -- % de complétion (0-100)

  -- Résultats détaillés : tableaux d'effectifs/fréquences
  -- Format JSONB : [{ titre, description, colonnes: [...], lignes: [{libelle, ...cols}] }]
  tableaux_resultats    JSONB       DEFAULT '[]'::jsonb,

  -- Fichier source uploadé (Supabase Storage path)
  fichier_source_path   TEXT,                   -- path dans Supabase Storage
  fichier_source_nom    TEXT,                   -- nom du fichier original

  -- Analyse IA générée
  analyse_ia            TEXT        DEFAULT '',  -- analyse textuelle générée
  analyse_ia_generee_le TIMESTAMPTZ,

  -- Statut de publication
  statut                TEXT        NOT NULL DEFAULT 'brouillon'
                        CHECK (statut IN ('brouillon', 'en_revue', 'publie')),

  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT era_resultats_projet_edition_unique UNIQUE (projet_id, edition_annee)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_era_resultats_projet   ON era_resultats(projet_id);
CREATE INDEX IF NOT EXISTS idx_era_resultats_edition  ON era_resultats(edition_annee);

-- RLS
ALTER TABLE era_resultats ENABLE ROW LEVEL SECURITY;
ALTER TABLE crex_editions ENABLE ROW LEVEL SECURITY;

-- Lecture publique : ERA publiés + projet publié
CREATE POLICY "era_resultats_public_read" ON era_resultats
  FOR SELECT
  USING (
    statut = 'publie'
    AND EXISTS (
      SELECT 1 FROM projets p
      WHERE p.id = era_resultats.projet_id
        AND p.statut = 'publie'
    )
  );

-- Lecture lecteur : ERA en_revue ou publiés pour les projets qui leur sont assignés
CREATE POLICY "era_resultats_lecteur_read" ON era_resultats
  FOR SELECT
  USING (
    statut IN ('en_revue', 'publie')
    AND (
      is_admin()
      OR can_edit_projet(projet_id)
      OR EXISTS (
        SELECT 1 FROM assignations_editeur ae
        WHERE ae.projet_id = era_resultats.projet_id
          AND ae.editeur_id = auth.uid()
      )
    )
  );

-- Écriture : admin ou éditeur du projet
CREATE POLICY "era_resultats_edit" ON era_resultats
  FOR ALL
  USING    (is_admin() OR can_edit_projet(projet_id))
  WITH CHECK (is_admin() OR can_edit_projet(projet_id));

-- Lecture publique des éditions CREX
CREATE POLICY "crex_editions_public_read" ON crex_editions
  FOR SELECT USING (true);

CREATE POLICY "crex_editions_admin_write" ON crex_editions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_era_resultats_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_era_resultats_updated_at ON era_resultats;
CREATE TRIGGER trg_era_resultats_updated_at
  BEFORE UPDATE ON era_resultats
  FOR EACH ROW EXECUTE FUNCTION update_era_resultats_updated_at();

-- ─── 3. Vue publique ERA ───────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_era_publics AS
  SELECT
    er.id,
    er.projet_id,
    er.edition_annee,
    p.nom                   AS projet_nom,
    p.code_officiel,
    er.objectif_era,
    er.methodologie,
    er.population_estimee,
    er.echantillon_prevu,
    er.nombre_retours,
    er.taux_completude,
    er.tableaux_resultats,
    er.analyse_ia,
    er.statut
  FROM era_resultats er
  JOIN projets p ON p.id = er.projet_id
  WHERE er.statut = 'publie'
    AND p.statut = 'publie';

COMMENT ON TABLE era_resultats  IS 'Résultats ERA (enquête qualitative) par projet et par édition CREX';
COMMENT ON TABLE crex_editions  IS 'Éditions annuelles CREX (2024, 2025, 2026…) — une seule active à la fois';
