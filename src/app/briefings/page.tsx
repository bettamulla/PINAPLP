import { Suspense } from 'react'
import { BriefingsPage } from '@/components/briefings-page'

export default function BriefingsPageWrapper() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<BriefingsSkeleton />}>
        <BriefingsPage />
      </Suspense>
    </main>
  )
}

function BriefingsSkeleton() {
  return (
    <div className="p-6 animate-pulse space-y-6">
      <div className="h-8 bg-muted rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  )
}