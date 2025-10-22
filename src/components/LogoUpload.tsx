'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface LogoUploadProps {
  onUpload: (url: string) => void
  currentLogoUrl?: string
  disabled?: boolean
}

export default function LogoUpload({ onUpload, currentLogoUrl, disabled }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `startup-logos/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('startup-logos')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from('startup-logos')
        .getPublicUrl(filePath)

      setPreview(data.publicUrl)
      onUpload(data.publicUrl)
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Failed to upload logo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || uploading) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled || uploading) return

    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const onButtonClick = () => {
    if (disabled || uploading) return
    fileInputRef.current?.click()
  }

  const removeLogo = () => {
    setPreview(null)
    onUpload('')
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={disabled || uploading}
        />

        {preview ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Logo preview"
                className="h-20 w-20 rounded-lg object-cover border border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Logo uploaded successfully</p>
              <div className="flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onButtonClick()
                  }}
                  disabled={disabled || uploading}
                  className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded hover:bg-indigo-200 transition-colors disabled:opacity-50"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeLogo()
                  }}
                  disabled={disabled || uploading}
                  className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {uploading ? (
                <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {uploading ? 'Uploading...' : 'Upload a logo'}
              </p>
              <p className="text-xs text-gray-500">
                {uploading ? 'Please wait...' : 'Drag and drop or click to browse'}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              PNG, JPG, GIF up to 5MB
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
