'use server'

import { createClient } from '@/lib/supabase/server'

export async function incrementRecipeViews(recipeId: string) {
  const supabase = await createClient()
  
  // Use RPC function if available, otherwise fetch and update
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
