'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Transaction, Account, Category } from '@/lib/types/database'
import { TransactionFilters } from './transaction-filters'
import { TransactionList } from './transaction-list'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { format, startOfMonth, endOfMonth } from 'date-fns'

interface TransactionWithDetails extends Transaction {
  account: Account
  category: Category
}

export function TransactionsContent() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'income' | 'expense',
    accountId: 'all',
    categoryId: 'all',
    dateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    dateTo: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })

  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Get user first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Authentication required')
        return
      }

      // Load accounts and categories in parallel
      const [accountsResult, categoriesResult] = await Promise.all([
        supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .order('name'),
        supabase
          .from('categories')
          .select('*')
          .or(`user_id.eq.${user.id},is_default.eq.true`)
          .order('name')
      ])

      if (accountsResult.error) throw accountsResult.error
      if (categoriesResult.error) throw categoriesResult.error

      setAccounts(accountsResult.data)
      setCategories(categoriesResult.data)

      // Build query for transactions
      let query = supabase
        .from('transactions')
        .select(`
          *,
          account:accounts(*),
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .gte('date', filters.dateFrom)
        .lte('date', filters.dateTo)
        .order('date', { ascending: false })

      // Apply filters
      if (filters.type !== 'all') {
        query = query.eq('type', filters.type)
      }
      if (filters.accountId !== 'all') {
        query = query.eq('account_id', filters.accountId)
      }
      if (filters.categoryId !== 'all') {
        query = query.eq('category_id', filters.categoryId)
      }

      const { data: transactionsData, error: transactionsError } = await query

      if (transactionsError) throw transactionsError

      setTransactions(transactionsData as TransactionWithDetails[])
    } catch (err) {
      console.error('Error loading transactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Reload data to update balances
      await loadData()
    } catch (err) {
      console.error('Error deleting transaction:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
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
        <p className="font-semibold">Error loading transactions</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={loadData}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        accounts={accounts}
        categories={categories}
      />

      <TransactionList
        transactions={transactions}
        onDeleteTransaction={handleDeleteTransaction}
        onEditTransaction={(id) => router.push(`/dashboard/transactions/edit/${id}`)}
      />
    </div>
  )
}