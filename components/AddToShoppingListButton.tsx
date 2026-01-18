'use client'

import { useState, useEffect } from 'react'
import { Recipe } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface AddToShoppingListButtonProps {
  recipe: Recipe
}

export function AddToShoppingListButton({ recipe }: AddToShoppingListButtonProps) {
  const [lists, setLists] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (showDropdown) {
      loadLists()
    }
  }, [showDropdown])

  async function loadLists() {
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setLists(data || [])
    } catch (error) {
      console.error('Error loading lists:', error)
    }
  }

  async function addToList(listId: string) {
    setLoading(true)
    try {
      // Get current list
      const { data: list, error: fetchError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('id', listId)
        .single()

      if (fetchError) throw fetchError

      // Add recipe ingredients to list
      const newItems = recipe.ingredients.map(ingredient => ({
        text: ingredient,
        checked: false,
        recipe_id: recipe.id,
        recipe_title: recipe.title,
      }))

      const updatedItems = [...list.items, ...newItems]

      // Update list
      const { error: updateError } = await supabase
        .from('shopping_lists')
        .update({ items: updatedItems })
        .eq('id', listId)

      if (updateError) throw updateError

      alert(`Added ${recipe.ingredients.length} ingredients to your shopping list!`)
      setShowDropdown(false)
    } catch (error) {
      console.error('Error adding to list:', error)
      alert('Failed to add to shopping list')
    } finally {
      setLoading(false)
    }
  }

  async function createNewListAndAdd() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create new list with recipe ingredients
      const newItems = recipe.ingredients.map(ingredient => ({
        text: ingredient,
        checked: false,
        recipe_id: recipe.id,
        recipe_title: recipe.title,
      }))

      const { error } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: `${recipe.title} Shopping List`,
          items: newItems,
        })

      if (error) throw error

      alert(`Created new shopping list with ${recipe.ingredients.length} ingredients!`)
      setShowDropdown(false)
    } catch (error) {
      console.error('Error creating list:', error)
      alert('Failed to create shopping list')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Add to Shopping List
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[250px]">
            {lists.length > 0 ? (
              <>
                <div className="p-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Choose a list:</p>
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  {lists.map(list => (
                    <li key={list.id}>
                      <button
                        onClick={() => addToList(list.id)}
                        disabled={loading}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <div className="font-medium">{list.name}</div>
                        <div className="text-sm text-gray-500">
                          {list.items.length} items
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="p-2 border-t border-gray-200">
                  <button
                    onClick={createNewListAndAdd}
                    disabled={loading}
                    className="w-full text-left px-2 py-2 text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"
                  >
                    + Create New List
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  You don't have any shopping lists yet.
                </p>
                <button
                  onClick={createNewListAndAdd}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  Create First List
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
