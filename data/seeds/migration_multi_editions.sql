-- ─── Migration : Architecture Multi-Éditions CREXE ────────────────────────────
-- Rend chaque objet de la plateforme (projets, indicateurs, témoignages,
-- documents RAG) pleinement conscient de l'édition à laquelle il appartient.
--
-- Concept pédagogique — Versioning des données :
-- Une plateforme institutionnelle accumule des données au fil des années.
-- Plutôt que d'écraser les données 2024 avec 2025, on les conserve toutes
-- et on les filtre par édition. C'est le principe du "soft versioning" :
-- chaque enregistrement porte son édition, les vues et APIs filtrent par
-- l'édition sélectionnée.
--
-- Exécuter dans Supabase SQL Editor (une fois, idempotent via IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 0. S'assurer que crex_editions existe avec 2024 ─────────────────────────
-- (La table a déjà été créée via migration_era_resultats.sql)
-- On ajoute juste l'édition 2024 si absente.
INSERT INTO crex_editions (annee, libelle, description, statut, date_debut, date_fin, est_actif)
VALUES
  (2024, 'CREXE 2024', 'Compte-Rendu d''Exécution exercice 2024', 'clos', '2024-01-01', '2024-12-31', false)
ON CONFLICT (annee) DO NOTHING;

-- ─── 1. Lier projets.annee_exercice à crex_editions(annee) ──────────────────
-- Concept : une clé étrangère (FK) garantit l'intégrité référentielle.
-- On ne peut pas avoir un projet pour une édition qui n'existe pas.

-- D'abord s'assurer que tous les projets existants ont une édition valide
UPDATE projets SET annee_exercice = 2025 WHERE annee_exercice IS NULL;

-- Ajouter la FK si elle n'existe pas encore
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'projets_annee_exercice_fkey'
      AND table_name = 'projets'
  ) THEN
    ALTER TABLE projets
      ADD CONSTRAINT projets_annee_exercice_fkey
      FOREIGN KEY (annee_exercice) REFERENCES crex_editions(annee)
      ON UPDATE CASCADE;
  END IF;
END $$;

-- ─── 2. Rendre documents_rag edition-aware ────────────────────────────────────
-- Les documents de la base de connaissance sont spécifiques à une édition.
-- La méthodologie ERA est partagée → edition_annee = NULL (valide pour toutes).

ALTER TABLE documents_rag
  ADD COLUMN IF NOT EXISTS edition_annee INTEGER REFERENCES crex_editions(annee);

-- Les documents déjà uploadés sont attribués à 2025 (édition courante)
-- sauf ceux de catégorie 'methodologie' ou 'general_oif' qui restent partagés
UPDATE documents_rag
SET edition_annee = 2025
WHERE edition_annee IS NULL
  AND type_contenu NOT IN ('methodologie', 'general_oif');

-- Index pour les recherches par édition
CREATE INDEX IF NOT EXISTS idx_documents_rag_edition
  ON documents_rag(edition_annee);

-- ─── 3. Mettre à jour la fonction match_documents pour filtrer par édition ────
-- Concept : la recherche sémantique RAG doit retourner uniquement les passages
-- de l'édition demandée OU les documents partagés (edition_annee IS NULL).

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold  float    DEFAULT 0.5,
  match_count      int      DEFAULT 8,
  p_projet_id      text     DEFAULT NULL,
  p_edition_annee  integer  DEFAULT NULL
)
RETURNS TABLE (
  id               bigint,
  contenu          text,
  type_contenu     text,
  section          text,
  source_document  text,
  projet_id        text,
  edition_annee    integer,
  similarity       float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dr.id,
    dr.contenu,
    dr.type_contenu,
    dr.section,
    dr.source_document,
    dr.projet_id,
    dr.edition_annee,
    1 - (dr.embedding <=> query_embedding) AS similarity
  FROM documents_rag dr
  WHERE
    -- Filtrer par projet si spécifié
    (p_projet_id IS NULL OR dr.projet_id = p_projet_id)
    -- Documents de l'édition demandée OU documents partagés (méthodologie)
    AND (
      p_edition_annee IS NULL
      OR dr.edition_annee = p_edition_annee
      OR dr.edition_annee IS NULL
    )
    -- Seuil de similarité
    AND 1 - (dr.embedding <=> query_embedding) > match_threshold
  ORDER BY dr.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ─── 4. Vue enrichie des projets publics avec leur édition ───────────────────
CREATE OR REPLACE VIEW v_projets_publics AS
  SELECT
    p.*,
    ce.libelle          AS edition_libelle,
    ce.est_actif        AS edition_est_active,
    ce.statut           AS edition_statut
  FROM projets p
  LEFT JOIN crex_editions ce ON ce.annee = p.annee_exercice
  WHERE p.statut = 'publie';

-- ─── 5. Statistiques par édition ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_stats_par_edition AS
  SELECT
    ce.annee,
    ce.libelle,
    ce.est_actif,
    ce.statut                                         AS edition_statut,
    COUNT(DISTINCT p.id) FILTER (WHERE p.statut = 'publie') AS nb_projets_publies,
    COUNT(DISTINCT p.id)                               AS nb_projets_total,
    COUNT(DISTINCT pc.pays_code)                       AS nb_pays,
    SUM(p.budget_modifie) FILTER (WHERE p.statut = 'publie') AS budget_total,
    SUM(p.nombre_beneficiaires) FILTER (WHERE p.statut = 'publie') AS beneficiaires_total
  FROM crex_editions ce
  LEFT JOIN projets p       ON p.annee_exercice = ce.annee
  LEFT JOIN pays_couverture pc ON pc.projet_id = p.id AND p.statut = 'publie'
  GROUP BY ce.annee, ce.libelle, ce.est_actif, ce.statut
  ORDER BY ce.annee DESC;

-- ─── 6. Politique RLS pour documents_rag mise à jour ────────────────────────
-- Lecture publique des documents des projets publiés de l'édition
DROP POLICY IF EXISTS "documents_rag_public_read" ON documents_rag;
CREATE POLICY "documents_rag_public_read" ON documents_rag
  FOR SELECT
  USING (
    edition_annee IS NULL  -- documents partagés (méthodologie)
    OR EXISTS (
      SELECT 1 FROM crex_editions ce
      WHERE ce.annee = documents_rag.edition_annee
    )
  );

-- ─── 7. Commentaires ────────────────────────────────────────────────────────
COMMENT ON COLUMN documents_rag.edition_annee IS
  'Édition CREX du document (NULL = partagé toutes éditions, ex: méthodologie ERA)';
COMMENT ON COLUMN projets.annee_exercice IS
  'Année de l''édition CREX. FK vers crex_editions(annee).';
