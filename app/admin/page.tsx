'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AdminRecipeForm } from '@/components/AdminRecipeForm'
import { RecipeList } from '@/components/RecipeList'
import { Recipe } from '@/types/database'

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // TikTok/Pinterest downloader state
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [tiktokLoading, setTiktokLoading] = useState(false)
  const [tiktokError, setTiktokError] = useState('')
  const [tiktokSuccess, setTiktokSuccess] = useState('')

  useEffect(() => {
    const checkAdminAccess = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user || !user.email) {
        router.push('/')
        return
      }

      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
      
      if (!adminEmails.includes(user.email)) {
        router.push('/')
        return
      }

      setIsAdmin(true)
      setLoading(false)
    }

    checkAdminAccess()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  function handleEdit(recipe: Recipe) {
    setEditingRecipe(recipe)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSuccess() {
    setEditingRecipe(null)
    setRefreshTrigger(prev => prev + 1)
  }

  function handleCancelEdit() {
    setEditingRecipe(null)
  }

  async function handleTiktokDownload(e: React.FormEvent) {
    e.preventDefault()
    setTiktokError('')
    setTiktokSuccess('')

    if (!tiktokUrl.trim()) {
      setTiktokError('Please enter a URL')
      return
    }

    setTiktokLoading(true)

    try {
      const response = await fetch('/api/tiktok-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiktokUrl: tiktokUrl.trim() }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Download failed' }))
        setTiktokError(data.error || 'Download failed. Please try again.')
        setTiktokLoading(false)
        return
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition') || ''
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : 'downloaded_media.mp4'

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      setTiktokSuccess(`Successfully downloaded: ${filename}`)
      setTiktokUrl('')
    } catch {
      setTiktokError('Something went wrong. Please try again.')
    } finally {
      setTiktokLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-lg">Y</span>
            Yum<span className="text-emerald-500">Spot</span>
          </h2>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <Link href="/admin" className="flex items-center px-4 py-3 text-sm font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100/50 shadow-sm shadow-emerald-100/20">
            <svg className="w-5 h-5 mr-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Dashboard
          </Link>
          <Link href="/admin" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            Recipes
          </Link>
          <Link href="/admin/pinterest" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Pin to Pinterest
          </Link>
          <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Users
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 z-10">
          <div className="px-8 py-5 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Recipe Management</h1>
            <div className="flex items-center gap-5">
              <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-tr from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center text-emerald-800 font-bold border border-emerald-300 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 xl:grid xl:grid-cols-12 xl:gap-8 flex flex-col gap-6">
            
            {/* Left/Middle Column (Downloader & Form) */}
            <div className="xl:col-span-8 flex flex-col gap-6">
              
              {/* Media Downloader Card */}
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100/80 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-32 -mt-32"></div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2 relative z-10">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Media Downloader
                </h2>
                <p className="text-[15px] text-gray-500 mb-5 relative z-10">Paste a Pinterest or TikTok link below to fetch and download high-quality media directly.</p>

                <form onSubmit={handleTiktokDownload} className="relative z-10">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      </div>
                      <input
                        type="url"
                        value={tiktokUrl}
                        onChange={(e) => {
                          setTiktokUrl(e.target.value)
                          setTiktokError('')
                          setTiktokSuccess('')
                        }}
                        placeholder="https://www.pinterest.com/pin/..."
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-gray-50/50 hover:bg-white transition-colors text-[15px]"
                        disabled={tiktokLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={tiktokLoading || !tiktokUrl}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                    >
                      {tiktokLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Fetching...
                        </>
                      ) : (
                        'Download'
                      )}
                    </button>
                  </div>

                  {tiktokError && (
                    <div className="mt-4 flex items-center p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[15px]">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {tiktokError}
                    </div>
                  )}
                  {tiktokSuccess && (
                    <div className="mt-4 flex items-center p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[15px]">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {tiktokSuccess}
                    </div>
                  )}
                </form>
              </div>

              {/* Add/Edit Recipe Form Container */}
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100/80 p-0 overflow-hidden">
                <div className="px-6 md:px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingRecipe ? 'Edit Recipe: ' : 'Create New Recipe'}
                    {editingRecipe && <span className="text-emerald-600 font-semibold truncate ml-1">{editingRecipe.title}</span>}
                  </h2>
                  {editingRecipe && (
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <div className="p-6 md:p-8">
                  <AdminRecipeForm 
                    recipe={editingRecipe} 
                    onSuccess={handleSuccess}
                  />
                </div>
              </div>
            </div>

            {/* Right Column (Existing Recipes) */}
            <div className="xl:col-span-4">
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100/80 p-0 xl:sticky xl:top-[120px] max-h-[calc(100vh-140px)] flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100 bg-white">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center justify-between">
                    Existing Recipes
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">Manage</span>
                  </h2>
                </div>
                <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
                  <RecipeList 
                    onEdit={handleEdit}
                    refreshTrigger={refreshTrigger}
                  />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
      
      {/* Global CSS for custom scrollbar in sidebar/recipe list */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
        }
      `}} />
    </div>
  )
}
