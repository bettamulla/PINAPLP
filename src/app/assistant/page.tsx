import { Suspense } from 'react'
import { AssistantPage } from '@/components/assistant-page'

export default function AssistantPageWrapper() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<AssistantSkeleton />}>
        <AssistantPage />
      </Suspense>
    </main>
  )
}

function AssistantSkeleton() {
  return (
    <div className="h-screen flex">
      <div className="w-72 border-r animate-pulse">
        <div className="h-12 bg-muted mx-4 mt-4 rounded" />
        <div className="h-12 bg-muted mx-4 mt-4 rounded" />
        <div className="space-y-2 mx-4 mt-4">
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b animate-pulse bg-muted" />
        <div className="flex-1 p-4 animate-pulse">
          <div className="max-w-2xl mx-auto">
            <div className="h-16 bg-muted rounded-2xl mb-4" />
            <div className="h-32 bg-muted rounded-2xl mb-4" />
            <div className="h-32 bg-muted rounded-2xl" />
          </div>
        </div>
        <div className="h-24 border-t animate-pulse bg-muted" />
      </div>
    </div>
  )
}