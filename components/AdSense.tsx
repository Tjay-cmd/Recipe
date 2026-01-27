'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Script from 'next/script'

interface AdSenseProps {
  adSlot: string // Your AdSense ad unit ID (e.g., '1234567890')
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  style?: React.CSSProperties
  className?: string
  responsive?: boolean
  minContentLength?: number // Minimum content length to show ads (default: 500 chars)
  hasSubstantialContent?: boolean // Explicit flag for substantial content
}

export function AdSense({ 
  adSlot, 
  adFormat = 'auto',
  style,
  className = '',
  responsive = true,
  hasSubstantialContent = true, // Default to true, but should be set explicitly
}: AdSenseProps) {
  const [showAds, setShowAds] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Get publisher ID first (needed for hook dependencies)
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

  // IMPORTANT: All hooks must come before any conditional returns!
  useEffect(() => {
    checkProStatus()
  }, [])

  // Second useEffect for AdSense initialization - must be called unconditionally
  useEffect(() => {
    if (showAds && publisherId && typeof window !== 'undefined' && (window as any).adsbygoogle) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      } catch (e) {
        console.error('Error initializing AdSense:', e)
      }
    }
  }, [showAds, publisherId])

  async function checkProStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Not logged in - show ads
        setShowAds(true)
        setIsLoading(false)
        return
      }

      // Check if user is admin (admins get Pro access, no ads)
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
      if (user.email && adminEmails.includes(user.email)) {
        setShowAds(false) // No ads for admins
        setIsLoading(false)
        return
      }

      // Check if user has active Pro subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      setShowAds(!subscription) // No ads if Pro subscription exists
    } catch (error) {
      console.error('Error checking Pro status:', error)
      // On error, show ads (safer default)
      setShowAds(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if Pro user or still loading
  if (isLoading) {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}
        style={{ minHeight: '100px', ...style }}
      >
        <div className="text-gray-400 text-sm">Loading ads...</div>
      </div>
    )
  }

  // Don't show ads if no substantial content (AdSense policy requirement)
  if (!hasSubstantialContent) {
    return null
  }

  if (!showAds) {
    return null // Don't show ads for Pro members
  }

  if (!publisherId) {
    // AdSense not configured - show placeholder for testing
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}
        style={{ minHeight: '100px', ...style }}
      >
        <div className="text-gray-400 text-xs text-center p-4">
          Ad Placeholder
          <br />
          <span className="text-xs">Add NEXT_PUBLIC_ADSENSE_PUBLISHER_ID to enable</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* AdSense Script - only load once globally */}
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        crossOrigin="anonymous"
        strategy="lazyOnload"
        onLoad={() => {
          // Initialize ads after script loads
          if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            try {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
            } catch (e) {
              console.error('Error initializing AdSense:', e)
            }
          }
        }}
      />
      
      <ins
        className={`adsbygoogle ${className}`}
        style={{
          display: 'block',
          ...(responsive && { width: '100%', minHeight: '100px' }),
          ...style,
        }}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </>
  )
}
