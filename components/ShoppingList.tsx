'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingList as ShoppingListType, ShoppingListItem } from '@/types/database'
import Link from 'next/link'

export function ShoppingList() {
  const [lists, setLists] = useState<ShoppingListType[]>([])
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [newListName, setNewListName] = useState('')
  const [showNewListForm, setShowNewListForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadShoppingLists()
  }, [])

  async function loadShoppingLists() {
    try {
      const response = await fetch('/api/shopping-list')
      const data = await response.json()
      
      if (data.shopping_lists && data.shopping_lists.length > 0) {
        setLists(data.shopping_lists)
        setActiveListId(data.shopping_lists[0].id)
      }
    } catch (error) {
      console.error('Error loading shopping lists:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createNewList() {
    if (!newListName.trim()) return

    try {
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName, items: [] }),
      })

      const data = await response.json()
      
      if (data.shopping_list) {
        setLists([data.shopping_list, ...lists])
        setActiveListId(data.shopping_list.id)
        setNewListName('')
        setShowNewListForm(false)
      }
    } catch (error) {
      console.error('Error creating list:', error)
    }
  }

  async function updateList(listId: string, updates: Partial<ShoppingListType>) {
    try {
      const response = await fetch(`/api/shopping-list/${listId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      
      if (data.shopping_list) {
        setLists(lists.map(list => 
          list.id === listId ? data.shopping_list : list
        ))
      }
    } catch (error) {
      console.error('Error updating list:', error)
    }
  }

  async function deleteList(listId: string) {
    if (!confirm('Delete this shopping list?')) return

    try {
      await fetch(`/api/shopping-list/${listId}`, { method: 'DELETE' })
      
      const newLists = lists.filter(list => list.id !== listId)
      setLists(newLists)
      
      if (activeListId === listId && newLists.length > 0) {
        setActiveListId(newLists[0].id)
      } else if (newLists.length === 0) {
        setActiveListId(null)
      }
    } catch (error) {
      console.error('Error deleting list:', error)
    }
  }

  function toggleItem(listId: string, itemIndex: number) {
    const list = lists.find(l => l.id === listId)
    if (!list) return

    const updatedItems = [...list.items]
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      checked: !updatedItems[itemIndex].checked
    }

    updateList(listId, { items: updatedItems })
  }

  function removeItem(listId: string, itemIndex: number) {
    const list = lists.find(l => l.id === listId)
    if (!list) return

    const updatedItems = list.items.filter((_, idx) => idx !== itemIndex)
    updateList(listId, { items: updatedItems })
  }

  function addCustomItem(listId: string, text: string) {
    const list = lists.find(l => l.id === listId)
    if (!list || !text.trim()) return

    const newItem: ShoppingListItem = {
      text: text.trim(),
      checked: false
    }

    updateList(listId, { items: [...list.items, newItem] })
  }

  function clearCheckedItems(listId: string) {
    const list = lists.find(l => l.id === listId)
    if (!list) return

    const updatedItems = list.items.filter(item => !item.checked)
    updateList(listId, { items: updatedItems })
  }

  const activeList = lists.find(l => l.id === activeListId)

  // Group items by recipe
  const groupedItems = activeList?.items.reduce((acc, item, index) => {
    const key = item.recipe_title || 'Custom Items'
    if (!acc[key]) acc[key] = []
    acc[key].push({ ...item, index })
    return acc
  }, {} as Record<string, (ShoppingListItem & { index: number })[]>) || {}

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shopping Lists</h1>
        <p className="text-gray-600">Organize your ingredients and never forget what to buy!</p>
      </div>

      {/* List Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {lists.map(list => (
          <button
            key={list.id}
            onClick={() => setActiveListId(list.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeListId === list.id
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {list.name}
            <span className="ml-2 text-sm opacity-75">
              ({list.items.filter(i => !i.checked).length})
            </span>
          </button>
        ))}
        
        {showNewListForm ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createNewList()}
              placeholder="List name..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <button
              onClick={createNewList}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setShowNewListForm(false)
                setNewListName('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewListForm(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            + New List
          </button>
        )}
      </div>

      {/* Active List */}
      {activeList ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* List Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{activeList.name}</h2>
            <div className="flex gap-2">
              {activeList.items.some(i => i.checked) && (
                <button
                  onClick={() => clearCheckedItems(activeList.id)}
                  className="text-sm text-gray-600 hover:text-emerald-600"
                >
                  Clear Checked
                </button>
              )}
              <button
                onClick={() => deleteList(activeList.id)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Delete List
              </button>
            </div>
          </div>

          {/* Items by Recipe */}
          {Object.keys(groupedItems).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([recipeName, items]) => (
                <div key={recipeName}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-700">{recipeName}</h3>
                    {items[0].recipe_id && (
                      <Link
                        href={`/recipes/${items[0].recipe_id}`}
                        className="text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        View Recipe →
                      </Link>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.index} className="flex items-center gap-3 group">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(activeList.id, item.index)}
                          className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className={`flex-1 ${item.checked ? 'line-through text-gray-400' : ''}`}>
                          {item.text}
                        </span>
                        <button
                          onClick={() => removeItem(activeList.id, item.index)}
                          className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 transition-opacity"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No items yet. Add recipes or custom items!
            </p>
          )}

          {/* Add Custom Item */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const input = e.currentTarget.elements.namedItem('customItem') as HTMLInputElement
                addCustomItem(activeList.id, input.value)
                input.value = ''
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                name="customItem"
                placeholder="Add custom item..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">You don't have any shopping lists yet.</p>
          <button
            onClick={() => setShowNewListForm(true)}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            Create Your First List
          </button>
        </div>
      )}
    </div>
  )
}
