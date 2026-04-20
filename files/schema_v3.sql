-- =====================================================================
-- CREXE — Schéma de base de données v3 (FINAL)
-- Version 3.0 — À exécuter dans le SQL Editor Supabase
-- ---------------------------------------------------------------------
-- CHOIX D'ARCHITECTURE VALIDÉS :
-- ✅ Front-end PUBLIC (lecture anonyme des projets publiés)
-- ✅ INSCRIPTION LIBRE (tout le monde peut créer un compte Lecteur)
-- ✅ ÉDITEUR PAR PROJET (assignation individuelle, pas par PS)
-- =====================================================================

-- Extensions requises
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- =====================================================================
-- 0. GESTION DES RÔLES ET UTILISATEURS
-- =====================================================================

do $$ begin
  create type role_utilisateur as enum ('admin', 'editeur', 'lecteur');
exception
  when duplicate_object then null;
end $$;

-- Table des profils (étend auth.users de Supabase)
create table if not exists profils (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nom_complet text,
  role role_utilisateur not null default 'lecteur',

  -- Badge de vérification OIF (réservé aux admins/éditeurs)
  compte_verifie_oif boolean default false,

  -- Méta
  organisation text,
  poste text,
  actif boolean default true,
  date_derniere_connexion timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_profils_role on profils(role);
create index idx_profils_email on profils(email);

-- =====================================================================
-- Table d'ASSIGNATION des éditeurs aux projets
-- (relation N-N : un éditeur peut avoir plusieurs projets,
--  un projet peut avoir plusieurs éditeurs)
-- =====================================================================
create table if not exists assignations_editeur (
  id uuid primary key default uuid_generate_v4(),
  editeur_id uuid references auth.users(id) on delete cascade not null,
  projet_id text not null,  -- FK vers projets ajoutée après création de la table
  assigne_par uuid references auth.users(id) not null,

  -- Permissions fines (par défaut, peut tout faire sur le projet)
  peut_editer_indicateurs boolean default true,
  peut_editer_temoignages boolean default true,
  peut_editer_pays boolean default true,
  peut_soumettre_publication boolean default true,

  notes_assignation text,
  created_at timestamptz default now(),
  unique(editeur_id, projet_id)
);

create index idx_assign_editeur on assignations_editeur(editeur_id);
create index idx_assign_projet on assignations_editeur(projet_id);

-- =====================================================================
-- Table d'invitation éditeur (workflow facultatif)
-- Un admin peut pré-assigner un futur éditeur avant qu'il ne s'inscrive
-- =====================================================================
create table if not exists invitations_editeur (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  projets_a_assigner text[] not null,
  invite_par uuid references auth.users(id) not null,
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  acceptee boolean default false,
  date_expiration timestamptz not null default (now() + interval '14 days'),
  date_acceptation timestamptz,
  created_at timestamptz default now()
);

create index idx_inv_edit_email on invitations_editeur(email);
create index idx_inv_edit_token on invitations_editeur(token);

-- =====================================================================
-- 1. PROGRAMMES STRATÉGIQUES
-- =====================================================================
create table if not exists programmes_strategiques (
  id text primary key,
  code text unique not null,
  nom text not null,
  nom_court text,
  description text,
  couleur_theme text,
  ordre integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================================
-- 2. PROJETS
-- =====================================================================
create table if not exists projets (
  id text primary key,                          -- ex: "PROJ_A14"
  code_officiel text unique not null,
  ps_id text references programmes_strategiques(id) on delete restrict,

  projet_parent_id text references projets(id),
  est_sous_projet boolean default false,

  nom text not null,
  accroche text,
  description text,
  annee_exercice integer not null default 2025,

  budget_modifie numeric,
  budget_engage numeric,
  engagement_global numeric,
  taux_execution numeric,

  nombre_pays integer,
  nombre_projets_deposes integer,
  nombre_projets_retenus integer,

  thematiques text[],
  mots_cles text[],
  date_debut date,
  date_fin date,

  cercles_impact jsonb,

  statut text check (statut in ('brouillon', 'en_revue', 'publie', 'archive')) default 'brouillon',
  date_publication timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  cree_par uuid references auth.users(id),
  modifie_par uuid references auth.users(id)
);

-- Ajouter la FK de assignations_editeur vers projets (différée car projets créé après)
alter table assignations_editeur
  drop constraint if exists fk_assign_projet,
  add constraint fk_assign_projet
  foreign key (projet_id) references projets(id) on delete cascade;

create index idx_projets_ps on projets(ps_id);
create index idx_projets_statut on projets(statut);
create index idx_projets_parent on projets(projet_parent_id);
create index idx_projets_thematiques on projets using gin(thematiques);

-- =====================================================================
-- 3. INDICATEURS, TÉMOIGNAGES, PAYS (inchangés)
-- =====================================================================
create table if not exists indicateurs (
  id uuid primary key default uuid_generate_v4(),
  projet_id text references projets(id) on delete cascade,
  libelle text not null,
  valeur_numerique numeric,
  valeur_pourcentage numeric,
  valeur_texte text,
  unite text,
  categorie text,
  type_preuve text check (type_preuve in ('mesure', 'estimation', 'observation', 'institutionnel')),
  source text,
  source_url text,
  date_mesure date,
  hypothese_calcul text,
  mise_en_avant boolean default false,
  ordre integer default 0,
  created_at timestamptz default now(),
  cree_par uuid references auth.users(id)
);
create index idx_indicateurs_projet on indicateurs(projet_id);
create index idx_indicateurs_categorie on indicateurs(categorie);

create table if not exists temoignages (
  id uuid primary key default uuid_generate_v4(),
  projet_id text references projets(id) on delete cascade,
  citation text not null,
  auteur text,
  fonction text,
  pays text,
  source text,
  source_url text,
  type_media text check (type_media in ('video', 'article', 'rapport', 'interview', 'autre')),
  mise_en_avant boolean default false,
  created_at timestamptz default now(),
  cree_par uuid references auth.users(id)
);
create index idx_temoignages_projet on temoignages(projet_id);

create table if not exists pays (
  code_iso3 text primary key,
  nom_fr text not null,
  nom_en text,
  region text,
  latitude numeric,
  longitude numeric,
  est_francophone boolean default true
);

create table if not exists pays_couverture (
  id uuid primary key default uuid_generate_v4(),
  projet_id text references projets(id) on delete cascade,
  pays_code text references pays(code_iso3),
  role text,
  annee integer,
  created_at timestamptz default now(),
  unique(projet_id, pays_code, annee)
);
create index idx_pays_couv_projet on pays_couverture(projet_id);
create index idx_pays_couv_pays on pays_couverture(pays_code);

-- =====================================================================
-- 4. RAG
-- =====================================================================
create table if not exists documents_rag (
  id uuid primary key default uuid_generate_v4(),
  projet_id text references projets(id) on delete cascade,
  contenu text not null,
  type_contenu text,
  section text,
  source_document text,
  source_page integer,
  tokens_count integer,
  embedding vector(1536),
  created_at timestamptz default now()
);
create index idx_docs_rag_projet on documents_rag(projet_id);
create index idx_docs_rag_embedding on documents_rag using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- =====================================================================
-- 5. RATE LIMITING pour le chatbot public
-- =====================================================================
create table if not exists rate_limit_chatbot (
  id uuid primary key default uuid_generate_v4(),
  -- Identifiant : soit user_id (connecté) soit hash d'IP (anonyme)
  identifiant text not null,
  est_authentifie boolean not null,
  nombre_requetes integer default 1,
  fenetre_debut timestamptz default now(),
  unique(identifiant, fenetre_debut)
);
create index idx_rate_limit on rate_limit_chatbot(identifiant, fenetre_debut);

-- =====================================================================
-- 6. JOURNAL D'AUDIT
-- =====================================================================
create table if not exists journal_audit (
  id uuid primary key default uuid_generate_v4(),
  utilisateur_id uuid references auth.users(id),
  utilisateur_email text,
  action text not null,
  table_cible text not null,
  enregistrement_id text,
  valeurs_avant jsonb,
  valeurs_apres jsonb,
  adresse_ip text,
  user_agent text,
  created_at timestamptz default now()
);
create index idx_audit_user on journal_audit(utilisateur_id);
create index idx_audit_table on journal_audit(table_cible);
create index idx_audit_date on journal_audit(created_at desc);

-- =====================================================================
-- FONCTIONS UTILITAIRES
-- =====================================================================

-- Recherche sémantique RAG
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 8,
  filter_projet_id text default null
)
returns table (
  id uuid, projet_id text, contenu text, type_contenu text,
  section text, source_document text, source_page integer, similarity float
)
language sql stable
as $$
  select d.id, d.projet_id, d.contenu, d.type_contenu, d.section,
         d.source_document, d.source_page,
         1 - (d.embedding <=> query_embedding) as similarity
  from documents_rag d
  where (filter_projet_id is null or d.projet_id = filter_projet_id)
    and 1 - (d.embedding <=> query_embedding) > match_threshold
    and exists (select 1 from projets where id = d.projet_id and statut = 'publie')
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- Helpers d'authentification
create or replace function get_my_role()
returns role_utilisateur
language sql stable security definer
as $$
  select coalesce(
    (select role from profils where id = auth.uid() and actif = true),
    'lecteur'::role_utilisateur
  );
$$;

create or replace function is_admin()
returns boolean
language sql stable security definer
as $$
  select coalesce(
    (select role = 'admin' from profils where id = auth.uid() and actif = true),
    false
  );
$$;

-- Vérifier si l'utilisateur est assigné à un projet
create or replace function can_edit_projet(projet_id_param text)
returns boolean
language sql stable security definer
as $$
  select case
    -- Admin : accès total
    when is_admin() then true
    -- Éditeur : doit être explicitement assigné au projet
    else exists (
      select 1 from assignations_editeur
      where editeur_id = auth.uid() and projet_id = projet_id_param
    )
  end;
$$;

-- Créer automatiquement un profil lecteur à l'inscription
create or replace function handle_nouvel_utilisateur()
returns trigger
language plpgsql security definer
as $$
begin
  insert into profils (id, email, nom_complet, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nom_complet', split_part(new.email, '@', 1)),
    'lecteur'  -- INSCRIPTION LIBRE = toujours Lecteur par défaut
  );

  -- Si une invitation éditeur existe pour cet email, traiter l'upgrade
  if exists (
    select 1 from invitations_editeur
    where email = new.email and not acceptee and date_expiration > now()
  ) then
    update profils set role = 'editeur' where id = new.id;

    insert into assignations_editeur (editeur_id, projet_id, assigne_par)
    select
      new.id,
      unnest(projets_a_assigner),
      invite_par
    from invitations_editeur
    where email = new.email and not acceptee
    limit 1;

    update invitations_editeur
    set acceptee = true, date_acceptation = now()
    where email = new.email and not acceptee;
  end if;

  return new;
end;
$$;

drop trigger if exists on_nouvel_utilisateur on auth.users;
create trigger on_nouvel_utilisateur
  after insert on auth.users
  for each row execute function handle_nouvel_utilisateur();

-- =====================================================================
-- ROW LEVEL SECURITY — VERSION v3 (front-end public)
-- =====================================================================

alter table profils enable row level security;
alter table assignations_editeur enable row level security;
alter table invitations_editeur enable row level security;
alter table programmes_strategiques enable row level security;
alter table projets enable row level security;
alter table indicateurs enable row level security;
alter table temoignages enable row level security;
alter table pays enable row level security;
alter table pays_couverture enable row level security;
alter table documents_rag enable row level security;
alter table rate_limit_chatbot enable row level security;
alter table journal_audit enable row level security;

-- ---------------------------------------------------------------
-- PROGRAMMES STRATÉGIQUES : lecture publique
-- ---------------------------------------------------------------
create policy "PS lecture publique" on programmes_strategiques
  for select using (true);  -- ⚠️ PUBLIC
create policy "Admin gère PS" on programmes_strategiques
  for all using (is_admin());

-- ---------------------------------------------------------------
-- PROJETS : LECTURE PUBLIQUE pour projets PUBLIÉS
-- ---------------------------------------------------------------
create policy "Projets publiés lecture publique" on projets
  for select using (statut = 'publie');  -- ⚠️ PUBLIC pour projets publiés

-- Éditeurs voient aussi leurs projets en cours
create policy "Éditeurs voient projets assignés" on projets
  for select using (
    exists (
      select 1 from assignations_editeur
      where editeur_id = auth.uid() and projet_id = projets.id
    )
  );

create policy "Admin voit tous projets" on projets
  for select using (is_admin());

-- Création : admin + éditeurs assignés à ce projet uniquement
create policy "Création projets par admin" on projets
  for insert with check (is_admin());
  -- Note : les éditeurs créent en brouillon via une RPC dédiée

create policy "Modification par éditeurs assignés" on projets
  for update using (can_edit_projet(id));

create policy "Suppression par admin" on projets
  for delete using (is_admin());

-- ---------------------------------------------------------------
-- INDICATEURS : lecture publique si projet publié
-- ---------------------------------------------------------------
create policy "Indicateurs lecture publique si projet publié" on indicateurs
  for select using (
    exists (select 1 from projets where id = indicateurs.projet_id and statut = 'publie')
  );

create policy "Indicateurs visibles aux éditeurs assignés" on indicateurs
  for select using (can_edit_projet(projet_id) or is_admin());

create policy "Indicateurs éditables par éditeurs assignés" on indicateurs
  for all using (can_edit_projet(projet_id));

-- ---------------------------------------------------------------
-- TÉMOIGNAGES : idem indicateurs
-- ---------------------------------------------------------------
create policy "Témoignages lecture publique si projet publié" on temoignages
  for select using (
    exists (select 1 from projets where id = temoignages.projet_id and statut = 'publie')
  );

create policy "Témoignages visibles aux éditeurs assignés" on temoignages
  for select using (can_edit_projet(projet_id) or is_admin());

create policy "Témoignages éditables par éditeurs assignés" on temoignages
  for all using (can_edit_projet(projet_id));

-- ---------------------------------------------------------------
-- PAYS : lecture publique
-- ---------------------------------------------------------------
create policy "Pays lecture publique" on pays for select using (true);
create policy "Admin gère pays" on pays for all using (is_admin());

create policy "Pays_couverture lecture publique si projet publié" on pays_couverture
  for select using (
    exists (select 1 from projets where id = pays_couverture.projet_id and statut = 'publie')
  );
create policy "Pays_couverture gérés par éditeurs assignés" on pays_couverture
  for all using (can_edit_projet(projet_id));

-- ---------------------------------------------------------------
-- RAG : accessible aux anonymes pour le chatbot public
-- ---------------------------------------------------------------
create policy "RAG lecture publique si projet publié" on documents_rag
  for select using (
    exists (select 1 from projets where id = documents_rag.projet_id and statut = 'publie')
  );
create policy "RAG géré par admin" on documents_rag
  for all using (is_admin());

-- ---------------------------------------------------------------
-- RATE LIMIT : pas de politique lecture (géré en Server Actions)
-- ---------------------------------------------------------------
-- (laisser vide : accès via service_role uniquement)

-- ---------------------------------------------------------------
-- PROFILS
-- ---------------------------------------------------------------
create policy "Voir son propre profil" on profils
  for select using (auth.uid() = id);
create policy "Admin voit tous profils" on profils
  for select using (is_admin());
create policy "Modifier son profil" on profils
  for update using (auth.uid() = id);
create policy "Admin modifie profils" on profils
  for update using (is_admin());

-- ---------------------------------------------------------------
-- ASSIGNATIONS : admin seulement
-- ---------------------------------------------------------------
create policy "Admin gère assignations" on assignations_editeur
  for all using (is_admin());

create policy "Éditeur voit ses assignations" on assignations_editeur
  for select using (auth.uid() = editeur_id);

-- ---------------------------------------------------------------
-- INVITATIONS ÉDITEUR : admin seulement
-- ---------------------------------------------------------------
create policy "Admin gère invitations éditeur" on invitations_editeur
  for all using (is_admin());

-- ---------------------------------------------------------------
-- AUDIT
-- ---------------------------------------------------------------
create policy "Admin consulte audit" on journal_audit
  for select using (is_admin());

-- =====================================================================
-- TRIGGERS D'AUDIT
-- =====================================================================
create or replace function log_audit()
returns trigger
language plpgsql security definer
as $$
declare
  current_user_email text;
begin
  select email into current_user_email from auth.users where id = auth.uid();
  insert into journal_audit (
    utilisateur_id, utilisateur_email, action, table_cible,
    enregistrement_id, valeurs_avant, valeurs_apres
  )
  values (
    auth.uid(), current_user_email, tg_op, tg_table_name,
    coalesce(new.id::text, old.id::text),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

create trigger audit_projets after insert or update or delete on projets
  for each row execute function log_audit();
create trigger audit_indicateurs after insert or update or delete on indicateurs
  for each row execute function log_audit();
create trigger audit_temoignages after insert or update or delete on temoignages
  for each row execute function log_audit();
create trigger audit_assignations after insert or update or delete on assignations_editeur
  for each row execute function log_audit();
create trigger audit_profils after update on profils
  for each row execute function log_audit();

-- =====================================================================
-- TRIGGERS DE MISE À JOUR
-- =====================================================================
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_timestamp_projets before update on projets
  for each row execute function trigger_set_timestamp();
create trigger set_timestamp_ps before update on programmes_strategiques
  for each row execute function trigger_set_timestamp();
create trigger set_timestamp_profils before update on profils
  for each row execute function trigger_set_timestamp();

-- =====================================================================
-- VUES PUBLIQUES
-- =====================================================================
create or replace view v_stats_publiques as
select
  count(distinct p.id) filter (where p.statut = 'publie') as projets_publies,
  count(distinct pc.pays_code) filter (where pj.statut = 'publie') as pays_couverts,
  sum(p.budget_engage) filter (where p.statut = 'publie') as budget_total_engage,
  count(distinct p.ps_id) filter (where p.statut = 'publie') as programmes_actifs
from projets p
left join pays_couverture pc on pc.projet_id = p.id
left join projets pj on pj.id = pc.projet_id
where p.annee_exercice = 2025;

create or replace view v_projets_publics as
select
  p.id, p.code_officiel, p.ps_id, p.projet_parent_id, p.est_sous_projet,
  p.nom, p.accroche, p.description, p.annee_exercice,
  p.budget_engage, p.engagement_global, p.taux_execution,
  p.nombre_pays, p.nombre_projets_retenus,
  p.thematiques, p.mots_cles, p.cercles_impact,
  p.date_publication,
  ps.nom as ps_nom, ps.nom_court as ps_nom_court, ps.couleur_theme as ps_couleur,
  (select count(*) from temoignages where projet_id = p.id and mise_en_avant) as nb_temoignages_vedette,
  (select count(*) from indicateurs where projet_id = p.id and mise_en_avant) as nb_indicateurs_vedette
from projets p
left join programmes_strategiques ps on ps.id = p.ps_id
where p.statut = 'publie';

-- =====================================================================
-- SEED : 3 PROGRAMMES STRATÉGIQUES
-- =====================================================================
insert into programmes_strategiques (id, code, nom, nom_court, description, couleur_theme, ordre) values
  ('PS1', 'PS1',
    'La langue française au service des cultures et de l''éducation',
    'Langue, cultures et éducation',
    'Promouvoir la langue française comme vecteur de cultures et d''apprentissage, soutenir la création artistique, renforcer l''enseignement et l''apprentissage en français.',
    '#003DA5', 1),
  ('PS2', 'PS2',
    'La langue française au service de la démocratie et de la gouvernance',
    'Démocratie et gouvernance',
    'Accompagner les processus démocratiques, renforcer l''État de droit, les droits humains et la justice dans l''espace francophone.',
    '#6B2C91', 2),
  ('PS3', 'PS3',
    'La langue française, vecteur de développement durable',
    'Développement durable',
    'Mobiliser la Francophonie au service du développement durable, de l''égalité, du numérique, de l''environnement et de la coopération économique.',
    '#0F6E56', 3)
on conflict (id) do update set
  nom = excluded.nom, nom_court = excluded.nom_court,
  description = excluded.description, couleur_theme = excluded.couleur_theme,
  ordre = excluded.ordre;

-- =====================================================================
-- SEED : 22 PROJETS
-- =====================================================================

-- PS1
insert into projets (id, code_officiel, ps_id, projet_parent_id, est_sous_projet, nom, annee_exercice, statut) values
  ('PROJ_A01', 'PROJ_A01', 'PS1', null, false, 'Langue française, langue internationale (ensemble)', 2025, 'brouillon'),
  ('PROJ_A01a', 'PROJ_A01a', 'PS1', 'PROJ_A01', true, 'La langue française, langue internationale', 2025, 'brouillon'),
  ('PROJ_A01b', 'PROJ_A01b', 'PS1', 'PROJ_A01', true, 'Observatoire de la langue française', 2025, 'brouillon'),
  ('PROJ_A01c', 'PROJ_A01c', 'PS1', 'PROJ_A01', true, 'Création culturelle, artistique et production de connaissance en français', 2025, 'brouillon'),
  ('PROJ_A02', 'PROJ_A02', 'PS1', null, false, 'La langue française, langue d''enseignement et d''apprentissage', 2025, 'brouillon'),
  ('PROJ_A03', 'PROJ_A03', 'PS1', null, false, 'Initiative francophone pour la formation à distance des maîtres (IFADEM)', 2025, 'brouillon'),
  ('PROJ_A04', 'PROJ_A04', 'PS1', null, false, 'École et langues nationales (ELAN)', 2025, 'brouillon'),
  ('PROJ_A05', 'PROJ_A05', 'PS1', null, false, 'Acquérir des savoirs, découvrir le monde', 2025, 'brouillon'),
  ('PROJ_A06', 'PROJ_A06', 'PS1', null, false, 'Industries culturelles et découvrabilité : une ambition francophone et mondiale', 2025, 'brouillon'),
  ('PROJ_A07', 'PROJ_A07', 'PS1', null, false, 'Jeux de la Francophonie', 2025, 'brouillon'),
  ('PROJ_A08', 'PROJ_A08', 'PS1', null, false, 'Radio Jeunesse Sahel', 2025, 'brouillon')
on conflict (id) do nothing;

-- PS2
insert into projets (id, code_officiel, ps_id, projet_parent_id, est_sous_projet, nom, annee_exercice, statut) values
  ('PROJ_A09', 'PROJ_A09', 'PS2', null, false, 'État civil', 2025, 'brouillon'),
  ('PROJ_A10', 'PROJ_A10', 'PS2', null, false, 'Renforcement de l''État de droit, des droits de l''Homme et de la justice', 2025, 'brouillon'),
  ('PROJ_A11', 'PROJ_A11', 'PS2', null, false, 'Prévention et lutte contre les désordres de l''information', 2025, 'brouillon'),
  ('PROJ_A12', 'PROJ_A12', 'PS2', null, false, 'Accompagnement des processus démocratiques', 2025, 'brouillon'),
  ('PROJ_A13', 'PROJ_A13', 'PS2', null, false, 'Soutien à la paix et à la stabilité', 2025, 'brouillon')
on conflict (id) do nothing;

-- PS3
insert into projets (id, code_officiel, ps_id, projet_parent_id, est_sous_projet, nom, annee_exercice, statut) values
  ('PROJ_A14', 'PROJ_A14', 'PS3', null, false, 'La Francophonie avec Elles', 2025, 'brouillon'),
  ('PROJ_A15', 'PROJ_A15', 'PS3', null, false, 'Innovations et plaidoyers francophones', 2025, 'brouillon'),
  ('PROJ_A16', 'PROJ_A16', 'PS3', null, false, 'Numérique (ensemble D-CLIC + Gouvernance)', 2025, 'brouillon'),
  ('PROJ_A16a', 'PROJ_A16a', 'PS3', 'PROJ_A16', true, 'D-CLIC : formez-vous au numérique', 2025, 'brouillon'),
  ('PROJ_A16b', 'PROJ_A16b', 'PS3', 'PROJ_A16', true, 'Gouvernance numérique', 2025, 'brouillon'),
  ('PROJ_A17', 'PROJ_A17', 'PS3', null, false, 'Promotion des échanges économiques et commerciaux francophones', 2025, 'brouillon'),
  ('PROJ_A18', 'PROJ_A18', 'PS3', null, false, 'Accompagnement des transformations structurelles en matière d''environnement et de climat', 2025, 'brouillon'),
  ('PROJ_A19', 'PROJ_A19', 'PS3', null, false, 'Soutien aux initiatives environnementales dans le bassin du Congo', 2025, 'brouillon'),
  ('PROJ_A20', 'PROJ_A20', 'PS3', null, false, 'Promotion du tourisme durable', 2025, 'brouillon')
on conflict (id) do nothing;

-- =====================================================================
-- FIN DU SCHÉMA v3
-- =====================================================================
-- PROCHAINES ÉTAPES :
-- 1. Exécuter ce script dans Supabase SQL Editor
-- 2. Créer le premier compte Admin :
--    (a) S'inscrire normalement via le formulaire (deviendra Lecteur)
--    (b) Dans le SQL Editor : update profils set role = 'admin' where email = 'votre@email.com';
-- 3. Importer les données complètes du PROJ_A14 via PROJ_A14.json
-- 4. Faire passer PROJ_A14 en statut 'publie' pour tester la lecture publique
-- =====================================================================
