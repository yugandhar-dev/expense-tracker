'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: result, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error.message)
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  if (!result.user) {
    redirect('/auth/login?error=Login failed - no user returned')
  }

  console.log('Login successful for user:', result.user.email)
  
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/auth/signup?error=Could not create account')
  }

  revalidatePath('/', 'layout')
  redirect('/auth/signup?success=Check your email to confirm your account')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    redirect('/auth/forgot-password?error=Could not send reset email')
  }

  redirect('/auth/forgot-password?success=Check your email for reset instructions')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    redirect('/auth/reset-password?error=Could not update password')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard?success=Password updated successfully')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}