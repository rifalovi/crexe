'use client'

// ─── DocImporter — Composant d'import IA de documents CREXE ──────────────────
// Réutilisable dans :
//   - La page de création (/admin/projets/nouveau)
//   - La page d'édition (/admin/projets/[id]/edit, via bouton par onglet)
//   - La page d'import en lot (/admin/import)
//
// Concept pédagogique — Pipeline d'extraction :
//   1. Sélection fichier (drag & drop ou clic)
//   2. Choix du mode (ce qu'on veut extraire)
//   3. Envoi à /api/parse-document → Claude analyse le texte
//   4. Prévisualisation des données extraites (champ par champ)
//   5. Application sélective → les champs cochés sont injectés dans le formulaire
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────
export type ImportMode =
  | 'global'
  | 'projet'
  | 'indicateurs'
  | 'era'
  | 'chaine'
  | 'temoignages'

export interface ImportResult {
  ok: boolean
  mode: string
  fichier: string
  confiance?: number
  champs_manquants?: string[]
  projet?: Record<string, unknown>
  indicateurs?: unknown[]
  era?: unknown[]
  chaine?: Record<string, unknown>
  temoignages?: unknown[]
  pays_couverture?: string[]
}

interface DocImporterProps {
  modesDisponibles?: ImportMode[]
  onResult: (result: ImportResult) => void
  contexte?: string            // Ex: "PROJ_A14 — Langue française"
  compact?: boolean            // Mode compact pour les onglets d'édition
}

// ─── Config des modes ─────────────────────────────────────────────────────────
const MODE_CONFIG: Record<ImportMode, { label: string; icon: string; desc: string; couleur: string }> = {
  global:      { label: 'Tout extraire',      icon: '✦', desc: 'Projet + indicateurs + ERA + chaîne + témoignages', couleur: '#003DA5' },
  projet:      { label: 'Projet',             icon: '📁', desc: 'Métadonnées, budget, taux d\'exécution, pays', couleur: '#1E5FBE' },
  indicateurs: { label: 'Indicateurs',        icon: '📊', desc: 'KPIs, chiffres-clés, résultats mesurés', couleur: '#D4A017' },
  era:         { label: 'Résultats ERA',      icon: '🔬', desc: 'Acquisition · Effets · Retombées', couleur: '#0F6E56' },
  chaine:      { label: 'Chaîne résultats',   icon: '⛓️', desc: 'Extrants → Effets → Impact (CAD-OCDE)', couleur: '#6B2C91' },
  temoignages: { label: 'Témoignages',        icon: '💬', desc: 'Citations et retours de bénéficiaires', couleur: '#B83A2D' },
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function DocImporter({
  modesDisponibles = ['global', 'projet', 'indicateurs', 'era', 'chaine', 'temoignages'],
  onResult,
  contexte = '',
  compact = false,
}: DocImporterProps) {
  const [mode, setMode]         = useState<ImportMode>(modesDisponibles[0] ?? 'global')
  const [file, setFile]         = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [step, setStep]         = useState<'idle' | 'uploading' | 'parsing' | 'preview' | 'error'>('idle')
  const [result, setResult]     = useState<ImportResult | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  // ─── Drag & Drop ───────────────────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }, [])

  // ─── Lancement de l'analyse ───────────────────────────────────────────────
  async function analyser() {
    if (!file) return
    setStep('uploading')
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)
    if (contexte) formData.append('contexte', contexte)

    setStep('parsing')
    try {
      const res = await fetch('/api/parse-document', { method: 'POST', body: formData })
      const data: ImportResult = await res.json()
      if (!res.ok) {
        setError((data as unknown as { error: string }).error || 'Erreur inconnue')
        setStep('error')
        return
      }
      setResult(data)
      // Pré-sélectionner tous les champs extraits
      const champs = new Set<string>()
      if (data.projet)      champs.add('projet')
      if (data.indicateurs?.length) champs.add('indicateurs')
      if (data.era?.length) champs.add('era')
      if (data.chaine)      champs.add('chaine')
      if (data.temoignages?.length) champs.add('temoignages')
      if (data.pays_couverture?.length) champs.add('pays_couverture')
      setSelectedFields(champs)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau')
      setStep('error')
    }
  }

  // ─── Appliquer les champs sélectionnés ────────────────────────────────────
  function appliquer() {
    if (!result) return
    const filtered: ImportResult = { ...result }
    if (!selectedFields.has('projet'))       delete filtered.projet
    if (!selectedFields.has('indicateurs'))  delete filtered.indicateurs
    if (!selectedFields.has('era'))          delete filtered.era
    if (!selectedFields.has('chaine'))       delete filtered.chaine
    if (!selectedFields.has('temoignages'))  delete filtered.temoignages
    if (!selectedFields.has('pays_couverture')) delete filtered.pays_couverture
    onResult(filtered)
    setStep('idle')
    setFile(null)
    setResult(null)
  }

  const modeColor = MODE_CONFIG[mode]?.couleur ?? '#003DA5'
  const isProcessing = step === 'uploading' || step === 'parsing'

  return (
    <div className={`bg-white rounded-2xl border ${compact ? 'border-gray-100' : 'border-[#003DA5]/15 shadow-sm'} overflow-hidden`}>

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"
        style={{ backgroundColor: modeColor + '08' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: modeColor }}>
            IA
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Import depuis un document</p>
            <p className="text-xs text-gray-500">DOCX · PDF · TXT — analyse par Claude IA</p>
          </div>
        </div>
        {step === 'preview' && (
          <button onClick={() => { setStep('idle'); setResult(null); setFile(null) }}
            className="text-xs text-gray-400 hover:text-gray-600 transition">
            ← Nouveau document
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">

        {/* ── Étape 1 : Sélection du mode ──────────────────────────────────── */}
        {step !== 'preview' && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Que souhaitez-vous extraire ?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {modesDisponibles.map(m => {
                const cfg = MODE_CONFIG[m]
                const active = mode === m
                return (
                  <button key={m} onClick={() => setMode(m)}
                    className={`text-left px-3 py-2.5 rounded-xl border-2 transition text-xs ${
                      active ? 'border-current' : 'border-gray-100 hover:border-gray-200'
                    }`}
                    style={active ? { borderColor: cfg.couleur, backgroundColor: cfg.couleur + '10' } : {}}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>{cfg.icon}</span>
                      <span className="font-semibold" style={active ? { color: cfg.couleur } : { color: '#374151' }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-gray-400 leading-snug">{cfg.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Étape 2 : Zone de dépôt du fichier ───────────────────────────── */}
        {(step === 'idle' || step === 'error') && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Document à analyser
            </p>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                dragging
                  ? 'border-[#003DA5] bg-blue-50'
                  : file
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".docx,.pdf,.txt"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div>
                  <p className="text-2xl mb-1">📄</p>
                  <p className="text-sm font-semibold text-emerald-700">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} Ko — cliquez pour changer</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl mb-2">📂</p>
                  <p className="text-sm text-gray-600 font-medium">Glissez votre rapport ici</p>
                  <p className="text-xs text-gray-400 mt-1">ou cliquez pour parcourir — DOCX, PDF, TXT · max 25 Mo</p>
                </div>
              )}
            </div>

            {/* Erreur */}
            {step === 'error' && error && (
              <div className="mt-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
                ✗ {error}
              </div>
            )}

            {/* Bouton analyser */}
            {file && (
              <button
                onClick={analyser}
                disabled={isProcessing}
                className="mt-3 w-full py-3 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: modeColor }}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {step === 'uploading' ? 'Envoi du fichier…' : 'Claude analyse le document…'}
                  </>
                ) : (
                  <>✦ Analyser avec l&apos;IA — {MODE_CONFIG[mode]?.label}</>
                )}
              </button>
            )}
          </div>
        )}

        {/* ── Étape 3 : Prévisualisation des résultats ─────────────────────── */}
        {step === 'preview' && result && (
          <div className="space-y-4">

            {/* Indicateur de confiance */}
            {result.confiance !== undefined && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.round(result.confiance * 100)}%`, backgroundColor: result.confiance > 0.7 ? '#10b981' : result.confiance > 0.4 ? '#f59e0b' : '#ef4444' }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  Confiance : {Math.round(result.confiance * 100)}%
                </span>
              </div>
            )}

            {/* Champs manquants */}
            {result.champs_manquants && result.champs_manquants.length > 0 && (
              <div className="px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
                ⚠️ Non trouvés dans le document : {result.champs_manquants.join(', ')}
              </div>
            )}

            {/* Sélection des blocs à appliquer */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Sélectionnez les données à injecter dans le formulaire
              </p>
              <div className="space-y-2">

                {result.projet && (
                  <PreviewBloc
                    cle="projet" label="Projet" icon="📁" couleur="#1E5FBE"
                    checked={selectedFields.has('projet')}
                    onToggle={() => toggleField('projet')}
                    preview={`${result.projet.nom ?? ''} · ${result.projet.ps_id ?? ''} · Taux: ${result.projet.taux_execution ?? '—'}%`}
                    count={Object.values(result.projet).filter(v => v !== null && v !== undefined && v !== '').length}
                    unite="champ(s) extrait(s)"
                  />
                )}

                {result.indicateurs && result.indicateurs.length > 0 && (
                  <PreviewBloc
                    cle="indicateurs" label="Indicateurs" icon="📊" couleur="#D4A017"
                    checked={selectedFields.has('indicateurs')}
                    onToggle={() => toggleField('indicateurs')}
                    preview={(result.indicateurs as Array<{ libelle?: string }>).slice(0, 2).map(i => i.libelle).join(' · ')}
                    count={result.indicateurs.length}
                    unite="indicateur(s)"
                  />
                )}

                {result.era && result.era.length > 0 && (
                  <PreviewBloc
                    cle="era" label="Résultats ERA" icon="🔬" couleur="#0F6E56"
                    checked={selectedFields.has('era')}
                    onToggle={() => toggleField('era')}
                    preview={(result.era as Array<{ niveau?: string; titre_section?: string }>).map(e => e.niveau).join(' · ')}
                    count={result.era.length}
                    unite="section(s) ERA"
                  />
                )}

                {result.chaine && Object.keys(result.chaine).length > 0 && (
                  <PreviewBloc
                    cle="chaine" label="Chaîne des résultats" icon="⛓️" couleur="#6B2C91"
                    checked={selectedFields.has('chaine')}
                    onToggle={() => toggleField('chaine')}
                    preview="Extrants · Effets immédiats · Effets intermédiaires · Impact"
                    count={(result.chaine as { activites_structurantes?: unknown[] }).activites_structurantes?.length ?? 0}
                    unite="activité(s) structurante(s)"
                  />
                )}

                {result.temoignages && result.temoignages.length > 0 && (
                  <PreviewBloc
                    cle="temoignages" label="Témoignages" icon="💬" couleur="#B83A2D"
                    checked={selectedFields.has('temoignages')}
                    onToggle={() => toggleField('temoignages')}
                    preview={(result.temoignages as Array<{ citation?: string }>)[0]?.citation?.substring(0, 80) + '…'}
                    count={result.temoignages.length}
                    unite="témoignage(s)"
                  />
                )}

                {result.pays_couverture && result.pays_couverture.length > 0 && (
                  <PreviewBloc
                    cle="pays_couverture" label="Pays de couverture" icon="🌍" couleur="#374151"
                    checked={selectedFields.has('pays_couverture')}
                    onToggle={() => toggleField('pays_couverture')}
                    preview={result.pays_couverture.slice(0, 8).join(', ')}
                    count={result.pays_couverture.length}
                    unite="pays"
                  />
                )}

              </div>
            </div>

            {/* Bouton application */}
            <div className="flex gap-3">
              <button
                onClick={appliquer}
                disabled={selectedFields.size === 0}
                className="flex-1 py-3 text-sm font-semibold text-white rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ backgroundColor: modeColor }}
              >
                ✓ Injecter dans le formulaire ({selectedFields.size} bloc{selectedFields.size !== 1 ? 's' : ''})
              </button>
              <button
                onClick={() => { setStep('idle'); setResult(null); setFile(null) }}
                className="px-4 py-3 text-sm text-gray-500 hover:text-gray-700 rounded-xl border border-gray-200 transition"
              >
                Annuler
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )

  function toggleField(cle: string) {
    setSelectedFields(prev => {
      const next = new Set(prev)
      if (next.has(cle)) next.delete(cle)
      else next.add(cle)
      return next
    })
  }
}

// ─── Composant PreviewBloc ────────────────────────────────────────────────────
function PreviewBloc({
  cle, label, icon, couleur, checked, onToggle, preview, count, unite
}: {
  cle: string; label: string; icon: string; couleur: string
  checked: boolean; onToggle: () => void
  preview: string; count: number; unite: string
}) {
  return (
    <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
      checked ? 'border-current' : 'border-gray-100 opacity-60'
    }`}
    style={checked ? { borderColor: couleur, backgroundColor: couleur + '08' } : {}}>
      <input
        type="checkbox" checked={checked} onChange={onToggle} className="mt-0.5 flex-shrink-0"
        style={{ accentColor: couleur }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span>{icon}</span>
          <span className="text-sm font-semibold" style={{ color: couleur }}>{label}</span>
          <span className="text-xs text-gray-400 font-medium">{count} {unite}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{preview}</p>
      </div>
    </label>
  )
}
