/**
 * Pinterest Conversion Tracking Utilities
 * 
 * Use these functions to track important events:
 * - User signups
 * - Pro subscriptions
 * - Recipe views
 * - Email subscriptions
 * - Shopping list creation
 * - Category views
 * - Searches
 */

// Pinterest standard event types
export type PinterestEvent =
  | 'pagevisit'
  | 'signup'
  | 'checkout'
  | 'addtocart'
  | 'lead'
  | 'search'
  | 'viewcategory'
  | 'watchvideo'
  | 'custom'

/**
 * Generate a unique event ID for tracking
 */
function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Track a Pinterest conversion event
 * Uses Pinterest's standard event format
 */
export function trackPinterestEvent(
  event: PinterestEvent,
  data?: {
    event_id?: string
    value?: number
    currency?: string
    order_quantity?: number
    order_id?: string
    product_name?: string
    product_id?: string
    product_price?: number
    product_quantity?: number
    lead_type?: string
    search_query?: string
    product_category?: string
    video_title?: string
    property?: string
  }
) {
  if (typeof window === 'undefined' || !window.pintrk) {
    console.warn('Pinterest tag not loaded')
    return
  }

  const eventData: any = {
    event_id: data?.event_id || generateEventId(),
  }

  // Add event-specific parameters
  if (data) {
    if (data.value !== undefined) eventData.value = data.value
    if (data.currency) eventData.currency = data.currency
    if (data.order_quantity !== undefined) eventData.order_quantity = data.order_quantity
    if (data.order_id) eventData.order_id = data.order_id
    if (data.product_name) eventData.product_name = data.product_name
    if (data.product_id) eventData.product_id = data.product_id
    if (data.product_price !== undefined) eventData.product_price = data.product_price
    if (data.product_quantity !== undefined) eventData.product_quantity = data.product_quantity
    if (data.lead_type) eventData.lead_type = data.lead_type
    if (data.search_query) eventData.search_query = data.search_query
    if (data.product_category) eventData.product_category = data.product_category
    if (data.video_title) eventData.video_title = data.video_title
    if (data.property) eventData.property = data.property
  }

  // Pinterest format: pintrk('track', 'eventname', { data })
  window.pintrk('track', event, eventData)
}

/**
 * Track a user signup
 * Pinterest standard event: signup
 */
export function trackSignup() {
  trackPinterestEvent('signup', {
    event_id: generateEventId(),
  })
}

/**
 * Track a Pro subscription purchase
 * Pinterest standard event: checkout
 */
export function trackProSubscription(price: number, currency: string = 'USD', orderId?: string) {
  trackPinterestEvent('checkout', {
    event_id: generateEventId(),
    value: price,
    currency,
    order_quantity: 1,
    order_id: orderId || `pro_${Date.now()}`,
    product_name: 'YumSpot Pro',
    product_id: 'pro-subscription',
  })
}

/**
 * Track a recipe page view
 * Pinterest standard event: pagevisit
 */
export function trackRecipeView(recipeTitle: string, recipeId: string) {
  trackPinterestEvent('pagevisit', {
    event_id: generateEventId(),
    product_name: recipeTitle,
    product_id: recipeId,
  })
}

/**
 * Track email subscription (Newsletter lead)
 * Pinterest standard event: lead with lead_type: 'Newsletter'
 */
export function trackEmailSubscribe() {
  trackPinterestEvent('lead', {
    event_id: generateEventId(),
    lead_type: 'Newsletter',
  })
}

/**
 * Track shopping list creation
 * Pinterest standard event: addtocart
 */
export function trackShoppingListCreated(value?: number) {
  trackPinterestEvent('addtocart', {
    event_id: generateEventId(),
    value: value || 0,
    currency: 'USD',
    order_quantity: 1,
    product_name: 'Shopping List',
    product_id: 'shopping-list',
  })
}

/**
 * Track category/tag page view
 * Pinterest standard event: viewcategory
 */
export function trackCategoryView(categoryName: string) {
  trackPinterestEvent('viewcategory', {
    event_id: generateEventId(),
    product_category: categoryName,
  })
}

/**
 * Track search query
 * Pinterest standard event: search
 */
export function trackSearch(searchQuery: string) {
  trackPinterestEvent('search', {
    event_id: generateEventId(),
    search_query: searchQuery,
  })
}
