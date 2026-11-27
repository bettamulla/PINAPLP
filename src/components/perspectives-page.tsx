'use client'

import * as React from 'react'
import { formatDate } from '@/lib/utils'
import { Search, Columns, Brain, FileText, RefreshCw, Plus, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

interface PerspectiveArticle {
  id: string
  title: string
  source: { name: string; domain: string; lean?: string }
  publishedAt: Date
  url: string
  headline: string
  framing: string
  keyPoints: string[]
  omittedPoints: string[]
  interpretation: string
  biasAssessment: string
}

interface PerspectiveAnalysis {
  headlineDifference: string
  framingDifference: string
  factsEmphasizedA: string[]
  factsEmphasizedB: string[]
  factsOmittedA: string[]
  factsOmittedB: string[]
  interpretationDifference: string
  agreementAreas: string[]
  disagreementAreas: string[]
  biasAssessment: string
}

interface Perspective {
  id: string
  title: string
  eventDate: Date
  status: 'analyzed' | 'pending'
  articles: PerspectiveArticle[]
  analysis: PerspectiveAnalysis | null
}

const mockPerspectives: Perspective[] = [
  {
    id: '1',
    title: 'Federal Reserve Rate Decision',
    eventDate: new Date('2024-01-31'),
    status: 'analyzed',
    articles: [
      {
        id: '1a',
        title: 'Fed Holds Rates Steady, Signals Patience on Cuts',
        source: { name: 'Financial Times', domain: 'ft.com', lean: 'centre' },
        publishedAt: new Date('2024-01-31T14:30:00Z'),
        url: '#',
        headline: 'Fed Holds Rates Steady, Signals Patience on Cuts',
        framing: 'Emphasises data-dependent approach and inflation persistence',
        keyPoints: ['Rates held at 5.25-5.5%', 'Dot plot shows one cut in 2024', 'Powell: "not confident" on inflation progress', 'Labour market remains strong'],
        omittedPoints: ['Limited discussion of financial stability risks', 'No mention of commercial real estate exposure'],
        interpretation: 'Cautious optimism with hawkish undertone',
        biasAssessment: 'Pro-establishment, institutional perspective',
      },
      {
        id: '1b',
        title: 'Powell Punts on Rate Cuts as Inflation Stalls',
        source: { name: 'Wall Street Journal', domain: 'wsj.com', lean: 'centre-right' },
        publishedAt: new Date('2024-01-31T15:00:00Z'),
        url: '#',
        headline: 'Powell Punts on Rate Cuts as Inflation Stalls',
        framing: 'Focuses on policy error risk and market disappointment',
        keyPoints: ['Markets priced in 3-4 cuts, now only 1', 'Inflation "stuck" above 3%', 'Critique of forecast accuracy', 'Dollar strengthens on hawkish surprise'],
        omittedPoints: ['Less emphasis on labour market strength', 'Minimal coverage of global spillovers'],
        interpretation: 'Markets wrong-footed; credibility at stake',
        biasAssessment: 'Market-oriented, sceptical of Fed guidance',
      },
    ],
    analysis: {
      headlineDifference: 'FT: "Signals Patience" (neutral/positive) vs WSJ: "Punts" (negative/critical)',
      framingDifference: 'FT frames as prudent data-dependence; WSJ frames as delay and forecast failure',
      factsEmphasizedA: ['Data-dependent stance', 'Inflation progress acknowledged', 'Strong labour market'],
      factsEmphasizedB: ['Market expectation mismatch', 'Inflation stalling', 'Forecast credibility'],
      factsOmittedA: ['Financial stability risks', 'Commercial real estate', 'Global spillovers'],
      factsOmittedB: ['Labour market resilience', 'Global coordination', 'Supply-side improvements'],
      interpretationDifference: 'FT sees prudent caution; WSJ sees policy drift and credibility erosion',
      agreementAreas: ['Rates unchanged', 'Inflation above target', 'Cut timeline pushed out'],
      disagreementAreas: ['Appropriateness of patience', 'Forecast reliability', 'Market communication'],
      biasAssessment: 'FT reflects institutional/establishment view; WSJ reflects market/financial sector view',
    },
  },
  {
    id: '2',
    title: 'EU AI Act Enters Force',
    eventDate: new Date('2024-08-01'),
    status: 'analyzed',
    articles: [
      {
        id: '2a',
        title: 'World\'s First AI Law Takes Effect in EU',
        source: { name: 'The Guardian', domain: 'theguardian.com', lean: 'centre-left' },
        publishedAt: new Date('2024-08-01T10:00:00Z'),
        url: '#',
        headline: 'World\'s First AI Law Takes Effect in EU',
        framing: 'Celebrates regulatory leadership and citizen protection',
        keyPoints: ['Risk-based approach', 'Bans on social scoring, biometric surveillance', 'High-risk system requirements', 'Fines up to 7% revenue'],
        omittedPoints: ['Compliance cost estimates', 'Innovation impact assessments', 'SME burden'],
        interpretation: 'Landmark protection for fundamental rights',
        biasAssessment: 'Pro-regulation, civil liberties focus',
      },
      {
        id: '2b',
        title: 'EU AI Act Risks Strangling European Innovation',
        source: { name: 'Financial Times', domain: 'ft.com', lean: 'centre' },
        publishedAt: new Date('2024-08-01T11:30:00Z'),
        url: '#',
        headline: 'EU AI Act Risks Strangling European Innovation',
        framing: 'Highlights competitive disadvantage and regulatory burden',
        keyPoints: ['Compliance costs for startups', 'Talent drain to US', 'Vague definitions create uncertainty', 'Regulatory fragmentation risk'],
        omittedPoints: ['Rights protection benefits', 'Global standard-setting', 'Consumer trust gains'],
        interpretation: 'Well-intentioned but potentially self-defeating',
        biasAssessment: 'Business/competitiveness focus',
      },
    ],
    analysis: {
      headlineDifference: 'Guardian: "World\'s First AI Law" (achievement) vs FT: "Risks Strangling Innovation" (warning)',
      framingDifference: 'Guardian frames as rights victory; FT frames as competitiveness threat',
      factsEmphasizedA: ['Fundamental rights protection', 'Global precedent', 'Ban on harmful practices'],
      factsEmphasizedB: ['Compliance costs', 'Innovation chill', 'Regulatory uncertainty'],
      factsOmittedA: ['Cost to SMEs', 'Competitive disadvantage', 'Implementation complexity'],
      factsOmittedB: ['Rights protections', 'Consumer trust', 'Global standard-setting'],
      interpretationDifference: 'Guardian sees necessary guardrails; FT sees potential overreach',
      agreementAreas: ['Act entered force', 'Risk-based framework', 'Phased implementation'],
      disagreementAreas: ['Net benefit assessment', 'Innovation impact', 'Global competitiveness'],
      biasAssessment: 'Guardian prioritises civil liberties; FT prioritises economic competitiveness',
    },
  },
  {
    id: '3',
    title: 'China Property Stimulus Package',
    eventDate: new Date('2024-05-15'),
    status: 'pending',
    articles: [
      {
        id: '3a',
        title: 'China Unveils Sweeping Property Rescue',
        source: { name: 'Reuters', domain: 'reuters.com', lean: 'centre' },
        publishedAt: new Date('2024-05-15T08:00:00Z'),
        url: '#',
        headline: 'China Unveils Sweeping Property Rescue',
        framing: 'Factual reporting of policy measures',
        keyPoints: ['Mortgage rate cuts', 'Purchase restriction easing', 'Funding for unfinished projects', 'Local government support'],
        omittedPoints: ['Fiscal cost', 'Moral hazard', 'Previous failed attempts'],
        interpretation: 'Significant but implementation uncertain',
        biasAssessment: 'Neutral wire service reporting',
      },
    ],
    analysis: null,
  },
]

export function PerspectivesPage() {
  const [selectedPerspective, setSelectedPerspective] = React.useState<Perspective | null>(mockPerspectives[0])
  const [viewMode, setViewMode] = React.useState<string>('compare')

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold px-4 sm:px-0">Perspectives</h1>
          <p className="text-sm text-muted-foreground px-4 sm:px-0">Compare how different outlets frame the same story</p>
        </div>
        <Button variant="outline" className="gap-1 touch-manipulation">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 px-4 sm:px-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search perspectives..." className="pl-10" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1 w-full sm:w-auto touch-manipulation">
              <Columns className="h-4 w-4" />
              <span className="hidden sm:inline">View: Side-by-Side</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Side-by-Side Comparison</DropdownMenuItem>
            <DropdownMenuItem>Analysis View</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Timeline View</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <h3 className="font-semibold mb-3 px-2 sm:px-0 text-base sm:text-lg">Available Comparisons</h3>
              <div className="space-y-1.5 sm:space-y-2">
                {mockPerspectives.map((p) => (
                  <PerspectiveListItem
                    key={p.id}
                    perspective={p}
                    isSelected={selectedPerspective?.id === p.id}
                    onClick={() => { setSelectedPerspective(p); setViewMode('compare') }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-sm sm:text-base">How to Read This</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 sm:space-y-3 p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
              <div className="p-2.5 sm:p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1.5 sm:mb-2">What We Compare</p>
                <ul className="space-y-0.5 list-disc list-inside text-xs sm:text-sm">
                  <li>Headline framing</li>
                  <li>Fact selection & omission</li>
                  <li>Interpretive framing</li>
                  <li>Source context</li>
                </ul>
              </div>
              <div className="p-2.5 sm:p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1.5 sm:mb-2">Our Approach</p>
                <ul className="space-y-0.5 list-disc list-inside text-xs sm:text-sm">
                  <li>No outlet bias labels</li>
                  <li>Observable differences only</li>
                  <li>Factual vs editorial distinction</li>
                  <li>User draws conclusions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selectedPerspective && (
            <>
              <Tabs value={viewMode} onValueChange={setViewMode} className="mb-3 sm:mb-4">
                <TabsList>
                  <TabsTrigger value="compare">Side-by-Side</TabsTrigger>
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                </TabsList>
              </Tabs>

              {viewMode === 'compare' && (
                <ComparisonView perspective={selectedPerspective} />
              )}

              {viewMode === 'analysis' && selectedPerspective.analysis && (
                <AnalysisView analysis={selectedPerspective.analysis} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PerspectiveListItem({ perspective, isSelected, onClick }: { perspective: Perspective; isSelected: boolean; onClick: () => void }) {
  const statusColors: Record<string, string> = {
    analyzed: 'bg-green-500',
    pending: 'bg-yellow-500',
  }
  const statusLabels: Record<string, string> = {
    analyzed: 'Analyzed',
    pending: 'Pending',
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2.5 sm:p-3 rounded-lg transition-all touch-manipulation ${
        isSelected ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'
      }`}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm sm:text-base truncate">{perspective.title}</h4>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{formatDate(perspective.eventDate, { month: 'short', day: 'numeric' })}</p>
        </div>
        <Badge variant="outline" className={`text-[10px] sm:text-xs ${statusColors[perspective.status]}`}>
          {statusLabels[perspective.status]}
        </Badge>
      </div>
      <div className="flex items-center gap-0.5 mt-1.5 sm:mt-2">
        {perspective.articles.slice(0, 2).map((a) => (
          <Badge key={a.id} variant="outline" className="text-[8px] sm:text-xs">{a.source.name}</Badge>
        ))}
        {perspective.articles.length > 2 && (
          <Badge variant="outline" className="text-[8px] sm:text-xs">+{perspective.articles.length - 2}</Badge>
        )}
      </div>
    </button>
  )
}

function ComparisonView({ perspective }: { perspective: Perspective }) {
  const [expandedArticle, setExpandedArticle] = React.useState<string | null>(null)

  if (perspective.articles.length < 2) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-8 text-center text-muted-foreground">
          <p className="text-base sm:text-lg mb-2">Only one article available for this event</p>
          <p className="text-sm">Add another article covering the same event to enable comparison</p>
          <Button className="mt-3 sm:mt-4 gap-1 touch-manipulation" variant="outline">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Article</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const [articleA, articleB] = perspective.articles

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-2 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold px-2 sm:px-0">{perspective.title}</h2>
              <p className="text-sm text-muted-foreground px-2 sm:px-0">{formatDate(perspective.eventDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <Badge variant="outline" className="text-xs">{perspective.articles.length} Perspectives</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 p-3 sm:p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <ArticleColumn article={articleA} isExpanded={expandedArticle === articleA.id} onToggle={() => setExpandedArticle(expandedArticle === articleA.id ? null : articleA.id)} />
            <ArticleColumn article={articleB} isExpanded={expandedArticle === articleB.id} onToggle={() => setExpandedArticle(expandedArticle === articleB.id ? null : articleB.id)} />
          </div>

          {perspective.analysis && (
            <Separator className="my-4 sm:my-6" />
          )}

          {perspective.analysis && (
            <QuickComparison analysis={perspective.analysis} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ArticleColumn({ article, isExpanded, onToggle }: { article: PerspectiveArticle; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-3 sm:p-4 bg-muted/30 border-b">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <Badge variant="outline" className="text-[10px] sm:text-xs">{article.source.name}</Badge>
          <Badge variant="outline" className="text-[8px] sm:text-xs capitalize">{article.source.lean}</Badge>
        </div>
        <h3 className="font-semibold text-base sm:text-lg mb-1.5 px-2 sm:px-0">{article.headline}</h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{formatDate(article.publishedAt)}</p>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">FRAMING</p>
          <p className="text-sm text-foreground px-2 sm:px-0">{article.framing}</p>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">KEY POINTS</p>
          <ul className="space-y-0.5">
            {article.keyPoints.map((point, i) => (
              <li key={i} className="text-xs sm:text-sm text-foreground flex items-start gap-1.5 sm:gap-2">
                <Check className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 text-green-500 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {isExpanded && (
          <>
            <Separator />
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">OMITTED</p>
              <ul className="space-y-0.5">
                {article.omittedPoints.map((point, i) => (
                  <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-1.5 sm:gap-2">
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 text-red-500 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">INTERPRETATION</p>
              <p className="text-sm text-foreground italic px-2 sm:px-0">{article.interpretation}</p>
            </div>
          </>
        )}

        <Button variant="ghost" size="sm" className="w-full justify-start gap-1 touch-manipulation" onClick={onToggle}>
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              <span className="hidden sm:inline">Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              <span className="hidden sm:inline">Show More</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function QuickComparison({ analysis }: { analysis: PerspectiveAnalysis }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2 px-4 sm:px-0">
        <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="hidden sm:inline">Key Differences at a Glance</span>
        <span className="sm:hidden">Key Differences</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        <ComparisonCard
          title="Headline Framing"
          icon={FileText}
          content={analysis.headlineDifference}
        />
        <ComparisonCard
          title="Editorial Framing"
          icon={Columns}
          content={analysis.framingDifference}
        />
        <ComparisonCard
          title="Facts Emphasized (A)"
          icon={FileText}
          items={analysis.factsEmphasizedA}
        />
        <ComparisonCard
          title="Facts Emphasized (B)"
          icon={FileText}
          items={analysis.factsEmphasizedB}
        />
        <ComparisonCard
          title="Facts Omitted (A)"
          icon={FileText}
          items={analysis.factsOmittedA}
          variant="omitted"
        />
        <ComparisonCard
          title="Facts Omitted (B)"
          icon={FileText}
          items={analysis.factsOmittedB}
          variant="omitted"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <ComparisonCard
          title="Areas of Agreement"
          icon={FileText}
          items={analysis.agreementAreas}
          variant="agreement"
        />
        <ComparisonCard
          title="Areas of Disagreement"
          icon={FileText}
          items={analysis.disagreementAreas}
          variant="disagreement"
        />
      </div>

      <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1.5 sm:mb-2">Bias Assessment</p>
        <p className="text-sm text-foreground px-2 sm:px-0">{analysis.biasAssessment}</p>
      </div>
    </div>
  )
}

function ComparisonCard({ title, icon: Icon, content, items, variant }: { title: string; icon: React.ComponentType<{ className?: string }>; content?: string; items?: string[]; variant?: 'default' | 'omitted' | 'agreement' | 'disagreement' }) {
  const variantStyles = {
    default: 'bg-muted/30',
    omitted: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    agreement: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    disagreement: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  }

  return (
    <div className={`p-3 sm:p-4 rounded-lg border ${variantStyles[variant || 'default']} touch-manipulation`}>
      <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2">
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <h4 className="font-medium text-xs sm:text-sm">{title}</h4>
      </div>
      {content && <p className="text-sm text-foreground px-2 sm:px-0">{content}</p>}
      {items && (
        <ul className="space-y-0.5 sm:space-y-1 mt-1.5 sm:mt-2">
          {items.map((item, i) => (
            <li key={i} className="text-[10px] sm:text-xs text-foreground/80 flex items-start gap-0.5 sm:gap-1">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AnalysisView({ analysis }: { analysis: PerspectiveAnalysis }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="p-3 sm:p-4 sm:p-6 space-y-3 sm:space-y-4">
          <AnalysisSection title="Headline Difference" content={analysis.headlineDifference} />
          <AnalysisSection title="Framing Difference" content={analysis.framingDifference} />
          <AnalysisSection title="Interpretation Difference" content={analysis.interpretationDifference} />
          <AnalysisSection title="Bias Assessment" content={analysis.biasAssessment} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
            <AnalysisList title="Facts Emphasized (A)" items={analysis.factsEmphasizedA} />
            <AnalysisList title="Facts Emphasized (B)" items={analysis.factsEmphasizedB} />
            <AnalysisList title="Facts Omitted (A)" items={analysis.factsOmittedA} variant="omitted" />
            <AnalysisList title="Facts Omitted (B)" items={analysis.factsOmittedB} variant="omitted" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
            <AnalysisList title="Areas of Agreement" items={analysis.agreementAreas} variant="agreement" />
            <AnalysisList title="Areas of Disagreement" items={analysis.disagreementAreas} variant="disagreement" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AnalysisSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="space-y-1.5 sm:space-y-2 p-2.5 sm:p-4 bg-muted/30 rounded-lg">
      <h4 className="font-medium text-xs sm:text-sm">{title}</h4>
      <p className="text-sm text-foreground px-2 sm:px-0">{content}</p>
    </div>
  )
}

function AnalysisList({ title, items, variant }: { title: string; items: string[]; variant?: 'default' | 'omitted' | 'agreement' | 'disagreement' }) {
  const variantColors = {
    default: 'text-foreground',
    omitted: 'text-red-600 dark:text-red-400',
    agreement: 'text-green-600 dark:text-green-400',
    disagreement: 'text-yellow-600 dark:text-yellow-400',
  }

  return (
    <div className="p-2.5 sm:p-4 bg-muted/30 rounded-lg">
      <h4 className="font-medium text-xs sm:text-sm mb-2 sm:mb-3">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className={`text-[10px] sm:text-xs ${variantColors[variant || 'default']} flex items-start gap-0.5 sm:gap-1`}>
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
