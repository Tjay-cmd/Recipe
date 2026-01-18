'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import Link from 'next/link'

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
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

    // Check if user is admin
    if (user.email) {
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
      setIsAdmin(adminEmails.includes(user.email))
    }

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
          <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Sign in as an admin to view analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to view analytics.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  // Admin - show analytics
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">View your site's performance and engagement metrics</p>
      </div>
      
      <AnalyticsDashboard />
    </div>
  )
}
