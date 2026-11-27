import { Suspense } from 'react'
import { KnowledgePage } from '@/components/knowledge-page'

export default function KnowledgePageWrapper() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<KnowledgeSkeleton />}>
        <KnowledgePage />
      </Suspense>
    </main>
  )
}

function KnowledgeSkeleton() {
  return (
    <div className="p-6 animate-pulse space-y-6">
      <div className="h-8 bg-muted rounded w-1/3" />
      <div className="h-10 bg-muted rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-24 bg-muted rounded-lg" />
        <div className="h-24 bg-muted rounded-lg" />
        <div className="h-24 bg-muted rounded-lg" />
        <div className="h-24 bg-muted rounded-lg" />
      </div>
      <div className="h-96 bg-muted rounded-lg" />
    </div>
  )
}