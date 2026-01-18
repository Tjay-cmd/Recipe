'use client'

import { useState } from 'react'

interface RatingStarsProps {
  rating: number // 0-5 (can be decimal like 4.5)
  interactive?: boolean
  size?: 'sm' | 'md' | 'lg'
  onRatingChange?: (rating: number) => void
  readonly?: boolean
}

export function RatingStars({ 
  rating, 
  interactive = false, 
  size = 'md',
  onRatingChange,
  readonly = false 
}: RatingStarsProps) {
  const [hoveredRating, setHoveredRating] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const displayRating = hoveredRating || rating
  const fullStars = Math.floor(displayRating)
  const hasHalfStar = displayRating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  function handleStarClick(star: number) {
    if (readonly || !interactive || !onRatingChange) return
    onRatingChange(star)
  }

  return (
    <div 
      className={`flex items-center gap-0.5 ${interactive && !readonly ? 'cursor-pointer' : ''}`}
      onMouseLeave={() => interactive && !readonly && setHoveredRating(0)}
    >
      {Array.from({ length: fullStars }).map((_, i) => (
        <svg
          key={`full-${i}`}
          className={`${sizeClasses[size]} text-amber-400 ${interactive && !readonly ? 'hover:text-amber-500' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          onClick={() => handleStarClick(i + 1)}
          onMouseEnter={() => interactive && !readonly && setHoveredRating(i + 1)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      
      {hasHalfStar && (
        <svg
          className={`${sizeClasses[size]} text-amber-400`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <defs>
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half-fill)"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      )}
      
      {Array.from({ length: emptyStars }).map((_, i) => (
        <svg
          key={`empty-${i}`}
          className={`${sizeClasses[size]} text-gray-300 ${interactive && !readonly ? 'hover:text-amber-400' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          onClick={() => handleStarClick(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
          onMouseEnter={() => interactive && !readonly && setHoveredRating(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}
