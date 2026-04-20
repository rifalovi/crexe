-- =====================================================================
-- CREXE — Migration delta v1 → v3
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- Ce script est IDEMPOTENT : peut être exécuté plusieurs fois sans risque
-- =====================================================================

-- ─── Étape 1 : Extensions ──────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- ─── Étape 2 : Enum des rôles (si pas encore créé) ────────────────
do $$ begin
  create type role_utilisateur as enum ('admin', 'editeur', 'lecteur');
exception
  when duplicate_object then null;
end $$;

-- ─── Étape 3 : Nouvelles colonnes sur programmes_strategiques ──────
alter table programmes_strategiques
  add column if not exists code text,
  add column if not exists nom_court text,
  add column if not exists couleur_theme text;

-- Synchroniser la colonne code avec l'id si vide
update programmes_strategiques set code = id where code is null;

-- ─── Étape 4 : Mettre à jour les 3 PS officiels (noms v3 + couleurs)
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
  code = excluded.code,
  nom = excluded.nom,
  nom_court = excluded.nom_court,
  description = excluded.description,
  couleur_theme = excluded.couleur_theme,
  ordre = excluded.ordre;

-- Supprimer PS4 si il existe (l'architecture v3 n'a que 3 PS)
-- Note : si des projets référencent PS4, cette ligne peut échouer.
-- Dans ce cas, déplacez d'abord les projets vers PS1/PS2/PS3.
-- delete from programmes_strategiques where id = 'PS4';

-- ─── Étape 5 : Nouvelles colonnes sur projets ──────────────────────
alter table projets
  add column if not exists code_officiel text,
  add column if not exists est_sous_projet boolean default false,
  add column if not exists projet_parent_id text,
  add column if not exists statut text default 'brouillon',
  add column if not exists date_publication timestamptz,
  add column if not exists cree_par uuid,
  add column if not exists modifie_par uuid;

-- Ajouter la contrainte de statut (si elle n'existe pas)
do $$ begin
  alter table projets
    add constraint projets_statut_check
    check (statut in ('brouillon', 'en_revue', 'publie', 'archive'));
exception when duplicate_object then null; end $$;

-- Synchroniser code_officiel avec id
update projets set code_officiel = id where code_officiel is null;

-- ─── Étape 6 : Table profils (v3, remplace user_profiles) ──────────
create table if not exists profils (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nom_complet text,
  role role_utilisateur not null default 'lecteur',
  compte_verifie_oif boolean default false,
  organisation text,
  poste text,
  actif boolean default true,
  date_derniere_connexion timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profils_role on profils(role);
create index if not exists idx_profils_email on profils(email);

-- Migrer les données de user_profiles vers profils (si user_profiles existe)
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'user_profiles' and table_schema = 'public') then
    insert into profils (id, email, nom_complet, actif, created_at)
    select
      id,
      email,
      nom_complet,
      coalesce(actif, true),
      coalesce(created_at, now())
    from user_profiles
    on conflict (id) do nothing;
  end if;
end $$;

-- ─── Étape 7 : Tables de gestion avancée ──────────────────────────

-- Assignations éditeur ↔ projet (N-N)
create table if not exists assignations_editeur (
  id uuid primary key default uuid_generate_v4(),
  editeur_id uuid references auth.users(id) on delete cascade not null,
  projet_id text references projets(id) on delete cascade not null,
  assigne_par uuid references auth.users(id) not null,
  peut_editer_indicateurs boolean default true,
  peut_editer_temoignages boolean default true,
  peut_editer_pays boolean default true,
  peut_soumettre_publication boolean default true,
  notes_assignation text,
  created_at timestamptz default now(),
  unique(editeur_id, projet_id)
);

create index if not exists idx_assign_editeur on assignations_editeur(editeur_id);
create index if not exists idx_assign_projet on assignations_editeur(projet_id);

-- Invitations éditeur (pré-assignation par email)
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

-- Rate limiting chatbot
create table if not exists rate_limit_chatbot (
  id uuid primary key default uuid_generate_v4(),
  identifiant text not null,
  est_authentifie boolean not null,
  nombre_requetes integer default 1,
  fenetre_debut timestamptz default now(),
  unique(identifiant, fenetre_debut)
);

create index if not exists idx_rate_limit on rate_limit_chatbot(identifiant, fenetre_debut);

-- Journal d'audit (log append-only de toutes les modifications)
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

create index if not exists idx_audit_user on journal_audit(utilisateur_id);
create index if not exists idx_audit_table on journal_audit(table_cible);
create index if not exists idx_audit_date on journal_audit(created_at desc);

-- ─── Étape 8 : Fonctions utilitaires v3 ───────────────────────────

-- Récupérer le rôle de l'utilisateur courant
create or replace function get_my_role()
returns role_utilisateur
language sql stable security definer
as $$
  select coalesce(
    (select role from profils where id = auth.uid() and actif = true),
    'lecteur'::role_utilisateur
  );
$$;

-- Vérification rapide : est-ce un admin ?
create or replace function is_admin()
returns boolean
language sql stable security definer
as $$
  select coalesce(
    (select role = 'admin' from profils where id = auth.uid() and actif = true),
    false
  );
$$;

-- Vérification : peut-on modifier ce projet ?
create or replace function can_edit_projet(projet_id_param text)
returns boolean
language sql stable security definer
as $$
  select case
    when is_admin() then true
    else exists (
      select 1 from assignations_editeur
      where editeur_id = auth.uid() and projet_id = projet_id_param
    )
  end;
$$;

-- Trigger : créer automatiquement un profil à l'inscription
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
    'lecteur'
  )
  on conflict (id) do nothing;

  -- Si une invitation éditeur existe pour cet email, accepter automatiquement
  if exists (
    select 1 from invitations_editeur
    where email = new.email and not acceptee and date_expiration > now()
  ) then
    update profils set role = 'editeur' where id = new.id;

    insert into assignations_editeur (editeur_id, projet_id, assigne_par)
    select new.id, unnest(projets_a_assigner), invite_par
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

-- ─── Étape 9 : RLS sur les nouvelles tables ────────────────────────

alter table profils enable row level security;
alter table assignations_editeur enable row level security;
alter table invitations_editeur enable row level security;
alter table rate_limit_chatbot enable row level security;
alter table journal_audit enable row level security;

-- Profils
drop policy if exists "Voir son profil" on profils;
create policy "Voir son profil" on profils
  for select using (auth.uid() = id);

drop policy if exists "Admin voit tous profils" on profils;
create policy "Admin voit tous profils" on profils
  for select using (is_admin());

drop policy if exists "Modifier son profil" on profils;
create policy "Modifier son profil" on profils
  for update using (auth.uid() = id);

drop policy if exists "Admin modifie profils" on profils;
create policy "Admin modifie profils" on profils
  for update using (is_admin());

-- Assignations (admin seulement)
drop policy if exists "Admin gère assignations" on assignations_editeur;
create policy "Admin gère assignations" on assignations_editeur
  for all using (is_admin());

drop policy if exists "Éditeur voit ses assignations" on assignations_editeur;
create policy "Éditeur voit ses assignations" on assignations_editeur
  for select using (auth.uid() = editeur_id);

-- Journal d'audit (admin seulement)
drop policy if exists "Admin consulte audit" on journal_audit;
create policy "Admin consulte audit" on journal_audit
  for select using (is_admin());

-- ─── Étape 10 : Mettre à jour la RLS projets (lecture publique) ────
-- Les projets PUBLIÉS sont lisibles par tout le monde (SEO, partage)
drop policy if exists "Projets publiés lecture publique" on projets;
create policy "Projets publiés lecture publique" on projets
  for select using (statut = 'publie');

drop policy if exists "Admin voit tous projets" on projets;
create policy "Admin voit tous projets" on projets
  for select using (is_admin());

drop policy if exists "Éditeurs voient projets assignés" on projets;
create policy "Éditeurs voient projets assignés" on projets
  for select using (
    exists (
      select 1 from assignations_editeur
      where editeur_id = auth.uid() and projet_id = projets.id
    )
  );

-- ─── Étape 11 : Seed 22 projets officiels OIF ─────────────────────
-- PS1 — Langue, cultures et éducation
insert into projets (id, code_officiel, ps_id, projet_parent_id, est_sous_projet, nom, annee_exercice, statut) values
  ('PROJ_A01',  'PROJ_A01',  'PS1', null,       false, 'Langue française, langue internationale (ensemble)', 2025, 'brouillon'),
  ('PROJ_A01a', 'PROJ_A01a', 'PS1', 'PROJ_A01', true,  'La langue française, langue internationale', 2025, 'brouillon'),
  ('PROJ_A01b', 'PROJ_A01b', 'PS1', 'PROJ_A01', true,  'Observatoire de la langue française', 2025, 'brouillon'),
  ('PROJ_A01c', 'PROJ_A01c', 'PS1', 'PROJ_A01', true,  'Création culturelle, artistique et production de connaissance en français', 2025, 'brouillon'),
  ('PROJ_A02',  'PROJ_A02',  'PS1', null,       false, 'La langue française, langue d''enseignement et d''apprentissage', 2025, 'brouillon'),
  ('PROJ_A03',  'PROJ_A03',  'PS1', null,       false, 'Initiative francophone pour la formation à distance des maîtres (IFADEM)', 2025, 'brouillon'),
  ('PROJ_A04',  'PROJ_A04',  'PS1', null,       false, 'École et langues nationales (ELAN)', 2025, 'brouillon'),
  ('PROJ_A05',  'PROJ_A05',  'PS1', null,       false, 'Acquérir des savoirs, découvrir le monde', 2025, 'brouillon'),
  ('PROJ_A06',  'PROJ_A06',  'PS1', null,       false, 'Industries culturelles et découvrabilité : une ambition francophone et mondiale', 2025, 'brouillon'),
  ('PROJ_A07',  'PROJ_A07',  'PS1', null,       false, 'Jeux de la Francophonie', 2025, 'brouillon'),
  ('PROJ_A08',  'PROJ_A08',  'PS1', null,       false, 'Radio Jeunesse Sahel', 2025, 'brouillon')
on conflict (id) do update set
  code_officiel = excluded.code_officiel,
  ps_id = excluded.ps_id;

-- PS2 — Démocratie et gouvernance
insert into projets (id, code_officiel, ps_id, projet_parent_id, est_sous_projet, nom, annee_exercice, statut) values
  ('PROJ_A09',  'PROJ_A09',  'PS2', null, false, 'État civil', 2025, 'brouillon'),
  ('PROJ_A10',  'PROJ_A10',  'PS2', null, false, 'Renforcement de l''État de droit, des droits de l''Homme et de la justice', 2025, 'brouillon'),
  ('PROJ_A11',  'PROJ_A11',  'PS2', null, false, 'Prévention et lutte contre les désordres de l''information', 2025, 'brouillon'),
  ('PROJ_A12',  'PROJ_A12',  'PS2', null, false, 'Accompagnement des processus démocratiques', 2025, 'brouillon'),
  ('PROJ_A13',  'PROJ_A13',  'PS2', null, false, 'Soutien à la paix et à la stabilité', 2025, 'brouillon')
on conflict (id) do update set
  code_officiel = excluded.code_officiel,
  ps_id = excluded.ps_id;

-- PS3 — Développement durable
insert into projets (id, code_officiel, ps_id, projet_parent_id, est_sous_projet, nom, annee_exercice, statut) values
  ('PROJ_A14',  'PROJ_A14',  'PS3', null,       false, 'La Francophonie avec Elles', 2025, 'brouillon'),
  ('PROJ_A15',  'PROJ_A15',  'PS3', null,       false, 'Innovations et plaidoyers francophones', 2025, 'brouillon'),
  ('PROJ_A16',  'PROJ_A16',  'PS3', null,       false, 'Numérique (ensemble D-CLIC + Gouvernance)', 2025, 'brouillon'),
  ('PROJ_A16a', 'PROJ_A16a', 'PS3', 'PROJ_A16', true,  'D-CLIC : formez-vous au numérique', 2025, 'brouillon'),
  ('PROJ_A16b', 'PROJ_A16b', 'PS3', 'PROJ_A16', true,  'Gouvernance numérique', 2025, 'brouillon'),
  ('PROJ_A17',  'PROJ_A17',  'PS3', null,       false, 'Promotion des échanges économiques et commerciaux francophones', 2025, 'brouillon'),
  ('PROJ_A18',  'PROJ_A18',  'PS3', null,       false, 'Accompagnement des transformations structurelles en matière d''environnement et de climat', 2025, 'brouillon'),
  ('PROJ_A19',  'PROJ_A19',  'PS3', null,       false, 'Soutien aux initiatives environnementales dans le bassin du Congo', 2025, 'brouillon'),
  ('PROJ_A20',  'PROJ_A20',  'PS3', null,       false, 'Promotion du tourisme durable', 2025, 'brouillon')
on conflict (id) do update set
  code_officiel = excluded.code_officiel,
  ps_id = excluded.ps_id;

-- ─── Étape 12 : Vues publiques ─────────────────────────────────────

-- Vue : statistiques globales (pour le hero de la landing page)
create or replace view v_stats_publiques as
select
  count(distinct p.id) filter (where p.statut = 'publie')::int as projets_publies,
  count(distinct pc.pays_code) filter (where p.statut = 'publie')::int as pays_couverts,
  coalesce(sum(p.budget_engage) filter (where p.statut = 'publie'), 0) as budget_total_engage,
  count(distinct p.ps_id) filter (where p.statut = 'publie')::int as programmes_actifs,
  count(distinct p.id)::int as total_projets
from projets p
left join pays_couverture pc on pc.projet_id = p.id
where p.annee_exercice = 2025;

-- Vue : projets publics enrichis (pour les cartes/liste publique)
create or replace view v_projets_publics as
select
  p.id, p.code_officiel, p.ps_id, p.projet_parent_id, p.est_sous_projet,
  p.nom, p.accroche, p.description, p.annee_exercice,
  p.budget_engage, p.engagement_global, p.taux_execution,
  p.nombre_pays, p.nombre_projets_retenus,
  p.thematiques, p.mots_cles, p.cercles_impact,
  p.date_publication,
  ps.nom as ps_nom, ps.nom_court as ps_nom_court, ps.couleur_theme as ps_couleur,
  (select count(*) from temoignages where projet_id = p.id and mise_en_avant)::int as nb_temoignages_vedette,
  (select count(*) from indicateurs where projet_id = p.id and mise_en_avant)::int as nb_indicateurs_vedette
from projets p
left join programmes_strategiques ps on ps.id = p.ps_id
where p.statut = 'publie';

-- ─── Étape 13 : Trigger de mise à jour du timestamp ───────────────
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp_projets on projets;
create trigger set_timestamp_projets before update on projets
  for each row execute function trigger_set_timestamp();

drop trigger if exists set_timestamp_ps on programmes_strategiques;
create trigger set_timestamp_ps before update on programmes_strategiques
  for each row execute function trigger_set_timestamp();

drop trigger if exists set_timestamp_profils on profils;
create trigger set_timestamp_profils before update on profils
  for each row execute function trigger_set_timestamp();

-- =====================================================================
-- ✅ Migration v3 terminée
-- Prochaines étapes manuelles :
-- 1. Promouvoir votre compte en Admin :
--    UPDATE profils SET role = 'admin' WHERE email = 'votre@email.com';
-- 2. Importer les données complètes de PROJ_A14 (JSON seed)
-- 3. Passer PROJ_A14 en statut 'publie' pour tester la lecture publique
-- =====================================================================
