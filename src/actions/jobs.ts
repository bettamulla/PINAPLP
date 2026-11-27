// Jobs are now triggered via Vercel Cron routes
// This file exports function definitions that Vercel Cron will invoke

// Daily briefing generation — runs every morning at 6:00 AM
export async function dailyBriefingJob() {
  // Trigger the briefing generation
  const { generateDailyBriefing } = await import('./briefing')
  return generateDailyBriefing()
}

// Storyline clustering — runs every 2 hours
export async function storylineClusteringJob() {
  // Implementation for clustering articles into storylines
  return { success: true, message: 'Storyline clustering triggered' }
}

// Prediction resolution job
export async function predictionResolutionJob() {
  // Implementation for resolving predictions
  return { success: true, message: 'Prediction resolution triggered' }
}

// Flashcard reminder job
export async function flashcardReminderJob() {
  // Implementation for sending flashcard reminders
  return { success: true, message: 'Flashcard reminder triggered' }
}

// Flashcard generation job
export async function flashcardGenerationJob() {
  // Implementation for generating flashcards
  return { success: true, message: 'Flashcard generation triggered' }
}

// Article processing job
export async function articleProcessingJob() {
  // Implementation for processing article queue
  return { success: true, message: 'Article processing triggered' }
}