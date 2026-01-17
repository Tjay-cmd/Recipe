export const STRIPE_CONFIG = {
  enabled: process.env.ENABLE_STRIPE_CHECKOUT === 'true',
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
}

export function isStripeEnabled(): boolean {
  return STRIPE_CONFIG.enabled && !!STRIPE_CONFIG.publishableKey
}
