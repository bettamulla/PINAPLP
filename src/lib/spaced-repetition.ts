export interface FSRSParameters {
  requestRetention: number
  maximumInterval: number
  w: number[]
}

export const DEFAULT_FSRS_PARAMS: FSRSParameters = {
  requestRetention: 0.9,
  maximumInterval: 36500,
  w: [
    0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192,
    1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621,
  ],
}

export interface CardState {
  due: Date
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  reps: number
  lapses: number
  state: 0 | 1 | 2 | 3
  lastReview: Date | null
}

export interface ReviewLog {
  rating: 1 | 2 | 3 | 4
  scheduledDays: number
  elapsedDays: number
  review: Date
  state: 0 | 1 | 2 | 3
}

const DECAY = -0.5
const FACTOR = 0.9 ** (1 / DECAY) - 1

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function nextInterval(stability: number, requestRetention: number): number {
  return stability / FACTOR * (requestRetention ** (1 / DECAY) - 1)
}

function initDifficulty(rating: number, w: number[]): number {
  return clamp(w[4] - Math.E ** (w[5] * (rating - 1)) + 1, 1, 10)
}

function initStability(rating: number, w: number[]): number {
  const baseStability = [w[0], w[1], w[2], w[3]]
  return baseStability[rating - 1]
}

function nextDifficulty(difficulty: number, rating: number, w: number[]): number {
  const delta = w[6] * (rating - 3)
  return clamp(difficulty + delta, 1, 10)
}

function nextStability(
  difficulty: number,
  stability: number,
  rating: number,
  w: number[]
): number {
  if (rating === 1) {
    return w[11] * Math.E ** (-w[12] * difficulty) * stability ** (-w[13]) * (stability + 1) ** w[14]
  }

  const difficultyFactor = 11 - difficulty
  const stabilityFactor = stability ** (-w[9])

  if (rating === 2) {
    return stability * (1 + Math.E ** w[8]) * difficultyFactor * stabilityFactor
  }

  if (rating === 3) {
    return stability * (1 + Math.E ** w[8]) * difficultyFactor * stabilityFactor * w[10]
  }

  if (rating === 4) {
    return stability * (1 + Math.E ** w[8]) * difficultyFactor * stabilityFactor * w[10] * w[15]
  }

  return stability
}

function nextState(state: 0 | 1 | 2 | 3, rating: number): 0 | 1 | 2 | 3 {
  if (state === 0) return rating === 1 ? 1 : 2
  if (state === 1) return rating === 1 ? 1 : 2
  if (state === 2) return rating === 1 ? 3 : 2
  return rating === 1 ? 3 : 3
}

export function calculateRetention(elapsedDays: number, stability: number): number {
  return (1 + FACTOR * elapsedDays / stability) ** DECAY
}

export function reviewCard(
  card: CardState,
  rating: 1 | 2 | 3 | 4,
  now: Date = new Date(),
  params: FSRSParameters = DEFAULT_FSRS_PARAMS
): { card: CardState; log: ReviewLog } {
  const { w, requestRetention, maximumInterval } = params

  let newStability: number
  let newDifficulty: number
  let newState: 0 | 1 | 2 | 3
  let scheduledDays: number

  if (card.state === 0) {
    newDifficulty = initDifficulty(rating, w)
    newStability = initStability(rating, w)
    newState = nextState(0, rating)
    scheduledDays = newStability / FACTOR * (requestRetention ** (1 / DECAY) - 1)
  } else {
    newDifficulty = nextDifficulty(card.difficulty, rating, w)
    newStability = nextStability(card.difficulty, card.stability, rating, w)
    newState = nextState(card.state, rating)
    scheduledDays = nextInterval(newStability, requestRetention)
  }

  scheduledDays = clamp(scheduledDays, 1 / 1440, maximumInterval)

  const newCard: CardState = {
    due: new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000),
    stability: newStability,
    difficulty: newDifficulty,
    elapsedDays: card.lastReview
      ? Math.floor((now.getTime() - card.lastReview.getTime()) / (24 * 60 * 60 * 1000))
      : 0,
    scheduledDays,
    reps: card.reps + 1,
    lapses: card.lapses + (rating === 1 ? 1 : 0),
    state: newState,
    lastReview: now,
  }

  const log: ReviewLog = {
    rating,
    scheduledDays,
    elapsedDays: newCard.elapsedDays,
    review: now,
    state: newState,
  }

  return { card: newCard, log }
}

export function createNewCard(now: Date = new Date()): CardState {
  return {
    due: now,
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    state: 0,
    lastReview: null,
  }
}

export function getCardState(card: {
  stability: number
  difficulty: number
  dueDate: Date
  lastReviewedAt: Date | null
  reviewCount: number
  lapseCount: number
}): CardState {
  const stateMap: Record<number, 0 | 1 | 2 | 3> = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
  }

  return {
    due: card.dueDate,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.lastReviewedAt
      ? Math.floor((new Date().getTime() - card.lastReviewedAt.getTime()) / (24 * 60 * 60 * 1000))
      : 0,
    scheduledDays: 0,
    reps: card.reviewCount,
    lapses: card.lapseCount,
    state: stateMap[card.reviewCount > 0 ? (card.lapseCount > 0 ? 3 : 2) : 0] || 0,
    lastReview: card.lastReviewedAt,
  }
}

export function getRetrievability(card: CardState): number {
  if (!card.lastReview) return 0
  const elapsedDays = Math.floor(
    (new Date().getTime() - card.lastReview.getTime()) / (24 * 60 * 60 * 1000)
  )
  return calculateRetention(elapsedDays, card.stability)
}

export function getOptimalRetention(card: CardState): number {
  return calculateRetention(card.scheduledDays, card.stability)
}