# Feuille de route CREXE — 8 phases livrables

> À exécuter dans l'ordre, une phase à la fois. Chaque phase produit un livrable testable avant de passer à la suivante. À la fin de chaque phase, cocher la case correspondante dans `CLAUDE.md` et committer.

---

## Phase 0 — Bootstrap du projet (1-2 heures)

**Objectif :** repo propre, stack installée, premier déploiement Vercel fonctionnel.

### Tâches

1. Initialiser Next.js 15 avec TypeScript, Tailwind, App Router, ESLint :
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --import-alias="@/*"
   ```
2. Installer les dépendances de base :
   ```bash
   npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk zod lucide-react clsx tailwind-merge class-variance-authority
   npm install -D @types/node vitest @testing-library/react @playwright/test
   ```
3. Initialiser shadcn/ui :
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add button card badge input select dialog sheet tabs skeleton
   ```
4. Créer la structure de dossiers définie dans `CLAUDE.md` section 5.
5. Déclarer les variables CSS (palette OIF) dans `app/globals.css` section `@layer base`.
6. Configurer `.env.local` avec variables placeholders + `.env.example` committé :
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ANTHROPIC_API_KEY=
   VOYAGE_API_KEY=
   ```
7. Configurer `.gitignore` correctement (node_modules, .env.local, .next, coverage).
8. Créer la page d'accueil placeholder qui affiche juste « CREXE — Plateforme en construction » dans le style institutionnel.
9. Committer et pousser sur `main`. Connecter le repo à Vercel.

### Critère d'acceptation

- [ ] Le site est accessible sur une URL Vercel `crexe-xxx.vercel.app`
- [ ] La page d'accueil affiche le titre dans la bonne palette
- [ ] Aucun secret n'est committé
- [ ] `npm run build` passe sans warning

---

## Phase 1 — Schéma de données et import CREXE (3-4 heures)

**Objectif :** base Supabase prête, schéma créé, P14 importé comme projet-test.

### Tâches

1. Créer un projet Supabase, noter l'URL et les clés.
2. Activer l'extension `vector` dans Supabase (SQL editor) :
   ```sql
   create extension if not exists vector;
   ```
3. Créer le schéma de données en exécutant `/docs/schema.sql` (voir fichier fourni).
4. Créer les clients Supabase dans `/lib/supabase/` :
   - `client.ts` (browser)
   - `server.ts` (Server Components)
   - `admin.ts` (service role, usage serveur uniquement)
5. Créer les types TypeScript dans `/types/database.ts` :
   ```bash
   npx supabase gen types typescript --project-id=XXX > types/database.ts
   ```
6. Créer le seed du projet P14 dans `/data/structured/P14.json` (utiliser exactement les données du document CREXE fourni — 9 475 femmes, 4,3 M€, 31 pays, etc.).
7. Écrire le script d'import `/data/seeds/import-projet.ts` qui lit un JSON et insère dans Supabase.
8. Exécuter l'import pour P14 :
   ```bash
   npx tsx data/seeds/import-projet.ts P14
   ```
9. Vérifier dans Supabase que les tables `projets`, `indicateurs`, `temoignages`, `pays_couverture` contiennent bien les données P14.

### Critère d'acceptation

- [ ] Les 6 tables sont créées avec leurs contraintes
- [ ] P14 est présent dans `projets` avec les 31 pays liés
- [ ] Les 13 indicateurs d'enquête (66 %, 87 %, etc.) sont dans `indicateurs`
- [ ] Au moins 3 témoignages sont dans `temoignages` avec URL source
- [ ] Les types TypeScript sont générés et utilisables

---

## Phase 2 — Landing page et design system (4-5 heures)

**Objectif :** homepage institutionnelle avec impact global, composants UI réutilisables.

### Tâches

1. Créer les composants de base dans `/components/ui` et `/components/shared` :
   - `Header` (navigation : Projets, Explorer, À propos)
   - `Footer` (OIF, mentions légales, sources CREXE)
   - `ChiffreCle` (grand chiffre + libellé + source)
   - `BadgeTypePreuve` (Mesuré / Estimé / Observé / Institutionnel)
   - `CarteProjet` (card projet compacte)
2. Créer la landing page `/app/(public)/page.tsx` avec **4 sections verticales** :
   - **Hero** : titre stratégique + chiffre global (ex. "Plus de 50 projets, 80 pays francophones mobilisés") + CTA "Explorer les projets"
   - **Impact global** : 4 `ChiffreCle` en grille (total bénéficiaires, pays, budget, projets actifs) calculés depuis Supabase
   - **Projets phares** : 3 `CarteProjet` en grille (P14, + 2 autres quand importés)
   - **À propos du CREXE** : 2-3 paragraphes éditoriaux + lien vers la page méthodologie
3. Animer à l'arrivée en viewport (fade-in doux via Intersection Observer ou Framer Motion — légèreté maximale, pas de 3D).
4. S'assurer que tout est responsive mobile (breakpoints Tailwind `sm`, `md`, `lg`).

### Critère d'acceptation

- [ ] La homepage charge en moins de 2 s en production
- [ ] Tous les chiffres viennent de Supabase, aucune donnée hardcodée
- [ ] Score Lighthouse Performance > 90, Accessibilité > 95
- [ ] Lecture mobile agréable (pas de débordement, tap-targets > 44px)

---

## Phase 3 — Fiches projets dynamiques (5-6 heures)

**Objectif :** route `/projets/[id]` avec data storytelling complet (cercles d'impact).

### Tâches

1. Créer la route dynamique `/app/(public)/projets/[id]/page.tsx` en Server Component (fetch Supabase côté serveur).
2. Construire la page en **5 blocs narratifs verticaux** :
   - **Bloc 1 — En-tête** : éyebrow (Programme stratégique), titre, accroche, méta (pays, budget, taux d'exécution, période)
   - **Bloc 2 — Visuel cercles d'impact** : composant SVG `CercleImpact` dans `/components/visuals/` (réutiliser la structure du visuel v2 du P14)
   - **Bloc 3 — Résultats concrets** : grille de KPIs (composant `GrilleIndicateurs`)
   - **Bloc 4 — Changements observés** : témoignages (composant `CarteTemoignage` avec citation, source, lien vidéo si présent)
   - **Bloc 5 — Impacts structurants** : liste narrative des effets systémiques + partenariats
3. Implémenter le composant `CercleImpact` avec 4 cercles concentriques SVG, paramétrable via props :
   ```tsx
   <CercleImpact
     coeur={{ valeur: "4,3 M€", label: "Investissement" }}
     niveau1={{ valeur: "9 475 femmes", label: "Bénéficiaires directes" }}
     niveau2={{ valeur: "≈ 47 000 personnes", label: "Familles transformées", estimation: true }}
     niveau3={{ label: "Communautés mobilisées", description: "..." }}
     niveau4={{ label: "Espace francophone", description: "..." }}
   />
   ```
4. Ajouter un bouton "Télécharger la fiche" qui déclenche la génération DOCX (Phase 7).
5. Côté SEO : générer les `metadata` dynamiques (Open Graph image, description, titre).

### Critère d'acceptation

- [ ] `/projets/P14` affiche toutes les données correctement
- [ ] Le visuel cercles est responsive et accessible (role=img, title, desc)
- [ ] Les témoignages affichent la citation + lien source cliquable
- [ ] Un projet inexistant renvoie une 404 propre (`notFound()`)

---

## Phase 4 — Dashboard et cartes (5-6 heures)

**Objectif :** page d'exploration visuelle avec filtres et carte interactive.

### Tâches

1. Créer `/app/(public)/explorer/page.tsx` avec trois vues commutables via `Tabs` shadcn :
   - **Vue Liste** : grille de `CarteProjet` filtrables
   - **Vue Carte** : MapLibre GL avec les 80+ pays francophones, markers par projet, cluster si chevauchement
   - **Vue Statistiques** : graphiques Recharts (évolution temporelle, répartition par PS, top 10 pays bénéficiaires)
2. Implémenter les filtres dans un panneau latéral (composant `FiltresProjets`) :
   - Programme stratégique (multi-select)
   - Pays (multi-select avec recherche)
   - Thématique (jeunesse, numérique, égalité, environnement, langue, gouvernance)
   - Année d'exercice (slider)
3. Synchroniser les filtres avec l'URL (`?ps=PS2&pays=BJ,MG`) pour partage et deep-linking.
4. Installer MapLibre : `npm install maplibre-gl`. Utiliser un fond Carto Voyager gratuit.
5. Composant `CarteMondeFrancophonie` dans `/components/visuals/` avec intensité colorimétrique selon le nombre de projets par pays (choroplèthe).

### Critère d'acceptation

- [ ] Les 3 vues sont fonctionnelles et cohérentes
- [ ] Les filtres rafraîchissent la liste sans rechargement complet
- [ ] L'URL reflète les filtres sélectionnés
- [ ] La carte s'affiche proprement sur mobile (hauteur 60vh)

---

## Phase 5 — RAG et chatbot (6-8 heures)

**Objectif :** assistant IA conversationnel qui répond à partir du CREXE avec citation des sources.

### Tâches

1. **Chunking et embeddings** — créer `/lib/embeddings/chunk-crexe.ts` :
   - Découper le CREXE 2025 en chunks de 500-800 tokens avec chevauchement de 100 tokens
   - Chaque chunk conserve ses métadonnées : `projet_id`, `section`, `type_contenu` (narratif, indicateur, témoignage, partenariat)
   - Générer embeddings via Voyage AI (ou OpenAI `text-embedding-3-small` en fallback)
   - Insérer dans `documents_rag` avec le vecteur
2. **Endpoint de recherche sémantique** — `/app/api/search/route.ts` :
   - Recevoir une requête utilisateur
   - Embed la requête
   - Récupérer les 8 chunks les plus pertinents via `match_documents` (fonction SQL)
   - Re-ranker avec un filtre sur la pertinence > 0.7
   - Retourner les chunks avec leurs métadonnées
3. **Endpoint chatbot** — `/app/api/chat/route.ts` :
   - Recevoir l'historique de conversation
   - Appeler le endpoint `/api/search` pour récupérer le contexte
   - Construire le prompt système (voir plus bas)
   - Streamer la réponse Claude via l'API Anthropic avec `stream: true`
   - Imposer au format : **chiffre-clé en gras + analyse + sources**
4. **UI du chat** — `/components/chat/ChatFlottant.tsx` :
   - Bouton flottant en bas à droite (logo ampoule + badge "IA")
   - Panneau qui s'ouvre en Sheet (shadcn) occupant 1/3 droit de l'écran sur desktop, plein écran sur mobile
   - Messages avec avatar utilisateur / avatar IA (pastille bleu OIF)
   - Affichage des sources sous chaque réponse IA (pastilles cliquables qui ouvrent la fiche projet concernée)
   - Suggestions prédéfinies au démarrage : "Impact du P14 ?", "Projets en Afrique ?", "Combien de jeunes formés ?"
5. **Prompt système** (à mettre dans un fichier `/lib/llm/prompts.ts`) — voir fichier séparé fourni.

### Critère d'acceptation

- [ ] Poser "Quel est l'impact du P14 ?" renvoie une réponse structurée avec les bons chiffres
- [ ] Chaque réponse affiche au moins une source cliquable
- [ ] Une question hors-sujet ("Quelle est la recette de la bouillabaisse ?") est poliment refusée
- [ ] Le streaming fonctionne (texte apparaît progressivement)
- [ ] Les données inventées sont proscrites (test : "Combien de vélos distribués ?" → doit dire "Information absente")

---

## Phase 6 — Moteur d'exploration intelligent (3-4 heures)

**Objectif :** barre de recherche globale avec suggestions et navigation rapide.

### Tâches

1. Créer un composant `BarreRechercheGlobale` accessible depuis n'importe quelle page (raccourci `Cmd/Ctrl + K`).
2. Utiliser `cmdk` (via shadcn Command) pour le palette de recherche.
3. Indexer côté Supabase :
   - Nom de projet
   - Mots-clés thématiques
   - Noms de pays
4. Proposer 3 catégories de suggestions :
   - **Projets** (ex. "P14 — La Francophonie avec Elles")
   - **Pays** (ex. "Voir les projets au Bénin")
   - **Thématiques** (ex. "Égalité femmes-hommes")
5. Ajouter en bas du panneau un lien "Poser la question à l'assistant IA →" qui pré-remplit le chat.

### Critère d'acceptation

- [ ] `Cmd+K` ouvre la barre depuis toute page
- [ ] La recherche debounced (200 ms) pour éviter les appels excessifs
- [ ] Navigation au clavier fluide (flèches + entrée)
- [ ] Mobile : bouton "Rechercher" dans le header qui ouvre le palette en plein écran

---

## Phase 7 — Téléchargements (DOCX, PDF, HTML) (4 heures)

**Objectif :** bouton "Télécharger la fiche" qui génère les 3 formats à la volée.

### Tâches

1. Créer `/app/api/export/[projet_id]/[format]/route.ts` avec format ∈ {`docx`, `pdf`, `html`}.
2. Pour **DOCX** — utiliser `docx` (bibliothèque npm) :
   - Reproduire la structure du document `P14_fiche_impact_editable.docx` fourni
   - Récupérer les données du projet depuis Supabase
   - Retourner un stream binaire avec `Content-Disposition: attachment`
3. Pour **HTML** — générer un fichier autonome reprenant la structure de `P14_visuel_impact_editable.html` avec les données dynamiques.
4. Pour **PDF** — utiliser `@react-pdf/renderer` (composants React → PDF) ou `puppeteer` (rendu de la page web) selon la complexité visuelle requise.
5. UI : bouton `DropdownMenu` sur chaque fiche projet avec les 3 formats.

### Critère d'acceptation

- [ ] Le DOCX généré pour P14 contient les mêmes sections que le fichier de référence
- [ ] Le HTML est autonome (aucune dépendance externe, ouvre hors ligne)
- [ ] Le PDF respecte la palette et reste lisible en impression noir et blanc

---

## Phase 8 — Tests, accessibilité, déploiement (4-5 heures)

**Objectif :** qualité production, documentation, mise en ligne.

### Tâches

1. **Tests unitaires** (Vitest) :
   - `/lib/embeddings/chunk-crexe.test.ts`
   - `/lib/rag/retrieval.test.ts`
   - Fonctions de parsing des indicateurs
2. **Tests E2E** (Playwright) :
   - Parcours : landing → fiche projet → téléchargement DOCX
   - Parcours : ouverture chat → question → réponse avec sources
   - Parcours : filtres explorer → résultats cohérents
3. **Accessibilité** :
   - Audit Axe sur les 4 pages principales
   - Corriger les contrastes si < 4.5:1
   - Vérifier la navigation clavier complète
   - Ajouter `aria-label` manquants
4. **SEO** :
   - `sitemap.xml` dynamique
   - `robots.txt`
   - Open Graph images auto-générées via `next/og`
5. **Documentation** :
   - `README.md` à la racine (installation, variables, scripts)
   - `/docs/architecture.md` (schéma du flux RAG)
   - `/docs/comment-ajouter-projet.md` (guide pour l'équipe OIF)
6. **Déploiement** :
   - Variables de prod configurées sur Vercel
   - Domaine custom si disponible (`crexe.francophonie.org` ou équivalent)
   - Monitoring : Vercel Analytics + Sentry (optionnel)

### Critère d'acceptation

- [ ] Couverture de tests > 60 % sur `/lib`
- [ ] Score Lighthouse > 90 sur toutes les métriques
- [ ] Audit Axe sans erreur critique
- [ ] README complet et à jour
- [ ] Site accessible en production

---

## Après la Phase 8 — Évolutions possibles

- Authentification OIF (SSO) pour un back-office d'édition
- Système de versioning des rapports (CREXE 2025, 2026, 2027…)
- Export de visualisations personnalisées (image PNG à la demande)
- Multilingue complet (EN, ES, AR, PT)
- Analytics d'usage internes (sans tracking tiers RGPD-incompatible)
- Notifications par email pour les nouveaux projets ajoutés
