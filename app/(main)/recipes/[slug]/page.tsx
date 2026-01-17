import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { RecipeDetail } from '@/components/RecipeDetail'
import { CookMode } from '@/components/CookMode'
import { incrementRecipeViews } from '@/app/actions'
import { Recipe } from '@/types/database'

interface RecipePageProps {
  params: {
    slug: string
  }
}

async function getRecipe(slug: string): Promise<Recipe | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

async function checkIsFavorite(recipeId: string): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single()

  return !!data
}

async function checkIsSubscribed(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  return !!data
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const recipe = await getRecipe(params.slug)

  if (!recipe) {
    return {
      title: 'Recipe Not Found',
    }
  }

  const totalTime = recipe.prep_minutes + recipe.cook_minutes

  return {
    title: `${recipe.title} | RecipeHub`,
    description: recipe.description || `Learn how to make ${recipe.title} with our step-by-step recipe.`,
    openGraph: {
      title: recipe.title,
      description: recipe.description || `Learn how to make ${recipe.title}`,
      images: recipe.cover_image_url ? [{ 
        url: recipe.cover_image_url,
        width: 1200,
        height: 630,
        alt: recipe.title,
      }] : [],
      type: 'article',
      siteName: 'RecipeHub',
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description: recipe.description || `Learn how to make ${recipe.title}`,
      images: recipe.cover_image_url ? [recipe.cover_image_url] : [],
    },
    other: {
      // Pinterest-specific tags
      'pinterest:title': recipe.title,
      'pinterest:description': `${recipe.description || recipe.title} | ${totalTime} min | ${recipe.servings} servings | ${recipe.difficulty || 'Easy'}`,
      'pinterest:image': recipe.cover_image_url || '',
      // Rich Pins - Article type (Pinterest reads schema.org data)
      'og:type': 'article',
      'article:author': 'RecipeHub',
      'article:tag': recipe.tags?.join(', ') || '',
    },
  }
}

function generateRecipeSchema(recipe: Recipe) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description || '',
    image: recipe.cover_image_url ? {
      '@type': 'ImageObject',
      url: recipe.cover_image_url,
      height: 1200,
      width: 1200,
    } : undefined,
    author: {
      '@type': 'Organization',
      name: 'RecipeHub',
    },
    datePublished: recipe.created_at,
    prepTime: `PT${recipe.prep_minutes}M`,
    cookTime: `PT${recipe.cook_minutes}M`,
    totalTime: `PT${recipe.prep_minutes + recipe.cook_minutes}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeCategory: recipe.tags?.[0] || 'Main Course',
    recipeCuisine: 'International',
    keywords: recipe.tags?.join(', ') || '',
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step,
    })),
    ...(recipe.difficulty && { 
      'recipeInstructions': recipe.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      }))
    }),
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const recipe = await getRecipe(params.slug)

  if (!recipe) {
    notFound()
  }

  const isFavorite = await checkIsFavorite(recipe.id)
  const isSubscribed = await checkIsSubscribed()

  // Increment views (server action)
  await incrementRecipeViews(recipe.id)

  const recipeSchema = generateRecipeSchema(recipe)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CookMode>
          <RecipeDetail recipe={recipe} isSubscribed={isSubscribed} isFavorite={isFavorite} />
        </CookMode>
      </div>
    </>
  )
}
