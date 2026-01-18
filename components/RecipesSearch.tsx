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
  { value: 'trending', label: 'Trending (Most Views)' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'time_asc', label: 'Quickest First' },
  { value: 'time_desc', label: 'Longest First' },
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
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '')
  const [maxTime, setMaxTime] = useState(searchParams.get('max_time') || '')
  const [showFilters, setShowFilters] = useState(false)

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

    if (difficulty) {
      params.set('difficulty', difficulty)
    } else {
      params.delete('difficulty')
    }

    if (maxTime) {
      params.set('max_time', maxTime)
    } else {
      params.delete('max_time')
    }

    router.push(`/recipes?${params.toString()}`)
  }, [search, selectedTag, sort, difficulty, maxTime, router, searchParams])

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

      {/* Sort & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">Sort by:</p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Additional Filters Toggle */}
        <div className="flex items-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showFilters ? 'Hide Filters' : 'More Filters'}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Time (minutes)
            </label>
            <select
              value={maxTime}
              onChange={(e) => setMaxTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Any Time</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
