'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingList } from '@/components/ShoppingList'
import { MealPlanner } from '@/components/MealPlanner'
import Link from 'next/link'

export default function ShoppingListPage() {
  const [user, setUser] = useState<any>(null)
  const [isProUser, setIsProUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'shopping' | 'meals'>('shopping')
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    setUser(user)

    // Check if user is admin (admins get Pro access automatically)
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
    const isAdmin = user.email ? adminEmails.includes(user.email) : false

    if (isAdmin) {
      setIsProUser(true)
      setLoading(false)
      return
    }

    // Check if user has active Pro subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    setIsProUser(!!subscription)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <h1 className="text-3xl font-bold mb-4">Shopping Lists</h1>
          <p className="text-gray-600 mb-6">
            Sign in to create and manage your shopping lists!
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Not Pro user - show upgrade prompt
  if (!isProUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-emerald-50 to-amber-50 rounded-lg shadow-lg border border-emerald-200 p-12 text-center">
          <div className="mb-6">
            <div className="inline-block p-4 bg-emerald-500 rounded-full mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-3">Shopping Lists</h1>
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold mb-4">
              ⭐ PRO FEATURE
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-8">
            Upgrade to <strong>Pro</strong> to unlock smart shopping lists and meal planning!
          </p>

          <div className="bg-white rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold mb-3">With Pro, you can:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>Create unlimited shopping lists</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>Add recipe ingredients with one click</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>Check off items as you shop</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>Plan your weekly meals with calendar view</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>Access exclusive Pro recipes</span>
              </li>
            </ul>
          </div>

          <Link
            href="/pro"
            className="inline-block px-8 py-4 bg-emerald-500 text-white rounded-lg font-semibold text-lg hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg"
          >
            Upgrade to Pro →
          </Link>

          <p className="text-sm text-gray-600 mt-4">
            Only $9.99/month • Cancel anytime
          </p>
        </div>
      </div>
    )
  }

  // Pro user - show shopping list
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('shopping')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'shopping'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Shopping Lists
        </button>
        <button
          onClick={() => setActiveTab('meals')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'meals'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Meal Planner
        </button>
      </div>

      {/* Content */}
      {activeTab === 'shopping' ? <ShoppingList /> : <MealPlanner />}
    </div>
  )
}
