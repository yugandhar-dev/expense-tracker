'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Account, Category, Transaction, InsertTransaction, UpdateTransaction } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { format } from 'date-fns'

interface TransactionFormProps {
  transactionId?: string
}

export function TransactionForm({ transactionId }: TransactionFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!transactionId)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    accountId: '',
    categoryId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    isNecessary: false,
    reason: ''
  })

  const router = useRouter()

  useEffect(() => {
    loadInitialData()
  }, [transactionId])

  const loadInitialData = async () => {
    try {
      const supabase = createClient()

      // Get user first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Authentication required')
        return
      }

      // Load accounts and categories
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

      // If editing, load transaction data
      if (transactionId) {
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', transactionId)
          .eq('user_id', user.id)
          .single()

        if (transactionError) throw transactionError

        setFormData({
          type: transaction.type,
          amount: transaction.amount.toString(),
          description: transaction.description,
          accountId: transaction.account_id,
          categoryId: transaction.category_id,
          date: transaction.date,
          isNecessary: transaction.is_necessary,
          reason: transaction.reason || ''
        })
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount')
      }

      const transactionData = {
        user_id: user.id,
        account_id: formData.accountId,
        category_id: formData.categoryId,
        amount,
        type: formData.type,
        description: formData.description,
        date: formData.date,
        is_necessary: formData.isNecessary,
        reason: formData.reason || null
      }

      if (transactionId) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update(transactionData as UpdateTransaction)
          .eq('id', transactionId)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new transaction
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData as InsertTransaction])

        if (error) throw error
      }

      router.push('/dashboard/transactions')
    } catch (err) {
      console.error('Error saving transaction:', err)
      setError(err instanceof Error ? err.message : 'Failed to save transaction')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (key: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error && !accounts.length) {
    return (
      <div className="bg-destructive/15 border border-destructive/20 text-destructive rounded-lg p-4">
        <p className="font-semibold">Error loading form</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {transactionId ? 'Edit Transaction' : 'Add New Transaction'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => updateFormData('type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => updateFormData('amount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Transaction description"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account">Account *</Label>
              <Select
                value={formData.accountId}
                onValueChange={(value) => updateFormData('accountId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => updateFormData('categoryId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => updateFormData('date', e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNecessary"
              checked={formData.isNecessary}
              onCheckedChange={(checked) => updateFormData('isNecessary', checked === true)}
            />
            <Label htmlFor="isNecessary">This is an essential expense</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => updateFormData('reason', e.target.value)}
              placeholder="Optional notes about this transaction"
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive rounded-md p-3">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : (transactionId ? 'Update Transaction' : 'Add Transaction')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}