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
      className="group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {recipe.cover_image_url ? (
          <Image
            src={recipe.cover_image_url}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 via-orange-50 to-emerald-200">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🍳</span>
          </div>
        )}
        {recipe.is_pro && (
          <div className="absolute top-3 right-3">
            <ProBadge />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors text-gray-900">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
          {totalTime > 0 && (
            <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full">
              <span>⏱️</span>
              <span className="font-medium">{formatTime(totalTime)}</span>
            </span>
          )}
          {recipe.servings > 0 && (
            <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full">
              <span>👥</span>
              <span className="font-medium">{recipe.servings} servings</span>
            </span>
          )}
          {recipe.difficulty && (
            <span className="capitalize bg-gray-50 px-2.5 py-1 rounded-full font-medium">{recipe.difficulty}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
