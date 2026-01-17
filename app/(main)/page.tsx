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
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Viral recipes you can actually cook
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover trending recipes from social media, made simple with step-by-step instructions
          you can follow in your own kitchen.
        </p>
      </section>

      {/* Category Chips */}
      <section className="mb-12">
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/tag/${encodeURIComponent(category)}`}
              className="px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Recipes */}
      {trendingRecipes.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Trending Recipes</h2>
            <Link
              href="/recipes?sort=trending"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View all →
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
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Latest Recipes</h2>
            <Link
              href="/recipes?sort=newest"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View all →
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
