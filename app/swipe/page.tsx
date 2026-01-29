'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SwipeRecipeCard from '@/components/SwipeRecipeCard'
import { SwipeCandidate, SwipeRecommendation } from '@/types/database'
import { X, Heart, SkipForward, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type SwipeDirection = 'left' | 'right' | 'up'

export default function SwipePage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<SwipeCandidate[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [swipeCount, setSwipeCount] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [recommendations, setRecommendations] = useState<SwipeRecommendation[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Gesture state
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const SWIPE_THRESHOLD = 100
  const SESSION_SIZE = 15 // Show summary after this many swipes
  const [isRestarting, setIsRestarting] = useState(false)

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login?redirectTo=/swipe')
        return
      }
      
      setIsAuthenticated(true)
      setCheckingAuth(false)
    }
    
    checkAuth()
  }, [router])

  // Fetch candidates only after auth is confirmed
  useEffect(() => {
    if (isAuthenticated && !checkingAuth) {
      fetchCandidates()
    }
  }, [isAuthenticated, checkingAuth])

  async function fetchCandidates() {
    try {
      setIsLoading(true)
      
      // Get the access token from the client
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No auth session')
      }
      
      const response = await fetch('/api/swipe/candidates', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }

      const data = await response.json()
      setCandidates(data.candidates || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes')
    } finally {
      setIsLoading(false)
    }
  }

  async function recordSwipe(recipeId: string, preference: 'like' | 'dislike' | 'skip') {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) return
      
      await fetch('/api/swipe/record', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ recipeId, preference }),
        credentials: 'include',
      })
    } catch (err) {
      console.error('Failed to record swipe:', err)
    }
  }

  async function fetchRecommendations() {
    try {
      setLoadingRecommendations(true)
      
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setRecommendations([])
        return
      }
      
      const response = await fetch('/api/swipe/recommendations?limit=10', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch recommendations')

      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error('Failed to load recommendations:', err)
      setRecommendations([])
    } finally {
      setLoadingRecommendations(false)
    }
  }

  function handleSwipe(direction: SwipeDirection) {
    if (currentIndex >= candidates.length) return

    const currentRecipe = candidates[currentIndex]
    let preference: 'like' | 'dislike' | 'skip'

    if (direction === 'right') {
      preference = 'like'
    } else if (direction === 'left') {
      preference = 'dislike'
    } else {
      preference = 'skip'
    }

    // Record the swipe
    recordSwipe(currentRecipe.id, preference)

    // Update UI
    setSwipeCount((prev) => prev + 1)
    setCurrentIndex((prev) => prev + 1)

    // Show summary after SESSION_SIZE swipes
    if (swipeCount + 1 >= SESSION_SIZE) {
      setShowSummary(true)
      fetchRecommendations()
    }
  }

  async function resetAndRestart() {
    try {
      setIsRestarting(true)
      setIsLoading(true)
      
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setIsRestarting(false)
        setIsLoading(false)
        return
      }
      
      console.log('[Reset] Starting reset process...')
      
      // Reset swipe history in database
      const response = await fetch('/api/swipe/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to reset swipes')
      }

      console.log('[Reset] Database reset successful')

      // Reset all UI state
      setShowSummary(false)
      setCurrentIndex(0)
      setSwipeCount(0)
      setRecommendations([])
      setError(null)
      
      // Wait for database to process deletion
      await new Promise(resolve => setTimeout(resolve, 800))
      
      console.log('[Reset] Fetching fresh candidates...')
      
      // Fetch fresh candidates
      await fetchCandidates()
      
      console.log('[Reset] Reset complete!')
      setIsRestarting(false)
    } catch (err) {
      console.error('Failed to reset and restart:', err)
      setIsRestarting(false)
      setIsLoading(false)
      setError('Failed to reset. Please try again.')
    }
  }

  // Gesture handlers (optimized for mobile)
  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault() // Prevent default touch behavior
    setIsDragging(true)
    setDragStart({ x: e.clientX || e.touches?.[0]?.clientX, y: e.clientY || e.touches?.[0]?.clientY })
    if (cardRef.current) {
      cardRef.current.style.transition = 'none'
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return
    e.preventDefault() // Prevent scrolling while swiping

    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    
    const offsetX = clientX - dragStart.x
    const offsetY = clientY - dragStart.y
    setDragOffset({ x: offsetX, y: offsetY })
  }

  function handlePointerUp() {
    if (!isDragging) return

    setIsDragging(false)

    const { x, y } = dragOffset

    // Determine swipe direction based on offset
    if (Math.abs(x) > SWIPE_THRESHOLD) {
      // Add swipe-off animation
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s ease'
        cardRef.current.style.transform = `translateX(${x > 0 ? '150%' : '-150%'}) rotate(${x > 0 ? '20deg' : '-20deg'})`
      }
      
      // Delay state update for smooth animation
      setTimeout(() => {
        if (x > 0) {
          handleSwipe('right')
        } else {
          handleSwipe('left')
        }
      }, 150)
    } else if (y < -SWIPE_THRESHOLD) {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s ease'
        cardRef.current.style.transform = `translateY(-150%)`
      }
      setTimeout(() => {
        handleSwipe('up')
      }, 150)
    } else {
      // Snap back to center if threshold not met
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s ease'
      }
    }

    // Reset drag offset
    setDragOffset({ x: 0, y: 0 })
  }

  // Keyboard support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (showSummary) return

      if (e.key === 'ArrowLeft') {
        handleSwipe('left')
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right')
      } else if (e.key === 'ArrowUp') {
        handleSwipe('up')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, candidates, showSummary])

  function startNewSession() {
    setShowSummary(false)
    setCurrentIndex(0)
    setSwipeCount(0)
    setRecommendations([])
    fetchCandidates()
  }

  async function resetSwipeHistory() {
    await resetAndRestart()
  }

  if (checkingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {checkingAuth 
              ? 'Checking authentication...' 
              : isRestarting 
                ? '🔄 Starting fresh... Get ready to swipe again!' 
                : 'Loading delicious recipes...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCandidates}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Sparkles className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Perfect Matches!</h1>
            <p className="text-gray-600">Based on your swipes, we think you'll love these recipes</p>
          </div>

          {/* Recommendations Grid */}
          {loadingRecommendations ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Finding your perfect matches...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {recommendations.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48 bg-gray-200">
                    {recipe.cover_image_url ? (
                      <Image
                        src={recipe.cover_image_url}
                        alt={recipe.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-200 to-red-200">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    {recipe.is_pro && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        PRO
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{recipe.total_minutes} min</span>
                      <span>{recipe.servings} servings</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No recommendations yet. Keep swiping to build your profile!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={startNewSession}
              className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              Swipe More Recipes
            </button>
            <Link
              href="/account"
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              View Saved Recipes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentRecipe = candidates[currentIndex]
  const hasMore = currentIndex < candidates.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header - Mobile Optimized */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm sm:text-base">Back to Home</span>
          </Link>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-600">
              {swipeCount} swipes • {candidates.length - currentIndex} remaining
            </p>
            <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
              (Already swiped recipes are excluded)
            </p>
          </div>
        </div>

        {/* Main Swipe Area */}
        {hasMore && currentRecipe ? (
          <div className="max-w-lg mx-auto px-2">
            {/* Card Stack */}
            <div className="relative h-[600px] sm:h-[650px] mb-8 touch-none">
              {/* Next card (preview) */}
              {currentIndex + 1 < candidates.length && (
                <div className="absolute inset-0 scale-95 opacity-50">
                  <SwipeRecipeCard recipe={candidates[currentIndex + 1]} />
                </div>
              )}

              {/* Current card */}
              <div
                ref={cardRef}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{
                  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <SwipeRecipeCard recipe={currentRecipe} />

                {/* Swipe indicators */}
                {isDragging && (
                  <>
                    {dragOffset.x > 50 && (
                      <div className="absolute top-20 right-8 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-2xl rotate-12 shadow-xl">
                        LIKE
                      </div>
                    )}
                    {dragOffset.x < -50 && (
                      <div className="absolute top-20 left-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-2xl -rotate-12 shadow-xl">
                        NOPE
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex justify-center gap-3 sm:gap-4 px-4">
              <button
                onClick={() => handleSwipe('left')}
                className="p-5 sm:p-4 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-red-50 transition-all group active:scale-95"
                aria-label="Dislike"
              >
                <X className="w-7 h-7 sm:w-8 sm:h-8 text-red-500 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={() => handleSwipe('up')}
                className="p-5 sm:p-4 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-yellow-50 transition-all group active:scale-95"
                aria-label="Skip"
              >
                <SkipForward className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={() => handleSwipe('right')}
                className="p-5 sm:p-4 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-green-50 transition-all group active:scale-95"
                aria-label="Like"
              >
                <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-green-500 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Instructions - Responsive */}
            <div className="text-center mt-6 text-sm text-gray-600 px-4">
              <p className="mb-2 hidden sm:block">Swipe right to like • Swipe left to pass • Swipe up to skip</p>
              <p className="mb-2 sm:hidden">Swipe or tap buttons below</p>
              <p className="text-xs hidden sm:block">Or use arrow keys on desktop</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">You've swiped all available recipes!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You've seen all the recipes we have. Want to swipe through them again, or check your saved favorites?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetSwipeHistory}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold shadow-md hover:shadow-lg"
              >
                🔄 Reset & Swipe Again
              </button>
              <Link
                href="/account"
                className="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-semibold"
              >
                View Saved Recipes
              </Link>
              <Link
                href="/"
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
