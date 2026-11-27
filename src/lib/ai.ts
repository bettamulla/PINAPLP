import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY must be set to use AI features')
  }
  return new Anthropic({ apiKey })
}

// Schemas for structured outputs
export const ArticleAnalysisSchema = z.object({
  whatHappened: z.string(),
  whyItMatters: z.string(),
  whatHappensNext: z.string(),
  confidence: z.string(),
  keyEntities: z.array(z.string()),
  topics: z.array(z.string()),
  importanceScore: z.number().min(0).max(10),
})

export const PredictionAnalysisSchema = z.object({
  supportingArguments: z.array(z.string()),
  opposingArguments: z.array(z.string()),
  keyAssumptions: z.array(z.string()),
  risks: z.array(z.string()),
  suggestedConfidence: z.number().min(0).max(100),
  resolutionCriteria: z.string(),
})

export const StorylineUpdateSchema = z.object({
  shouldCreateNewStoryline: z.boolean(),
  suggestedTitle: z.string().optional(),
  suggestedDescription: z.string().optional(),
  matchingStorylineId: z.string().optional(),
  confidence: z.number().min(0).max(1),
})

export const FlashcardGenerationSchema = z.object({
  cards: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
  })),
})

export const PerspectiveAnalysisSchema = z.object({
  headlineDifference: z.string(),
  framingDifference: z.string(),
  factsEmphasizedA: z.array(z.string()),
  factsEmphasizedB: z.array(z.string()),
  factsOmittedA: z.array(z.string()),
  factsOmittedB: z.array(z.string()),
  interpretationDifference: z.string(),
  agreementAreas: z.array(z.string()),
  disagreementAreas: z.array(z.string()),
  biasAssessment: z.string(),
})

export type ArticleAnalysis = z.infer<typeof ArticleAnalysisSchema>
export type PredictionAnalysis = z.infer<typeof PredictionAnalysisSchema>
export type StorylineUpdate = z.infer<typeof StorylineUpdateSchema>
export type FlashcardGeneration = z.infer<typeof FlashcardGenerationSchema>
export type PerspectiveAnalysis = z.infer<typeof PerspectiveAnalysisSchema>

async function callClaude<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodSchema<T>,
  options: { model?: string; maxTokens?: number; temperature?: number } = {}
): Promise<T> {
  const { model = 'claude-3-5-sonnet-20241022', maxTokens = 4000, temperature = 0.3 } = options

  const jsonSchema = zodToJsonSchema(schema)

  // Ensure the schema has the required 'type: object' for Anthropic's InputSchema
  const inputSchema = {
    ...jsonSchema,
    type: 'object',
  } as { type: 'object'; properties?: Record<string, unknown>; required?: string[]; [k: string]: unknown }

  const response = await getAnthropicClient().messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    tools: [
      {
        name: 'structured_output',
        description: 'Return structured output matching the schema',
        input_schema: inputSchema,
      },
    ],
    tool_choice: { type: 'tool', name: 'structured_output' },
  })

  const toolUse = response.content.find((c) => c.type === 'tool_use')
  if (!toolUse || toolUse.name !== 'structured_output') {
    throw new Error('Expected tool use response')
  }

  const parsed = schema.safeParse(toolUse.input)
  if (!parsed.success) {
    console.error('Schema validation failed:', parsed.error)
    throw new Error('AI response did not match expected schema')
  }

  return parsed.data
}

export async function analyzeArticle(
  title: string,
  content: string,
  source: string
): Promise<ArticleAnalysis> {
  const systemPrompt = `You are a senior intelligence analyst. Analyze the following news article and provide structured analysis for a personal intelligence platform. Focus on factual accuracy, strategic implications, and forward-looking assessment. Distinguish clearly between verified facts, analysis, and speculation.`

  const userPrompt = `Article Title: ${title}
Source: ${source}
Content: ${content}

Provide analysis in the required format.`

  return callClaude(systemPrompt, userPrompt, ArticleAnalysisSchema, { temperature: 0.2 })
}

export async function analyzePrediction(
  statement: string,
  reasoning: string,
  opposingArgument: string,
  contextArticles: string[]
): Promise<PredictionAnalysis> {
  const systemPrompt = `You are a superforecasting expert. Analyze the prediction and provide structured assessment to help the user calibrate their confidence. Be rigorous, identify hidden assumptions, and suggest concrete resolution criteria.`

  const userPrompt = `Prediction: ${statement}
User's Reasoning: ${reasoning}
User's Opposing Argument: ${opposingArgument}
Context Articles: ${contextArticles.join('\n\n')}

Provide analysis in the required format.`

  return callClaude(systemPrompt, userPrompt, PredictionAnalysisSchema, { temperature: 0.3 })
}

export async function updateStoryline(
  newArticleTitle: string,
  newArticleContent: string,
  existingStorylines: { id: string; title: string; description: string; currentStatus: string }[]
): Promise<StorylineUpdate> {
  const systemPrompt = `You are an intelligence analyst managing storyline clusters. Determine if a new article belongs to an existing storyline or warrants a new one. Be conservative - only match when there's clear topical continuity, not just keyword overlap.`

  const userPrompt = `New Article: ${newArticleTitle}
Content: ${newArticleContent}

Existing Storylines:
${existingStorylines.map(s => `- ${s.id}: ${s.title} - ${s.description} (Status: ${s.currentStatus})`).join('\n')}

Provide analysis in the required format.`

  return callClaude(systemPrompt, userPrompt, StorylineUpdateSchema, { temperature: 0.2 })
}

export async function generateFlashcards(
  articleTitle: string,
  articleContent: string,
  analysis: ArticleAnalysis
): Promise<FlashcardGeneration> {
  const systemPrompt = `You are an expert in spaced repetition learning design. Create high-quality flashcards that test meaningful understanding, not rote memorization. Focus on concepts, relationships, implications, and analytical frameworks. Each card should be answerable in one sentence.`

  const userPrompt = `Article: ${articleTitle}
Content: ${articleContent}
Analysis: ${JSON.stringify(analysis)}

Generate 3-5 flashcards testing important facts, relationships, implications, and terminology.`

  return callClaude(systemPrompt, userPrompt, FlashcardGenerationSchema, { temperature: 0.4 })
}

export async function comparePerspectives(
  articleA: { title: string; content: string; source: string },
  articleB: { title: string; content: string; source: string }
): Promise<PerspectiveAnalysis> {
  const systemPrompt = `You are a media analysis expert. Compare two articles covering the same event. Identify genuine factual disagreements vs editorial emphasis differences. Never label outlets as biased - only describe observable differences in framing, selection, and interpretation.`

  const userPrompt = `Article A (${articleA.source}): ${articleA.title}
${articleA.content}

Article B (${articleB.source}): ${articleB.title}
${articleB.content}

Provide comparative analysis in the required format.`

  return callClaude(systemPrompt, userPrompt, PerspectiveAnalysisSchema, { temperature: 0.3 })
}

export async function chatWithAssistant(
  userMessage: string,
  context: {
    savedArticles: string[]
    briefings: string[]
    storylines: string[]
    predictions: string[]
    flashcards: string[]
    conversations: { role: string; content: string }[]
  },
  ragItems: { title: string; content: string; similarity: number; source: 'semantic' | 'saved' }[] = []
): Promise<{ response: string; citations: string[] }> {
  const systemPrompt = `You are SIGNAL's AI assistant. You have access to the user's personal intelligence ecosystem. Answer questions by synthesizing across their accumulated knowledge and relevant information retrieved through semantic search. Cite sources precisely. Distinguish historical information from current developments. Challenge assumptions when appropriate.`

  const semanticContext = ragItems.length > 0
    ? `\nSemantically Relevant Articles:\n${ragItems.map(item => `Title: ${item.title}\nContent: ${item.content}\nSimilarity: ${item.similarity.toFixed(2)}\n`).join('---\n')}`
    : ''

  const userPrompt = `User Question: ${userMessage}

Context:
Saved Articles: ${context.savedArticles.join('; ')}
Recent Briefings: ${context.briefings.join('; ')}
Active Storylines: ${context.storylines.join('; ')}
Predictions: ${context.predictions.join('; ')}
Flashcards: ${context.flashcards.join('; ')}
Conversation History: ${context.conversations.slice(-5).map(c => `${c.role}: ${c.content}`).join('\n')}
${semanticContext}

Provide a helpful, well-cited response that references both the user's personal context and semantically relevant articles.`

  const response = await getAnthropicClient().messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    temperature: 0.4,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content.find(c => c.type === 'text')?.text || ''
  return { response: text, citations: ragItems.map(item => item.title) }
}
