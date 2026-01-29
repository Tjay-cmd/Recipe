'use client'

import { useState } from 'react'
import Image from 'next/image'
import { SwipeCandidate } from '@/types/database'
import { Clock, Users, Info } from 'lucide-react'

interface SwipeRecipeCardProps {
  recipe: SwipeCandidate
  onSwipe?: (direction: 'left' | 'right' | 'up') => void
  style?: React.CSSProperties
  className?: string
}

export default function SwipeRecipeCard({ recipe, onSwipe, style, className = '' }: SwipeRecipeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const hasNutrition =
    recipe.calories !== null ||
    recipe.protein_g !== null ||
    recipe.carbs_g !== null ||
    recipe.fat_g !== null ||
    recipe.fiber_g !== null ||
    recipe.sugar_g !== null

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasNutrition) {
      setIsFlipped(!isFlipped)
    }
  }

  return (
    <div
      className={`swipe-card relative w-full max-w-sm mx-auto ${className}`}
      style={{
        perspective: '1000px',
        ...style,
      }}
    >
      <div
        className={`card-inner relative w-full h-[600px] sm:h-[650px] transition-transform duration-500 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of card */}
        <div
          className="card-face absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Recipe Image */}
          <div className="relative h-[360px] sm:h-[400px] w-full bg-gray-200">
            {recipe.cover_image_url ? (
              <Image
                src={recipe.cover_image_url}
                alt={recipe.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-200 to-red-200">
                <span className="text-6xl">🍽️</span>
              </div>
            )}

            {/* Pro badge */}
            {recipe.is_pro && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                PRO
              </div>
            )}

          </div>

          {/* Recipe Info */}
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 line-clamp-2">{recipe.title}</h2>

            {/* Time and Servings */}
            <div className="flex items-center gap-4 sm:gap-6 text-gray-600 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">{recipe.total_minutes} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">{recipe.servings} servings</span>
              </div>
            </div>

            {/* Nutrition Button - Always visible, mobile-optimized */}
            <button
              onClick={handleFlip}
              disabled={!hasNutrition}
              className={`w-full mb-2 sm:mb-3 py-3 sm:py-3 px-4 rounded-lg font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 ${
                hasNutrition
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:from-green-600 hover:to-emerald-700 cursor-pointer'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
              {hasNutrition ? 'View Nutrition Facts' : 'No Nutrition Info Available'}
            </button>

            {/* Difficulty badge */}
            {recipe.difficulty && (
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    recipe.difficulty === 'Easy'
                      ? 'bg-green-100 text-green-700'
                      : recipe.difficulty === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {recipe.difficulty}
                </span>
              </div>
            )}

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                {recipe.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back of card - Nutrition Info (FDA-style label) */}
        <div
          className="card-face absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-auto backface-hidden p-4"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <button
            onClick={handleFlip}
            className="sticky top-2 left-full ml-2 mb-4 bg-gray-100 px-4 py-2 rounded-full shadow-md hover:bg-gray-200 transition-colors font-medium text-gray-700 text-sm"
            aria-label="Back to recipe"
          >
            ← Back to Recipe
          </button>

          <div className="max-w-sm mx-auto">
            <div className="bg-white border-2 border-gray-900 rounded-lg p-4">
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
                    <span className="font-bold">{Math.round((recipe.fat_g / 65) * 100)}%</span>
                  </div>
                )}

                {recipe.cholesterol_mg !== null && (
                  <div className="flex justify-between pl-4">
                    <div className="flex items-center gap-2">
                      <span>Cholesterol</span>
                      <span className="font-bold">{recipe.cholesterol_mg}mg</span>
                    </div>
                    <span className="font-bold">{Math.round((recipe.cholesterol_mg / 300) * 100)}%</span>
                  </div>
                )}

                {recipe.sodium_mg !== null && (
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Sodium</span>
                      <span className="font-bold">{recipe.sodium_mg}mg</span>
                    </div>
                    <span className="font-bold">{Math.round((recipe.sodium_mg / 2300) * 100)}%</span>
                  </div>
                )}

                {recipe.carbs_g !== null && (
                  <>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Total Carbohydrate</span>
                        <span className="font-bold">{recipe.carbs_g}g</span>
                      </div>
                      <span className="font-bold">{Math.round((recipe.carbs_g / 275) * 100)}%</span>
                    </div>

                    {recipe.fiber_g !== null && (
                      <div className="flex justify-between pl-4">
                        <div className="flex items-center gap-2">
                          <span>Dietary Fiber</span>
                          <span className="font-bold">{recipe.fiber_g}g</span>
                        </div>
                        <span className="font-bold">{Math.round((recipe.fiber_g / 28) * 100)}%</span>
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
                    <span className="font-bold">{Math.round((recipe.protein_g / 50) * 100)}%</span>
                  </div>
                )}
              </div>

              <div className="border-t-4 border-gray-900 my-2"></div>

              {/* Daily Value Note */}
              <p className="text-xs text-gray-700 leading-tight">
                * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
              </p>
            </div>

            {!hasNutrition && (
              <div className="text-center text-gray-500 mt-6">
                <p>Nutrition information not available for this recipe.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for 3D flip */}
      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  )
}

