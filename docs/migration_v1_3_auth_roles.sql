-- =====================================================================
-- MIGRATION v1.3 — Authentification et rôles utilisateurs
-- À exécuter dans le SQL Editor Supabase
-- =====================================================================

-- ─── 1. TABLE PROFILS UTILISATEURS ───────────────────────────────────
-- Liée à auth.users (créée automatiquement par Supabase Auth)
-- Le trigger ci-dessous la remplit à chaque inscription

create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nom_complet text,
  role text not null default 'lecteur'
    check (role in ('admin', 'editeur', 'lecteur')),
  actif boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index pour lookup rapide par rôle
create index idx_user_profiles_role on user_profiles(role);

-- ─── 2. TRIGGER — création automatique du profil à l'inscription ──────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'lecteur')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── 3. FONCTION HELPER — récupérer le rôle de l'utilisateur connecté ─
create or replace function current_user_role()
returns text as $$
  select role from public.user_profiles
  where id = auth.uid()
$$ language sql security definer stable;

-- ─── 4. RLS — LECTURE ─────────────────────────────────────────────────
-- Les lecteurs ne peuvent voir que leur propre profil
-- Les admins voient tous les profils

alter table user_profiles enable row level security;

create policy "Voir son propre profil"
  on user_profiles for select
  using (id = auth.uid() or current_user_role() = 'admin');

-- ─── 5. RLS — ÉCRITURE SUR LES DONNÉES CREXE ─────────────────────────
-- Règle : admin et éditeur peuvent insérer/modifier/supprimer
-- Lecteur : lecture seule (déjà défini en Phase 1)

-- Projets
create policy "Écriture admin et éditeur" on projets
  for all using (current_user_role() in ('admin', 'editeur'))
  with check (current_user_role() in ('admin', 'editeur'));

create policy "Écriture admin et éditeur" on indicateurs
  for all using (current_user_role() in ('admin', 'editeur'))
  with check (current_user_role() in ('admin', 'editeur'));

create policy "Écriture admin et éditeur" on temoignages
  for all using (current_user_role() in ('admin', 'editeur'))
  with check (current_user_role() in ('admin', 'editeur'));

create policy "Écriture admin et éditeur" on programmes_strategiques
  for all using (current_user_role() in ('admin', 'editeur'))
  with check (current_user_role() in ('admin', 'editeur'));

create policy "Écriture admin et éditeur" on pays
  for all using (current_user_role() in ('admin', 'editeur'))
  with check (current_user_role() in ('admin', 'editeur'));

create policy "Écriture admin et éditeur" on pays_couverture
  for all using (current_user_role() in ('admin', 'editeur'))
  with check (current_user_role() in ('admin', 'editeur'));

create policy "Écriture admin et éditeur" on partenariats
  for all using (current_user_role() in ('admin', 'editeur'))
  with check (current_user_role() in ('admin', 'editeur'));

create policy "Écriture admin et éditeur" on evenements
  for all using (current_user_role() in ('admin', 'editeur'))
  with check (current_user_role() in ('admin', 'editeur'));

create policy "Écriture admin et éditeur" on medias
  for all using (current_user_role() in ('admin', 'editeur'))
  with check (current_user_role() in ('admin', 'editeur'));

-- Gestion des profils : admin uniquement peut changer les rôles
create policy "Admin gère les profils"
  on user_profiles for update
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

-- Upload storage : admin et éditeur
create policy "Upload éditeur et admin"
  on storage.objects for insert
  with check (
    bucket_id = 'medias-crexe'
    and current_user_role() in ('admin', 'editeur')
  );

-- ─── 6. TRIGGER updated_at sur user_profiles ─────────────────────────
create trigger set_timestamp_user_profiles
  before update on user_profiles
  for each row execute function trigger_set_timestamp();

-- ─── 7. SEED — créer le premier compte admin ─────────────────────────
-- ⚠️ À exécuter APRÈS avoir créé votre compte via l'interface Supabase Auth
-- Remplacez l'email par le vôtre :
-- update user_profiles set role = 'admin' where email = 'rifalovi@gmail.com';

-- ─── VÉRIFICATION ─────────────────────────────────────────────────────
select 
  'user_profiles créée ✅' as statut,
  count(*) as nb_profils
from user_profiles;
