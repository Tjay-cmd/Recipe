import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { RecipeDetailWrapper } from '@/components/RecipeDetailWrapper'
import { RelatedRecipes } from '@/components/RelatedRecipes'
import { ReviewSection } from '@/components/ReviewSection'
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

// Auth checks moved to client-side wrapper component to prevent SSR hydration mismatch

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const recipe = await getRecipe(params.slug)

  if (!recipe) {
    return {
      title: 'Recipe Not Found',
    }
  }

  const totalTime = recipe.prep_minutes + recipe.cook_minutes

  return {
    title: `${recipe.title} | YumSpot`,
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
      siteName: 'YumSpot',
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
      'article:author': 'YumSpot',
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
          name: 'YumSpot',
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

  // Increment views (server action) - this handles errors internally
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
          <RecipeDetailWrapper recipe={recipe} />
        </CookMode>
        
        {/* Ratings & Reviews */}
        <ReviewSection recipeId={recipe.id} />
        
        {/* Related Recipes */}
        <RelatedRecipes currentRecipe={recipe} />
      </div>
    </>
  )
}
