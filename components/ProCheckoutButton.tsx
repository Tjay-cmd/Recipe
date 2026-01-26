'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export function ProCheckoutButton() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  // Check PayPal enabled status directly from env var
  const paypalEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYPAL_CHECKOUT === 'true'

  async function handleClick() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?redirect=/pro')
      return
    }

    if (!paypalEnabled) {
      alert('PayPal checkout is not configured. Please contact support to upgrade.')
      return
    }

    setLoading(true)
    try {
      // Get the session to pass to API
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login?redirect=/pro')
        return
      }

      // Create PayPal subscription
      const response = await fetch('/api/paypal/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        
        // If unauthorized, redirect to login
        if (response.status === 401) {
          router.push('/login?redirect=/pro')
          return
        }
        
        throw new Error(error.error || 'Failed to create subscription')
      }

      const { approvalUrl } = await response.json()

      if (approvalUrl) {
        // Redirect to PayPal approval page
        window.location.href = approvalUrl
      } else {
        throw new Error('No approval URL received')
      }
    } catch (error: any) {
      console.error('PayPal checkout error:', error)
      alert(error.message || 'Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          <span>Processing...</span>
        </>
      ) : paypalEnabled ? (
        <>
          <span>💳</span>
          <span>Subscribe with PayPal</span>
        </>
      ) : (
        'Coming Soon'
      )}
    </button>
  )
}
