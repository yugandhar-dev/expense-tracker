'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Account } from '@/lib/types/database'
import { AccountCard } from './account-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CreditCard, DollarSign } from 'lucide-react'

export function AccountsContent() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Get user first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Authentication required')
        return
      }

      const { data, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (accountsError) throw accountsError

      setAccounts(data)
    } catch (err) {
      console.error('Error loading accounts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (id: string) => {
    try {
      const supabase = createClient()
      
      // Check if account has transactions
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('id')
        .eq('account_id', id)
        .limit(1)

      if (transactionError) throw transactionError

      if (transactions && transactions.length > 0) {
        alert('Cannot delete account with existing transactions. Please delete or move transactions first.')
        return
      }

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAccounts(prev => prev.filter(account => account.id !== id))
    } catch (err) {
      console.error('Error deleting account:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete account')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

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
        <p className="font-semibold">Error loading accounts</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={loadAccounts}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
        <p className="text-muted-foreground mb-4">
          Get started by adding your first account to track your finances.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5" />
          <span className="text-sm font-medium opacity-90">Total Balance</span>
        </div>
        <div className="text-3xl font-bold">
          {formatCurrency(totalBalance)}
        </div>
        <p className="text-sm opacity-90 mt-1">
          Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onDelete={handleDeleteAccount}
            onEdit={(id) => router.push(`/dashboard/accounts/edit/${id}`)}
          />
        ))}
      </div>
    </div>
  )
}