import { createClient } from '@/lib/supabase/server'

export async function setupNewUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // Check if user already has categories
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  // If user already has categories, don't set up again
  if (existingCategories && existingCategories.length > 0) {
    return
  }

  // Call the function to copy default categories
  const { error } = await supabase.rpc('copy_default_categories_for_user', {
    user_uuid: user.id
  })

  if (error) {
    console.error('Error setting up user categories:', error)
  }
}