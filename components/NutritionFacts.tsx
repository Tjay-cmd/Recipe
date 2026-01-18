'use client'

import { useState, useEffect } from 'react'
import { Recipe } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface NutritionFactsProps {
  recipe: Recipe
  isSubscribed: boolean
}

export function NutritionFacts({ recipe, isSubscribed }: NutritionFactsProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email) {
        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
        setIsAdmin(adminEmails.includes(user.email))
      }
    } catch (error) {
      console.error('Error checking admin access:', error)
    } finally {
      setCheckingAdmin(false)
    }
  }

  // Check if recipe has any nutritional data
  const hasNutritionData = recipe.calories !== null || recipe.protein_g !== null || recipe.carbs_g !== null

  // Don't show if no nutrition data
  if (!hasNutritionData) {
    return null
  }

  // Pro feature - admins always have access
  // Use isSubscribed from server first (should already be true for admins after our fix)
  // Then check client-side admin as backup
  const hasAccess = isSubscribed || isAdmin
  
  // If recipe is Pro and user has access, show nutrition facts
  // If recipe is not Pro, nutrition data shouldn't require Pro access
  if (recipe.is_pro && !hasAccess) {
    // Wait briefly for client-side admin check if server-side isSubscribed is false
    if (checkingAdmin && !isSubscribed) {
      return null // Still checking
    }
    
    // No access - show upgrade message
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-2">Nutrition Facts</h3>
        <p className="mb-4 text-gray-700">
          Nutritional information is available to Pro members. Upgrade to see calories, macros, vitamins, and more!
        </p>
        <a
          href="/pro"
          className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
        >
          Upgrade to Pro →
        </a>
      </div>
    )
  }

  // Calculate daily value percentages (based on 2000 calorie diet)
  const dailyCalories = 2000
  const dailyProtein = 50 // grams
  const dailyCarbs = 275 // grams
  const dailyFat = 65 // grams
  const dailyFiber = 28 // grams
  const dailySodium = 2300 // milligrams
  const dailyCholesterol = 300 // milligrams

  const proteinDV = recipe.protein_g ? Math.round((recipe.protein_g / dailyProtein) * 100) : null
  const carbsDV = recipe.carbs_g ? Math.round((recipe.carbs_g / dailyCarbs) * 100) : null
  const fatDV = recipe.fat_g ? Math.round((recipe.fat_g / dailyFat) * 100) : null
  const fiberDV = recipe.fiber_g ? Math.round((recipe.fiber_g / dailyFiber) * 100) : null
  const sodiumDV = recipe.sodium_mg ? Math.round((recipe.sodium_mg / dailySodium) * 100) : null
  const cholesterolDV = recipe.cholesterol_mg ? Math.round((recipe.cholesterol_mg / dailyCholesterol) * 100) : null

  // Calculate total carbs from other sources if needed
  const totalCarbs = recipe.carbs_g || 0
  const fiber = recipe.fiber_g || 0
  const sugar = recipe.sugar_g || 0
  const otherCarbs = totalCarbs - fiber - sugar

  return (
    <div className="bg-white border-2 border-gray-900 rounded-lg p-6 mb-8 max-w-md">
      <h3 className="text-2xl font-bold mb-1">Nutrition Facts</h3>
      <p className="text-sm text-gray-600 mb-2">
        {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''} ({recipe.servings} serving{recipe.servings !== 1 ? 's' : ''})
      </p>
      <div className="border-t-8 border-gray-900 my-2"></div>

      {/* Calories */}
      {recipe.calories !== null && (
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-3xl font-bold">{recipe.calories}</span>
          <span className="text-lg font-bold">Calories</span>
        </div>
      )}

      <div className="border-t-2 border-gray-900 my-2"></div>

      {/* Macronutrients */}
      <div className="text-sm space-y-1">
        {recipe.fat_g !== null && (
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">Total Fat</span>
              <span className="font-bold">{recipe.fat_g}g</span>
            </div>
            {fatDV !== null && <span className="font-bold">{fatDV}%</span>}
          </div>
        )}

        {recipe.cholesterol_mg !== null && (
          <div className="flex justify-between pl-4">
            <div className="flex items-center gap-2">
              <span>Cholesterol</span>
              <span className="font-bold">{recipe.cholesterol_mg}mg</span>
            </div>
            {cholesterolDV !== null && <span className="font-bold">{cholesterolDV}%</span>}
          </div>
        )}

        {recipe.sodium_mg !== null && (
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">Sodium</span>
              <span className="font-bold">{recipe.sodium_mg}mg</span>
            </div>
            {sodiumDV !== null && <span className="font-bold">{sodiumDV}%</span>}
          </div>
        )}

        {recipe.carbs_g !== null && (
          <>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold">Total Carbohydrate</span>
                <span className="font-bold">{recipe.carbs_g}g</span>
              </div>
              {carbsDV !== null && <span className="font-bold">{carbsDV}%</span>}
            </div>

            {recipe.fiber_g !== null && (
              <div className="flex justify-between pl-4">
                <div className="flex items-center gap-2">
                  <span>Dietary Fiber</span>
                  <span className="font-bold">{recipe.fiber_g}g</span>
                </div>
                {fiberDV !== null && <span className="font-bold">{fiberDV}%</span>}
              </div>
            )}

            {recipe.sugar_g !== null && (
              <div className="flex justify-between pl-4">
                <div className="flex items-center gap-2">
                  <span>Total Sugars</span>
                  <span className="font-bold">{recipe.sugar_g}g</span>
                </div>
              </div>
            )}
          </>
        )}

        {recipe.protein_g !== null && (
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">Protein</span>
              <span className="font-bold">{recipe.protein_g}g</span>
            </div>
            {proteinDV !== null && <span className="font-bold">{proteinDV}%</span>}
          </div>
        )}
      </div>

      <div className="border-t-4 border-gray-900 my-2"></div>

      {/* Daily Value Note */}
      <p className="text-xs text-gray-700 leading-tight">
        * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
      </p>
    </div>
  )
}
