import { Suspense } from 'react'
import { SettingsPage } from '@/components/settings-page'

export default function SettingsPageWrapper() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsPage />
      </Suspense>
    </main>
  )
}

function SettingsSkeleton() {
  return (
    <div className="p-6 animate-pulse space-y-6">
      <div className="h-8 bg-muted rounded w-1/3" />
      <div className="h-10 bg-muted rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
      </div>
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded-lg" />
        <div className="h-32 bg-muted rounded-lg" />
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    </div>
  )
}