import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'
  
  const supabase = await createClient()
  const { data: recipes } = await supabase
    .from('recipes')
    .select('slug, updated_at')

  const recipeUrls: MetadataRoute.Sitemap = (recipes || []).map((recipe) => ({
    url: `${baseUrl}/recipes/${recipe.slug}`,
    lastModified: new Date(recipe.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Get unique tags
  const { data: tagsData } = await supabase
    .from('recipes')
    .select('tags')

  const uniqueTags = new Set<string>()
  tagsData?.forEach((recipe) => {
    recipe.tags?.forEach((tag: string) => uniqueTags.add(tag))
  })

  const tagUrls: MetadataRoute.Sitemap = Array.from(uniqueTags).map((tag) => ({
    url: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/recipes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...recipeUrls,
    ...tagUrls,
  ]
}
