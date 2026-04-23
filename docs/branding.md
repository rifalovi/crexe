# Charte graphique — Plateforme CREXE / OIF

> Source officielle : `docs/branding/sources/OIF_mini_charte.pdf`  
> Éditeur : W & Cie, 2007  
> Contact OIF : com@francophonie.org — Service Communication OIF

---

## Principes fondamentaux

Le logotype de l'OIF est un élément **institutionnel verrouillé**. Aucune variation créative n'est autorisée. Toute modification doit être validée par le Service Communication de l'OIF.

La plateforme CREXE est un outil interne OIF — elle doit refléter le **professionnalisme et l'identité visuelle de l'organisation** auprès des décideurs, États membres, bailleurs et partenaires techniques.

---

## Logos disponibles

| Variante | Fichier SVG | Usage recommandé | Fond compatible |
|---|---|---|---|
| `quadri` | `logo-oif-quadri.svg` | **Usage principal** — headers, sidebar, pages claires | Blanc, gris clair, crème |
| `quadri-texte-blanc` | `logo-oif-quadri-texte-blanc.svg` | Fonds sombres (nav dark, footers) | Bleu OIF, gris foncé, noir |
| `noir` | `logo-oif-noir.svg` | Impression monochrome, contraste minimal | Blanc uniquement |
| `blanc` | `logo-oif-blanc.svg` | Impression monochrome inversée | Noir, bleu foncé |

### Utilisation dans le code

```tsx
import LogoOIF from '@/components/branding/LogoOIF'

// Usage standard (header, sidebar)
<LogoOIF variant="quadri" size="sm" priority />

// Sur fond sombre (navbar dark)
<LogoOIF variant="quadri-texte-blanc" size="md" />

// Grande taille (page de connexion)
<LogoOIF variant="quadri" size="lg" withProtectedSpace />
```

---

## Palette de couleurs

### Couleurs du logotype (source : charte p. 8)

| Nom | Hex | Pantone | RGB | Usage |
|---|---|---|---|---|
| Gris | `#2E292D` | Cool Gray 11 C | 46, 41, 45 | Texte "la Francophonie" |
| Jaune | `#FDCD00` | 116 C | 253, 205, 0 | Globe — secteur principal |
| Vert | `#7EB301` | 376 C | 126, 179, 1 | Globe — végétation |
| Violet | `#5D0073` | 2603 C | 93, 0, 115 | Globe — secteur supérieur |
| Rouge | `#E40001` | 485 C | 228, 0, 1 | Globe — secteur gauche |
| Bleu cyan | `#0198E9` | Process Cyan C | 1, 152, 233 | Globe — secteur océan |

### Couleurs complémentaires des entités OIF

| Entité | Hex | Pantone |
|---|---|---|
| CMF | `#3878DB` | 2727 C |
| CPF | `#FDCD00` | 116 C |
| Sommets | `#7D0996` | 2602 C |
| Autres éditions | `#DFDCD8` | Warm Gray 1 C |

### Couleurs des Programmes Stratégiques

| PS | Hex | Usage |
|---|---|---|
| PS1 — Langue, cultures et éducation | `#003DA5` | Bleu institutionnel |
| PS2 — Démocratie et gouvernance | `#6B2C91` | Violet |
| PS3 — Développement durable | `#0F6E56` | Vert |

### Dans Tailwind CSS

```tsx
// Disponibles via tailwind.config.ts (theme.extend.colors)
bg-oif-gris       text-oif-gris
bg-oif-jaune      text-oif-jaune
bg-oif-vert       text-oif-vert
bg-oif-violet     text-oif-violet
bg-oif-rouge      text-oif-rouge
bg-oif-bleu-cyan  text-oif-bleu-cyan
bg-oif-gris-clair text-oif-gris-clair
```

---

## Typographie

| Usage | Police officielle | Alternative web |
|---|---|---|
| Tous usages | Helvetica Neue (propriétaire) | **Inter** (Google Fonts, open source) |

La police **Inter** est l'alternative web recommandée — géométrique, sans-serif, excellente lisibilité à tous les corps. Elle est chargée via `next/font/google` (zéro layout shift, sous-ensemble latin optimisé).

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
```

---

## Règles d'usage du logo

### Taille minimum
- **96px** de largeur sur écran (≡ 25mm à 96dpi)
- Ne jamais afficher en dessous de cette taille

### Espace protégé (source : charte p. 6)
- Équivalent à la hauteur du "L" de "la Francophonie"
- Géré automatiquement par `withProtectedSpace={true}` (défaut)
- Ne jamais coller d'autres éléments (texte, icône) dans cette zone

### Fonds autorisés
- ✅ Blanc pur
- ✅ Gris clair institutionnel
- ✅ Fond sombre (avec variante `quadri-texte-blanc`)
- ✅ Fond photographie (avec cartouche blanc autour du logo)

### Fonds interdits
- ❌ Fond proche d'une couleur du logotype (jaune, rouge, vert, violet, bleu)
- ❌ Fond photographique sans cartouche blanc
- ❌ Fond dégradé complexe

---

## INTERDITS FORMELS (source : charte p. 11)

| Interdit | Description |
|---|---|
| 🚫 Déformation | Ne jamais étirer ou écraser le logo dans aucune direction |
| 🚫 Recolorisation | Ne jamais modifier les couleurs du logotype |
| 🚫 Rotation | Ne jamais faire pivoter le logo |
| 🚫 Fond perturbé | Ne pas placer sur fond complexe sans cartouche blanc |
| 🚫 Sous-taille | Ne jamais afficher en dessous de 96px / 25mm |
| 🚫 Juxtaposition | Ne pas associer d'autres symboles, logos ou icônes dans le logo |
| 🚫 Effets | Ombres, transparences, embossages interdits |

---

## Fichiers sources officiels

Disponibles dans `docs/branding/sources/` (NE PAS modifier, NE PAS supprimer) :

| Fichier | Format | Usage |
|---|---|---|
| `Logo_OIF_quadri.eps` | EPS (PostScript) | Impression couleur — fond clair (**VERSION MAÎTRE**) |
| `Logo_OIF_quadri_texte_blanc.eps` | EPS | Impression couleur — fond sombre |
| `Logo_OIF_noir.eps` | EPS | Impression monochrome |
| `Logo_OIF_blanc.eps` | EPS | Impression monochrome inversée |
| `OIF_mini_charte.pdf` | PDF | **Charte graphique officielle complète** |
| `Code_couleur_programmation_OIF.pdf` | PDF | Couleurs des Programmes Stratégiques |

Les SVG web (`public/assets/branding/oif/*.svg`) sont générés à partir des EPS via Inkscape ou Ghostscript.

---

## Références

- Charte graphique OIF, éd. 2007, W & Cie
- Contact : com@francophonie.org
- Site OIF : [www.francophonie.org](https://www.francophonie.org)
