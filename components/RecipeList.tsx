'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Recipe } from '@/types/database'

interface RecipeListProps {
  onEdit?: (recipe: Recipe) => void
  refreshTrigger?: number
}

export function RecipeList({ onEdit, refreshTrigger }: RecipeListProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchRecipes = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    setRecipes(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRecipes()
  }, [refreshTrigger])

  async function handleDelete(recipe: Recipe) {
    if (!confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      return
    }

    setDeleting(recipe.id)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipe.id)

    if (error) {
      alert('Failed to delete recipe: ' + error.message)
    } else {
      // Remove from list
      setRecipes(recipes.filter(r => r.id !== recipe.id))
    }
    
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-gray-500 text-center py-8">Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {recipes.length > 0 ? (
        <div className="space-y-2">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={`/recipes/${recipe.slug}`}
                  className="font-medium text-gray-900 hover:text-emerald-600"
                >
                  {recipe.title}
                </Link>
                <p className="text-sm text-gray-500">
                  {recipe.views} views • {new Date(recipe.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {recipe.is_pro && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                    Pro
                  </span>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(recipe)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(recipe)}
                  disabled={deleting === recipe.id}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  {deleting === recipe.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No recipes yet.</p>
      )}
    </div>
  )
}
