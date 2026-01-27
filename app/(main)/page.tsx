import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RecipeCard } from '@/components/RecipeCard'
import { EmailCapture } from '@/components/EmailCapture'
import { Recipe } from '@/types/database'

const CATEGORIES = [
  'Airfryer',
  'High Protein',
  'Budget',
  'Dessert',
  '15-Min',
  'Chicken',
  'Pasta',
]

async function getTrendingRecipes(): Promise<Recipe[]> {
  const supabase = await createClient()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('views', { ascending: false })
    .limit(6)

  if (error || !data) {
    // Fallback to all-time if no recent recipes
    const { data: fallbackData } = await supabase
      .from('recipes')
      .select('*')
      .order('views', { ascending: false })
      .limit(6)
    return fallbackData || []
  }

  return data
}

async function getLatestRecipes(): Promise<Recipe[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  return data || []
}

export default async function HomePage() {
  const trendingRecipes = await getTrendingRecipes()
  const latestRecipes = await getLatestRecipes()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-orange-50 to-emerald-50 opacity-50 rounded-3xl -z-10"></div>
        <div className="relative py-16 px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-orange-500 bg-clip-text text-transparent">
            Viral recipes you can actually cook
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Discover trending recipes from social media, made simple with step-by-step instructions
            you can follow in your own kitchen.
          </p>
        </div>
      </section>

      {/* Category Chips */}
      <section className="mb-16">
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/tag/${encodeURIComponent(category)}`}
              className="px-6 py-3 bg-white rounded-full border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-md transition-all duration-300 font-medium text-sm"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Recipes */}
      {trendingRecipes.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Trending Recipes</h2>
            <Link
              href="/recipes?sort=trending"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors flex items-center gap-1 group"
            >
              View all
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Recipes */}
      {latestRecipes.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Latest Recipes</h2>
            <Link
              href="/recipes?sort=newest"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors flex items-center gap-1 group"
            >
              View all
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}

      {/* Email Capture */}
      <section className="mb-16">
        <EmailCapture />
      </section>

      {/* Empty State */}
      {trendingRecipes.length === 0 && latestRecipes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 mb-4">No recipes yet.</p>
          <p className="text-gray-500">
            <Link href="/admin" className="text-orange-600 hover:text-orange-700">
              Add your first recipe
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
