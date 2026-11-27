'use server'

import { db } from '@/db'
import { flashcards, reviewHistory, users, articles, storylines, briefingStories } from '@/db/schema'
import { eq, and, desc, asc, lte, count, sql } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { generateFlashcards } from '@/lib/ai'
import { reviewCard, getCardState, createNewCard } from '@/lib/spaced-repetition'

export async function generateFlashcardsFromArticle(articleId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

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
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

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
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

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
    stability: Number(card.stability),
    difficulty: Number(card.difficulty),
    dueDate: card.dueDate,
    lastReviewedAt: card.lastReviewedAt,
    reviewCount: card.reviewCount ?? 0,
    lapseCount: card.lapseCount ?? 0,
  })

  const { card: newCardState, log } = reviewCard(cardState, rating)

  await db.update(flashcards).set({
    dueDate: newCardState.due,
    stability: newCardState.stability.toString(),
    difficulty: newCardState.difficulty.toString(),
    retrievability: getOptimalRetention(newCardState).toString(),
    lastReviewedAt: newCardState.lastReview,
    reviewCount: newCardState.reps,
    lapseCount: newCardState.lapses,
    updatedAt: new Date(),
  }).where(eq(flashcards.id, flashcardId))

  await db.insert(reviewHistory).values({
    userId: user.id,
    flashcardId,
    difficulty: rating === 1 ? 'again' : rating === 2 ? 'hard' : rating === 3 ? 'good' : 'easy',
    previousStability: cardState.stability.toString(),
    newStability: newCardState.stability.toString(),
    previousDifficulty: cardState.difficulty.toString(),
    newDifficulty: newCardState.difficulty.toString(),
    reviewDurationMs,
    reviewedAt: new Date(),
  })

  return { card: newCardState, log, nextDue: newCardState.due }
}

export async function getFlashcardStats() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const allCards = await db.query.flashcards.findMany({
    where: and(eq(flashcards.userId, user.id), eq(flashcards.isArchived, false)),
  })

  const dueToday = allCards.filter(c => c.dueDate <= now).length
  const dueTomorrow = allCards.filter(c => c.dueDate > now && c.dueDate < tomorrow).length
  const overdue = allCards.filter(c => c.dueDate < today).length

  const reviews = await db.query.reviewHistory.findMany({
    where: and(eq(reviewHistory.userId, user.id)),
    orderBy: (r, { desc }) => [desc(r.reviewedAt)],
    limit: 1000,
  })

  const totalReviews = reviews.length
  const todayReviews = reviews.filter(r => r.reviewedAt >= today).length

  const correctReviews = reviews.filter(r => r.difficulty === 'good' || r.difficulty === 'easy').length
  const retentionRate = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0

  const upcomingReviews = []
  for (let i = 1; i <= 14; i++) {
    const dayStart = new Date(today)
    dayStart.setDate(dayStart.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    const count = allCards.filter(c => c.dueDate >= dayStart && c.dueDate < dayEnd).length
    upcomingReviews.push({ date: dayStart.toISOString().split('T')[0], count })
  }

  const categories = Array.from(new Set(allCards.map(c => c.category).filter(Boolean)))
  const categoryStats = categories.map(cat => ({
    category: cat,
    count: allCards.filter(c => c.category === cat).length,
    due: allCards.filter(c => c.category === cat && c.dueDate <= now).length,
  }))

  return {
    totalCards: allCards.length,
    dueToday,
    dueTomorrow,
    overdue,
    totalReviews,
    todayReviews,
    retentionRate,
    upcomingReviews,
    categoryStats,
  }
}

export async function getRecentReviews(limit = 20) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

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

function getOptimalRetention(card: { stability: number; scheduledDays: number }): number {
  const FACTOR = 0.9 ** (1 / -0.5) - 1
  const DECAY = -0.5
  return (1 + FACTOR * card.scheduledDays / card.stability) ** DECAY
}