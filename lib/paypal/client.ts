import { PAYPAL_CONFIG, getPayPalBaseUrl } from './config'

export async function getPayPalAccessToken(): Promise<string> {
  const baseUrl = getPayPalBaseUrl()
  const auth = Buffer.from(`${PAYPAL_CONFIG.clientId}:${PAYPAL_CONFIG.clientSecret}`).toString('base64')

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal auth failed: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function createPayPalSubscription(userId: string, userEmail: string): Promise<{ id: string; approvalUrl: string }> {
  const accessToken = await getPayPalAccessToken()
  const baseUrl = getPayPalBaseUrl()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const planId = process.env.PAYPAL_PLAN_ID

  if (!planId) {
    throw new Error('PayPal plan ID is not configured. Please set PAYPAL_PLAN_ID in environment variables.')
  }

  // Create subscription using existing plan ID
  const subscriptionData = {
    plan_id: planId,
    custom_id: userId, // Pass user ID so webhook can identify the user
    start_time: new Date(Date.now() + 60000).toISOString(), // Start 1 minute from now
    subscriber: {
      email_address: userEmail,
    },
    application_context: {
      brand_name: 'YumSpot',
      locale: 'en-US',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      payment_method: {
        payer_selected: 'PAYPAL',
        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
      },
      return_url: `${appUrl}/account?paypal=success`,
      cancel_url: `${appUrl}/pro?paypal=cancelled`,
    },
  }

  const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(subscriptionData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('PayPal API Error:', errorText)
    throw new Error(`PayPal subscription creation failed: ${errorText}`)
  }

  const data = await response.json()
  const approveLink = data.links?.find((link: any) => link.rel === 'approve')
  
  if (!approveLink?.href) {
    throw new Error('No approval URL received from PayPal')
  }

  return {
    id: data.id,
    approvalUrl: approveLink.href,
  }
}

export async function getPayPalPlansByProduct(productId: string): Promise<any[]> {
  const accessToken = await getPayPalAccessToken()
  const baseUrl = getPayPalBaseUrl()

  const response = await fetch(`${baseUrl}/v1/billing/plans?product_id=${productId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get PayPal plans: ${response.statusText}`)
  }

  const data = await response.json()
  return data.plans || []
}

export async function getPayPalSubscription(subscriptionId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken()
  const baseUrl = getPayPalBaseUrl()

  const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get PayPal subscription: ${response.statusText}`)
  }

  return response.json()
}
