'use client'

import { isStripeEnabled } from '@/lib/stripe/config'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export function ProCheckoutButton() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const stripeEnabled = isStripeEnabled()

  async function handleClick() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?redirect=/pro')
      return
    }

    if (!stripeEnabled) {
      // Show coming soon message
      alert('Stripe checkout is coming soon! For now, please contact support to upgrade.')
      return
    }

    setLoading(true)
    // TODO: When Stripe is enabled, create checkout session here
    // const response = await fetch('/api/stripe/create-checkout', { ... })
    // const { url } = await response.json()
    // window.location.href = url
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Processing...' : stripeEnabled ? 'Subscribe to Pro' : 'Coming Soon'}
    </button>
  )
}
