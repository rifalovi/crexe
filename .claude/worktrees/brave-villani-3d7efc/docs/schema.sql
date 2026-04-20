-- =====================================================================
-- CREXE — Schéma de base de données PostgreSQL / Supabase
-- Version 1.0 — À exécuter dans le SQL Editor Supabase
-- =====================================================================

-- Extensions requises
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- =====================================================================
-- 1. PROGRAMMES STRATÉGIQUES
-- =====================================================================
create table if not exists programmes_strategiques (
  id text primary key,                          -- ex: "PS2"
  nom text not null,                            -- ex: "Éducation, formation, enseignement supérieur"
  description text,
  ordre integer,                                -- pour tri d'affichage
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================================
-- 2. PROJETS
-- =====================================================================
create table if not exists projets (
  id text primary key,                          -- ex: "P14"
  ps_id text references programmes_strategiques(id),
  nom text not null,                            -- ex: "La Francophonie avec Elles"
  accroche text,                                -- ex: "D'une femme à toute une société"
  description text,                             -- narratif court
  annee_exercice integer not null default 2025,

  -- Budgets
  budget_modifie numeric,                       -- ex: 2915200
  budget_engage numeric,                        -- ex: 2872348
  engagement_global numeric,                    -- ex: 4345000
  taux_execution numeric,                       -- ex: 99

  -- Couverture
  nombre_pays integer,                          -- ex: 31
  nombre_projets_deposes integer,               -- ex: 1561
  nombre_projets_retenus integer,               -- ex: 54

  -- Métadonnées
  thematiques text[],                           -- ex: ["egalite", "entrepreneuriat"]
  mots_cles text[],
  date_debut date,
  date_fin date,

  -- Cercles d'impact (contenu JSON structuré pour le visuel)
  cercles_impact jsonb,
  -- Structure attendue :
  -- {
  --   "coeur":   {"valeur": "4,3 M€", "label": "Investissement"},
  --   "niveau1": {"valeur": "9 475 femmes", "label": "Bénéficiaires directes", "type_preuve": "mesure"},
  --   "niveau2": {"valeur": "~47 000 personnes", "label": "Familles transformées", "type_preuve": "estimation", "hypothese": "5 pers/foyer"},
  --   "niveau3": {"label": "Communautés mobilisées", "description": "...", "type_preuve": "observation"},
  --   "niveau4": {"label": "Espace francophone", "description": "...", "type_preuve": "institutionnel"}
  -- }

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_projets_ps on projets(ps_id);
create index idx_projets_annee on projets(annee_exercice);
create index idx_projets_thematiques on projets using gin(thematiques);

-- =====================================================================
-- 3. INDICATEURS
-- =====================================================================
create table if not exists indicateurs (
  id uuid primary key default uuid_generate_v4(),
  projet_id text references projets(id) on delete cascade,

  libelle text not null,                        -- ex: "Femmes ayant obtenu accès à une AGR"
  valeur_numerique numeric,                     -- ex: 9475
  valeur_pourcentage numeric,                   -- ex: 66.0
  valeur_texte text,                            -- pour valeurs non chiffrées
  unite text,                                   -- ex: "femmes", "%", "€"

  categorie text,                               -- "satisfaction" | "insertion_economique" | "droits" | ...
  type_preuve text check (type_preuve in ('mesure', 'estimation', 'observation', 'institutionnel')),

  source text,                                  -- ex: "Enquête de satisfaction bénéficiaires 2025"
  source_url text,
  date_mesure date,
  hypothese_calcul text,                        -- si type_preuve = 'estimation'

  mise_en_avant boolean default false,          -- indicateur phare à afficher en KPI

  ordre integer default 0,
  created_at timestamptz default now()
);

create index idx_indicateurs_projet on indicateurs(projet_id);
create index idx_indicateurs_categorie on indicateurs(categorie);

-- =====================================================================
-- 4. TÉMOIGNAGES
-- =====================================================================
create table if not exists temoignages (
  id uuid primary key default uuid_generate_v4(),
  projet_id text references projets(id) on delete cascade,

  citation text not null,
  auteur text,                                  -- nom ou "Bénéficiaire anonyme"
  fonction text,
  pays text,

  source text,                                  -- ex: "Reportage RFI Afrique, 8 mars 2025"
  source_url text,
  type_media text check (type_media in ('video', 'article', 'rapport', 'interview', 'autre')),

  mise_en_avant boolean default false,
  created_at timestamptz default now()
);

create index idx_temoignages_projet on temoignages(projet_id);

-- =====================================================================
-- 5. PAYS ET COUVERTURE
-- =====================================================================
create table if not exists pays (
  code_iso3 text primary key,                   -- ex: "BEN"
  nom_fr text not null,                         -- ex: "Bénin"
  nom_en text,
  region text,                                  -- "Afrique de l'Ouest", "Europe centrale"...
  latitude numeric,
  longitude numeric,
  est_francophone boolean default true
);

create table if not exists pays_couverture (
  id uuid primary key default uuid_generate_v4(),
  projet_id text references projets(id) on delete cascade,
  pays_code text references pays(code_iso3),
  role text,                                    -- "pays_bénéficiaire", "pays_nouvel_entrant"...
  annee integer,
  created_at timestamptz default now(),
  unique(projet_id, pays_code, annee)
);

create index idx_pays_couv_projet on pays_couverture(projet_id);
create index idx_pays_couv_pays on pays_couverture(pays_code);

-- =====================================================================
-- 6. DOCUMENTS RAG (embeddings pour chatbot)
-- =====================================================================
create table if not exists documents_rag (
  id uuid primary key default uuid_generate_v4(),
  projet_id text references projets(id) on delete cascade,

  contenu text not null,                        -- le chunk de texte
  type_contenu text,                            -- "narratif" | "indicateur" | "temoignage" | "partenariat"
  section text,                                 -- ex: "Réalisations 2025", "Effets observés"

  source_document text,                         -- ex: "CREXE_2025.pdf"
  source_page integer,                          -- si PDF

  tokens_count integer,
  embedding vector(1536),                       -- ajuster selon modèle (Voyage: 1024, OpenAI small: 1536)

  created_at timestamptz default now()
);

create index idx_docs_rag_projet on documents_rag(projet_id);
create index idx_docs_rag_embedding on documents_rag using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- =====================================================================
-- FONCTIONS DE RECHERCHE SÉMANTIQUE (appelées par l'API /api/search)
-- =====================================================================
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 8,
  filter_projet_id text default null
)
returns table (
  id uuid,
  projet_id text,
  contenu text,
  type_contenu text,
  section text,
  source_document text,
  source_page integer,
  similarity float
)
language sql stable
as $$
  select
    d.id,
    d.projet_id,
    d.contenu,
    d.type_contenu,
    d.section,
    d.source_document,
    d.source_page,
    1 - (d.embedding <=> query_embedding) as similarity
  from documents_rag d
  where (filter_projet_id is null or d.projet_id = filter_projet_id)
    and 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- =====================================================================
-- VUES UTILITAIRES
-- =====================================================================

-- Vue : statistiques globales pour la landing page
create or replace view v_stats_globales as
select
  count(distinct p.id) as nombre_projets,
  count(distinct pc.pays_code) as nombre_pays,
  sum(p.budget_engage) as budget_total_engage,
  sum((select valeur_numerique from indicateurs i
       where i.projet_id = p.id and i.categorie = 'insertion_economique'
       limit 1)) as total_beneficiaires_economiques
from projets p
left join pays_couverture pc on pc.projet_id = p.id
where p.annee_exercice = 2025;

-- =====================================================================
-- ROW LEVEL SECURITY (lecture publique, écriture service_role uniquement)
-- =====================================================================
alter table programmes_strategiques enable row level security;
alter table projets enable row level security;
alter table indicateurs enable row level security;
alter table temoignages enable row level security;
alter table pays enable row level security;
alter table pays_couverture enable row level security;
alter table documents_rag enable row level security;

-- Lecture publique pour toutes les tables
create policy "Lecture publique" on programmes_strategiques for select using (true);
create policy "Lecture publique" on projets for select using (true);
create policy "Lecture publique" on indicateurs for select using (true);
create policy "Lecture publique" on temoignages for select using (true);
create policy "Lecture publique" on pays for select using (true);
create policy "Lecture publique" on pays_couverture for select using (true);
create policy "Lecture publique" on documents_rag for select using (true);

-- Écriture réservée au service_role (via .env côté serveur uniquement)
-- Pas de policy pour insert/update/delete = bloqué pour anon par défaut

-- =====================================================================
-- TRIGGERS DE MISE À JOUR AUTOMATIQUE
-- =====================================================================
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_timestamp_projets
  before update on projets
  for each row execute function trigger_set_timestamp();

create trigger set_timestamp_ps
  before update on programmes_strategiques
  for each row execute function trigger_set_timestamp();

-- =====================================================================
-- SEED INITIAL : PROGRAMMES STRATÉGIQUES OIF (à ajuster selon le CREXE)
-- =====================================================================
insert into programmes_strategiques (id, nom, ordre) values
  ('PS1', 'Langue française, diversité culturelle et linguistique', 1),
  ('PS2', 'Éducation, formation, enseignement supérieur et recherche', 2),
  ('PS3', 'Égalité femmes-hommes, droits et libertés', 3),
  ('PS4', 'Développement économique durable, numérique et environnement', 4)
on conflict (id) do nothing;

-- =====================================================================
-- FIN DU SCHÉMA
-- =====================================================================
