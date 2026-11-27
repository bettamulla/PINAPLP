import { db } from '@/db'
import { articles, articleEmbeddings } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

const EMBEDDING_DIMENSIONS = 1536

export interface RAGContextItem {
  title: string
  content: string
  similarity: number
  source: 'semantic' | 'saved'
}

let embeddingCache: Record<string, number[]> = {}

export async function embedText(text: string): Promise<number[]> {
  if (embeddingCache[text]) {
    return embeddingCache[text]
  }

  const normalized = text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()

  let hash = 0
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  const embedding = new Array(EMBEDDING_DIMENSIONS).fill(0).map((_, i) => {
    const index = Math.abs((hash + i * 12345) % text.length)
    return (text.charCodeAt(index) % 100) / 100
  })

  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] = embedding[i] / magnitude
    }
  }

  embeddingCache[text] = embedding

  return embedding
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []

  if (words.length <= chunkSize) {
    return [text]
  }

  let start = 0
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length)
    chunks.push(words.slice(start, end).join(' '))

    if (end >= words.length) break

    start = end - overlap
    if (start < 0) start = 0
  }

  return chunks
}

export async function upsertArticleEmbedding(articleId: string): Promise<void> {
  const article = await db.query.articles.findFirst({
    where: eq(articles.id, articleId),
  })

  if (!article || !article.content) {
    console.warn(`Article ${articleId} not found or has no content`)
    return
  }

  const chunks = chunkText(article.content)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const embedding = await embedText(chunk)

    await db.insert(articleEmbeddings).values({
      articleId,
      chunkIndex: i,
      chunkText: chunk,
      embedding,
      tokenCount: Math.floor(chunk.split(/\s+/).length),
    }).onConflictDoNothing()
  }
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0

  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    magnitudeA += vecA[i] * vecA[i]
    magnitudeB += vecB[i] * vecB[i]
  }

  if (magnitudeA === 0 || magnitudeB === 0) return 0

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
}

export async function findSimilarArticles(query: string, limit: number = 5): Promise<RAGContextItem[]> {
  const queryEmbedding = await embedText(query)

  const allEmbeddings = await db.select().from(articleEmbeddings)

  const articleChunks = new Map<string, { chunks: { chunkText: string }[]; similarities: number[] }>()

  for (const row of allEmbeddings) {
    if (!articleChunks.has(row.articleId)) {
      articleChunks.set(row.articleId, { chunks: [], similarities: [] })
    }

    const articleData = articleChunks.get(row.articleId)!
    articleData.chunks.push({ chunkText: row.chunkText })
  }

  const articleScores: { articleId: string; similarity: number; content: string }[] = []

  for (const [articleId, data] of Array.from(articleChunks.entries())) {
    const combinedContent = data.chunks.map(c => c.chunkText).join('\n\n')
    let totalSim = 0

    for (const chunk of data.chunks) {
      const chunkEmbedding = await embedText(chunk.chunkText)
      totalSim += cosineSimilarity(queryEmbedding, chunkEmbedding)
    }

    const avgSimilarity = totalSim / data.chunks.length
    articleScores.push({
      articleId,
      similarity: avgSimilarity,
      content: combinedContent,
    })
  }

  const sortedResults = articleScores
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)

  const enrichedResults = await Promise.all(
    sortedResults.map(async (result) => {
      const article = await db.query.articles.findFirst({
        where: eq(articles.id, result.articleId),
      })

      return article
        ? {
            title: article.title,
            content: result.content,
            similarity: result.similarity,
            source: 'semantic' as const,
          }
        : null
    })
  )

  return enrichedResults.filter((item): item is NonNullable<typeof item> => item != null) as unknown as RAGContextItem[]
}

export async function semanticSearch(query: string, userId: string, limit: number = 5): Promise<RAGContextItem[]> {
  try {
    const results = await findSimilarArticles(query, limit)
    return results
  } catch (error) {
    console.error('Semantic search failed:', error)
    return []
  }
}

export async function populateAllEmbeddings(): Promise<{ processed: number; errors: number }> {
  const unsProcessedArticles = await db.query.articles.findMany({
    where: eq(articles.isProcessed, false),
    limit: 100,
  })

  let processed = 0
  let errors = 0

  for (const article of unsProcessedArticles) {
    try {
      await upsertArticleEmbedding(article.id)
      await db.update(articles).set({ isProcessed: true, processedAt: new Date() })
      processed++
    } catch (error) {
      console.error(`Error processing article ${article.id}:`, error)
      errors++
    }
  }

  return { processed, errors }
}