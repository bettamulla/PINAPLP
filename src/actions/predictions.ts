import { getDb } from '@/db'
import { predictions, predictionRevisions, users, storylines, articles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { analyzePrediction } from '@/lib/ai'
// Hardcoded owner — replace Clerk auth
const OWNER_USER_ID = 'owner-12345'

export async function createPrediction(data: {
  statement: string
  reasoning: string
  opposingArgument: string
  resolutionCriteria: string
  confidence: number
  expectedResolutionDate: Date
  storylineId?: string
  articleId?: string
}) {
  const db = getDb()!
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const contextArticles: string[] = []
  if (data.articleId) {
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, data.articleId),
    })
    if (article) contextArticles.push(article.content || '')
  }
  if (data.storylineId) {
    const storyline = await db.query.storylines.findFirst({
      where: eq(storylines.id, data.storylineId),
      with: { events: { with: { article: true }, limit: 5 } },
    })
    if (storyline) {
      contextArticles.push(...storyline.events.map(e => e.article?.content || '').filter(Boolean))
    }
  }

  const analysis = await analyzePrediction(
    data.statement,
    data.reasoning,
    data.opposingArgument,
    contextArticles
  )

  const [prediction] = await db.insert(predictions).values({
    userId: user.id,
    storylineId: data.storylineId || null,
    articleId: data.articleId || null,
    statement: data.statement,
    reasoning: data.reasoning,
    opposingArgument: data.opposingArgument,
    resolutionCriteria: data.resolutionCriteria,
    confidence: data.confidence,
    expectedResolutionDate: data.expectedResolutionDate,
    status: 'pending',
  }).returning()

  await db.insert(predictionRevisions).values({
    predictionId: prediction.id,
    confidence: data.confidence,
    reasoning: `Initial prediction. AI suggested confidence: ${analysis.suggestedConfidence}%`,
  })

  return { prediction, analysis }
}

export async function updatePredictionConfidence(predictionId: string, confidence: number, reasoning: string) {
  const db = getDb()!
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  const prediction = await db.query.predictions.findFirst({
    where: eq(predictions.id, predictionId),
  })
  if (!prediction) throw new Error('Prediction not found')
  if (prediction.userId !== userId) throw new Error('Forbidden')

  await db.update(predictions).set({
    confidence,
    updatedAt: new Date(),
  }).where(eq(predictions.id, predictionId))

  await db.insert(predictionRevisions).values({
    predictionId,
    confidence,
    reasoning,
  })

  return { success: true }
}

export async function resolvePrediction(predictionId: string) {
  const db = getDb()!
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  const prediction = await db.query.predictions.findFirst({
    where: eq(predictions.id, predictionId),
  })
  if (!prediction) throw new Error('Prediction not found')
  if (prediction.userId !== userId) throw new Error('Forbidden')

  return { success: true }
}