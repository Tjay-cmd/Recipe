'use server'

import { createClient } from '@/lib/supabase/server'

export async function incrementRecipeViews(recipeId: string) {
  try {
    const supabase = await createClient()
    
    // Use the database function that bypasses RLS
    // This works for both authenticated and unauthenticated users
    const { error } = await supabase.rpc('increment_recipe_views', {
      recipe_id: recipeId
    })
    
    // If the function doesn't exist yet (migration not run), fall back to direct update
    // This handles the case where the migration hasn't been applied
    if (error && error.message?.includes('function') && error.message?.includes('does not exist')) {
      // Fallback: Try direct update (will work for authenticated users only)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Only try direct update for authenticated users
        const { data: current } = await supabase
          .from('recipes')
          .select('views')
          .eq('id', recipeId)
          .single()

        if (current) {
          await supabase
            .from('recipes')
            .update({ views: (current.views || 0) + 1 })
            .eq('id', recipeId)
        }
      }
      // For unauthenticated users, silently fail if function doesn't exist
      return
    }
    
    // Log other errors but don't throw - views incrementing is not critical
    if (error) {
      console.error('Error incrementing recipe views:', error)
    }
  } catch (error) {
    // Silently handle any errors - don't break the page for users
    // Views incrementing is not critical functionality
    console.error('Error in incrementRecipeViews:', error)
  }
}
