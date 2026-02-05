'use client'

import { useEffect } from 'react'
import { trackSearch } from '@/lib/pinterest'

interface SearchTrackerProps {
  searchQuery: string
}

export function SearchTracker({ searchQuery }: SearchTrackerProps) {
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      trackSearch(searchQuery.trim())
    }
  }, [searchQuery])

  return null
}
