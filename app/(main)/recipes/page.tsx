import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { RecipeCard } from '@/components/RecipeCard'
import { Recipe } from '@/types/database'
import { RecipesSearch } from '@/components/RecipesSearch'

interface RecipesPageProps {
  searchParams: {
    search?: string
    tag?: string
    sort?: 'newest' | 'trending' | 'saved'
  }
}

async function getRecipes(searchParams: RecipesPageProps['searchParams']): Promise<Recipe[]> {
  const supabase = await createClient()
  let query = supabase.from('recipes').select('*')

  // Search filter
  if (searchParams.search) {
    query = query.or(
      `title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`
    )
  }

  // Tag filter
  if (searchParams.tag) {
    query = query.contains('tags', [searchParams.tag])
  }

  // Sorting
  if (searchParams.sort === 'trending') {
    query = query.order('views', { ascending: false })
  } else if (searchParams.sort === 'saved') {
    // For saved, we'd need to join with favorites table
    // For now, just sort by views as a proxy
    query = query.order('views', { ascending: false })
  } else {
    // Default: newest
    query = query.order('created_at', { ascending: false })
  }

  const { data } = await query.limit(50)

  return data || []
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const recipes = await getRecipes(searchParams)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">All Recipes</h1>
        <RecipesSearch initialSearch={searchParams.search} initialTag={searchParams.tag} initialSort={searchParams.sort} />
      </div>

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">No recipes found.</p>
          <p className="text-gray-500 mt-2">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  )
}
