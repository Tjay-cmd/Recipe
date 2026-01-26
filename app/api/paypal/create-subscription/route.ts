import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isPayPalEnabled } from '@/lib/paypal/config'
import { createPayPalSubscription } from '@/lib/paypal/client'

export async function POST(request: NextRequest) {
  try {
    // Check if PayPal is enabled
    if (!isPayPalEnabled()) {
      return NextResponse.json(
        { error: 'PayPal checkout is not enabled' },
        { status: 400 }
      )
    }

    // Get the authorization token from the request header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      console.error('PayPal API - No authorization token provided')
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Create Supabase client and verify the token
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Verify the user with the token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Debug logging
    console.log('PayPal API - Auth Check:', {
      hasToken: !!token,
      hasUser: !!user,
      userEmail: user?.email,
      hasAuthError: !!authError,
      authError: authError?.message,
    })

    if (authError || !user || !user.email) {
      console.error('PayPal API - Unauthorized:', authError?.message || 'No user or email')
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    // Create PayPal subscription
    const { id: subscriptionId, approvalUrl } = await createPayPalSubscription(
      user.id,
      user.email
    )

    // Store subscription ID temporarily (user will complete payment)
    // We'll update it in the webhook when payment is confirmed
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        paypal_subscription_id: subscriptionId,
        status: 'incomplete', // Will be updated to 'active' via webhook
      })

    return NextResponse.json({
      subscriptionId,
      approvalUrl,
    })
  } catch (error: any) {
    console.error('PayPal subscription creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
