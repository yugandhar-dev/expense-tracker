'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Transaction, Account, Category, Budget } from '@/lib/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  PieChart, 
  Pie, 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  Treemap,
  RadialBarChart,
  RadialBar
} from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths, parseISO, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Activity,
  CreditCard,
  PiggyBank,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Info,
  Filter,
  Download,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Zap,
  Shield,
  Star
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TransactionWithDetails extends Transaction {
  account: Account
  category: Category
}

interface BudgetWithCategory extends Budget {
  category: Category
  spent: number
  percentage: number
}

// Modern color palette
const CHART_COLORS = {
  primary: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#fbbf24', '#10b981', '#06b6d4'],
  gradient: {
    income: ['#10b981', '#34d399'],
    expense: ['#f43f5e', '#fb7185'],
    savings: ['#6366f1', '#818cf8'],
    warning: ['#f97316', '#fb923c']
  },
  semantic: {
    success: '#10b981',
    danger: '#f43f5e',
    warning: '#f97316',
    info: '#06b6d4'
  }
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AnalyticsContent() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('6months')
  const [viewMode, setViewMode] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Authentication required')
        return
      }

      // Calculate date range
      const endDate = endOfMonth(new Date())
      const startDate = dateRange === '12months' 
        ? subMonths(endDate, 11)
        : dateRange === '3months'
        ? subMonths(endDate, 2)
        : dateRange === '1month'
        ? subMonths(endDate, 0)
        : subMonths(endDate, 5)

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          account:accounts(*),
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true })

      if (transactionsError) throw transactionsError

      // Load budgets with spending
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id)

      if (budgetsError) throw budgetsError

      // Calculate budget spending
      const currentMonth = format(new Date(), 'yyyy-MM')
      const budgetsWithSpending = (budgetsData || []).map(budget => {
        const spent = (transactionsData || [])
          .filter(t => 
            t.category_id === budget.category_id && 
            t.type === 'expense' &&
            t.date.startsWith(currentMonth)
          )
          .reduce((sum, t) => sum + t.amount, 0)

        return {
          ...budget,
          spent,
          percentage: Math.min((spent / budget.monthly_limit) * 100, 100)
        }
      })

      setTransactions(transactionsData as any)
      setBudgets(budgetsWithSpending as any)
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadAnalyticsData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/15 border border-destructive/20 text-destructive rounded-lg p-4">
        <p className="font-semibold">Error loading analytics</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  // Process data for charts
  const monthlyTrend = processMonthlyTrend(transactions)
  const categoryBreakdown = processCategoryBreakdown(transactions)
  const accountPerformance = processAccountPerformance(transactions)
  const dailyPattern = processDailyPattern(transactions)
  const savingsRate = processSavingsRate(transactions)
  const expenseHeatmap = processExpenseHeatmap(transactions)
  const cashFlow = processCashFlow(transactions)

  // Calculate key metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netSavings = totalIncome - totalExpenses
  const savingsPercent = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

  const avgMonthlyIncome = totalIncome / (monthlyTrend.length || 1)
  const avgMonthlyExpenses = totalExpenses / (monthlyTrend.length || 1)

  // Get current month comparison
  const currentMonthData = monthlyTrend[monthlyTrend.length - 1] || { income: 0, expenses: 0 }
  const lastMonthData = monthlyTrend[monthlyTrend.length - 2] || { income: 0, expenses: 0 }
  
  const incomeChange = lastMonthData.income > 0 
    ? ((currentMonthData.income - lastMonthData.income) / lastMonthData.income) * 100 
    : 0

  const expenseChange = lastMonthData.expenses > 0 
    ? ((currentMonthData.expenses - lastMonthData.expenses) / lastMonthData.expenses) * 100 
    : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="detailed">Detailed Analysis</SelectItem>
              <SelectItem value="predictions">Predictions</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">This Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards with Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
            <div className="flex items-center gap-1 mt-2">
              <Badge variant={incomeChange >= 0 ? "default" : "destructive"} className="text-xs">
                {incomeChange >= 0 ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {formatPercent(incomeChange)}
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <div className="flex items-center gap-1 mt-2">
              <Badge variant={expenseChange <= 0 ? "default" : "destructive"} className="text-xs">
                {expenseChange >= 0 ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {formatPercent(expenseChange)}
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <PiggyBank className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", netSavings >= 0 ? "text-green-600" : "text-red-600")}>
              {formatCurrency(netSavings)}
            </div>
            <div className="mt-2">
              <Progress value={Math.abs(savingsPercent)} className="h-2" />
              <span className="text-xs text-muted-foreground mt-1">
                {savingsPercent.toFixed(1)}% savings rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {budgets.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">On Track</span>
                    <span className="text-sm font-bold">
                      {budgets.filter(b => b.percentage < 80).length}/{budgets.length}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {budgets.slice(0, 4).map((budget, i) => (
                      <div key={i} className="flex-1">
                        <Progress 
                          value={budget.percentage} 
                          className="h-1"
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No budgets set</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Area Chart */}
        <Card className="col-span-1 lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cash Flow Overview</CardTitle>
                <CardDescription>Income vs Expenses with running balance</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={cashFlow}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorIncome)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#f43f5e" 
                  fillOpacity={1} 
                  fill="url(#colorExpenses)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Spending Radar Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Spending Pattern Analysis</CardTitle>
            <CardDescription>Category distribution radar</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={categoryBreakdown.slice(0, 8)}>
                <PolarGrid className="stroke-muted/30" />
                <PolarAngleAxis dataKey="name" className="text-xs" />
                <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                <Radar 
                  name="Spending" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  fill="#6366f1" 
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Progress Radial */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
            <CardDescription>Current month budget status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="10%" 
                outerRadius="80%" 
                data={budgets.slice(0, 5).map((budget, index) => ({
                  ...budget,
                  fill: CHART_COLORS.primary[index % CHART_COLORS.primary.length]
                }))}
              >
                <RadialBar
                  dataKey="percentage"
                  cornerRadius={10}
                  fill="#6366f1"
                  label={{ position: 'insideStart', fill: '#fff' }}
                />
                <Legend />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Spending Heatmap */}
        <Card className="col-span-1 lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Spending Heatmap</CardTitle>
            <CardDescription>Daily spending intensity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyPattern}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  {dailyPattern.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.amount > avgMonthlyExpenses / 30 * 1.5 
                        ? CHART_COLORS.semantic.danger 
                        : entry.amount > avgMonthlyExpenses / 30 
                        ? CHART_COLORS.semantic.warning
                        : CHART_COLORS.semantic.success
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Account Performance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
            <CardDescription>Transaction volume by account</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={accountPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Savings Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Savings Rate Trend</CardTitle>
            <CardDescription>Monthly savings percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsRate}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10b981" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/5 to-blue-600/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Top Insight</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your highest spending category is <span className="font-semibold text-foreground">
                {categoryBreakdown[0]?.name || 'N/A'}
              </span> at {formatCurrency(categoryBreakdown[0]?.value || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/5 to-green-600/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <CardTitle className="text-sm">Achievement</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You saved <span className="font-semibold text-green-600">
                {formatCurrency(Math.max(0, netSavings))}
              </span> this period ({savingsPercent.toFixed(1)}% of income)
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500/5 to-orange-600/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm">Attention</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {budgets.filter(b => b.percentage > 80).length} budget{budgets.filter(b => b.percentage > 80).length !== 1 ? 's' : ''} 
              {' '}approaching limit this month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper functions for data processing
function processMonthlyTrend(transactions: TransactionWithDetails[]) {
  const monthlyMap = new Map<string, { income: number; expenses: number }>()

  transactions.forEach(t => {
    const monthKey = format(parseISO(t.date), 'MMM yyyy')
    const current = monthlyMap.get(monthKey) || { income: 0, expenses: 0 }
    
    if (t.type === 'income') {
      current.income += t.amount
    } else {
      current.expenses += t.amount
    }
    
    monthlyMap.set(monthKey, current)
  })

  return Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    income: Math.round(data.income),
    expenses: Math.round(data.expenses),
  }))
}

function processCategoryBreakdown(transactions: TransactionWithDetails[]) {
  const categoryMap = new Map<string, number>()

  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const current = categoryMap.get(t.category.name) || 0
      categoryMap.set(t.category.name, current + t.amount)
    })

  return Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
}

function processAccountPerformance(transactions: TransactionWithDetails[]) {
  const accountMap = new Map<string, { income: number; expenses: number }>()

  transactions.forEach(t => {
    const current = accountMap.get(t.account.name) || { income: 0, expenses: 0 }
    
    if (t.type === 'income') {
      current.income += t.amount
    } else {
      current.expenses += t.amount
    }
    
    accountMap.set(t.account.name, current)
  })

  return Array.from(accountMap.entries()).map(([name, data]) => ({
    name,
    income: Math.round(data.income),
    expenses: Math.round(data.expenses),
    net: Math.round(data.income - data.expenses)
  }))
}

function processDailyPattern(transactions: TransactionWithDetails[]) {
  const last30Days = transactions
    .filter(t => {
      const date = parseISO(t.date)
      const thirtyDaysAgo = subMonths(new Date(), 1)
      return date >= thirtyDaysAgo
    })

  const dailyMap = new Map<string, number>()

  last30Days
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const dateKey = format(parseISO(t.date), 'MM/dd')
      const current = dailyMap.get(dateKey) || 0
      dailyMap.set(dateKey, current + t.amount)
    })

  return Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount: Math.round(amount) }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function processSavingsRate(transactions: TransactionWithDetails[]) {
  const monthlyMap = new Map<string, { income: number; expenses: number }>()

  transactions.forEach(t => {
    const monthKey = format(parseISO(t.date), 'MMM yyyy')
    const current = monthlyMap.get(monthKey) || { income: 0, expenses: 0 }
    
    if (t.type === 'income') {
      current.income += t.amount
    } else {
      current.expenses += t.amount
    }
    
    monthlyMap.set(monthKey, current)
  })

  return Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    rate: data.income > 0 ? Math.round(((data.income - data.expenses) / data.income) * 100) : 0,
    target: 20 // 20% savings target
  }))
}

function processExpenseHeatmap(transactions: TransactionWithDetails[]) {
  // Process last 30 days of expenses
  const heatmapData: any[] = []
  const endDate = new Date()
  const startDate = subMonths(endDate, 1)

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
  
  dateRange.forEach(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayExpenses = transactions
      .filter(t => t.date === dateStr && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    heatmapData.push({
      date: format(date, 'MM/dd'),
      day: format(date, 'EEE'),
      amount: Math.round(dayExpenses)
    })
  })

  return heatmapData
}

function processCashFlow(transactions: TransactionWithDetails[]) {
  const monthlyMap = new Map<string, { income: number; expenses: number }>()

  transactions.forEach(t => {
    const monthKey = format(parseISO(t.date), 'MMM yyyy')
    const current = monthlyMap.get(monthKey) || { income: 0, expenses: 0 }
    
    if (t.type === 'income') {
      current.income += t.amount
    } else {
      current.expenses += t.amount
    }
    
    monthlyMap.set(monthKey, current)
  })

  let runningBalance = 0
  return Array.from(monthlyMap.entries()).map(([date, data]) => {
    runningBalance += (data.income - data.expenses)
    return {
      date,
      income: Math.round(data.income),
      expenses: Math.round(data.expenses),
      balance: Math.round(runningBalance)
    }
  })
}