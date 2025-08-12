import { redirect } from 'next/navigation'

export default function Home() {
  // Always redirect to login page on first load
  // The middleware will handle redirecting authenticated users to dashboard
  redirect('/auth/login')
}