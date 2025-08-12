'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  CreditCard, 
  DollarSign, 
  Home, 
  PieChart, 
  Settings, 
  Tags,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'
import { LogoutButton } from './logout-button'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Transactions',
    href: '/dashboard/transactions',
    icon: DollarSign,
  },
  {
    name: 'Accounts',
    href: '/dashboard/accounts',
    icon: CreditCard,
  },
  {
    name: 'Categories',
    href: '/dashboard/categories',
    icon: Tags,
  },
  {
    name: 'Budgets',
    href: '/dashboard/budgets',
    icon: Target,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <PieChart className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">FinanceTracker</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center space-x-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname?.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Actions */}
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <LogoutButton size="sm" />
      </div>
    </div>
  )
}