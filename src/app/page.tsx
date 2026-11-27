import { Suspense } from 'react'
import { Dashboard } from '@/components/dashboard'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </main>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg md:col-span-2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-96 bg-muted rounded-lg lg:col-span-2" />
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    </div>
  )
}