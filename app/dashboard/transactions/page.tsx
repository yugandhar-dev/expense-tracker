import { Suspense } from 'react'
import { TransactionsContent } from '@/components/transactions/transactions-content'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function TransactionsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income and expenses
          </p>
        </div>
        <Link href="/dashboard/transactions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </Link>
      </div>

      <Suspense fallback={
        <div className="space-y-4">
          <div className="animate-pulse bg-muted h-32 rounded-lg" />
          <div className="animate-pulse bg-muted h-64 rounded-lg" />
        </div>
      }>
        <TransactionsContent />
      </Suspense>
    </div>
  )
}