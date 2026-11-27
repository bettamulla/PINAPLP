'use client'

import * as React from 'react'
import { formatDate, formatRelative } from '@/lib/utils'
import { Brain, BookOpen, RotateCcw, TrendingUp, Target, Check, Sparkles, Clock, BarChart2, RefreshCw, Zap, Eye, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'


import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';




import { Label } from '@/components/ui/label'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts'

interface Flashcard {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  dueDate: Date
  reviewCount: number
  difficulty: string
  stability: string
  article?: { id: string; title: string }
}

const mockFlashcards: Flashcard[] = [
  {
    id: '1',
    question: 'What were the three key provisions of the EU AI Act that take effect immediately?',
    answer: '1) Ban on AI systems with unacceptable risk (social scoring, real-time biometric ID in public spaces). 2) Transparency obligations for AI systems interacting with humans. 3) Requirements for general-purpose AI model providers.',
    category: 'Technology',
    tags: ['EU', 'regulation', 'AI'],
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    reviewCount: 3,
    difficulty: '0.5',
    stability: '12.5',
    article: { id: '1', title: 'EU AI Act Enters Force' },
  },
  {
    id: '2',
    question: 'What is the Fed\'s current dot plot projection for rate cuts in 2024?',
    answer: 'One 25bp cut in 2024 (median projection). Down from three cuts projected in March.',
    category: 'Economics',
    tags: ['Fed', 'monetary policy', 'rates'],
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    reviewCount: 2,
    difficulty: '0.3',
    stability: '8.2',
    article: { id: '2', title: 'Fed Holds Rates Steady' },
  },
  {
    id: '3',
    question: 'How does the FSRS algorithm calculate the next review interval?',
    answer: 'Next interval = stability * log(retrievability_target) / log(0.9). Stability updates based on rating: Again resets, Hard multiplies by ~0.6, Good by ~1.3, Easy by ~1.5.',
    category: 'Learning',
    tags: ['FSRS', 'spaced repetition', 'algorithm'],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    reviewCount: 5,
    difficulty: '0.2',
    stability: '45.0',
    article: { id: '3', title: 'How Spaced Repetition Works' },
  },
  {
    id: '4',
    question: 'What were China\'s three main property stimulus measures announced in May 2024?',
    answer: '1) Mortgage rate cuts for first/second homes. 2) Easing of purchase restrictions in Tier 1/2 cities. 3) Central bank relending facility for unfinished project completion.',
    category: 'Economics',
    tags: ['China', 'property', 'stimulus'],
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    reviewCount: 1,
    difficulty: '0.7',
    stability: '3.1',
    article: { id: '4', title: 'China Property Rescue Package' },
  },
  {
    id: '5',
    question: 'What is the Brier score formula and what does it measure?',
    answer: 'Brier = (probability - outcome)². Measures calibration: 0 = perfect, 0.25 = random guessing (50/50), >0.25 = worse than random. Lower is better.',
    category: 'Learning',
    tags: ['calibration', 'Brier score', 'predictions'],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    reviewCount: 4,
    difficulty: '0.15',
    stability: '65.0',
    article: { id: '5', title: 'Measuring Prediction Accuracy' },
  },
]

const mockStats = {
  totalCards: 147,
  dueToday: 12,
  dueTomorrow: 8,
  overdue: 3,
  totalReviews: 1234,
  todayReviews: 18,
  retentionRate: 87,
  upcomingReviews: [
    { date: '2024-01-16', count: 8 },
    { date: '2024-01-17', count: 12 },
    { date: '2024-01-18', count: 5 },
    { date: '2024-01-19', count: 15 },
    { date: '2024-01-20', count: 7 },
    { date: '2024-01-21', count: 9 },
    { date: '2024-01-22', count: 11 },
    { date: '2024-01-23', count: 6 },
    { date: '2024-01-24', count: 10 },
    { date: '2024-01-25', count: 13 },
    { date: '2024-01-26', count: 4 },
    { date: '2024-01-27', count: 8 },
    { date: '2024-01-28', count: 9 },
    { date: '2024-01-29', count: 7 },
  ],
  categoryStats: [
    { category: 'Economics', count: 52, due: 5 },
    { category: 'Technology', count: 38, due: 3 },
    { category: 'Geopolitics', count: 25, due: 2 },
    { category: 'Markets', count: 18, due: 1 },
    { category: 'Learning', count: 14, due: 1 },
  ],
}

const mockRecentReviews = [
  { id: '1', flashcard: { question: 'EU AI Act provisions...', category: 'Technology' }, difficulty: 'good', reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: '2', flashcard: { question: 'Fed dot plot...', category: 'Economics' }, difficulty: 'easy', reviewedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  { id: '3', flashcard: { question: 'China stimulus...', category: 'Economics' }, difficulty: 'again', reviewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
  { id: '4', flashcard: { question: 'FSRS algorithm...', category: 'Learning' }, difficulty: 'good', reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: '5', flashcard: { question: 'Brier score...', category: 'Learning' }, difficulty: 'good', reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
]

export function KnowledgePage() {
  const [activeTab, setActiveTab] = React.useState<string>('review')
  const [reviewQueue, setReviewQueue] = React.useState<typeof mockFlashcards>(mockFlashcards.filter(c => new Date(c.dueDate) <= new Date()))
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [showAnswer, setShowAnswer] = React.useState(false)
  const [reviewStartTime, setReviewStartTime] = React.useState(Date.now())
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [filterCategory, setFilterCategory] = React.useState<string>('all')

  const currentCard = reviewQueue[currentIndex]
  const isReviewComplete = reviewQueue.length === 0 || currentIndex >= reviewQueue.length

  const handleRating = (rating: 1 | 2 | 3 | 4) => {
    const duration = Date.now() - reviewStartTime
    console.log('Review:', currentCard?.id, rating, duration)
    // In real app: await reviewFlashcard(currentCard.id, rating, duration)
    setCurrentIndex(i => i + 1)
    setShowAnswer(false)
    setReviewStartTime(Date.now())
  }

  const filteredCards = mockFlashcards.filter(c => {
    if (filterCategory === 'all') return true
    return c.category === filterCategory
  })

  const categories = Array.from(new Set(mockFlashcards.map(c => c.category)))

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold px-4 sm:px-0">Knowledge</h1>
          <p className="text-sm text-muted-foreground px-4 sm:px-0">Spaced repetition for durable learning</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-0">
          <Button variant="outline" className="gap-1 touch-manipulation" onClick={() => setIsGenerating(true)}>
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Generate Cards</span>
          </Button>
          <Button variant="outline" className="gap-1 touch-manipulation">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="review">
            <Brain className="h-4 w-4 mr-2" /> Review ({mockStats.dueToday + mockStats.overdue})
          </TabsTrigger>
          <TabsTrigger value="browse">
            <BookOpen className="h-4 w-4 mr-2" /> Browse ({mockStats.totalCards})
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart2 className="h-4 w-4 mr-2" /> Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          {isReviewComplete ? (
            <ReviewComplete stats={mockStats} onReset={() => { setReviewQueue(mockFlashcards.filter(c => new Date(c.dueDate) <= new Date())); setCurrentIndex(0); setActiveTab('review'); }} />
          ) : (
            <ReviewSession
              card={currentCard}
              index={currentIndex}
              total={reviewQueue.length}
              showAnswer={showAnswer}
              onShowAnswer={() => setShowAnswer(true)}
              onRating={handleRating}
            />
          )}
        </TabsContent>

        <TabsContent value="browse">
          <FlashcardBrowser
            cards={filteredCards}
            categories={categories}
            filterCategory={filterCategory}
            onFilterChange={setFilterCategory}
          />
        </TabsContent>

        <TabsContent value="stats">
          <KnowledgeStats stats={mockStats} recentReviews={mockRecentReviews} />
        </TabsContent>
      </Tabs>

      {isGenerating && (
        <GenerateCardsDialog onClose={() => setIsGenerating(false)} />
      )}
    </div>
  )
}

function ReviewComplete({ stats, onReset }: { stats: typeof mockStats; onReset: () => void }) {
  return (
    <div className="text-center py-8 sm:py-16 px-4 sm:px-0">
      <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 sm:mb-6">
        <Check className="h-10 w-10 sm:h-12 sm:w-12 text-green-500" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Review Complete!</h2>
      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">You&apos;ve reviewed all {stats.todayReviews} cards due today.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 bg-muted rounded-lg">
          <p className="text-xl sm:text-2xl font-bold">{stats.todayReviews}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Reviewed Today</p>
        </div>
        <div className="p-3 sm:p-4 bg-muted rounded-lg">
          <p className="text-xl sm:text-2xl font-bold">{stats.retentionRate}%</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Retention</p>
        </div>
        <div className="p-3 sm:p-4 bg-muted rounded-lg">
          <p className="text-xl sm:text-2xl font-bold">{stats.dueTomorrow}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Due Tomorrow</p>
        </div>
      </div>
      <Button onClick={onReset} className="gap-1.5 sm:gap-2 touch-manipulation" variant="outline">
        <RotateCcw className="h-4 w-4" />
        <span className="hidden sm:inline">Review Again</span>
        <span className="sm:hidden">Again</span>
      </Button>
    </div>
  )
}

function ReviewSession({ card, index, total, showAnswer, onShowAnswer, onRating }: {
  card: Flashcard | undefined;
  index: number;
  total: number;
  showAnswer: boolean;
  onShowAnswer: () => void;
  onRating: (rating: 1 | 2 | 3 | 4) => void;
}) {
  if (!card) return null

  const progress = ((index + 1) / total) * 100

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between px-4 sm:px-0">
        <div className="flex-1">
          <Progress value={progress} className="h-2" />
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground">{index + 1} / {total}</span>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <Badge variant="outline" className="text-xs mb-2">{card.category}</Badge>
            <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed px-4 sm:px-0">{card.question}</p>
            {card.article && (
              <p className="text-xs text-muted-foreground mt-2 sm:mt-4 px-4 sm:px-0">From: {card.article.title}</p>
            )}
          </div>

          {!showAnswer ? (
            <Button onClick={onShowAnswer} className="w-full py-3 sm:py-4 text-base sm:text-lg gap-1.5 sm:gap-2 touch-manipulation" size="lg">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Show Answer</span>
              <span className="sm:hidden">Answer</span>
            </Button>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="p-3 sm:p-6 bg-muted/50 rounded-lg border">
                <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap px-3 sm:px-0">{card.answer}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">How well did you know this?</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 px-4 sm:px-0">
                  <RatingButton
                    label="Again"
                    shortcut="1"
                    color="bg-red-500 hover:bg-red-600"
                    onClick={() => onRating(1)}
                  />
                  <RatingButton
                    label="Hard"
                    shortcut="2"
                    color="bg-orange-500 hover:bg-orange-600"
                    onClick={() => onRating(2)}
                  />
                  <RatingButton
                    label="Good"
                    shortcut="3"
                    color="bg-green-500 hover:bg-green-600"
                    onClick={() => onRating(3)}
                  />
                  <RatingButton
                    label="Easy"
                    shortcut="4"
                    color="bg-blue-500 hover:bg-blue-600"
                    onClick={() => onRating(4)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-muted-foreground pt-3 sm:pt-4 border-t px-4 sm:px-0 gap-2 sm:gap-0">
                <span>Review #{card.reviewCount + 1}</span>
                <span className="hidden sm:inline">Stability: {Number(card.stability).toFixed(1)} days</span>
                <span className="sm:hidden">Stability: {Number(card.stability).toFixed(1)}d</span>
                <span>Diff: {Number(card.difficulty).toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
        <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-muted rounded border text-xs">1</kbd> Again &nbsp;
        <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-muted rounded border text-xs">2</kbd> Hard &nbsp;
        <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-muted rounded border text-xs">3</kbd> Good &nbsp;
        <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-muted rounded border text-xs">4</kbd> Easy
      </div>
    </div>
  )
}

function RatingButton({ label, shortcut, color, onClick }: { label: string; shortcut: string; color: string; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className={`${color} text-white h-10 sm:h-12 font-medium text-xs sm:text-sm`}
    >
      <span className="block">{label}</span>
      <span className="text-xs opacity-75">{shortcut}</span>
    </Button>
  )
}

function FlashcardBrowser({ cards, categories, filterCategory, onFilterChange }: {
  cards: Flashcard[];
  categories: string[];
  filterCategory: string;
  onFilterChange: (v: string) => void;
}) {
  const [sortBy, setSortBy] = React.useState<string>('due')
  const [viewMode, setViewMode] = React.useState<'cards' | 'list'>('cards')

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Select value={filterCategory} onValueChange={onFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due">Due Date</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="reviews">Review Count</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 border rounded-lg p-1 touch-manipulation">
          <Button variant={viewMode === 'cards' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('cards')} className="touch-manipulation">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="touch-manipulation">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {cards.map(card => (
            <FlashcardCard key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {cards.map(card => (
            <FlashcardRow key={card.id} card={card} />
          ))}
        </div>
      )}

      {cards.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-base sm:text-lg">No flashcards found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function FlashcardCard({ card }: { card: typeof mockFlashcards[0] }) {
  const isOverdue = new Date(card.dueDate) < new Date()
  const isDueToday = new Date(card.dueDate) <= new Date() && !isOverdue

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-1.5 mb-2 mb-3">
          <Badge variant="outline" className="text-xs">{card.category}</Badge>
          <div className="flex items-center gap-0.5">
            {isOverdue && <Badge variant="destructive" className="text-xs gap-0.5"><Clock className="h-2 w-2" /> <span className="hidden sm:inline">Overdue</span></Badge>}
            {isDueToday && !isOverdue && <Badge variant="default" className="text-xs gap-0.5"><Target className="h-2 w-2" /> <span className="hidden sm:inline">Due</span></Badge>}
          </div>
        </div>
        <p className="font-medium text-sm mb-2.5 line-clamp-3 px-2 sm:px-0">{card.question}</p>
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
          <span>#{card.reviewCount}</span>
          <span className="truncate max-w-16 sm:max-w-20">{formatRelative(new Date(card.dueDate))}</span>
        </div>
        <div className="flex items-center gap-0.5 mt-1.5 sm:mt-2">
          {card.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="text-[8px] sm:text-[10px] px-0.5 sm:px-1">{tag}</Badge>
          ))}
          {card.tags.length > 2 && <Badge variant="outline" className="text-[8px] sm:text-[10px] px-0.5 sm:px-1">+{card.tags.length - 2}</Badge>}
        </div>
      </CardContent>
    </Card>
  )
}

function FlashcardRow({ card }: { card: typeof mockFlashcards[0] }) {
  const isOverdue = new Date(card.dueDate) < new Date()
  const isDueToday = new Date(card.dueDate) <= new Date() && !isOverdue

  return (
    <Card>
      <CardContent className="p-2.5 sm:p-3">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[10px] sm:text-xs">{card.category}</Badge>
            {isOverdue && <Badge variant="destructive" className="text-[8px] sm:text-xs"><Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5" /></Badge>}
            {isDueToday && !isOverdue && <Badge variant="default" className="text-[8px] sm:text-xs"><Target className="h-2 w-2 sm:h-2.5 sm:w-2.5" /></Badge>}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm px-2 sm:px-0 truncate">{card.question}</p>
            <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              <span className="truncate max-w-12 sm:max-w-16">#{card.reviewCount}</span>
              <span className="hidden sm:inline">Due {formatRelative(new Date(card.dueDate))}</span>
              <span className="sm:hidden">Due</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {card.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-[8px] sm:text-[10px] px-0.5">{tag}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function KnowledgeStats({ stats, recentReviews }: { stats: typeof mockStats; recentReviews: typeof mockRecentReviews }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Cards" value={stats.totalCards} icon={BookOpen} />
        <StatCard title="Due Today" value={stats.dueToday + stats.overdue} subtitle={`${stats.overdue} overdue`} icon={Target} color="text-blue-500" />
        <StatCard title="Retention Rate" value={`${stats.retentionRate}%`} subtitle={`${stats.todayReviews} reviews today`} icon={TrendingUp} color="text-green-500" />
        <StatCard title="Total Reviews" value={stats.totalReviews.toLocaleString()} icon={RotateCcw} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" /> Upcoming Reviews (14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.upcomingReviews}>
                  <defs>
                    <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(v) => formatDate(new Date(v), { month: 'short', day: 'numeric' })} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v: number) => [`${v} cards`, 'Due']} labelFormatter={(v) => formatDate(new Date(v), { weekday: 'long', month: 'long', day: 'numeric' })} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReviews)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" /> Cards by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.categoryStats.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{cat.category}</span>
                  <span className="text-sm text-muted-foreground">{cat.count} cards • {cat.due} due</span>
                </div>
                <Progress value={(cat.due / Math.max(cat.count, 1)) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReviews.map((review, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      review.difficulty === 'good' || review.difficulty === 'easy' ? 'bg-green-500' : review.difficulty === 'hard' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{review.flashcard.question}</p>
                      <p className="text-xs text-muted-foreground">{review.flashcard.category} • {formatRelative(review.reviewedAt)}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {review.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Learning Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InsightCard
              icon={TrendingUp}
              iconColor="text-green-500"
              title="Strong Retention"
              description={`${stats.retentionRate}% retention rate is above the 80% target. Your review timing is well-calibrated.`}
            />
            <InsightCard
              icon={Target}
              iconColor="text-blue-500"
              title="Consistent Daily Habit"
              description={`${stats.todayReviews} reviews today. Consistency beats intensity for long-term retention.`}
            />
            <InsightCard
              icon={BookOpen}
              iconColor="text-purple-500"
              title="Economics Dominates"
              description={`${stats.categoryStats[0].category} has the most cards (${stats.categoryStats[0].count}). Consider diversifying into other topics.`}
            />
            <InsightCard
              icon={Clock}
              iconColor="text-orange-500"
              title="Manage Overdue Cards"
              description={`${stats.overdue} overdue cards. Review them soon to prevent exponential interval growth.`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, color = 'text-foreground' }: { title: string; value: string | number; subtitle?: string; icon: React.ComponentType<{ className?: string }>; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: color }}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 bg-muted rounded-lg" style={{ color: color }}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InsightCard({ icon: Icon, iconColor, title, description }: { icon: React.ComponentType<{ className?: string }>; iconColor: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
      <div className={`p-2 rounded-lg ${iconColor} bg-current/10`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}

function GenerateCardsDialog({ onClose }: { onClose: () => void }) {
  const [sourceType, setSourceType] = React.useState<string>('article')
  const [sourceId, setSourceId] = React.useState('')
  const [count, setCount] = React.useState(5)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Flashcards</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label>Source</Label>
            <Select value={sourceType} onValueChange={setSourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select source type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">From Article</SelectItem>
                <SelectItem value="storyline">From Storyline</SelectItem>
                <SelectItem value="manual">Manual Entry</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(sourceType === 'article' || sourceType === 'storyline') && (
            <div className="space-y-2">
              <Label>{sourceType === 'article' ? 'Article ID' : 'Storyline ID'}</Label>
              <Input placeholder="Enter ID or URL" value={sourceId} onChange={(e) => setSourceId(e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Number of Cards</Label>
            <div className="flex items-center gap-3">
              <Slider value={[count]} onValueChange={([v]) => setCount(v)} min={3} max={15} step={1} className="flex-1" />
              <span className="font-mono text-lg w-8 text-right">{count}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="gap-1" onClick={onClose}>
            <Sparkles className="h-4 w-4" /> Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
