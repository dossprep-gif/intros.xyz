'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

interface Startup {
  id: string
  name: string
  description?: string
  website_url?: string
  logo_url?: string
  industry?: string
  location?: string
  founded_date?: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_by?: string
  reviewed_by?: string
  review_notes?: string
  created_at: string
  updated_at: string
  submitted_by_user?: {
    name: string
    email: string
  }
  funding_rounds: FundingRound[]
}

interface FundingRound {
  id: string
  round_type: string
  amount_raised?: number
  currency: string
  date: string
  source_url?: string
  investors: Investor[]
}

interface Investor {
  id: string
  name: string
  type?: string
}

export default function AdminStartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchStartups()
  }, [])

  const fetchStartups = async () => {
    try {
      // Admin can see all startups regardless of status
      const { data, error } = await supabase
        .from('startups')
        .select(`
          *,
          submitted_by_user:submitted_by (
            name,
            email
          ),
          funding_rounds (
            *,
            funding_round_investors (
              investors (*)
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data
      const transformedData = data?.map(startup => ({
        ...startup,
        funding_rounds: startup.funding_rounds?.map(round => ({
          ...round,
          investors: round.funding_round_investors?.map(fri => fri.investors) || []
        })) || []
      })) || []

      setStartups(transformedData)
    } catch (error) {
      console.error('Error fetching startups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (startupId: string) => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('startups')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          review_notes: reviewNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', startupId)

      if (error) throw error

      setSelectedStartup(null)
      setReviewNotes('')
      fetchStartups()
    } catch (error) {
      console.error('Error approving startup:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (startupId: string) => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('startups')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          review_notes: reviewNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', startupId)

      if (error) throw error

      setSelectedStartup(null)
      setReviewNotes('')
      fetchStartups()
    } catch (error) {
      console.error('Error rejecting startup:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100)
  }

  const formatRoundType = (roundType: string) => {
    return roundType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredStartups = startups.filter(startup => 
    filter === 'all' || startup.status === filter
  )

  // Check if user is admin
  const isAdmin = user?.email === 'introsxyzteam@gmail.com'

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#1F2937' }}>Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <Link href="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4" style={{ color: '#6B7280' }}>Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <div 
            className="text-2xl font-black uppercase tracking-tight"
            style={{ 
              color: '#1A1A7F',
              fontFamily: 'Druk, system-ui, -apple-system, sans-serif'
            }}
          >
            intros.xyz
          </div>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link 
            href="/startups"
            className="text-sm font-bold uppercase tracking-wide transition-colors hover:underline"
            style={{ 
              color: '#1A1A7F',
              fontFamily: 'Druk, system-ui, -apple-system, sans-serif'
            }}
          >
            Startups
          </Link>
          
          <Link 
            href="/admin/startups"
            className="text-sm font-bold uppercase tracking-wide transition-colors hover:underline"
            style={{ 
              color: '#1A1A7F',
              fontFamily: 'Druk, system-ui, -apple-system, sans-serif'
            }}
          >
            Admin
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 
            className="text-4xl font-black uppercase tracking-tight mb-4"
            style={{ 
              color: '#1A1A7F',
              fontFamily: 'Druk, system-ui, -apple-system, sans-serif'
            }}
          >
            Startup Submissions
          </h1>
          <p className="text-lg" style={{ color: '#6B7280' }}>
            Review and approve startup submissions before they go live.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'pending', label: 'Pending', count: startups.filter(s => s.status === 'pending').length },
              { key: 'approved', label: 'Approved', count: startups.filter(s => s.status === 'approved').length },
              { key: 'rejected', label: 'Rejected', count: startups.filter(s => s.status === 'rejected').length },
              { key: 'all', label: 'All', count: startups.length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Startups List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredStartups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: '#6B7280' }}>
                No {filter} submissions found.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredStartups.map((startup) => (
                <div key={startup.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {startup.logo_url ? (
                          <img
                            className="h-12 w-12 rounded-lg"
                            src={startup.logo_url}
                            alt={startup.name}
                          />
                        ) : (
                          <div 
                            className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: '#6B7280' }}
                          >
                            {startup.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold" style={{ color: '#1F2937' }}>
                            {startup.name}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(startup.status)}`}>
                            {startup.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {startup.industry && <span>{startup.industry}</span>}
                          {startup.location && <span> • {startup.location}</span>}
                        </div>
                        
                        {startup.description && (
                          <p className="text-sm text-gray-700 mb-2">{startup.description}</p>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Submitted by {startup.submitted_by_user?.name || 'Unknown'} ({startup.submitted_by_user?.email})
                          <span className="mx-2">•</span>
                          {new Date(startup.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedStartup(startup)}
                        className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded hover:bg-indigo-200 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {selectedStartup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 
                  className="text-2xl font-black uppercase tracking-tight"
                  style={{ 
                    color: '#1A1A7F',
                    fontFamily: 'Druk, system-ui, -apple-system, sans-serif'
                  }}
                >
                  Review Submission
                </h2>
                <button
                  onClick={() => setSelectedStartup(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Startup Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#1F2937' }}>
                      Startup Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Company Name</label>
                        <p className="text-sm" style={{ color: '#1F2937' }}>{selectedStartup.name}</p>
                      </div>
                      {selectedStartup.industry && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Industry</label>
                          <p className="text-sm" style={{ color: '#1F2937' }}>{selectedStartup.industry}</p>
                        </div>
                      )}
                      {selectedStartup.location && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Location</label>
                          <p className="text-sm" style={{ color: '#1F2937' }}>{selectedStartup.location}</p>
                        </div>
                      )}
                      {selectedStartup.website_url && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Website</label>
                          <a 
                            href={selectedStartup.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            {selectedStartup.website_url}
                          </a>
                        </div>
                      )}
                      {selectedStartup.description && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Description</label>
                          <p className="text-sm" style={{ color: '#1F2937' }}>{selectedStartup.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#1F2937' }}>
                      Funding Information
                    </h3>
                    {selectedStartup.funding_rounds.length > 0 ? (
                      <div className="space-y-3">
                        {selectedStartup.funding_rounds.map((round) => (
                          <div key={round.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium" style={{ color: '#1F2937' }}>
                                {formatRoundType(round.round_type)}
                              </span>
                              {round.amount_raised && (
                                <span className="text-sm font-bold" style={{ color: '#1F2937' }}>
                                  {formatCurrency(round.amount_raised, round.currency)}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(round.date).toLocaleDateString()}
                            </div>
                            {round.investors.length > 0 && (
                              <div className="mt-2">
                                <label className="text-xs font-medium text-gray-500">Investors</label>
                                <p className="text-xs" style={{ color: '#1F2937' }}>
                                  {round.investors.map(inv => inv.name).join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No funding information provided</p>
                    )}
                  </div>
                </div>

                {/* Review Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add notes about your decision..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedStartup(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedStartup.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedStartup.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-bold text-white transition-all duration-200 uppercase tracking-wide disabled:opacity-50"
                    style={{ 
                      backgroundColor: '#1A1A7F',
                      fontFamily: 'Druk, system-ui, -apple-system, sans-serif',
                      borderRadius: '0'
                    }}
                  >
                    {actionLoading ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
