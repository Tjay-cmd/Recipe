'use client'

import React from 'react'
import Link from 'next/link'
import { Recipe } from '@/types/database'

interface PinterestFormProps {
  recipes: Recipe[]
  boards: { id: string; name: string }[]
  selectedRecipeId: string
  setSelectedRecipeId: (id: string) => void
  boardId: string
  setBoardId: (id: string) => void
  videoUrl: string
  setVideoUrl: (url: string) => void
  error: string
  submitting: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function PinterestForm(props: PinterestFormProps) {
  const {
    recipes,
    boards,
    selectedRecipeId,
    setSelectedRecipeId,
    boardId,
    setBoardId,
    videoUrl,
    setVideoUrl,
    error,
    submitting,
    onSubmit,
  } = props

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] font-sans">
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-lg">Y</span>
            Yum<span className="text-emerald-500">Spot</span>
          </h2>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <Link href="/admin" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Dashboard
          </Link>
          <Link href="/admin" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            Recipes
          </Link>
          <Link href="/admin/pinterest" className="flex items-center px-4 py-3 text-sm font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100/50 shadow-sm shadow-emerald-100/20">
            <svg className="w-5 h-5 mr-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Pin to Pinterest
          </Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 z-10">
          <div className="px-8 py-5 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Pin to Pinterest</h1>
            <Link href="/admin" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Back to Dashboard
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl">
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100/80 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Create a Pinterest Pin</h2>
              <p className="text-[15px] text-gray-500 mb-6">Select a recipe and board, then optionally add a video. The pin will link back to your recipe.</p>

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2">Recipe</label>
                  <select
                    value={selectedRecipeId}
                    onChange={(e) => setSelectedRecipeId(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-[15px]"
                  >
                    <option value="">Select a recipe...</option>
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2">Pinterest Board</label>
                  <select
                    value={boardId}
                    onChange={(e) => setBoardId(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-[15px]"
                  >
                    <option value="">Select a board...</option>
                    {boards.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {boards.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">Add PINTEREST_ACCESS_TOKEN to .env.local</p>
                  )}
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2">Video URL (optional)</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://... (from Media Downloader or direct video URL)"
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-[15px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to use the recipe cover image only.</p>
                </div>

                {error && (
                  <div className="flex items-center p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[15px]">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !selectedRecipeId || !boardId}
                  className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Creating pin...
                    </span>
                  ) : (
                    'Create Pin'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
