// ─── Retrieval RAG — Recherche sémantique dans la base de connaissance ────────
// Concept pédagogique — Architecture RAG :
//
// RAG = Retrieval-Augmented Generation
// Au lieu de demander au LLM de "se souvenir" des données CREXE (ce qu'il ne
// peut pas faire), on lui fournit les passages pertinents dans son contexte.
//
// Pipeline :
//   1. Question utilisateur → embedding (vecteur)
//   2. Recherche dans documents_rag par similarité cosinus (pgvector)
//   3. Les N chunks les plus proches → injectés dans le prompt
//   4. Claude génère une réponse ancrée dans ces passages réels
//
// Avantage : la réponse est toujours sourcée, jamais hallucinée.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from '@/lib/embeddings/generate'

// Client Supabase avec service role pour contourner RLS en lecture RAG
// (le chatbot est anonyme mais doit lire tous les documents)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface DocumentChunk {
  id: string
  projet_id: string | null
  contenu: string
  type_contenu: string | null
  section: string | null
  source_document: string | null
  source_page: number | null
  similarity: number
}

/**
 * Recherche les chunks les plus pertinents pour une question donnée.
 *
 * @param question       La question de l'utilisateur (en langage naturel)
 * @param matchCount     Nombre de chunks à retourner (défaut : 8)
 * @param threshold      Seuil de similarité minimum 0-1 (défaut : 0.5)
 * @param projetId       Filtrer sur un projet spécifique (optionnel)
 */
export async function retrieveContexte(
  question: string,
  matchCount = 8,
  threshold = 0.5,
  projetId?: string
): Promise<DocumentChunk[]> {
  const supabase = getSupabaseAdmin()

  // Étape 1 : vectoriser la question
  const queryEmbedding = await generateEmbedding(question)

  // Étape 2 : appeler la fonction pgvector match_documents
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: matchCount,
    filter_projet_id: projetId ?? null,
  })

  if (error) {
    console.error('[RAG] Erreur match_documents:', error.message)
    return []
  }

  return (data ?? []) as DocumentChunk[]
}

/**
 * Formate les chunks récupérés en un bloc de contexte lisible pour le LLM.
 * Chaque chunk est présenté avec sa source pour permettre la citation.
 */
export function formaterContexte(chunks: DocumentChunk[]): string {
  if (chunks.length === 0) {
    return 'Aucun document pertinent trouvé dans la base de connaissance CREXE.'
  }

  return chunks
    .map((c, i) => {
      const source = [
        c.source_document,
        c.source_page ? `p. ${c.source_page}` : null,
        c.section,
        c.projet_id ? `Projet ${c.projet_id}` : null,
      ].filter(Boolean).join(' · ')

      return `[Document ${i + 1}${source ? ` — ${source}` : ''}]\n${c.contenu}`
    })
    .join('\n\n---\n\n')
}

/**
 * Pipeline complet : question → contexte formaté.
 * Utilisé directement dans la route API /api/chat.
 */
export async function getContextePourQuestion(
  question: string,
  projetId?: string
): Promise<{ contexte: string; chunks: DocumentChunk[] }> {
  const chunks = await retrieveContexte(question, 8, 0.45, projetId)
  const contexte = formaterContexte(chunks)
  return { contexte, chunks }
}
