'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import SubmitStartupModal from '@/components/SubmitStartupModal'
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
  website_url?: string
}

export default function StartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchStartups()
  }, [])

  const fetchStartups = async () => {
    try {
      // Get approved startups for everyone, plus pending/rejected for the submitter
      const { data, error } = await supabase
        .from('startups')
        .select(`
          *,
          funding_rounds (
            *,
            funding_round_investors (
              investors (*)
            )
          )
        `)
        .or(`status.eq.approved,and(status.in.(pending,rejected),submitted_by.eq.${user?.id || 'null'})`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match our interface
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

  const handleAddSuccess = () => {
    fetchStartups() // Refresh the list
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100) // Convert from cents
  }

  const formatRoundType = (roundType: string) => {
    return roundType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getRoundColor = (roundType: string) => {
    const colors: { [key: string]: string } = {
      'seed': 'bg-green-500',
      'pre_seed': 'bg-green-500',
      'series_a': 'bg-blue-500',
      'series_b': 'bg-blue-500',
      'series_c': 'bg-blue-500',
      'series_d': 'bg-blue-500',
      'series_e': 'bg-blue-500',
      'bridge': 'bg-gray-500',
      'convertible_note': 'bg-gray-500',
      'other': 'bg-gray-500'
    }
    return colors[roundType] || 'bg-gray-500'
  }

  const filteredStartups = startups.filter(startup =>
    startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    startup.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4" style={{ color: '#6B7280' }}>Loading startups...</p>
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
          
          {/* Admin link for admin users */}
          {user?.email === 'introsxyzteam@gmail.com' && (
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
          )}
          
          {user && (
            <Link 
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{ 
                color: '#1A1A7F',
                border: '2px solid #1A1A7F'
              }}
            >
              Dashboard
            </Link>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 
            className="text-4xl md:text-5xl font-black leading-tight mb-4 tracking-tight"
            style={{ 
              color: '#1A1A7F',
              fontFamily: 'Druk, system-ui, -apple-system, sans-serif',
              textTransform: 'uppercase'
            }}
          >
            Startup Funding Tracker
          </h1>
          <p className="text-lg" style={{ color: '#6B7280' }}>
            A real-time look at the latest startup funding rounds across sports, gaming and leading digital products.
          </p>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              style={{ backgroundColor: 'white' }}
            />
          </div>
          
          {user && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-3 font-bold text-white transition-all duration-200 uppercase tracking-wide"
              style={{ 
                backgroundColor: '#1A1A7F',
                fontFamily: 'Druk, system-ui, -apple-system, sans-serif',
                borderRadius: '0'
              }}
            >
              Submit Startup
            </button>
          )}
        </div>

        {/* Startups Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Amount Raised
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Round
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Investors
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStartups.map((startup) => {
                  const latestRound = startup.funding_rounds?.[0] // Assuming ordered by date desc
                  return (
                    <tr key={startup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {startup.logo_url ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={startup.logo_url}
                                alt={startup.name}
                              />
                            ) : (
                              <div 
                                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: '#6B7280' }}
                              >
                                {startup.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <Link 
                                href={`/startups/${startup.id}`}
                                className="text-sm font-medium hover:underline"
                                style={{ color: '#1F2937' }}
                              >
                                {startup.name}
                              </Link>
                              {startup.status === 'pending' && (
                                <span 
                                  className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                                  style={{ 
                                    backgroundColor: '#FEF3C7',
                                    color: '#D97706'
                                  }}
                                >
                                  PENDING
                                </span>
                              )}
                              {startup.status === 'rejected' && (
                                <span 
                                  className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                                  style={{ 
                                    backgroundColor: '#FEE2E2',
                                    color: '#DC2626'
                                  }}
                                >
                                  REJECTED
                                </span>
                              )}
                            </div>
                            {startup.industry && (
                              <div className="text-sm" style={{ color: '#6B7280' }}>
                                {startup.industry}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#1F2937' }}>
                        {latestRound?.amount_raised ? 
                          formatCurrency(latestRound.amount_raised, latestRound.currency) : 
                          'Undisclosed'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {latestRound && (
                          <span 
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getRoundColor(latestRound.round_type)}`}
                          >
                            {formatRoundType(latestRound.round_type)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#1F2937' }}>
                        {latestRound?.date ? 
                          new Date(latestRound.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          }) : 
                          '-'
                        }
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#1F2937' }}>
                        <div className="max-w-xs">
                          {latestRound?.investors?.length ? 
                            latestRound.investors.map((investor, index) => (
                              <span key={investor.id}>
                                {investor.name}
                                {index < latestRound.investors.length - 1 && ', '}
                              </span>
                            )) : 
                            '-'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {latestRound?.source_url ? (
                          <a
                            href={latestRound.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredStartups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: '#6B7280' }}>
              {searchTerm ? 'No startups found matching your search.' : 'No startups have been added yet.'}
            </p>
            {user && !searchTerm && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="mt-4 px-6 py-3 font-bold text-white transition-all duration-200 uppercase tracking-wide"
                style={{ 
                  backgroundColor: '#1A1A7F',
                  fontFamily: 'Druk, system-ui, -apple-system, sans-serif',
                  borderRadius: '0'
                }}
              >
                Submit First Startup
              </button>
            )}
          </div>
        )}
      </main>

      {/* Submit Startup Modal */}
      <SubmitStartupModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}
