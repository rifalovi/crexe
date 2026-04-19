# Prompt d'amorçage — à coller dans Claude Code pour démarrer

---

## Étape 1 — Préparation (à faire manuellement avant de lancer Claude Code)

1. Cloner le repo localement :
   ```bash
   git clone https://github.com/rifalovi/crexe.git
   cd crexe
   ```
2. Installer Claude Code si nécessaire :
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
3. Copier les **4 fichiers de référence** fournis à la racine du repo :
   - `CLAUDE.md` (mémoire permanente — sera automatiquement lu par Claude Code)
   - `ROADMAP.md` (feuille de route en 8 phases)
   - `docs/schema.sql` (schéma base de données)
   - `data/structured/P14.json` (seed du projet pilote)
   - `lib/llm/prompts.ts` (prompts chatbot — à déplacer dans `/lib/llm/` après Phase 0)
4. Créer les comptes :
   - **Supabase** : https://supabase.com/dashboard → nouveau projet "crexe-prod"
   - **Anthropic API** : https://console.anthropic.com → récupérer une clé API
   - **Voyage AI** (optionnel, pour embeddings) : https://www.voyageai.com
   - **Vercel** : https://vercel.com → connecter le repo GitHub
5. Committer ces 4 fichiers :
   ```bash
   git add CLAUDE.md ROADMAP.md docs/ data/ lib/
   git commit -m "docs: initialisation de la documentation du projet"
   git push
   ```

---

## Étape 2 — Lancer Claude Code

Depuis la racine du repo :

```bash
claude
```

---

## Étape 3 — Premier message à envoyer à Claude Code

Copie-colle le prompt ci-dessous dans la session Claude Code. Il lui donne la vision, les contraintes et le point de départ.

---

```
Bonjour Claude,

Tu vas travailler sur le projet CREXE — la plateforme digitale de valorisation
des projets de l'Organisation internationale de la Francophonie (OIF).

AVANT DE COMMENCER :

1. Lis attentivement le fichier CLAUDE.md à la racine. C'est la mémoire
   permanente du projet — tu dois la respecter strictement.

2. Lis ROADMAP.md qui définit les 8 phases livrables. Nous allons les
   traiter dans l'ordre, une par une.

3. Lis docs/schema.sql et data/structured/P14.json pour comprendre la
   structure des données.

4. Lis lib/llm/prompts.ts pour comprendre comment le chatbot doit se
   comporter.

MÉTHODE DE TRAVAIL :

- Tu commences par la Phase 0 (Bootstrap) et tu ne passes à la Phase 1
  qu'APRÈS validation explicite de ma part.

- Pour chaque tâche : tu proposes d'abord ton plan, tu attends mon accord,
  puis tu exécutes. Pas d'action destructive sans confirmation.

- Tu committes à la fin de chaque phase avec un message clair
  (format conventional commits).

- Si tu ne comprends pas une instruction, tu poses UNE question précise.
  Pas de suppositions silencieuses.

- Tu mets à jour la checklist "État d'avancement" dans CLAUDE.md à la fin
  de chaque phase.

PREMIÈRE TÂCHE :

Commence par la Phase 0 — Bootstrap du projet. Propose-moi ton plan
détaillé (quelles commandes tu vas lancer, dans quel ordre, avec quelles
options). Je validerai avant que tu n'exécutes.

Prends en compte que le repo est déjà créé sur GitHub mais vide. Tu dois
donc initialiser Next.js sans écraser le .git existant.

À toi.
```

---

## Étape 4 — Workflow recommandé pour chaque phase

Pour chaque phase :

1. **Claude Code propose un plan détaillé** → tu lis, tu corriges, tu valides
2. **Claude Code exécute** → il montre les fichiers créés et les commandes lancées
3. **Tu testes** localement (`npm run dev`) + éventuellement en staging Vercel
4. **Tu valides** ou tu demandes des corrections
5. **Claude Code committe** avec un message conventional commit
6. **Tu pousses** sur `main` (ou sur une branche si tu préfères travailler en PR)
7. **Vercel déploie automatiquement** — tu vérifies l'URL de preview/prod

---

## Étape 5 — Variables d'environnement à configurer

Dans `.env.local` (jamais committé) et dans les settings Vercel (prod) :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Anthropic (chatbot)
ANTHROPIC_API_KEY=sk-ant-...

# Voyage AI (embeddings) — optionnel, fallback OpenAI possible
VOYAGE_API_KEY=pa-...

# Si fallback OpenAI pour les embeddings
OPENAI_API_KEY=sk-...

# Configuration
NEXT_PUBLIC_SITE_URL=https://crexe.vercel.app
```

---

## Étape 6 — Commandes utiles pendant le développement

```bash
# Démarrer en local
npm run dev

# Lancer les tests
npm test                    # unitaires
npm run test:e2e            # end-to-end

# Vérifier les types
npm run type-check

# Linter
npm run lint

# Build de production (toujours tester avant de push)
npm run build

# Régénérer les types Supabase après modification du schéma
npx supabase gen types typescript --project-id=XXX > types/database.ts
```

---

## Étape 7 — Que faire si quelque chose casse

1. **Erreur de build** → Claude Code a accès aux logs, demande-lui :
   "L'erreur suivante apparaît : [coller]. Peux-tu diagnostiquer et corriger ?"
2. **Supabase ne répond pas** → vérifie dans le dashboard si le projet est
   actif (il se met en pause après 7 jours sans activité sur le plan gratuit)
3. **Le chatbot ne trouve rien** → vérifie que les embeddings ont bien été
   générés (table `documents_rag` non vide) et que l'index vectoriel existe
4. **Un composant ne rend pas** → vérifie qu'il n'est pas `'use client'` alors
   qu'il devrait être Server Component (ou l'inverse)

---

## Étape 8 — Après le déploiement

Une fois en production, propose ces actions complémentaires à Claude Code :

- "Ajoute un système d'analytics RGPD-compatible (Plausible ou Umami)"
- "Crée un back-office simple pour que l'équipe OIF ajoute elle-même
   de nouveaux projets"
- "Ajoute l'export CSV des indicateurs pour les chercheurs"
- "Implémente le multilingue FR/EN avec next-intl"
- "Optimise les images avec next/image et Sharp"

---

## Annexe — Philosophie de ce document

Ces instructions appliquent trois principes méthodologiques que vous pouvez
réutiliser sur d'autres projets :

**1. Séparation mémoire / action**
`CLAUDE.md` est la mémoire (relue à chaque session).
`ROADMAP.md` est le plan d'action (consulté seulement quand on travaille
dessus).
Les prompts ponctuels sont les instructions tactiques.

**2. Phases livrables plutôt que features**
Chaque phase produit quelque chose qu'on peut voir tourner, et non pas une
accumulation de briques techniques. Cela évite l'effet "tunnel" où on
travaille 3 semaines sans rien montrer.

**3. Critères d'acceptation explicites**
À chaque phase, des cases à cocher qui définissent objectivement quand
c'est fini. Évite les débats subjectifs sur "est-ce prêt ?".
