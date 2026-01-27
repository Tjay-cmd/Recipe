import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getPayPalAccessToken } from '@/lib/paypal/client'
import { getPayPalBaseUrl } from '@/lib/paypal/config'

export async function POST(request: NextRequest) {
  try {
    // Get the access token from the Authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      console.error('No authorization token provided')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the token and get user
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error in cancel-subscription:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Use service role key to bypass RLS for subscription queries
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user's subscription using admin client
    const { data: subscription, error: subError } = await adminSupabase
      .from('subscriptions')
      .select('paypal_subscription_id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    console.log('🔍 Subscription query result:', { subscription, subError })

    if (subError || !subscription?.paypal_subscription_id) {
      console.error('❌ No active subscription found for user:', user.id)
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

    // Update subscription status in database (already have adminSupabase from above)
    const { error: updateError } = await adminSupabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      // Continue anyway since PayPal cancellation succeeded
    } else {
      console.log('✅ Database updated - subscription cancelled')
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
