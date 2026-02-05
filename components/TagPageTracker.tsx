'use client'

import { useEffect } from 'react'
import { trackCategoryView } from '@/lib/pinterest'

interface TagPageTrackerProps {
  tag: string
}

export function TagPageTracker({ tag }: TagPageTrackerProps) {
  useEffect(() => {
    trackCategoryView(tag)
  }, [tag])

  return null
}
