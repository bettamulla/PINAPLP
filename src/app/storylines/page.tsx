import { Suspense } from 'react'
import { StorylinesPage } from '@/components/storylines-page'

export default function StorylinesPageWrapper() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<StorylinesSkeleton />}>
        <StorylinesPage />
      </Suspense>
    </main>
  )
}

function StorylinesSkeleton() {
  return (
    <div className="p-6 animate-pulse space-y-6">
      <div className="h-8 bg-muted rounded w-1/3" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-muted rounded-lg" />
        <div className="space-y-4">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  )
}