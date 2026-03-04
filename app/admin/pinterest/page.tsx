'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Recipe } from '@/types/database'
import { useToast } from '@/components/Toast'
import { PinterestForm } from './PinterestForm'

export default function AdminPinterestPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [boards, setBoards] = useState<{ id: string; name: string }[]>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState('')
  const [boardId, setBoardId] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user?.email) {
        router.push('/')
        return
      }
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map((e) => e.trim()) || []
      if (!adminEmails.includes(user.email)) {
        router.push('/')
        return
      }
      setIsAdmin(true)
      setLoading(false)
    }
    checkAdmin()
  }, [router])

  useEffect(() => {
    if (isAdmin) {
      createClient()
        .from('recipes')
        .select('id, title, slug, description, cover_image_url, tags')
        .order('created_at', { ascending: false })
        .limit(50)
        .then(({ data }) => setRecipes((data as unknown as Recipe[]) || []))
    }
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/pinterest/boards', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.boards) setBoards(data.boards)
        })
        .catch(() => {})
    }
  }, [isAdmin])

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yumspot.co.za'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!selectedRecipe || !boardId) {
      setError('Select a recipe and board')
      return
    }
    if (!selectedRecipe.cover_image_url && !videoUrl) {
      setError('Recipe needs a cover image, or provide a video URL')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/pinterest/create-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          boardId,
          title: selectedRecipe.title,
          description: selectedRecipe.description || '',
          link: `${baseUrl}/recipes/${selectedRecipe.slug}`,
          coverImageUrl: selectedRecipe.cover_image_url || undefined,
          videoUrl: videoUrl || undefined,
          tags: Array.isArray(selectedRecipe.tags) ? selectedRecipe.tags : [],
        }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Pin created on Pinterest!', 'success')
        setVideoUrl('')
        setSelectedRecipeId('')
        setBoardId('')
      } else {
        setError(data.error || 'Failed to create pin')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FAFAFA]">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <PinterestForm
      recipes={recipes}
      boards={boards}
      selectedRecipeId={selectedRecipeId}
      setSelectedRecipeId={setSelectedRecipeId}
      boardId={boardId}
      setBoardId={setBoardId}
      videoUrl={videoUrl}
      setVideoUrl={setVideoUrl}
      error={error}
      submitting={submitting}
      onSubmit={handleSubmit}
    />
  )
}
