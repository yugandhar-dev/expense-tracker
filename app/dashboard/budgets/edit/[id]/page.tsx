import { BudgetForm } from '@/components/budgets/budget-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EditBudgetPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBudgetPage({ params }: EditBudgetPageProps) {
  const { id } = await params

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/budgets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Budgets
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Budget</h1>
          <p className="text-muted-foreground">
            Update budget details
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <BudgetForm budgetId={id} />
      </div>
    </div>
  )
}