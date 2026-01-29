import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const DEFAULT_LIMIT = 10 // Number of recommendations to return
const RECENT_LIKES_WINDOW = 50 // Consider last N likes for personalization

type RecipeQueryResult = {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  prep_minutes: number | null
  cook_minutes: number | null
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard' | null
  tags: string[] | null
  is_pro: boolean
  views: number
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  sugar_g: number | null
  sodium_mg: number | null
  cholesterol_mg: number | null
}

export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT))

    // Check if user has Pro subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    const isPro = !!subscription

    // Get user's recent liked swipes
    const { data: likedSwipes } = await supabase
      .from('recipe_swipes')
      .select('recipe_id')
      .eq('user_id', user.id)
      .eq('preference', 1) // 1 = like
      .order('created_at', { ascending: false })
      .limit(RECENT_LIKES_WINDOW)

    if (!likedSwipes || likedSwipes.length === 0) {
      // User hasn't liked anything yet, return popular recipes
      return getPopularRecipes(supabase, isPro, limit)
    }

    const likedRecipeIds = likedSwipes.map((s) => s.recipe_id)

    // Get the liked recipes to extract tags and attributes
    const { data: likedRecipes } = await supabase
      .from('recipes')
      .select('tags, difficulty, prep_minutes, cook_minutes')
      .in('id', likedRecipeIds)

    if (!likedRecipes || likedRecipes.length === 0) {
      return getPopularRecipes(supabase, isPro, limit)
    }

    // Build tag frequency map
    const tagFrequency = new Map<string, number>()
    const difficultyFrequency = new Map<string, number>()
    let totalPrepTime = 0
    let totalCookTime = 0

    likedRecipes.forEach((recipe) => {
      recipe.tags?.forEach((tag: string) => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1)
      })
      if (recipe.difficulty) {
        difficultyFrequency.set(recipe.difficulty, (difficultyFrequency.get(recipe.difficulty) || 0) + 1)
      }
      totalPrepTime += recipe.prep_minutes || 0
      totalCookTime += recipe.cook_minutes || 0
    })

    // Get top tags (appear in at least 2 liked recipes or top 5 most frequent)
    const topTags = Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)

    const avgTotalTime = (totalPrepTime + totalCookTime) / likedRecipes.length
    const preferredDifficulty = Array.from(difficultyFrequency.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]

    // Get all swiped recipe IDs to exclude
    const { data: allSwipes } = await supabase
      .from('recipe_swipes')
      .select('recipe_id')
      .eq('user_id', user.id)

    const swipedRecipeIds = allSwipes?.map((s) => s.recipe_id) || []

    // Build recommendation query
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
        difficulty,
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

    // Exclude Pro recipes for non-Pro users
    if (!isPro) {
      query = query.eq('is_pro', false)
    }

    // Exclude already swiped recipes
    if (swipedRecipeIds.length > 0) {
      query = query.not('id', 'in', `(${swipedRecipeIds.join(',')})`)
    }

    // Get a larger pool to filter and rank
    query = query.limit(100)

    const { data: candidateRecipes, error } = await query

    if (error) {
      console.error('Error fetching recommendation candidates:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!candidateRecipes || candidateRecipes.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    // Score each recipe based on similarity to user preferences
    const scoredRecipes = candidateRecipes.map((recipe: RecipeQueryResult) => {
      let score = 0

      // Tag overlap score (highest weight)
      const recipeTags = recipe.tags || []
      const tagOverlap = recipeTags.filter((tag: string) => topTags.includes(tag)).length
      score += tagOverlap * 10

      // Difficulty preference score
      if (recipe.difficulty === preferredDifficulty) {
        score += 5
      }

      // Time preference score (prefer recipes within 30% of average)
      const recipeTime = (recipe.prep_minutes || 0) + (recipe.cook_minutes || 0)
      const timeDiff = Math.abs(recipeTime - avgTotalTime)
      const timeScore = Math.max(0, 5 - (timeDiff / avgTotalTime) * 5)
      score += timeScore

      // Popularity boost (views and viral appeal)
      score += Math.log10(recipe.views + 1) * 2

      return {
        ...recipe,
        recommendation_score: score,
        total_minutes: recipeTime,
      }
    })

    // Sort by score and return top recommendations
    const recommendations = scoredRecipes.sort((a, b) => b.recommendation_score - a.recommendation_score).slice(0, limit)

    // Get average ratings for recommendations
    const recipeIds = recommendations.map((r) => r.id)
    const { data: ratings } = await supabase.from('ratings').select('recipe_id, rating').in('recipe_id', recipeIds)

    const ratingMap = new Map<string, { total: number; count: number }>()
    ratings?.forEach((rating) => {
      const current = ratingMap.get(rating.recipe_id) || { total: 0, count: 0 }
      ratingMap.set(rating.recipe_id, {
        total: current.total + rating.rating,
        count: current.count + 1,
      })
    })

    const recommendationsWithRatings = recommendations.map((recipe: RecipeQueryResult & { recommendation_score?: number; total_minutes?: number }) => {
      const ratingData = ratingMap.get(recipe.id)
      const avgRating = ratingData ? ratingData.total / ratingData.count : 0
      return {
        ...recipe,
        average_rating: avgRating,
      }
    })

    return NextResponse.json({
      recommendations: recommendationsWithRatings,
      personalization_data: {
        top_tags: topTags,
        preferred_difficulty: preferredDifficulty,
        avg_time_minutes: Math.round(avgTotalTime),
      },
    })
  } catch (error) {
    console.error('Error in swipe recommendations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Fallback function to get popular recipes when user has no likes
async function getPopularRecipes(supabase: any, isPro: boolean, limit: number) {
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
      difficulty,
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
    .order('views', { ascending: false })

  if (!isPro) {
    query = query.eq('is_pro', false)
  }

  query = query.limit(limit)

  const { data: recipes, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const recipesWithMetadata = (recipes || []).map((recipe: RecipeQueryResult) => ({
    ...recipe,
    total_minutes: (recipe.prep_minutes || 0) + (recipe.cook_minutes || 0),
    average_rating: 0,
  }))

  return NextResponse.json({
    recommendations: recipesWithMetadata,
    personalization_data: {
      top_tags: [],
      preferred_difficulty: null,
      avg_time_minutes: 0,
    },
  })
}
