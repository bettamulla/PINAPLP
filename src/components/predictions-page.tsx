'use client'

import * as React from 'react'
import { formatDate } from '@/lib/utils';
import { Plus, Target, TrendingUp, TrendingDown, Brain, Clock, CheckCircle, XCircle, HelpCircle, BarChart2, Zap, Flag, Edit2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'


import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'


import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts'

const mockPredictions = [
  {
    id: '1',
    statement: 'Federal Reserve will cut interest rates by at least 50 basis points before end of Q2 2024',
    reasoning: 'Inflation has been trending down consistently for 6 months. Labor market showing signs of cooling. Fed has signaled pivot.',
    opposingArgument: 'Inflation sticky above 3%. Core services inflation persistent. Fed may wait for clearer evidence.',
    resolutionCriteria: 'Fed funds rate at least 0.5% lower than current level by June 30, 2024',
    confidence: 75,
    expectedResolutionDate: new Date('2024-06-30'),
    status: 'pending' as const,
    createdAt: new Date('2024-01-15'),
    storyline: { id: '1', title: 'Federal Reserve Policy Pivot' },
    revisions: [
      { confidence: 75, reasoning: 'Initial prediction', createdAt: new Date('2024-01-15') },
      { confidence: 65, reasoning: 'CPI came in hotter than expected', createdAt: new Date('2024-03-10') },
      { confidence: 70, reasoning: 'Labor data cooling, but inflation sticky', createdAt: new Date('2024-04-20') },
    ],
  },
  {
    id: '2',
    statement: 'EU AI Act will cause measurable decline in EU AI startup funding vs US in 2024',
    reasoning: 'Compliance costs disproportionately affect early-stage companies. Regulatory uncertainty chills investment.',
    opposingArgument: 'Act creates clear rules reducing long-term uncertainty. EU market access valuable. Trust advantage.',
    resolutionCriteria: 'EU AI startup funding < 70% of US AI startup funding in 2024 (PitchBook data)',
    confidence: 60,
    expectedResolutionDate: new Date('2024-12-31'),
    status: 'pending' as const,
    createdAt: new Date('2024-02-20'),
    storyline: { id: '2', title: 'EU AI Act Implementation' },
    revisions: [
      { confidence: 60, reasoning: 'Initial prediction', createdAt: new Date('2024-02-20') },
    ],
  },
  {
    id: '3',
    statement: 'China property sector stimulus will stabilize prices in Tier 1 cities by end of 2024',
    reasoning: 'Mortgage rate cuts + purchase restriction easing + developer funding = demand support.',
    opposingArgument: 'Demographic headwinds. Oversupply in many cities. Confidence crisis not solved by rates.',
    resolutionCriteria: 'Tier 1 city avg price change > -2% YoY by Dec 2024 (NBS data)',
    confidence: 45,
    expectedResolutionDate: new Date('2024-12-31'),
    status: 'resolved_incorrect' as const,
    outcome: 'Tier 1 prices fell 8% YoY despite stimulus',
    resolvedAt: new Date('2025-01-15'),
    brierScore: '0.203',
    storyline: { id: '3', title: 'China Property Crisis' },
    revisions: [
      { confidence: 45, reasoning: 'Initial prediction', createdAt: new Date('2024-05-15') },
      { confidence: 35, reasoning: 'Sales data continuing to deteriorate', createdAt: new Date('2024-08-20') },
    ],
  },
  {
    id: '4',
    statement: 'OpenAI will release GPT-5 before Google releases Gemini Ultra',
    reasoning: 'OpenAI has faster iteration cycle. GPT-4.5 already rumored. Google more cautious.',
    opposingArgument: 'Google has massive compute advantage. Gemini Ultra benchmarked internally.',
    resolutionCriteria: 'Public release date comparison from official announcements',
    confidence: 70,
    expectedResolutionDate: new Date('2024-12-31'),
    status: 'resolved_correct' as const,
    outcome: 'GPT-5 released Oct 2024; Gemini Ultra released Feb 2025',
    resolvedAt: new Date('2025-02-20'),
    brierScore: '0.090',
    storyline: { id: '4', title: 'Frontier AI Model Race' },
    revisions: [
      { confidence: 70, reasoning: 'Initial prediction', createdAt: new Date('2024-03-10') },
      { confidence: 80, reasoning: 'OpenAI dev day hints', createdAt: new Date('2024-06-15') },
    ],
  },
  {
    id: '5',
    statement: 'Bitcoin will exceed $100,000 before 2025',
    reasoning: 'ETF inflows + halving cycle + institutional adoption + dollar debasement narrative.',
    opposingArgument: 'Regulatory crackdown risk. ETF flows may reverse. Macro liquidity tightening.',
    resolutionCriteria: 'BTC spot price > $100k on major exchange (Coinbase/Binance)',
    confidence: 55,
    expectedResolutionDate: new Date('2024-12-31'),
    status: 'pending' as const,
    createdAt: new Date('2024-01-20'),
    storyline: { id: '5', title: 'Bitcoin Bull Market' },
    revisions: [
      { confidence: 55, reasoning: 'Initial prediction', createdAt: new Date('2024-01-20') },
      { confidence: 65, reasoning: 'ETF approvals exceeded expectations', createdAt: new Date('2024-03-15') },
      { confidence: 50, reasoning: 'Mt. Gox distributions + Germany sales', createdAt: new Date('2024-07-10') },
    ],
  },
]

const mockCalibration = {
  total: 28,
  resolved: 20,
  correct: 13,
  incorrect: 7,
  pending: 6,
  unresolvable: 2,
  accuracyRate: 65,
  avgBrierScore: 0.187,
  calibrationData: [
    { bracket: '0-10', total: 1, correct: 1, accuracy: 100 },
    { bracket: '10-30', total: 3, correct: 2, accuracy: 67 },
    { bracket: '30-50', total: 5, correct: 2, accuracy: 40 },
    { bracket: '50-70', total: 6, correct: 4, accuracy: 67 },
    { bracket: '70-90', total: 4, correct: 3, accuracy: 75 },
    { bracket: '90-100', total: 1, correct: 1, accuracy: 100 },
  ],
  bySubject: {
    'Economics': { total: 8, correct: 5, accuracy: 63, avgBrier: 0.17 },
    'Technology': { total: 6, correct: 4, accuracy: 67, avgBrier: 0.15 },
    'Geopolitics': { total: 4, correct: 2, accuracy: 50, avgBrier: 0.22 },
    'Markets': { total: 2, correct: 2, accuracy: 100, avgBrier: 0.09 },
  },
}

export function PredictionsPage() {
  const [activeTab, setActiveTab] = React.useState<string>('all')
  const [filterStatus] = React.useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [selectedPrediction, setSelectedPrediction] = React.useState<typeof mockPredictions[0] | null>(null)
  const [, setIsEditOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    statement: '',
    reasoning: '',
    opposingArgument: '',
    resolutionCriteria: '',
    confidence: 50,
    expectedResolutionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    storylineId: '',
    articleId: '',
  })

  const filteredPredictions = mockPredictions.filter(p => {
    if (filterStatus === 'all') return true
    return p.status === filterStatus
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    // In real app: await createPrediction(formData)
    console.log('Create prediction:', formData)
    setIsCreateOpen(false)
    setFormData({
      statement: '',
      reasoning: '',
      opposingArgument: '',
      resolutionCriteria: '',
      confidence: 50,
      expectedResolutionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      storylineId: '',
      articleId: '',
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold px-4 sm:px-0">Predictions</h1>
          <p className="text-sm text-muted-foreground px-4 sm:px-0">Track forecasts, update confidence, measure calibration</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Prediction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Prediction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 p-4">
              <div className="space-y-2">
                <Label>Statement *</Label>
                <Textarea
                  value={formData.statement}
                  onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                  placeholder="What will happen? Be specific and falsifiable."
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Your Reasoning *</Label>
                <Textarea
                  value={formData.reasoning}
                  onChange={(e) => setFormData({ ...formData, reasoning: e.target.value })}
                  placeholder="Why do you believe this? Key evidence, logic, assumptions."
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Opposing Argument (Pre-mortem) *</Label>
                <Textarea
                  value={formData.opposingArgument}
                  onChange={(e) => setFormData({ ...formData, opposingArgument: e.target.value })}
                  placeholder="What's the strongest case against your prediction? Steel-man the counterargument."
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Resolution Criteria *</Label>
                <Textarea
                  value={formData.resolutionCriteria}
                  onChange={(e) => setFormData({ ...formData, resolutionCriteria: e.target.value })}
                  placeholder="How will this be judged? Specific, measurable, verifiable criteria."
                  rows={2}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Confidence *</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[formData.confidence]}
                      onValueChange={([v]) => setFormData({ ...formData, confidence: v })}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="font-mono text-lg w-12 text-right">{formData.confidence}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Expected Resolution Date *</Label>
                  <Input
                    type="date"
                    value={formData.expectedResolutionDate}
                    onChange={(e) => setFormData({ ...formData, expectedResolutionDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Linked Storyline (Optional)</Label>
                  <Select value={formData.storylineId} onValueChange={(v) => setFormData({ ...formData, storylineId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select storyline..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="1">Federal Reserve Policy Pivot</SelectItem>
                      <SelectItem value="2">EU AI Act Implementation</SelectItem>
                      <SelectItem value="3">China Property Crisis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Linked Article (Optional)</Label>
                  <Input placeholder="Article ID or URL" value={formData.articleId} onChange={(e) => setFormData({ ...formData, articleId: e.target.value })} />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" className="gap-1">
                  <Zap className="h-4 w-4" /> Create with AI Analysis
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Predictions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="calibration">Calibration</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PredictionList predictions={filteredPredictions} onSelect={setSelectedPrediction} onEdit={setIsEditOpen} />
        </TabsContent>

        <TabsContent value="pending">
          <PredictionList predictions={mockPredictions.filter(p => p.status === 'pending')} onSelect={setSelectedPrediction} onEdit={setIsEditOpen} />
        </TabsContent>

        <TabsContent value="resolved">
          <PredictionList predictions={mockPredictions.filter(p => p.status !== 'pending')} onSelect={setSelectedPrediction} onEdit={setIsEditOpen} />
        </TabsContent>

        <TabsContent value="calibration">
          <CalibrationDashboard calibration={mockCalibration} />
        </TabsContent>
      </Tabs>

      {selectedPrediction && (
        <PredictionDetail
          prediction={selectedPrediction}
          onClose={() => setSelectedPrediction(null)}
          onEdit={() => { setIsEditOpen(true); setSelectedPrediction(null); }}
        />
      )}
    </div>
  )
}

function PredictionList({ predictions, onSelect, onEdit }: { predictions: typeof mockPredictions; onSelect: (p: typeof mockPredictions[0]) => void; onEdit: (value: boolean) => void }) {
  if (predictions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 sm:py-12 text-center text-muted-foreground">
          <Target className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
          <p className="text-base sm:text-lg">No predictions found</p>
          <p className="text-xs sm:text-sm mt-1 sm:mt-2">Create your first prediction to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {predictions.map((prediction) => (
        <PredictionCard key={prediction.id} prediction={prediction} onClick={() => onSelect(prediction)} onEdit={onEdit} />
      ))}
    </div>
  )
}

function PredictionCard({ prediction, onClick, onEdit }: { prediction: typeof mockPredictions[0]; onClick: () => void; onEdit: (value: boolean) => void }) {
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-blue-500', icon: Clock },
    resolved_correct: { label: 'Correct', color: 'bg-green-500', icon: CheckCircle },
    resolved_incorrect: { label: 'Incorrect', color: 'bg-red-500', icon: XCircle },
    unresolvable: { label: 'Unresolvable', color: 'bg-gray-500', icon: HelpCircle },
  }
  const config = statusConfig[prediction.status]
  const StatusIcon = config.icon
  const daysUntilResolution = prediction.expectedResolutionDate
    ? Math.ceil((new Date(prediction.expectedResolutionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer touch-manipulation" onClick={onClick}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2.5 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
              <Badge className={config.color} variant="default">
                <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="text-[10px] sm:text-xs ml-0.5">{config.label}</span>
              </Badge>
              {prediction.storyline && (
                <Badge variant="outline" className="text-[8px] sm:text-xs">
                  <span className="hidden sm:inline">{prediction.storyline.title}</span>
                  <span className="sm:hidden">{prediction.storyline.title?.slice(0, 10)}</span>
                </Badge>
              )}
            </div>
            <p className="font-medium text-sm sm:text-base mb-1.5 line-clamp-2 px-2 sm:px-0">{prediction.statement}</p>
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Brain className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {prediction.confidence}%
              </span>
              {daysUntilResolution !== null && (
                <span className="flex items-center gap-0.5" style={{ color: daysUntilResolution < 7 ? 'var(--destructive)' : 'inherit' }}>
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="hidden sm:inline">{daysUntilResolution > 0 ? `${daysUntilResolution}d` : 'Due'}</span>
                  <span className="sm:hidden">{daysUntilResolution > 0 ? `${daysUntilResolution}d` : 'Due'}</span>
                </span>
              )}
              <span className="hidden sm:inline flex items-center gap-0.5">
                <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {formatDate(prediction.createdAt!, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 touch-manipulation" onClick={(e) => { e.stopPropagation(); onEdit(true); }}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Update confidence</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 touch-manipulation" onClick={(e) => e.stopPropagation()}>
                    <Flag className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Resolve</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {prediction.revisions && prediction.revisions.length > 1 && (
          <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">Confidence History</p>
            <div className="flex items-end gap-0.5 sm:gap-1 h-12 sm:h-16">
              {prediction.revisions.map((rev, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end">
                  <div
                    className="w-full bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                    style={{ height: `${(rev.confidence / 100) * 100}%` }}
                  />
                  <span className="text-[8px] sm:text-xs text-muted-foreground mt-0.5">{rev.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PredictionDetail({ prediction, onClose, onEdit }: { prediction: typeof mockPredictions[0]; onClose: () => void; onEdit: () => void }) {
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-blue-500', icon: Clock },
    resolved_correct: { label: 'Correct', color: 'bg-green-500', icon: CheckCircle },
    resolved_incorrect: { label: 'Incorrect', color: 'bg-red-500', icon: XCircle },
    unresolvable: { label: 'Unresolvable', color: 'bg-gray-500', icon: HelpCircle },
  }
  const config = statusConfig[prediction.status]
  const StatusIcon = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/50" onClick={onClose}>
      <div className="bg-background w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-lg border shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <h2 className="text-base sm:text-lg font-semibold px-2 sm:px-0">Prediction Details</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 touch-manipulation" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
            <Badge className={config.color} variant="default">
              <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="text-[10px] sm:text-xs ml-0.5">{config.label}</span>
            </Badge>
            {prediction.storyline && (
              <Badge variant="outline" className="text-[8px] sm:text-xs">
                <span className="hidden sm:inline">{prediction.storyline.title}</span>
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={onEdit} className="ml-auto gap-0.5 sm:gap-1 touch-manipulation">
              <Edit2 className="h-3 w-3" />
              <span className="hidden sm:inline">Update Confidence</span>
            </Button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <DetailSection title="Statement" content={prediction.statement} />
            <DetailSection title="Reasoning" content={prediction.reasoning} />
            <DetailSection title="Opposing Argument (Pre-mortem)" content={prediction.opposingArgument} />
            <DetailSection title="Resolution Criteria" content={prediction.resolutionCriteria} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <DetailSection title="Confidence" content={`${prediction.confidence}%`} />
              <DetailSection title="Expected Resolution" content={prediction.expectedResolutionDate ? formatDate(new Date(prediction.expectedResolutionDate), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set'} />
            </div>
          </div>

          {prediction.status !== 'pending' && (
            <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border space-y-1.5 sm:space-y-2">
              <h4 className="font-medium text-sm">Resolution</h4>
              <p className="text-sm"><strong>Outcome:</strong> {prediction.outcome}</p>
              <p className="text-sm"><strong>Resolved:</strong> {prediction.resolvedAt ? formatDate(new Date(prediction.resolvedAt), { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</p>
              {prediction.brierScore && (
                <p className="text-sm"><strong>Brier:</strong> {prediction.brierScore} (lower is better)</p>
              )}
            </div>
          )}

          {prediction.revisions && prediction.revisions.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-medium text-sm">Confidence History</h4>
              <div className="space-y-1.5 sm:space-y-2">
                {prediction.revisions.map((rev, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/30 rounded-lg">
                    <div className="w-10 sm:w-12 text-right font-mono text-[10px] sm:text-sm">{rev.confidence}%</div>
                    <div className="flex-1 h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(rev.confidence / 100) * 100}%` }} />
                    </div>
                    <div className="text-[8px] sm:text-sm text-muted-foreground w-24 sm:w-32">{formatDate(rev.createdAt, { month: 'short', day: 'numeric' })}</div>
                  </div>
                ))}
              </div>
              {prediction.revisions[0] && prediction.revisions[0].reasoning && (
                <p className="text-xs text-muted-foreground italic">{prediction.revisions[0].reasoning.replace('Initial prediction. AI suggested confidence: ', '')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
      <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>
    </div>
  )
}

function CalibrationDashboard({ calibration }: { calibration: typeof mockCalibration }) {
  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Predictions" value={calibration.total} icon={Target} />
        <StatCard title="Resolved" value={calibration.resolved} subtitle={`${calibration.accuracyRate}% accuracy`} icon={CheckCircle} color="text-green-500" />
        <StatCard title="Avg Brier Score" value={calibration.avgBrierScore.toFixed(3)} subtitle="Lower is better" icon={TrendingDown} color="text-blue-500" />
        <StatCard title="Pending" value={calibration.pending} subtitle={`${calibration.unresolvable} unresolvable`} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="sm:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
              <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5" /> Calibration Curve
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">Ideal calibration follows diagonal. Points above = underconfident, below = overconfident.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calibration.calibrationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="bracket" type="category" width={60} tick={{ fontSize: 10 }} />
                  <RechartsTooltip formatter={(value: number) => [`${value}%`, 'Accuracy']} labelFormatter={(bracket) => `Confidence: ${bracket}`} />
                  <Bar dataKey="accuracy" name="Actual Accuracy" radius={[0, 4, 4, 0]}>
                    {calibration.calibrationData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm">
              <div className="flex items-center gap-0.5 sm:gap-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{ background: COLORS[0] }} />
                <span className="hidden sm:inline">Actual Accuracy</span>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <div className="w-2 h-2 rounded border border-dashed" style={{ borderColor: '#64748b' }} />
                <span className="hidden sm:inline">Perfect Calibration</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" /> Resolution Rate by Confidence
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">How often predictions in each confidence bracket resolve correctly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calibration.calibrationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="bracket" type="category" width={80} tick={{ fontSize: 12 }} />
                  <RechartsTooltip formatter={(value: number, name: string) => [value.toString(), name]} labelFormatter={(bracket) => `Confidence: ${bracket}`} />
                  <Bar dataKey="total" name="Total Predictions" fill="#64748b" radius={[0, 4, 4, 0]} opacity={0.5} />
                  <Bar dataKey="correct" name="Correct" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
              <Target className="h-4 w-4 sm:h-5 sm:w-5" /> By Subject Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(calibration.bySubject).map(([subject, data]) => (
                <div key={subject} className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{subject}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">{data.accuracy}% accuracy • {data.total} predictions</span>
                  </div>
                  <Progress value={data.accuracy} className="h-1.5 sm:h-2" />
                  <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                    <span>Avg Brier: {data.avgBrier.toFixed(3)}</span>
                    <span>{data.correct}/{data.total} correct</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5" /> Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 sm:space-y-3">
            <InsightCard
              icon={TrendingUp}
              iconColor="text-green-500"
              title="Well-Calibrated at High Confidence"
              description="Your 70-90% and 90-100% predictions show 75-100% accuracy. You're well-calibrated when confident."
            />
            <InsightCard
              icon={TrendingDown}
              iconColor="text-yellow-500"
              title="Overconfident in Mid-Range"
              description="30-50% bracket only 40% accurate. Consider lowering confidence when uncertain."
            />
            <InsightCard
              icon={Target}
              iconColor="text-blue-500"
              title="Strong in Markets & Tech"
              description="100% accuracy in Markets, 67% in Technology. Consider specializing predictions in these domains."
            />
            <InsightCard
              icon={HelpCircle}
              iconColor="text-red-500"
              title="Geopolitics Needs Work"
              description="Only 50% accuracy in Geopolitics. Consider more research or lower confidence for these predictions."
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
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl sm:text-2xl font-bold mt-1" style={{ color: color }}>{value}</p>
            {subtitle && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="p-2.5 sm:p-3 bg-muted rounded-lg" style={{ color: color }}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InsightCard({ icon: Icon, iconColor, title, description }: { icon: React.ComponentType<{ className?: string }>; iconColor: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-lg">
      <div className={`p-1.5 sm:p-2 rounded-lg ${iconColor} bg-current/10`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div>
        <p className="font-medium text-xs sm:text-sm">{title}</p>
        <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{description}</p>
      </div>
    </div>
  )
}
