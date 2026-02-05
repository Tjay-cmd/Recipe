'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RecipeDetail } from './RecipeDetail'
import { Recipe } from '@/types/database'
import { trackRecipeView } from '@/lib/pinterest'

interface RecipeDetailWrapperProps {
  recipe: Recipe
}

export function RecipeDetailWrapper({ recipe }: RecipeDetailWrapperProps) {
  // Start with default values (same as server-side render)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    async function checkAuthStatus() {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser()

        if (!mounted) return

        if (!user) {
          // User not authenticated - use defaults
          setIsFavorite(false)
          setIsSubscribed(false)
          setIsLoading(false)
          return
        }

        // Check if recipe is favorited
        const { data: favoriteData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('recipe_id', recipe.id)
          .maybeSingle()

        if (!mounted) return

        setIsFavorite(!!favoriteData)

        // Check if user is subscribed (Pro)
        // Check if user is admin (admins get Pro access)
        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
        const isAdmin = user.email && adminEmails.includes(user.email)

        if (isAdmin) {
          setIsSubscribed(true)
          setIsLoading(false)
          return
        }

        // Check subscription status
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle()

        if (!mounted) return

        setIsSubscribed(!!subscriptionData)
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking auth status:', error)
        if (mounted) {
          setIsFavorite(false)
          setIsSubscribed(false)
          setIsLoading(false)
        }
      }
    }

    checkAuthStatus()

    // Track recipe view for Pinterest
    trackRecipeView(recipe.title, recipe.id)

    return () => {
      mounted = false
    }
  }, [recipe.id, recipe.title])

  // Render immediately with default values (prevents hydration mismatch)
  return (
    <RecipeDetail 
      recipe={recipe} 
      isSubscribed={isSubscribed} 
      isFavorite={isFavorite} 
    />
  )
}
