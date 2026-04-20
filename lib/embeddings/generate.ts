// ─── Génération d'embeddings (vecteurs sémantiques) ─────────────────────────
// Concept pédagogique :
// Un embedding est une représentation numérique d'un texte sous forme de vecteur
// (tableau de nombres). Deux textes sémantiquement proches auront des vecteurs
// proches dans l'espace vectoriel. C'est la base de la recherche sémantique.
//
// On utilise OpenAI text-embedding-3-small (1536 dimensions, multilingue, rapide).
// ─────────────────────────────────────────────────────────────────────────────

import OpenAI from 'openai'

// Concept pédagogique — Lazy initialization :
// Ne pas instancier le client au niveau du module. Next.js importe les modules
// pendant le build (collecte des pages) — si la clé API est absente à ce stade,
// le build échoue. En instanciant à l'intérieur de la fonction, le client
// n'est créé qu'à l'exécution (première vraie requête), jamais au build.
function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// Modèle : 1536 dimensions = compatibilité avec le schema documents_rag (vector(1536))
const MODEL = 'text-embedding-3-small'

/**
 * Génère un embedding pour un texte unique.
 * Retourne un tableau de 1536 nombres flottants.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI()
  // Nettoyage : supprimer les sauts de ligne multiples (dégradent la qualité)
  const cleaned = text.replace(/\n+/g, ' ').trim()

  const response = await openai.embeddings.create({
    model: MODEL,
    input: cleaned,
  })

  return response.data[0].embedding
}

/**
 * Génère des embeddings pour plusieurs textes en batch.
 * Plus efficace que d'appeler generateEmbedding() en boucle
 * car l'API OpenAI traite tout en un seul appel réseau.
 *
 * Limite : 2048 inputs par appel, ~8191 tokens par input.
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const openai = getOpenAI()
  const cleaned = texts.map(t => t.replace(/\n+/g, ' ').trim())

  const response = await openai.embeddings.create({
    model: MODEL,
    input: cleaned,
  })

  // L'API retourne les embeddings dans le même ordre que les inputs
  return response.data
    .sort((a, b) => a.index - b.index)
    .map(item => item.embedding)
}

/**
 * Découpe un texte long en chunks de taille maîtrisée.
 *
 * Concept pédagogique — Chunking :
 * Les LLMs ont une limite de tokens. Pour qu'un document de 50 pages
 * puisse entrer dans un contexte, on le découpe en "morceaux" (chunks)
 * de ~500 mots. Chaque chunk est vectorisé indépendamment.
 * À la recherche, on ne retrouve que les chunks pertinents.
 *
 * @param text       Texte source complet
 * @param chunkSize  Taille cible en mots (défaut : 400)
 * @param overlap    Chevauchement entre chunks en mots (défaut : 50)
 */
export function chunkText(
  text: string,
  chunkSize = 400,
  overlap = 50
): string[] {
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const chunks: string[] = []

  let start = 0
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length)
    const chunk = words.slice(start, end).join(' ')
    if (chunk.trim().length > 50) {   // ignorer les micro-chunks
      chunks.push(chunk)
    }
    if (end >= words.length) break
    start += chunkSize - overlap       // reculer de `overlap` mots pour la continuité
  }

  return chunks
}
