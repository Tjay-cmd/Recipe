'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Recipe } from '@/types/database'
import { useToast } from './Toast'
import { CopyableLink } from './CopyableLink'
import Image from 'next/image'

interface RecipeListProps {
  onEdit?: (recipe: Recipe) => void
  refreshTrigger?: number
}

export function RecipeList({ onEdit, refreshTrigger }: RecipeListProps) {
  const { showToast } = useToast()
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
      showToast('Failed to delete recipe: ' + error.message, 'error')
    } else {
      setRecipes(recipes.filter(r => r.id !== recipe.id))
    }

    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {recipes.length > 0 ? (
        <div className="space-y-3 pb-8">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-gray-100/80 rounded-2xl hover:bg-emerald-50/30 hover:border-emerald-100 transition-all duration-200 gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Thumbnail Image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative border border-gray-200">
                  {recipe.cover_image_url ? (
                    <Image
                      src={recipe.cover_image_url}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L28 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className="font-bold text-gray-900 hover:text-emerald-600 truncate text-[15px]"
                    >
                      {recipe.title}
                    </Link>
                    {recipe.is_pro && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wide rounded-md">
                        Pro
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Published
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>{recipe.views || 0} views</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:ml-4 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={async () => {
                    const recipeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://yumspot.co.za'}/recipes/${recipe.slug}`
                    try {
                      await navigator.clipboard.writeText(recipeUrl)
                      showToast('✅ Link copied!', 'success')
                    } catch (err) {
                      showToast('Failed to copy', 'error')
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Copy Link"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </button>
                {onEdit && (
                  <button
                    onClick={() => onEdit(recipe)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Recipe"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(recipe)}
                  disabled={deleting === recipe.id}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete Recipe"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
          </div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-1">No recipes found</h3>
          <p className="text-[14px] text-gray-500">Get started by creating a new recipe.</p>
        </div>
      )}

      {/* Show copyable link for the most recently created recipe */}
      {recipes.length > 0 && (
        <div className="mt-auto pt-6 border-t border-gray-100 pb-2">
          <CopyableLink
            url={`${process.env.NEXT_PUBLIC_APP_URL || 'https://yumspot.co.za'}/recipes/${recipes[0].slug}`}
            label={`📌 Pinterest Link: ${recipes[0].title}`}
          />
        </div>
      )}
    </div>
  )
}
