# 🚀 Guide — Utiliser Claude Cowork sur le projet CREXE

> Ce guide complète le paquet d'instructions Claude Code. Il explique comment tirer parti de **Claude Cowork** pour automatiser la partie "contenu" du projet CREXE (structuration de données, mise à jour récurrente, synthèses).

---

## 🎓 Rappel stratégique

| Outil | Rôle sur CREXE |
|---|---|
| **Claude Code** (terminal) | Construire la plateforme web (développement) |
| **Claude Cowork** (app desktop) | Alimenter la plateforme en contenu (données projets) |

Les deux outils utilisent le même moteur agentique — la différence est **qui les utilise** et **pour faire quoi**.

---

## 📦 Prérequis

1. **Abonnement Claude Pro (20 $/mois) ou Max (100 $/mois)**
   - Cowork n'est pas accessible au plan gratuit
   - Pour un usage institutionnel OIF, le plan Max est recommandé (quotas suffisants)

2. **Application Claude Desktop**
   - Télécharger depuis claude.com/download
   - Disponible sur macOS et Windows
   - S'assurer d'être à la dernière version

3. **Structure de dossiers locale** (à créer sur votre machine)

---

## 🗂️ Structure de dossiers recommandée

Créez ceci sur votre Mac ou PC :

```
Documents/
└── CREXE_OIF/
    ├── 00_REFERENCE/              # ne pas modifier — source de vérité
    │   ├── P14_seed_exemple.json  # le JSON P14 que je vous ai fourni
    │   ├── schema_structure.md    # description des champs obligatoires
    │   └── palette_chromatique.md # couleurs OIF
    │
    ├── 01_PROJETS_A_STRUCTURER/   # documents bruts CREXE
    │   ├── P15/
    │   │   ├── rapport_P15_2025.pdf
    │   │   ├── enquete_beneficiaires.xlsx
    │   │   └── notes_mission.docx
    │   ├── P16/
    │   └── P17/
    │
    ├── 02_JSON_STRUCTURES/         # sortie de Claude Cowork
    │   ├── P15.json
    │   ├── P16.json
    │   └── _notes/                 # signalements d'incertitude
    │
    ├── 03_VISUELS/                 # visuels générés par projet
    │   ├── P15_cercles.html
    │   └── P15_fiche.docx
    │
    └── 04_IMPORTS_SUPABASE/        # prêt à importer
        └── batch_avril_2026.sql
```

---

## 🎯 Scénario A — Structurer un nouveau projet (P15, P16...)

### Étape 1 — Préparer le dossier du projet

Dans `01_PROJETS_A_STRUCTURER/P15/`, déposer tous les documents sources :
- Le rapport principal (PDF ou DOCX)
- Les tableaux d'indicateurs (Excel)
- Les comptes-rendus de mission
- Les articles de presse, liens YouTube (fichier texte avec les URL)

### Étape 2 — Ouvrir Claude Cowork

1. Lancer l'application Claude Desktop
2. Cliquer sur l'onglet **Cowork** (ou "Create a project" selon la version)
3. Créer un nouveau projet Cowork intitulé **"CREXE OIF — structuration projets"**
4. Donner l'accès au dossier `Documents/CREXE_OIF/`

### Étape 3 — Configurer les instructions globales du projet Cowork

Dans les réglages du projet Cowork, coller ces instructions permanentes :

```
Tu travailles sur la plateforme CREXE de l'Organisation internationale de
la Francophonie (OIF).

RÔLE : tu extrais des données structurées depuis des documents CREXE
(rapports, enquêtes, notes de mission) pour produire des fichiers JSON
conformes au schéma défini dans 00_REFERENCE/P14_seed_exemple.json.

PRINCIPES À RESPECTER :
1. JAMAIS d'invention de chiffre. Si une valeur est absente ou ambiguë,
   mettre `null` et consigner dans un fichier `_notes/{ProjetID}_notes.md`.
2. Toujours qualifier les chiffres : type_preuve ∈ {mesure, estimation,
   observation, institutionnel}. En cas de doute, demander.
3. Vérifier les sources citées : URL, document, page. Ne garder que les
   sources vérifiables.
4. Respecter exactement la structure JSON de P14_seed_exemple.json. Ne
   pas inventer de nouveaux champs sans autorisation.
5. Utiliser le français institutionnel (vouvoiement, terminologie OIF).

SORTIE ATTENDUE POUR CHAQUE PROJET :
- 02_JSON_STRUCTURES/{ProjetID}.json — données structurées
- 02_JSON_STRUCTURES/_notes/{ProjetID}_notes.md — incertitudes et
  questions ouvertes
- Un rapport de synthèse en fin de traitement listant les projets
  traités, le taux de complétude des champs, les alertes.

Demande mon accord avant de lancer un traitement sur plusieurs projets
en parallèle.
```

### Étape 4 — Lancer la structuration d'un projet

Envoyer à Claude Cowork ce premier message :

```
Commence par le projet P15. Les documents sources sont dans
01_PROJETS_A_STRUCTURER/P15/.

1. Lis d'abord le rapport principal pour identifier l'intitulé du projet,
   son programme stratégique de rattachement, et ses chiffres-clés.

2. Propose-moi un plan d'extraction : quelles données tu vas chercher
   dans quel document, et quelles incertitudes tu anticipes.

3. Attends ma validation avant d'écrire le JSON final.

Ne traite PAS les autres projets pour l'instant. Un à la fois.
```

### Étape 5 — Valider et itérer

- Claude Cowork propose son plan
- Vous le lisez, corrigez si besoin
- Il exécute et produit le JSON
- Vous ouvrez le JSON, vérifiez 2-3 chiffres clés contre les sources
- Vous validez ou demandez correction
- Vous passez au projet suivant

### Étape 6 — Importer dans la plateforme

Une fois plusieurs JSON produits, passer à Claude Code (dans le repo
CREXE) avec cette instruction :

```
Dans data/structured/ j'ai ajouté P15.json, P16.json et P17.json.
Lance le script d'import seed qui existe pour P14 sur chacun de ces
projets, et vérifie que les données apparaissent correctement dans
Supabase avant de confirmer.
```

---

## 🎯 Scénario B — Mise à jour trimestrielle récurrente

### Principe

Chaque trimestre, de nouveaux éléments arrivent : missions effectuées,
nouveaux chiffres d'enquête, nouveaux partenariats conclus. Plutôt que
de tout retraiter, on fait des mises à jour ciblées.

### Configuration

1. Créer un nouveau projet Cowork "CREXE — Mises à jour trimestrielles"
2. Lui donner accès aux dossiers :
   - `01_PROJETS_A_STRUCTURER/` (nouveaux documents)
   - `02_JSON_STRUCTURES/` (JSON existants à enrichir)
   - `04_IMPORTS_SUPABASE/` (où écrire les requêtes SQL)

3. Instructions permanentes du projet :

```
Tu gères les mises à jour trimestrielles du CREXE.

MISSION : quand un nouveau document est déposé dans
01_PROJETS_A_STRUCTURER/{ProjetID}/, comparer avec le JSON existant
dans 02_JSON_STRUCTURES/{ProjetID}.json et identifier :

1. Les champs à mettre à jour (chiffres qui ont évolué)
2. Les nouveaux éléments à ajouter (témoignages, partenariats,
   événements)
3. Les contradictions apparentes (chiffres divergents entre sources)

SORTIE :
- Un rapport comparatif en Markdown
- Un fichier SQL incrémental dans 04_IMPORTS_SUPABASE/
  `update_{trimestre}.sql`
- Une liste des validations humaines requises

Ne JAMAIS modifier directement les JSON existants — produire des
propositions que je valide manuellement.
```

---

## 🎯 Scénario C — Génération de visuels standardisés

Une fois les JSON structurés, Cowork peut générer les visuels en
utilisant le template HTML que je vous ai fourni :

```
Dans 03_VISUELS/, génère pour chaque projet listé dans
02_JSON_STRUCTURES/ un fichier HTML autonome de type "cercles d'impact"
basé sur le template 00_REFERENCE/P14_visuel_template.html, en
remplaçant les valeurs par celles du JSON du projet.

Produis également pour chaque projet :
- Une version DOCX éditable (comme P14_fiche_impact_editable.docx)
- Une note de synthèse de 200 mots en français institutionnel

Avant de traiter plus de 3 projets, produis un premier résultat pour
P15 et attends ma validation.
```

---

## ⚠️ 5 pièges à éviter avec Claude Cowork

### Piège 1 — Lui donner trop d'autonomie dès le départ
❌ "Traite-moi tous les projets CREXE"
✅ "Traite P15, attends ma validation, puis on continue"

Cowork peut parallel-processer mais sur un projet institutionnel où
chaque chiffre compte, cette autonomie est risquée en début d'usage.

### Piège 2 — Ne pas fixer de "source de vérité"
Sans fichier de référence (comme P14_seed_exemple.json), Cowork va
inventer sa propre structure au fil des projets. Toujours lui donner
un modèle EXACT à respecter.

### Piège 3 — Oublier la traçabilité
Chaque chiffre extrait doit pointer vers son document source, avec page
si possible. Imposez-le dans vos instructions.

### Piège 4 — Travailler sur les documents originaux
Toujours faire travailler Cowork dans le dossier `02_JSON_STRUCTURES/`,
jamais directement sur les documents sources (qui doivent rester en
lecture seule pour auditabilité).

### Piège 5 — Négliger les limites de la version research preview
Cowork est encore en research preview (janvier 2026). Certains parsers
(notamment pour les tableaux Excel complexes) ne sont pas parfaits.
Toujours vérifier humain sur les chiffres critiques.

---

## 🔐 Sécurité et confidentialité

Le CREXE contient des données institutionnelles OIF potentiellement
sensibles (budgets, partenariats, évaluations). Points d'attention :

- **Historique local** : par défaut, Cowork stocke l'historique des
  conversations localement sur votre machine, pas sur les serveurs
  Anthropic. Bon pour la confidentialité.

- **Connecteurs externes** : ne JAMAIS connecter Cowork à des services
  cloud non autorisés par l'OIF (pas de Dropbox perso, Gmail perso,
  etc.). Rester sur des dossiers locaux.

- **Données régulées** : Cowork n'est pas certifié pour des workloads
  HIPAA/FedRAMP. Pour le CREXE cela ne s'applique pas, mais en tenir
  compte si vous stockez d'autres données OIF.

- **Désactivation possible** : un administrateur OIF peut désactiver
  Cowork pour toute l'organisation si nécessaire (Admin Settings).

---

## 🗓️ Workflow recommandé combinant Code + Cowork

```
┌─────────────────────────────────────────────────────────────┐
│                      CYCLE TYPE CREXE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SEMAINE 1-2 : Claude Code construit la plateforme          │
│  ─────────────────────────────────────────────              │
│  Exécuter Phase 0 à Phase 3 du ROADMAP                      │
│  Résultat : fiche P14 visible en ligne                      │
│                                                              │
│  SEMAINE 3 : Claude Cowork structure les données            │
│  ─────────────────────────────────────────────              │
│  Traiter P15, P16, P17 à partir des documents sources       │
│  Résultat : 3 JSON validés prêts à importer                 │
│                                                              │
│  SEMAINE 4 : Claude Code importe et continue                │
│  ─────────────────────────────────────────────              │
│  Importer les JSON en base, continuer Phase 4 à 8           │
│  Résultat : dashboard complet avec 4 projets                │
│                                                              │
│  RÉCURRENCE TRIMESTRIELLE : Cowork met à jour               │
│  ─────────────────────────────────────────────              │
│  Scénario B — mises à jour ciblées                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ❓ FAQ

**Peut-on utiliser seulement Cowork, sans Claude Code ?**
Non. Cowork est excellent pour manipuler des fichiers locaux, mais il ne
sait pas développer, déployer et maintenir une application web complète.
C'est le rôle de Claude Code.

**Peut-on utiliser seulement Claude Code, sans Cowork ?**
Oui, c'est possible, mais vous devrez structurer manuellement chaque
projet — travail fastidieux et source d'erreurs. Cowork accélère
considérablement cette phase.

**L'équipe OIF (non-développeurs) peut-elle utiliser Cowork elle-même ?**
C'est l'intérêt principal ! Cowork est conçu pour des non-codeurs. Après
la phase de développement initiale, l'équipe communication/évaluation
OIF peut reprendre la main sur la structuration de nouveaux projets sans
dépendre d'un développeur.

**Que faire si Cowork extrait un chiffre faux ?**
Vérification humaine systématique avant import en base. C'est pour ça
que la règle de traçabilité (page source) est cruciale : vous pouvez
vérifier en 10 secondes.

**Combien de temps pour structurer un projet type P14 avec Cowork ?**
Environ 20-40 minutes par projet selon le volume de documents, contre
3-6 heures en manuel. Gain : x8 à x10.

---

## 📞 En cas de blocage

- Documentation officielle : https://docs.claude.com
- Support Anthropic : via l'app Claude Desktop
- Communauté : forum Anthropic + Reddit r/ClaudeAI
