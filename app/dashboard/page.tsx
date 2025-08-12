import { getDashboardData } from '@/lib/queries/dashboard'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SpendingByCategoryChart } from '@/components/charts/spending-by-category-chart'
import { SpendingByAccountChart } from '@/components/charts/spending-by-account-chart'
import { IncomeExpenseChart } from '@/components/charts/income-expense-chart'
import { RecentTransactions } from '@/components/recent-transactions'
import { 
  TrendingUp, 
 
  DollarSign, 
  CreditCard, 
  PiggyBank,
  AlertTriangle
} from 'lucide-react'

export default async function DashboardPage() {
  try {
    const data = await getDashboardData()

    if (!data) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-muted-foreground">Welcome!</h2>
            <p className="text-muted-foreground mt-2">Please log in to view your dashboard.</p>
          </div>
        </div>
      )
    }

  const {
    currentMonth,
    lastMonth,
    accounts,
    spendingByCategory,
    spendingByAccount,
    necessaryExpenses,
    unnecessaryExpenses,
    recentTransactions,
    totalBalance
  } = data

  // Calculate month-over-month changes
  const incomeChange = lastMonth.income > 0 
    ? ((currentMonth.income - lastMonth.income) / lastMonth.income) * 100 
    : 0
  const expenseChange = lastMonth.expenses > 0 
    ? ((currentMonth.expenses - lastMonth.expenses) / lastMonth.expenses) * 100 
    : 0

  // Prepare chart data
  const categoryChartData = Object.entries(spendingByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
    fill: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
  }))

  const accountChartData = Object.entries(spendingByAccount).map(([account, amount]) => ({
    name: account,
    amount: amount
  }))

  const necessityData = [
    {
      name: 'Necessary',
      value: necessaryExpenses,
      fill: 'hsl(var(--chart-1))'
    },
    {
      name: 'Unnecessary', 
      value: unnecessaryExpenses,
      fill: 'hsl(var(--chart-2))'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your personal finance overview
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Across {accounts?.length || 0} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonth.income)}</div>
            <p className={`text-xs ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonth.expenses)}</div>
            <p className={`text-xs ${expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentMonth.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(currentMonth.net)}
            </div>
            <p className="text-xs text-muted-foreground">
              Income minus expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Your expenses broken down by category this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <SpendingByCategoryChart data={categoryChartData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No expenses this month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Account</CardTitle>
            <CardDescription>
              Expenses by account this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accountChartData.length > 0 ? (
              <SpendingByAccountChart data={accountChartData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No expenses this month
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Necessary vs Unnecessary</CardTitle>
            <CardDescription>
              Breakdown of essential vs non-essential spending
            </CardDescription>
          </CardHeader>
          <CardContent>
            {necessityData.some(d => d.value > 0) ? (
              <IncomeExpenseChart data={necessityData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No expenses this month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest financial activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={recentTransactions} />
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {currentMonth.net < 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Budget Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 dark:text-orange-300">
              You&apos;re spending more than you&apos;re earning this month. 
              Consider reviewing your expenses or increasing your income.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Dashboard Error</h2>
          <p className="text-muted-foreground mt-2">
            There was an issue loading your dashboard. Please try refreshing the page.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            If this persists, try visiting <a href="/dashboard/debug" className="text-primary underline">/dashboard/debug</a> for more information.
          </p>
        </div>
      </div>
    )
  }
}