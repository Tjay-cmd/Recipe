'use client'

import { useState, useEffect } from 'react'

interface CookModeProps {
  children: React.ReactNode
}

export function CookMode({ children }: CookModeProps) {
  const [isCookMode, setIsCookMode] = useState(false)

  useEffect(() => {
    if (isCookMode && 'wakeLock' in navigator) {
      let wakeLock: WakeLockSentinel | null = null

      async function requestWakeLock() {
        try {
          wakeLock = await navigator.wakeLock.request('screen')
        } catch (err) {
          console.log('Wake Lock request failed:', err)
        }
      }

      requestWakeLock()

      return () => {
        if (wakeLock) {
          wakeLock.release()
        }
      }
    }
  }, [isCookMode])

  return (
    <div className={isCookMode ? 'cook-mode' : ''}>
      <button
        onClick={() => setIsCookMode(!isCookMode)}
        className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
      >
        {isCookMode ? 'Exit Cook Mode' : '🍳 Cook Mode'}
      </button>
      <div className={isCookMode ? 'text-2xl leading-relaxed' : ''}>
        {children}
      </div>
      <style jsx>{`
        .cook-mode {
          font-size: 1.25rem;
        }
        .cook-mode h2,
        .cook-mode h3 {
          font-size: 2rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .cook-mode ol,
        .cook-mode ul {
          font-size: 1.5rem;
          line-height: 2;
        }
        .cook-mode li {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  )
}
