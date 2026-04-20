'use client'
// ─── Widget Chatbot SCS ───────────────────────────────────────────────────────
// Composant Client flottant — disponible sur toutes les pages publiques.
//
// Concept pédagogique — Comment fonctionne la UI du streaming ?
// On utilise fetch() avec response.body (ReadableStream) pour lire le flux SSE
// dès que les premiers tokens arrivent. Un TextDecoder lit les chunks.
// Chaque "data: {...}\n\n" est parsé : si type="delta", on ajoute le texte.
// Le résultat s'affiche progressivement, comme ChatGPT.
//
// Concept pédagogique — Rendu Markdown sans dépendance externe :
// On analyse le texte ligne par ligne. Les tableaux Markdown (lignes qui
// commencent par |) sont convertis en <table> HTML. Les listes, titres, gras,
// italique et liens sont traités par des regex. Tout est échappé pour éviter
// les injections XSS avant l'insertion via dangerouslySetInnerHTML.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from 'react'
import { SUGGESTIONS_DEMARRAGE } from '@/lib/llm/prompts'

// ─── Rendu Markdown → HTML ────────────────────────────────────────────────────
// Gère : tableaux, listes, titres ##/###, gras, italique, liens, code inline
function renderMarkdown(texte: string): string {
  // 1. Échapper le HTML pour éviter les injections XSS
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 2. Inline : gras, italique, code, liens (appliqué sur une ligne)
  const inline = (s: string): string =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-[var(--oif-blue-dark)] px-1 rounded text-xs font-mono">$1</code>')
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (_, label, href) => {
          const isInterne = href.startsWith('/')
          return `<a href="${esc(href)}"${isInterne ? '' : ' target="_blank" rel="noopener"'} class="text-[var(--oif-blue)] underline underline-offset-2 hover:opacity-75 transition">${label}</a>`
        }
      )

  const lignes = texte.split('\n')
  const blocs: string[] = []
  let i = 0

  while (i < lignes.length) {
    const ligne = lignes[i]

    // ── Tableau Markdown ────────────────────────────────────────────────────
    // Détection : ligne qui commence et finit par |
    if (/^\s*\|.*\|\s*$/.test(ligne)) {
      const tableLines: string[] = []
      while (i < lignes.length && /^\s*\|.*\|\s*$/.test(lignes[i])) {
        tableLines.push(lignes[i])
        i++
      }

      // Séparer entête (première ligne), ligne de séparation (---), corps
      const [headerLine, separatorLine, ...bodyLines] = tableLines
      const isSeparator = (l: string) => /^\s*\|[\s\-:|]+\|\s*$/.test(l)

      const parseCells = (l: string) =>
        l.split('|').slice(1, -1).map(c => c.trim())

      const headers = parseCells(headerLine ?? '')
      const rows = isSeparator(separatorLine ?? '')
        ? bodyLines.map(parseCells)
        : [parseCells(separatorLine ?? ''), ...bodyLines.map(parseCells)]

      blocs.push(`
        <div class="overflow-x-auto my-3 rounded-xl border border-gray-200 shadow-sm">
          <table class="min-w-full text-xs">
            <thead class="bg-[var(--oif-blue-dark)] text-white">
              <tr>${headers.map(h => `<th class="px-3 py-2 text-left font-semibold whitespace-nowrap">${inline(h)}</th>`).join('')}</tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${rows.map((row, ri) => `
                <tr class="${ri % 2 === 0 ? 'bg-white' : 'bg-[var(--oif-neutral)]'}">
                  ${row.map(cell => `<td class="px-3 py-1.5 text-[var(--oif-blue-dark)]">${inline(cell)}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `)
      continue
    }

    // ── Titres ###/## ────────────────────────────────────────────────────────
    const h3 = ligne.match(/^###\s+(.+)/)
    if (h3) {
      blocs.push(`<p class="font-bold text-[var(--oif-blue-dark)] mt-3 mb-1 text-sm">${inline(h3[1])}</p>`)
      i++; continue
    }
    const h2 = ligne.match(/^##\s+(.+)/)
    if (h2) {
      blocs.push(`<p class="font-bold text-[var(--oif-blue-dark)] mt-4 mb-1">${inline(h2[1])}</p>`)
      i++; continue
    }

    // ── Listes à puces ────────────────────────────────────────────────────────
    if (/^\s*[-*]\s+/.test(ligne)) {
      const items: string[] = []
      while (i < lignes.length && /^\s*[-*]\s+/.test(lignes[i])) {
        items.push(lignes[i].replace(/^\s*[-*]\s+/, ''))
        i++
      }
      blocs.push(`<ul class="my-1.5 space-y-0.5 pl-4">${items.map(it => `<li class="list-disc list-outside text-[var(--oif-blue-dark)]">${inline(it)}</li>`).join('')}</ul>`)
      continue
    }

    // ── Listes numérotées ─────────────────────────────────────────────────────
    if (/^\s*\d+\.\s+/.test(ligne)) {
      const items: string[] = []
      while (i < lignes.length && /^\s*\d+\.\s+/.test(lignes[i])) {
        items.push(lignes[i].replace(/^\s*\d+\.\s+/, ''))
        i++
      }
      blocs.push(`<ol class="my-1.5 space-y-0.5 pl-4">${items.map(it => `<li class="list-decimal list-outside text-[var(--oif-blue-dark)]">${inline(it)}</li>`).join('')}</ol>`)
      continue
    }

    // ── Ligne vide ────────────────────────────────────────────────────────────
    if (ligne.trim() === '') {
      blocs.push('<div class="h-1.5"></div>')
      i++; continue
    }

    // ── Paragraphe standard ───────────────────────────────────────────────────
    blocs.push(`<p class="text-[var(--oif-blue-dark)] leading-relaxed">${inline(ligne)}</p>`)
    i++
  }

  return blocs.join('\n')
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

interface ChatWidgetProps {
  projetId?: string   // Si fourni, le contexte RAG est filtré sur ce projet
}

export default function ChatWidget({ projetId }: ChatWidgetProps) {
  const [ouvert, setOuvert]       = useState(false)
  const [messages, setMessages]   = useState<Message[]>([])
  const [question, setQuestion]   = useState('')
  const [enCours, setEnCours]     = useState(false)
  const [hasNew, setHasNew]       = useState(false)   // badge notification

  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const inputRef        = useRef<HTMLInputElement>(null)
  const abortRef        = useRef<AbortController | null>(null)

  // Scroll automatique en bas
  const scrollBas = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollBas() }, [messages, scrollBas])

  useEffect(() => {
    if (ouvert) {
      setHasNew(false)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [ouvert])

  // Historique pour l'API (limité aux 6 derniers messages)
  const getHistorique = () =>
    messages
      .filter(m => !m.loading)
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }))

  const envoyerQuestion = async (texte?: string) => {
    const q = (texte ?? question).trim()
    if (!q || enCours) return

    setQuestion('')
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
    }
    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
      loading: true,
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setEnCours(true)

    // Annuler toute requête en cours
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          question: q,
          projetId,
          historique: getHistorique(),
        }),
      })

      // Réponse non-stream (hors périmètre ou erreur JSON)
      const contentType = res.headers.get('content-type') ?? ''
      if (contentType.includes('application/json')) {
        const data = await res.json() as { message?: string; error?: string; type?: string }
        const texte = data.message ?? data.error ?? 'Erreur inconnue.'
        setMessages(prev =>
          prev.map(m => m.id === assistantMsg.id ? { ...m, content: texte, loading: false } : m)
        )
        return
      }

      // Lecture du stream SSE
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return

      let texteAccumule = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const raw = decoder.decode(value, { stream: true })
        const lignes = raw.split('\n')

        for (const ligne of lignes) {
          if (!ligne.startsWith('data: ')) continue
          try {
            const payload = JSON.parse(ligne.slice(6)) as { type: string; text?: string; message?: string }
            if (payload.type === 'delta' && payload.text) {
              texteAccumule += payload.text
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsg.id
                    ? { ...m, content: texteAccumule, loading: false }
                    : m
                )
              )
            } else if (payload.type === 'done') {
              break
            } else if (payload.type === 'error') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsg.id
                    ? { ...m, content: payload.message ?? 'Erreur.', loading: false }
                    : m
                )
              )
            }
          } catch {
            // chunk incomplet — ignore
          }
        }
      }

      // Notification si la fenêtre est fermée
      if (!ouvert) setHasNew(true)

    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsg.id
            ? { ...m, content: 'Une erreur est survenue. Veuillez réessayer.', loading: false }
            : m
        )
      )
    } finally {
      setEnCours(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void envoyerQuestion()
    }
  }

  return (
    <>
      {/* ── Bulle flottante ──────────────────────────────────────────────── */}
      <button
        onClick={() => setOuvert(v => !v)}
        aria-label="Ouvrir l'assistant SCS"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--oif-blue)] text-white shadow-2xl flex items-center justify-center hover:bg-[var(--oif-blue-dark)] transition-all duration-200 hover:scale-110"
      >
        {ouvert ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        )}
        {/* Badge notification */}
        {hasNew && !ouvert && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--oif-gold)] rounded-full text-[10px] font-bold flex items-center justify-center">
            !
          </span>
        )}
      </button>

      {/* ── Fenêtre de chat ──────────────────────────────────────────────── */}
      {ouvert && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm shadow-2xl rounded-2xl overflow-hidden border border-gray-200 flex flex-col"
          style={{ height: '520px' }}>

          {/* En-tête */}
          <div className="bg-[var(--oif-blue-dark)] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[var(--oif-gold)] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm leading-tight">Assistant SCS</p>
              <p className="text-white/50 text-[10px] leading-tight">
                Données CREXE — OIF · Périmètre SCS
              </p>
            </div>
            {/* Indicateur en ligne */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-white/50 text-[10px]">En ligne</span>
            </div>
          </div>

          {/* Zone messages */}
          <div className="flex-1 overflow-y-auto bg-[#F8F9FC] px-4 py-4 space-y-3">

            {/* Message de bienvenue si aucun message */}
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--oif-blue)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="none">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[85%]">
                    <p className="text-sm text-[var(--oif-blue-dark)] leading-relaxed">
                      Bonjour, je suis l&apos;assistant du Service de Conception et Suivi des projets (SCS) de l&apos;OIF.
                    </p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      Posez-moi vos questions sur les projets, résultats et impacts du CREXE 2025.
                    </p>
                  </div>
                </div>

                {/* Suggestions de démarrage */}
                <div className="space-y-1.5 pl-9">
                  {SUGGESTIONS_DEMARRAGE.slice(0, 3).map(s => (
                    <button
                      key={s.libelle}
                      onClick={() => void envoyerQuestion(s.libelle)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 text-[var(--oif-blue)] hover:bg-[var(--oif-blue)]/5 hover:border-[var(--oif-blue)]/30 transition"
                    >
                      {s.libelle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[var(--oif-blue)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="none">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[var(--oif-blue)] text-white rounded-tr-sm'
                      : 'bg-white text-[var(--oif-blue-dark)] rounded-tl-sm'
                  }`}
                >
                  {msg.loading && !msg.content ? (
                    /* Points de chargement animés */
                    <div className="flex items-center gap-1 py-1">
                      {[0,1,2].map(i => (
                        <span key={i}
                          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Rendu Markdown complet : tableaux, listes, titres, liens */
                    <div
                      className="break-words min-w-0 overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="flex-shrink-0 bg-white border-t border-gray-100 px-3 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question…"
                disabled={enCours}
                className="flex-1 px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--oif-blue)]/30 focus:border-[var(--oif-blue)] transition disabled:opacity-50"
              />
              <button
                onClick={() => void envoyerQuestion()}
                disabled={!question.trim() || enCours}
                aria-label="Envoyer"
                className="w-9 h-9 rounded-xl bg-[var(--oif-blue)] text-white flex items-center justify-center hover:bg-[var(--oif-blue-dark)] transition disabled:opacity-40 flex-shrink-0"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Limité aux prérogatives SCS · OIF — CREXE {new Date().getFullYear()}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
