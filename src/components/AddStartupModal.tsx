'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import LogoUpload from './LogoUpload'

interface AddStartupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface StartupFormData {
  name: string
  description: string
  website_url: string
  logo_url: string
  industry: string
  location: string
  founded_date: string
  round_type: string
  amount_raised: string
  currency: string
  funding_date: string
  source_url: string
  investors: string
}

export default function AddStartupModal({ isOpen, onClose, onSuccess }: AddStartupModalProps) {
  const [formData, setFormData] = useState<StartupFormData>({
    name: '',
    description: '',
    website_url: '',
    logo_url: '',
    industry: '',
    location: '',
    founded_date: '',
    round_type: 'seed',
    amount_raised: '',
    currency: 'USD',
    funding_date: '',
    source_url: '',
    investors: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First, create the startup
      const { data: startup, error: startupError } = await supabase
        .from('startups')
        .insert({
          name: formData.name,
          description: formData.description || null,
          website_url: formData.website_url || null,
          logo_url: formData.logo_url || null,
          industry: formData.industry || null,
          location: formData.location || null,
          founded_date: formData.founded_date || null,
        })
        .select()
        .single()

      if (startupError) throw startupError

      // If funding data is provided, create funding round
      if (formData.amount_raised && formData.funding_date) {
        const { data: fundingRound, error: fundingError } = await supabase
          .from('funding_rounds')
          .insert({
            startup_id: startup.id,
            round_type: formData.round_type,
            amount_raised: formData.amount_raised ? parseInt(formData.amount_raised) * 100 : null, // Convert to cents
            currency: formData.currency,
            date: formData.funding_date,
            source_url: formData.source_url || null,
          })
          .select()
          .single()

        if (fundingError) throw fundingError

        // Handle investors if provided
        if (formData.investors && fundingRound) {
          const investorNames = formData.investors.split(',').map(name => name.trim()).filter(Boolean)
          
          for (const investorName of investorNames) {
            // Check if investor exists
            let { data: existingInvestor } = await supabase
              .from('investors')
              .select('id')
              .eq('name', investorName)
              .single()

            // Create investor if doesn't exist
            if (!existingInvestor) {
              const { data: newInvestor, error: investorError } = await supabase
                .from('investors')
                .insert({
                  name: investorName,
                  type: 'vc_firm' // Default type
                })
                .select()
                .single()

              if (investorError) throw investorError
              existingInvestor = newInvestor
            }

            // Link investor to funding round
            await supabase
              .from('funding_round_investors')
              .insert({
                funding_round_id: fundingRound.id,
                investor_id: existingInvestor.id,
                is_lead: false // Default to false, can be updated later
              })
          }
        }
      }

      onSuccess()
      onClose()
      setFormData({
        name: '',
        description: '',
        website_url: '',
        logo_url: '',
        industry: '',
        location: '',
        founded_date: '',
        round_type: 'seed',
        amount_raised: '',
        currency: 'USD',
        funding_date: '',
        source_url: '',
        investors: ''
      })
    } catch (err) {
      console.error('Error adding startup:', err)
      setError('Failed to add startup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

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
              Add Startup
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
            {/* Startup Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1F2937' }}>
                Startup Information
              </h3>
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
              </div>

              <div className="mt-4">
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
            </div>

            {/* Funding Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1F2937' }}>
                Latest Funding Round (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Round Type
                  </label>
                  <select
                    name="round_type"
                    value={formData.round_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="pre_seed">Pre-Seed</option>
                    <option value="seed">Seed</option>
                    <option value="series_a">Series A</option>
                    <option value="series_b">Series B</option>
                    <option value="series_c">Series C</option>
                    <option value="series_d">Series D</option>
                    <option value="series_e">Series E</option>
                    <option value="bridge">Bridge</option>
                    <option value="convertible_note">Convertible Note</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Amount Raised (USD)
                  </label>
                  <input
                    type="number"
                    name="amount_raised"
                    value={formData.amount_raised}
                    onChange={handleChange}
                    placeholder="e.g., 15000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Funding Date
                  </label>
                  <input
                    type="date"
                    name="funding_date"
                    value={formData.funding_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Source URL
                  </label>
                  <input
                    type="url"
                    name="source_url"
                    value={formData.source_url}
                    onChange={handleChange}
                    placeholder="Link to funding announcement"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Investors (comma-separated)
                </label>
                <input
                  type="text"
                  name="investors"
                  value={formData.investors}
                  onChange={handleChange}
                  placeholder="e.g., Bessemer Venture Partners, Serena Ventures, Warner Bros Discovery"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submit Buttons */}
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
                {loading ? 'Adding...' : 'Add Startup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
