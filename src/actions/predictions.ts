'use server'

import { db } from '@/db'
import { predictions, predictionRevisions, users, storylines, articles } from '@/db/schema'
import { eq, and, desc, count, sql } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { analyzePrediction } from '@/lib/ai'

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
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  let contextArticles: string[] = []
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
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

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

export async function resolvePrediction(predictionId: string, outcome: string, status: 'resolved_correct' | 'resolved_incorrect' | 'unresolvable') {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const prediction = await db.query.predictions.findFirst({
    where: eq(predictions.id, predictionId),
  })
  if (!prediction) throw new Error('Prediction not found')
  if (prediction.userId !== userId) throw new Error('Forbidden')

  let brierScore: number | null = null
  if (status !== 'unresolvable') {
    const outcomeBinary = status === 'resolved_correct' ? 1 : 0
    const probability = prediction.confidence / 100
    brierScore = Math.pow(probability - outcomeBinary, 2)
  }

  await db.update(predictions).set({
    status,
    outcome,
    resolvedAt: new Date(),
    resolvedBy: userId,
    brierScore: brierScore?.toString() || null,
    updatedAt: new Date(),
  }).where(eq(predictions.id, predictionId))

  return { success: true, brierScore }
}

export async function getUserPredictions(status?: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const whereConditions = [eq(predictions.userId, user.id)]
  if (status) whereConditions.push(eq(predictions.status, status as any))

  const userPredictions = await db.query.predictions.findMany({
    where: and(...whereConditions),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    with: {
      storyline: true,
      article: true,
      revisions: { orderBy: (r, { desc }) => [desc(r.createdAt)] },
    },
  })

  return userPredictions
}

export async function getCalibrationStats() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const allPredictions = await db.query.predictions.findMany({
    where: eq(predictions.userId, user.id),
  })

  const resolved = allPredictions.filter(p => p.status !== 'pending')
  const correct = resolved.filter(p => p.status === 'resolved_correct')
  const incorrect = resolved.filter(p => p.status === 'resolved_incorrect')

  const byConfidence: Record<string, { total: number; correct: number }> = {}
  const brackets = ['0-10', '10-30', '30-50', '50-70', '70-90', '90-100']

  for (const bracket of brackets) {
    byConfidence[bracket] = { total: 0, correct: 0 }
  }

  for (const pred of resolved) {
    let bracket = ''
    if (pred.confidence <= 10) bracket = '0-10'
    else if (pred.confidence <= 30) bracket = '10-30'
    else if (pred.confidence <= 50) bracket = '30-50'
    else if (pred.confidence <= 70) bracket = '50-70'
    else if (pred.confidence <= 90) bracket = '70-90'
    else bracket = '90-100'

    byConfidence[bracket].total++
    if (pred.status === 'resolved_correct') byConfidence[bracket].correct++
  }

  const calibrationData = brackets.map(bracket => ({
    bracket,
    total: byConfidence[bracket].total,
    correct: byConfidence[bracket].correct,
    accuracy: byConfidence[bracket].total > 0
      ? Math.round((byConfidence[bracket].correct / byConfidence[bracket].total) * 100)
      : 0,
  }))

  const avgBrierScore = resolved
    .filter(p => p.brierScore !== null)
    .reduce((sum, p) => sum + Number(p.brierScore!), 0) / resolved.filter(p => p.brierScore !== null).length || 0

  return {
    total: allPredictions.length,
    resolved: resolved.length,
    correct: correct.length,
    incorrect: incorrect.length,
    pending: allPredictions.filter(p => p.status === 'pending').length,
    unresolvable: allPredictions.filter(p => p.status === 'unresolvable').length,
    accuracyRate: resolved.length > 0 ? Math.round((correct.length / resolved.length) * 100) : 0,
    avgBrierScore: Math.round(avgBrierScore * 1000) / 1000,
    calibrationData,
    bySubject: {},
  }
}

export async function getPredictionsNeedingReview() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const now = new Date()
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const predictionsList = await db.query.predictions.findMany({
    where: and(
      eq(predictions.userId, user.id),
      eq(predictions.status, 'pending'),
      sql`${predictions.expectedResolutionDate} <= ${soon}`
    ),
    orderBy: (p, { asc }) => [asc(p.expectedResolutionDate)],
    with: { storyline: true, article: true },
  })

  return predictionsList
}