import { getDb } from '@/db'
import { briefings, briefingStories, articles, users } from '@/db/schema'
import { and, asc, desc, eq } from 'drizzle-orm'

// Hardcoded owner — replace with authenticated owner session.
const OWNER_USER_ID = 'owner-12345'

async function getOwnerId(db: ReturnType<typeof getDb>) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, OWNER_USER_ID),
    columns: { id: true },
  })
  if (!user) throw new Error('User not found')
  return user.id
}

export async function createBriefing(data: {
  title: string
  description: string
  newsSourceId: string
  articleIds: string[]
}) {
  const db = getDb()
  const userId = await getOwnerId(db)
  const [briefing] = await db.insert(briefings).values({
    title: data.title,
    summary: data.description,
    date: new Date(),
    userId,
  }).returning()

  for (let rank = 0; rank < data.articleIds.length; rank += 1) {
    const articleId = data.articleIds[rank]
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
    })
    if (article) {
      await db.insert(briefingStories).values({
        briefingId: briefing.id,
        articleId,
        rank,
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
  const userId = await getOwnerId(db)
  const briefing = await db.query.briefings.findFirst({
    where: and(eq(briefings.id, briefingId), eq(briefings.userId, userId)),
    columns: { id: true },
  })
  if (!briefing) throw new Error('Briefing not found')

  const existingStories = await db.query.briefingStories.findMany({
    where: eq(briefingStories.briefingId, briefingId),
    columns: { rank: true },
  })
  let nextRank = existingStories.reduce((max, story) => Math.max(max, story.rank), -1) + 1

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
        rank: nextRank++,
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
  const userId = await getOwnerId(db)
  const briefing = await db.query.briefings.findFirst({
    where: and(eq(briefings.id, briefingId), eq(briefings.userId, userId)),
    columns: { id: true },
  })
  if (!briefing) throw new Error('Briefing not found')

  await db.delete(briefingStories).where(and(
    eq(briefingStories.briefingId, briefingId),
    eq(briefingStories.articleId, articleId),
  ))

  return { success: true }
}

export async function getBriefing(briefingId: string) {
  const db = getDb()
  const userId = await getOwnerId(db)
  const briefing = await db.query.briefings.findFirst({
    where: and(eq(briefings.id, briefingId), eq(briefings.userId, userId)),
    with: {
      stories: {
        with: { article: true },
        orderBy: (stories) => [asc(stories.rank)],
      },
    },
  })
  if (!briefing) throw new Error('Briefing not found')

  return { briefing }
}

export async function getUserBriefings() {
  const db = getDb()
  const userId = await getOwnerId(db)
  const briefingsList = await db.query.briefings.findMany({
    where: eq(briefings.userId, userId),
    with: { stories: true },
    orderBy: [desc(briefings.createdAt)],
  })

  return { briefings: briefingsList }
}

export async function getBriefingStories(briefingId: string) {
  const db = getDb()
  const userId = await getOwnerId(db)
  const briefing = await db.query.briefings.findFirst({
    where: and(eq(briefings.id, briefingId), eq(briefings.userId, userId)),
    columns: { id: true },
  })
  if (!briefing) throw new Error('Briefing not found')

  const stories = await db.query.briefingStories.findMany({
    where: eq(briefingStories.briefingId, briefingId),
    with: { article: true },
    orderBy: (story) => [asc(story.rank)],
  })

  return { stories }
}
