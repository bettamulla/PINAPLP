'use client'

import * as React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Target, Brain, Award, Clock } from 'lucide-react'

const weeklyData = [
  { day: 'Mon', briefings: 1, predictions: 2, cardsReviewed: 12, timeSpent: 25 },
  { day: 'Tue', briefings: 1, predictions: 1, cardsReviewed: 8, timeSpent: 18 },
  { day: 'Wed', briefings: 1, predictions: 3, cardsReviewed: 15, timeSpent: 32 },
  { day: 'Thu', briefings: 1, predictions: 0, cardsReviewed: 10, timeSpent: 22 },
  { day: 'Fri', briefings: 1, predictions: 2, cardsReviewed: 18, timeSpent: 28 },
  { day: 'Sat', briefings: 0, predictions: 1, cardsReviewed: 5, timeSpent: 12 },
  { day: 'Sun', briefings: 1, predictions: 0, cardsReviewed: 3, timeSpent: 8 },
]

const topicDistribution = [
  { topic: 'Economics', count: 34, color: '#3b82f6' },
  { topic: 'Technology', count: 28, color: '#8b5cf6' },
  { topic: 'Geopolitics', count: 22, color: '#ef4444' },
  { topic: 'Business', count: 18, color: '#22c55e' },
  { topic: 'AI', count: 15, color: '#f97316' },
  { topic: 'Science', count: 12, color: '#14b8a6' },
  { topic: 'E-commerce', count: 8, color: '#ec4899' },
  { topic: 'Global Affairs', count: 6, color: '#6366f1' },
]

export function StatsSection() {
  const stats = {
    totalBriefings: 47,
    totalPredictions: 23,
    accuracyRate: 73.9,
    totalCards: 156,
    retentionRate: 87,
    avgTimeDaily: 24,
  }

  return (
    <section aria-label="Statistics" className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Briefings Read"
          value={stats.totalBriefings}
          trend="+3 this week"
          trendUp
        />
        <StatCard
          icon={Target}
          label="Predictions Made"
          value={stats.totalPredictions}
          trend="+2 this week"
          trendUp
        />
        <StatCard
          icon={Award}
          label="Accuracy Rate"
          value={`${stats.accuracyRate}%`}
          trend="Above average"
          trendUp
        />
        <StatCard
          icon={Brain}
          label="Flashcards"
          value={stats.totalCards}
          trend={`${stats.retentionRate}% retention`}
          trendUp
        />
        <StatCard
          icon={Clock}
          label="Avg Daily Time"
          value={`${stats.avgTimeDaily}m`}
          trend="Consistent"
        />
        <StatCard
          icon={Brain}
          label="Knowledge Streak"
          value="12 days"
          trend="Personal best"
          trendUp
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      briefings: 'Briefings',
                      predictions: 'Predictions',
                      cardsReviewed: 'Cards Reviewed',
                      timeSpent: 'Minutes',
                    }
                    return [value, labels[name] || name]
                  }}
                />
                <Bar dataKey="briefings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="briefings" />
                <Bar dataKey="predictions" fill="hsl(var(--primary)/0.6)" radius={[4, 4, 0, 0]} name="predictions" />
                <Bar dataKey="cardsReviewed" fill="hsl(var(--primary)/0.3)" radius={[4, 4, 0, 0]} name="cardsReviewed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Topic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicDistribution} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [value, 'Articles']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {topicDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Calibration Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CalibrationBucket bucket="0-10%" count={2} accuracy={0} />
            <CalibrationBucket bucket="10-30%" count={3} accuracy={25} />
            <CalibrationBucket bucket="30-50%" count={4} accuracy={45} />
            <CalibrationBucket bucket="50-70%" count={5} accuracy={62} />
            <CalibrationBucket bucket="70-90%" count={6} accuracy={78} />
            <CalibrationBucket bucket="90-100%" count={3} accuracy={95} />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  trend: string
  trendUp?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${trendUp ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
            <Icon className={`h-5 w-5 ${trendUp ? 'text-green-600' : 'text-muted-foreground'}`} />
          </div>
        </div>
        <p className={`text-xs mt-2 ${trendUp ? 'text-green-600' : 'text-muted-foreground'}`}>{trend}</p>
      </CardContent>
    </Card>
  )
}

function CalibrationBucket({ bucket, count, accuracy }: { bucket: string; count: number; accuracy: number }) {
  return (
    <div className="p-4 bg-muted/30 rounded-lg text-center">
      <p className="text-sm font-medium text-muted-foreground">{bucket}</p>
      <p className="text-2xl font-bold mt-1">{count}</p>
      <p className="text-xs text-muted-foreground">predictions</p>
      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${accuracy}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{accuracy}% accurate</p>
    </div>
  )
}