import { createClient } from '@/lib/supabase/server'

export default async function DebugPage() {
  const supabase = await createClient()
  
  try {
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">User Error</h1>
          <pre className="mt-4 p-4 bg-gray-100 rounded">{JSON.stringify(userError, null, 2)}</pre>
        </div>
      )
    }
    
    if (!user) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">No User Found</h1>
          <p>User is not authenticated</p>
        </div>
      )
    }

    // Try to fetch accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')

    // Try to fetch categories  
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')

    // Try to fetch transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .limit(5)

    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">Debug Dashboard</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">User Info</h2>
            <div className="p-4 bg-gray-100 rounded">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Accounts</h2>
            {accountsError ? (
              <div className="p-4 bg-red-100 rounded text-red-700">
                <strong>Error:</strong> {accountsError.message}
              </div>
            ) : (
              <div className="p-4 bg-gray-100 rounded">
                <p><strong>Count:</strong> {accounts?.length || 0}</p>
                <pre className="mt-2 text-sm">{JSON.stringify(accounts, null, 2)}</pre>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold">Categories</h2>
            {categoriesError ? (
              <div className="p-4 bg-red-100 rounded text-red-700">
                <strong>Error:</strong> {categoriesError.message}
              </div>
            ) : (
              <div className="p-4 bg-gray-100 rounded">
                <p><strong>Count:</strong> {categories?.length || 0}</p>
                <pre className="mt-2 text-sm overflow-auto max-h-40">{JSON.stringify(categories, null, 2)}</pre>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold">Transactions</h2>
            {transactionsError ? (
              <div className="p-4 bg-red-100 rounded text-red-700">
                <strong>Error:</strong> {transactionsError.message}
              </div>
            ) : (
              <div className="p-4 bg-gray-100 rounded">
                <p><strong>Count:</strong> {transactions?.length || 0}</p>
                <pre className="mt-2 text-sm overflow-auto max-h-40">{JSON.stringify(transactions, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Unexpected Error</h1>
        <pre className="mt-4 p-4 bg-gray-100 rounded">{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }
}