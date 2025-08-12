'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/types/database'
import { CategoryCard } from './category-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Tags } from 'lucide-react'

export function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Get user first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Authentication required')
        return
      }

      const { data, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order('is_default', { ascending: false })
        .order('name')

      if (categoriesError) throw categoriesError

      setCategories(data)
    } catch (err) {
      console.error('Error loading categories:', err)
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const supabase = createClient()
      
      // Check if category has transactions
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('id')
        .eq('category_id', id)
        .limit(1)

      if (transactionError) throw transactionError

      if (transactions && transactions.length > 0) {
        alert('Cannot delete category with existing transactions. Please delete or recategorize transactions first.')
        return
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCategories(prev => prev.filter(category => category.id !== id))
    } catch (err) {
      console.error('Error deleting category:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete category')
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
        <p className="font-semibold">Error loading categories</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={loadCategories}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  // Separate user categories from default categories
  const userCategories = categories.filter(cat => !cat.is_default)
  const defaultCategories = categories.filter(cat => cat.is_default)

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Tags className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
        <p className="text-muted-foreground mb-4">
          Create custom categories to organize your transactions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* User Categories */}
      {userCategories.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {userCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onDelete={handleDeleteCategory}
                onEdit={(id) => router.push(`/dashboard/categories/edit/${id}`)}
                canEdit={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Default Categories */}
      {defaultCategories.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Default Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {defaultCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onDelete={handleDeleteCategory}
                onEdit={(id) => router.push(`/dashboard/categories/edit/${id}`)}
                canEdit={false}
              />
            ))}
          </div>
        </div>
      )}

      {userCategories.length === 0 && defaultCategories.length > 0 && (
        <div className="text-center py-8 border-t">
          <p className="text-muted-foreground">
            You can use the default categories above or create your own custom categories.
          </p>
        </div>
      )}
    </div>
  )
}