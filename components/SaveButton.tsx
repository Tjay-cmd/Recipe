'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SaveButtonProps {
  recipeId: string
  initialSaved?: boolean
}

export function SaveButton({ recipeId, initialSaved = false }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkSavedStatus()
  }, [recipeId])

  async function checkSavedStatus() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsSaved(false)
      return
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle() // Use maybeSingle() instead of single()

    setIsSaved(!!data)
  }

  async function handleToggle() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setIsLoading(true)

    if (isSaved) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)

      if (!error) {
        setIsSaved(false)
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          recipe_id: recipeId,
        })

      if (!error) {
        setIsSaved(true)
      }
    }

    setIsLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isSaved
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {isSaved ? (
        <>
          <span>✓</span>
          <span>Saved</span>
        </>
      ) : (
        <>
          <span>♡</span>
          <span>Save Recipe</span>
        </>
      )}
    </button>
  )
}
