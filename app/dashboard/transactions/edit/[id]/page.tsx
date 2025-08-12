import { TransactionForm } from '@/components/transactions/transaction-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EditTransactionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const { id } = await params

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/transactions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Transaction</h1>
          <p className="text-muted-foreground">
            Update transaction details
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <TransactionForm transactionId={id} />
      </div>
    </div>
  )
}