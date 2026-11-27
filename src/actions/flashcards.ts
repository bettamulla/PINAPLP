import { getDb } from '@/db'
import { flashcards, reviewHistory, users, articles, briefingStories } from '@/db/schema'
import { eq, and, count, gte, lte } from 'drizzle-orm'
import { generateFlashcards } from '@/lib/ai'
import { reviewCard, getCardState, createNewCard, getRetrievability } from '@/lib/spaced-repetition'

const OWNER_USER_ID = 'owner-12345'

export async function generateFlashcardsFromArticle(articleId: string) {
  const db = getDb()!
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const article = await db.query.articles.findFirst({
    where: eq(articles.id, articleId),
    with: { source: true },
  })
  if (!article) throw new Error('Article not found')

  const briefingStory = await db.query.briefingStories.findFirst({
    where: eq(briefingStories.articleId, articleId),
  })

  const aiAnalysis = briefingStory?.aiAnalysis as Record<string, unknown> | undefined
  const analysis = briefingStory ? {
    whatHappened: briefingStory.whatHappened || '',
    whyItMatters: briefingStory.whyItMatters || '',
    whatHappensNext: briefingStory.whatHappensNext || '',
    confidence: briefingStory.confidence || 'Medium',
    keyEntities: (aiAnalysis?.keyEntities as string[]) || [],
    topics: (aiAnalysis?.topics as string[]) || [],
    importanceScore: Number(aiAnalysis?.importanceScore || 5),
  } : await import('@/lib/ai').then(m => m.analyzeArticle(article.title, article.content || '', article.source.name))

  const result = await generateFlashcards(article.title, article.content || '', analysis)

  const createdCards = []
  for (const cardData of result.cards) {
    const initialState = createNewCard()
    const [card] = await db.insert(flashcards).values({
      userId: user.id,
      articleId: article.id,
      question: cardData.question,
      answer: cardData.answer,
      category: cardData.category,
      tags: cardData.tags,
      dueDate: initialState.due,
      difficulty: initialState.difficulty.toString(),
      stability: initialState.stability.toString(),
      retrievability: '0',
    }).returning()
    createdCards.push(card)
  }

  return { cards: createdCards, count: createdCards.length }
}

export async function getDueCards(limit = 50) {
  const db = getDb()!
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const now = new Date()
  const cards = await db.query.flashcards.findMany({
    where: and(
      eq(flashcards.userId, user.id),
      eq(flashcards.isArchived, false),
      lte(flashcards.dueDate, now)
    ),
    orderBy: (f, { asc }) => [asc(f.dueDate)],
    limit,
    with: { article: true, storyline: true },
  })

  return cards
}

export async function reviewFlashcard(
  flashcardId: string,
  rating: 1 | 2 | 3 | 4,
  reviewDurationMs?: number
) {
  const db = getDb()!
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const card = await db.query.flashcards.findFirst({
    where: eq(flashcards.id, flashcardId),
  })
  if (!card) throw new Error('Flashcard not found')
  if (card.userId !== userId) throw new Error('Forbidden')

  const cardState = getCardState({
    dueDate: card.dueDate,
    stability: Number(card.stability),
    difficulty: Number(card.difficulty),
    lastReviewedAt: card.lastReviewedAt,
    reviewCount: card.reviewCount ?? 0,
    lapseCount: card.lapseCount ?? 0,
  })

  const newState = reviewCard(cardState, rating, new Date())
  const newCardState = newState.card
  const difficultyLabels = ['again', 'hard', 'good', 'easy'] as const

  await db.update(flashcards).set({
    stability: newCardState.stability.toString(),
    retrievability: getRetrievability(newCardState).toString(),
    dueDate: newCardState.due,
    lastReviewedAt: newCardState.lastReview,
    reviewCount: newCardState.reps,
    lapseCount: newCardState.lapses,
    difficulty: newCardState.difficulty.toString(),
  }).where(eq(flashcards.id, flashcardId))

  await db.insert(reviewHistory).values({
    flashcardId,
    userId,
    difficulty: difficultyLabels[rating - 1],
    previousStability: cardState.stability.toString(),
    newStability: newCardState.stability.toString(),
    previousDifficulty: cardState.difficulty.toString(),
    newDifficulty: newCardState.difficulty.toString(),
    reviewedAt: new Date(),
    reviewDurationMs,
  })

  return { success: true, ...newState, retrievability: getRetrievability(newCardState) }
}

export async function getReviewStats(userId: string, days = 30) {
  const db = getDb()!
  const now = new Date()
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const [{ total }] = await db.select({ total: count() }).from(flashcards)
    .where(eq(flashcards.userId, userId))

  const reviews = await db.query.reviewHistory.findMany({
    where: and(
      eq(reviewHistory.userId, userId),
      gte(reviewHistory.reviewedAt, since)
    ),
    orderBy: (r, { desc }) => [desc(r.reviewedAt)],
  })

  const completed = reviews.filter((review) => review.difficulty === 'good' || review.difficulty === 'easy').length
  const failed = reviews.filter((review) => review.difficulty === 'again' || review.difficulty === 'hard').length

  let avgDifficulty = 0
  let avgStability = 0
  let avgRetrievability = 0

  if (reviews.length > 0) {
    let cardsFound = 0
    for (const review of reviews) {
      const card = await db.query.flashcards.findFirst({
        where: eq(flashcards.id, review.flashcardId),
      })
      if (!card) continue
      cardsFound += 1
      avgDifficulty += Number(card.difficulty)
      avgStability += Number(card.stability)
      avgRetrievability += Number(card.retrievability)
    }

    if (cardsFound > 0) {
      avgDifficulty /= cardsFound
      avgStability /= cardsFound
      avgRetrievability /= cardsFound
    }
  }

  return {
    total,
    completed,
    failed,
    avgDifficulty: Math.round(avgDifficulty * 100) / 100,
    avgStability: Math.round(avgStability * 100) / 100,
    avgRetrievability: Math.round(avgRetrievability * 100) / 100,
    reviews: reviews.length,
  }
}

export async function getRecentReviews(limit = 20) {
  const db = getDb()!
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const reviews = await db.query.reviewHistory.findMany({
    where: eq(reviewHistory.userId, user.id),
    orderBy: (r, { desc }) => [desc(r.reviewedAt)],
    limit,
    with: { flashcard: true },
  })

  return reviews
}
