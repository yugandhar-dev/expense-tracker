'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category, InsertCategory, UpdateCategory } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface CategoryFormProps {
  categoryId?: string
}

const predefinedColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#64748b', // slate
  '#6b7280', // gray
  '#374151', // dark gray
]

export function CategoryForm({ categoryId }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!categoryId)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    color: predefinedColors[0]
  })

  const router = useRouter()

  useEffect(() => {
    if (categoryId) {
      loadCategory()
    }
  }, [categoryId])

  const loadCategory = async () => {
    try {
      const supabase = createClient()

      // Get user first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Authentication required')
        return
      }

      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single()

      if (categoryError) throw categoryError

      // Check if user can edit this category
      if (category.is_default) {
        setError('Default categories cannot be edited')
        return
      }

      if (category.user_id !== user.id) {
        setError('You can only edit your own categories')
        return
      }

      setFormData({
        name: category.name,
        color: category.color
      })
    } catch (err) {
      console.error('Error loading category:', err)
      setError(err instanceof Error ? err.message : 'Failed to load category')
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

      const categoryData = {
        user_id: user.id,
        name: formData.name.trim(),
        color: formData.color,
        is_default: false
      }

      if (categoryId) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(categoryData as UpdateCategory)
          .eq('id', categoryId)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([categoryData as InsertCategory])

        if (error) throw error
      }

      router.push('/dashboard/categories')
    } catch (err) {
      console.error('Error saving category:', err)
      setError(err instanceof Error ? err.message : 'Failed to save category')
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

  if (error && categoryId && !formData.name) {
    return (
      <div className="bg-destructive/15 border border-destructive/20 text-destructive rounded-lg p-4">
        <p className="font-semibold">Error loading category</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {categoryId ? 'Edit Category' : 'Add New Category'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="e.g., Groceries, Entertainment, Utilities"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color *</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600" 
                  style={{ backgroundColor: formData.color }}
                />
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => updateFormData('color', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <span className="text-sm text-muted-foreground">
                  {formData.color}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Quick color options:
                </p>
                <div className="grid grid-cols-10 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color 
                          ? 'border-foreground scale-110' 
                          : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateFormData('color', color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
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
              {loading ? 'Saving...' : (categoryId ? 'Update Category' : 'Add Category')}
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