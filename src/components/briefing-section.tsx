'use client'

import * as React from 'react'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { BookOpen, Clock, TrendingUp, Target, Brain, MessageSquare, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Story {
  id: string
  title: string
  source: string
  sourceDomain: string
  publishedAt: string
  topics: string[]
  importanceScore: number
  whatHappened: string
  whyItMatters: string
  whatHappensNext: string
  confidence: string
  url: string
  isRead: boolean
}

const mockStories: Story[] = [
  {
    id: '1',
    title: 'Federal Reserve Signals Rate Cut Pause Amid Sticky Inflation',
    source: 'Financial Times',
    sourceDomain: 'ft.com',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    topics: ['economics', 'business'],
    importanceScore: 9.2,
    whatHappened: 'The Federal Reserve held interest rates steady at 5.25-5.5% and signaled a more cautious approach to rate cuts in 2024, citing persistent inflation above the 2% target. The dot plot now shows only one cut expected this year, down from three in March.',
    whyItMatters: 'This shift affects borrowing costs globally, equity valuations, and emerging market capital flows. Higher-for-longer rates pressure leveraged companies and commercial real estate. The dollar strengthens, complicating trade balances.',
    whatHappensNext: 'Watch CPI/PCE releases for disinflation evidence. Monitor labour market data for softening. Next FOMC meeting in July will be pivotal. Market pricing will adjust gradually.',
    confidence: 'High — based on official FOMC statement and projections',
    url: 'https://ft.com/fed-rates',
    isRead: false,
  },
  {
    id: '2',
    title: 'EU AI Act Enters Force — First Comprehensive AI Regulation Globally',
    source: 'The Guardian',
    sourceDomain: 'theguardian.com',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    topics: ['technology', 'ai', 'geopolitics'],
    importanceScore: 8.7,
    whatHappened: 'The European Union\'s AI Act officially entered into force, establishing the world\'s first comprehensive legal framework for artificial intelligence. The regulation categorises AI systems by risk level and imposes strict requirements on high-risk applications.',
    whyItMatters: 'Sets global regulatory precedent. Affects any company deploying AI in EU markets. Compliance costs significant. May slow EU AI adoption but increases trust. Other jurisdictions (US, UK, Canada) developing parallel frameworks.',
    whatHappensNext: 'Phased implementation over 2-3 years. Watch for industry guidance documents. Monitor compliance tooling emergence. Potential legal challenges from US tech giants.',
    confidence: 'High — official EU publication',
    url: 'https://theguardian.com/eu-ai-act',
    isRead: false,
  },
  {
    id: '3',
    title: 'China Announces Stimulus Package Targeting Property Sector',
    source: 'Reuters',
    sourceDomain: 'reuters.com',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    topics: ['economics', 'geopolitics', 'business'],
    importanceScore: 8.5,
    whatHappened: 'China\'s State Council unveiled a coordinated stimulus package including reduced mortgage rates, relaxed purchase restrictions, and direct funding for unfinished housing projects. The measures aim to stabilise the property crisis.',
    whyItMatters: 'Property represents ~25% of China\'s GDP. Crisis has dragged growth below 5%. Global commodity demand, particularly iron ore and copper, is affected. Supply chains for electronics and manufacturing face indirect exposure.',
    whatHappensNext: 'Monitor property sales data monthly. Watch local government financing vehicle (LGFV) debt restructuring. Effectiveness depends on consumer confidence recovery.',
    confidence: 'Medium — official announcement but implementation uncertain',
    url: 'https://reuters.com/china-stimulus',
    isRead: true,
  },
  {
    id: '4',
    title: 'Breakthrough in Quantum Error Correction Achieved by Google',
    source: 'Nature',
    sourceDomain: 'nature.com',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    topics: ['technology', 'science'],
    importanceScore: 7.8,
    whatHappened: 'Google Quantum AI published results demonstrating logical qubit error rates below physical qubit error rates for the first time, using a surface code architecture on their 72-qubit Sycamore processor.',
    whyItMatters: 'Critical milestone toward fault-tolerant quantum computing. Error correction is the primary barrier to practical quantum advantage. Timeline to useful quantum applications potentially accelerated.',
    whatHappensNext: 'Watch for replication by IBM, IonQ, and academic labs. Monitor logical qubit count scaling. Commercial applications still years away but R&D investment likely to increase.',
    confidence: 'High — peer-reviewed Nature publication',
    url: 'https://nature.com/quantum-error-correction',
    isRead: false,
  },
]

export function BriefingSection() {
  const [activeTab, setActiveTab] = React.useState('all')
  const [expandedStory, setExpandedStory] = React.useState<string | null>(null)

  const filteredStories = mockStories.filter((story) => {
    if (activeTab === 'unread') return !story.isRead
    if (activeTab === 'high-importance') return story.importanceScore >= 8.5
    return true
  })

  return (
    <section aria-label="Daily Intelligence Briefing">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold">Daily Intelligence Briefing</h2>
          <p className="text-muted-foreground text-sm">
            {formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            • {mockStories.length} stories • {mockStories.filter(s => !s.isRead).length} unread
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden sm:flex">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="high-importance">High Impact</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {filteredStories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            isExpanded={expandedStory === story.id}
            onToggle={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
          />
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No stories match your current filter.</p>
        </div>
      )}
    </section>
  )
}

function StoryCard({ story, isExpanded, onToggle }: { story: Story; isExpanded: boolean; onToggle: () => void }) {
  const topicColors: Record<string, string> = {
    economics: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    business: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    technology: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    ai: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    geopolitics: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    science: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    ecommerce: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    global_affairs: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="outline" className="text-xs">
                  {story.source}
                </Badge>
                {story.topics.map((topic) => (
                  <Badge key={topic} variant="outline" className={`${topicColors[topic] || 'bg-gray-100 text-gray-800'} text-xs`}>
                    {topic.replace('_', ' ')}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs ml-auto">
                  {story.importanceScore}/10
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{story.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{story.whatHappened}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(story.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {story.isRead ? 'Read' : 'Unread'}
                </span>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={onToggle} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
              <svg className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t bg-muted/30 p-6 space-y-4 animate-slide-in-from-top">
            <Separator />

            <div className="space-y-4">
              <AnalysisSection label="WHAT HAPPENED" icon={BookOpen} content={story.whatHappened} />
              <AnalysisSection label="WHY IT MATTERS" icon={TrendingUp} content={story.whyItMatters} />
              <AnalysisSection label="WHAT HAPPENS NEXT" icon={Target} content={story.whatHappensNext} />

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">CONFIDENCE</span>
                <span className="text-sm text-foreground">{story.confidence}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Target className="h-3 w-3" /> Predict
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Brain className="h-3 w-3" /> Create Card
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <MessageSquare className="h-3 w-3" /> Discuss
                </Button>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href={story.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Read Original
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AnalysisSection({ label, icon: Icon, content }: { label: string; icon: React.ComponentType<{ className?: string }>; content: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm text-foreground ml-6 leading-relaxed">{content}</p>
    </div>
  )
}