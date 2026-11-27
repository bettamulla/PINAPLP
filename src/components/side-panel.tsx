'use client'

import * as React from 'react'

import { Target, GitBranch, Brain, TrendingUp, AlertTriangle, Clock, Plus, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'


import { Progress } from '@/components/ui/progress'


export function SidePanel() {
  return (
    <aside className="space-y-4 sm:space-y-6" aria-label="Side panel">
      <PredictionsPanel />
      <StorylinesPanel />
      <FlashcardsPanel />
      <IndicatorsPanel />
    </aside>
  )
}

function PredictionsPanel() {
  const predictions = [
    { id: '1', statement: 'UK inflation will rise above 3% by March 2025', confidence: 75, daysLeft: 45, status: 'pending' },
    { id: '2', statement: 'Fed will cut rates before end of Q3 2024', confidence: 60, daysLeft: 90, status: 'pending' },
    { id: '3', statement: 'China GDP growth will exceed 5% in 2024', confidence: 40, daysLeft: 180, status: 'pending' },
    { id: '4', statement: 'AI regulation bill passes US Congress', confidence: 30, daysLeft: 270, status: 'pending' },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-2">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <Target className="h-4 w-4" />
          Predictions
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7 touch-manipulation">
          <Plus className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
        {predictions.map((pred) => (
          <PredictionCard key={pred.id} {...pred} />
        ))}
        <Button variant="outline" className="w-full justify-start text-sm gap-2 touch-manipulation">
          <Plus className="h-3 w-3" /> Create Prediction
        </Button>
      </CardContent>
    </Card>
  )
}

function PredictionCard({ statement, confidence, daysLeft, status }: { statement: string; confidence: number; daysLeft: number; status: string }) {
  const statusColors = {
    pending: 'bg-blue-500',
    resolved_correct: 'bg-green-500',
    resolved_incorrect: 'bg-red-500',
    unresolvable: 'bg-gray-500',
  }

  return (
    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
      <p className="text-sm font-medium line-clamp-2">{statement}</p>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'}`} />
          <span className="text-muted-foreground capitalize">{status.replace('_', ' ')}</span>
        </div>
        <span className="text-muted-foreground">{daysLeft}d left</span>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={confidence} className="flex-1 h-1.5" />
        <span className="text-xs font-mono text-muted-foreground w-10">{confidence}%</span>
      </div>
    </div>
  )
}

function StorylinesPanel() {
  const storylines = [
    { id: '1', title: 'US–China Trade Relations', status: 'active', unreadCount: 3, lastUpdate: '2h ago' },
    { id: '2', title: 'EU AI Act Implementation', status: 'developing', unreadCount: 1, lastUpdate: '5h ago' },
    { id: '3', title: 'Central Bank Policy Coordination', status: 'active', unreadCount: 2, lastUpdate: '1h ago' },
    { id: '4', title: 'Middle East Energy Politics', status: 'monitoring', unreadCount: 0, lastUpdate: '1d ago' },
  ]

  const statusColors = {
    active: 'bg-green-500',
    developing: 'bg-blue-500',
    monitoring: 'bg-yellow-500',
    dormant: 'bg-gray-500',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-2">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Storylines
        </CardTitle>
        <Badge variant="outline" className="text-xs text-xs sm:text-sm">4 followed</Badge>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-2.5 sm:space-y-3">
        {storylines.map((storyline) => (
          <div key={storyline.id} className="p-2.5 sm:p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors touch-manipulation">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{storyline.title}</h4>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${statusColors[storyline.status as keyof typeof statusColors] || 'bg-gray-500'}`} />
                    <span className="text-xs sm:text-sm capitalize">{storyline.status}</span>
                  </span>
                  <span className="truncate text-xs sm:text-sm">{storyline.lastUpdate}</span>
                </div>
              </div>
              {storyline.unreadCount > 0 && (
                <Badge variant="default" className="text-xs ml-1.5 sm:ml-2">{storyline.unreadCount}</Badge>
              )}
            </div>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full justify-start text-sm gap-1 touch-manipulation">
          <ChevronRight className="h-3 w-3" /> View all storylines
        </Button>
      </CardContent>
    </Card>
  )
}

function FlashcardsPanel() {
  const dueCards = [
    { id: '1', question: 'What is the current Fed funds rate?', category: 'Economics', dueIn: 'now' },
    { id: '2', question: 'Key provisions of EU AI Act Article 6', category: 'Technology', dueIn: '2h' },
    { id: '3', question: 'China property sector debt-to-GDP ratio', category: 'Economics', dueIn: '5h' },
    { id: '4', question: 'Quantum error correction threshold theorem', category: 'Science', dueIn: '1d' },
  ]

  const stats = { dueToday: 12, completed: 8, retentionRate: 87 }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-2">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span className="truncate max-w-32 sm:max-w-none">Knowledge Review</span>
        </CardTitle>
        <Badge variant="outline" className="text-xs">{stats.retentionRate}% retention</Badge>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-2.5 sm:space-y-3">
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5 sm:gap-2 text-center p-1.5 sm:p-2 bg-muted/30 rounded-lg">
          <div>
            <p className="text-xl sm:text-2xl font-bold">{stats.dueToday}</p>
            <p className="text-xxs sm:text-xs text-muted-foreground">Due Today</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold">{stats.completed}</p>
            <p className="text-xxs sm:text-xs text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold">{stats.retentionRate}%</p>
            <p className="text-xxs sm:text-xs text-muted-foreground">Retention</p>
          </div>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {dueCards.slice(0, 3).map((card) => (
            <div key={card.id} className="p-2.5 sm:p-3 bg-muted/30 rounded-lg touch-manipulation">
              <p className="text-sm font-medium line-clamp-1">{card.question}</p>
              <div className="flex items-center justify-between mt-1 text-xxs sm:text-xs text-muted-foreground">
                <span>{card.category}</span>
                <span>{card.dueIn}</span>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full justify-start text-sm gap-1.5 sm:gap-2 touch-manipulation">
          <Clock className="h-3 w-3" /> Start Evening Review ({stats.dueToday} cards)
        </Button>
      </CardContent>
    </Card>
  )
}

function IndicatorsPanel() {
  const indicators = [
    { name: 'US CPI YoY', value: '3.3%', trend: 'down', target: '< 2%', status: 'watch' },
    { name: 'Fed Funds Rate', value: '5.25-5.5%', trend: 'flat', target: 'Cut cycle', status: 'watch' },
    { name: 'China PMI Manufacturing', value: '50.4', trend: 'up', target: '> 50', status: 'positive' },
    { name: 'EUR/USD', value: '1.07', trend: 'down', target: 'Parity risk', status: 'caution' },
    { name: 'VIX', value: '14.2', trend: 'flat', target: '< 20', status: 'positive' },
    { name: '10Y Treasury Yield', value: '4.35%', trend: 'up', target: '4.5% resistance', status: 'watch' },
  ]

  const statusColors = {
    positive: 'bg-green-500',
    watch: 'bg-blue-500',
    caution: 'bg-yellow-500',
    critical: 'bg-red-500',
  }

  const statusLabels = {
    positive: 'On Track',
    watch: 'Monitor',
    caution: 'Caution',
    critical: 'Alert',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-2">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Key Indicators
        </CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-2.5 sm:space-y-3">
        <div className="space-y-2.5 sm:space-y-3">
          {indicators.map((indicator) => (
            <div key={indicator.name} className="p-2.5 sm:p-3 bg-muted/30 rounded-lg touch-manipulation">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{indicator.name}</p>
                  <p className="text-xxs sm:text-xs text-muted-foreground truncate sm:truncate-none">Target: {indicator.target}</p>
                </div>
                <div className="text-right ml-2.5 sm:ml-4">
                  <p className="text-lg sm:text-lg font-mono font-semibold">{indicator.value}</p>
                  <div className="flex items-center justify-end gap-0.5 sm:gap-1 mt-0.5 text-xxs sm:text-xs text-muted-foreground">
                    <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${statusColors[indicator.status as keyof typeof statusColors]}`} />
                    <span className="truncate sm:truncate-none">{statusLabels[indicator.status as keyof typeof statusLabels]}</span>
                  </div>
                </div>
              </div>
              <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 text-xxs sm:text-xs text-muted-foreground">
                <span className={`flex items-center gap-0.5 sm:gap-1 ${indicator.trend === 'up' ? 'text-green-600' : indicator.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                  {indicator.trend === 'up' && '↑'}
                  {indicator.trend === 'down' && '↓'}
                  {indicator.trend === 'flat' && '→'}
                  <span className="text-xxs sm:text-xs">{indicator.trend}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}