'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Budget, Category, InsertBudget, UpdateBudget } from '@/lib/types/database'
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

interface BudgetFormProps {
  budgetId?: string
}

export function BudgetForm({ budgetId }: BudgetFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!budgetId)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    categoryId: '',
    monthlyLimit: ''
  })

  const router = useRouter()

  useEffect(() => {
    loadInitialData()
  }, [budgetId])

  const loadInitialData = async () => {
    try {
      const supabase = createClient()

      // Get user first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Authentication required')
        return
      }

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order('name')

      if (categoriesError) throw categoriesError

      setCategories(categoriesData)

      // If editing, load budget data
      if (budgetId) {
        const { data: budget, error: budgetError } = await supabase
          .from('budgets')
          .select('*')
          .eq('id', budgetId)
          .eq('user_id', user.id)
          .single()

        if (budgetError) throw budgetError

        setFormData({
          categoryId: budget.category_id,
          monthlyLimit: budget.monthly_limit.toString()
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

      const monthlyLimit = parseFloat(formData.monthlyLimit)
      if (isNaN(monthlyLimit) || monthlyLimit <= 0) {
        throw new Error('Please enter a valid monthly limit')
      }

      if (!budgetId) {
        // Check if budget already exists for this category
        const { data: existingBudget, error: checkError } = await supabase
          .from('budgets')
          .select('id')
          .eq('user_id', user.id)
          .eq('category_id', formData.categoryId)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existingBudget) {
          throw new Error('A budget already exists for this category')
        }
      }

      const budgetData = {
        user_id: user.id,
        category_id: formData.categoryId,
        monthly_limit: monthlyLimit
      }

      if (budgetId) {
        // Update existing budget
        const { error } = await supabase
          .from('budgets')
          .update(budgetData as UpdateBudget)
          .eq('id', budgetId)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new budget
        const { error } = await supabase
          .from('budgets')
          .insert([budgetData as InsertBudget])

        if (error) throw error
      }

      router.push('/dashboard/budgets')
    } catch (err) {
      console.error('Error saving budget:', err)
      setError(err instanceof Error ? err.message : 'Failed to save budget')
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

  if (error && !categories.length) {
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
          {budgetId ? 'Edit Budget' : 'Add New Budget'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => updateFormData('categoryId', value)}
              required
              disabled={!!budgetId} // Disable category change when editing
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
                      {category.is_default && (
                        <span className="text-xs text-muted-foreground">(Default)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {budgetId && (
              <p className="text-sm text-muted-foreground">
                Category cannot be changed when editing a budget
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyLimit">Monthly Limit *</Label>
            <Input
              id="monthlyLimit"
              type="number"
              step="0.01"
              min="0"
              value={formData.monthlyLimit}
              onChange={(e) => updateFormData('monthlyLimit', e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-sm text-muted-foreground">
              Maximum amount you want to spend in this category per month
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
              {loading ? 'Saving...' : (budgetId ? 'Update Budget' : 'Add Budget')}
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