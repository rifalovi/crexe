# 🎯 PROMPT FINAL — À envoyer à Claude Code

> Ce prompt consolide TOUTES les décisions prises jusqu'ici. Il remplace
> les précédents prompts d'amorçage et de mise à jour. À copier-coller
> dans Claude Code après avoir intégré les fichiers au repo.

---

## Étape 1 — Intégrer les fichiers au repo local

Depuis votre machine, dans le dossier du repo CREXE :

```bash
cd crexe

# Créer l'arborescence
mkdir -p docs data/structured lib/llm

# Placer les fichiers fournis (ajuster les chemins source)
cp ~/Downloads/CLAUDE.md ./CLAUDE.md
cp ~/Downloads/ROADMAP.md ./ROADMAP.md
cp ~/Downloads/CLAUDE_ADDENDUM_RBAC.md ./docs/
cp ~/Downloads/schema_v3.sql ./docs/schema.sql
cp ~/Downloads/P14_seed.json ./data/structured/PROJ_A14.json
cp ~/Downloads/prompts.ts ./lib/llm/prompts.ts

# Committer la structure initiale
git add .
git commit -m "docs: initialisation documentation et seed PROJ_A14"
git push
```

---

## Étape 2 — Lancer Claude Code

```bash
claude
```

---

## Étape 3 — Coller ce prompt dans Claude Code

```
Bonjour Claude,

Tu vas développer la plateforme CREXE — Compte-Rendu d'Exécution de
l'Organisation internationale de la Francophonie (OIF).

═══════════════════════════════════════════════════════════════════
LECTURE OBLIGATOIRE AVANT TOUTE ACTION
═══════════════════════════════════════════════════════════════════

Lis ces fichiers dans cet ordre précis :

1. CLAUDE.md (racine) — règles du projet et conventions
2. docs/CLAUDE_ADDENDUM_RBAC.md — architecture des rôles
3. ROADMAP.md (racine) — feuille de route en 8 phases
4. docs/schema.sql — modèle de données complet
5. data/structured/PROJ_A14.json — exemple de données projet
6. lib/llm/prompts.ts — prompts du chatbot

═══════════════════════════════════════════════════════════════════
SYNTHÈSE DES CHOIX D'ARCHITECTURE (NE PAS RENÉGOCIER)
═══════════════════════════════════════════════════════════════════

A. NOMENCLATURE : les projets utilisent les codes officiels OIF
   (PROJ_A01a, PROJ_A14, PROJ_A16b, etc.) — jamais P14.

B. PROGRAMMES STRATÉGIQUES : 3 PS officiels avec palette dédiée :
   - PS1 "Langue, cultures et éducation" → bleu #003DA5
   - PS2 "Démocratie et gouvernance" → violet #6B2C91
   - PS3 "Développement durable" → vert #0F6E56

C. 22 PROJETS déjà déclarés dans le seed SQL. NE PAS en créer d'autres
   sans validation. Seul PROJ_A14 a des données complètes pour l'instant.

D. ACCÈS FRONT-END : PUBLIC
   - Les projets publiés sont visibles sans login
   - SEO activé, pages indexables par Google
   - Chatbot accessible aux anonymes AVEC rate limiting obligatoire
     (10 requêtes/heure anonyme, 50 utilisateur connecté)

E. INSCRIPTION : LIBRE
   - Toute personne peut créer un compte via /inscription
   - Confirmation email obligatoire (configurer Supabase Auth)
   - Captcha hCaptcha ou reCAPTCHA v3 sur l'inscription
   - Nouveau compte = rôle "lecteur" par défaut
   - Promotion en "éditeur" ou "admin" : uniquement par un admin

F. ÉDITEURS : ASSIGNATION PAR PROJET (table assignations_editeur)
   - Un éditeur peut être assigné à N projets (pas par PS)
   - Un projet peut avoir N éditeurs
   - L'admin gère les assignations depuis /admin/assignations

G. WORKFLOW DE PUBLICATION :
   brouillon → en_revue → publie → (archive)
   - Éditeur assigné : peut passer un projet en "en_revue"
   - Admin : peut publier et archiver
   - Seuls les projets "publie" sont visibles au public

═══════════════════════════════════════════════════════════════════
MÉTHODOLOGIE DE TRAVAIL
═══════════════════════════════════════════════════════════════════

1. Tu exécutes les 8 phases du ROADMAP dans l'ORDRE.

2. Pour CHAQUE phase :
   (a) Tu proposes un plan détaillé (commandes, fichiers à créer,
       dépendances à ajouter).
   (b) Tu attends mon accord écrit.
   (c) Tu exécutes.
   (d) Tu testes localement (npm run dev) et vérifies que rien
       n'est cassé.
   (e) Tu committes avec un message conventional commit clair.
   (f) Tu pousses sur main (sauf si je demande une branche).
   (g) Tu coches la case correspondante dans CLAUDE.md section 11.

3. Tu ne passes JAMAIS à la phase suivante sans ma validation
   explicite de la phase en cours.

4. Si tu rencontres une ambiguïté, tu poses UNE question précise et
   tu attends la réponse. Pas de supposition silencieuse.

5. Tu ne committes JAMAIS de secret (clé API, token, mot de passe).
   Vérifier .gitignore avant chaque commit.

═══════════════════════════════════════════════════════════════════
PHASES À INTÉGRER (AVEC LES PHASES AJOUTÉES POUR LE RBAC)
═══════════════════════════════════════════════════════════════════

Phase 0 — Bootstrap Next.js 15 + Tailwind + shadcn
Phase 1 — Supabase : exécuter schema.sql + import PROJ_A14
Phase 1.5 — Authentification : login, signup, middleware, sessions
Phase 2 — Landing page publique + design system
Phase 3 — Fiches projets dynamiques (lecture publique)
Phase 4 — Dashboard, carte MapLibre, filtres
Phase 4.5 — Back-office éditeur (/edition/*)
Phase 4.6 — Administration (/admin/*) : users, assignations, audit
Phase 5 — RAG et chatbot avec rate limiting
Phase 6 — Moteur de recherche globale (Cmd+K)
Phase 7 — Téléchargements DOCX/PDF/HTML
Phase 8 — Tests, accessibilité, SEO, déploiement prod

═══════════════════════════════════════════════════════════════════
PREMIÈRE ACTION
═══════════════════════════════════════════════════════════════════

Maintenant :

1. Lis les 6 fichiers listés plus haut.
2. Dresse-moi un état des lieux :
   - Ce que tu as compris du projet
   - Les 3 points les plus critiques à respecter selon toi
   - Les éventuelles contradictions ou zones de flou que tu identifies
     dans les documents
3. Présente-moi ton plan détaillé pour la Phase 0 (Bootstrap).
4. Attends mon accord avant d'exécuter quoi que ce soit.

Le repo GitHub existe déjà mais est vide. Tu vas devoir initialiser
Next.js 15 SANS écraser le .git existant.

À toi.
```

---

## Étape 4 — Actions manuelles après la Phase 1

Une fois la Phase 1 terminée, il vous faudra faire **une action manuelle
unique** pour créer le premier admin :

1. Vous inscrire normalement via le formulaire `/inscription` (vous serez
   lecteur par défaut)
2. Ouvrir le SQL Editor de Supabase
3. Exécuter :

```sql
-- Promouvoir votre compte en Admin
update profils
set role = 'admin', compte_verifie_oif = true
where email = 'votre_email@oif.org';

-- Vérification
select id, email, role, compte_verifie_oif from profils;
```

4. Vous déconnecter/reconnecter de l'application pour recharger votre
   session avec le nouveau rôle

Désormais, vous pourrez inviter les autres éditeurs et assigner les
projets depuis l'interface `/admin/assignations`.

---

## Configuration Supabase Auth à faire manuellement

Dans le dashboard Supabase :

### Auth → Settings → Authentication

- ☑ Email confirmation requise
- ☑ Secure email change requires confirmation
- Password min length : **12 caractères**
- Rate limiting sur signups : **5 par heure par IP**

### Auth → Email Templates

Personnaliser les 4 templates en français :
- Confirm signup
- Invite user
- Magic link
- Reset password

Modèle pour "Confirm signup" :
```
Bonjour,

Bienvenue sur la plateforme CREXE de l'Organisation internationale de
la Francophonie.

Pour activer votre compte, cliquez sur le lien ci-dessous :
{{ .ConfirmationURL }}

Ce lien expire dans 24 heures.

Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.

Cordialement,
L'équipe CREXE — OIF
```

### Auth → URL Configuration

- Site URL : `https://crexe.vercel.app` (ou votre domaine final)
- Redirect URLs autorisées :
  - `https://crexe.vercel.app/**`
  - `http://localhost:3000/**` (pour dev)

---

## Configuration des variables d'environnement (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # NE JAMAIS EXPOSER

# Anthropic (chatbot)
ANTHROPIC_API_KEY=sk-ant-...

# Embeddings (choisir UN des deux)
VOYAGE_API_KEY=pa-...
# OU
OPENAI_API_KEY=sk-...

# Captcha (inscription)
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=...
HCAPTCHA_SECRET=...

# Rate limiting chatbot
CHATBOT_ANON_RATE_LIMIT=10    # requêtes/heure pour anonymes
CHATBOT_AUTH_RATE_LIMIT=50    # requêtes/heure pour authentifiés

# Site
NEXT_PUBLIC_SITE_URL=https://crexe.vercel.app
```

---

## Points d'attention et pièges connus

### ⚠️ Piège 1 — Rate limiting du chatbot

Avec le front-end public et Claude API payante, un visiteur mal
intentionné peut vider votre budget en une heure. Le rate limiting
n'est pas optionnel — il DOIT être en place dès la Phase 5.

Stratégie en cascade :
1. Limite par IP (anonymes) : 10/heure
2. Limite par compte (authentifiés) : 50/heure
3. Limite globale plateforme : 10 000/jour (kill switch si dépassé)

### ⚠️ Piège 2 — Scraping et SEO

Comme le site est public, des scrapers peuvent copier vos données.
Deux stratégies complémentaires :
1. Robots.txt permissif pour Google mais restrictif pour les autres
2. Licence Creative Commons BY-NC-SA affichée en footer (protège
   institutionnellement)

### ⚠️ Piège 3 — Comptes factices

Inscription libre = inscription de bots possible. Indispensables :
- Captcha sur l'inscription
- Email de confirmation obligatoire
- Détection d'abus : limite de 5 inscriptions par IP par heure

### ⚠️ Piège 4 — Fuite de données en brouillon

Les projets en `brouillon` ou `en_revue` ne doivent JAMAIS apparaître
publiquement, même en fuite via l'API. Les politiques RLS bloquent
cela côté base, mais Claude Code doit aussi vérifier côté application.

Test de validation : en mode incognito (non connecté), taper l'URL
directe d'un projet en brouillon. Doit renvoyer 404, pas les données.

### ⚠️ Piège 5 — Le premier Admin

Le premier admin n'est PAS invité (pas d'admin pour l'inviter). Il est
créé par inscription normale + update SQL manuel (voir Étape 4).

Documenter cela dans le README pour les futurs déploiements en
staging/dev.

---

## Calendrier indicatif

Selon la disponibilité (2h/jour en moyenne) :

| Semaine | Phases | Livrable visible |
|---|---|---|
| 1 | Phase 0 + 1 + 1.5 | Repo fonctionnel + login marche |
| 2 | Phase 2 + 3 | Landing + fiche PROJ_A14 publique |
| 3 | Phase 4 + 4.5 | Carte + back-office éditeur |
| 4 | Phase 4.6 + 5 | Admin + chatbot fonctionnel |
| 5 | Phase 6 + 7 | Recherche + exports |
| 6 | Phase 8 | Tests, accessibilité, mise en prod |

**Total estimé : 6 semaines à temps partiel, ou 2-3 semaines à temps
plein.**

---

## Questions fréquentes à anticiper

**"Et si je veux aussi un accès anonyme au chatbot depuis un autre
site (intégration iframe) ?"**
→ CORS à configurer. Une origine supplémentaire = une autorisation
explicite. À traiter en Phase 8 post-MVP.

**"L'inscription libre m'inquiète, on peut la fermer plus tard ?"**
→ Oui. C'est un simple changement dans Supabase Auth Settings. Pas de
migration de données. Les comptes existants restent valides.

**"Un éditeur peut-il devenir admin ?"**
→ Par un update SQL manuel uniquement (aucune auto-promotion). Garde-
fou institutionnel.

**"Comment un bailleur connaîtra-t-il la plateforme ?"**
→ Trois vecteurs à prévoir post-lancement :
   1. Lien depuis oif.org
   2. Annonce presse avec URL
   3. Invitations directes aux points de contact bailleurs
