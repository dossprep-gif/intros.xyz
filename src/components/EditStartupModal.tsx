'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import LogoUpload from './LogoUpload'

interface EditStartupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  startup: {
    id: string
    name: string
    description?: string
    website_url?: string
    logo_url?: string
    industry?: string
    location?: string
    founded_date?: string
  }
}

interface StartupFormData {
  name: string
  description: string
  website_url: string
  logo_url: string
  linkedin_url: string
  careers_url: string
  industry: string
  location: string
  founded_date: string
}

export default function EditStartupModal({ isOpen, onClose, onSuccess, startup }: EditStartupModalProps) {
  const [formData, setFormData] = useState<StartupFormData>({
    name: '',
    description: '',
    website_url: '',
    logo_url: '',
    linkedin_url: '',
    careers_url: '',
    industry: '',
    location: '',
    founded_date: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (startup) {
      setFormData({
        name: startup.name || '',
        description: startup.description || '',
        website_url: startup.website_url || '',
        logo_url: startup.logo_url || '',
        linkedin_url: startup.linkedin_url || '',
        careers_url: startup.careers_url || '',
        industry: startup.industry || '',
        location: startup.location || '',
        founded_date: startup.founded_date || ''
      })
    }
  }, [startup])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Basic validation
      if (!formData.name.trim()) {
        setError('Startup name is required')
        setLoading(false)
        return
      }

      if (formData.website_url && !formData.website_url.startsWith('http')) {
        setError('Website URL must start with http:// or https://')
        setLoading(false)
        return
      }

      if (formData.linkedin_url && !formData.linkedin_url.startsWith('http')) {
        setError('LinkedIn URL must start with http:// or https://')
        setLoading(false)
        return
      }

      if (formData.careers_url && !formData.careers_url.startsWith('http')) {
        setError('Careers URL must start with http:// or https://')
        setLoading(false)
        return
      }

      const { error: updateError } = await supabase
        .from('startups')
        .update({
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
          website_url: formData.website_url?.trim() || null,
          logo_url: formData.logo_url || null,
          linkedin_url: formData.linkedin_url?.trim() || null,
          careers_url: formData.careers_url?.trim() || null,
          industry: formData.industry?.trim() || null,
          location: formData.location?.trim() || null,
          founded_date: formData.founded_date || null,
        })
        .eq('id', startup.id)

      if (updateError) throw updateError

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error updating startup:', err)
      setError('Failed to update startup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!isOpen || !startup) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 
              className="text-2xl font-black uppercase tracking-tight"
              style={{ 
                color: '#1A1A7F',
                fontFamily: 'Druk, system-ui, -apple-system, sans-serif'
              }}
            >
              Edit Startup
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/company/company-name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Careers Page URL
                  </label>
                  <input
                    type="url"
                    name="careers_url"
                    value={formData.careers_url}
                    onChange={handleChange}
                    placeholder="https://company.com/careers"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Founded Date
                </label>
                <input
                  type="date"
                  name="founded_date"
                  value={formData.founded_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Company Logo
              </label>
              <LogoUpload
                onUpload={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                currentLogoUrl={formData.logo_url}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-bold text-white transition-all duration-200 uppercase tracking-wide disabled:opacity-50"
                style={{ 
                  backgroundColor: '#1A1A7F',
                  fontFamily: 'Druk, system-ui, -apple-system, sans-serif',
                  borderRadius: '0'
                }}
              >
                {loading ? 'Updating...' : 'Update Startup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
