'use client'
// ─── EraFiltreClient — Filtre exclusif par programme stratégique ──────────────
// Reçoit toutes les données du Server Component parent et gère l'affichage
// exclusif par PS (PS1 / PS2 / PS3 / Tous).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ResultatEra {
  id: string
  ps_id: string
  projet_code: string | null
  projet_nom: string
  titre_section: string
  niveau: string
  contenu: string
  chiffre_cle: string | null
  annee_exercice: number
  ordre: number
}

type PSId = 'PS1' | 'PS2' | 'PS3'

// ─── Config PS ────────────────────────────────────────────────────────────────
const PS_CONFIG = {
  PS1: {
    couleur: '#003DA5',
    bg: '#EBF0FA',
    border: '#C7D5F5',
    nom: 'Programme stratégique 1',
    thème: "La langue française au service des cultures et de l'éducation",
    icon: '📚',
  },
  PS2: {
    couleur: '#6B2C91',
    bg: '#F3EAF9',
    border: '#DEC5EE',
    nom: 'Programme stratégique 2',
    thème: 'La langue française au service de la démocratie et de la gouvernance',
    icon: '⚖️',
  },
  PS3: {
    couleur: '#0F6E56',
    bg: '#E6F4F1',
    border: '#B3DDD7',
    nom: 'Programme stratégique 3',
    thème: 'La langue française, vecteur de développement durable',
    icon: '🌿',
  },
} as const

const NIVEAU_LABELS: Record<string, { label: string; icon: string; couleur: string }> = {
  acquisition_competences: { label: 'Acquisition des compétences', icon: '🎓', couleur: '#1D4ED8' },
  effets_intermediaires:   { label: 'Effets intermédiaires',        icon: '🔄', couleur: '#0F766E' },
  retombees:               { label: 'Retombées observées',          icon: '🌱', couleur: '#15803D' },
  extrants:                { label: 'Extrants',                     icon: '📦', couleur: '#7C3AED' },
  synthese:                { label: 'Résultats globaux',            icon: '📊', couleur: '#1E40AF' },
}

// ─── Composant BlocNiveau ─────────────────────────────────────────────────────
function BlocNiveau({ result }: { result: ResultatEra }) {
  const cfg = NIVEAU_LABELS[result.niveau] ?? NIVEAU_LABELS.synthese
  const paragraphes = result.contenu.split('\n').filter(p => p.trim().length > 20)

  return (
    <div className="border border-gray-100 rounded-xl p-5 bg-white">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-lg flex-shrink-0 mt-0.5">{cfg.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cfg.couleur + '15', color: cfg.couleur }}
            >
              {cfg.label}
            </span>
            {result.chiffre_cle && (
              <span className="text-xl font-black text-[var(--oif-gold)]">
                {result.chiffre_cle}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {paragraphes.map((p, i) => (
          <p key={i} className={`text-sm leading-relaxed text-justify ${i === 0 ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}

// ─── Composant CarteProjet ────────────────────────────────────────────────────
function CarteProjet({
  projetNom,
  projetCode,
  resultats,
  psColor,
}: {
  projetNom: string
  projetCode: string | null
  resultats: ResultatEra[]
  psColor: string
}) {
  const chiffres = resultats.filter(r => r.chiffre_cle).map(r => r.chiffre_cle!)
  const niveauxPresents = [...new Set(resultats.map(r => r.niveau))]

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div
        className="px-6 py-4 flex items-start justify-between gap-4"
        style={{ backgroundColor: psColor + '0D', borderBottom: `2px solid ${psColor}20` }}
      >
        <div className="flex-1">
          {projetCode && (
            <span
              className="inline-block text-xs font-mono font-bold px-2 py-0.5 rounded mb-1.5"
              style={{ backgroundColor: psColor + '20', color: psColor }}
            >
              {projetCode}
            </span>
          )}
          <h3 className="font-semibold text-[var(--oif-blue-dark)] text-base leading-snug">
            {projetNom}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{resultats[0].titre_section}</p>
        </div>
        {chiffres.length > 0 && (
          <div className="flex-shrink-0 flex gap-2 flex-wrap justify-end">
            {chiffres.slice(0, 3).map((c, i) => (
              <div
                key={i}
                className="text-center px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: psColor + '15' }}
              >
                <p className="text-base font-black leading-none" style={{ color: psColor }}>{c}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        {resultats.map(r => (
          <BlocNiveau key={r.id} result={r} />
        ))}
      </div>
      <div className="px-4 pb-4 flex gap-1.5 flex-wrap">
        {niveauxPresents.map(n => {
          const cfg = NIVEAU_LABELS[n] ?? NIVEAU_LABELS.synthese
          return (
            <span
              key={n}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cfg.couleur + '15', color: cfg.couleur }}
            >
              {cfg.icon} {cfg.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function EraFiltreClient({
  resultats,
  parPS,
}: {
  resultats: ResultatEra[]
  parPS: Record<string, Record<string, ResultatEra[]>>
}) {
  const psIds: PSId[] = ['PS1', 'PS2', 'PS3']
  const [psActif, setPsActif] = useState<PSId | 'TOUS'>('TOUS')

  // Programmes à afficher selon le filtre
  const psAffiches = psActif === 'TOUS' ? psIds : [psActif]

  return (
    <div>
      {/* ── Barre de filtres PS ─────────────────────────────────────────── */}
      <div className="sticky top-[53px] z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1.5 py-2.5 overflow-x-auto items-center">

            {/* Bouton "Tous" */}
            <button
              onClick={() => setPsActif('TOUS')}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                psActif === 'TOUS'
                  ? 'bg-[var(--oif-blue-dark)] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Tous les PS
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${psActif === 'TOUS' ? 'bg-white/20' : 'bg-gray-200'}`}>
                {resultats.length > 0 ? Object.values(parPS).reduce((s, p) => s + Object.keys(p).length, 0) : 0}
              </span>
            </button>

            <span className="text-gray-200 text-lg mx-1 flex-shrink-0">|</span>

            {/* Boutons PS1 / PS2 / PS3 */}
            {psIds.map(ps => {
              const cfg = PS_CONFIG[ps]
              const nbProjets = Object.keys(parPS[ps] ?? {}).length
              if (nbProjets === 0) return null
              const isActif = psActif === ps

              return (
                <button
                  key={ps}
                  onClick={() => setPsActif(ps)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={
                    isActif
                      ? { backgroundColor: cfg.couleur, color: '#fff', boxShadow: `0 2px 8px ${cfg.couleur}40` }
                      : { backgroundColor: cfg.bg, color: cfg.couleur }
                  }
                >
                  <span>{cfg.icon}</span>
                  <span className="font-bold">{ps}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={isActif ? { backgroundColor: 'rgba(255,255,255,0.25)' } : { backgroundColor: cfg.couleur + '20' }}
                  >
                    {nbProjets} projet{nbProjets > 1 ? 's' : ''}
                  </span>
                </button>
              )
            })}

            <span className="ml-auto flex-shrink-0 text-xs text-gray-400">
              {psActif === 'TOUS'
                ? `${Object.values(parPS).reduce((s, p) => s + Object.keys(p).length, 0)} projets affichés`
                : `${Object.keys(parPS[psActif] ?? {}).length} projet(s) · ${PS_CONFIG[psActif as PSId]?.nom ?? ''}`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Sections PS filtrées ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
        {psAffiches.map(ps => {
          const cfg = PS_CONFIG[ps]
          const projetsPS = parPS[ps] ?? {}
          const projetsKeys = Object.keys(projetsPS)
          if (projetsKeys.length === 0) return null

          return (
            <section key={ps} id={ps}>
              {/* En-tête PS */}
              <div
                className="rounded-2xl p-6 md:p-8 mb-6 border"
                style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{cfg.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ backgroundColor: cfg.couleur + '20', color: cfg.couleur }}
                      >
                        {ps}
                      </span>
                      <span
                        className="text-xs text-white font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: cfg.couleur }}
                      >
                        {projetsKeys.length} projet{projetsKeys.length > 1 ? 's' : ''} enquêtés
                      </span>
                    </div>
                    <h2 className="font-editorial text-xl md:text-2xl font-semibold mb-1" style={{ color: cfg.couleur }}>
                      {cfg.nom}
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">{cfg.thème}</p>
                  </div>
                </div>
              </div>

              {/* Projets */}
              <div className="space-y-6">
                {projetsKeys.map(projetKey => {
                  const resultatsProjet = projetsPS[projetKey]
                  const premier = resultatsProjet[0]
                  return (
                    <CarteProjet
                      key={projetKey}
                      projetNom={premier.projet_nom}
                      projetCode={premier.projet_code}
                      resultats={resultatsProjet}
                      psColor={cfg.couleur}
                    />
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* ── Section méthodologie ──────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="text-2xl flex-shrink-0">🔬</div>
            <div>
              <h3 className="font-semibold text-[var(--oif-blue-dark)] mb-2">
                À propos de l&apos;Enquête Rapide Annuelle (ERA)
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
                L&apos;ERA est un dispositif d&apos;évaluation annuel mis en place par l&apos;OIF pour mesurer
                les effets de ses actions auprès des bénéficiaires directs. Elle s&apos;articule autour
                de trois niveaux de résultats : l&apos;acquisition des compétences (effets immédiats),
                leur utilisation dans le quotidien professionnel (effets intermédiaires) et les
                retombées observées dans l&apos;environnement des bénéficiaires (impacts).
              </p>
              <div className="flex gap-4 mt-4 flex-wrap">
                <Link
                  href="/a-propos"
                  className="inline-flex items-center gap-2 text-sm text-[var(--oif-blue)] hover:underline font-medium"
                >
                  Voir la méthodologie complète →
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition"
                >
                  ← Retour à l&apos;accueil
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
