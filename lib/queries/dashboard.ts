import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Set up default categories for new users
  try {
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (!existingCategories || existingCategories.length === 0) {
      // Copy default categories for new user
      await (supabase as any).rpc('copy_default_categories_for_user', {
        user_uuid: user.id
      })
    }
  } catch (error) {
    console.error('Error setting up user categories:', error)
    // Continue anyway, don't fail the whole function
  }

  const now = new Date()
  const currentMonthStart = startOfMonth(now)
  const currentMonthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  // Get current month transactions
  const { data: currentMonthTransactions } = await supabase
    .from('transactions')
    .select('*, categories(name, color), accounts(name, type)')
    .gte('date', format(currentMonthStart, 'yyyy-MM-dd'))
    .lte('date', format(currentMonthEnd, 'yyyy-MM-dd'))
    .order('date', { ascending: false })

  // Get last month transactions for comparison
  const { data: lastMonthTransactions } = await supabase
    .from('transactions')
    .select('amount, type')
    .gte('date', format(lastMonthStart, 'yyyy-MM-dd'))
    .lte('date', format(lastMonthEnd, 'yyyy-MM-dd'))

  // Get accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .order('name')

  // Get budgets with categories
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, categories(name, color)')

  // Calculate totals
  const currentMonthIncome = currentMonthTransactions
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const currentMonthExpenses = currentMonthTransactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const lastMonthIncome = lastMonthTransactions
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const lastMonthExpenses = lastMonthTransactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  // Calculate spending by category
  const spendingByCategory = currentMonthTransactions
    ?.filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = (transaction.categories as any)?.[0]?.name || 'Other'
      const color = (transaction.categories as any)?.[0]?.color || '#6b7280'
      acc[category] = (acc[category] || 0) + Number(transaction.amount)
      return acc
    }, {} as Record<string, number>) || {}

  // Calculate spending by account
  const spendingByAccount = currentMonthTransactions
    ?.filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const account = (transaction.accounts as any)?.[0]?.name || 'Unknown'
      acc[account] = (acc[account] || 0) + Number(transaction.amount)
      return acc
    }, {} as Record<string, number>) || {}

  // Calculate necessary vs unnecessary expenses
  const necessaryExpenses = currentMonthTransactions
    ?.filter(t => t.type === 'expense' && t.is_necessary)
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const unnecessaryExpenses = currentMonthTransactions
    ?.filter(t => t.type === 'expense' && !t.is_necessary)
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  // Get recent transactions
  const recentTransactions = currentMonthTransactions?.slice(0, 5) || []

  return {
    currentMonth: {
      income: currentMonthIncome,
      expenses: currentMonthExpenses,
      net: currentMonthIncome - currentMonthExpenses
    },
    lastMonth: {
      income: lastMonthIncome,
      expenses: lastMonthExpenses,
      net: lastMonthIncome - lastMonthExpenses
    },
    accounts,
    budgets,
    spendingByCategory,
    spendingByAccount,
    necessaryExpenses,
    unnecessaryExpenses,
    recentTransactions,
    totalBalance: accounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0
  }
}