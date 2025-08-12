import { AccountForm } from '@/components/accounts/account-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EditAccountPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const { id } = await params

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/accounts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Accounts
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Account</h1>
          <p className="text-muted-foreground">
            Update account details
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <AccountForm accountId={id} />
      </div>
    </div>
  )
}