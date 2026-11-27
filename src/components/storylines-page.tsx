'use client'

import * as React from 'react'
import { formatRelativeTime } from '@/lib/utils';
import { Search, Filter, Bell, BellOff, Plus, ChevronRight, Clock, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface TimelineEvent {
  id: string
  title: string
  eventType: string
  significance: string
  occurredAt: Date
  article: { title: string; source: { name: string } }
}

interface Storyline {
  id: string
  title: string
  slug: string
  description: string
  topics: string[]
  status: string
  currentStatus: string
  whatToMonitor: string
  competingInterpretations: string[]
  importanceScore: number
  articleCount: number
  firstArticleAt: Date
  lastArticleAt: Date
  isFollowed: boolean
  isMuted: boolean
  events: TimelineEvent[]
}

const mockStorylines: Storyline[] = [
  {
    id: '1',
    title: 'US–China Trade Relations',
    slug: 'us-china-trade-relations',
    description: 'Ongoing trade tensions, tariff policies, and diplomatic negotiations between the world\'s two largest economies.',
    topics: ['geopolitics', 'economics', 'business'],
    status: 'active',
    currentStatus: 'Tariffs remain elevated. Phase 1 deal commitments unmet. Technology restrictions expanding.',
    whatToMonitor: 'Upcoming Treasury report on currency manipulation. Semiconductor export controls. Agricultural purchase commitments.',
    competingInterpretations: [
      'Strategic decoupling is inevitable and accelerating',
      'Both sides have strong incentives for managed competition',
      'Trade war hurts US consumers more than Chinese producers',
    ],
    importanceScore: 9.5,
    articleCount: 47,
    firstArticleAt: new Date('2023-01-15'),
    lastArticleAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isFollowed: true,
    isMuted: false,
    events: [
      { id: '1', title: 'Biden retains Trump tariffs, adds EV/solar restrictions', eventType: 'policy_change', significance: 'high', occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), article: { title: 'Biden Tariff Decision', source: { name: 'FT' } } },
      { id: '2', title: 'China retaliates with gallium/germanium export controls', eventType: 'retaliation', significance: 'high', occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000), article: { title: 'China Export Controls', source: { name: 'Reuters' } } },
      { id: '3', title: 'Yellen visits Beijing for economic talks', eventType: 'diplomatic', significance: 'medium', occurredAt: new Date(Date.now() - 72 * 60 * 60 * 1000), article: { title: 'Yellen Beijing Visit', source: { name: 'WSJ' } } },
      { id: '4', title: 'G7 agrees on coordinated approach to China overcapacity', eventType: 'multilateral', significance: 'medium', occurredAt: new Date(Date.now() - 120 * 60 * 60 * 1000), article: { title: 'G7 China Statement', source: { name: 'FT' } } },
    ],
  },
  {
    id: '2',
    title: 'EU AI Act Implementation',
    slug: 'eu-ai-act-implementation',
    description: 'Rollout and enforcement of the world\'s first comprehensive AI regulation across EU member states.',
    topics: ['technology', 'ai', 'geopolitics'],
    status: 'developing',
    currentStatus: 'Act entered force August 2024. Prohibited practices ban in 6 months. High-risk obligations in 24-36 months.',
    whatToMonitor: 'Member state enforcement guidance. AI Office staffing. Industry compliance tooling. Standard-setting progress.',
    competingInterpretations: [
      'Will set global standard like GDPR did for privacy',
      'Will stifle EU AI innovation and drive investment elsewhere',
      'Enforcement will be fragmented across member states',
    ],
    importanceScore: 8.8,
    articleCount: 32,
    firstArticleAt: new Date('2023-12-01'),
    lastArticleAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isFollowed: true,
    isMuted: false,
    events: [
      { id: '5', title: 'EU AI Act officially enters into force', eventType: 'milestone', significance: 'high', occurredAt: new Date(Date.now() - 5 * 60 * 60 * 1000), article: { title: 'AI Act Enters Force', source: { name: 'Guardian' } } },
      { id: '6', title: 'First batch of prohibited AI practices published', eventType: 'regulation', significance: 'high', occurredAt: new Date(Date.now() - 48 * 60 * 60 * 1000), article: { title: 'Prohibited Practices', source: { name: 'Reuters' } } },
    ],
  },
  {
    id: '3',
    title: 'Central Bank Policy Coordination',
    slug: 'central-bank-policy-coordination',
    description: 'Monetary policy decisions and coordination among major central banks (Fed, ECB, BoE, BoJ, PBoC).',
    topics: ['economics', 'business'],
    status: 'active',
    currentStatus: 'Fed holding rates. ECB cut in June. BoE expected to cut. BoJ ending negative rates. Divergence emerging.',
    whatToMonitor: 'Fed dot plot updates. ECB inflation projections. BoJ wage negotiations. Currency intervention risks.',
    competingInterpretations: [
      'Coordinated easing cycle beginning globally',
      'Fed will stay higher for longer than peers',
      'Currency wars risk as divergence widens',
    ],
    importanceScore: 9.1,
    articleCount: 56,
    firstArticleAt: new Date('2023-03-01'),
    lastArticleAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isFollowed: true,
    isMuted: false,
    events: [
      { id: '7', title: 'Fed holds rates, signals one cut in 2024', eventType: 'policy_decision', significance: 'high', occurredAt: new Date(Date.now() - 1 * 60 * 60 * 1000), article: { title: 'FOMC Decision', source: { name: 'FT' } } },
      { id: '8', title: 'ECB cuts rates for first time since 2019', eventType: 'policy_decision', significance: 'high', occurredAt: new Date(Date.now() - 72 * 60 * 60 * 1000), article: { title: 'ECB Rate Cut', source: { name: 'Reuters' } } },
      { id: '9', title: 'BoJ ends negative rate policy', eventType: 'policy_shift', significance: 'high', occurredAt: new Date(Date.now() - 168 * 60 * 60 * 1000), article: { title: 'BoJ Policy Shift', source: { name: 'WSJ' } } },
    ],
  },
  {
    id: '4',
    title: 'Climate Tech Investment Surge',
    slug: 'climate-tech-investment-surge',
    description: 'Venture capital and public market flows into climate technology, energy transition, and sustainability.',
    topics: ['business', 'technology', 'science'],
    status: 'monitoring',
    currentStatus: 'Record Q1 2024 funding. IRA implementation driving US projects. EU taxonomy alignment accelerating.',
    whatToMonitor: 'IRA tax credit guidance. Carbon credit market integrity. Grid interconnection queues. Permitting reform.',
    competingInterpretations: [
      'Structural shift in capital allocation to climate solutions',
      'Valuations detached from fundamentals in some sectors',
      'Policy-dependent returns create regulatory risk',
    ],
    importanceScore: 7.2,
    articleCount: 23,
    firstArticleAt: new Date('2023-09-01'),
    lastArticleAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isFollowed: false,
    isMuted: false,
    events: [
      { id: '10', title: 'Q1 2024 climate tech VC reaches $12B', eventType: 'funding', significance: 'medium', occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000), article: { title: 'Climate Tech Funding', source: { name: 'Bloomberg' } } },
    ],
  },
  {
    id: '5',
    title: 'Middle East Energy Politics',
    slug: 'middle-east-energy-politics',
    description: 'OPEC+ production decisions, energy transition in Gulf states, and geopolitical risk to energy markets.',
    topics: ['geopolitics', 'economics', 'business'],
    status: 'active',
    currentStatus: 'OPEC+ extending cuts. UAE/SAudi renewable investment accelerating. Red Sea shipping risks persist.',
    whatToMonitor: 'OPEC+ compliance. Strategic reserve replenishment. Gulf hydrogen projects. Strait of Hormuz tensions.',
    competingInterpretations: [
      'OPEC+ losing control of price discovery',
      'Managed transition protects fossil fuel revenues',
      'Geopolitical risk premium permanently elevated',
    ],
    importanceScore: 8.0,
    articleCount: 28,
    firstArticleAt: new Date('2023-10-01'),
    lastArticleAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isFollowed: false,
    isMuted: true,
    events: [],
  },
]

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

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  developing: 'bg-blue-500',
  monitoring: 'bg-yellow-500',
  dormant: 'bg-gray-500',
}

const statusLabels: Record<string, string> = {
  active: 'Active',
  developing: 'Developing',
  monitoring: 'Monitoring',
  dormant: 'Dormant',
}

export function StorylinesPage() {
  const [activeTab, setActiveTab] = React.useState<string>('followed')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedStoryline, setSelectedStoryline] = React.useState<typeof mockStorylines[0] | null>(null)
  const [viewMode, setViewMode] = React.useState<'list' | 'detail'>('list')
  const [filterStatus, setFilterStatus] = React.useState<string[]>(['active', 'developing', 'monitoring'])

  const filteredStorylines = mockStorylines.filter(s => {
    if (activeTab === 'followed' && !s.isFollowed) return false
    if (activeTab === 'muted' && !s.isMuted) return false
    if (!filterStatus.includes(s.status)) return false
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !s.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (viewMode === 'detail' && selectedStoryline) {
    return (
      <StorylineDetail
        storyline={selectedStoryline}
        onBack={() => { setViewMode('list'); setSelectedStoryline(null) }}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Storylines</h1>
          <p className="text-muted-foreground">Track developing stories over time</p>
        </div>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> New Storyline
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search storylines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(statusLabels).map(([value, label]) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={filterStatus.includes(value)}
                  onCheckedChange={(checked) => setFilterStatus(prev =>
                    checked ? [...prev, value] : prev.filter(v => v !== value)
                  )}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden sm:flex">
            <TabsList>
              <TabsTrigger value="followed">Followed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="muted">Muted</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden sm:block">
        <TabsList>
          <TabsTrigger value="followed">Followed ({mockStorylines.filter(s => s.isFollowed).length})</TabsTrigger>
          <TabsTrigger value="all">All ({mockStorylines.length})</TabsTrigger>
          <TabsTrigger value="muted">Muted ({mockStorylines.filter(s => s.isMuted).length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredStorylines.map((storyline) => (
            <StorylineCard
              key={storyline.id}
              storyline={storyline}
              onClick={() => { setSelectedStoryline(storyline); setViewMode('detail') }}
            />
          ))}
          {filteredStorylines.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>No storylines match your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <StorylineStats />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

function StorylineCard({ storyline, onClick }: { storyline: typeof mockStorylines[0]; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="outline" className="text-xs capitalize">
                {statusLabels[storyline.status]}
              </Badge>
              {storyline.topics.map((topic) => (
                <Badge key={topic} variant="outline" className={`${topicColors[topic] || 'bg-gray-100 text-gray-800'} text-xs`}>
                  {topic.replace('_', ' ')}
                </Badge>
              ))}
              {storyline.isMuted && (
                <Badge variant="secondary" className="text-xs">
                  <BellOff className="h-3 w-3 mr-1" /> Muted
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{storyline.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{storyline.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> {storyline.articleCount} articles
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Updated {formatRelativeTime(storyline.lastArticleAt)}
              </span>
              <span className="flex items-center gap-1 ml-auto">
                <span className={`w-2 h-2 rounded-full ${statusColors[storyline.status]}`} />
                {storyline.importanceScore}/10
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground line-clamp-1">{storyline.currentStatus}</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1" onClick={(e) => e.stopPropagation()}>
              <Bell className="h-3 w-3" /> {storyline.isFollowed ? 'Following' : 'Follow'}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1" onClick={(e) => e.stopPropagation()}>
              <BellOff className="h-3 w-3" /> {storyline.isMuted ? 'Unmute' : 'Mute'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StorylineDetail({ storyline, onBack }: { storyline: typeof mockStorylines[0]; onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 mb-4">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Storylines
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge variant="outline" className="text-xs capitalize">{statusLabels[storyline.status]}</Badge>
            {storyline.topics.map((topic) => (
              <Badge key={topic} variant="outline" className={`${topicColors[topic] || 'bg-gray-100 text-gray-800'} text-xs`}>
                {topic.replace('_', ' ')}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs ml-auto">{storyline.importanceScore}/10</Badge>
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">{storyline.title}</h1>
          <p className="text-muted-foreground mb-4">{storyline.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> {storyline.articleCount} articles
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> Updated {formatRelativeTime(storyline.lastArticleAt)}
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${statusColors[storyline.status]}`} />
              {statusLabels[storyline.status]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Bell className="h-3 w-3" /> {storyline.isFollowed ? 'Following' : 'Follow'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <BellOff className="h-3 w-3" /> {storyline.isMuted ? 'Unmute' : 'Mute'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline ({storyline.events.length})</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="interpretations">Interpretations ({storyline.competingInterpretations.length})</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <div className="space-y-4">
            {storyline.events.map((event, index) => (
              <TimelineEvent key={event.id} event={event} isLast={index === storyline.events.length - 1} />
            ))}
            {storyline.events.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No events recorded yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="space-y-6">
            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Current Status
              </h3>
              <p className="text-muted-foreground leading-relaxed">{storyline.currentStatus}</p>
            </section>
            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                What to Monitor
              </h3>
              <p className="text-muted-foreground leading-relaxed">{storyline.whatToMonitor}</p>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="interpretations">
          <div className="space-y-3">
            {storyline.competingInterpretations.map((interpretation, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <p className="text-sm text-foreground">{interpretation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitor">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Set up alerts for key developments in this storyline. You&apos;ll receive notifications when new articles are added.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input" defaultChecked />
                <span className="text-sm">Breaking developments (high significance)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input" defaultChecked />
                <span className="text-sm">Policy changes and official statements</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input" />
                <span className="text-sm">Market-moving events</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input" />
                <span className="text-sm">Diplomatic/military escalations</span>
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TimelineEvent({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const significanceColors: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  }

  return (
    <div className="relative flex gap-4">
      <div className="relative flex-shrink-0 w-6">
        <div className={`w-3 h-3 rounded-full ${significanceColors[event.significance] || 'bg-gray-500'} border-2 border-background`} />
        {!isLast && (
          <div className="absolute left-1 top-3 bottom-0 w-0.5 bg-border" />
        )}
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{event.title}</h4>
          <Badge variant="outline" className="text-xs capitalize">{event.eventType.replace('_', ' ')}</Badge>
          <Badge variant="outline" className="text-xs">{event.significance}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-1">
          {event.article.source.name} • {formatRelativeTime(event.occurredAt)}
        </p>
      </div>
    </div>
  )
}

function StorylineStats() {
  const stats = {
    totalFollowed: mockStorylines.filter(s => s.isFollowed).length,
    totalArticles: mockStorylines.reduce((sum, s) => sum + s.articleCount, 0),
    activeStorylines: mockStorylines.filter(s => s.status === 'active').length,
    avgImportance: (mockStorylines.reduce((sum, s) => sum + s.importanceScore, 0) / mockStorylines.length).toFixed(1),
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Your Storylines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatItem label="Followed" value={stats.totalFollowed} />
          <StatItem label="Total Articles" value={stats.totalArticles} />
          <StatItem label="Active" value={stats.activeStorylines} />
          <StatItem label="Avg Importance" value={stats.avgImportance} />
        </div>
      </CardContent>
    </Card>
  )
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center p-3 bg-muted/30 rounded-lg">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start gap-2">
          <Plus className="h-3 w-3" /> Create New Storyline
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Import from Articles
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export Storylines
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          View Prediction History
        </Button>
      </CardContent>
    </Card>
  )
}
