'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useToast } from './Toast'

export function ProCheckoutButton() {
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()
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
      showToast('PayPal checkout is not configured. Please contact support to upgrade.', 'error')
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
      showToast(error.message || 'Failed to start checkout. Please try again.', 'error')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full px-8 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      
      <div className="relative z-10 flex items-center justify-center gap-3">
        {loading ? (
          <>
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : paypalEnabled ? (
          <>
            {/* PayPal Logo SVG */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 01-.794.68H8.334c-.414 0-.736-.334-.653-.743l2.05-13.003a.805.805 0 01.794-.68h2.815c1.843 0 3.266.384 4.224 1.143.474.377.814.835 1.003 1.36l.5-.247z"/>
              <path d="M7.5 5.5h3.5c2.5 0 4.326.957 4.826 3.274.1.463.126.95.08 1.456-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.67 4.363a.678.678 0 01-.67.577H4.243c-.414 0-.736-.334-.653-.743L5.64 6.224a.805.805 0 01.794-.68l1.066-.044z"/>
            </svg>
            <span className="tracking-wide">Subscribe with PayPal</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        ) : (
          'Coming Soon'
        )}
      </div>
    </button>
  )
}
