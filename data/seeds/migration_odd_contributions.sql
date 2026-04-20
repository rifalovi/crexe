-- ─── Migration : odd_contributions ───────────────────────────────────────────
-- Table de correspondance entre les projets OIF et les cibles ODD (Agenda 2030).
-- Données extraites de : "Note d'analyse liens entre indicateurs-projets OIF
-- et cibles ODD 2025" — Service de la conception et du suivi des projets
-- Date de référence : 10 mars 2026
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Tables de référence ODD ───────────────────────────────────────────────

-- Objectifs de développement durable (17 ODD)
CREATE TABLE IF NOT EXISTS odd_objectifs (
  numero          INTEGER     PRIMARY KEY CHECK (numero BETWEEN 1 AND 17),
  libelle         TEXT        NOT NULL,    -- libellé officiel court
  libelle_long    TEXT        DEFAULT '',  -- libellé complet ONU
  couleur_hex     TEXT        DEFAULT '#000000',  -- couleur officielle ODD
  icone_url       TEXT        DEFAULT ''   -- URL icône officielle (optionnel)
);

-- Cibles ODD (169 cibles au total)
CREATE TABLE IF NOT EXISTS odd_cibles (
  id              SERIAL      PRIMARY KEY,
  odd_numero      INTEGER     NOT NULL REFERENCES odd_objectifs(numero),
  code_cible      TEXT        NOT NULL UNIQUE,  -- ex: '4.3', '8.5', '13.3'
  libelle         TEXT        NOT NULL
);

-- ─── 2. Table des contributions projet × cible ODD ────────────────────────────
CREATE TABLE IF NOT EXISTS odd_contributions (
  id                SERIAL      PRIMARY KEY,
  projet_id         TEXT        NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  edition_annee     INTEGER     NOT NULL DEFAULT 2025 REFERENCES crex_editions(annee),
  odd_numero        INTEGER     NOT NULL REFERENCES odd_objectifs(numero),
  cible_codes       TEXT[]      DEFAULT '{}',   -- codes des cibles concernées ex: '{8.3, 8.5}'
  texte_contribution TEXT       NOT NULL DEFAULT '',  -- paragraphe analytique
  niveau_contribution TEXT     NOT NULL DEFAULT 'direct'
                    CHECK (niveau_contribution IN ('direct', 'indirect', 'potentiel')),
  ordre             INTEGER     NOT NULL DEFAULT 1,  -- ordre d'affichage pour ce projet
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_odd_contributions_projet   ON odd_contributions(projet_id);
CREATE INDEX IF NOT EXISTS idx_odd_contributions_edition  ON odd_contributions(edition_annee);
CREATE INDEX IF NOT EXISTS idx_odd_contributions_odd      ON odd_contributions(odd_numero);

-- RLS
ALTER TABLE odd_objectifs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE odd_cibles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE odd_contributions ENABLE ROW LEVEL SECURITY;

-- Lecture publique des référentiels ODD
CREATE POLICY "odd_objectifs_public_read"  ON odd_objectifs  FOR SELECT USING (true);
CREATE POLICY "odd_cibles_public_read"      ON odd_cibles      FOR SELECT USING (true);

-- Lecture publique des contributions pour les projets publiés
CREATE POLICY "odd_contributions_public_read" ON odd_contributions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projets p
      WHERE p.id = odd_contributions.projet_id
        AND p.statut = 'publie'
    )
  );

-- Écriture : admin ou éditeur du projet
CREATE POLICY "odd_contributions_edit" ON odd_contributions
  FOR ALL
  USING    (is_admin() OR can_edit_projet(projet_id))
  WITH CHECK (is_admin() OR can_edit_projet(projet_id));

-- Écriture référentiels : admin uniquement
CREATE POLICY "odd_objectifs_admin_write" ON odd_objectifs
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "odd_cibles_admin_write" ON odd_cibles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_odd_contributions_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_odd_contributions_updated_at ON odd_contributions;
CREATE TRIGGER trg_odd_contributions_updated_at
  BEFORE UPDATE ON odd_contributions
  FOR EACH ROW EXECUTE FUNCTION update_odd_contributions_updated_at();

-- ─── 3. Seed — 17 ODD avec couleurs officielles ───────────────────────────────
INSERT INTO odd_objectifs (numero, libelle, libelle_long, couleur_hex) VALUES
  (1,  'Pas de pauvreté',          'Éliminer la pauvreté sous toutes ses formes',                              '#E5243B'),
  (2,  'Faim zéro',                'Éliminer la faim, améliorer la nutrition et l''agriculture durable',       '#DDA63A'),
  (3,  'Bonne santé',              'Permettre à tous de vivre en bonne santé',                                 '#4C9F38'),
  (4,  'Éducation de qualité',     'Garantir un enseignement de qualité, équitable et inclusif',               '#C5192D'),
  (5,  'Égalité des sexes',        'Parvenir à l''égalité des sexes et autonomiser les femmes',                '#FF3A21'),
  (6,  'Eau propre et assainissement', 'Garantir l''accès à l''eau potable et l''assainissement',             '#26BDE2'),
  (7,  'Énergie propre',           'Garantir l''accès à des énergies durables',                               '#FCC30B'),
  (8,  'Travail décent',           'Promouvoir une croissance économique inclusive et le travail décent',      '#A21942'),
  (9,  'Innovation et infrastructure', 'Bâtir une infrastructure résiliente et promouvoir l''innovation',     '#FD6925'),
  (10, 'Inégalités réduites',      'Réduire les inégalités dans les pays et d''un pays à l''autre',           '#DD1367'),
  (11, 'Villes durables',          'Rendre les villes et établissements humains inclusifs et durables',        '#FD9D24'),
  (12, 'Consommation responsable', 'Établir des modes de consommation et de production durables',             '#BF8B2E'),
  (13, 'Lutte contre le climat',   'Prendre d''urgence des mesures pour lutter contre les changements climatiques', '#3F7E44'),
  (14, 'Vie aquatique',            'Conserver et exploiter de manière durable les océans',                    '#0A97D9'),
  (15, 'Vie terrestre',            'Préserver et restaurer les écosystèmes terrestres',                       '#56C02B'),
  (16, 'Paix, justice et institutions', 'Promouvoir l''avènement de sociétés pacifiques',                    '#00689D'),
  (17, 'Partenariats pour les objectifs', 'Renforcer les moyens de mettre en œuvre le Partenariat mondial', '#19486A')
ON CONFLICT (numero) DO NOTHING;

-- ─── 4. Seed — Cibles ODD utilisées dans les projets PS3 ─────────────────────
INSERT INTO odd_cibles (odd_numero, code_cible, libelle) VALUES
  -- ODD 1 - Pas de pauvreté
  (1,  '1.2',  'Réduire de moitié la proportion d''hommes, de femmes et d''enfants de tous âges vivant dans la pauvreté'),
  (1,  '1.4',  'Garantir que tous les hommes et femmes ont accès aux ressources économiques et aux services de base'),
  (1,  '1.5',  'Renforcer la résilience des pauvres et des personnes en situation vulnérable'),
  -- ODD 2 - Faim zéro
  (2,  '2.3',  'Doubler la productivité agricole et les revenus des petits producteurs alimentaires'),
  (2,  '2.4',  'Garantir la viabilité des systèmes de production alimentaire et mettre en œuvre des pratiques agricoles résilientes'),
  -- ODD 4 - Éducation de qualité
  (4,  '4.3',  'Garantir l''accès universel à un enseignement technique et professionnel de qualité'),
  (4,  '4.4',  'Augmenter la proportion de jeunes et d''adultes disposant de compétences pour l''emploi'),
  (4,  '4.5',  'Éliminer les inégalités entre les sexes dans le domaine de l''éducation'),
  (4,  '4.7',  'Faire en sorte que tous les élèves acquièrent les connaissances nécessaires pour promouvoir le développement durable'),
  -- ODD 5 - Égalité des sexes
  (5,  '5.a',  'Entreprendre des réformes visant à donner aux femmes les mêmes droits aux ressources économiques'),
  (5,  '5.b',  'Renforcer l''utilisation des technologies pour l''autonomisation des femmes'),
  (5,  '5.5',  'Garantir la participation entière et effective des femmes aux postes de direction'),
  -- ODD 8 - Travail décent
  (8,  '8.3',  'Promouvoir des politiques axées sur le développement qui soutiennent les activités productives et l''entrepreneuriat'),
  (8,  '8.5',  'Parvenir au plein emploi productif et garantir un travail décent pour tous'),
  (8,  '8.9',  'Élaborer et mettre en œuvre des politiques visant à développer un tourisme durable créateur d''emplois'),
  -- ODD 9 - Innovation
  (9,  '9.5',  'Renforcer la recherche scientifique et l''innovation technologique'),
  -- ODD 12 - Consommation responsable
  (12, '12.2', 'Parvenir à une gestion durable et une utilisation rationnelle des ressources naturelles'),
  (12, '12.b', 'Développer des outils pour contrôler les effets du tourisme durable sur l''économie'),
  -- ODD 13 - Lutte contre le climat
  (13, '13.1', 'Renforcer, dans tous les pays, la résilience et les capacités d''adaptation aux risques climatiques'),
  (13, '13.3', 'Améliorer l''éducation, la sensibilisation et les capacités institutionnelles relatives aux changements climatiques'),
  (13, '13.b', 'Promouvoir des mécanismes de renforcement des capacités pour les pays moins avancés'),
  -- ODD 15 - Vie terrestre
  (15, '15.3', 'D''ici à 2030, lutter contre la désertification, restaurer les terres et sols dégradés'),
  (15, '15.9', 'D''ici à 2020, intégrer la protection des écosystèmes dans les plans nationaux'),
  -- ODD 17 - Partenariats
  (17, '17.9', 'Renforcer le soutien à la mise en œuvre de programmes de renforcement des capacités dans les pays en développement'),
  (17, '17.16','Renforcer le partenariat mondial pour le développement durable')
ON CONFLICT (code_cible) DO NOTHING;

-- ─── 5. Seed — Contributions ODD pour les projets PS3 ────────────────────────
-- Source : "Note d'analyse liens entre indicateurs-projets OIF et cibles ODD 2025"
-- Projets PS3 : PROJ_A14, PROJ_A15, PROJ_A16a, PROJ_A16b, PROJ_A17, PROJ_A18, PROJ_A19, PROJ_A20
-- Note : les project_id correspondent aux codes dans la table projets

-- PROJ_A14 — Francophonie avec Elles (4 cibles ODD)
INSERT INTO odd_contributions (projet_id, edition_annee, odd_numero, cible_codes, texte_contribution, niveau_contribution, ordre) VALUES
  ('PROJ_A14', 2025, 5,  ARRAY['5.a'],
   'Le projet a renforcé les capacités de 19 927 femmes en matière de droits à l''égalité et d''opportunités entrepreneuriales, contribuant à l''atteinte de la cible 5.a de l''ODD 5 relative à l''accès des femmes aux ressources économiques.',
   'direct', 1),
  ('PROJ_A14', 2025, 4,  ARRAY['4.3'],
   '6 572 femmes ont bénéficié de formations techniques et professionnelles dans des secteurs variés (couture, coiffure, agriculture), garantissant un accès équitable à des compétences qualifiantes et favorisant l''atteinte de la cible 4.3.',
   'direct', 2),
  ('PROJ_A14', 2025, 8,  ARRAY['8.3', '8.5'],
   '14 332 femmes ont accédé à une activité génératrice de revenus grâce au soutien aux initiatives locales et à l''entrepreneuriat. Cette dynamique favorise l''innovation, la création d''emplois décents et l''intégration des femmes dans des circuits économiques formels.',
   'direct', 3),
  ('PROJ_A14', 2025, 10, ARRAY['10.2'],
   'En ciblant les femmes des pays francophones les moins avancés, le projet contribue à la réduction des inégalités économiques et sociales entre les genres et entre les communautés.',
   'indirect', 4)
ON CONFLICT DO NOTHING;

-- PROJ_A15 — Innovations et plaidoyers francophones (1 cible ODD)
INSERT INTO odd_contributions (projet_id, edition_annee, odd_numero, cible_codes, texte_contribution, niveau_contribution, ordre) VALUES
  ('PROJ_A15', 2025, 17, ARRAY['17.9'],
   'Le projet contribue à la cible 17.9 relative au renforcement des capacités dans les pays en développement. En 2025, 139 associations ont bénéficié d''actions de renforcement des capacités, 1 143 organisations de jeunes, de femmes et de la société civile ont été mobilisées, et 620 personnes ont bénéficié directement des dispositifs d''accompagnement et d''innovation.',
   'direct', 1)
ON CONFLICT DO NOTHING;

-- PROJ_A16a — D-CLIC : formez-vous au numérique (3 cibles ODD 4)
INSERT INTO odd_contributions (projet_id, edition_annee, odd_numero, cible_codes, texte_contribution, niveau_contribution, ordre) VALUES
  ('PROJ_A16a', 2025, 4, ARRAY['4.3', '4.4', '4.5'],
   '3 573 jeunes et femmes ont suivi des formations intensives en présentiel (cible 4.3). 37 formations spécifiques aux métiers du numérique ont été déployées (cible 4.4.1). Le projet s''attaque aux inégalités d''accès aux compétences numériques (cible 4.5) avec 16 585 jeunes et femmes inscrits sur la plateforme numérique en ligne.',
   'direct', 1)
ON CONFLICT DO NOTHING;

-- PROJ_A16b — D-CLIC : Gouvernance Numérique (2 cibles ODD)
INSERT INTO odd_contributions (projet_id, edition_annee, odd_numero, cible_codes, texte_contribution, niveau_contribution, ordre) VALUES
  ('PROJ_A16b', 2025, 17, ARRAY['17.9'],
   '585 fonctionnaires, diplomates et parlementaires francophones ont bénéficié de programmes de renforcement de capacités sur les enjeux stratégiques du numérique, contribuant au renforcement des cadres institutionnels nécessaires à la transformation technologique.',
   'direct', 1),
  ('PROJ_A16b', 2025, 8,  ARRAY['8.3'],
   'En structurant la gouvernance du secteur numérique, le projet crée un environnement propice au développement des activités productives et à la croissance des micro, petites et moyennes entreprises dans l''espace francophone.',
   'direct', 2)
ON CONFLICT DO NOTHING;

-- PROJ_A17 — Promotion des échanges économiques et commerciaux (2 cibles ODD)
INSERT INTO odd_contributions (projet_id, edition_annee, odd_numero, cible_codes, texte_contribution, niveau_contribution, ordre) VALUES
  ('PROJ_A17', 2025, 8,  ARRAY['8.3'],
   '2 missions économiques et commerciales ont mobilisé 912 entreprises. 31 actions de sensibilisation, plaidoyer et concertation ont bénéficié à 521 acteurs publics et privés, favorisant les politiques de promotion de l''entrepreneuriat et la croissance des entreprises francophones.',
   'direct', 1),
  ('PROJ_A17', 2025, 17, ARRAY['17.9'],
   'Le projet soutient le renforcement des capacités des acteurs économiques francophones en facilitant les échanges et en structurant des réseaux économiques propices à des partenariats économiques durables.',
   'direct', 2)
ON CONFLICT DO NOTHING;

-- PROJ_A18 — Accompagnement des transformations structurelles (4 cibles ODD)
INSERT INTO odd_contributions (projet_id, edition_annee, odd_numero, cible_codes, texte_contribution, niveau_contribution, ordre) VALUES
  ('PROJ_A18', 2025, 13, ARRAY['13.3'],
   '3 954 décideurs publics ont été formés sur les enjeux du climat, de la biodiversité et de la désertification. 7 outils ont été développés pour renforcer les capacités dans le montage de dossiers bancables en matière climatique.',
   'direct', 1),
  ('PROJ_A18', 2025, 15, ARRAY['15.3', '15.9'],
   '24 pays ont bénéficié d''un accompagnement pour la mise à jour de leurs politiques environnementales dans le cadre des engagements internationaux relatifs à la biodiversité et à la lutte contre la désertification.',
   'direct', 2),
  ('PROJ_A18', 2025, 17, ARRAY['17.9'],
   'Le projet renforce les capacités institutionnelles des États membres pour la mise en œuvre de leurs engagements environnementaux et facilite l''accès des pays francophones aux financements climatiques internationaux.',
   'direct', 3)
ON CONFLICT DO NOTHING;

-- PROJ_A19 — Soutien aux initiatives environnementales Bassin du Congo (11 cibles ODD)
INSERT INTO odd_contributions (projet_id, edition_annee, odd_numero, cible_codes, texte_contribution, niveau_contribution, ordre) VALUES
  ('PROJ_A19', 2025, 13, ARRAY['13.1', '13.3', '13.b'],
   '274 solutions climatiques ont été mises en œuvre, 171 jeunes innovateurs appuyés, 314 institutions accompagnées. 11 811 jeunes ont été formés à des approches résilientes face au changement climatique et 341 jeunes accompagnés dans la mise en application de leurs connaissances.',
   'direct', 1),
  ('PROJ_A19', 2025, 1,  ARRAY['1.2', '1.4', '1.5'],
   '6 357 opportunités climato-économiques ont été soutenues en faveur des jeunes et des femmes, favorisant la sortie de la pauvreté et le renforcement de la résilience des populations vulnérables.',
   'direct', 2),
  ('PROJ_A19', 2025, 2,  ARRAY['2.3', '2.4'],
   'Le projet soutient des initiatives innovantes de production et consommation de denrées durables dans le Bassin du Congo, contribuant à la productivité agricole et à l''agriculture durable.',
   'direct', 3),
  ('PROJ_A19', 2025, 5,  ARRAY['5.5'],
   'Les initiatives soutenues intègrent systématiquement les femmes comme actrices du développement durable, renforçant leur autonomisation économique dans les dynamiques d''innovation verte.',
   'direct', 4),
  ('PROJ_A19', 2025, 12, ARRAY['12.2'],
   'Le soutien aux initiatives d''innovation verte dans le Bassin du Congo favorise une gestion durable des ressources naturelles dans l''un des écosystèmes forestiers les plus importants au monde.',
   'direct', 5)
ON CONFLICT DO NOTHING;

-- PROJ_A20 — Promotion du tourisme durable (6 cibles ODD)
INSERT INTO odd_contributions (projet_id, edition_annee, odd_numero, cible_codes, texte_contribution, niveau_contribution, ordre) VALUES
  ('PROJ_A20', 2025, 8,  ARRAY['8.9'],
   '8 275 jeunes (dont 30 % de femmes) ont été formés aux métiers du tourisme durable. 30 centres de formation professionnelle ont été accompagnés. 16 projets structurants de circuits touristiques ont été co-financés, créant des opportunités d''emplois durables.',
   'direct', 1),
  ('PROJ_A20', 2025, 4,  ARRAY['4.4'],
   '2 sessions de formation ont été organisées, 53 outils développés pour promouvoir le tourisme durable, renforçant les compétences professionnelles des jeunes pour l''économie touristique.',
   'direct', 2),
  ('PROJ_A20', 2025, 13, ARRAY['13.3'],
   'La structuration d''offres touristiques durables contribue à la sensibilisation et au renforcement des capacités face aux enjeux climatiques, en intégrant les principes du développement durable dans la formation aux métiers du tourisme.',
   'direct', 3),
  ('PROJ_A20', 2025, 12, ARRAY['12.b'],
   '53 outils ont été développés pour le suivi et la promotion du tourisme durable, permettant de mesurer et documenter les effets économiques et environnementaux du secteur touristique.',
   'direct', 4),
  ('PROJ_A20', 2025, 1,  ARRAY['1.4'],
   'En favorisant la création d''emplois et la valorisation des patrimoines culturels et naturels, le projet améliore l''accès aux ressources économiques pour les populations des communautés locales.',
   'direct', 5)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE odd_contributions   IS 'Contribution des projets OIF aux cibles ODD (Agenda 2030), par édition CREX';
COMMENT ON TABLE odd_objectifs       IS '17 Objectifs de développement durable (ODD) — référentiel ONU';
COMMENT ON TABLE odd_cibles          IS '169 cibles ODD — sous-ensemble utilisé dans les projets OIF';
