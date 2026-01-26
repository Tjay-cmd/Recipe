export const PAYPAL_CONFIG = {
  enabled: process.env.ENABLE_PAYPAL_CHECKOUT === 'true',
  clientId: process.env.PAYPAL_CLIENT_ID || '',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
  mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
  baseUrl: process.env.PAYPAL_MODE === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com',
}

// Client-side check (only checks if enabled flag is set)
export function isPayPalEnabled(): boolean {
  // On client side, check public env var
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_ENABLE_PAYPAL_CHECKOUT === 'true'
  }
  // On server side, check full config
  return PAYPAL_CONFIG.enabled && !!PAYPAL_CONFIG.clientId && !!PAYPAL_CONFIG.clientSecret
}

export function getPayPalBaseUrl(): string {
  return PAYPAL_CONFIG.baseUrl
}
