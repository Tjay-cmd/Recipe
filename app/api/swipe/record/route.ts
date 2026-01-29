import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const swipeSchema = z.object({
  recipeId: z.string().uuid(),
  preference: z.enum(['like', 'dislike', 'skip']),
  addToFavorites: z.boolean().optional().default(true), // Auto-add likes to favorites
})

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      cookies: {},
    }
  )
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { recipeId, preference, addToFavorites } = swipeSchema.parse(body)

    // Map preference string to numeric value
    const preferenceValue = preference === 'like' ? 1 : preference === 'dislike' ? -1 : 0

    // Upsert the swipe preference
    const { error: swipeError } = await supabase.from('recipe_swipes').upsert(
      {
        user_id: user.id,
        recipe_id: recipeId,
        preference: preferenceValue,
      },
      {
        onConflict: 'user_id,recipe_id',
      }
    )

    if (swipeError) {
      console.error('Error recording swipe:', swipeError)
      return NextResponse.json({ error: swipeError.message }, { status: 400 })
    }

    // If preference is 'like' and addToFavorites is true, also add to favorites
    if (preference === 'like' && addToFavorites) {
      // Check if already in favorites
      const { data: existingFavorite } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .maybeSingle()

      if (!existingFavorite) {
        const { error: favoriteError } = await supabase.from('favorites').insert({
          user_id: user.id,
          recipe_id: recipeId,
        })

        if (favoriteError) {
          console.error('Error adding to favorites:', favoriteError)
          // Don't fail the request if favorite fails, just log it
        }
      }
    }

    // Get total swipe count for this user
    const { count } = await supabase
      .from('recipe_swipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      total_swipes: count || 0,
      added_to_favorites: preference === 'like' && addToFavorites,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error in swipe record API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
