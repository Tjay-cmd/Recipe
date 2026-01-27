'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RecipeCard } from '@/components/RecipeCard'
import { Recipe } from '@/types/database'
import Link from 'next/link'
import { useToast } from '@/components/Toast'
import { ConfirmModal } from '@/components/ConfirmModal'

export default function AccountPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'pro' | 'admin'>('free')
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Check for PayPal redirect parameters
    const params = new URLSearchParams(window.location.search)
    const paypalStatus = params.get('paypal')
    
    if (paypalStatus === 'success') {
      // Show success message
      showToast('🎉 Payment successful! Your Pro subscription is now active.', 'success')
      // Remove query parameter
      window.history.replaceState({}, '', '/account')
    } else if (paypalStatus === 'cancelled') {
      showToast('Payment was cancelled. You can try again anytime.', 'info')
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

      console.log('🔍 User email:', user.email, 'Is admin:', isAdmin)

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

        console.log('📋 Subscription data:', subData)
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

  async function confirmCancelSubscription() {
    setCancelling(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        showToast('Please log in again to cancel your subscription', 'error')
        router.push('/login')
        return
      }

      const response = await fetch('/api/paypal/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel subscription')
      }

      showToast('✅ Subscription cancelled successfully. You can resubscribe anytime!', 'success')
      setSubscriptionStatus('free')
    } catch (error: any) {
      console.error('Cancel subscription error:', error)
      showToast(error.message || 'Failed to cancel subscription. Please try again.', 'error')
    } finally {
      setCancelling(false)
    }
  }

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
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-gray-900">My Account</h1>

      {/* Account Status */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-10 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {subscriptionStatus === 'admin' ? 'Account Status' : 'Subscription'}
        </h2>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-lg font-medium text-gray-700">Status:</span>
              <span className={`px-4 py-1.5 rounded-full font-bold text-sm capitalize ${
                subscriptionStatus === 'admin' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : subscriptionStatus === 'pro'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {subscriptionStatus}
              </span>
            </div>
            {subscriptionStatus === 'admin' && (
              <p className="text-gray-600">
                You have full access to manage recipes.{' '}
                <Link href="/admin" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                  Go to Admin Panel →
                </Link>
              </p>
            )}
            {subscriptionStatus === 'free' && (
              <p className="text-gray-600">
                Upgrade to Pro for meal plans, grocery lists, and more!
              </p>
            )}
            {subscriptionStatus === 'pro' && (
              <div>
                <p className="text-gray-600 mb-3">
                  🎉 You have access to all Pro features!
                </p>
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={cancelling}
                  className="text-sm text-red-600 hover:text-red-700 hover:underline transition-all disabled:opacity-50 font-medium"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            )}
          </div>
          {subscriptionStatus === 'free' && (
            <Link
              href="/pro"
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* Saved Recipes */}
      <div>
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Saved Recipes</h2>
        {savedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {savedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-16 text-center border border-gray-100">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No saved recipes yet</p>
            <p className="text-gray-600 mb-6">Start saving your favorite recipes to access them here!</p>
            <Link
              href="/recipes"
              className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Browse recipes →
            </Link>
          </div>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelSubscription}
        title="Cancel Pro Subscription?"
        message="Are you sure you want to cancel your Pro subscription? You will lose access to meal planning, shopping lists, exclusive recipes, and ad-free browsing."
        confirmText="Yes, Cancel"
        cancelText="Keep Pro"
        type="danger"
      />
    </div>
  )
}
