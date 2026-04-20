-- ─── Migration : Table chaine_resultats ──────────────────────────────────────
-- Chaîne de résultats CAD-OCDE pour chaque projet :
--   Extrants → Effets immédiats → Effets intermédiaires → Impact
-- Chaque niveau stocke un titre narratif + un tableau JSONB d'items textuels.
-- activites_structurantes : tableau [{volume, action}] pour le tableau de bord.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chaine_resultats (
  id                          SERIAL PRIMARY KEY,
  projet_id                   TEXT        NOT NULL REFERENCES projets(id) ON DELETE CASCADE,

  -- Niveau 1 — ce que le projet produit directement (quantitatif)
  extrants_titre              TEXT        DEFAULT '',
  extrants_items              JSONB       DEFAULT '[]'::jsonb,

  -- Niveau 2 — effets à court terme sur les bénéficiaires (compétences, accès)
  effets_immediats_titre      TEXT        DEFAULT '',
  effets_immediats_items      JSONB       DEFAULT '[]'::jsonb,

  -- Niveau 3 — effets à moyen terme (comportements, revenus, autonomie)
  effets_intermediaires_titre TEXT        DEFAULT '',
  effets_intermediaires_items JSONB       DEFAULT '[]'::jsonb,

  -- Niveau 4 — impact à long terme / changement structurel
  impact_titre                TEXT        DEFAULT '',
  impact_items                JSONB       DEFAULT '[]'::jsonb,

  -- Tableau synthétique des activités structurantes [{volume, action}]
  activites_structurantes     JSONB       DEFAULT '[]'::jsonb,

  created_at                  TIMESTAMPTZ DEFAULT now(),
  updated_at                  TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT chaine_resultats_projet_unique UNIQUE (projet_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_chaine_resultats_projet ON chaine_resultats(projet_id);

-- RLS
ALTER TABLE chaine_resultats ENABLE ROW LEVEL SECURITY;

-- Lecture publique si le projet est publié
CREATE POLICY "chaine_resultats_public_read" ON chaine_resultats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projets p
      WHERE p.id = chaine_resultats.projet_id
        AND p.statut = 'publie'
    )
  );

-- Écriture : admin ou éditeur assigné
CREATE POLICY "chaine_resultats_edit" ON chaine_resultats
  FOR ALL
  USING    (is_admin() OR can_edit_projet(projet_id))
  WITH CHECK (is_admin() OR can_edit_projet(projet_id));

-- Trigger : met à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_chaine_resultats_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_chaine_resultats_updated_at ON chaine_resultats;
CREATE TRIGGER trg_chaine_resultats_updated_at
  BEFORE UPDATE ON chaine_resultats
  FOR EACH ROW EXECUTE FUNCTION update_chaine_resultats_updated_at();

-- ─── Seed PROJ_A14 — La Francophonie avec Elles ──────────────────────────────
INSERT INTO chaine_resultats (
  projet_id,
  extrants_titre,          extrants_items,
  effets_immediats_titre,  effets_immediats_items,
  effets_intermediaires_titre, effets_intermediaires_items,
  impact_titre,            impact_items,
  activites_structurantes
) VALUES (
  'PROJ_A14',

  -- EXTRANTS
  'Réalisations directes du Fonds Francophonie avec Elles — exercice 2025',
  '[
    "50 projets soutenus dans le cadre du Fonds Francophonie avec Elles",
    "504 femmes bénéficiaires de formations techniques et professionnelles (couture, coiffure, agriculture, transformation alimentaire, etc.)",
    "9 706 femmes ont accès à une activité génératrice de revenus (AGR)",
    "1 264 actions de renforcement des capacités réalisées (droits, égalité femmes-hommes, entrepreneuriat)",
    "9 290 femmes dont les capacités ont été renforcées en matière de droits et d''égalité",
    "135 actions de communication et de visibilité déployées",
    "2 activités de plaidoyer de haut niveau : dîner-débat CSW69 à New York · Conférence ministérielle de la Francophonie (Kigali, nov. 2025)",
    "1,4 M+ impressions digitales · 734 788 personnes touchées · taux d''engagement de 4,53 %"
  ]'::jsonb,

  -- EFFETS IMMÉDIATS
  '100 % des femmes bénéficiaires ont développé un large éventail de compétences techniques et entrepreneuriales',
  '[
    "70 % de femmes formées en production maraîchère, culture vivrière (maïs, soja, manioc), apiculture et techniques de gestion durable des ressources naturelles",
    "31 % de femmes formées à la transformation de produits agricoles (sésame, arachide, riz, attiéké), à la fabrication de produits d''hygiène (savons) et de produits alimentaires de qualité",
    "72 % de femmes maîtrisant la gestion financière, le marketing, l''épargne, la vente et la création ou gestion d''AGR",
    "100 % des femmes sensibilisées à la vie coopérative, aux compétences de vie courante, à l''estime de soi, à la protection contre les VBG, au leadership féminin et à la gestion hygiénique des menstruations"
  ]'::jsonb,

  -- EFFETS INTERMÉDIAIRES
  'Le projet a eu un impact significatif sur la situation économique et sociale des femmes bénéficiaires',
  '[
    "58 % d''entre elles ont vu leurs revenus augmenter grâce à la diversification de leurs activités, à leur adhésion dans des coopératives agricoles, à une meilleure organisation du travail et à l''accès à de nouveaux débouchés",
    "Accès au système financier formel : 6 % ont ouvert un compte bancaire, 4 % ont bénéficié de microcrédits pour financer leur activité de manière autonome",
    "Les revenus ont été, en moyenne, multipliés par trois — gain d''autonomie dans la gestion des finances, des activités et des choix de vie",
    "45,6 % des bénéficiaires déclarent être devenues économiquement autonomes · 44,3 % rapportent une augmentation effective de leurs revenus"
  ]'::jsonb,

  -- IMPACT
  'Réduction des inégalités entre hommes et femmes, favorisant l''accès équitable aux ressources, à la formation et aux opportunités économiques dans l''espace francophone',
  '[
    "L''amélioration des revenus permet aux femmes de subvenir partiellement ou totalement aux besoins essentiels de leur foyer : santé, éducation, alimentation",
    "L''amélioration des conditions économiques des femmes se traduit par une meilleure reconnaissance sociale et une place plus affirmée au sein de leur communauté",
    "31 pays francophones engagés · Appel de Kigali adopté · ODD 5 renforcé · Contributions aux mécanismes ONU Femmes et CEDAW",
    "Des collectivités territoriales (Rwanda, Bénin) mettent désormais des terres cultivables à disposition des coopératives de femmes bénéficiaires — ancrage institutionnel durable"
  ]'::jsonb,

  -- ACTIVITÉS STRUCTURANTES
  '[
    {"volume": "1 264",   "action": "Actions de renforcement des capacités (droits, égalité, entrepreneuriat)"},
    {"volume": "9 290",   "action": "Femmes dont les capacités ont été renforcées en droits et égalité"},
    {"volume": "9 475",   "action": "Femmes ayant obtenu un accès direct à une AGR"},
    {"volume": "176",     "action": "Actions de suivi-évaluation (formation, cartographies, missions)"},
    {"volume": "135",     "action": "Actions de communication et de visibilité réalisées"},
    {"volume": "1,4 M+",  "action": "Impressions digitales · 734 788 personnes touchées · engagement 4,53 %"},
    {"volume": "2",       "action": "Activités de plaidoyer de haut niveau (CSW69 New York · CMF Kigali 2025)"}
  ]'::jsonb

) ON CONFLICT (projet_id) DO UPDATE SET
  extrants_titre              = EXCLUDED.extrants_titre,
  extrants_items              = EXCLUDED.extrants_items,
  effets_immediats_titre      = EXCLUDED.effets_immediats_titre,
  effets_immediats_items      = EXCLUDED.effets_immediats_items,
  effets_intermediaires_titre = EXCLUDED.effets_intermediaires_titre,
  effets_intermediaires_items = EXCLUDED.effets_intermediaires_items,
  impact_titre                = EXCLUDED.impact_titre,
  impact_items                = EXCLUDED.impact_items,
  activites_structurantes     = EXCLUDED.activites_structurantes,
  updated_at                  = now();

COMMENT ON TABLE chaine_resultats IS 'Chaîne de résultats CAD-OCDE par projet CREXE (Extrants → Effets immédiats → Effets intermédiaires → Impact)';
