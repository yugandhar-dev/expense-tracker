import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateForInput(date: string | Date): string {
  return new Date(date).toISOString().split('T')[0]
}

export const ACCOUNT_TYPES = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  investment: 'Investment',
  other: 'Other',
} as const

export const TRANSACTION_TYPES = {
  income: 'Income',
  expense: 'Expense',
} as const

export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', color: '#ef4444' },
  { name: 'Transportation', color: '#f97316' },
  { name: 'Shopping', color: '#eab308' },
  { name: 'Entertainment', color: '#22c55e' },
  { name: 'Bills & Utilities', color: '#3b82f6' },
  { name: 'Healthcare', color: '#8b5cf6' },
  { name: 'Education', color: '#ec4899' },
  { name: 'Travel', color: '#06b6d4' },
  { name: 'Income', color: '#10b981' },
  { name: 'Other', color: '#6b7280' },
]