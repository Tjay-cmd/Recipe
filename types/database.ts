export type Recipe = {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  ingredients: string[]
  steps: string[]
  prep_minutes: number
  cook_minutes: number
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard' | null
  tags: string[]
  is_pro: boolean
  views: number
  created_at: string
  updated_at: string
}

export type Favorite = {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
}

export type Profile = {
  id: string
  display_name: string | null
  created_at: string
  updated_at: string
}

export type EmailSubscriber = {
  id: string
  email: string
  subscribed_at: string
  verified: boolean
}

export type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export type RecipeWithFavorite = Recipe & {
  is_favorite?: boolean
}
