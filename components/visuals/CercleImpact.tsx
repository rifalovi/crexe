'use client'
// ─── CercleImpact — Niveaux de changement observé ────────────────────────────
// Architecture : SVG épuré (anneaux seuls) + panneau HTML latéral.
//
// Pourquoi séparer SVG et textes ?
//   Le SVG embarque des `<text>` qui restent minuscules et flous sur petits
//   écrans. En déplaçant toutes les descriptions dans du HTML réel, on gagne :
//   • Lisibilité parfaite (anti-aliasing natif, taille responsive)
//   • Accessibilité (screen readers, focus clavier)
//   • Flexibilité CSS (truncate, animations, liens)
//
// Interactions :
//   • Survol  → anneau en surbrillance + panneau latéral mis à jour
//   • Clic    → panneau latéral verrouillé sur le niveau sélectionné
//   • Re-clic → déverrouillage (le panneau suit le survol à nouveau)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import type { TypePreuve } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CerclesImpactData {
  coeur?:   { valeur?: string; label?: string }
  niveau1?: NiveauData
  niveau2?: NiveauData
  niveau3?: NiveauData
  niveau4?: NiveauData
}

interface NiveauData {
  valeur?:     string
  label?:      string
  description?: string
  type_preuve?: TypePreuve
  hypothese?:  string
  detail?:     string
}

interface CercleImpactProps {
  data:       CerclesImpactData
  className?: string
}

type RingId = 'coeur' | 'n1' | 'n2' | 'n3' | 'n4'

// ─── Méta des niveaux ─────────────────────────────────────────────────────────
const RING_META: Record<RingId, {
  numero:       string
  title:        string
  subtitle:     string
  couleur:      string
  couleurFond:  string
  typePreuve:   TypePreuve
  defaultLabel: string
  defaultDesc:  string
  defaultHyp:   string
}> = {
  coeur: {
    numero: '●',
    title: 'Cœur — Investissement OIF',
    subtitle: 'Budget engagé par le projet en 2025',
    couleur: '#D4A017',
    couleurFond: '#fffbeb',
    typePreuve: 'institutionnel',
    defaultLabel: 'Investissement direct',
    defaultDesc: 'Ressources financières mobilisées par l\'OIF pour la mise en œuvre du projet. Ce montant couvre les activités directes, la coordination et le renforcement de capacités des équipes terrain.',
    defaultHyp: 'Source : budget modifié validé par la Direction financière OIF',
  },
  n1: {
    numero: '1',
    title: 'Niveau 1 — Bénéficiaires directes',
    subtitle: 'Effets individuels mesurés et documentés',
    couleur: '#6b2c91',
    couleurFond: '#f5eefb',
    typePreuve: 'mesure',
    defaultLabel: 'Bénéficiaires directes',
    defaultDesc: 'Personnes ayant participé directement aux activités du projet : formations, accompagnements, financements. Les effets sont mesurés via enquêtes de satisfaction, taux de certification et indicateurs d\'emploi post-formation (enquête ERA 2025).',
    defaultHyp: 'Donnée mesurée — enquêtes directes ou registres de participants',
  },
  n2: {
    numero: '2',
    title: 'Niveau 2 — Entourage et ménages',
    subtitle: 'Effets indirects estimés sur les foyers',
    couleur: '#003da5',
    couleurFond: '#eef2fb',
    typePreuve: 'estimation',
    defaultLabel: 'Membres de ménages concernés',
    defaultDesc: 'Famille, ménage ou entourage immédiat des bénéficiaires directes. Leurs conditions s\'améliorent par ricochet : accès à la nourriture, à la santé ou à l\'éducation grâce aux compétences ou revenus acquis.',
    defaultHyp: 'Estimation par hypothèse de composition familiale — non mesuré directement',
  },
  n3: {
    numero: '3',
    title: 'Niveau 3 — Transformation collective',
    subtitle: 'Dynamiques communautaires et réseaux',
    couleur: '#003da5',
    couleurFond: '#eef2fb',
    typePreuve: 'observation',
    defaultLabel: 'Communautés mobilisées',
    defaultDesc: 'Organisations locales, coopératives, associations et réseaux professionnels dont la dynamique est transformée par l\'essaimage des acquis. Ce niveau inclut la réplication spontanée des bonnes pratiques.',
    defaultHyp: 'Données observées — rapports de terrain, visites de suivi, témoignages collectifs',
  },
  n4: {
    numero: '4',
    title: 'Niveau 4 — Portée institutionnelle',
    subtitle: 'Politiques, accords multilatéraux, ODD',
    couleur: '#003da5',
    couleurFond: '#eef2fb',
    typePreuve: 'institutionnel',
    defaultLabel: 'Espace francophone',
    defaultDesc: 'Changements dans les politiques publiques, cadres réglementaires, engagements multilatéraux et accords entre États membres. Ce niveau reflète l\'influence du projet sur les agendas institutionnels (ODD, Appel de Kigali, accords régionaux).',
    defaultHyp: 'Données institutionnelles — déclarations officielles, rapports de conférences OIF',
  },
}

const RING_ORDER: RingId[] = ['coeur', 'n1', 'n2', 'n3', 'n4']

// ─── Badge type de preuve ─────────────────────────────────────────────────────
function BadgeType({ type }: { type?: TypePreuve }) {
  if (!type) return null
  const map: Record<TypePreuve, { label: string; bg: string; text: string }> = {
    mesure:        { label: '● Mesuré',          bg: 'rgba(22,101,52,.12)',    text: '#166534' },
    estimation:    { label: '◐ Estimé',          bg: 'rgba(133,77,14,.12)',    text: '#854d0e' },
    observation:   { label: '◎ Observé',         bg: 'rgba(30,64,175,.12)',    text: '#1e40af' },
    institutionnel:{ label: '◆ Institutionnel',  bg: 'rgba(91,33,182,.12)',    text: '#5b21b6' },
  }
  const b = map[type]
  if (!b) return null
  return (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: b.bg, color: b.text }}>
      {b.label}
    </span>
  )
}

// ─── Extraction de la donnée pour un ring ─────────────────────────────────────
function getRingData(ringId: RingId, data: CerclesImpactData) {
  const meta = RING_META[ringId]
  if (ringId === 'coeur') {
    const c = data.coeur
    return {
      valeur:      c?.valeur,
      label:       c?.label  ?? meta.defaultLabel,
      description: meta.defaultDesc,
      hypothese:   meta.defaultHyp,
      type_preuve: meta.typePreuve,
      detail:      undefined as string | undefined,
    }
  }
  const n = data[`niveau${ringId[1]}` as keyof CerclesImpactData] as NiveauData | undefined
  return {
    valeur:      n?.valeur,
    label:       n?.label       ?? meta.defaultLabel,
    description: n?.description ?? meta.defaultDesc,
    hypothese:   n?.hypothese   ?? meta.defaultHyp,
    type_preuve: n?.type_preuve ?? meta.typePreuve,
    detail:      n?.detail,
  }
}

// ─── Panneau latéral de détail ────────────────────────────────────────────────
function DetailPanel({
  ringId,
  data,
}: {
  ringId: RingId
  data:   CerclesImpactData
}) {
  const meta = RING_META[ringId]
  const d    = getRingData(ringId, data)

  return (
    <div
      className="flex flex-col gap-4 h-full"
      style={{ animation: 'panelIn .22s ease both' }}
    >
      <style>{`
        @keyframes panelIn {
          from { opacity:0; transform:translateX(12px); }
          to   { opacity:1; transform:translateX(0); }
        }
      `}</style>

      {/* Badge de niveau */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
          style={{ backgroundColor: meta.couleur + '18' }}>
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: meta.couleur }}>
            {meta.numero}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.couleur }}>
            {meta.title}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{meta.subtitle}</p>
      </div>

      {/* Valeur chiffrée — visuellement dominante */}
      {d.valeur && (
        <div className="rounded-2xl p-5 text-center"
          style={{ backgroundColor: meta.couleur + '12', border: `1px solid ${meta.couleur}25` }}>
          <p className="font-editorial text-5xl font-bold leading-none mb-1"
            style={{ color: meta.couleur }}>
            {d.valeur}
          </p>
          <p className="text-sm font-semibold text-gray-700 mt-2">{d.label}</p>
        </div>
      )}
      {!d.valeur && (
        <div>
          <p className="font-semibold text-lg text-[var(--oif-blue-dark)]">{d.label}</p>
        </div>
      )}

      {/* Type de preuve */}
      <div>
        <BadgeType type={d.type_preuve} />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 leading-relaxed">
        {d.description}
      </p>

      {/* Détail supplémentaire */}
      {d.detail && (
        <p className="text-sm text-gray-600 leading-relaxed border-l-2 pl-3"
          style={{ borderColor: meta.couleur + '40' }}>
          {d.detail}
        </p>
      )}

      {/* Hypothèse / source */}
      <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-3 mt-auto leading-relaxed">
        {d.hypothese}
      </p>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function CercleImpact({ data, className = '' }: CercleImpactProps) {
  const [selected, setSelected] = useState<RingId | null>('n1') // N1 affiché par défaut
  const [hovered,  setHovered]  = useState<RingId | null>(null)

  // L'anneau "actif" = le survol s'il existe, sinon la sélection
  const active: RingId = hovered ?? selected ?? 'n1'

  const handleSelect = (ring: RingId) =>
    setSelected(prev => prev === ring ? null : ring)

  return (
    <div className={`flex flex-col gap-6 ${className}`}>

      {/* ── En-tête ── */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl"
        style={{ background: 'linear-gradient(135deg,#003da5,#042C53)' }}>
        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Chaîne des effets</p>
          <p className="text-sm font-semibold text-white">
            Niveaux de changement observé — du cœur vers l&apos;espace francophone
          </p>
        </div>
      </div>

      {/* ── Corps : SVG + Panneau latéral ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

        {/* SVG épuré — anneaux interactifs */}
        <div className="relative">
          <CerclesSVG
            data={data}
            selected={selected}
            hovered={hovered}
            onSelect={handleSelect}
            onHover={setHovered}
          />
          {/* Légende de navigation rapide sous le SVG */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {RING_ORDER.map(r => {
              const m   = RING_META[r]
              const sel = selected === r
              return (
                <button
                  key={r}
                  onClick={() => handleSelect(r)}
                  onMouseEnter={() => setHovered(r)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border"
                  style={{
                    backgroundColor: sel ? m.couleur + '18' : 'transparent',
                    borderColor:     sel ? m.couleur : 'rgba(0,0,0,.1)',
                    color:           sel ? m.couleur : '#6b7280',
                  }}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                    style={{ backgroundColor: m.couleur }}>
                    {m.numero}
                  </span>
                  {m.title.split(' — ')[0]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Panneau de détail HTML — textes crisp, toujours visible */}
        <div className="rounded-2xl border p-6 min-h-[340px] sticky top-4 transition-all duration-300"
          style={{
            borderColor:     RING_META[active].couleur + '30',
            backgroundColor: RING_META[active].couleurFond,
          }}>
          <DetailPanel
            key={active}
            ringId={active}
            data={data}
          />
        </div>

      </div>

      {/* ── Légende qualité des données ── */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
          Qualité des données :
        </span>
        <BadgeType type="mesure" />
        <BadgeType type="estimation" />
        <BadgeType type="observation" />
        <BadgeType type="institutionnel" />
        <span className="ml-auto text-[10px] text-gray-400 italic hidden md:block">
          Cliquez sur un anneau ou un bouton pour explorer le niveau de changement
        </span>
      </div>

    </div>
  )
}

// ─── SVG épuré — uniquement les anneaux ──────────────────────────────────────
function CerclesSVG({
  data,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  data:     CerclesImpactData
  selected: RingId | null
  hovered:  RingId | null
  onSelect: (r: RingId) => void
  onHover:  (r: RingId | null) => void
}) {
  const W = 560; const H = 560; const CX = 280; const CY = 280

  // Rayons : plus grands pour mieux remplir le SVG
  const R4 = 250; const R3 = 195; const R2 = 140; const R1 = 85; const RC = 48

  const coeur = data.coeur ?? { valeur: '—', label: 'Investissement' }
  const n1 = data.niveau1; const n2 = data.niveau2
  const n3 = data.niveau3; const n4 = data.niveau4

  const BLEU   = '#003da5'
  const VIOLET = '#6b2c91'
  const OR     = '#D4A017'

  const isHov = (r: RingId) => hovered === r
  const isSel = (r: RingId) => selected === r
  const isAct = (r: RingId) => isHov(r) || isSel(r)

  const rProps = (r: RingId) => ({
    style:        { cursor: 'pointer' } as React.CSSProperties,
    onClick:      () => onSelect(r),
    onMouseEnter: () => onHover(r),
    onMouseLeave: () => onHover(null),
  })

  // Valeur courte à afficher dans l'anneau
  const ringVal = (nd: NiveauData | undefined) =>
    nd?.valeur ? (nd.valeur.length > 8 ? nd.valeur.slice(0, 7) + '…' : nd.valeur) : null

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label="Niveaux de changement observé — diagramme concentrique interactif"
    >
      <defs>
        <filter id="ci-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ci-glow-gold" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="rg-n4" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={BLEU} stopOpacity={isAct('n4') ? 0.18 : 0.06} />
          <stop offset="100%" stopColor={BLEU} stopOpacity={isAct('n4') ? 0.04 : 0.01} />
        </radialGradient>
        <radialGradient id="rg-n3" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={BLEU} stopOpacity={isAct('n3') ? 0.2 : 0.09} />
          <stop offset="100%" stopColor={BLEU} stopOpacity={isAct('n3') ? 0.05 : 0.02} />
        </radialGradient>
        <radialGradient id="rg-n2" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={VIOLET} stopOpacity={isAct('n2') ? 0.26 : 0.11} />
          <stop offset="100%" stopColor={VIOLET} stopOpacity={isAct('n2') ? 0.07 : 0.03} />
        </radialGradient>
        <radialGradient id="rg-n1" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={VIOLET} stopOpacity={isAct('n1') ? 0.38 : 0.2} />
          <stop offset="100%" stopColor={VIOLET} stopOpacity={isAct('n1') ? 0.12 : 0.06} />
        </radialGradient>
        <radialGradient id="rg-coeur" cx="30%" cy="30%" r="80%">
          <stop offset="0%"   stopColor="#f9d94a" />
          <stop offset="100%" stopColor={OR} />
        </radialGradient>
      </defs>

      {/* Animation CSS */}
      <style>{`
        @keyframes ci-in   { from{opacity:0;transform-origin:${CX}px ${CY}px;transform:scale(.85)}
                             to  {opacity:1;transform-origin:${CX}px ${CY}px;transform:scale(1)}  }
        @keyframes ci-pulse{ 0%,100%{transform-origin:${CX}px ${CY}px;transform:scale(1)}
                             50%    {transform-origin:${CX}px ${CY}px;transform:scale(1.025)}       }
        .ci-n4{animation:ci-in .5s .05s both}
        .ci-n3{animation:ci-in .5s .14s both}
        .ci-n2{animation:ci-in .5s .23s both}
        .ci-n1{animation:ci-in .5s .32s both}
        .ci-c {animation:ci-in .5s .42s both}
        .ci-active{animation:ci-pulse 2s 1s ease-in-out infinite}
      `}</style>

      {/* Cercle de guidage extérieur (décoratif) */}
      <circle cx={CX} cy={CY} r={272}
        fill="none" stroke="rgba(0,61,165,.04)" strokeWidth={1.5} strokeDasharray="6 5" />

      {/* ── N4 ── */}
      <circle className={`ci-n4${isAct('n4') ? ' ci-active' : ''}`}
        cx={CX} cy={CY} r={R4}
        fill={`url(#rg-n4)`}
        stroke={isSel('n4') ? `rgba(0,61,165,.85)` : isHov('n4') ? `rgba(0,61,165,.55)` : `rgba(0,61,165,.22)`}
        strokeWidth={isSel('n4') ? 3 : isHov('n4') ? 2 : 1.2}
        filter={isAct('n4') ? 'url(#ci-glow)' : undefined}
        {...rProps('n4')}
      />

      {/* ── N3 ── */}
      <circle className={`ci-n3${isAct('n3') ? ' ci-active' : ''}`}
        cx={CX} cy={CY} r={R3}
        fill={`url(#rg-n3)`}
        stroke={isSel('n3') ? `rgba(0,61,165,.9)` : isHov('n3') ? `rgba(0,61,165,.6)` : `rgba(0,61,165,.3)`}
        strokeWidth={isSel('n3') ? 2.8 : isHov('n3') ? 1.8 : 1.2}
        filter={isAct('n3') ? 'url(#ci-glow)' : undefined}
        {...rProps('n3')}
      />

      {/* ── N2 ── */}
      <circle className={`ci-n2${isAct('n2') ? ' ci-active' : ''}`}
        cx={CX} cy={CY} r={R2}
        fill={`url(#rg-n2)`}
        stroke={isSel('n2') ? `rgba(107,44,145,.9)` : isHov('n2') ? `rgba(107,44,145,.62)` : `rgba(107,44,145,.32)`}
        strokeWidth={isSel('n2') ? 2.8 : isHov('n2') ? 1.8 : 1.2}
        filter={isAct('n2') ? 'url(#ci-glow)' : undefined}
        {...rProps('n2')}
      />

      {/* ── N1 ── */}
      <circle className={`ci-n1${isAct('n1') ? ' ci-active' : ''}`}
        cx={CX} cy={CY} r={R1}
        fill={`url(#rg-n1)`}
        stroke={isSel('n1') ? `rgba(107,44,145,.95)` : isHov('n1') ? `rgba(107,44,145,.7)` : `rgba(107,44,145,.5)`}
        strokeWidth={isSel('n1') ? 3 : isHov('n1') ? 2 : 1.5}
        filter={isAct('n1') ? 'url(#ci-glow)' : undefined}
        {...rProps('n1')}
      />

      {/* ── Cœur ── */}
      <circle className={`ci-c${isAct('coeur') ? ' ci-active' : ''}`}
        cx={CX} cy={CY} r={RC}
        fill="url(#rg-coeur)"
        stroke={isSel('coeur') ? '#5a3800' : '#b8820e'}
        strokeWidth={isSel('coeur') ? 3.5 : 2}
        filter={isAct('coeur') ? 'url(#ci-glow-gold)' : undefined}
        {...rProps('coeur')}
      />

      {/* ── Numéros dans les couronnes ── */}
      {/* N4 — haut */}
      <text x={CX} y={CY - (R3 + (R4 - R3) / 2)} textAnchor="middle" dominantBaseline="central"
        fill={isAct('n4') ? BLEU : 'rgba(0,61,165,.28)'}
        fontSize={22} fontWeight="800" fontFamily="Inter,Arial,sans-serif"
        style={{ pointerEvents: 'none', transition: 'fill .2s' }}>4</text>
      {/* N3 — gauche */}
      <text x={CX - (R2 + (R3 - R2) / 2)} y={CY} textAnchor="middle" dominantBaseline="central"
        fill={isAct('n3') ? BLEU : 'rgba(0,61,165,.35)'}
        fontSize={22} fontWeight="800" fontFamily="Inter,Arial,sans-serif"
        style={{ pointerEvents: 'none', transition: 'fill .2s' }}>3</text>
      {/* N2 — bas */}
      <text x={CX} y={CY + (R1 + (R2 - R1) / 2)} textAnchor="middle" dominantBaseline="central"
        fill={isAct('n2') ? VIOLET : 'rgba(107,44,145,.4)'}
        fontSize={22} fontWeight="800" fontFamily="Inter,Arial,sans-serif"
        style={{ pointerEvents: 'none', transition: 'fill .2s' }}>2</text>
      {/* N1 — droite */}
      <text x={CX + (RC + (R1 - RC) / 2)} y={CY} textAnchor="middle" dominantBaseline="central"
        fill={isAct('n1') ? VIOLET : 'rgba(107,44,145,.65)'}
        fontSize={22} fontWeight="800" fontFamily="Inter,Arial,sans-serif"
        style={{ pointerEvents: 'none', transition: 'fill .2s' }}>1</text>

      {/* ── Valeurs chiffrées dans chaque anneau ── */}
      {/* N4 */}
      {n4?.valeur && (
        <text x={CX} y={CY - (R3 + (R4 - R3) / 2) + 28} textAnchor="middle" dominantBaseline="central"
          fill={isAct('n4') ? 'rgba(0,61,165,.8)' : 'rgba(0,61,165,.45)'}
          fontSize={13} fontWeight="600" fontFamily="'Source Serif 4',Georgia,serif"
          style={{ pointerEvents: 'none' }}>
          {ringVal(n4)}
        </text>
      )}
      {/* N3 */}
      {n3?.valeur && (
        <text x={CX - (R2 + (R3 - R2) / 2)} y={CY + 26} textAnchor="middle" dominantBaseline="central"
          fill={isAct('n3') ? 'rgba(0,61,165,.8)' : 'rgba(0,61,165,.45)'}
          fontSize={13} fontWeight="600" fontFamily="'Source Serif 4',Georgia,serif"
          style={{ pointerEvents: 'none' }}>
          {ringVal(n3)}
        </text>
      )}
      {/* N2 */}
      {n2?.valeur && (
        <text x={CX} y={CY + (R1 + (R2 - R1) / 2) + 24} textAnchor="middle" dominantBaseline="central"
          fill={isAct('n2') ? 'rgba(107,44,145,.8)' : 'rgba(107,44,145,.5)'}
          fontSize={13} fontWeight="600" fontFamily="'Source Serif 4',Georgia,serif"
          style={{ pointerEvents: 'none' }}>
          {ringVal(n2)}
        </text>
      )}
      {/* N1 */}
      {n1?.valeur && (
        <text x={CX + (RC + (R1 - RC) / 2)} y={CY + 24} textAnchor="middle" dominantBaseline="central"
          fill={isAct('n1') ? 'rgba(107,44,145,.85)' : 'rgba(107,44,145,.6)'}
          fontSize={13} fontWeight="600" fontFamily="'Source Serif 4',Georgia,serif"
          style={{ pointerEvents: 'none' }}>
          {ringVal(n1)}
        </text>
      )}

      {/* ── Cœur — valeur ── */}
      <text x={CX} y={CY - 6} textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize={14} fontWeight="800" fontFamily="'Source Serif 4',Georgia,serif"
        style={{ pointerEvents: 'none' }}>
        {(coeur.valeur ?? '').length > 9 ? (coeur.valeur ?? '').slice(0, 9) + '…' : (coeur.valeur ?? '—')}
      </text>
      <text x={CX} y={CY + 12} textAnchor="middle" dominantBaseline="central"
        fill="rgba(255,255,255,.75)" fontSize={8} fontFamily="Inter,Arial,sans-serif"
        style={{ pointerEvents: 'none' }}>
        {(coeur.label ?? 'Investissement').slice(0, 16)}
      </text>

      {/* ── Indicateurs de clic ── */}
      {/* Flèches pointant vers les anneaux (hint discret) */}
      <g style={{ pointerEvents: 'none' }}>
        <text x={CX} y={CY - R4 - 8} textAnchor="middle"
          fill="rgba(0,61,165,.25)" fontSize={9} fontFamily="Inter,Arial,sans-serif" fontStyle="italic">
          cliquer
        </text>
      </g>

    </svg>
  )
}
