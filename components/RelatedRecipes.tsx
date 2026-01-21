'use client'

import { useEffect, useState } from 'react'
import { Recipe } from '@/types/database'
import { RecipeCard } from './RecipeCard'
import { createClient } from '@/lib/supabase/client'

interface RelatedRecipesProps {
  currentRecipe: Recipe
}

export function RelatedRecipes({ currentRecipe }: RelatedRecipesProps) {
  const [relatedRecipes, setRelatedRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRelatedRecipes()
  }, [currentRecipe.id])

  async function loadRelatedRecipes() {
    try {
      const supabase = createClient()

      // Fetch recipes directly from Supabase (no API call needed)
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .limit(50)

      if (error) {
        console.error('Error fetching recipes:', error)
        setRelatedRecipes([])
        setLoading(false)
        return
      }

      if (data && Array.isArray(data)) {
        // Filter and score recipes by tag overlap
        const currentTags = currentRecipe.tags || []
        const scored = data
          .filter((recipe: Recipe) => recipe.id !== currentRecipe.id) // Exclude current recipe
          .map((recipe: Recipe) => {
            // Count matching tags (handle null/undefined tags)
            const recipeTags = recipe.tags || []
            const matchingTags = recipeTags.filter(tag =>
              currentTags.includes(tag)
            ).length

            return { recipe, score: matchingTags }
          })
          .filter((item: { recipe: Recipe; score: number }) => item.score > 0) // Only recipes with at least 1 matching tag
          .sort((a: { recipe: Recipe; score: number }, b: { recipe: Recipe; score: number }) => b.score - a.score) // Sort by most matching tags
          .slice(0, 4) // Take top 4
          .map((item: { recipe: Recipe; score: number }) => item.recipe)

        setRelatedRecipes(scored)
      } else {
        setRelatedRecipes([])
      }
    } catch (error) {
      console.error('Error loading related recipes:', error)
      setRelatedRecipes([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (relatedRecipes.length === 0) {
    return null // Don't show section if no related recipes
  }

  return (
    <section className="py-12 border-t border-gray-200">
      <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  )
}
