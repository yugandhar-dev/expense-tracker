import { createClient } from '@/lib/supabase/server'

export default async function SimplePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Auth Error</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Not Authenticated</h1>
        <p>Please log in to access this page.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Simple Dashboard</h1>
      <div className="mt-4 space-y-2">
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
        <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
      </div>
      
      <div className="mt-6">
        <a 
          href="/dashboard/debug" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go to Debug Page
        </a>
      </div>
    </div>
  )
}