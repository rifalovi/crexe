-- ─── Migration : Politiques RLS pour écriture admin + éditeurs ───────────────
-- À exécuter dans Supabase SQL Editor APRÈS migration_v3_delta.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Ce script ajoute :
--   1. Les politiques d'écriture (INSERT / UPDATE / DELETE) pour les admins
--   2. Les politiques d'écriture pour les éditeurs assignés
--   3. Les politiques sur documents_rag (base de connaissance chatbot)
--   4. Un helper pour promouvoir le premier administrateur
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── S'assurer que RLS est activé sur toutes les tables ─────────────────────
alter table projets               enable row level security;
alter table indicateurs           enable row level security;
alter table temoignages           enable row level security;
alter table partenariats          enable row level security;
alter table evenements            enable row level security;
alter table chaine_resultats      enable row level security;
alter table era_resultats         enable row level security;
alter table documents_rag         enable row level security;
alter table pays_couverture       enable row level security;

-- ─── 1. PROJETS ──────────────────────────────────────────────────────────────

-- Lecture : publiés (public) + tous (admin)
drop policy if exists "Lecture publique"                  on projets;
drop policy if exists "Projets publiés lecture publique"  on projets;
drop policy if exists "Admin voit tous projets"           on projets;
drop policy if exists "Éditeur voit ses projets"          on projets;

create policy "Projets publiés lecture publique" on projets
  for select using (statut = 'publie');

create policy "Admin voit tous projets" on projets
  for select using (is_admin());

create policy "Éditeur voit ses projets" on projets
  for select using (
    exists (
      select 1 from assignations_editeur
      where editeur_id = auth.uid() and projet_id = projets.id
    )
  );

-- Écriture admin
drop policy if exists "Admin modifie projets" on projets;
create policy "Admin modifie projets" on projets
  for all using (is_admin()) with check (is_admin());

-- Écriture éditeur (sur les projets assignés)
drop policy if exists "Éditeur modifie ses projets" on projets;
create policy "Éditeur modifie ses projets" on projets
  for update using (
    exists (
      select 1 from assignations_editeur
      where editeur_id = auth.uid() and projet_id = projets.id
    )
  );

-- ─── 2. INDICATEURS ──────────────────────────────────────────────────────────

drop policy if exists "Lecture publique" on indicateurs;
drop policy if exists "Admin indicateurs" on indicateurs;
drop policy if exists "Éditeur indicateurs" on indicateurs;

-- Lecture publique des indicateurs des projets publiés
create policy "Indicateurs publiés lecture publique" on indicateurs
  for select using (
    exists (select 1 from projets where id = indicateurs.projet_id and statut = 'publie')
  );

-- Admin voit tout et écrit tout
create policy "Admin indicateurs" on indicateurs
  for all using (is_admin()) with check (is_admin());

-- Éditeur lit et modifie ses indicateurs
create policy "Éditeur lit indicateurs" on indicateurs
  for select using (
    exists (select 1 from assignations_editeur where editeur_id = auth.uid() and projet_id = indicateurs.projet_id)
  );
create policy "Éditeur modifie indicateurs" on indicateurs
  for all using (
    exists (select 1 from assignations_editeur where editeur_id = auth.uid() and projet_id = indicateurs.projet_id and peut_editer_indicateurs = true)
  );

-- ─── 3. TÉMOIGNAGES ─────────────────────────────────────────────────────────

drop policy if exists "Lecture publique" on temoignages;
drop policy if exists "Admin temoignages" on temoignages;

create policy "Témoignages publiés lecture publique" on temoignages
  for select using (
    exists (select 1 from projets where id = temoignages.projet_id and statut = 'publie')
  );

create policy "Admin temoignages" on temoignages
  for all using (is_admin()) with check (is_admin());

create policy "Éditeur temoignages" on temoignages
  for all using (
    exists (select 1 from assignations_editeur where editeur_id = auth.uid() and projet_id = temoignages.projet_id and peut_editer_temoignages = true)
  );

-- ─── 4. PARTENARIATS ────────────────────────────────────────────────────────

drop policy if exists "Lecture publique" on partenariats;
drop policy if exists "Admin partenariats" on partenariats;

create policy "Partenariats publiés lecture publique" on partenariats
  for select using (
    exists (select 1 from projets where id = partenariats.projet_id and statut = 'publie')
  );

create policy "Admin partenariats" on partenariats
  for all using (is_admin()) with check (is_admin());

create policy "Éditeur partenariats" on partenariats
  for all using (
    exists (select 1 from assignations_editeur where editeur_id = auth.uid() and projet_id = partenariats.projet_id)
  );

-- ─── 5. ÉVÉNEMENTS ──────────────────────────────────────────────────────────

drop policy if exists "Lecture publique" on evenements;
drop policy if exists "Admin evenements" on evenements;

create policy "Événements publiés lecture publique" on evenements
  for select using (
    exists (select 1 from projets where id = evenements.projet_id and statut = 'publie')
  );

create policy "Admin evenements" on evenements
  for all using (is_admin()) with check (is_admin());

-- ─── 6. CHAÎNE DES RÉSULTATS ────────────────────────────────────────────────

drop policy if exists "Lecture publique" on chaine_resultats;
drop policy if exists "Admin chaine" on chaine_resultats;

create policy "Chaîne publiée lecture publique" on chaine_resultats
  for select using (
    exists (select 1 from projets where id = chaine_resultats.projet_id and statut = 'publie')
  );

create policy "Admin chaine" on chaine_resultats
  for all using (is_admin()) with check (is_admin());

create policy "Éditeur chaine" on chaine_resultats
  for all using (
    exists (select 1 from assignations_editeur where editeur_id = auth.uid() and projet_id = chaine_resultats.projet_id)
  );

-- ─── 7. ERA RÉSULTATS ────────────────────────────────────────────────────────

drop policy if exists "Lecture publique" on era_resultats;
drop policy if exists "Admin era" on era_resultats;

create policy "ERA publiée lecture publique" on era_resultats
  for select using (
    exists (select 1 from projets where id = era_resultats.projet_id and statut = 'publie')
  );

create policy "Admin era" on era_resultats
  for all using (is_admin()) with check (is_admin());

-- ─── 8. DOCUMENTS RAG (base de connaissance chatbot) ────────────────────────

-- Lecture : tout le monde peut lire les chunks (le chatbot les utilise anonymement)
drop policy if exists "Lecture publique" on documents_rag;
drop policy if exists "Admin rag" on documents_rag;

create policy "Documents RAG lecture publique" on documents_rag
  for select using (true);

-- Seuls les admins peuvent alimenter la base de connaissance
create policy "Admin gère documents RAG" on documents_rag
  for all using (is_admin()) with check (is_admin());

-- ─── 9. PAYS COUVERTURE ──────────────────────────────────────────────────────

drop policy if exists "Lecture publique" on pays_couverture;
drop policy if exists "Admin pays" on pays_couverture;

create policy "Pays couverture lecture publique" on pays_couverture
  for select using (true);

create policy "Admin pays couverture" on pays_couverture
  for all using (is_admin()) with check (is_admin());

-- ─── 10. TABLE documents_rag — colonnes supplémentaires ─────────────────────
-- Ajout de colonnes pour le suivi de la base de connaissance
alter table documents_rag
  add column if not exists titre         text,            -- titre du document source
  add column if not exists categorie     text default 'crexe', -- 'crexe' | 'general_oif' | 'autre'
  add column if not exists uploaded_by   uuid references auth.users(id),
  add column if not exists updated_at    timestamptz default now();

-- ─── 11. HELPER : Promouvoir le premier admin ───────────────────────────────
-- Exécuter cette requête en remplaçant l'email par le vôtre pour créer le premier admin.
-- IMPORTANT : l'utilisateur doit d'abord s'être connecté au moins une fois via /admin.

-- Exemple (décommentez et adaptez) :
-- UPDATE profils SET role = 'admin' WHERE email = 'carlos.hounsinou@francophonie.org';

-- Si le profil n'existe pas encore (première connexion pas encore faite) :
-- INSERT INTO profils (id, email, nom_complet, role)
-- SELECT id, email, '', 'admin'
-- FROM auth.users
-- WHERE email = 'carlos.hounsinou@francophonie.org'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ─── 12. Vérification ────────────────────────────────────────────────────────
-- Après application, vérifier avec :
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;
