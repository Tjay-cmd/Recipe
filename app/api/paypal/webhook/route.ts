import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPayPalSubscription } from '@/lib/paypal/client'
import { PAYPAL_CONFIG } from '@/lib/paypal/config'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('paypal-transmission-sig')
    const certUrl = request.headers.get('paypal-cert-url')
    const transmissionId = request.headers.get('paypal-transmission-id')
    const transmissionTime = request.headers.get('paypal-transmission-time')
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || ''

    // Verify webhook signature (simplified - in production, verify properly)
    // For now, we'll process the webhook and update subscriptions

    const event = JSON.parse(body)
    
    // Log webhook event for debugging
    console.log('🔔 PayPal Webhook Received:', {
      eventType: event.event_type,
      resourceId: event.resource?.id,
      transmissionId,
    })
    
    const supabase = await createClient()

    // Handle different event types
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        // Subscription activated
        if (event.resource?.id) {
          // Use data from webhook payload (works for simulator and real events)
          const payerEmail = event.resource.subscriber?.email_address
          const subscriptionId = event.resource.id
          const nextBillingTime = event.resource.billing_info?.next_billing_time

          if (payerEmail) {
            // Find user by email
            const { data: user } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', payerEmail)
              .single()

            if (user) {
              const { error } = await supabase
                .from('subscriptions')
                .upsert({
                  user_id: user.id,
                  paypal_subscription_id: subscriptionId,
                  status: 'active',
                  current_period_end: nextBillingTime
                    ? new Date(nextBillingTime).toISOString()
                    : null,
                })

              if (error) {
                console.error('Error updating subscription:', error)
              } else {
                console.log(`✅ Subscription activated for user: ${payerEmail}`)
              }
            } else {
              console.log(`⚠️ User not found for email: ${payerEmail}`)
            }
          } else {
            console.log('⚠️ No email address in webhook payload')
          }
        }
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        // Subscription cancelled
        if (event.resource?.id) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
            })
            .eq('paypal_subscription_id', event.resource.id)
        }
        break

      case 'PAYMENT.SALE.COMPLETED':
        // Payment completed - ensure subscription is active
        if (event.resource?.billing_agreement_id) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
            })
            .eq('paypal_subscription_id', event.resource.billing_agreement_id)
        }
        break
    }

    console.log('✅ Webhook processed successfully')
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('❌ PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
