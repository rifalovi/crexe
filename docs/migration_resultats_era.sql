-- ─── Migration : table resultats_era ──────────────────────────────────────────
-- Stocke les résultats de l'Enquête Rapide Annuelle (ERA) par projet.
--
-- Concept pédagogique — Pourquoi une table dédiée ?
-- Les résultats ERA sont des données narratives (prose + chiffres-clés)
-- qui ne s'intègrent pas naturellement dans la table `indicateurs` (KPIs
-- structurés). Une table séparée permet de stocker le contenu complet
-- par projet, niveau de résultat et année d'exercice.
-- ─────────────────────────────────────────────────────────────────────────────

-- Extension uuid si pas encore activée
create extension if not exists "uuid-ossp";

-- ─── Table principale ─────────────────────────────────────────────────────────
create table if not exists resultats_era (
  id                uuid primary key default uuid_generate_v4(),
  ps_id             text not null check (ps_id in ('PS1','PS2','PS3')),
  projet_code       text,                          -- ex: PROJ_A01
  projet_nom        text not null,
  titre_section     text not null,
  -- Niveau ERA : acquisition des compétences → effets intermédiaires → retombées
  niveau            text not null check (niveau in (
    'acquisition_competences',
    'effets_intermediaires',
    'retombees',
    'extrants',
    'synthese'
  )),
  contenu           text not null,
  chiffre_cle       text,                          -- ex: "75 %", "99 %", "100 %"
  annee_exercice    integer not null default 2024,
  ordre             integer default 0,
  created_at        timestamptz default now()
);

-- ─── Index pour les requêtes fréquentes ───────────────────────────────────────
create index if not exists resultats_era_ps_annee_idx
  on resultats_era (ps_id, annee_exercice);

create index if not exists resultats_era_projet_idx
  on resultats_era (projet_code, annee_exercice);

-- ─── RLS — lecture publique, écriture admin uniquement ───────────────────────
alter table resultats_era enable row level security;

-- Lecture publique sans authentification
drop policy if exists "Lecture publique resultats_era" on resultats_era;
create policy "Lecture publique resultats_era"
  on resultats_era for select
  using (true);

-- Écriture réservée aux admins
drop policy if exists "Admin resultats_era" on resultats_era;
create policy "Admin resultats_era"
  on resultats_era for all
  using (
    exists (
      select 1 from profils
      where profils.id = auth.uid()
        and profils.role = 'admin'
    )
  );

-- ─── Commentaires ─────────────────────────────────────────────────────────────
comment on table resultats_era is
  'Résultats narratifs de l''Enquête Rapide Annuelle (ERA) par projet et par niveau de résultat.';
comment on column resultats_era.niveau is
  'acquisition_competences | effets_intermediaires | retombees | extrants | synthese';
comment on column resultats_era.chiffre_cle is
  'Taux ou indicateur-clé mis en avant pour ce bloc (ex: "75 %", "100 %")';
