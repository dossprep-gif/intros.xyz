'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import LogoUpload from './LogoUpload'

interface SubmitStartupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
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
  round_type: string
  amount_raised: string
  currency: string
  funding_date: string
  source_url: string
  investors: string
}

export default function SubmitStartupModal({ isOpen, onClose, onSuccess }: SubmitStartupModalProps) {
  const [formData, setFormData] = useState<StartupFormData>({
    name: '',
    description: '',
    website_url: '',
    logo_url: '',
    linkedin_url: '',
    careers_url: '',
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

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

      // Create the startup with pending status
      const { data: startup, error: startupError } = await supabase
        .from('startups')
        .insert({
          name: formData.name,
          description: formData.description || null,
          website_url: formData.website_url || null,
          logo_url: formData.logo_url || null,
          linkedin_url: formData.linkedin_url || null,
          careers_url: formData.careers_url || null,
          industry: formData.industry || null,
          location: formData.location || null,
          founded_date: formData.founded_date || null,
          status: 'pending',
          submitted_by: user.id
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
            amount_raised: formData.amount_raised ? parseInt(formData.amount_raised) * 100 : null,
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
                  type: 'vc_firm'
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
                is_lead: false
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
        linkedin_url: '',
        careers_url: '',
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
      console.error('Error submitting startup:', err)
      setError('Failed to submit startup. Please try again.')
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
              Submit Startup
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

          {/* Submission Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Submission Review Required
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Your startup submission will be reviewed before appearing on the public site. You'll be notified once it's approved.</p>
                </div>
              </div>
            </div>
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

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Company Logo
                </label>
                <LogoUpload
                  onUpload={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                  currentLogoUrl={formData.logo_url}
                  disabled={loading}
                />
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
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
