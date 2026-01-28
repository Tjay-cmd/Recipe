'use client'

import { useState } from 'react'
import { useToast } from './Toast'

interface CopyableLinkProps {
  url: string
  label?: string
  className?: string
}

export function CopyableLink({ url, label = 'Recipe Link', className = '' }: CopyableLinkProps) {
  const { showToast } = useToast()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      showToast('✅ Link copied to clipboard!', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      showToast('Failed to copy link', 'error')
    }
  }

  return (
    <div className={`bg-gradient-to-r from-emerald-50 to-orange-50 border-2 border-emerald-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {label}
          </label>
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
            <span className="text-sm text-gray-600 font-mono flex-1 truncate">
              {url}
            </span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        💡 Perfect for Pinterest! Copy this link and paste it into your Pinterest video description.
      </p>
    </div>
  )
}
