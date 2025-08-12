import { Suspense } from 'react'
import { AnalyticsContent } from '@/components/analytics/analytics-content'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into your financial patterns and trends
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      }>
        <AnalyticsContent />
      </Suspense>
    </div>
  )
}