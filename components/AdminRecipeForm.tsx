'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Recipe } from '@/types/database'
import { ImageUpload } from './ImageUpload'

interface RecipeFormData {
  title: string
  slug: string
  description: string
  cover_image_url: string
  ingredients: string[]
  steps: string[]
  prep_minutes: number
  cook_minutes: number
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard' | ''
  tags: string
  is_pro: boolean
  calories: string
  protein_g: string
  carbs_g: string
  fat_g: string
  fiber_g: string
  sugar_g: string
  sodium_mg: string
  cholesterol_mg: string
}

interface AdminRecipeFormProps {
  recipe?: Recipe | null
  onSuccess?: () => void
}

export function AdminRecipeForm({ recipe, onSuccess }: AdminRecipeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    slug: '',
    description: '',
    cover_image_url: '',
    ingredients: [''],
    steps: [''],
    prep_minutes: 0,
    cook_minutes: 0,
    servings: 1,
    difficulty: '',
    tags: '',
    is_pro: false,
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    fiber_g: '',
    sugar_g: '',
    sodium_mg: '',
    cholesterol_mg: '',
  })

  // Load recipe data when editing
  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description || '',
        cover_image_url: recipe.cover_image_url || '',
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        steps: Array.isArray(recipe.steps) ? recipe.steps : [],
        prep_minutes: recipe.prep_minutes || 0,
        cook_minutes: recipe.cook_minutes || 0,
        servings: recipe.servings || 1,
        difficulty: recipe.difficulty as 'Easy' | 'Medium' | 'Hard' | '' || '',
        tags: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '',
        is_pro: recipe.is_pro || false,
        calories: recipe.calories?.toString() || '',
        protein_g: recipe.protein_g?.toString() || '',
        carbs_g: recipe.carbs_g?.toString() || '',
        fat_g: recipe.fat_g?.toString() || '',
        fiber_g: recipe.fiber_g?.toString() || '',
        sugar_g: recipe.sugar_g?.toString() || '',
        sodium_mg: recipe.sodium_mg?.toString() || '',
        cholesterol_mg: recipe.cholesterol_mg?.toString() || '',
      })
    }
  }, [recipe])

  function handleTitleChange(title: string) {
    setFormData({
      ...formData,
      title,
      slug: slugify(title),
    })
  }

  function handleIngredientChange(index: number, value: string) {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = value
    setFormData({ ...formData, ingredients: newIngredients })
  }

  function addIngredient() {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ''],
    })
  }

  function removeIngredient(index: number) {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index)
    setFormData({ ...formData, ingredients: newIngredients })
  }

  function handleStepChange(index: number, value: string) {
    const newSteps = [...formData.steps]
    newSteps[index] = value
    setFormData({ ...formData, steps: newSteps })
  }

  function addStep() {
    setFormData({
      ...formData,
      steps: [...formData.steps, ''],
    })
  }

  function removeStep(index: number) {
    const newSteps = formData.steps.filter((_, i) => i !== index)
    setFormData({ ...formData, steps: newSteps })
  }

  // Bulk paste functions
  function handleBulkPasteIngredients(text: string) {
    // Split by newlines and clean up
    const items = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove common bullet points and numbering
        return line
          .replace(/^[•\-\*]\s*/, '') // Remove bullet points
          .replace(/^\d+[\.)]\s*/, '') // Remove numbers like "1." or "1)"
          .trim()
      })
      .filter(line => line.length > 0)

    if (items.length > 0) {
      setFormData({ ...formData, ingredients: items })
    }
  }

  function handleBulkPasteSteps(text: string) {
    // Split by newlines and clean up
    const items = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove common bullet points and numbering
        return line
          .replace(/^[•\-\*]\s*/, '') // Remove bullet points
          .replace(/^\d+[\.)]\s*/, '') // Remove numbers like "1." or "1)"
          .trim()
      })
      .filter(line => line.length > 0)

    if (items.length > 0) {
      setFormData({ ...formData, steps: items })
    }
  }

  function handleBulkPasteNutrition(text: string) {
    // Parse ChatGPT nutrition format: "Calories: 520" or "Calories - 520" or "Calories = 520"
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    const updates: Partial<RecipeFormData> = {}
    
    lines.forEach(line => {
      // Remove bullet points
      line = line.replace(/^[•\-\*]\s*/, '').trim()
      
      // Match pattern: "Field Name: value" or "Field Name - value" or "Field Name = value"
      const match = line.match(/^(.+?)[:\-\=]\s*(.+)$/i)
      
      if (!match) return
      
      const fieldName = match[1].trim().toLowerCase()
      const value = match[2].trim()
      
      // Extract numeric value (can have decimals)
      const numMatch = value.match(/[\d.]+/)
      if (!numMatch) return
      
      const numValue = numMatch[0]
      
      // Match field names (case insensitive, flexible matching)
      if (fieldName.includes('calorie')) {
        updates.calories = numValue
      } else if (fieldName.includes('protein')) {
        updates.protein_g = numValue
      } else if (fieldName.includes('carbohydrate') || fieldName.includes('carb')) {
        updates.carbs_g = numValue
      } else if (fieldName.includes('fat') && !fieldName.includes('saturated')) {
        updates.fat_g = numValue
      } else if (fieldName.includes('fiber')) {
        updates.fiber_g = numValue
      } else if (fieldName.includes('sugar')) {
        updates.sugar_g = numValue
      } else if (fieldName.includes('sodium')) {
        updates.sodium_mg = numValue
      } else if (fieldName.includes('cholesterol')) {
        updates.cholesterol_mg = numValue
      }
    })
    
    if (Object.keys(updates).length > 0) {
      setFormData({ ...formData, ...updates })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate
    if (!formData.title || !formData.slug) {
      setError('Title is required')
      setLoading(false)
      return
    }

    if (formData.ingredients.filter((i) => i.trim()).length === 0) {
      setError('At least one ingredient is required')
      setLoading(false)
      return
    }

    if (formData.steps.filter((s) => s.trim()).length === 0) {
      setError('At least one step is required')
      setLoading(false)
      return
    }

    // Prepare data
    const recipeData: any = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description || null,
      cover_image_url: formData.cover_image_url || null,
      ingredients: formData.ingredients.filter((i) => i.trim()),
      steps: formData.steps.filter((s) => s.trim()),
      prep_minutes: formData.prep_minutes || 0,
      cook_minutes: formData.cook_minutes || 0,
      servings: formData.servings || 1,
      difficulty: formData.difficulty || null,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      is_pro: formData.is_pro,
      calories: formData.calories ? parseInt(formData.calories) : null,
      protein_g: formData.protein_g ? parseFloat(formData.protein_g) : null,
      carbs_g: formData.carbs_g ? parseFloat(formData.carbs_g) : null,
      fat_g: formData.fat_g ? parseFloat(formData.fat_g) : null,
      fiber_g: formData.fiber_g ? parseFloat(formData.fiber_g) : null,
      sugar_g: formData.sugar_g ? parseFloat(formData.sugar_g) : null,
      sodium_mg: formData.sodium_mg ? parseFloat(formData.sodium_mg) : null,
      cholesterol_mg: formData.cholesterol_mg ? parseFloat(formData.cholesterol_mg) : null,
    }

    try {
      // Check admin access
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        setError('You must be logged in')
        setLoading(false)
        return
      }

      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
      if (!adminEmails.includes(user.email)) {
        setError('Unauthorized: Admin access required')
        setLoading(false)
        return
      }

      if (recipe) {
        // Update existing recipe
        const { data, error: updateError } = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', recipe.id)
          .select()
          .single()

        if (updateError) {
          setError(updateError.message || 'Failed to update recipe')
          setLoading(false)
          return
        }

        // Success - call callback and redirect
        if (onSuccess) onSuccess()
        router.push(`/recipes/${data.slug}`)
      } else {
        // Insert new recipe
        const { data, error: insertError } = await supabase
          .from('recipes')
          .insert(recipeData)
          .select()
          .single()

        if (insertError) {
          setError(insertError.message || 'Failed to create recipe')
          setLoading(false)
          return
        }

        // Success - call callback and redirect
        if (onSuccess) onSuccess()
        router.push(`/recipes/${data.slug}`)
      }
    } catch (err) {
      console.error('Error creating recipe:', err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900">
        {recipe ? 'Edit Recipe' : 'Add New Recipe'}
      </h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug *
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <ImageUpload
        value={formData.cover_image_url}
        onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
        label="Cover Image *"
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Ingredients *
          </label>
          <details className="relative">
            <summary className="cursor-pointer text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              📋 Bulk Paste
            </summary>
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
              <p className="text-xs text-gray-600 mb-2">
                Paste ingredients (one per line):
              </p>
              <textarea
                placeholder="2 cups flour&#10;1 tsp salt&#10;3 eggs"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    handleBulkPasteIngredients(e.target.value)
                    e.target.value = ''
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Tip: Copy from ChatGPT and paste here!
              </p>
            </div>
          </details>
        </div>
        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              placeholder={`Ingredient ${index + 1}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {formData.ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          + Add Ingredient
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Steps *
          </label>
          <details className="relative">
            <summary className="cursor-pointer text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              📋 Bulk Paste
            </summary>
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
              <p className="text-xs text-gray-600 mb-2">
                Paste steps (one per line):
              </p>
              <textarea
                placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Bake for 25 minutes"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    handleBulkPasteSteps(e.target.value)
                    e.target.value = ''
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Tip: Copy from ChatGPT and paste here!
              </p>
            </div>
          </details>
        </div>
        {formData.steps.map((step, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <textarea
              value={step}
              onChange={(e) => handleStepChange(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
              rows={2}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {formData.steps.length > 1 && (
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addStep}
          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          + Add Step
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prep Time (minutes)
          </label>
          <input
            type="number"
            value={formData.prep_minutes}
            onChange={(e) => setFormData({ ...formData, prep_minutes: parseInt(e.target.value) || 0 })}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cook Time (minutes)
          </label>
          <input
            type="number"
            value={formData.cook_minutes}
            onChange={(e) => setFormData({ ...formData, cook_minutes: parseInt(e.target.value) || 0 })}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Servings
          </label>
          <input
            type="number"
            value={formData.servings}
            onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select...</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="Airfryer, High Protein, Budget"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_pro"
          checked={formData.is_pro}
          onChange={(e) => setFormData({ ...formData, is_pro: e.target.checked })}
          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
        />
        <label htmlFor="is_pro" className="ml-2 text-sm font-medium text-gray-700">
          Pro Recipe (requires subscription)
        </label>
      </div>

      {/* Nutritional Information */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Nutritional Information (Optional)</h4>
          <details className="relative">
            <summary className="cursor-pointer text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              📋 Bulk Paste from ChatGPT
            </summary>
            <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
              <p className="text-xs text-gray-600 mb-2">
                Paste nutrition from ChatGPT (one per line):
              </p>
              <textarea
                placeholder="Calories: 520&#10;Protein (g): 38.0&#10;Carbohydrates (g): 32.0&#10;Fat (g): 24.0&#10;Fiber (g): 4.0&#10;Sugar (g): 7.0&#10;Sodium (mg): 780.0&#10;Cholesterol (mg): 125.0"
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    handleBulkPasteNutrition(e.target.value)
                    e.target.value = ''
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Tip: Copy exactly from ChatGPT and paste here! Supports formats like "Calories: 520" or "Calories - 520"
              </p>
            </div>
          </details>
        </div>
        <p className="text-sm text-gray-600 mb-4">Per serving. Leave blank if not available.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calories
            </label>
            <input
              type="number"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              placeholder="250"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protein (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.protein_g}
              onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
              placeholder="25.0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carbohydrates (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.carbs_g}
              onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })}
              placeholder="30.0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fat (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.fat_g}
              onChange={(e) => setFormData({ ...formData, fat_g: e.target.value })}
              placeholder="10.0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fiber (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.fiber_g}
              onChange={(e) => setFormData({ ...formData, fiber_g: e.target.value })}
              placeholder="5.0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sugar (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.sugar_g}
              onChange={(e) => setFormData({ ...formData, sugar_g: e.target.value })}
              placeholder="8.0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sodium (mg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.sodium_mg}
              onChange={(e) => setFormData({ ...formData, sodium_mg: e.target.value })}
              placeholder="400.0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cholesterol (mg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.cholesterol_mg}
              onChange={(e) => setFormData({ ...formData, cholesterol_mg: e.target.value })}
              placeholder="50.0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {loading ? (recipe ? 'Updating...' : 'Creating...') : (recipe ? 'Update Recipe' : 'Create Recipe')}
      </button>
    </form>
  )
}
