import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { type Database } from '@/lib/types/database'

export type TypedSupabaseClient = ReturnType<typeof createBrowserClient<Database>>
export type TypedSupabaseServerClient = ReturnType<typeof createServerClient<Database>>