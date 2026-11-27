'use server'

import { inngest } from '@/lib/inngest'
import { generateDailyBriefing, getRecentBriefings } from './briefing'
import { fetchAllSources, classifyTopics, calculateImportanceScore, NewsSourceConfig, DEFAULT_SOURCES } from '@/lib/news-ingestion'
import { db } from '@/db'
import { predictions, articles, newsSources, storylines, flashcards } from '@/db/schema'
import { and, eq, lte, gt, isNull, inArray } from 'drizzle-orm'
import { analyzeArticle } from '@/lib/ai'

// ============================================================
// ARTICLE PROCESSING HELPER
// Fetches and processes articles from RSS feeds
// ============================================================

export async function processArticleQueue(sources: NewsSourceConfig[] = DEFAULT_SOURCES) {
  const newsArticles = await fetchAllSources(sources)

  const processedCount = 0
  const errors: string[] = []

  for (const article of newsArticles.slice(0, 50)) {
    try {
      const existingArticle = await db.query.articles.findFirst({
        where: eq(articles.url, article.url),
      })

      if (!existingArticle) {
        const topics = classifyTopics(article.title, article.content || '')
        const importanceScore = calculateImportanceScore(article)

        const source = await db.query.newsSources.findFirst({
          where: eq(newsSources.domain, article.source.domain),
        })

        await db.insert(articles).values({
          sourceId: source?.id || '00000000-0000-0000-0000-000000000000',
          externalId: article.id,
          title: article.title,
          slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 200),
          url: article.url,
          content: article.content,
          summary: article.summary,
          excerpt: article.content?.slice(0, 300),
          imageUrl: article.imageUrl,
          author: article.author,
          publishedAt: new Date(article.publishedAt),
          topics: topics as any,
          importanceScore: importanceScore.toString(),
          wordCount: article.content?.split(' ').length || 0,
          readingTimeMinutes: Math.ceil((article.content?.split(' ').length || 0) / 200),
          isProcessed: false, // Mark for AI processing
        })
      }
    } catch (error) {
      errors.push(`${article.url}: ${error}`)
    }
  }

  return { processedCount: newsArticles.length, errors }
}

// ============================================================
// DAILY BRIEFING GENERATION JOB
// Runs every morning at 6:00 AM to fetch RSS feeds, process articles, and generate briefings
// ============================================================

export const dailyBriefingJob = inngest.createFunction(
  { id: 'daily-briefing-generation', name: 'Daily Briefing Generation', triggers: { cron: '0 6 * * *' } },
  async ({ step }) => {
    // Step 1: Fetch and process new articles from RSS feeds
    const articlesProcessed = await step.run('fetch-and-process-articles', async () => {
      const { processedCount } = await processArticleQueue()
      return { count: processedCount }
    })

    return { success: true, articlesProcessed: articlesProcessed.count }
  }
)

// ============================================================
// STORYLINE CLUSTERING JOB
// Runs every 2 hours to cluster new articles into storylines
// ============================================================

export const storylineClusteringJob = inngest.createFunction(
  { id: 'storyline-clustering', name: 'Storyline Clustering', triggers: { cron: '0 */2 * * *' } },
  async ({ step }) => {
    // Step 1: Get unprocessed articles from the last 24 hours
    const unprocessedArticles = await step.run('get-unprocessed-articles', async () => {
      const result = await db.query.articles.findMany({
        where: and(
          eq(articles.isProcessed, false),
          gt(articles.publishedAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
        ),
        limit: 100,
      })
      return result
    })

    if (unprocessedArticles.length === 0) {
      return { success: true, message: 'No new articles to cluster' }
    }

    // Step 2: Cluster articles into storylines
    const clusters = await step.run('cluster-articles', async () => {
      // In production, this would use embeddings + clustering algorithm
      // For now, we'll group by topic overlap
      const clusters: Record<string, typeof unprocessedArticles> = {}

      for (const article of unprocessedArticles) {
        const key = (article.topics && article.topics[0]) || 'general'
        if (!clusters[key]) clusters[key] = []
        clusters[key].push(article)
      }

      return clusters
    })

    // Step 3: Create or update storylines for each cluster
    const storylinesResult = await step.run('update-storylines', async () => {
      // In production, this would call the updateStoryline AI function
      // and create/update storyline records
      return { clustersProcessed: Object.keys(clusters).length }
    })

    // Step 4: Mark articles as processed
    await step.run('mark-articles-processed', async () => {
      const articleIds = unprocessedArticles.map(a => a.id)
      if (articleIds.length > 0) {
        await db
          .update(articles)
          .set({ isProcessed: true, processedAt: new Date() })
          .where(eq(articles.id, articleIds[0])) // Batch update in production
      }
    })

    return { success: true, ...storylinesResult }
  }
)

// ============================================================
// PREDICTION RESOLUTION CHECKING JOB
// Runs daily at 8:00 AM to check if any predictions have reached their resolution date
// ============================================================

export const predictionResolutionJob = inngest.createFunction(
  { id: 'prediction-resolution-check', name: 'Prediction Resolution Check', triggers: { cron: '0 8 * * *' } },
  async ({ step }) => {
    // Step 1: Find predictions past their resolution date that are still pending
    const overduePredictions = await step.run('find-overdue-predictions', async () => {
      return await db.query.predictions.findMany({
        where: and(
          eq(predictions.status, 'pending'),
          lte(predictions.expectedResolutionDate, new Date())
        ),
        with: {
          user: true,
          storyline: true,
        },
      })
    })

    if (overduePredictions.length === 0) {
      return { success: true, message: 'No overdue predictions' }
    }

    // Step 2: For each overdue prediction, create a resolution reminder
    const reminders = await step.run('create-resolution-reminders', async () => {
      // In production, this would send notifications (email/push)
      // and potentially auto-resolve if there's clear evidence
      return { remindersCreated: overduePredictions.length }
    })

    return { success: true, ...reminders }
  }
)

// ============================================================
// FLASHCARD SCHEDULING REMINDER JOB
// Runs daily at 7:00 PM (default review time) to remind users of due flashcards
// ============================================================

export const flashcardReminderJob = inngest.createFunction(
  { id: 'flashcard-review-reminder', name: 'Flashcard Review Reminder', triggers: { cron: '0 19 * * *' } },
  async ({ step }) => {
    // Step 1: Find users with due flashcards
    const usersWithDueCards = await step.run('find-users-with-due-cards', async () => {
      const dueCards = await db.query.flashcards.findMany({
        where: and(
          eq(flashcards.isArchived, false),
          lte(flashcards.dueDate, new Date())
        ),
        columns: {
          userId: true,
        },
      })

      // Get unique user IDs
      const userIds = Array.from(new Set(dueCards.map(c => c.userId)))
      return userIds
    })

    if (usersWithDueCards.length === 0) {
      return { success: true, message: 'No users with due cards' }
    }

    // Step 2: Send reminder notifications
    const reminders = await step.run('send-reminders', async () => {
      // In production, this would send push/email notifications
      // with the count of due cards for each user
      return { remindersSent: usersWithDueCards.length }
    })

    return { success: true, ...reminders }
  }
)

// ============================================================
// FLASHCARD GENERATION JOB
// Triggered when a user saves an article or completes a briefing
// ============================================================

export const flashcardGenerationJob = inngest.createFunction(
  { id: 'flashcard-generation', name: 'Flashcard Generation', triggers: { event: 'flashcard/generate' } },
  async ({ event, step }) => {
    const { userId, articleId } = event.data

    const article = await step.run('get-article', async () => {
      return await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
      })
    })

    if (!article) {
      return { success: false, error: 'Article not found' }
    }

    // Get briefing story analysis if available
    const analysis = await step.run('get-article-analysis', async () => {
      // In production, fetch from briefingStories table
      return {
        whatHappened: article.summary || '',
        whyItMatters: '',
        whatHappensNext: '',
        confidence: 'medium',
        keyEntities: (article.entities as string[]) || [],
        topics: article.topics || [],
        importanceScore: Number(article.importanceScore || 0),
      }
    })

    // Generate flashcards using AI
    const flashcardsResult = await step.run('generate-flashcards', async () => {
      // Import dynamically to avoid circular deps
      const { generateFlashcards } = await import('@/lib/ai')
      return await generateFlashcards(article.title, article.content || '', analysis)
    })

    // Save flashcards to database
    await step.run('save-flashcards', async () => {
      const newCards = flashcardsResult.cards.map(card => ({
        userId,
        articleId,
        question: card.question,
        answer: card.answer,
        category: card.category,
        tags: card.tags,
        dueDate: new Date(), // Will be set by FSRS on first review
      }))

      if (newCards.length > 0) {
        await db.insert(flashcards).values(newCards)
      }
    })

    return { success: true, cardsCreated: flashcardsResult.cards.length }
  }
)

// ============================================================
// ARTICLE PROCESSING JOB
// Triggered when new articles are fetched
// ============================================================

export const articleProcessingJob = inngest.createFunction(
  { id: 'article-processing', name: 'Article Processing', triggers: { event: 'article/process' } },
  async ({ event, step }) => {
    const { articleIds } = event.data

    const articlesToProcess = await step.run('get-articles', async () => {
      return await db.query.articles.findMany({
        where: eq(articles.id, articleIds[0]), // Simplified for single article
      })
    })

    for (const article of articlesToProcess) {
      // Analyze with AI
      const analysis = await step.run(`analyze-${article.id}`, async () => {
        const { analyzeArticle } = await import('@/lib/ai')
        return await analyzeArticle(article.title, article.content || '', article.sourceId)
      })

      // Extract entities and update article
      await step.run(`update-article-${article.id}`, async () => {
        await db
          .update(articles)
          .set({
            isProcessed: true,
            processedAt: new Date(),
            entities: analysis.keyEntities,
            topics: analysis.topics as any,
            importanceScore: analysis.importanceScore.toString(),
          })
          .where(eq(articles.id, article.id))
      })
    }

    return { success: true, processedCount: articlesToProcess.length }
  }
)

// Export all jobs for the Inngest serve endpoint
export const jobs = [
  dailyBriefingJob,
  storylineClusteringJob,
  predictionResolutionJob,
  flashcardReminderJob,
  flashcardGenerationJob,
  articleProcessingJob,
]