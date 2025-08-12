import { Suspense } from 'react'
import { BudgetsContent } from '@/components/budgets/budgets-content'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function BudgetsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set monthly spending limits for your categories
          </p>
        </div>
        <Link href="/dashboard/budgets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </Link>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted h-32 rounded-lg" />
          ))}
        </div>
      }>
        <BudgetsContent />
      </Suspense>
    </div>
  )
}