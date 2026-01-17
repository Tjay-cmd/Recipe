'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminRecipeForm } from '@/components/AdminRecipeForm'
import { RecipeList } from '@/components/RecipeList'
import { Recipe } from '@/types/database'

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const checkAdminAccess = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user || !user.email) {
        router.push('/')
        return
      }

      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
      
      if (!adminEmails.includes(user.email)) {
        router.push('/')
        return
      }

      setIsAdmin(true)
      setLoading(false)
    }

    checkAdminAccess()
  }, [router])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  function handleEdit(recipe: Recipe) {
    setEditingRecipe(recipe)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSuccess() {
    setEditingRecipe(null)
    setRefreshTrigger(prev => prev + 1)
  }

  function handleCancelEdit() {
    setEditingRecipe(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Admin - Recipe Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recipe Form */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
            </h2>
            {editingRecipe && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <AdminRecipeForm 
            recipe={editingRecipe} 
            onSuccess={handleSuccess}
          />
        </div>

        {/* Recipe List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Existing Recipes</h2>
          <RecipeList 
            onEdit={handleEdit}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </div>
  )
}
