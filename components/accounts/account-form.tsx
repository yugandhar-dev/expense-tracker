'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Account, InsertAccount, UpdateAccount } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AccountFormProps {
  accountId?: string
}

const accountTypes = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'investment', label: 'Investment Account' },
  { value: 'other', label: 'Other' }
] as const

export function AccountForm({ accountId }: AccountFormProps) {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!accountId)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking' as 'checking' | 'savings' | 'credit_card' | 'investment' | 'other',
    balance: ''
  })

  const router = useRouter()

  useEffect(() => {
    if (accountId) {
      loadAccount()
    }
  }, [accountId])

  const loadAccount = async () => {
    try {
      const supabase = createClient()

      // Get user first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Authentication required')
        return
      }

      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .single()

      if (accountError) throw accountError

      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString()
      })
    } catch (err) {
      console.error('Error loading account:', err)
      setError(err instanceof Error ? err.message : 'Failed to load account')
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

      const balance = parseFloat(formData.balance)
      if (isNaN(balance)) {
        throw new Error('Please enter a valid balance')
      }

      const accountData = {
        user_id: user.id,
        name: formData.name.trim(),
        type: formData.type,
        balance
      }

      if (accountId) {
        // Update existing account
        const { error } = await supabase
          .from('accounts')
          .update(accountData as UpdateAccount)
          .eq('id', accountId)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new account
        const { error } = await supabase
          .from('accounts')
          .insert([accountData as InsertAccount])

        if (error) throw error
      }

      router.push('/dashboard/accounts')
    } catch (err) {
      console.error('Error saving account:', err)
      setError(err instanceof Error ? err.message : 'Failed to save account')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error && accountId && !formData.name) {
    return (
      <div className="bg-destructive/15 border border-destructive/20 text-destructive rounded-lg p-4">
        <p className="font-semibold">Error loading account</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {accountId ? 'Edit Account' : 'Add New Account'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="e.g., Chase Checking, Savings Account"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Account Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => updateFormData('type', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Current Balance *</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => updateFormData('balance', e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-sm text-muted-foreground">
              {formData.type === 'credit_card' 
                ? 'Enter negative amount for outstanding balance (e.g., -500.00)' 
                : 'Enter the current balance in your account'
              }
            </p>
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
              {loading ? 'Saving...' : (accountId ? 'Update Account' : 'Add Account')}
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