'use client'

import { useEffect, useState } from 'react'
import { Recipe } from '@/types/database'
import { RecipeCard } from './RecipeCard'

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
      // Fetch recipes with matching tags
      const response = await fetch('/api/recipes?limit=50')
      const data = await response.json()
      
      if (data.recipes) {
        // Filter and score recipes by tag overlap
        const scored = data.recipes
          .filter((recipe: Recipe) => recipe.id !== currentRecipe.id) // Exclude current recipe
          .map((recipe: Recipe) => {
            // Count matching tags
            const matchingTags = recipe.tags.filter(tag => 
              currentRecipe.tags.includes(tag)
            ).length
            
            return { recipe, score: matchingTags }
          })
          .filter(item => item.score > 0) // Only recipes with at least 1 matching tag
          .sort((a, b) => b.score - a.score) // Sort by most matching tags
          .slice(0, 4) // Take top 4
          .map(item => item.recipe)

        setRelatedRecipes(scored)
      }
    } catch (error) {
      console.error('Error loading related recipes:', error)
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
