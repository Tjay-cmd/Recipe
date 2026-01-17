import Image from 'next/image'
import { Recipe } from '@/types/database'
import { ProBadge } from './ProBadge'
import { SaveButton } from './SaveButton'
import { PinterestShareButton } from './PinterestShareButton'
import { formatTime } from '@/lib/utils'
import Link from 'next/link'

interface RecipeDetailProps {
  recipe: Recipe
  isSubscribed: boolean
  isFavorite?: boolean
}

export function RecipeDetail({ recipe, isSubscribed, isFavorite = false }: RecipeDetailProps) {
  const totalTime = recipe.prep_minutes + recipe.cook_minutes
  const showFullContent = !recipe.is_pro || isSubscribed
  
  // Get the production URL for Pinterest sharing
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://recipe-kappa-eight.vercel.app'
  const recipeUrl = `${baseUrl}/recipes/${recipe.slug}`
  const shareDescription = `${recipe.title} - ${recipe.description || 'Delicious recipe you can actually cook!'}`

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          {recipe.is_pro && <ProBadge />}
          <h1 className="text-3xl md:text-4xl font-bold">{recipe.title}</h1>
        </div>
        {recipe.description && (
          <p className="text-lg text-gray-600 mb-6">{recipe.description}</p>
        )}
      </div>

      {/* Cover Image */}
      {recipe.cover_image_url && (
        <div className="w-full mb-8 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={recipe.cover_image_url}
            alt={recipe.title}
            className="w-full h-auto"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
        {recipe.prep_minutes > 0 && (
          <div>
            <span className="text-sm text-gray-500">Prep Time</span>
            <p className="font-semibold">{formatTime(recipe.prep_minutes)}</p>
          </div>
        )}
        {recipe.cook_minutes > 0 && (
          <div>
            <span className="text-sm text-gray-500">Cook Time</span>
            <p className="font-semibold">{formatTime(recipe.cook_minutes)}</p>
          </div>
        )}
        {totalTime > 0 && (
          <div>
            <span className="text-sm text-gray-500">Total Time</span>
            <p className="font-semibold">{formatTime(totalTime)}</p>
          </div>
        )}
        {recipe.servings > 0 && (
          <div>
            <span className="text-sm text-gray-500">Servings</span>
            <p className="font-semibold">{recipe.servings}</p>
          </div>
        )}
        {recipe.difficulty && (
          <div>
            <span className="text-sm text-gray-500">Difficulty</span>
            <p className="font-semibold capitalize">{recipe.difficulty}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <SaveButton recipeId={recipe.id} initialSaved={isFavorite} />
        {recipe.cover_image_url && (
          <PinterestShareButton
            url={recipeUrl}
            imageUrl={recipe.cover_image_url}
            description={shareDescription}
          />
        )}
        <a
          href="#ingredients"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Jump to Ingredients
        </a>
        <a
          href="#steps"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Jump to Steps
        </a>
      </div>

      {/* Ingredients */}
      <section id="ingredients" className="mb-12 scroll-mt-20">
        <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">•</span>
              <span>{ingredient}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section id="steps" className="mb-12 scroll-mt-20">
        <h2 className="text-2xl font-bold mb-4">Instructions</h2>
        {showFullContent ? (
          <ol className="space-y-4">
            {recipe.steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </span>
                <span className="flex-1 pt-1">{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Pro Recipe</h3>
            <p className="mb-4 text-gray-700">
              This recipe is available to Pro members. Upgrade to get access to step-by-step instructions,
              meal plans, grocery lists, and more!
            </p>
            <Link
              href="/pro"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}
      </section>

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
