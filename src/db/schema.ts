import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, jsonb, index, uniqueIndex, pgEnum, vector } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm'

// Enums
export const topicEnum = pgEnum('topic', [
  'global_affairs',
  'economics',
  'business',
  'ecommerce',
  'technology',
  'ai',
  'geopolitics',
  'science',
])

export const sourceTypeEnum = pgEnum('source_type', ['api', 'rss', 'manual'])

export const predictionStatusEnum = pgEnum('prediction_status', [
  'pending',
  'resolved_correct',
  'resolved_incorrect',
  'unresolvable',
])

export const cardDifficultyEnum = pgEnum('card_difficulty', ['again', 'hard', 'good', 'easy'])

export const themeEnum = pgEnum('theme', ['light', 'dark', 'system'])

export const briefingLengthEnum = pgEnum('briefing_length', ['short', 'medium', 'long'])

export const analyticalDepthEnum = pgEnum('analytical_depth', ['summary', 'standard', 'deep'])

// Users
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    imageUrl: varchar('image_url', { length: 500 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    clerkIdIdx: uniqueIndex('users_clerk_id_idx').on(table.clerkId),
  })
)

// User Preferences
export const userPreferences = pgTable(
  'user_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    preferredTopics: topicEnum('preferred_topics').array().default([]),
    geographicFocus: varchar('geographic_focus', { length: 100 }).array().default([]),
    preferredPublications: varchar('preferred_publications', { length: 255 }).array().default([]),
    briefingTime: varchar('briefing_time', { length: 5 }).default('07:00'),
    reviewTime: varchar('review_time', { length: 5 }).default('20:00'),
    briefingLength: briefingLengthEnum('briefing_length').default('medium'),
    analyticalDepth: analyticalDepthEnum('analytical_depth').default('standard'),
    theme: themeEnum('theme').default('system'),
    emailNotifications: boolean('email_notifications').default(true),
    pushNotifications: boolean('push_notifications').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: uniqueIndex('user_preferences_user_id_idx').on(table.userId),
  })
)

// News Sources
export const newsSources = pgTable(
  'news_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    domain: varchar('domain', { length: 255 }).notNull().unique(),
    logoUrl: varchar('logo_url', { length: 500 }),
    sourceType: sourceTypeEnum('source_type').default('api'),
    rssUrl: varchar('rss_url', { length: 500 }),
    apiConfig: jsonb('api_config').default({}),
    isActive: boolean('is_active').default(true),
    credibilityScore: decimal('credibility_score', { precision: 3, scale: 2 }).default('0.5'),
    politicalLean: varchar('political_lean', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    domainIdx: uniqueIndex('news_sources_domain_idx').on(table.domain),
    isActiveIdx: index('news_sources_is_active_idx').on(table.isActive),
  })
)

// Articles
export const articles = pgTable(
  'articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => newsSources.id, { onDelete: 'cascade' }),
    externalId: varchar('external_id', { length: 255 }),
    title: varchar('title', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }).notNull(),
    url: varchar('url', { length: 1000 }).notNull().unique(),
    content: text('content'),
    summary: text('summary'),
    excerpt: text('excerpt'),
    imageUrl: varchar('image_url', { length: 500 }),
    author: varchar('author', { length: 255 }),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
    topics: topicEnum('topics').array().default([]),
    entities: jsonb('entities').default([]),
    keywords: varchar('keywords', { length: 100 }).array().default([]),
    importanceScore: decimal('importance_score', { precision: 4, scale: 2 }).default('0'),
    wordCount: integer('word_count'),
    readingTimeMinutes: integer('reading_time_minutes'),
    language: varchar('language', { length: 10 }).default('en'),
    isProcessed: boolean('is_processed').default(false),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    urlIdx: uniqueIndex('articles_url_idx').on(table.url),
    sourceIdIdx: index('articles_source_id_idx').on(table.sourceId),
    publishedAtIdx: index('articles_published_at_idx').on(table.publishedAt),
    topicsIdx: index('articles_topics_idx').on(table.topics),
    importanceScoreIdx: index('articles_importance_score_idx').on(table.importanceScore),
    isProcessedIdx: index('articles_is_processed_idx').on(table.isProcessed),
  })
)

// Article Embeddings (for RAG)
export const articleEmbeddings = pgTable(
  'article_embeddings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index').notNull(),
    chunkText: text('chunk_text').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    tokenCount: integer('token_count').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    articleIdIdx: index('article_embeddings_article_id_idx').on(table.articleId),
    chunkIndexIdx: index('article_embeddings_chunk_index_idx').on(table.chunkIndex),
  })
)

// Briefings
export const briefings = pgTable(
  'briefings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: timestamp('date', { withTimezone: true }).notNull(),
    title: varchar('title', { length: 255 }),
    summary: text('summary'),
    stats: jsonb('stats').default({}),
    isGenerated: boolean('is_generated').default(false),
    generatedAt: timestamp('generated_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdDateIdx: uniqueIndex('briefings_user_id_date_idx').on(table.userId, table.date),
    userIdIdx: index('briefings_user_id_idx').on(table.userId),
    dateIdx: index('briefings_date_idx').on(table.date),
  })
)

// Briefing Stories (junction)
export const briefingStories = pgTable(
  'briefing_stories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    briefingId: uuid('briefing_id')
      .notNull()
      .references(() => briefings.id, { onDelete: 'cascade' }),
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    rank: integer('rank').notNull(),
    whatHappened: text('what_happened'),
    whyItMatters: text('why_it_matters'),
    whatHappensNext: text('what_happens_next'),
    confidence: varchar('confidence', { length: 50 }),
    aiAnalysis: jsonb('ai_analysis').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    briefingIdIdx: index('briefing_stories_briefing_id_idx').on(table.briefingId),
    articleIdIdx: index('briefing_stories_article_id_idx').on(table.articleId),
    rankIdx: index('briefing_stories_rank_idx').on(table.rank),
  })
)

// Storylines
export const storylines = pgTable(
  'storylines',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    topics: topicEnum('topics').array().default([]),
    status: varchar('status', { length: 50 }).default('active'),
    currentStatus: text('current_status'),
    whatToMonitor: text('what_to_monitor'),
    competingInterpretations: jsonb('competing_interpretations').default([]),
    importanceScore: decimal('importance_score', { precision: 4, scale: 2 }).default('0'),
    articleCount: integer('article_count').default(0),
    firstArticleAt: timestamp('first_article_at', { withTimezone: true }),
    lastArticleAt: timestamp('last_article_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('storylines_slug_idx').on(table.slug),
    statusIdx: index('storylines_status_idx').on(table.status),
    topicsIdx: index('storylines_topics_idx').on(table.topics),
    lastArticleAtIdx: index('storylines_last_article_at_idx').on(table.lastArticleAt),
  })
)

// Storyline Events
export const storylineEvents = pgTable(
  'storyline_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    storylineId: uuid('storyline_id')
      .notNull()
      .references(() => storylines.id, { onDelete: 'cascade' }),
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    significance: varchar('significance', { length: 50 }).default('moderate'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    storylineIdIdx: index('storyline_events_storyline_id_idx').on(table.storylineId),
    articleIdIdx: index('storyline_events_article_id_idx').on(table.articleId),
    occurredAtIdx: index('storyline_events_occurred_at_idx').on(table.occurredAt),
  })
)

// User Storyline Follows
export const userStorylineFollows = pgTable(
  'user_storyline_follows',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storylineId: uuid('storyline_id')
      .notNull()
      .references(() => storylines.id, { onDelete: 'cascade' }),
    isMuted: boolean('is_muted').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdStorylineIdIdx: uniqueIndex('user_storyline_follows_user_storyline_idx').on(
      table.userId,
      table.storylineId
    ),
    userIdIdx: index('user_storyline_follows_user_id_idx').on(table.userId),
  })
)

// Predictions
export const predictions = pgTable(
  'predictions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storylineId: uuid('storyline_id').references(() => storylines.id, { onDelete: 'set null' }),
    articleId: uuid('article_id').references(() => articles.id, { onDelete: 'set null' }),
    statement: text('statement').notNull(),
    reasoning: text('reasoning'),
    opposingArgument: text('opposing_argument'),
    resolutionCriteria: text('resolution_criteria'),
    confidence: integer('confidence').notNull(), // 0-100
    expectedResolutionDate: timestamp('expected_resolution_date', { withTimezone: true }),
    status: predictionStatusEnum('status').default('pending'),
    outcome: text('outcome'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolvedBy: uuid('resolved_by').references(() => users.id),
    brierScore: decimal('brier_score', { precision: 4, scale: 3 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('predictions_user_id_idx').on(table.userId),
    storylineIdIdx: index('predictions_storyline_id_idx').on(table.storylineId),
    statusIdx: index('predictions_status_idx').on(table.status),
    expectedResolutionDateIdx: index('predictions_expected_resolution_date_idx').on(
      table.expectedResolutionDate
    ),
  })
)

// Prediction Revisions (confidence updates)
export const predictionRevisions = pgTable(
  'prediction_revisions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    predictionId: uuid('prediction_id')
      .notNull()
      .references(() => predictions.id, { onDelete: 'cascade' }),
    confidence: integer('confidence').notNull(),
    reasoning: text('reasoning'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    predictionIdIdx: index('prediction_revisions_prediction_id_idx').on(table.predictionId),
  })
)

// Flashcards
export const flashcards = pgTable(
  'flashcards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    articleId: uuid('article_id').references(() => articles.id, { onDelete: 'set null' }),
    storylineId: uuid('storyline_id').references(() => storylines.id, { onDelete: 'set null' }),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    category: varchar('category', { length: 100 }),
    tags: varchar('tags', { length: 100 }).array().default([]),
    difficulty: decimal('difficulty', { precision: 4, scale: 3 }).default('0'),
    stability: decimal('stability', { precision: 6, scale: 3 }).default('0'),
    retrievability: decimal('retrievability', { precision: 4, scale: 3 }).default('0'),
    dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
    lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
    reviewCount: integer('review_count').default(0),
    lapseCount: integer('lapse_count').default(0),
    isArchived: boolean('is_archived').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('flashcards_user_id_idx').on(table.userId),
    dueDateIdx: index('flashcards_due_date_idx').on(table.dueDate),
    articleIdIdx: index('flashcards_article_id_idx').on(table.articleId),
    storylineIdIdx: index('flashcards_storyline_id_idx').on(table.storylineId),
    isArchivedIdx: index('flashcards_is_archived_idx').on(table.isArchived),
  })
)

// Review History
export const reviewHistory = pgTable(
  'review_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    flashcardId: uuid('flashcard_id')
      .notNull()
      .references(() => flashcards.id, { onDelete: 'cascade' }),
    difficulty: cardDifficultyEnum('difficulty').notNull(),
    previousStability: decimal('previous_stability', { precision: 6, scale: 3 }),
    newStability: decimal('new_stability', { precision: 6, scale: 3 }),
    previousDifficulty: decimal('previous_difficulty', { precision: 4, scale: 3 }),
    newDifficulty: decimal('new_difficulty', { precision: 4, scale: 3 }),
    reviewDurationMs: integer('review_duration_ms'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('review_history_user_id_idx').on(table.userId),
    flashcardIdIdx: index('review_history_flashcard_id_idx').on(table.flashcardId),
    reviewedAtIdx: index('review_history_reviewed_at_idx').on(table.reviewedAt),
  })
)

// Conversations (AI Assistant)
export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }),
    contextType: varchar('context_type', { length: 50 }),
    contextId: uuid('context_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('conversations_user_id_idx').on(table.userId),
    contextIdx: index('conversations_context_idx').on(table.contextType, table.contextId),
  })
)

// AI Messages
export const aiMessages = pgTable(
  'ai_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).notNull(),
    content: text('content').notNull(),
    citations: jsonb('citations').default([]),
    tokenCount: integer('token_count'),
    model: varchar('model', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    conversationIdIdx: index('ai_messages_conversation_id_idx').on(table.conversationId),
  })
)

// Saved Articles
export const savedArticles = pgTable(
  'saved_articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdArticleIdIdx: uniqueIndex('saved_articles_user_article_idx').on(
      table.userId,
      table.articleId
    ),
    userIdIdx: index('saved_articles_user_id_idx').on(table.userId),
  })
)

// User Annotations
export const userAnnotations = pgTable(
  'user_annotations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    selectedText: text('selected_text').notNull(),
    note: text('note'),
    color: varchar('color', { length: 20 }).default('yellow'),
    positionStart: integer('position_start'),
    positionEnd: integer('position_end'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('user_annotations_user_id_idx').on(table.userId),
    articleIdIdx: index('user_annotations_article_id_idx').on(table.articleId),
  })
)

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  briefings: many(briefings),
  predictions: many(predictions),
  flashcards: many(flashcards),
  reviewHistory: many(reviewHistory),
  conversations: many(conversations),
  savedArticles: many(savedArticles),
  annotations: many(userAnnotations),
  storylineFollows: many(userStorylineFollows),
}))

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}))

export const newsSourcesRelations = relations(newsSources, ({ many }) => ({
  articles: many(articles),
}))

export const articlesRelations = relations(articles, ({ one, many }) => ({
  source: one(newsSources, {
    fields: [articles.sourceId],
    references: [newsSources.id],
  }),
  briefingStories: many(briefingStories),
  storylineEvents: many(storylineEvents),
  predictions: many(predictions),
  flashcards: many(flashcards),
  savedArticles: many(savedArticles),
  annotations: many(userAnnotations),
  embeddings: many(articleEmbeddings),
}))

export const briefingsRelations = relations(briefings, ({ one, many }) => ({
  user: one(users, {
    fields: [briefings.userId],
    references: [users.id],
  }),
  stories: many(briefingStories),
}))

export const briefingStoriesRelations = relations(briefingStories, ({ one }) => ({
  briefing: one(briefings, {
    fields: [briefingStories.briefingId],
    references: [briefings.id],
  }),
  article: one(articles, {
    fields: [briefingStories.articleId],
    references: [articles.id],
  }),
}))

export const storylinesRelations = relations(storylines, ({ many }) => ({
  events: many(storylineEvents),
  follows: many(userStorylineFollows),
  predictions: many(predictions),
  flashcards: many(flashcards),
}))

export const storylineEventsRelations = relations(storylineEvents, ({ one }) => ({
  storyline: one(storylines, {
    fields: [storylineEvents.storylineId],
    references: [storylines.id],
  }),
  article: one(articles, {
    fields: [storylineEvents.articleId],
    references: [articles.id],
  }),
}))

export const userStorylineFollowsRelations = relations(userStorylineFollows, ({ one }) => ({
  user: one(users, {
    fields: [userStorylineFollows.userId],
    references: [users.id],
  }),
  storyline: one(storylines, {
    fields: [userStorylineFollows.storylineId],
    references: [storylines.id],
  }),
}))

export const predictionsRelations = relations(predictions, ({ one, many }) => ({
  user: one(users, {
    fields: [predictions.userId],
    references: [users.id],
  }),
  storyline: one(storylines, {
    fields: [predictions.storylineId],
    references: [storylines.id],
  }),
  article: one(articles, {
    fields: [predictions.articleId],
    references: [articles.id],
  }),
  revisions: many(predictionRevisions),
}))

export const predictionRevisionsRelations = relations(predictionRevisions, ({ one }) => ({
  prediction: one(predictions, {
    fields: [predictionRevisions.predictionId],
    references: [predictions.id],
  }),
}))

export const flashcardsRelations = relations(flashcards, ({ one, many }) => ({
  user: one(users, {
    fields: [flashcards.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [flashcards.articleId],
    references: [articles.id],
  }),
  storyline: one(storylines, {
    fields: [flashcards.storylineId],
    references: [storylines.id],
  }),
  reviews: many(reviewHistory),
}))

export const reviewHistoryRelations = relations(reviewHistory, ({ one }) => ({
  user: one(users, {
    fields: [reviewHistory.userId],
    references: [users.id],
  }),
  flashcard: one(flashcards, {
    fields: [reviewHistory.flashcardId],
    references: [flashcards.id],
  }),
}))

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(aiMessages),
}))

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [aiMessages.conversationId],
    references: [conversations.id],
  }),
}))

export const savedArticlesRelations = relations(savedArticles, ({ one }) => ({
  user: one(users, {
    fields: [savedArticles.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [savedArticles.articleId],
    references: [articles.id],
  }),
}))

export const userAnnotationsRelations = relations(userAnnotations, ({ one }) => ({
  user: one(users, {
    fields: [userAnnotations.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [userAnnotations.articleId],
    references: [articles.id],
  }),
}))

export const articleEmbeddingsRelations = relations(articleEmbeddings, ({ one }) => ({
  article: one(articles, {
    fields: [articleEmbeddings.articleId],
    references: [articles.id],
  }),
}))

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserPreferences = typeof userPreferences.$inferSelect
export type NewUserPreferences = typeof userPreferences.$inferInsert
export type NewsSource = typeof newsSources.$inferSelect
export type NewNewsSource = typeof newsSources.$inferInsert
export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
export type Briefing = typeof briefings.$inferSelect
export type NewBriefing = typeof briefings.$inferInsert
export type BriefingStory = typeof briefingStories.$inferSelect
export type NewBriefingStory = typeof briefingStories.$inferInsert
export type Storyline = typeof storylines.$inferSelect
export type NewStoryline = typeof storylines.$inferInsert
export type StorylineEvent = typeof storylineEvents.$inferSelect
export type NewStorylineEvent = typeof storylineEvents.$inferInsert
export type UserStorylineFollow = typeof userStorylineFollows.$inferSelect
export type NewUserStorylineFollow = typeof userStorylineFollows.$inferInsert
export type Prediction = typeof predictions.$inferSelect
export type NewPrediction = typeof predictions.$inferInsert
export type PredictionRevision = typeof predictionRevisions.$inferSelect
export type NewPredictionRevision = typeof predictionRevisions.$inferInsert
export type Flashcard = typeof flashcards.$inferSelect
export type NewFlashcard = typeof flashcards.$inferInsert
export type ReviewHistory = typeof reviewHistory.$inferSelect
export type NewReviewHistory = typeof reviewHistory.$inferInsert
export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type AIMessage = typeof aiMessages.$inferSelect
export type NewAIMessage = typeof aiMessages.$inferInsert
export type SavedArticle = typeof savedArticles.$inferSelect
export type NewSavedArticle = typeof savedArticles.$inferInsert
export type UserAnnotation = typeof userAnnotations.$inferSelect
export type NewUserAnnotation = typeof userAnnotations.$inferInsert
export type ArticleEmbedding = typeof articleEmbeddings.$inferSelect
export type NewArticleEmbedding = typeof articleEmbeddings.$inferInsert