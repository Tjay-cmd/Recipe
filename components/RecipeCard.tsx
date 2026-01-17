import Link from 'next/link'
import Image from 'next/image'
import { Recipe } from '@/types/database'
import { ProBadge } from './ProBadge'
import { formatTime } from '@/lib/utils'

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = recipe.prep_minutes + recipe.cook_minutes

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {recipe.cover_image_url ? (
          <Image
            src={recipe.cover_image_url}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200">
            <span className="text-4xl">🍳</span>
          </div>
        )}
        {recipe.is_pro && (
          <div className="absolute top-2 right-2">
            <ProBadge />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{formatTime(totalTime)}</span>
            </span>
          )}
          {recipe.servings > 0 && (
            <span className="flex items-center gap-1">
              <span>👥</span>
              <span>{recipe.servings} servings</span>
            </span>
          )}
          {recipe.difficulty && (
            <span className="capitalize">{recipe.difficulty}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
