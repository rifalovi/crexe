// ─── BadgePreuve ─────────────────────────────────────────────────────────────
// Badge coloré qualifiant le niveau de preuve d'un chiffre (principe §2.1
// de CLAUDE.md : « chaque chiffre affiché est sourcé et qualifié »).
//
// 4 niveaux :
//   - mesure        → vert  : données vérifiées, comptage direct
//   - estimation    → ambre : projection méthodique avec hypothèse
//   - observation   → bleu  : constat terrain non chiffré
//   - institutionnel → violet : validation officielle OIF/partenaires
// ─────────────────────────────────────────────────────────────────────────────

import type { TypePreuve } from '@/types/database'

const PALETTE: Record<TypePreuve, { bg: string; fg: string; dot: string; label: string }> = {
  mesure: {
    bg: '#ECFDF5',
    fg: '#047857',
    dot: '#10B981',
    label: 'Mesuré',
  },
  estimation: {
    bg: '#FFFBEB',
    fg: '#92400E',
    dot: '#F59E0B',
    label: 'Estimé',
  },
  observation: {
    bg: '#EFF6FF',
    fg: '#1D4ED8',
    dot: '#3B82F6',
    label: 'Observé',
  },
  institutionnel: {
    bg: '#F3EAF9',
    fg: '#6B2C91',
    dot: '#9D4EDD',
    label: 'Institutionnel',
  },
}

type Taille = 'sm' | 'md'

interface BadgePreuveProps {
  type: TypePreuve
  /** Remplace le libellé par défaut si besoin (rare). */
  label?: string
  /** Cache la pastille colorée (compact). */
  hideDot?: boolean
  taille?: Taille
  className?: string
}

export function BadgePreuve({
  type,
  label,
  hideDot = false,
  taille = 'md',
  className = '',
}: BadgePreuveProps) {
  const p = PALETTE[type]
  const isSmall = taille === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${className}`}
      style={{ backgroundColor: p.bg, color: p.fg }}
      aria-label={`Niveau de preuve : ${p.label.toLowerCase()}`}
    >
      {!hideDot && (
        <span
          className={`rounded-full ${isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}
          style={{ backgroundColor: p.dot }}
          aria-hidden="true"
        />
      )}
      {label ?? p.label}
    </span>
  )
}
