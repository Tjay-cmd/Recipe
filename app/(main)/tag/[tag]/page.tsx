import { createClient } from '@/lib/supabase/server'
import { RecipeCard } from '@/components/RecipeCard'
import { Recipe } from '@/types/database'
import { notFound } from 'next/navigation'

interface TagPageProps {
  params: {
    tag: string
  }
}

async function getRecipesByTag(tag: string): Promise<Recipe[]> {
  const supabase = await createClient()
  const decodedTag = decodeURIComponent(tag)
  
  const { data } = await supabase
    .from('recipes')
    .select('*')
    .contains('tags', [decodedTag])
    .order('created_at', { ascending: false })

  return data || []
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag)
  const recipes = await getRecipesByTag(tag)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 capitalize">{tag} Recipes</h1>
      <p className="text-gray-600 mb-8">
        {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
      </p>

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">No recipes found for this tag.</p>
          <a href="/recipes" className="text-emerald-600 hover:text-emerald-700 mt-4 inline-block">
            Browse all recipes →
          </a>
        </div>
      )}
    </div>
  )
}
