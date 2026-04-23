// ─── API Chat CREXE — Streaming RAG avec Claude ──────────────────────────────
// Route : POST /api/chat
//
// Concept pédagogique — Streaming :
// Au lieu d'attendre que Claude génère toute la réponse avant de l'envoyer,
// on utilise les "Server-Sent Events" (SSE). Le texte arrive mot par mot,
// comme ChatGPT. Techniquement : ReadableStream + TextEncoder côté serveur,
// EventSource ou fetch(response.body) côté client.
//
// Pipeline complet :
//   1. Reçoit { question, projetId?, historique? }
//   2. Vérifie la pertinence OIF (guard hors-périmètre)
//   3. Cherche les passages pertinents dans documents_rag (RAG)
//   4. Injecte le contexte dans le prompt système
//   5. Stream la réponse Claude vers le client
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { getContextePourQuestion } from '@/lib/rag/retrieval'
import { getContextePlateforme } from '@/lib/rag/platform-context'
import { getEditionFromRequest } from '@/lib/edition-context'
import {
  PROMPT_SYSTEME_CHATBOT,
  PROMPT_UTILISATEUR_TEMPLATE,
  MESSAGES_REFUS,
} from '@/lib/llm/prompts'

// Lazy init — instancié dans le handler, pas au chargement du module.
// Sinon next build crashe sur Netlify quand OPENAI_API_KEY est absent.
function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface MessageHistorique {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  question: string
  projetId?: string
  historique?: MessageHistorique[]
  editionAnnee?: number | null   // édition CREXE active (2024, 2025…)
}

// ─── Constantes ──────────────────────────────────────────────────────────────
const MAX_HISTORIQUE = 6          // nb de tours conservés (3 user + 3 assistant)
const MAX_QUESTION_LENGTH = 1000  // caractères max par question

// Mots-clés hors périmètre évidents (détection rapide avant d'appeler l'API)
const MOTS_HORS_PERIMETRE = [
  'recette', 'cuisine', 'météo', 'sport', 'football', 'bitcoin',
  'crypto', 'bourse', 'action', 'investissement personnel', 'amour',
  'santé personnelle', 'médecin', 'médecine générale',
]

function estHorsPerimetre(question: string): boolean {
  const q = question.toLowerCase()
  return MOTS_HORS_PERIMETRE.some(mot => q.includes(mot))
}

// ─── Rate limiting en mémoire (sans base de données) ─────────────────────────
// Concept : on garde un Map en mémoire Node.js avec l'IP comme clé.
// En serverless (Netlify), chaque instance a son propre Map — c'est donc
// une protection par instance, pas globale. Suffisant pour bloquer le spam simple.
// Pour une protection globale, utiliser Upstash Redis ou le table rate_limit_chatbot.
const RATE_MAP = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT  = 30   // requêtes max
const RATE_WINDOW = 60 * 60 * 1000  // fenêtre de 1 heure (ms)

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = RATE_MAP.get(ip)
  if (!entry || now > entry.reset) {
    RATE_MAP.set(ip, { count: 1, reset: now + RATE_WINDOW })
    return true // OK
  }
  if (entry.count >= RATE_LIMIT) return false // bloqué
  entry.count++
  return true
}

// ─── Handler principal ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Rate limiting par IP ─────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
           ?? req.headers.get('x-real-ip')
           ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: 'Trop de requêtes. Réessayez dans une heure.' },
      { status: 429, headers: { 'Retry-After': '3600' } }
    )
  }

  try {
    const body = await req.json() as ChatRequest
    const { question, projetId, historique = [], editionAnnee } = body

    // Résoudre l'édition active : corps JSON > header > cookie > défaut
    const editionActive = getEditionFromRequest(req.headers, editionAnnee ?? null)

    // ── Validation ────────────────────────────────────────────────────────
    if (!question || typeof question !== 'string') {
      return Response.json({ error: 'Question manquante' }, { status: 400 })
    }

    const questionClean = question.trim().slice(0, MAX_QUESTION_LENGTH)

    // ── Guard hors périmètre (détection rapide) ───────────────────────────
    if (estHorsPerimetre(questionClean)) {
      return Response.json({
        type: 'hors_perimetre',
        message: MESSAGES_REFUS.hors_sujet
      }, { status: 200 })
    }

    // ── Récupération du contexte — deux sources en parallèle ─────────────
    //
    //  Source A : Données structurées de la plateforme (projets, indicateurs)
    //             → toujours disponibles, connexion directe Supabase
    //  Source B : Base RAG vectorielle (PDF/DOCX uploadés par l'admin)
    //             → enrichit avec les nuances narratives des rapports
    //
    // Les deux s'exécutent en parallèle pour minimiser la latence.
    // Les deux sources s'exécutent en parallèle, toutes deux filtrées par édition active.
    const [contextePlateforme, contexteRag] = await Promise.all([
      getContextePlateforme(questionClean, editionActive),
      (async () => {
        try {
          const result = await getContextePourQuestion(questionClean, projetId, editionActive)
          return result.contexte
        } catch {
          return '' // RAG optionnel si pgvector non configuré
        }
      })(),
    ])

    // Assemblage du contexte final
    const partiesContexte = [contextePlateforme, contexteRag].filter(Boolean)
    const contexte = partiesContexte.length > 0
      ? partiesContexte.join('\n\n---\n\n')
      : 'Aucune donnée disponible.'

    // ── Construction des messages pour Claude ─────────────────────────────
    // L'historique permet à Claude de "se souvenir" des échanges précédents.
    // On limite à MAX_HISTORIQUE tours pour ne pas dépasser la fenêtre de contexte.
    const historiqueFiltre = historique.slice(-MAX_HISTORIQUE)

    // Messages formatés pour OpenAI (historique + question courante avec contexte RAG)
    const messagesAnthropic = [
      ...historiqueFiltre.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      {
        role: 'user' as const,
        content: PROMPT_UTILISATEUR_TEMPLATE(questionClean, contexte, projetId),
      },
    ]

    // ── Stream Claude ─────────────────────────────────────────────────────
    // ReadableStream : flux de données ouvert que le client lit au fil de l'eau.
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        const send = (data: string) => {
          // Format SSE : "data: {json}\n\n"
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }

        try {
          // GPT-4o-mini : rapide, économique, multilingue FR excellent
          const openai = getOpenAI()
          const gptStream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 1500,
            stream: true,
            messages: [
              { role: 'system', content: PROMPT_SYSTEME_CHATBOT },
              ...messagesAnthropic.map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content as string,
              })),
            ],
          })

          // Envoyer chaque delta de texte dès qu'il arrive
          for await (const chunk of gptStream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) {
              send(JSON.stringify({ type: 'delta', text }))
            }
          }

          // Signaler la fin du stream
          send(JSON.stringify({ type: 'done' }))
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          console.error('[Chat API] Erreur Claude:', msg)
          send(JSON.stringify({
            type: 'error',
            message: process.env.NODE_ENV === 'development'
              ? `Erreur API : ${msg}`
              : 'Une erreur est survenue. Veuillez réessayer.'
          }))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',  // désactive le buffering Nginx/Vercel
      },
    })

  } catch (err) {
    console.error('[Chat API] Erreur générale:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
