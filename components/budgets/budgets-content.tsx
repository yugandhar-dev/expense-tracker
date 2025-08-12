'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Budget, Category } from '@/lib/types/database'
import { BudgetCard } from './budget-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Target } from 'lucide-react'

interface BudgetWithCategory extends Budget {
  category: Category
  spent: number
}

export function BudgetsContent() {
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Get user first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Authentication required')
        return
      }

      // Get budgets with category information
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (budgetsError) throw budgetsError

      // Get current month spending for each budget
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
      const budgetsWithSpending = await Promise.all(
        budgetsData.map(async (budget) => {
          const { data: transactions, error: transactionError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('category_id', budget.category_id)
            .eq('type', 'expense')
            .gte('date', `${currentMonth}-01`)
            .lt('date', `${currentMonth}-32`) // Next month

          if (transactionError) throw transactionError

          const spent = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0

          return {
            ...budget,
            spent
          }
        })
      )

      setBudgets(budgetsWithSpending as any)
    } catch (err) {
      console.error('Error loading budgets:', err)
      setError(err instanceof Error ? err.message : 'Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBudget = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) throw error

      setBudgets(prev => prev.filter(budget => budget.id !== id))
    } catch (err) {
      console.error('Error deleting budget:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete budget')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/15 border border-destructive/20 text-destructive rounded-lg p-4">
        <p className="font-semibold">Error loading budgets</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={loadBudgets}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
        <p className="text-muted-foreground mb-4">
          Set monthly spending limits to help track your expenses.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {budgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onDelete={handleDeleteBudget}
          onEdit={(id) => router.push(`/dashboard/budgets/edit/${id}`)}
        />
      ))}
    </div>
  )
}