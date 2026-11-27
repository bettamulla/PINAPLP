import { Suspense } from 'react'
import { PerspectivesPage } from '@/components/perspectives-page'

export default function PerspectivesPageWrapper() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<PerspectivesSkeleton />}>
        <PerspectivesPage />
      </Suspense>
    </main>
  )
}

function PerspectivesSkeleton() {
  return (
    <div className="p-6 animate-pulse space-y-6">
      <div className="h-8 bg-muted rounded w-1/3" />
      <div className="h-96 bg-muted rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    </div>
  )
}