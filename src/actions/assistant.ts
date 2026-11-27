// Hardcoded owner — replace Clerk auth
const OWNER_USER_ID = 'owner-12345'

import { getDb } from '@/db'
import { conversations, aiMessages } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { chatWithAssistant } from '@/lib/ai'
import { semanticSearch } from '@/lib/embeddings'

export interface RAGResult {
  items: string[]
  citations: string[]
}

export async function createConversation(_title?: string) {
  if (OWNER_USER_ID !== 'owner-12345') throw new Error('Unauthorized')

  const db = getDb()!
  const newConversation = await db.insert(conversations).values({
    title: _title || 'New Conversation',
    userId: OWNER_USER_ID,
  })
  return newConversation
}

export async function addMessage(conversationId: string, content: string, role: 'user' | 'assistant') {
  if (OWNER_USER_ID !== 'owner-12345') throw new Error('Unauthorized')

  const db = getDb()!
  await db.insert(aiMessages).values({
    conversationId,
    content,
    role,
  })
}

export async function getConversationMessages(conversationId: string) {
  if (OWNER_USER_ID !== 'owner-12345') throw new Error('Unauthorized')

  const db = getDb()!
  return await db.query.aiMessages.findMany({
    where: eq(aiMessages.conversationId, conversationId),
    orderBy: (messages) => [asc(messages.createdAt)],
  })
}

export async function askQuestion(conversationId: string, question: string) {
  if (OWNER_USER_ID !== 'owner-12345') throw new Error('Unauthorized')

  const messages = await getConversationMessages(conversationId)
  const context = {
    savedArticles: [] as string[],
    briefings: [] as string[],
    storylines: [] as string[],
    predictions: [] as string[],
    flashcards: [] as string[],
    conversations: messages.map((msg) => ({ role: msg.role, content: msg.content }))
  }
  const result = await chatWithAssistant(question, context)
  return result
}

export async function searchKnowledge(_query: string) {
  if (OWNER_USER_ID !== 'owner-12345') throw new Error('Unauthorized')

  const results = await semanticSearch(_query || '', OWNER_USER_ID, 5)
  return results
}