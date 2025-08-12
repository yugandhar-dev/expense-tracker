'use client'

import { Transaction, Account, Category } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'

interface TransactionWithDetails extends Transaction {
  account: Account
  category: Category
}

interface TransactionListProps {
  transactions: TransactionWithDetails[]
  onDeleteTransaction: (id: string) => void
  onEditTransaction: (id: string) => void
}

export function TransactionList({
  transactions,
  onDeleteTransaction,
  onEditTransaction
}: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setDeletingId(id)
      try {
        await onDeleteTransaction(id)
      } finally {
        setDeletingId(null)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
          <p className="text-muted-foreground mb-4">
            No transactions match your current filters.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, TransactionWithDetails[]>)

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="space-y-4">
      {sortedDates.map((date) => {
        const dayTransactions = groupedTransactions[date]
        const dayTotal = dayTransactions.reduce((sum, t) => 
          sum + (t.type === 'income' ? t.amount : -t.amount), 0
        )

        return (
          <div key={date} className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className={`font-semibold ${
                dayTotal >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {dayTotal >= 0 ? '+' : ''}{formatCurrency(dayTotal)}
              </div>
            </div>

            <div className="space-y-2">
              {dayTransactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: transaction.category.color }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">
                              {transaction.description}
                            </h4>
                            {transaction.is_necessary && (
                              <Badge variant="secondary" className="text-xs">
                                Essential
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{transaction.category.name}</span>
                            <span>•</span>
                            <span>{transaction.account.name}</span>
                            {transaction.reason && (
                              <>
                                <span>•</span>
                                <span className="truncate">{transaction.reason}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-semibold ${
                            transaction.type === 'income' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => onEditTransaction(transaction.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(transaction.id)}
                            className="text-destructive"
                            disabled={deletingId === transaction.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingId === transaction.id ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}