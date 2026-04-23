// ─── Résultats ERA 2024 — Page publique ───────────────────────────────────────
// Server Component : toutes les données sont chargées côté serveur.
// Le filtrage exclusif par PS est délégué à EraFiltreClient (Client Component).
//
// Source : Rapport d'enquête ERA 2024, OIF (août 2025)
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import EraEditionSwitcher from './EraEditionSwitcher'
import EraFiltreClient from './EraFiltreClient'

export const metadata = {
  title: 'Résultats ERA 2024 — CREXE',
  description: "Résultats de l'Enquête Rapide Annuelle (ERA) 2024 par projet OIF — PS1, PS2, PS3.",
}

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

// ─── Chargement des données ───────────────────────────────────────────────────
async function getData() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const { data, error } = await supabase
    .from('resultats_era')
    .select('*')
    .eq('annee_exercice', 2024)
    .order('ordre', { ascending: true })

  if (error) {
    console.error('Erreur chargement résultats ERA:', error)
    return []
  }
  return (data ?? []) as ResultatEra[]
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default async function ResultatsEraPage() {
  const resultats = await getData()

  // Regrouper par PS puis par projet (clé = projet_code ?? projet_nom)
  const parPS: Record<string, Record<string, ResultatEra[]>> = {}
  for (const r of resultats) {
    if (!parPS[r.ps_id]) parPS[r.ps_id] = {}
    const key = r.projet_code ?? r.projet_nom
    if (!parPS[r.ps_id][key]) parPS[r.ps_id][key] = []
    parPS[r.ps_id][key].push(r)
  }

  const noData = resultats.length === 0

  return (
    <div className="min-h-screen bg-[var(--oif-neutral)]">

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[var(--oif-blue)] text-xs mb-4 transition">
            ← Accueil
          </Link>

          <div className="inline-flex items-center gap-2 bg-[var(--oif-blue)]/10 text-[var(--oif-blue)] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--oif-gold)] animate-pulse" />
            Enquête Rapide Annuelle · CREXE 2024
          </div>
          <h1 className="font-editorial text-2xl md:text-3xl font-semibold text-[var(--oif-navy)] mb-2">
            Résultats de l&apos;ERA 2024
          </h1>
          <p className="text-gray-500 max-w-2xl text-sm leading-relaxed mb-6">
            Effets mesurés auprès des bénéficiaires directs des projets OIF — PS1, PS2, PS3.
            Source : Rapport d&apos;enquête ERA 2024, OIF (août 2025).
          </p>

          {/* ── Infographie synthèse globale ──────────────────────────────── */}
          {!noData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { val: '13', label: 'projets enquêtés', sub: 'sur 20 projets OIF', icon: '📋' },
                { val: '34', label: 'États membres', sub: "de l'espace francophone", icon: '🌍' },
                { val: '75–100%', label: 'acquisition compétences', sub: 'tous projets confondus', icon: '🎓' },
                { val: '9 706', label: 'femmes en AGR', sub: 'Fonds Francophonie avec Elles', icon: '👩‍🌾' },
              ].map(({ val, label, sub, icon }) => (
                <div key={label} className="bg-[var(--oif-neutral)] border border-gray-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">{icon}</div>
                  <p className="text-xl md:text-2xl font-black text-[var(--oif-blue)] leading-tight">{val}</p>
                  <p className="text-gray-700 text-xs font-semibold mt-1">{label}</p>
                  <p className="text-gray-400 text-[10px] mt-0.5 leading-tight">{sub}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Infographie par programme stratégique ───────────────────────── */}
      {!noData && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
              Synthèse par programme stratégique · ERA 2024
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* PS1 */}
              <div className="rounded-2xl border p-5" style={{ borderColor: '#C7D5F5', backgroundColor: '#EBF0FA' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📚</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#003DA520', color: '#003DA5' }}>PS1</span>
                  <span className="text-xs font-semibold text-gray-600">Langue & Éducation</span>
                </div>
                <div className="space-y-2">
                  {[
                    { proj: 'Langue internationale', taux: '75%' },
                    { proj: 'IFADEM', taux: '99%' },
                    { proj: 'ELAN', taux: '95%' },
                    { proj: 'CLAC', taux: '98%' },
                    { proj: 'Industrie culturelle', taux: '86%' },
                  ].map(({ proj, taux }) => (
                    <div key={proj} className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-white/60 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#003DA5]" style={{ width: taux }} />
                      </div>
                      <span className="text-xs font-bold text-[#003DA5] w-10 text-right flex-shrink-0">{taux}</span>
                      <span className="text-[10px] text-gray-500 w-24 truncate flex-shrink-0">{proj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PS2 */}
              <div className="rounded-2xl border p-5" style={{ borderColor: '#DEC5EE', backgroundColor: '#F3EAF9' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">⚖️</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#6B2C9120', color: '#6B2C91' }}>PS2</span>
                  <span className="text-xs font-semibold text-gray-600">Démocratie & Gouvernance</span>
                </div>
                <div className="space-y-2">
                  {[
                    { proj: 'État civil', taux: '94%' },
                    { proj: 'Désinformation', taux: '69%' },
                    { proj: 'Processus démocratique', taux: '71%' },
                    { proj: 'Paix & stabilité', taux: '49%' },
                    { proj: 'Tous projets PS2', taux: '100%' },
                  ].map(({ proj, taux }, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-white/60 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#6B2C91]" style={{ width: taux }} />
                      </div>
                      <span className="text-xs font-bold text-[#6B2C91] w-10 text-right flex-shrink-0">{taux}</span>
                      <span className="text-[10px] text-gray-500 w-24 truncate flex-shrink-0">{proj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PS3 */}
              <div className="rounded-2xl border p-5" style={{ borderColor: '#B3DDD7', backgroundColor: '#E6F4F1' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🌿</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#0F6E5620', color: '#0F6E56' }}>PS3</span>
                  <span className="text-xs font-semibold text-gray-600">Développement durable</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { val: '100%', label: 'amélioration conditions (FAE)' },
                    { val: '65%', label: 'jeunes/femmes utilisant compétences' },
                    { val: '39%', label: 'insertion numérique (cible: 60%)' },
                    { val: '55%', label: 'retombées Bassin du Congo' },
                  ].map(({ val, label }) => (
                    <div key={label} className="bg-white/70 rounded-xl p-2.5 text-center">
                      <p className="text-base font-black text-[#0F6E56] leading-tight">{val}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white/60 rounded-xl p-3 border border-[#0F6E56]/15">
                  <p className="text-[10px] font-bold text-[#0F6E56] mb-1">💼 Emploi & autonomisation</p>
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                    Accès à l&apos;emploi, stabilité professionnelle, augmentation des revenus
                    et autonomie économique pour les jeunes et les femmes.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Sélecteur d'édition ERA ──────────────────────────────────────── */}
      <EraEditionSwitcher />

      {/* ── État vide ───────────────────────────────────────────────────── */}
      {noData ? (
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center max-w-2xl mx-auto">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-[var(--oif-blue-dark)] mb-3">
              Données ERA à charger
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Exécutez les deux scripts SQL suivants dans Supabase pour charger les résultats ERA 2024 :
            </p>
            <div className="text-left bg-[var(--oif-neutral)] rounded-xl p-4 font-mono text-xs text-gray-700 space-y-2 mb-6">
              <p className="font-bold text-gray-900">1. Migration (à exécuter une seule fois)</p>
              <p className="text-gray-500">docs/migration_resultats_era.sql</p>
              <p className="font-bold text-gray-900 mt-3">2. Seed des données ERA 2024</p>
              <p className="text-gray-500">data/seeds/seed_resultats_era_2024.sql</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[var(--oif-blue)] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[var(--oif-blue-dark)] transition"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      ) : (
        /* ── Filtres + contenu interactif (Client Component) ─────────── */
        <EraFiltreClient resultats={resultats} parPS={parPS} />
      )}

      {/* ─── Footer simplifié ─────────────────────────────────────────────── */}
      <footer className="bg-[var(--oif-blue-dark)] text-white py-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--oif-gold)] flex items-center justify-center">
              <span className="text-white font-black text-[10px]">OIF</span>
            </div>
            <span className="text-white/60 text-xs">CREXE 2024 · Résultats ERA</span>
          </div>
          <p className="text-white/30 text-xs">
            Source : Rapport d&apos;enquête ERA 2024 — OIF, août 2025
          </p>
          <Link href="/" className="text-white/50 hover:text-white text-xs transition">
            ← Accueil
          </Link>
        </div>
      </footer>

    </div>
  )
}
