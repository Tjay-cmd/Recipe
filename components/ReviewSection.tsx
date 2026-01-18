'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RatingStars } from './RatingStars'
import { Review, RecipeRatingStats } from '@/types/database'

interface ReviewSectionProps {
  recipeId: string
}

export function ReviewSection({ recipeId }: ReviewSectionProps) {
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<RecipeRatingStats | null>(null)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    
    async function init() {
      await checkUser(supabase)
      await loadReviews(supabase)
    }
    
    init()
  }, [recipeId])

  async function checkUser(supabase: ReturnType<typeof createClient>) {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      loadUserRating(supabase)
    }
  }

  async function loadReviews(supabase: ReturnType<typeof createClient>) {
    try {
      // Load reviews without profile join (no foreign key relationship exists)
      // This works for both logged-in and logged-out users
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false })

      if (reviewsError) {
        console.error('Error loading reviews:', reviewsError)
        // If table doesn't exist (42P01), that's okay - show empty state
        if (reviewsError.code === '42P01') {
          setReviews([])
          setStats({
            average_rating: 0,
            total_ratings: 0,
          })
          setLoading(false)
          return
        }
        // For any other error, set empty state to prevent crashes
        setReviews([])
      } else if (reviewsData) {
        // Map reviews to add placeholder profiles data (for display_name)
        const reviewsWithProfiles = reviewsData.map((review: any) => ({
          ...review,
          profiles: {
            display_name: null // Will show as "Anonymous User" in UI
          }
        }))
        setReviews(reviewsWithProfiles as Review[])
      } else {
        setReviews([])
      }

      // Load rating stats
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('rating')
        .eq('recipe_id', recipeId)

      if (ratingsError) {
        console.error('Error loading ratings:', ratingsError)
        // If table doesn't exist or any error, set empty stats
        setStats({
          average_rating: 0,
          total_ratings: 0,
        })
      } else if (ratingsData && ratingsData.length > 0) {
        const total = ratingsData.reduce((sum, r) => sum + r.rating, 0)
        const average = total / ratingsData.length
        setStats({
          average_rating: average,
          total_ratings: ratingsData.length,
        })
      } else {
        setStats({
          average_rating: 0,
          total_ratings: 0,
        })
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      // Set empty state on any error
      setReviews([])
      setStats({
        average_rating: 0,
        total_ratings: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadUserRating(supabase: ReturnType<typeof createClient>) {
    if (!user) return

    const { data: ratingData } = await supabase
      .from('ratings')
      .select('rating')
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (ratingData) {
      setUserRating(ratingData.rating)
      setRating(ratingData.rating)
    }

    const { data: reviewData } = await supabase
      .from('reviews')
      .select('*')
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (reviewData) {
      setUserReview(reviewData as Review)
      setComment(reviewData.comment)
    }
  }

  async function submitRating() {
    if (!user || !rating) return

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('ratings')
        .upsert({
          user_id: user.id,
          recipe_id: recipeId,
          rating: rating,
        })

      if (error) throw error

      setUserRating(rating)
      await loadReviews(supabase)
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  async function submitReview() {
    if (!user || !comment.trim()) return

    setSubmitting(true)
    try {
      const supabase = createClient()
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({ comment: comment.trim() })
          .eq('id', userReview.id)

        if (error) throw error
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            recipe_id: recipeId,
            comment: comment.trim(),
          })

        if (error) throw error
      }

      await loadReviews(supabase)
      await loadUserRating(supabase)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteReview() {
    if (!user || !userReview) return
    if (!confirm('Delete your review?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', userReview.id)

      if (error) throw error

      setUserReview(null)
      setComment('')
      await loadReviews(supabase)
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold mb-6">Ratings & Reviews</h2>

      {/* Rating Stats */}
      {stats && stats.total_ratings > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-3xl font-bold">{stats.average_rating.toFixed(1)}</div>
              <RatingStars rating={stats.average_rating} readonly size="sm" />
            </div>
            <div className="text-gray-600">
              Based on {stats.total_ratings} {stats.total_ratings === 1 ? 'rating' : 'ratings'}
            </div>
          </div>
        </div>
      )}

      {/* Submit Rating */}
      {user && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">Rate this recipe</h3>
          <div className="flex items-center gap-4 mb-3">
            <RatingStars
              rating={rating}
              interactive
              onRatingChange={setRating}
            />
            {rating > 0 && (
              <button
                onClick={submitRating}
                disabled={submitting || userRating === rating}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {userRating === rating ? 'Rated' : 'Submit Rating'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Submit Review */}
      {user && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">Write a review</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this recipe..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={submitReview}
              disabled={submitting || !comment.trim()}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {userReview ? 'Update Review' : 'Submit Review'}
            </button>
            {userReview && (
              <button
                onClick={deleteReview}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Delete Review
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900">
                  {review.profiles?.display_name || 'Anonymous User'}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </section>
  )
}
