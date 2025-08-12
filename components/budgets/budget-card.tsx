'use client'

import { Budget, Category } from '@/lib/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface BudgetWithCategory extends Budget {
  category: Category
  spent: number
}

interface BudgetCardProps {
  budget: BudgetWithCategory
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export function BudgetCard({ budget, onDelete, onEdit }: BudgetCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the budget for "${budget.category.name}"?`)) {
      setDeleting(true)
      try {
        await onDelete(budget.id)
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

  const percentage = Math.min((budget.spent / budget.monthly_limit) * 100, 100)
  const isOverBudget = budget.spent > budget.monthly_limit
  const isNearLimit = percentage >= 80 && !isOverBudget

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500'
    if (isNearLimit) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <Card className={`hover:shadow-md transition-shadow ${
      isOverBudget ? 'border-red-200 dark:border-red-800' : ''
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: budget.category.color }}
            />
            {budget.category.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(budget.id)}>
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
        <p className="text-sm text-muted-foreground">{currentMonth}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Spent</span>
            <span className={isOverBudget ? 'text-red-600 font-semibold' : ''}>
              {formatCurrency(budget.spent)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Budget</span>
            <span>{formatCurrency(budget.monthly_limit)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Remaining</span>
            <span className={isOverBudget ? 'text-red-600' : 'text-green-600'}>
              {formatCurrency(budget.monthly_limit - budget.spent)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className={`text-sm font-medium ${
              isOverBudget ? 'text-red-600' : 
              isNearLimit ? 'text-yellow-600' : 'text-foreground'
            }`}>
              {percentage.toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={percentage} 
            className="h-2"
            // Note: We'll need to create a custom Progress component or modify the existing one
            // to support custom colors. For now, it will use default styling.
          />
        </div>

        {(isOverBudget || isNearLimit) && (
          <div className={`flex items-center gap-2 p-2 rounded-md text-sm ${
            isOverBudget 
              ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              : 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
          }`}>
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>
              {isOverBudget 
                ? `Over budget by ${formatCurrency(budget.spent - budget.monthly_limit)}`
                : 'Approaching budget limit'
              }
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}