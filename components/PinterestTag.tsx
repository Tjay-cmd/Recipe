'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const PINTEREST_TAG_ID = '2613530522253'

export function PinterestTag() {
  useEffect(() => {
    // Load Pinterest base code
    if (typeof window !== 'undefined' && !window.pintrk) {
      // Create the pintrk function with required properties
      const pintrk: any = function () {
        pintrk.queue.push(Array.prototype.slice.call(arguments))
      }
      pintrk.queue = []
      pintrk.version = '3.0'
      
      // Assign to window
      window.pintrk = pintrk
      
      // Load the Pinterest script
      const t = document.createElement('script')
      t.async = true
      t.src = 'https://s.pinimg.com/ct/core.js'
      const r = document.getElementsByTagName('script')[0]
      r.parentNode?.insertBefore(t, r)
    }

    // Get user email for Enhanced Match
    const loadPinterestTag = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!window.pintrk) return

        if (session?.user?.email) {
          // Use Enhanced Match with user email
          window.pintrk('load', PINTEREST_TAG_ID, { em: session.user.email })
        } else {
          // Load without Enhanced Match
          window.pintrk('load', PINTEREST_TAG_ID)
        }

        // Track page view
        window.pintrk('page')
      } catch (error) {
        console.error('Error loading Pinterest tag:', error)
        // Fallback: load without Enhanced Match
        if (window.pintrk) {
          window.pintrk('load', PINTEREST_TAG_ID)
          window.pintrk('page')
        }
      }
    }

    // Small delay to ensure pintrk is loaded
    setTimeout(loadPinterestTag, 100)
  }, [])

  return (
    <>
      {/* Noscript fallback for users without JavaScript */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://ct.pinterest.com/v3/?event=init&tid=${PINTEREST_TAG_ID}&noscript=1`}
        />
      </noscript>
    </>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    pintrk?: {
      (action: string, ...args: any[]): void
      queue: any[]
      version: string
    }
  }
}
