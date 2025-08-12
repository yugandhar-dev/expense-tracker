import { CategoryForm } from '@/components/categories/category-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewCategoryPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/categories">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Category</h1>
          <p className="text-muted-foreground">
            Create a new category to organize your transactions
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <CategoryForm />
      </div>
    </div>
  )
}