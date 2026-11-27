'use server'

import { db } from '@/db'
import { conversations, aiMessages, users, savedArticles, articles, storylines, predictions, flashcards, briefings, briefingStories } from '@/db/schema'
import { eq, and, desc, asc, inArray } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { chatWithAssistant } from '@/lib/ai'
import { semanticSearch, RAGContextItem } from '@/lib/embeddings'

export interface RAGResult {
  items: RAGContextItem[]
  citations: string[]
}

export async function createConversation(title?: string, contextType?: string, contextId?: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const [conversation] = await db.insert(conversations).values({
    userId: user.id,
    title: title || 'New Conversation',
    contextType,
    contextId: contextId || null,
  }).returning()

  return conversation
}

export async function getConversations(limit = 20) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const userConversations = await db.query.conversations.findMany({
    where: eq(conversations.userId, user.id),
    orderBy: (c, { desc }) => [desc(c.updatedAt)],
    limit,
    with: {
      messages: {
        orderBy: (m, { asc }) => [asc(m.createdAt)],
        limit: 1,
      },
    },
  })

  return userConversations
}

export async function getConversation(conversationId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const conversation = await db.query.conversations.findFirst({
    where: and(eq(conversations.id, conversationId), eq(conversations.userId, user.id)),
    with: {
      messages: {
        orderBy: (m, { asc }) => [asc(m.createdAt)],
      },
    },
  })

  return conversation
}

export async function sendMessage(conversationId: string, content: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  const conversation = await db.query.conversations.findFirst({
    where: and(eq(conversations.id, conversationId), eq(conversations.userId, user.id)),
  })
  if (!conversation) throw new Error('Conversation not found')

  await db.insert(aiMessages).values({
    conversationId,
    role: 'user',
    content,
  })

  const [context, ragItems] = await Promise.all([
    buildUserContext(user.id),
    getRAGContext(content),
  ])

  const { response, citations } = await chatWithAssistant(content, context, ragItems)

  const [assistantMessage] = await db.insert(aiMessages).values({
    conversationId,
    role: 'assistant',
    content: response,
    citations,
    model: 'claude-3-5-sonnet-20241022',
  }).returning()

  await db.update(conversations).set({
    updatedAt: new Date(),
    title: conversation.title === 'New Conversation' ? content.slice(0, 50) : conversation.title,
  }).where(eq(conversations.id, conversationId))

  return { userMessage: { role: 'user', content }, assistantMessage }
}

async function buildUserContext(userId: string) {
  const [savedArticlesList, recentBriefings, activeStorylines, userPredictions, dueFlashcards] = await Promise.all([
    db.query.savedArticles.findMany({
      where: eq(savedArticles.userId, userId),
      with: { article: true },
      limit: 20,
    }),
    db.query.briefings.findMany({
      where: eq(briefings.userId, userId),
      orderBy: (b, { desc }) => [desc(b.date)],
      limit: 5,
      with: { stories: { with: { article: true }, limit: 3 } },
    }),
    db.query.storylines.findMany({
      where: eq(storylines.status, 'active'),
      orderBy: (s, { desc }) => [desc(s.lastArticleAt)],
      limit: 10,
    }),
    db.query.predictions.findMany({
      where: and(eq(predictions.userId, userId), eq(predictions.status, 'pending')),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      limit: 10,
    }),
    db.query.flashcards.findMany({
      where: and(eq(flashcards.userId, userId), eq(flashcards.isArchived, false)),
      orderBy: (f, { asc }) => [asc(f.dueDate)],
      limit: 20,
    }),
  ])

  return {
    savedArticles: savedArticlesList.map(sa => sa.article?.title || '').filter(Boolean),
    briefings: recentBriefings.map(b => b.title || '').filter(Boolean),
    storylines: activeStorylines.map(s => s.title).filter(Boolean),
    predictions: userPredictions.map(p => p.statement).filter(Boolean),
    flashcards: dueFlashcards.map(f => f.question).filter(Boolean),
    conversations: [],
  }
}

async function getRAGContext(userMessage: string): Promise<RAGContextItem[]> {
  try {
    const semanticMatches = await semanticSearch(userMessage, '')
    return semanticMatches
  } catch (error) {
    console.error('RAG context retrieval failed:', error)
    return []
  }
}

export async function deleteConversation(conversationId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) throw new Error('User not found')

  await db.delete(conversations).where(and(eq(conversations.id, conversationId), eq(conversations.userId, user.id)))

  return { success: true }
}