import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function AuthDebugPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  let user = null
  let session = null
  let error = null

  try {
    const { data, error: authError } = await supabase.auth.getUser()
    user = data.user
    error = authError?.message

    const { data: sessionData } = await supabase.auth.getSession()
    session = sessionData.session
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error'
  }

  const allCookies = cookieStore.getAll()
  const authCookies = allCookies.filter(cookie => 
    cookie.name.includes('supabase') || cookie.name.includes('sb-') || 
    cookie.name.includes('auth-token')
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Info</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">User Object</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Session Object</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Auth Cookies</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(authCookies, null, 2)}
          </pre>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Environment</h2>
          <div className="text-sm">
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p><strong>Site URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL}</p>
          </div>
        </div>
      </div>
    </div>
  )
}