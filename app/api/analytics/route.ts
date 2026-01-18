import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
        setAll(cookiesToSet: { name: string; value: string; options: object }[]) {
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

function getAdminEmails(): string[] {
  const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || ''
  return emails.split(',').map((e) => e.trim()).filter(Boolean)
}

async function checkAdminAccess() {
  const supabase = await createSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return false
  }

  const adminEmails = getAdminEmails()
  return adminEmails.includes(user.email)
}

export async function GET(request: NextRequest) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const supabase = await createSupabaseClient()

  try {
    // Get total recipes
    const { count: recipeCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })

    // Get total subscribers
    const { count: subscriberCount } = await supabase
      .from('email_subscribers')
      .select('*', { count: 'exact', head: true })

    // Get total users (profiles)
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get total Pro subscriptions
    const { count: proCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get total views
    const { data: recipes } = await supabase
      .from('recipes')
      .select('views')

    const totalViews = recipes?.reduce((sum, recipe) => sum + (recipe.views || 0), 0) || 0

    // Get most viewed recipes (top 10)
    const { data: topRecipes } = await supabase
      .from('recipes')
      .select('id, title, views, is_pro')
      .order('views', { ascending: false })
      .limit(10)

    // Get Pro recipes count
    const { count: proRecipeCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('is_pro', true)

    // Get most popular tags
    const { data: allRecipes } = await supabase
      .from('recipes')
      .select('tags')

    const tagCounts: Record<string, number> = {}
    allRecipes?.forEach(recipe => {
      recipe.tags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const popularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    // Get recent recipes (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { count: recentRecipeCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    // Get total favorites
    const { count: favoriteCount } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      overview: {
        totalRecipes: recipeCount || 0,
        proRecipes: proRecipeCount || 0,
        totalViews: totalViews,
        totalSubscribers: subscriberCount || 0,
        totalUsers: userCount || 0,
        activeProSubscriptions: proCount || 0,
        totalFavorites: favoriteCount || 0,
        recentRecipes: recentRecipeCount || 0,
      },
      topRecipes: topRecipes || [],
      popularTags: popularTags || [],
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
