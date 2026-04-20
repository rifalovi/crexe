# CLAUDE.md — Plateforme CREXE

> Ce fichier est la mémoire persistante du projet. Il est relu par Claude Code au début de chaque session. Garde-le à jour à mesure que le projet évolue.

---

## 1. Contexte et mission

CREXE est la plateforme digitale de valorisation des projets de l'**Organisation internationale de la Francophonie (OIF)**, bâtie à partir des données du Compte-Rendu d'Exécution 2025 (CREXE 2025).

Elle doit permettre :

- de **visualiser** l'impact global et par projet (dashboard + cartes)
- de **raconter** l'impact via des fiches projet type "data storytelling"
- d'**explorer** via un chatbot IA conversationnel adossé aux données CREXE

Les utilisateurs cibles sont : décideurs OIF, États membres, bailleurs de fonds, journalistes, partenaires techniques (DID, ONU Femmes, agences de coopération), grand public francophone averti.

---

## 2. Principes de conception (non négociables)

1. **Rigueur méthodologique avant esthétique.** Chaque chiffre affiché est sourcé et qualifié (mesuré / estimé / observé / institutionnel). Jamais de chiffre sans source.
2. **Data storytelling plutôt que dashboard.** On raconte un projet, on ne le fiche pas. Verbes d'action, chiffres-chocs, 1 à 3 messages par bloc.
3. **Style institutionnel premium.** Références visuelles : ONU, Banque mondiale, OIF, Gates Foundation Open Philanthropy, publications type *Our World in Data*.
4. **Mobile-first.** 60 % des lecteurs lisent sur mobile en contexte international.
5. **Français en priorité**, architecture i18n prête pour EN/ES ultérieurement.
6. **Accessibilité WCAG AA** — c'est une exigence institutionnelle, pas une option.
7. **Traçabilité IA.** Toute réponse du chatbot cite ses sources (projet + document + page/section).

---

## 3. Stack technique

| Couche | Choix | Raison |
|---|---|---|
| Framework | Next.js 16.2.4 (App Router, Turbopack) + TypeScript | SEO, SSR, performance, typage fort |
| Style | Tailwind CSS + shadcn/ui | Design system ouvert, accessible, modifiable |
| Base de données | Supabase (PostgreSQL) | Postgres + pgvector + auth + storage intégrés |
| Embeddings | Voyage AI `voyage-3` ou OpenAI `text-embedding-3-small` | Qualité multilingue FR |
| LLM | Anthropic Claude Sonnet 4.5 via API | Qualité FR, fenêtre de contexte large |
| Cartes | MapLibre GL JS + fond Carto (gratuit institutionnel) | Pas de verrou Google/Mapbox payant |
| Graphiques | Recharts (simples) + D3 (avancés) | Écosystème React mature |
| Déploiement | Vercel (front) + Supabase (back) | CI/CD Git, HTTPS auto, edge functions |
| Tests | Vitest + Playwright | Unitaires + E2E |

---

## 4. Palette et identité visuelle

Couleurs signature (déclarées en variables CSS dans `app/globals.css`) :

- `--oif-blue: #003DA5` — institutionnel, chiffres factuels (couleur PS1)
- `--oif-blue-dark: #042C53` — texte sur fond clair, fond du hero
- `--oif-purple: #6B2C91` — couleur PS2 (démocratie et gouvernance)
- `--oif-green: #0F6E56` — couleur PS3 (développement durable)
- `--oif-gold: #D4A017` — chiffres-chocs, accents
- `--oif-cream: #FAF7F0` — fond doux pour les sections éditoriales
- `--oif-neutral: #F0F4FA` — surfaces secondaires

Les trois programmes stratégiques (voir §6) utilisent une couleur signature chacun :
PS1 = `--oif-blue`, PS2 = `--oif-purple`, PS3 = `--oif-green`. Le champ `couleur_theme`
de `programmes_strategiques` stocke la valeur officielle et prime sur ces variables.

Typographie : `Inter` (UI) + `Source Serif 4` (titres éditoriaux, citations). Jamais plus de deux familles de polices simultanément.

---

## 5. Architecture des dossiers

```
/app
  /(public)           # routes publiques
    /page.tsx         # landing : impact global
    /projets
      /page.tsx       # liste filtrée
      /[id]/page.tsx  # fiche projet dynamique
    /explorer
      /page.tsx       # moteur d'exploration + filtres
    /a-propos
      /page.tsx       # méthodologie, sources
  /api
    /chat/route.ts    # endpoint chatbot (stream)
    /search/route.ts  # recherche sémantique
/components
  /ui                 # shadcn/ui (auto-généré)
  /visuals            # cercles, pyramides, organigrammes (SVG)
  /dashboard          # KPIs, filtres, cartes
  /chat               # UI chatbot
  /shared             # Header, Footer, Breadcrumbs
/lib
  /supabase           # clients (browser + server)
  /embeddings         # génération vecteurs
  /rag                # retrieval, re-ranking
  /llm                # wrapper Anthropic
  /utils              # helpers
/data
  /raw                # CREXE 2025 sources (PDF, DOCX)
  /structured         # JSON normalisés par projet
  /seeds              # scripts d'import vers Supabase
/types                # types TypeScript partagés
/docs                 # documentation interne
/tests
  /unit
  /e2e
```

---

## 6. Modèle de données (schéma Postgres v3)

Schéma complet dans `files/schema_v3.sql`, migration applicable via `docs/migration_v3_delta.sql`.

### Programmes stratégiques — 3 PS officiels
- `PS1` — *La langue française au service des cultures et de l'éducation* → `#003DA5` (bleu)
- `PS2` — *La langue française au service de la démocratie et de la gouvernance* → `#6B2C91` (violet)
- `PS3` — *La langue française, vecteur de développement durable* → `#0F6E56` (vert)

### Nomenclature des projets — CRITIQUE ⚠️
Codes officiels : `PROJ_A01`, `PROJ_A01a`, `PROJ_A14`, `PROJ_A16b`, etc.
**Jamais** `P14`, `P15` — cette nomenclature est obsolète. Les 22 projets
(y compris sous-projets via `projet_parent_id` / `est_sous_projet`) sont seedés
en statut `brouillon` dans le schéma v3.

### Workflow de publication
`projets.statut` ∈ { `brouillon`, `en_revue`, `publie`, `archive` }.
Les politiques RLS ouvrent la lecture publique **uniquement** sur les projets
en statut `publie` — idem pour `indicateurs`, `temoignages`, `pays_couverture`,
`documents_rag`.

### Tables principales
- `programmes_strategiques` — PS1/PS2/PS3 avec `couleur_theme`
- `projets` — code `PROJ_A*`, `cercles_impact` (JSONB), `statut`
- `indicateurs` — KPIs avec `type_preuve` (mesure/estimation/observation/institutionnel)
- `temoignages` — citations sourcées (`source_url`, `type_media`)
- `pays` + `pays_couverture` — table pivot pays × projet
- `partenariats`, `evenements`, `medias` — contenu éditorial complémentaire
- `documents_rag` — chunks vectorisés `embedding vector(1536)` pour le chatbot

### Tables d'authentification et d'audit
- `profils` — extension de `auth.users` avec `role` (admin / editeur / lecteur),
  **remplace** l'ancienne table `user_profiles`
- `assignations_editeur` — relation N-N éditeur ↔ projet
- `invitations_editeur` — workflow d'invitation pré-inscription
- `journal_audit` — traçabilité de toutes les mutations
- `rate_limit_chatbot` — quotas chatbot anonyme / authentifié

Fonctions clés : `get_my_role()`, `is_admin()`, `can_edit_projet()`, `match_documents()`.
Vues publiques : `v_stats_publiques`, `v_projets_publics`.

---

## 7. Règles de qualité du code

1. **TypeScript strict** — pas de `any`, pas de `@ts-ignore` sans commentaire explicatif
2. **Server Components par défaut** — `'use client'` uniquement pour l'interactivité réelle
3. **Pas de CSS-in-JS** — Tailwind uniquement, classes groupées dans `cn()` si long
4. **Composants < 200 lignes** — au-delà, on découpe
5. **Tests obligatoires** pour : logique RAG, parsers CREXE, endpoints API
6. **Commits conventionnels** : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
7. **PRs avec description** : ce qui change, pourquoi, captures d'écran si UI

---

## 8. Règles spécifiques au chatbot

1. **Toujours citer les sources** — chaque réponse se termine par `Sources : [P14 — rapport 2025, section 3.2] [P15 — enquête bénéficiaires]`
2. **Ne jamais inventer de chiffres** — si le RAG ne remonte pas l'info, dire "Cette information n'est pas présente dans le CREXE 2025"
3. **Ton professionnel OIF** — vouvoiement, terminologie officielle (ODD, AGR, EFH, CAD-OCDE)
4. **Réponses structurées** — chiffre-clé en tête, explication, contexte
5. **Refuser hors-sujet** — rediriger poliment vers les sujets CREXE
6. **Streaming obligatoire** — UX de type ChatGPT, pas d'attente muette

---

## 9. Conventions de nommage

- Composants : `PascalCase` (ex. `ProjetCercleImpact.tsx`)
- Fonctions et variables : `camelCase` (ex. `fetchProjetById`)
- Constantes : `SCREAMING_SNAKE_CASE` (ex. `MAX_TOKENS_REPONSE`)
- Fichiers utilitaires : `kebab-case` (ex. `normalize-crexe.ts`)
- Tables SQL et colonnes : `snake_case` en français (ex. `projets`, `nombre_beneficiaires`)

---

## 10. Ce que tu ne dois jamais faire, Claude Code

- Ne jamais committer de secrets (`.env.local` doit être dans `.gitignore` dès le départ)
- Ne jamais inventer des données CREXE fictives — si les données réelles ne sont pas fournies, créer un seed clairement marqué `SEED_DEMO` dans un fichier séparé
- Ne jamais utiliser `localStorage` pour des données sensibles
- Ne jamais déployer en prod sans passer par un environnement de staging
- Ne jamais introduire de dépendance lourde sans le justifier dans la PR
- Ne jamais écrire de texte institutionnel en `Title Case` — respecter la casse française

---

## 11. État d'avancement (à mettre à jour)

- [ ] Phase 0 — Bootstrap du projet
- [ ] Phase 1 — Schéma de données et import CREXE
- [ ] Phase 2 — Landing page + design system
- [ ] Phase 3 — Fiches projets dynamiques
- [ ] Phase 4 — Dashboard et cartes
- [ ] Phase 5 — RAG et chatbot
- [ ] Phase 6 — Moteur d'exploration
- [ ] Phase 7 — Téléchargements (DOCX, PDF, HTML)
- [ ] Phase 8 — Tests, accessibilité, déploiement

---

## 12. Contacts et ressources

- Repo : https://github.com/rifalovi/crexe
- Données source : `/data/raw/CREXE_2025.pdf` (à fournir par l'équipe OIF)
- Identité visuelle : inspirée de oif.org (respect charte)
- Documentation Anthropic : https://docs.claude.com
- Documentation Supabase : https://supabase.com/docs
