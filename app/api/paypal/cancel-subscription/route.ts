import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPayPalAccessToken } from '@/lib/paypal/client'
import { getPayPalBaseUrl } from '@/lib/paypal/config'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('paypal_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription?.paypal_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Cancel subscription in PayPal
    const accessToken = await getPayPalAccessToken()
    const baseUrl = getPayPalBaseUrl()

    const response = await fetch(
      `${baseUrl}/v1/billing/subscriptions/${subscription.paypal_subscription_id}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason: 'Customer requested cancellation',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('PayPal cancellation error:', error)
      throw new Error('Failed to cancel subscription with PayPal')
    }

    // Update subscription status in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      // Continue anyway since PayPal cancellation succeeded
    }

    return NextResponse.json({ 
      success: true,
      message: 'Subscription cancelled successfully' 
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
