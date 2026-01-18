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

      const response = await fetch(
        `/api/meal-plans?start_date=${formatDate(currentWeekStart)}&end_date=${formatDate(weekEnd)}`
      )
      const data = await response.json()
      setMealPlans(data.meal_plans || [])
    } catch (error) {
      console.error('Error loading meal plans:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadRecipes() {
    try {
      const response = await fetch('/api/recipes?limit=100')
      const data = await response.json()
      setRecipes(data.recipes || [])
    } catch (error) {
      console.error('Error loading recipes:', error)
    }
  }

  async function addMealPlan() {
    if (!selectedRecipe || !selectedDate) return

    try {
      const response = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe_id: selectedRecipe,
          planned_date: selectedDate,
          meal_type: selectedMealType,
        }),
      })

      if (response.ok) {
        await loadMealPlans()
        setShowAddModal(false)
        setSelectedRecipe('')
      }
    } catch (error) {
      console.error('Error adding meal plan:', error)
    }
  }

  async function deleteMealPlan(id: string) {
    if (!confirm('Remove this meal from your plan?')) return

    try {
      await fetch(`/api/meal-plans?id=${id}`, { method: 'DELETE' })
      await loadMealPlans()
    } catch (error) {
      console.error('Error deleting meal plan:', error)
    }
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meal Planner</h1>
        <p className="text-gray-600">Plan your weekly meals and stay organized!</p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousWeek}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← Previous
        </button>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold">
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
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                    Recipe
                  </label>
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
