'use server'

import { db } from '@/db'
import { briefings, briefingStories, articles, users, newsSources } from '@/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { analyzeArticle } from '@/lib/ai'
import { fetchAllSources } from '@/lib/news-ingestion'
import { calculateImportanceScore, classifyTopics } from '@/lib/news-ingestion'

export async function generateDailyBriefing(date: Date = new Date()) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const existingBriefing = await db.query.briefings.findFirst({
    where: and(eq(briefings.userId, user.id), eq(briefings.date, startOfDay)),
  })

  if (existingBriefing?.isGenerated) {
    return { briefing: existingBriefing, message: 'Briefing already generated' }
  }

  const newsArticles = await fetchAllSources()

  const processedArticles = []
  for (const article of newsArticles.slice(0, 50)) {
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.url, article.url),
    })

    if (!existingArticle) {
      const topics = classifyTopics(article.title, article.content || '')
      const importanceScore = calculateImportanceScore(article)

      const analysis = await analyzeArticle(article.title, article.content || '', article.source.name)

      const [newArticle] = await db.insert(articles).values({
        sourceId: (await db.query.newsSources.findFirst({
          where: eq(newsSources.domain, article.source.domain),
        }))?.id || '00000000-0000-0000-0000-000000000000',
        externalId: article.id,
        title: article.title,
        slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 200),
        url: article.url,
        content: article.content,
        summary: analysis.whatHappened,
        excerpt: article.content?.slice(0, 300),
        imageUrl: article.imageUrl,
        author: article.author,
        publishedAt: new Date(article.publishedAt),
        topics: topics as any,
        importanceScore: analysis.importanceScore.toString(),
        wordCount: article.content?.split(' ').length,
        readingTimeMinutes: Math.ceil((article.content?.split(' ').length || 0) / 200),
        isProcessed: true,
        processedAt: new Date(),
      }).returning()

      processedArticles.push({ article: newArticle, analysis })
    } else {
      processedArticles.push({ article: existingArticle, analysis: null })
    }
  }

  const topArticles = processedArticles
    .sort((a, b) => (Number(b.analysis?.importanceScore || 0) - Number(a.analysis?.importanceScore || 0)))
    .slice(0, 15)

  let briefingId = existingBriefing?.id
  if (!briefingId) {
    const [newBriefing] = await db.insert(briefings).values({
      userId: user.id,
      date: startOfDay,
      title: `Daily Briefing - ${startOfDay.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}`,
      isGenerated: true,
      generatedAt: new Date(),
      stats: { articleCount: topArticles.length },
    }).returning()
    briefingId = newBriefing.id
  } else {
    await db.update(briefings).set({
      isGenerated: true,
      generatedAt: new Date(),
      stats: { articleCount: topArticles.length },
    }).where(eq(briefings.id, briefingId))
  }

  for (let i = 0; i < topArticles.length; i++) {
    const { article, analysis } = topArticles[i]
    if (!analysis) continue

    await db.insert(briefingStories).values({
      briefingId,
      articleId: article.id,
      rank: i + 1,
      whatHappened: analysis.whatHappened,
      whyItMatters: analysis.whyItMatters,
      whatHappensNext: analysis.whatHappensNext,
      confidence: analysis.confidence,
      aiAnalysis: {
        keyEntities: analysis.keyEntities,
        topics: analysis.topics,
      },
    })
  }

  return { briefingId, articleCount: topArticles.length }
}

export async function getBriefing(date: Date = new Date()) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const briefing = await db.query.briefings.findFirst({
    where: and(eq(briefings.userId, user.id), eq(briefings.date, startOfDay)),
    with: {
      stories: {
        with: { article: true },
        orderBy: (bs, { asc }) => [asc(bs.rank)],
      },
    },
  })

  return briefing
}

export async function getRecentBriefings(limit = 30) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const briefingsList = await db.query.briefings.findMany({
    where: eq(briefings.userId, user.id),
    orderBy: (b, { desc }) => [desc(b.date)],
    limit,
    with: {
      stories: {
        with: { article: true },
        orderBy: (bs, { asc }) => [asc(bs.rank)],
        limit: 3,
      },
    },
  })

  return briefingsList
}