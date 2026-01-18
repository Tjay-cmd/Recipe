import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const recipeSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  cover_image_url: z.string().url().optional().nullable(),
  ingredients: z.array(z.string()).min(1),
  steps: z.array(z.string()).min(1),
  prep_minutes: z.number().int().min(0).default(0),
  cook_minutes: z.number().int().min(0).default(0),
  servings: z.number().int().min(1).default(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().nullable(),
  tags: z.array(z.string()).default([]),
  is_pro: z.boolean().default(false),
})

function getAdminEmails(): string[] {
  const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || ''
  return emails.split(',').map((e) => e.trim()).filter(Boolean)
}

async function createSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}

async function checkAdminAccess() {
  const supabase = await createSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('=== ADMIN CHECK DEBUG ===')
  console.log('User:', user?.email)
  console.log('Admin Emails:', getAdminEmails())
  console.log('Is Admin:', user && user.email && getAdminEmails().includes(user.email))

  if (!user || !user.email) {
    return false
  }

  const adminEmails = getAdminEmails()
  return adminEmails.includes(user.email)
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseClient()
  const searchParams = request.nextUrl.searchParams

  let query = supabase.from('recipes').select('*')

  // Search filter
  const search = searchParams.get('search')
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Tag filter
  const tag = searchParams.get('tag')
  if (tag) {
    query = query.contains('tags', [tag])
  }

  // Difficulty filter
  const difficulty = searchParams.get('difficulty')
  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  // Sorting
  const sort = searchParams.get('sort') || 'newest'
  if (sort === 'trending') {
    query = query.order('views', { ascending: false })
  } else if (sort === 'time_asc') {
    // Sort by total time ascending (prep + cook)
    query = query.order('prep_minutes', { ascending: true })
    query = query.order('cook_minutes', { ascending: true })
  } else if (sort === 'time_desc') {
    // Sort by total time descending
    query = query.order('prep_minutes', { ascending: false })
    query = query.order('cook_minutes', { ascending: false })
  } else {
    // 'newest' or 'rating' (rating will be calculated after fetch)
    query = query.order('created_at', { ascending: false })
  }

  // Pagination (fetch more if we need to filter/sort)
  const limit = parseInt(searchParams.get('limit') || '50')
  const maxTime = searchParams.get('max_time')
  const needsPostProcessing = maxTime || sort === 'rating'
  
  // Fetch more recipes if we need to filter/sort in memory
  query = query.limit(needsPostProcessing ? limit * 2 : limit)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let recipes = data || []

  // Apply max_time filter if needed
  if (maxTime) {
    const maxMinutes = parseInt(maxTime)
    recipes = recipes.filter(recipe => (recipe.prep_minutes || 0) + (recipe.cook_minutes || 0) <= maxMinutes)
  }

  // Sort by rating if needed (calculate average ratings)
  if (sort === 'rating') {
    // Get ratings for all recipes
    const recipeIds = recipes.map(r => r.id)
    
    if (recipeIds.length > 0) {
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('recipe_id, rating')
        .in('recipe_id', recipeIds)

      // Calculate average rating per recipe
      const ratingsMap: Record<string, { sum: number; count: number }> = {}
      ratingsData?.forEach(rating => {
        if (!ratingsMap[rating.recipe_id]) {
          ratingsMap[rating.recipe_id] = { sum: 0, count: 0 }
        }
        ratingsMap[rating.recipe_id].sum += rating.rating
        ratingsMap[rating.recipe_id].count += 1
      })

      // Sort recipes by average rating
      recipes = recipes.sort((a, b) => {
        const aRating = ratingsMap[a.id] ? ratingsMap[a.id].sum / ratingsMap[a.id].count : 0
        const bRating = ratingsMap[b.id] ? ratingsMap[b.id].sum / ratingsMap[b.id].count : 0
        return bRating - aRating
      })
    }
  }

  // Limit after filtering/sorting
  recipes = recipes.slice(0, limit)

  return NextResponse.json({ recipes })
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validatedData = recipeSchema.parse(body)

    const supabase = await createSupabaseClient()
    const { data, error } = await supabase
      .from('recipes')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ recipe: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
