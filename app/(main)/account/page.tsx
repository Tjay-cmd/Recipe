'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RecipeCard } from '@/components/RecipeCard'
import { Recipe } from '@/types/database'
import Link from 'next/link'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'pro' | 'admin'>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Check for PayPal redirect parameters
    const params = new URLSearchParams(window.location.search)
    const paypalStatus = params.get('paypal')
    
    if (paypalStatus === 'success') {
      // Show success message
      alert('Payment successful! Your Pro subscription is now active.')
      // Remove query parameter
      window.history.replaceState({}, '', '/account')
    } else if (paypalStatus === 'cancelled') {
      alert('Payment was cancelled. You can try again anytime.')
      window.history.replaceState({}, '', '/account')
    }

    // Check auth status
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Check if user is admin
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
      const isAdmin = user.email && adminEmails.includes(user.email)

      if (isAdmin) {
        setSubscriptionStatus('admin')
      } else {
        // Fetch subscription status (only if not admin)
        // Refresh subscription status after PayPal redirect
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle()

        setSubscriptionStatus(subData ? 'pro' : 'free')
      }

      // Fetch saved recipes
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', user.id)

      if (favoritesData && favoritesData.length > 0) {
        const recipeIds = favoritesData.map((f) => f.recipe_id)
        const { data: recipes } = await supabase
          .from('recipes')
          .select('*')
          .in('id', recipeIds)
          .order('created_at', { ascending: false })

        setSavedRecipes(recipes || [])
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">My Account</h1>

      {/* Account Status */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {subscriptionStatus === 'admin' ? 'Account Status' : 'Subscription'}
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg">
              Status: <span className={`font-semibold capitalize ${subscriptionStatus === 'admin' ? 'text-emerald-600' : ''}`}>
                {subscriptionStatus}
              </span>
            </p>
            {subscriptionStatus === 'admin' && (
              <p className="text-sm text-gray-600 mt-1">
                You have full access to manage recipes.{' '}
                <Link href="/admin" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Go to Admin Panel →
                </Link>
              </p>
            )}
            {subscriptionStatus === 'free' && (
              <p className="text-sm text-gray-600 mt-1">
                Upgrade to Pro for meal plans, grocery lists, and more!
              </p>
            )}
            {subscriptionStatus === 'pro' && (
              <p className="text-sm text-gray-600 mt-1">
                You have access to all Pro features!
              </p>
            )}
          </div>
          {subscriptionStatus === 'free' && (
            <Link
              href="/pro"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* Saved Recipes */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Saved Recipes</h2>
        {savedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">You haven't saved any recipes yet.</p>
            <Link
              href="/recipes"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Browse recipes →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
