'use client'
// ─── Gestion de la Base de Connaissance — Back-office ────────────────────────
// Interface pour alimenter et gérer le chatbot SCS avec des documents CREXE/OIF.
//
// Formats supportés :
//   .txt .md .json   → lecture directe
//   .docx            → extraction mammoth côté serveur
//   .pdf             → extraction pdfjs-dist côté serveur
//   .csv             → lecture tabulaire
//   .xlsx .xls       → extraction SheetJS
//   Images           → non supportées (pas d'OCR)
//
// Concept pédagogique — Pipeline complet :
//   1. Admin choisit un fichier
//   2. Envoi en multipart/form-data à /api/knowledge/upload
//   3. L'API extrait le texte, découpe en chunks, génère les embeddings
//   4. Les chunks sont stockés dans documents_rag (pgvector)
//   5. Le chatbot interroge cette base à chaque question
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react'

interface DocumentInfo {
  source: string
  titre: string
  categorie: string
  projet_id: string | null
  nb_chunks: number
  tokens_total: number
  created_at: string
}

interface KBStats {
  total_chunks: number
  documents: DocumentInfo[]
}

const CATEGORIE_LABELS: Record<string, { label: string; color: string }> = {
  crexe:        { label: 'CREXE',        color: 'bg-blue-100 text-blue-700' },
  general_oif:  { label: 'OIF général',  color: 'bg-purple-100 text-purple-700' },
  methodologie: { label: 'Méthodologie', color: 'bg-amber-100 text-amber-700' },
  autre:        { label: 'Autre',        color: 'bg-gray-100 text-gray-600' },
}

const FORMATS_ACCEPTES = '.txt,.md,.json,.docx,.pdf,.csv,.xlsx,.xls'
const FORMATS_LABELS   = 'TXT · MD · DOCX · PDF · CSV · Excel'

export default function BaseConnaissancePage() {
  const [stats, setStats]         = useState<KBStats | null>(null)
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [suppression, setSuppression] = useState<string | null>(null)  // source en cours de suppression
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirmSuppr, setConfirmSuppr] = useState<string | null>(null)

  // Formulaire d'upload
  const [titre, setTitre]         = useState('')
  const [categorie, setCategorie] = useState('crexe')
  const [projetId, setProjetId]   = useState('')
  const [section, setSection]     = useState('')
  const [texteManuel, setTexteManuel] = useState('')
  const [fichierNom, setFichierNom]   = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const chargerStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/knowledge/upload')
      if (res.ok) {
        const data = await res.json() as KBStats
        setStats(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { chargerStats() }, [chargerStats])

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setUploadMsg(null)

    try {
      const formData = new FormData()
      const fichier  = fileInputRef.current?.files?.[0]

      if (!fichier && !texteManuel.trim()) {
        setUploadMsg({ type: 'error', text: 'Veuillez fournir un fichier ou coller du texte.' })
        return
      }

      if (fichier) formData.append('fichier', fichier)
      else {
        const blob = new Blob([texteManuel], { type: 'text/plain' })
        formData.append('fichier', blob, `${titre || 'document'}.txt`)
      }

      formData.append('titre', titre || fichier?.name || 'Document')
      formData.append('categorie', categorie)
      if (projetId) formData.append('projet_id', projetId)
      if (section)  formData.append('section', section)

      const res = await fetch('/api/knowledge/upload', { method: 'POST', body: formData })
      const data = await res.json() as { success?: boolean; chunks_crees?: number; message?: string; error?: string }

      if (res.ok && data.success) {
        setUploadMsg({ type: 'success', text: data.message ?? `${data.chunks_crees} passages indexés.` })
        setTitre(''); setTexteManuel(''); setSection(''); setFichierNom(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        await chargerStats()
      } else {
        setUploadMsg({ type: 'error', text: data.error ?? 'Erreur lors du traitement.' })
      }
    } catch {
      setUploadMsg({ type: 'error', text: 'Erreur réseau. Vérifiez votre connexion.' })
    } finally {
      setUploading(false)
    }
  }

  // ── Suppression ─────────────────────────────────────────────────────────────
  const handleSupprimer = async (source: string) => {
    setSuppression(source)
    setConfirmSuppr(null)
    try {
      const res = await fetch('/api/knowledge/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_document: source }),
      })
      const data = await res.json() as { success?: boolean; supprimes?: number; error?: string }
      if (res.ok && data.success) {
        await chargerStats()
      }
    } finally {
      setSuppression(null)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--oif-blue)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.332 2.798H4.13c-1.361 0-2.332-1.797-1.332-2.798L4 14.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--oif-blue-dark)]">Base de connaissance</h1>
            <p className="text-sm text-gray-500">Alimenter l&apos;assistant SCS avec des documents CREXE et OIF</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Formulaire d'upload ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-[var(--oif-blue-dark)] mb-1">Ajouter un document</h2>
          <p className="text-xs text-gray-400 mb-5 leading-relaxed">
            Formats acceptés : <strong className="text-gray-600">{FORMATS_LABELS}</strong>.
            Le document est découpé en passages, vectorisé et rendu disponible au chatbot.
          </p>

          <form onSubmit={handleUpload} className="space-y-4">

            {/* Titre */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Titre du document *
              </label>
              <input
                type="text"
                value={titre}
                onChange={e => setTitre(e.target.value)}
                placeholder="ex : CREXE 2025 — Rapport PS2"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 focus:border-[var(--oif-blue)] transition"
                required
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Catégorie
              </label>
              <select
                value={categorie}
                onChange={e => setCategorie(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 bg-white"
              >
                <option value="crexe">CREXE (données projets OIF)</option>
                <option value="general_oif">OIF général (présentation, stratégie)</option>
                <option value="methodologie">Méthodologie ERA / SCS / GAR</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {/* Projet associé */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Projet <span className="font-normal text-gray-400">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={projetId}
                  onChange={e => setProjetId(e.target.value)}
                  placeholder="ex : PROJ_A14"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Section <span className="font-normal text-gray-400">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={e => setSection(e.target.value)}
                  placeholder="ex : Réalisations 2025"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 transition"
                />
              </div>
            </div>

            {/* Zone drag & drop fichier */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Fichier
              </label>
              <label
                className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[var(--oif-blue)]/50 hover:bg-[var(--oif-blue)]/2 transition group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={FORMATS_ACCEPTES}
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    setFichierNom(f?.name ?? null)
                    if (f && !titre) setTitre(f.name.replace(/\.[^.]+$/, ''))
                  }}
                />
                {fichierNom ? (
                  <div className="text-center px-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path strokeLinecap="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-[var(--oif-blue-dark)] truncate max-w-[200px]">{fichierNom}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Cliquez pour changer</p>
                  </div>
                ) : (
                  <div className="text-center px-4">
                    <svg className="mx-auto mb-2 text-gray-300 group-hover:text-[var(--oif-blue)] transition" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-xs text-gray-400">Glissez un fichier ou <span className="text-[var(--oif-blue)]">parcourir</span></p>
                    <p className="text-[10px] text-gray-300 mt-1">{FORMATS_LABELS}</p>
                  </div>
                )}
              </label>
            </div>

            {/* Séparateur */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">ou</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Zone texte (coller) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Coller du texte directement
              </label>
              <textarea
                value={texteManuel}
                onChange={e => setTexteManuel(e.target.value)}
                rows={5}
                placeholder="Collez ici le texte d'un document, d'un rapport, d'une note…"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 transition resize-none"
              />
              {texteManuel && (
                <p className="text-xs text-gray-400 mt-1">
                  {texteManuel.split(/\s+/).length.toLocaleString('fr-FR')} mots
                  · ~{Math.ceil(texteManuel.split(/\s+/).length / 400)} chunk(s)
                </p>
              )}
            </div>

            {/* Message */}
            {uploadMsg && (
              <div className={`rounded-lg px-4 py-3 text-sm ${
                uploadMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {uploadMsg.type === 'success' ? '✓ ' : '✗ '}{uploadMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 bg-[var(--oif-blue)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--oif-blue-dark)] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/>
                    <path strokeLinecap="round" d="M21 12a9 9 0 00-9-9"/>
                  </svg>
                  Indexation en cours…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Indexer le document
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Documents indexés ───────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Compteur */}
          <div className="bg-[var(--oif-blue-dark)] text-white rounded-2xl p-5">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Base de connaissance SCS</p>
            {loading ? (
              <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold">
                {(stats?.total_chunks ?? 0).toLocaleString('fr-FR')}
                <span className="text-lg font-normal text-white/60 ml-2">passages indexés</span>
              </p>
            )}
            <p className="text-xs text-white/40 mt-2">
              {stats?.documents.length ?? 0} document{(stats?.documents.length ?? 0) > 1 ? 's' : ''}
            </p>
          </div>

          {/* Liste documents */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--oif-blue-dark)]">Documents indexés</p>
              <button
                onClick={chargerStats}
                className="text-xs text-[var(--oif-blue)] hover:text-[var(--oif-blue-dark)] transition"
              >
                Actualiser
              </button>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}
              </div>
            ) : !stats || stats.documents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">Aucun document indexé</p>
                <p className="text-xs text-gray-400 mt-1">Ajoutez votre premier document pour activer le chatbot.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
                {stats.documents.map((doc) => {
                  const cat        = CATEGORIE_LABELS[doc.categorie] ?? CATEGORIE_LABELS.autre
                  const enCours    = suppression === doc.source
                  const confirming = confirmSuppr === doc.source

                  return (
                    <div key={doc.source} className="px-5 py-3 hover:bg-gray-50 transition group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--oif-blue-dark)] truncate">
                            {doc.titre}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {doc.source}
                            {doc.projet_id && (
                              <span className="ml-1.5 text-[var(--oif-blue)]">· {doc.projet_id}</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cat.color}`}>
                              {cat.label}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {doc.nb_chunks} passage{doc.nb_chunks > 1 ? 's' : ''}
                            </span>
                            <span className="text-[10px] text-gray-300">
                              {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>

                        {/* Bouton suppression */}
                        <div className="flex-shrink-0 flex items-center gap-1">
                          {confirming ? (
                            <>
                              <button
                                onClick={() => handleSupprimer(doc.source)}
                                disabled={enCours}
                                className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
                              >
                                {enCours ? '…' : 'Confirmer'}
                              </button>
                              <button
                                onClick={() => setConfirmSuppr(null)}
                                className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                              >
                                Annuler
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setConfirmSuppr(doc.source)}
                              className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400"
                              title={`Supprimer "${doc.titre}"`}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Note formats */}
          <div className="bg-[var(--oif-neutral)] rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold text-[var(--oif-blue-dark)] mb-2">Formats supportés</p>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              {[
                { ext: 'DOCX', desc: 'Word', icon: '📝' },
                { ext: 'PDF',  desc: 'Acrobat', icon: '📄' },
                { ext: 'TXT',  desc: 'Texte brut', icon: '📃' },
                { ext: 'CSV',  desc: 'Données', icon: '📊' },
                { ext: 'XLSX', desc: 'Excel', icon: '📈' },
                { ext: 'MD',   desc: 'Markdown', icon: '🗒' },
              ].map(f => (
                <div key={f.ext} className="flex items-center gap-1.5 bg-white rounded-lg px-2 py-1.5 border border-gray-100">
                  <span>{f.icon}</span>
                  <div>
                    <p className="font-bold text-[var(--oif-blue-dark)]">.{f.ext.toLowerCase()}</p>
                    <p className="text-gray-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              ⚠️ Les images (PNG, JPG) ne sont pas supportées — le chatbot ne peut pas lire du texte dans une image.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
