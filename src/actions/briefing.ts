import { getDb } from '@/db'
import { briefings, briefingStories, articles, users, newsSources } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
// Hardcoded owner — replace Clerk auth
const OWNER_USER_ID = 'owner-12345'

export async function createBriefing(data: {
  title: string
  description: string
  newsSourceId: string
  articleIds: string[]
}) {
  const db = getDb()
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const newsSource = await db.query.newsSources.findFirst({
    where: eq(newsSources.id, data.newsSourceId),
  })
  if (!newsSource) throw new Error('News source not found')

  // Create the briefing
  const [briefing] = await db.insert(briefings).values({
    title: data.title,
    description: data.description,
    newsSourceId: data.newsSourceId,
    userId: user.id,
  }).returning()

  // Insert the associated articles
  for (const articleId of data.articleIds) {
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
    })
    if (article) {
      await db.insert(briefingStories).values({
        briefingId: briefing.id,
        articleId,
        orderIndex: data.articleIds.indexOf(articleId),
        whatHappened: article.content || '',
        whyItMatters: article.summary || '',
        whatHappensNext: article.content || '',
      })
    }
  }

  return { briefing }
}

export async function updateBriefingStories(briefingId: string, articleUpdates: {
  articleId: string
  whatHappened: string
  whyItMatters: string
  whatHappensNext: string
}[]) {
  const db = getDb()
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  // Verify ownership by checking the news source
  const briefing = await db.query.briefings.findFirst({
    where: eq(briefings.id, briefingId),
    with: { newsSource: true },
  })
  if (!briefing) throw new Error('Briefing not found')
  if (briefing.newsSource.userId !== userId) throw new Error('Forbidden')

  for (const update of articleUpdates) {
    const story = await db.query.briefingStories.findFirst({
      where: and(
        eq(briefingStories.briefingId, briefingId),
        eq(briefingStories.articleId, update.articleId),
      ),
    })
    if (story) {
      await db.update(briefingStories).set({
        whatHappened: update.whatHappened,
        whyItMatters: update.whyItMatters,
        whatHappensNext: update.whatHappensNext,
      }).where(eq(briefingStories.id, story.id))
    } else {
      await db.insert(briefingStories).values({
        briefingId,
        articleId: update.articleId,
        whatHappened: update.whatHappened,
        whyItMatters: update.whyItMatters,
        whatHappensNext: update.whatHappensNext,
      })
    }
  }

  return { success: true }
}

export async function deleteBriefingStory(briefingId: string, articleId: string) {
  const db = getDb()
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  const briefing = await db.query.briefings.findFirst({
    where: eq(briefings.id, briefingId),
    with: { newsSource: true },
  })
  if (!briefing) throw new Error('Briefing not found')
  if (briefing.newsSource.userId !== userId) throw new Error('Forbidden')

  await db.delete(briefingStories).where(and(
    eq(briefingStories.briefingId, briefingId),
    eq(briefingStories.articleId, articleId),
  ))

  return { success: true }
}

export async function getBriefing(briefingId: string) {
  const db = getDb()
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  const briefing = await db.query.briefings.findFirst({
    where: eq(briefings.id, briefingId),
    with: {
      newsSource: true,
      stories: {
        with: { article: true },
        orderBy: (s, { asc }) => [asc(s.orderIndex)],
      },
    },
  })
  if (!briefing) throw new Error('Briefing not found')

  return { briefing }
}

export async function getUserBriefings() {
  const db = getDb()
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  const briefingsList = await db.query.briefings.findMany({
    where: eq(briefings.userId, userId),
    with: {
      newsSource: true,
      _count: {
        select: { stories: true },
      },
    },
    orderBy: (b, { desc }) => [desc(b.createdAt)],
  })

  return { briefings: briefingsList }
}

export async function getBriefingStories(briefingId: string) {
  const db = getDb()
  const userId = OWNER_USER_ID
  if (userId !== OWNER_USER_ID) throw new Error('Unauthorized')

  const stories = await db.query.briefingStories.findMany({
    where: eq(briefingStories.briefingId, briefingId),
    with: { article: true },
    orderBy: (s, { asc }) => [asc(s.orderIndex)],
  })

  return { stories }
}