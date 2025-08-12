import Link from 'next/link'
import { resetPassword } from '../actions'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Personal Finance Tracker
          </h1>
          <h2 className="mt-6 text-2xl font-bold text-foreground">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" action={resetPassword}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          {params?.error && (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive rounded-md p-3">
              <p className="text-sm">{params.error}</p>
            </div>
          )}

          {params?.success && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3">
              <p className="text-sm">{params.success}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              Send reset link
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-primary hover:text-primary/90"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}