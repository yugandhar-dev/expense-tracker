'use client'

import { Account } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  Building
} from 'lucide-react'
import { useState } from 'react'

interface AccountCardProps {
  account: Account
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

const accountTypeIcons = {
  checking: Wallet,
  savings: PiggyBank,
  credit_card: CreditCard,
  investment: TrendingUp,
  other: Building
}

const accountTypeLabels = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  investment: 'Investment',
  other: 'Other'
}

const accountTypeColors = {
  checking: 'bg-blue-500',
  savings: 'bg-green-500',
  credit_card: 'bg-red-500',
  investment: 'bg-purple-500',
  other: 'bg-gray-500'
}

export function AccountCard({ account, onDelete, onEdit }: AccountCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${account.name}"?`)) {
      setDeleting(true)
      try {
        await onDelete(account.id)
      } finally {
        setDeleting(false)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const Icon = accountTypeIcons[account.type]
  const isNegative = account.balance < 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${accountTypeColors[account.type]}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">
                {account.name}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {accountTypeLabels[account.type]}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(account.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive"
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className={`font-bold text-lg ${
              isNegative ? 'text-red-600' : 'text-foreground'
            }`}>
              {formatCurrency(account.balance)}
            </span>
          </div>

          {account.type === 'credit_card' && account.balance < 0 && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-2">
              <p className="text-xs text-red-700 dark:text-red-300">
                Outstanding balance: {formatCurrency(Math.abs(account.balance))}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}