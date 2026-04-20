// ─── Composant ContributionODD ────────────────────────────────────────────────
// Affiche la contribution d'un projet aux cibles ODD (Agenda 2030).
// Section positionnée après la chaîne des résultats sur la fiche projet.
//
// Concept pédagogique : pourquoi ce composant ?
// - L'OIF s'inscrit dans l'Agenda 2030 des Nations Unies
// - Chaque projet contribue à 1-11 cibles ODD selon les données du CREXE
// - On affiche les ODD concernés avec leur couleur officielle + texte analytique
// - Le design utilise les badges colorés reconnaissables des ODD
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────
export interface OddContribution {
  id: number
  odd_numero: number
  cible_codes: string[]
  texte_contribution: string
  niveau_contribution: 'direct' | 'indirect' | 'potentiel'
  ordre: number
  odd_objectif?: {
    libelle: string
    couleur_hex: string
  }
}

interface ContributionODDProps {
  contributions: OddContribution[]
  accentColor?: string
}

// ─── Icônes ODD (pictogrammes simplifiés en SVG inline) ──────────────────────
// On utilise des cercles colorés avec le numéro ODD, style officiel ONU

function OddBadge({
  numero,
  libelle,
  couleur,
  cibles,
}: {
  numero: number
  libelle: string
  couleur: string
  cibles: string[]
}) {
  return (
    <div className="flex items-start gap-3">
      {/* Badge numéro ODD */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm"
        style={{ backgroundColor: couleur }}
        title={`ODD ${numero} — ${libelle}`}
      >
        {numero}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        {/* Libellé ODD */}
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-0.5">
          ODD {numero}
        </p>
        <p className="text-sm font-semibold text-gray-800 leading-tight mb-1">
          {libelle}
        </p>

        {/* Codes des cibles */}
        {cibles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {cibles.map((cible) => (
              <span
                key={cible}
                className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: couleur + 'CC' }}
              >
                Cible {cible}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Badge niveau de contribution ─────────────────────────────────────────────
function NiveauBadge({ niveau }: { niveau: string }) {
  const config = {
    direct:    { label: 'Contribution directe',    bg: '#0F6E56', icon: '●' },
    indirect:  { label: 'Contribution indirecte',  bg: '#C07A10', icon: '○' },
    potentiel: { label: 'Contribution potentielle', bg: '#9ca3af', icon: '◌' },
  }[niveau] ?? { label: niveau, bg: '#6b7280', icon: '○' }

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
      style={{ backgroundColor: config.bg }}
    >
      <span className="text-[8px]">{config.icon}</span>
      {config.label}
    </span>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function ContributionODD({
  contributions,
  accentColor = '#0F6E56',
}: ContributionODDProps) {
  if (!contributions || contributions.length === 0) return null

  // Statistiques rapides
  const oddUniques = [...new Set(contributions.map((c) => c.odd_numero))].sort((a, b) => a - b)
  const nbCiblesTotal = contributions.reduce((acc, c) => acc + c.cible_codes.length, 0)

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ─── En-tête section ────────────────────────────────────────── */}
      <div
        className="px-6 py-4 border-b border-gray-50 flex items-center justify-between"
        style={{ backgroundColor: accentColor + '08' }}
      >
        <div className="flex items-center gap-3">
          {/* Icône ONU style */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            ODD
          </div>
          <div>
            <span
              className="text-xs font-bold uppercase tracking-widest block"
              style={{ color: accentColor }}
            >
              Agenda 2030 — Nations Unies
            </span>
            <span className="text-xs text-gray-500">
              Contribution aux Objectifs de développement durable
            </span>
          </div>
        </div>

        {/* Statistiques compactes */}
        <div className="hidden md:flex items-center gap-4 text-right">
          <div>
            <p className="text-xl font-editorial font-bold" style={{ color: accentColor }}>
              {oddUniques.length}
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">ODD concernés</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div>
            <p className="text-xl font-editorial font-bold" style={{ color: accentColor }}>
              {nbCiblesTotal}
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">cibles identifiées</p>
          </div>
        </div>
      </div>

      {/* ─── Résumé visuel — badges ODD ─────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-50">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">
          ODD concernés
        </p>
        <div className="flex flex-wrap gap-2">
          {contributions
            .sort((a, b) => a.odd_numero - b.odd_numero)
            .map((contrib) => {
              const couleur = contrib.odd_objectif?.couleur_hex ?? accentColor
              return (
                <a
                  key={contrib.id}
                  href={`#odd-${contrib.odd_numero}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-sm hover:opacity-90 transition"
                  style={{ backgroundColor: couleur }}
                  title={contrib.odd_objectif?.libelle}
                >
                  <span className="text-white/70 text-[10px]">ODD</span>
                  {contrib.odd_numero}
                </a>
              )
            })}
        </div>
      </div>

      {/* ─── Détail par ODD ─────────────────────────────────────────── */}
      <div className="divide-y divide-gray-50">
        {contributions
          .sort((a, b) => a.ordre - b.ordre)
          .map((contrib) => {
            const couleur = contrib.odd_objectif?.couleur_hex ?? accentColor
            const libelle = contrib.odd_objectif?.libelle ?? `ODD ${contrib.odd_numero}`

            return (
              <div
                key={contrib.id}
                id={`odd-${contrib.odd_numero}`}
                className="px-6 py-5"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Badge ODD + cibles */}
                  <div className="md:w-48 flex-shrink-0">
                    <OddBadge
                      numero={contrib.odd_numero}
                      libelle={libelle}
                      couleur={couleur}
                      cibles={contrib.cible_codes}
                    />
                  </div>

                  {/* Texte analytique */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <NiveauBadge niveau={contrib.niveau_contribution} />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {contrib.texte_contribution}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {/* ─── Pied de section ────────────────────────────────────────── */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <path strokeLinecap="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          Analyse établie à partir des données CREXE 2025 et des indicateurs de suivi des projets.
          Source : Note d&apos;analyse — liens entre indicateurs-projets OIF et cibles ODD 2025,
          Service de la conception et du suivi des projets, mars 2026.
        </p>
      </div>
    </section>
  )
}
