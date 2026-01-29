import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const MIN_VIEWS_THRESHOLD = 0 // Minimum views to be considered viral (0 = show all)
const MIN_RATING_THRESHOLD = 0 // Minimum average rating (0 = show all)
const BATCH_SIZE = 20 // Number of candidates to return per request

export async function GET(request: NextRequest) {
  // Get auth token from header
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    console.log('[Swipe Candidates] No auth token in header')
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
    error: authError,
  } = await supabase.auth.getUser()

  console.log('[Swipe Candidates] User from token:', user?.id, 'Error:', authError?.message)

  if (!user) {
    console.log('[Swipe Candidates] No user found from token')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if user has Pro subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    const isPro = !!subscription

    // Get recipes the user has already swiped
    const { data: swipedRecipes } = await supabase
      .from('recipe_swipes')
      .select('recipe_id')
      .eq('user_id', user.id)

    const swipedRecipeIds = swipedRecipes?.map((s) => s.recipe_id) || []

    // Build query for viral recipes
    let query = supabase
      .from('recipes')
      .select(
        `
        id,
        title,
        slug,
        description,
        cover_image_url,
        prep_minutes,
        cook_minutes,
        servings,
        tags,
        is_pro,
        views,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        fiber_g,
        sugar_g,
        sodium_mg,
        cholesterol_mg
      `
      )
      .gte('views', MIN_VIEWS_THRESHOLD)

    // If user is not Pro, exclude Pro recipes
    if (!isPro) {
      query = query.eq('is_pro', false)
    }

    // Exclude already swiped recipes
    if (swipedRecipeIds.length > 0) {
      query = query.not('id', 'in', `(${swipedRecipeIds.join(',')})`)
    }

    // Order by views (most viral first) and limit
    query = query.order('views', { ascending: false }).limit(BATCH_SIZE * 2) // Get more for filtering

    const { data: recipes, error } = await query

    if (error) {
      console.error('Error fetching candidate recipes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!recipes || recipes.length === 0) {
      return NextResponse.json({ candidates: [] })
    }

    // Get average ratings for these recipes
    const recipeIds = recipes.map((r) => r.id)
    const { data: ratings } = await supabase
      .from('ratings')
      .select('recipe_id, rating')
      .in('recipe_id', recipeIds)

    // Calculate average ratings
    const ratingMap = new Map<string, { total: number; count: number }>()
    ratings?.forEach((rating) => {
      const current = ratingMap.get(rating.recipe_id) || { total: 0, count: 0 }
      ratingMap.set(rating.recipe_id, {
        total: current.total + rating.rating,
        count: current.count + 1,
      })
    })

    // Filter recipes by minimum rating and add average rating
    const candidatesWithRatings = recipes
      .map((recipe) => {
        const ratingData = ratingMap.get(recipe.id)
        const avgRating = ratingData ? ratingData.total / ratingData.count : 0
        return {
          ...recipe,
          average_rating: avgRating,
          total_minutes: recipe.prep_minutes + recipe.cook_minutes,
        }
      })
      .filter((recipe) => recipe.average_rating >= MIN_RATING_THRESHOLD || recipe.average_rating === 0)
      .slice(0, BATCH_SIZE)

    // Shuffle the candidates for variety
    const shuffled = candidatesWithRatings.sort(() => Math.random() - 0.5)

    return NextResponse.json({ candidates: shuffled })
  } catch (error) {
    console.error('Error in swipe candidates API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
