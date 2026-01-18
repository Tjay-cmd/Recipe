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
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  sugar_g: number | null
  sodium_mg: number | null
  cholesterol_mg: number | null
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

export type ShoppingListItem = {
  text: string
  checked: boolean
  recipe_id?: string
  recipe_title?: string
}

export type ShoppingList = {
  id: string
  user_id: string
  name: string
  items: ShoppingListItem[]
  created_at: string
  updated_at: string
}

export type MealPlan = {
  id: string
  user_id: string
  recipe_id: string
  planned_date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
  notes: string | null
  created_at: string
}

export type Rating = {
  id: string
  user_id: string
  recipe_id: string
  rating: number // 1-5
  created_at: string
  updated_at: string
}

export type Review = {
  id: string
  user_id: string
  recipe_id: string
  comment: string
  created_at: string
  updated_at: string
  profiles?: {
    display_name: string | null
  }
}

export type RecipeRatingStats = {
  average_rating: number
  total_ratings: number
  user_rating?: number | null
}
