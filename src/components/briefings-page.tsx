'use client'

import * as React from 'react'
import { formatDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar, Download, RefreshCw, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface Story {
  id: string
  rank: number
  article: {
    id: string
    title: string
    source: { name: string }
    publishedAt: Date
    topics: string[]
    importanceScore: number
    url: string
  }
  whatHappened: string
  whyItMatters: string
  whatHappensNext: string
  confidence: string
}

interface Briefing {
  id: string
  date: Date
  title: string
  stats: { articleCount: number }
  isGenerated: boolean
  stories: Story[]
}

const mockBriefings: Briefing[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    title: 'Daily Briefing - Monday, January 15, 2024',
    stats: { articleCount: 12 },
    isGenerated: true,
    stories: [
      { id: '1', rank: 1, article: { id: '1', title: 'Fed Signals Rate Cut Pause', source: { name: 'Financial Times' }, publishedAt: new Date(), topics: ['economics'], importanceScore: 9.2, url: '#' }, whatHappened: '...', whyItMatters: '...', whatHappensNext: '...', confidence: 'High' },
      { id: '2', rank: 2, article: { id: '2', title: 'EU AI Act Enters Force', source: { name: 'The Guardian' }, publishedAt: new Date(), topics: ['technology', 'ai'], importanceScore: 8.7, url: '#' }, whatHappened: '...', whyItMatters: '...', whatHappensNext: '...', confidence: 'High' },
    ],
  },
  {
    id: '2',
    date: new Date('2024-01-14'),
    title: 'Daily Briefing - Sunday, January 14, 2024',
    stats: { articleCount: 10 },
    isGenerated: true,
    stories: [],
  },
  {
    id: '3',
    date: new Date('2024-01-13'),
    title: 'Daily Briefing - Saturday, January 13, 2024',
    stats: { articleCount: 8 },
    isGenerated: true,
    stories: [],
  },
  {
    id: '4',
    date: new Date('2024-01-12'),
    title: 'Daily Briefing - Friday, January 12, 2024',
    stats: { articleCount: 15 },
    isGenerated: true,
    stories: [],
  },
  {
    id: '5',
    date: new Date('2024-01-11'),
    title: 'Daily Briefing - Thursday, January 11, 2024',
    stats: { articleCount: 11 },
    isGenerated: true,
    stories: [],
  },
  {
    id: '6',
    date: new Date('2024-01-10'),
    title: 'Daily Briefing - Wednesday, January 10, 2024',
    stats: { articleCount: 9 },
    isGenerated: true,
    stories: [],
  },
]

export function BriefingsPage() {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [viewMode, setViewMode] = React.useState<'list' | 'detail'>('list')
  const [selectedBriefing, setSelectedBriefing] = React.useState<Briefing | null>(null)

  const briefing = mockBriefings[currentIndex]

  if (viewMode === 'detail' && selectedBriefing) {
    return (
      <BriefingDetail
        briefing={selectedBriefing}
        onBack={() => setViewMode('list')}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold px-4 sm:px-0">Briefings Archive</h1>
          <p className="text-muted-foreground px-4 sm:px-0">Your daily intelligence briefings</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-0">
          <Button variant="outline" size="sm" className="gap-1 touch-manipulation">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1 touch-manipulation">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 sm:px-0">
        <Button variant="outline" size="sm" className="gap-1 touch-manipulation" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="text-base sm:text-lg font-semibold">{formatDate(briefing.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">{briefing.stats.articleCount} stories</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1 touch-manipulation" onClick={() => setCurrentIndex(Math.min(mockBriefings.length - 1, currentIndex + 1))} disabled={currentIndex === mockBriefings.length - 1}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {briefing.stories.length > 0 ? (
            <div className="space-y-0">
              {briefing.stories.map((story) => (
                <BriefingStoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-base">No stories in this briefing</p>
              <p className="text-xs sm:text-sm mt-1">Briefing generated but no articles processed</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-4 sm:my-6" />

      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold px-4 sm:px-0">Recent Briefings</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 touch-manipulation">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Jump to date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 sm:w-80">
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Select a briefing date</p>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-muted-foreground py-1 text-xs">{d}</div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <Button
                    key={day}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-xs touch-manipulation"
                    onClick={() => {
                      const idx = mockBriefings.findIndex(b => b.date.getDate() === day)
                      if (idx >= 0) setCurrentIndex(idx)
                    }}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {mockBriefings.map((b, idx) => (
          <BriefingListCard
            key={b.id}
            briefing={b}
            isCurrent={idx === currentIndex}
            onClick={() => {
              setSelectedBriefing(b)
              setViewMode('detail')
            }}
          />
        ))}
      </div>
    </div>
  )
}

function BriefingStoryCard({ story }: { story: Story }) {
  const [expanded, setExpanded] = React.useState(false)
  const topicColors: Record<string, string> = {
    economics: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    technology: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    ai: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    geopolitics: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    business: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    science: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    ecommerce: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    global_affairs: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  }

  return (
    <div className={`border-b last:border-0 p-6 transition-all ${expanded ? 'bg-muted/30' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="outline" className="text-xs">{story.article.source.name}</Badge>
            {story.article.topics.map((topic) => (
              <Badge key={topic} variant="outline" className={`${topicColors[topic] || 'bg-gray-100 text-gray-800'} text-xs`}>
                {topic.replace('_', ' ')}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs ml-auto">{story.article.importanceScore}/10</Badge>
          </div>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{story.article.title}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{story.whatHappened}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Rank #{story.rank}</span>
            <span>{story.confidence}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="h-8 w-8">
          <svg className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t space-y-4 animate-slide-in-from-top">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">WHAT HAPPENED</p>
              <p className="text-sm text-foreground">{story.whatHappened}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">WHY IT MATTERS</p>
              <p className="text-sm text-foreground">{story.whyItMatters}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">WHAT HAPPENS NEXT</p>
              <p className="text-sm text-foreground">{story.whatHappensNext}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BriefingListCard({ briefing, isCurrent, onClick }: { briefing: typeof mockBriefings[0]; isCurrent: boolean; onClick: () => void }) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md touch-manipulation ${isCurrent ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
          <span className="text-xs sm:text-sm font-medium">{formatDate(briefing.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          {isCurrent && <Badge variant="default" className="text-xs">Current</Badge>}
        </div>
        <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2 line-clamp-2">{briefing.title}</h3>
        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
          <span>{briefing.stats.articleCount} stories</span>
          <span className="hidden sm:inline">{briefing.isGenerated ? 'Generated' : 'Pending'}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function BriefingDetail({ briefing, onBack }: { briefing: typeof mockBriefings[0]; onBack: () => void }) {
  const topicColors: Record<string, string> = {
    economics: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    technology: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    ai: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    geopolitics: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    business: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    science: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    ecommerce: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    global_affairs: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 mb-3 sm:mb-4 touch-manipulation">
        <ChevronLeft className="h-4 w-4" />
        Back to Archive
      </Button>

      <div className="flex items-center justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold px-4 sm:px-0">{briefing.title}</h1>
          <p className="text-sm text-muted-foreground px-4 sm:px-0">{formatDate(briefing.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • {briefing.stats.articleCount} stories</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-0">
          <Button variant="outline" size="sm" className="gap-1 touch-manipulation">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1 touch-manipulation">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
          {briefing.stories.map((story) => (
            <Card key={story.id} className="overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2.5 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-2.5 sm:mb-3">
                      <Badge variant="outline" className="text-xs">{story.article.source.name}</Badge>
                      {story.article.topics.map((topic) => (
                        <Badge key={topic} variant="outline" className={`${topicColors[topic] || 'bg-gray-100 text-gray-800'} text-xs`}>
                          {topic.replace('_', ' ')}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="text-xs ml-auto">{story.article.importanceScore}/10</Badge>
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2">{story.article.title}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">WHAT HAPPENED</p>
                    <p className="text-sm text-foreground leading-relaxed line-clamp-3">{story.whatHappened}</p>
                  </div>
                  <div className="space-y-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">WHY IT MATTERS</p>
                    <p className="text-sm text-foreground leading-relaxed line-clamp-3">{story.whyItMatters}</p>
                  </div>
                  <div className="space-y-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">WHAT HAPPENS NEXT</p>
                    <p className="text-sm text-foreground leading-relaxed line-clamp-3">{story.whatHappensNext}</p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 flex items-center justify-between pt-3 sm:pt-4 border-t">
                  <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      {story.confidence}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-0.5">
                      <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Rank #{story.rank}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button variant="outline" size="sm" className="gap-1 touch-manipulation">
                      <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      <span className="hidden sm:inline">Discuss</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 touch-manipulation">
                      <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      <span className="hidden sm:inline">Save</span>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={story.article.url} target="_blank" rel="noopener noreferrer" className="gap-1 touch-manipulation">
                        <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        <span className="hidden sm:inline">Source</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}