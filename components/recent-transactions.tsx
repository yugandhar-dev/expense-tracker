import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  description: string
  date: string
  categories?: {
    name: string
    color: string
  } | null
  accounts?: {
    name: string
    type: string
  } | null
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (!transactions?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent transactions</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'}`}>
              {transaction.type === 'income' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownLeft className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{transaction.description}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{transaction.categories?.name || 'Uncategorized'}</span>
                <span>•</span>
                <span>{transaction.accounts?.name || 'Unknown'}</span>
                <span>•</span>
                <span>{formatDate(transaction.date)}</span>
              </div>
            </div>
          </div>
          <div className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </div>
        </div>
      ))}
    </div>
  )
}