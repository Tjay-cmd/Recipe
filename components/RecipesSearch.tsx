'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

interface RecipesSearchProps {
  initialSearch?: string
  initialTag?: string
  initialSort?: string
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'trending', label: 'Trending' },
  { value: 'saved', label: 'Most Saved' },
]

const POPULAR_TAGS = [
  'Airfryer',
  'High Protein',
  'Budget',
  'Dessert',
  '15-Min',
  'Chicken',
  'Pasta',
]

export function RecipesSearch({ initialSearch, initialTag, initialSort }: RecipesSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch || '')
  const [selectedTag, setSelectedTag] = useState(initialTag || '')
  const [sort, setSort] = useState(initialSort || 'newest')

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }

    if (selectedTag) {
      params.set('tag', selectedTag)
    } else {
      params.delete('tag')
    }

    if (sort && sort !== 'newest') {
      params.set('sort', sort)
    } else {
      params.delete('sort')
    }

    router.push(`/recipes?${params.toString()}`)
  }, [search, selectedTag, sort, router, searchParams])

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Tag Filters */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Filter by category:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              !selectedTag
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTag === tag
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Sort by:</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
