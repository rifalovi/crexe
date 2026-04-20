# Passation CREXE → Claude Code

> Lis ce fichier en entier avant de faire quoi que ce soit.
> Il contient l'état exact du projet, ce qui vient d'être fait, et la prochaine tâche prioritaire.

---

## 1. Contexte du projet

**CREXE** est la plateforme digitale de l'Organisation internationale de la Francophonie (OIF).
Elle valorise les données du Compte-Rendu d'Exécution 2025 (CREXE 2025).

**Objectifs :**
- Visualiser l'impact global et par projet (dashboard + cartes)
- Raconter l'impact via des fiches projet "data storytelling"
- Explorer via un chatbot IA conversationnel adossé aux données CREXE

**Stack :** Next.js 16.2.4 (App Router) + TypeScript + Tailwind CSS v4 + Supabase + OpenAI GPT-4o + Vercel

---

## 2. État actuel — Ce qui est construit ✅

### Infrastructure
- Next.js 16.2.4 avec Turbopack, TypeScript strict, Tailwind CSS v4
- Supabase connecté : `https://avzwnypeppcrqcfyhvqv.supabase.co`
- Clés dans `.env.local` (ne jamais committer)
- Palette OIF dans `app/globals.css` — variables CSS `--oif-blue`, `--oif-purple`, `--oif-green`, etc.
- Git initialisé sur `https://github.com/rifalovi/crexe`

### Base de données — schéma v3 appliqué ✅
- `profils` — profils utilisateurs liés à auth.users (remplace user_profiles)
- `programmes_strategiques` — **3 PS officiels** (PS1, PS2, PS3) avec couleurs v3
- `projets` — **22 projets PROJ_AXX** seedés (tous en statut `brouillon`)
  - Colonnes : `code_officiel`, `statut`, `est_sous_projet`, `projet_parent_id`
  - Workflow : `brouillon → en_revue → publie → archive`
- `indicateurs`, `temoignages`, `pays`, `pays_couverture`
- `assignations_editeur` — N-N éditeur ↔ projet
- `invitations_editeur`, `rate_limit_chatbot`, `journal_audit`
- `documents_rag` — chunks vectorisés (pgvector 1536 dims)
- Fonctions : `get_my_role()`, `is_admin()`, `can_edit_projet()`
- Trigger `on_nouvel_utilisateur` → profil lecteur créé automatiquement
- Vue `v_stats_publiques`, Vue `v_projets_publics`

### Authentification ✅
- `proxy.ts` — protection des routes `/admin/*`
- Page `/login` — formulaire email/password Supabase Auth
- Layout admin — vérifie le rôle depuis table `profils`

### Interface d'administration (`/admin`) ✅
- `app/(admin)/layout.tsx` + `components/admin/AdminSidebar.tsx`
- `app/(admin)/admin/page.tsx` — dashboard KPIs
- `app/(admin)/admin/projets/page.tsx` — liste projets
- `app/(admin)/admin/projets/nouveau/page.tsx` — création + parseur IA (OpenAI GPT-4o)
- `app/(admin)/admin/programmes/page.tsx` — PS1/PS2/PS3 avec couleurs v3
- `app/(admin)/admin/utilisateurs/page.tsx` — gestion rôles (table `profils`)

### Landing page publique ✅ — Phase 2 terminée
- `app/page.tsx` — Server Component complet
  - Nav OIF, hero avec stats dynamiques, section 3 PS (bleu/violet/vert)
  - Grille projets publiés (état vide élégant si aucun publié)
  - Footer institutionnel + licence CC BY-NC-SA

---

## 3. Nomenclature officielle — CRITIQUE ⚠️

**Codes projets OIF :** `PROJ_A14`, `PROJ_A01a`, `PROJ_A16b`, etc.
**Jamais :** P14, P15, etc. (obsolète)

**3 Programmes Stratégiques :**
- PS1 — Langue, cultures et éducation → `#003DA5` (bleu)
- PS2 — Démocratie et gouvernance → `#6B2C91` (violet)
- PS3 — Développement durable → `#0F6E56` (vert)

---

## 4. Prochaine tâche prioritaire — Phase 3 🔲

### Phase 3 — Fiche projet dynamique

**Avant de coder :**

1. Lire `data/structured/P14.json` pour comprendre la structure des données de PROJ_A14
2. Passer PROJ_A14 en statut publie dans Supabase SQL Editor :
   ```sql
   UPDATE projets SET statut = 'publie' WHERE id = 'PROJ_A14';
   ```
3. Importer les données complètes de P14.json dans Supabase (indicateurs, temoignages, pays_couverture, cercles_impact)

**Routes à créer :**
- `app/(public)/projets/page.tsx` — liste des projets publiés avec filtres PS
- `app/(public)/projets/[id]/page.tsx` — fiche d'un projet (Server Component)

**Composants à créer :**
- `components/visuals/CercleImpact.tsx` — SVG concentrique des 4 cercles d'impact
- `components/shared/BadgePreuve.tsx` — badge coloré mesure/estimation/observation/institutionnel

**Cercles d'impact (depuis colonne `cercles_impact` JSONB) :**
- Cœur : investissement financier
- Niveau 1 : bénéficiaires directes (mesure)
- Niveau 2 : familles transformées (estimation)
- Niveau 3 : communautés mobilisées (observation)
- Niveau 4 : espace francophone (institutionnel)

**Contenu de la fiche :**
- Hero avec nom, accroche, badge PS coloré
- Composant CercleImpact
- Indicateurs KPIs avec BadgePreuve
- Témoignages (citation, auteur, pays)
- Pays de couverture (carte ou liste)
- Timeline événements

---

## 5. Ce qui reste à construire

- Phase 4 — Dashboard explorer + MapLibre (`app/(public)/explorer/page.tsx`)
- Phase 5 — Chatbot RAG OpenAI (`app/api/chat/route.ts` + `components/chat/ChatInterface.tsx`)
- Phase 6 — Page édition projet admin (`app/(admin)/admin/projets/[id]/page.tsx`)
- Phase 7 — Exports PDF/CSV
- Phase 8 — Tests, accessibilité WCAG AA, déploiement Vercel

---

## 6. Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://avzwnypeppcrqcfyhvqv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[dans .env.local]
SUPABASE_SERVICE_ROLE_KEY=[dans .env.local]
OPENAI_API_KEY=[dans .env.local]
```

---

## 7. Conventions

- TypeScript strict (pas de `any` sans commentaire)
- Server Components par défaut, `'use client'` uniquement si interactivité réelle
- Tailwind CSS uniquement
- Composants < 200 lignes
- `PascalCase` composants, `camelCase` fonctions, `snake_case` SQL
- Commits : `feat:`, `fix:`, `docs:`, `refactor:`
- Couleurs : toujours `var(--oif-blue)` etc.

---

## 8. Démarrage

```bash
cd ~/Downloads/Crexe
npm run dev
# → http://localhost:3000       (landing page publique)
# → http://localhost:3000/admin (interface admin)
# → http://localhost:3000/login (connexion)
```

---

## 9. Ressources

- Repo GitHub : https://github.com/rifalovi/crexe
- Supabase dashboard : https://supabase.com/dashboard/project/avzwnypeppcrqcfyhvqv
- Architecture complète : `files/ARCHITECTURE_CREXE.md`
- Schéma v3 complet : `files/schema_v3.sql`
- Données PROJ_A14 : `data/structured/P14.json`
- Migration appliquée : `docs/migration_v3_delta.sql`

---

*Mis à jour le 19 avril 2026 — Session Cowork CREXE*
*Prochaine tâche : Phase 3 — Fiche projet dynamique (PROJ_A14)*
