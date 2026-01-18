'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MealPlan } from '@/types/database'
import Link from 'next/link'

export function MealPlanner() {
  const [mealPlans, setMealPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()))
  const [recipes, setRecipes] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedMealType, setSelectedMealType] = useState<string>('dinner')
  const [selectedRecipe, setSelectedRecipe] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    loadMealPlans()
    loadRecipes()
  }, [currentWeekStart])

  function getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day // Sunday = 0
    return new Date(d.setDate(diff))
  }

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  async function loadMealPlans() {
    setLoading(true)
    try {
      const weekEnd = new Date(currentWeekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const { data, error } = await supabase
        .from('meal_plans')
        .select('*, recipes(*)')
        .gte('planned_date', formatDate(currentWeekStart))
        .lte('planned_date', formatDate(weekEnd))
        .order('planned_date', { ascending: true })

      if (error) throw error
      setMealPlans(data || [])
    } catch (error) {
      console.error('Error loading meal plans:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadRecipes() {
    try {
      // Load only favorited/saved recipes
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('favorites')
        .select('recipe_id, recipes(*)')
        .eq('user_id', user.id)

      if (error) throw error
      
      // Extract the recipes from the favorites
      const favoriteRecipes = data?.map(fav => fav.recipes).filter(Boolean) || []
      setRecipes(favoriteRecipes)
    } catch (error) {
      console.error('Error loading recipes:', error)
    }
  }

  async function addMealPlan() {
    if (!selectedRecipe || !selectedDate) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          recipe_id: selectedRecipe,
          planned_date: selectedDate,
          meal_type: selectedMealType,
        })

      if (error) throw error

      await loadMealPlans()
      setShowAddModal(false)
      setSelectedRecipe('')
    } catch (error) {
      console.error('Error adding meal plan:', error)
      alert('Failed to add meal')
    }
  }

  async function deleteMealPlan(id: string) {
    if (!confirm('Remove this meal from your plan?')) return

    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadMealPlans()
    } catch (error) {
      console.error('Error deleting meal plan:', error)
      alert('Failed to remove meal')
    }
  }

  async function generateShoppingList() {
    if (mealPlans.length === 0) {
      alert('No meals planned this week!')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Collect all ingredients with quantities
      interface ParsedIngredient {
        quantity: number
        unit: string
        name: string
        originalRecipe: string
      }

      const allIngredients: ParsedIngredient[] = []

      mealPlans.forEach(mp => {
        mp.recipes.ingredients.forEach((ingredient: string) => {
          const parsed = parseIngredient(ingredient)
          allIngredients.push({
            ...parsed,
            originalRecipe: mp.recipes.title
          })
        })
      })

      // Group by ingredient name and unit, sum quantities
      const consolidated: Record<string, { quantity: number; unit: string; name: string }> = {}

      allIngredients.forEach(({ quantity, unit, name }) => {
        const key = `${name.toLowerCase()}|${unit.toLowerCase()}`
        
        if (!consolidated[key]) {
          consolidated[key] = { quantity, unit, name }
        } else {
          consolidated[key].quantity += quantity
        }
      })

      // Convert to shopping list items with smart unit conversion
      const items = Object.values(consolidated).map(({ quantity, unit, name }) => {
        const { displayQuantity, displayUnit } = convertToLargerUnit(quantity, unit)
        
        return {
          text: `${displayQuantity} ${displayUnit} ${name}`,
          checked: false,
        }
      }).sort((a, b) => a.text.localeCompare(b.text))

      // Create shopping list
      const weekStart = currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const weekEnd = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      const { data, error } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: `Week of ${weekStart} - ${weekEnd}`,
          items: items,
        })
        .select()
        .single()

      if (error) throw error

      alert(`✅ Shopping list created with ${items.length} consolidated items!`)
    } catch (error) {
      console.error('Error generating shopping list:', error)
      alert('Failed to generate shopping list')
    }
  }

  function parseIngredient(ingredient: string): { quantity: number; unit: string; name: string } {
    // Common patterns: "2 cups flour", "500 g chicken", "1.5 kg beef", "2-3 onions"
    const patterns = [
      // With unit: "2 cups flour", "500g chicken"
      /^(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)\s*(kg|g|lbs?|oz|ml|l|liters?|cups?|tbsp|tsp|teaspoons?|tablespoons?)\s+(.+)$/i,
      // Just number: "2 onions", "3 eggs"
      /^(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)\s+(.+)$/,
    ]

    for (const pattern of patterns) {
      const match = ingredient.match(pattern)
      if (match) {
        let quantity = parseFloat(match[1].split('-')[0]) // Take first number if range
        const hasUnit = match.length === 4
        
        if (hasUnit) {
          let unit = match[2].toLowerCase()
          let name = match[3].trim()
          
          // Normalize units
          unit = normalizeUnit(unit)
          
          return { quantity, unit, name }
        } else {
          // No unit, just count
          let name = match[2].trim()
          return { quantity, unit: 'whole', name }
        }
      }
    }

    // No quantity found, treat as 1 whole item
    return { quantity: 1, unit: 'whole', name: ingredient.trim() }
  }

  function normalizeUnit(unit: string): string {
    const normalized: Record<string, string> = {
      'cup': 'cups',
      'tbsp': 'tbsp',
      'tablespoon': 'tbsp',
      'tablespoons': 'tbsp',
      'tsp': 'tsp',
      'teaspoon': 'tsp',
      'teaspoons': 'tsp',
      'g': 'g',
      'gram': 'g',
      'grams': 'g',
      'kg': 'kg',
      'kilogram': 'kg',
      'kilograms': 'kg',
      'lb': 'lbs',
      'lbs': 'lbs',
      'pound': 'lbs',
      'pounds': 'lbs',
      'oz': 'oz',
      'ounce': 'oz',
      'ounces': 'oz',
      'ml': 'ml',
      'milliliter': 'ml',
      'milliliters': 'ml',
      'l': 'L',
      'liter': 'L',
      'liters': 'L',
      'litre': 'L',
      'litres': 'L',
    }
    return normalized[unit.toLowerCase()] || unit.toLowerCase()
  }

  function convertToLargerUnit(quantity: number, unit: string): { displayQuantity: string; displayUnit: string } {
    // Convert to larger units when appropriate
    if (unit === 'g' && quantity >= 1000) {
      return { displayQuantity: (quantity / 1000).toFixed(2), displayUnit: 'kg' }
    }
    if (unit === 'ml' && quantity >= 1000) {
      return { displayQuantity: (quantity / 1000).toFixed(2), displayUnit: 'L' }
    }
    if (unit === 'oz' && quantity >= 16) {
      return { displayQuantity: (quantity / 16).toFixed(2), displayUnit: 'lbs' }
    }
    
    // Round to 2 decimal places for cleaner display
    const rounded = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2)
    return { displayQuantity: rounded, displayUnit: unit }
  }

  function getMealPlansForDate(date: Date, mealType: string): any[] {
    const dateStr = formatDate(date)
    return mealPlans.filter(
      mp => mp.planned_date === dateStr && mp.meal_type === mealType
    )
  }

  function previousWeek() {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() - 7)
    setCurrentWeekStart(newStart)
  }

  function nextWeek() {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() + 7)
    setCurrentWeekStart(newStart)
  }

  function thisWeek() {
    setCurrentWeekStart(getWeekStart(new Date()))
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart)
    date.setDate(date.getDate() + i)
    return date
  })

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Meal Planner</h1>
        <p className="text-sm sm:text-base text-gray-600">Plan your weekly meals and stay organized!</p>
      </div>

      {/* Week Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <button
          onClick={previousWeek}
          className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← Previous
        </button>
        
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">
            {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -{' '}
            {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <button
            onClick={thisWeek}
            className="text-sm text-emerald-600 hover:text-emerald-700 mt-1"
          >
            Today
          </button>
        </div>

        <button
          onClick={nextWeek}
          className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Generate Shopping List Button */}
      {mealPlans.length > 0 && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={generateShoppingList}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Generate Shopping List
          </button>
        </div>
      )}

      {/* Mobile View - Card Layout */}
      <div className="md:hidden space-y-4">
        {weekDays.map((date, i) => {
          const dateStr = formatDate(date)
          const isToday = dateStr === formatDate(new Date())
          const allMealsForDate = mealPlans.filter(mp => mp.planned_date === dateStr)
          
          return (
            <div
              key={i}
              className={`bg-white rounded-lg shadow-sm border-2 ${
                isToday ? 'border-emerald-500' : 'border-gray-200'
              } overflow-hidden`}
            >
              <div className={`p-4 ${isToday ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                <div className="font-semibold text-gray-900">
                  {date.toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div className={`text-sm ${isToday ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  {isToday && <span className="ml-2 text-emerald-600 font-semibold">• Today</span>}
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {mealTypes.map((mealType) => {
                  const meals = getMealPlansForDate(date, mealType)
                  return (
                    <div key={mealType} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-700 capitalize">{mealType}</h3>
                        <button
                          onClick={() => {
                            setSelectedDate(dateStr)
                            setSelectedMealType(mealType)
                            setShowAddModal(true)
                          }}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          + Add
                        </button>
                      </div>
                      {meals.length > 0 ? (
                        <div className="space-y-2">
                          {meals.map((meal) => (
                            <div
                              key={meal.id}
                              className="p-2 bg-emerald-100 rounded text-sm group relative"
                            >
                              <Link
                                href={`/recipes/${meal.recipes.slug}`}
                                className="text-emerald-800 hover:text-emerald-900 font-medium block pr-6"
                              >
                                {meal.recipes.title}
                              </Link>
                              <button
                                onClick={() => deleteMealPlan(meal.id)}
                                className="absolute top-1 right-1 text-red-600 hover:text-red-700 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                aria-label="Remove meal"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No {mealType} planned</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 bg-gray-50 font-medium text-gray-700 border-r border-gray-200">
            Meal
          </div>
          {weekDays.map((date, i) => {
            const isToday = formatDate(date) === formatDate(new Date())
            return (
              <div
                key={i}
                className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                  isToday ? 'bg-emerald-50' : 'bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-700">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-sm ${isToday ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                  {date.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {mealTypes.map((mealType) => (
          <div key={mealType} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
            <div className="p-4 bg-gray-50 font-medium text-gray-700 capitalize border-r border-gray-200">
              {mealType}
            </div>
            {weekDays.map((date, i) => {
              const meals = getMealPlansForDate(date, mealType)
              const dateStr = formatDate(date)
              return (
                <div
                  key={i}
                  className="p-2 border-r border-gray-200 last:border-r-0 min-h-[100px] hover:bg-gray-50 transition-colors"
                >
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="mb-2 p-2 bg-emerald-100 rounded text-sm group relative"
                    >
                      <Link
                        href={`/recipes/${meal.recipes.slug}`}
                        className="text-emerald-800 hover:text-emerald-900 font-medium block"
                      >
                        {meal.recipes.title}
                      </Link>
                      <button
                        onClick={() => deleteMealPlan(meal.id)}
                        className="absolute top-1 right-1 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedDate(dateStr)
                      setSelectedMealType(mealType)
                      setShowAddModal(true)
                    }}
                    className="w-full py-1 text-gray-400 hover:text-emerald-600 text-sm transition-colors"
                  >
                    + Add
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Add Meal Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Add Meal</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Type
                  </label>
                  <select
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {mealTypes.map(type => (
                      <option key={type} value={type} className="capitalize">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipe {recipes.length === 0 && <span className="text-amber-600">(Save recipes first!)</span>}
                  </label>
                  {recipes.length > 0 ? (
                    <select
                      value={selectedRecipe}
                      onChange={(e) => setSelectedRecipe(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select a recipe...</option>
                      {recipes.map(recipe => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800 mb-2">
                        You need to save some recipes first!
                      </p>
                      <Link
                        href="/recipes"
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        onClick={() => setShowAddModal(false)}
                      >
                        Browse Recipes →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={addMealPlan}
                  disabled={!selectedRecipe || !selectedDate}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Meal
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
