'use client'

import * as React from 'react'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { BriefingSection } from '@/components/briefing-section'
import { SidePanel } from '@/components/side-panel'
import { StatsSection } from '@/components/stats-section'

export function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <BriefingSection />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <section aria-label="Storylines">
                  <h2 className="text-lg font-semibold mb-3 sm:mb-4">Developing Storylines</h2>
                  <StorylinesList />
                </section>
                <section aria-label="Perspectives">
                  <h2 className="text-lg font-semibold mb-3 sm:mb-4">Perspectives</h2>
                  <PerspectivesSection />
                </section>
              </div>
              <SidePanel />
            </div>
            <StatsSection />
          </div>
        </main>
      </div>
    </div>
  )
}

function StorylinesList() {
  const storylines = [
    { id: '1', title: 'US–China Trade Relations', status: 'active', lastUpdate: '2h ago', articleCount: 12 },
    { id: '2', title: 'AI Regulation in EU', status: 'developing', lastUpdate: '5h ago', articleCount: 8 },
    { id: '3', title: 'Central Bank Policy Shift', status: 'active', lastUpdate: '1h ago', articleCount: 15 },
    { id: '4', title: 'Climate Tech Investment Surge', status: 'monitoring', lastUpdate: '1d ago', articleCount: 6 },
  ]

  return (
    <div className="space-y-3">
      {storylines.map((storyline) => (
        <StorylineCard key={storyline.id} {...storyline} className="max-w-full" />
      ))}
    </div>
  )
}

function StorylineCard({ title, status, lastUpdate, articleCount, className }: { title: string; status: string; lastUpdate: string; articleCount: number; className?: string }) {
  const statusColors = {
    active: 'bg-green-500',
    developing: 'bg-blue-500',
    monitoring: 'bg-yellow-500',
    dormant: 'bg-gray-500',
  }

  return (
    <div className={`p-4 bg-card border rounded-lg hover:shadow-md transition-shadow ${className || ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate text-sm sm:text-base">{title}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'}`} />
              <span className="text-xs sm:text-sm">{status}</span>
            </span>
            <span className="truncate text-xs sm:text-sm">Updated {lastUpdate}</span>
            <span className="text-xs sm:text-sm whitespace-nowrap">{articleCount} articles</span>
          </div>
        </div>
        <button className="p-1.5 sm:p-1 hover:bg-accent rounded transition-colors text-muted-foreground touch-manipulation" aria-label="Actions">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function PerspectivesSection() {
  const perspectives = [
    { id: '1', title: 'Fed Rate Decision Coverage', sources: ['Financial Times', 'Wall Street Journal'], status: 'available' },
    { id: '2', title: 'AI Safety Summit Outcomes', sources: ['The Guardian', 'Reuters'], status: 'available' },
  ]

  return (
    <div className="space-y-3">
      {perspectives.map((p) => (
        <div key={p.id} className="p-4 bg-card border rounded-lg">
          <h4 className="font-medium text-base sm:text-lg">{p.title}</h4>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{p.sources.join(' vs ')}</p>
          <button className="mt-2 text-sm text-primary hover:underline touch-manipulation">
            Compare perspectives →
          </button>
        </div>
      ))}
    </div>
  )
}