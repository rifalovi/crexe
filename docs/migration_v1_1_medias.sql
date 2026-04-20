-- =====================================================================
-- MIGRATION v1.1 — Ajout des médias, partenariats et événements
-- À exécuter dans le SQL Editor Supabase après schema.sql
-- =====================================================================

-- 1. PHOTOS sur les témoignages
alter table temoignages 
  add column if not exists photo_url text,          -- URL Supabase Storage
  add column if not exists legende_photo text;      -- texte alternatif accessible

-- 2. IMAGES sur les projets
alter table projets
  add column if not exists photo_principale_url text,  -- image de couverture
  add column if not exists legende_photo text;

-- 3. TABLE PARTENARIATS (nouvelle)
create table if not exists partenariats (
  id uuid primary key default uuid_generate_v4(),
  projet_id text references projets(id) on delete cascade,
  nom text not null,                        -- ex : "Développement international Desjardins"
  acronyme text,                            -- ex : "DID"
  type text check (type in (
    'technique', 'financier', 'institutionnel', 'operationnel', 'autre'
  )),
  description text,
  logo_url text,                            -- logo du partenaire si disponible
  site_url text,
  ordre integer default 0,
  created_at timestamptz default now()
);

create index idx_partenariats_projet on partenariats(projet_id);

-- RLS : lecture publique
alter table partenariats enable row level security;
create policy "Lecture publique" on partenariats for select using (true);

-- 4. TABLE ÉVÉNEMENTS MARQUANTS (nouvelle)
create table if not exists evenements (
  id uuid primary key default uuid_generate_v4(),
  projet_id text references projets(id) on delete cascade,
  titre text not null,
  description text,
  date_evenement date,
  lieu text,
  type text check (type in (
    'conference', 'mission', 'lancement', 'publication', 'partenariat', 'autre'
  )),
  lien_url text,
  ordre integer default 0,
  created_at timestamptz default now()
);

create index idx_evenements_projet on evenements(projet_id);
create index idx_evenements_date on evenements(date_evenement);

-- RLS : lecture publique
alter table evenements enable row level security;
create policy "Lecture publique" on evenements for select using (true);

-- 5. TABLE GALERIE MÉDIAS (photos multiples par projet)
create table if not exists medias (
  id uuid primary key default uuid_generate_v4(),
  projet_id text references projets(id) on delete cascade,
  url text not null,                        -- URL Supabase Storage
  type text check (type in ('photo', 'video', 'infographie', 'document')),
  legende text,
  credit text,                              -- photographe / source
  est_couverture boolean default false,     -- image principale du projet
  ordre integer default 0,
  created_at timestamptz default now()
);

create index idx_medias_projet on medias(projet_id);

-- RLS : lecture publique
alter table medias enable row level security;
create policy "Lecture publique" on medias for select using (true);

-- =====================================================================
-- VÉRIFICATION
-- =====================================================================
select 
  'partenariats' as table_name, count(*) as lignes from partenariats
union all select 'evenements', count(*) from evenements
union all select 'medias', count(*) from medias;
