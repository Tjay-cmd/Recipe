'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useToast } from './Toast'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = 'Recipe Image' }: ImageUploadProps) {
  const { showToast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update preview when value prop changes (for edit mode)
  useEffect(() => {
    setPreview(value)
  }, [value])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error')
      return
    }

    setUploading(true)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'recipes')

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      const imageUrl = data.secure_url

      // Update preview and parent component
      setPreview(imageUrl)
      onChange(imageUrl)
    } catch (error) {
      console.error('Upload error:', error)
      showToast('Failed to upload image. Please try again.', 'error')
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreview('')
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Preview */}
      {preview && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={preview}
            alt="Recipe preview"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            aria-label="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload Button */}
      {!preview && (
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-emerald-500 transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <span className="text-gray-500">Uploading...</span>
            ) : (
              <div className="space-y-1">
                <div className="text-emerald-600 font-medium">
                  📸 Click to upload image
                </div>
                <div className="text-xs text-gray-500">
                  PNG, JPG, WEBP up to 5MB
                </div>
              </div>
            )}
          </label>
        </div>
      )}

      {/* Manual URL Input (fallback) */}
      <details className="text-sm">
        <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
          Or paste image URL manually
        </summary>
        <input
          type="url"
          value={value}
          onChange={(e) => {
            setPreview(e.target.value)
            onChange(e.target.value)
          }}
          placeholder="https://example.com/image.jpg"
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </details>
    </div>
  )
}
