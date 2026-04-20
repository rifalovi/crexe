# 🗺️ Architecture CREXE — Vue d'ensemble

> Document de référence synthétique. À afficher dans `/docs/architecture.md`
> du repo. Mis à jour le : {{date_de_deploiement}}

---

## 🎯 Vision en une phrase

CREXE est une plateforme publique de valorisation des projets de l'OIF,
avec un back-office éditorial restreint et un chatbot IA adossé aux
données du Compte-Rendu d'Exécution 2025.

---

## 📊 Les 3 couches fonctionnelles

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│                     FRONT-END PUBLIC (tout le monde)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐│
│  │   Landing   │  │ Fiches      │  │ Carte       │  │ Chatbot  ││
│  │   + stats   │  │ projets     │  │ monde       │  │ IA public││
│  │             │  │ publiés     │  │             │  │ (rate    ││
│  │             │  │             │  │             │  │ limité)  ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘│
│                                                                   │
│         ▲                                                         │
│         │  Aucun login requis                                     │
│         │  SEO indexable                                          │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│            BACK-OFFICE ÉDITEUR (lecteur → éditeur)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Mes projets │  │ Édition     │  │ Workflow                │  │
│  │ assignés    │  │ (indicateurs│  │ brouillon → en_revue    │  │
│  │             │  │ témoignages)│  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                                                                   │
│         ▲                                                         │
│         │  Login + rôle "éditeur" + assignation                   │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                 ADMINISTRATION (rôle admin uniquement)            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐│
│  │ Utilisateurs│  │ Assignations│  │ Publication │  │ Audit    ││
│  │ + rôles     │  │ éditeur     │  │ projets     │  │ log      ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘│
│                                                                   │
│         ▲                                                         │
│         │  Login + rôle "admin"                                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🧑 Les 3 rôles — vision synthétique

### Utilisateur anonyme (visiteur public)

```
CE QU'IL VOIT :
  ✅ Landing page, statistiques globales
  ✅ Liste des projets publiés
  ✅ Fiche complète de chaque projet publié
  ✅ Carte monde avec filtres
  ✅ Chatbot IA (limité à 10 requêtes/heure)
  ✅ Téléchargements (DOCX/PDF/HTML) des projets publiés

CE QU'IL NE VOIT PAS :
  ❌ Projets en brouillon ou en revue
  ❌ Back-office, aucune zone d'édition
```

### Lecteur (compte créé par inscription libre)

```
ACTIONS POSSIBLES EN PLUS :
  ✅ Sauvegarder des projets favoris
  ✅ Chatbot avec quota élargi (50 requêtes/heure)
  ✅ Commenter (si feature activée plus tard)

AUCUN accès au back-office.
```

### Éditeur (rôle promu par un Admin)

```
RESTE LECTEUR sur tout le site public ET :
  ✅ Accès à /edition/* pour SES projets assignés uniquement
  ✅ Modifier indicateurs, témoignages, cercles d'impact
  ✅ Soumettre un projet en "en_revue"
  ✅ Aperçu avant publication

CE QU'IL NE PEUT PAS :
  ❌ Publier directement (seul l'Admin publie)
  ❌ Modifier les projets non assignés
  ❌ Gérer les utilisateurs
  ❌ Modifier la taxonomie (PS, pays, thématiques)
```

### Admin (rôle promu par un SQL manuel puis par un autre Admin)

```
TOUT CE QU'UN ÉDITEUR PEUT, PARTOUT, PLUS :
  ✅ Gérer tous les utilisateurs (promotion, désactivation)
  ✅ Assigner les éditeurs aux projets
  ✅ Publier/archiver les projets
  ✅ Modifier la taxonomie (PS, pays, thématiques)
  ✅ Consulter le journal d'audit
  ✅ Paramétrer la plateforme
```

---

## 📁 Arborescence des routes

```
PUBLIC (aucune authentification requise)
├── /                            Landing + stats globales
├── /projets                     Liste des projets publiés
├── /projets/[id]                Fiche d'un projet publié
├── /explorer                    Carte + filtres
├── /a-propos                    Méthodologie
├── /a-propos/methodologie       Détails techniques
├── /inscription                 Créer un compte (Lecteur)
├── /connexion                   Se connecter
└── /mot-de-passe-oublie         Reset

AUTHENTIFIÉ (tous rôles)
├── /profil                      Mon profil
├── /profil/modifier             Modifier mes infos
└── /deconnexion

ÉDITEUR (rôle éditeur + projet assigné)
├── /edition                     Dashboard éditeur
├── /edition/projets             Mes projets assignés
└── /edition/projets/[id]        Édition d'un projet

ADMIN (rôle admin uniquement)
├── /admin                       Dashboard admin
├── /admin/utilisateurs          Liste des comptes
├── /admin/utilisateurs/[id]     Édition d'un compte
├── /admin/assignations          Gérer les assignations éditeurs
├── /admin/projets               Gérer tous les projets
├── /admin/projets/nouveau       Créer un projet
├── /admin/programmes            Gérer les 3 PS
├── /admin/taxonomies            Thématiques, pays
├── /admin/audit                 Journal d'audit
└── /admin/parametres            Paramètres plateforme

API
├── /api/chat                    Chatbot (streaming)
├── /api/search                  Recherche sémantique
├── /api/export/[id]/[format]    Export DOCX/PDF/HTML
└── /api/auth/callback           Callback Supabase Auth
```

---

## 🗄️ Modèle de données — vue synthétique

```
┌──────────────────┐
│  auth.users      │ (géré par Supabase)
└────────┬─────────┘
         │ 1-1
         ▼
┌──────────────────┐      ┌───────────────────────┐
│  profils         │◄────►│ assignations_editeur  │
│                  │ N-N  │ (table pivot)         │
│  role: enum      │      └───────────┬───────────┘
│  - admin         │                  │ N
│  - editeur       │                  │
│  - lecteur       │                  ▼
└──────────────────┘      ┌──────────────────────┐
                          │  projets             │
                          │                      │
                          │  id: PROJ_AXX        │
                          │  statut: enum        │
                          │  - brouillon         │
                          │  - en_revue          │
                          │  - publie            │
                          │  - archive           │
                          │                      │
                          │  ps_id ──────────────┼──► programmes_strategiques
                          │  projet_parent_id ───┼──► projets (auto-ref pour
                          │                      │    sous-projets AXXa/b/c)
                          └──────┬───────────────┘
                                 │ 1-N
                 ┌───────────────┼───────────────┬──────────────┐
                 ▼               ▼               ▼              ▼
          ┌──────────┐    ┌─────────────┐ ┌──────────────┐ ┌─────────────┐
          │indicateurs│    │temoignages  │ │pays_         │ │documents_rag│
          │           │    │             │ │couverture    │ │ (embeddings)│
          └──────────┘    └─────────────┘ └──────────────┘ └─────────────┘

                          ┌──────────────────────┐
                          │ journal_audit        │
                          │ (append-only log     │
                          │  de toutes les       │
                          │  modifications)      │
                          └──────────────────────┘
```

---

## 🔐 Matrice des permissions

Légende : ✅ autorisé · ❌ refusé · 👁️ visible seulement si publié

| Ressource | Action | Anonyme | Lecteur | Éditeur | Éditeur (non assigné) | Admin |
|---|---|:---:|:---:|:---:|:---:|:---:|
| Projet publié | Lire | ✅ | ✅ | ✅ | ✅ | ✅ |
| Projet brouillon | Lire | ❌ | ❌ | ✅ (si assigné) | ❌ | ✅ |
| Projet | Créer | ❌ | ❌ | ❌ | ❌ | ✅ |
| Projet | Modifier | ❌ | ❌ | ✅ (si assigné) | ❌ | ✅ |
| Projet | Publier | ❌ | ❌ | ❌ | ❌ | ✅ |
| Projet | Supprimer | ❌ | ❌ | ❌ | ❌ | ✅ |
| Indicateur | Lire (projet publié) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Indicateur | Créer/Modifier | ❌ | ❌ | ✅ (si assigné) | ❌ | ✅ |
| Témoignage | Lire (projet publié) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Témoignage | Créer/Modifier | ❌ | ❌ | ✅ (si assigné) | ❌ | ✅ |
| Utilisateur | Voir son profil | ❌ | ✅ | ✅ | ✅ | ✅ |
| Utilisateur | Voir autres profils | ❌ | ❌ | ❌ | ❌ | ✅ |
| Utilisateur | Modifier rôle | ❌ | ❌ | ❌ | ❌ | ✅ |
| Assignation | Créer | ❌ | ❌ | ❌ | ❌ | ✅ |
| Audit log | Consulter | ❌ | ❌ | ❌ | ❌ | ✅ |
| Chatbot | Utiliser | ✅ (10/h) | ✅ (50/h) | ✅ (50/h) | ✅ (50/h) | ✅ |

---

## 🌐 Stack technique complète

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                         FRONTEND                             │
│                                                              │
│  Next.js 15 (App Router) + TypeScript                       │
│  Tailwind CSS + shadcn/ui                                   │
│  MapLibre GL (cartes)                                       │
│  Recharts (graphiques simples)                              │
│  D3.js (graphiques complexes, optionnel)                    │
│                                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTTPS (Vercel Edge Network)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    BACKEND (Next.js API + Server Components) │
│                                                              │
│  • Routes publiques : /projets, /explorer, /chatbot         │
│  • Routes privées : /edition/*, /admin/*                    │
│  • API : /api/chat, /api/export, /api/search                │
│  • Server Actions pour mutations                            │
│                                                              │
└─────┬─────────────────────┬──────────────────┬──────────────┘
      │                     │                  │
      ▼                     ▼                  ▼
┌───────────┐       ┌──────────────┐    ┌─────────────────┐
│           │       │              │    │                 │
│ Supabase  │       │  Anthropic   │    │  Voyage AI ou   │
│ (Postgres │       │  Claude API  │    │  OpenAI         │
│ + Auth +  │       │              │    │  (embeddings)   │
│ pgvector) │       │  Chatbot RAG │    │                 │
│           │       │              │    │                 │
└───────────┘       └──────────────┘    └─────────────────┘
      │
      │ Pub/Sub des changements
      ▼
┌───────────────────────────────────┐
│                                   │
│  Supabase Realtime (optionnel)    │
│  Pour notifications back-office   │
│                                   │
└───────────────────────────────────┘
```

---

## 💰 Estimation des coûts mensuels

| Service | Plan | Coût mensuel |
|---|---|---|
| Vercel | Hobby (usage non commercial) | 0 € |
| Vercel | Pro (si trafic > 100 GB) | ~20 €/mois |
| Supabase | Free (500 MB DB, 50 000 users) | 0 € |
| Supabase | Pro (8 GB DB, 100 000 users) | ~25 €/mois |
| Anthropic Claude | ~0,003 € par question chatbot | Variable |
| Voyage AI | ~0,02 € / 1 M tokens embeddings | ~5 €/mois |
| Domaine custom | crexe.francophonie.org ou autre | ~15 €/an |
| **Total estimé (MVP)** | | **0 à 50 €/mois** |
| **Total estimé (production)** | | **60 à 200 €/mois** |

Note : le coût principal est le chatbot. Avec 1 000 questions par jour :
3 € × 30 jours = 90 €/mois. Le rate limiting public est donc critique.

---

## 📈 Évolutions possibles post-MVP

Priorité 1 (mois 2-3)
- SSO Google Workspace pour les comptes OIF
- 2FA obligatoire pour les admins
- Notifications email sur workflow (soumission → publication)

Priorité 2 (mois 4-6)
- Multilingue (EN, ES, AR, PT)
- Back-office mobile-friendly
- API publique pour partenaires (chercheurs, bailleurs)
- Intégration du CREXE 2026 avec versioning

Priorité 3 (mois 6+)
- Analytics publics (Plausible, Umami)
- Widgets embeddables (iframe) pour oif.org et sites partenaires
- Chatbot WhatsApp ou Telegram
- Application mobile native

---

## 🚦 Check-list finale avant mise en production

Sécurité
- [ ] Toutes les politiques RLS actives et testées
- [ ] Captcha fonctionnel sur inscription
- [ ] Rate limiting chatbot testé (10/h anon, 50/h auth)
- [ ] Mots de passe min 12 caractères
- [ ] HTTPS sur tout (auto via Vercel)
- [ ] Secrets hors repo (vérifier .gitignore)

Performance
- [ ] Lighthouse Performance > 90 sur 4 pages clés
- [ ] Images optimisées (next/image)
- [ ] Base de données indexée
- [ ] Cache Vercel configuré

Accessibilité
- [ ] Score Axe > 95
- [ ] Navigation clavier complète
- [ ] Contrastes WCAG AA respectés
- [ ] Alt text sur toutes les images

SEO
- [ ] Sitemap.xml généré
- [ ] Robots.txt configuré
- [ ] Open Graph images pour partage social
- [ ] Meta descriptions uniques par page

Contenu
- [ ] Mentions légales en footer
- [ ] Politique de confidentialité (RGPD)
- [ ] Politique des cookies
- [ ] Licence de réutilisation des données (CC BY-NC-SA recommandé)

Monitoring
- [ ] Vercel Analytics activé (ou alternative)
- [ ] Sentry pour erreurs serveur (optionnel)
- [ ] Alerte si coût chatbot > budget mensuel
