'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface AnalyticsData {
  overview: {
    totalRecipes: number
    proRecipes: number
    totalViews: number
    totalSubscribers: number
    totalUsers: number
    activeProSubscriptions: number
    totalFavorites: number
    recentRecipes: number
  }
  topRecipes: Array<{
    id: string
    title: string
    slug: string
    views: number
    is_pro: boolean
  }>
  popularTags: Array<{
    tag: string
    count: number
  }>
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
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
        .select('views, slug')

      const totalViews = recipes?.reduce((sum, recipe) => sum + (recipe.views || 0), 0) || 0

      // Get most viewed recipes (top 10)
      const { data: topRecipes } = await supabase
        .from('recipes')
        .select('id, title, slug, views, is_pro')
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

      setData({
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { overview, topRecipes, popularTags } = data

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Recipes"
          value={overview.totalRecipes}
          subtitle={`${overview.proRecipes} Pro recipes`}
          icon="📝"
        />
        <StatCard
          title="Total Views"
          value={overview.totalViews.toLocaleString()}
          subtitle="All recipes combined"
          icon="👁️"
        />
        <StatCard
          title="Email Subscribers"
          value={overview.totalSubscribers.toLocaleString()}
          subtitle={`${overview.recentRecipes} new recipes this week`}
          icon="📧"
        />
        <StatCard
          title="Active Pro Users"
          value={overview.activeProSubscriptions}
          subtitle={`${overview.totalUsers} total users`}
          icon="⭐"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Favorites"
          value={overview.totalFavorites.toLocaleString()}
          subtitle="Recipes saved by users"
          icon="❤️"
          size="small"
        />
        <StatCard
          title="Free Recipes"
          value={(overview.totalRecipes - overview.proRecipes).toLocaleString()}
          subtitle="Publicly available"
          icon="🔓"
          size="small"
        />
        <StatCard
          title="Pro Recipes"
          value={overview.proRecipes.toLocaleString()}
          subtitle="Pro subscription only"
          icon="💎"
          size="small"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Recipes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Most Viewed Recipes</h2>
          {topRecipes.length > 0 ? (
            <div className="space-y-3">
              {topRecipes.map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {recipe.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {recipe.views.toLocaleString()} views
                        {recipe.is_pro && (
                          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                            Pro
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    className="flex-shrink-0 text-emerald-600 hover:text-emerald-700 text-sm font-medium ml-4"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recipes yet</p>
          )}
        </div>

        {/* Popular Tags */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Popular Tags</h2>
          {popularTags.length > 0 ? (
            <div className="space-y-3">
              {popularTags.map(({ tag, count }, index) => (
                <div
                  key={tag}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                    <Link
                      href={`/tag/${encodeURIComponent(tag)}`}
                      className="font-medium text-gray-900 hover:text-emerald-600 transition-colors"
                    >
                      #{tag}
                    </Link>
                  </div>
                  <span className="text-sm text-gray-500">{count} recipes</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No tags yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: string
  size?: 'normal' | 'small'
}

function StatCard({ title, value, subtitle, icon, size = 'normal' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold text-gray-700 ${size === 'small' ? 'text-sm' : ''}`}>
          {title}
        </h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`font-bold text-gray-900 mb-1 ${size === 'small' ? 'text-2xl' : 'text-3xl'}`}>
        {value}
      </p>
      <p className={`text-gray-500 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
        {subtitle}
      </p>
    </div>
  )
}
