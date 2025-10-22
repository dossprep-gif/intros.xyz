'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import EditStartupModal from '@/components/EditStartupModal'
import Link from 'next/link'

interface Startup {
  id: string
  name: string
  description?: string
  website_url?: string
  logo_url?: string
  linkedin_url?: string
  careers_url?: string
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

interface StartupProfilePageProps {
  params: {
    startupId: string
  }
}

export default function StartupProfilePage({ params }: StartupProfilePageProps) {
  const [startup, setStartup] = useState<Startup | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const { user } = useAuth()
  
  // Unwrap the params Promise
  const resolvedParams = use(params)

  useEffect(() => {
    fetchStartup()
  }, [resolvedParams.startupId])

  const fetchStartup = async () => {
    try {
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
        .eq('id', resolvedParams.startupId)
        .single()

      if (error) throw error

      // Transform the data to match our interface
      const transformedData = {
        ...data,
        funding_rounds: data.funding_rounds?.map(round => ({
          ...round,
          investors: round.funding_round_investors?.map(fri => fri.investors) || []
        })) || []
      }

      setStartup(transformedData)
    } catch (error) {
      console.error('Error fetching startup:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSuccess = () => {
    fetchStartup() // Refresh the startup data
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4" style={{ color: '#6B7280' }}>Loading startup...</p>
        </div>
      </div>
    )
  }

  if (!startup) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#1F2937' }}>Startup not found</h1>
          <Link 
            href="/startups"
            className="text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Startups
          </Link>
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
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{ 
                  color: '#1A1A7F',
                  border: '2px solid #1A1A7F'
                }}
              >
                Edit Startup
              </button>
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
            </>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Startup Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {startup.logo_url ? (
                <img
                  className="h-20 w-20 rounded-lg"
                  src={startup.logo_url}
                  alt={startup.name}
                />
              ) : (
                <div 
                  className="h-20 w-20 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: '#6B7280' }}
                >
                  {startup.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 
                className="text-3xl font-black uppercase tracking-tight mb-2"
                style={{ 
                  color: '#1A1A7F',
                  fontFamily: 'Druk, system-ui, -apple-system, sans-serif'
                }}
              >
                {startup.name}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-sm" style={{ color: '#6B7280' }}>
                {startup.industry && (
                  <span>Industry: {startup.industry}</span>
                )}
                {startup.location && (
                  <span>Location: {startup.location}</span>
                )}
                {startup.founded_date && (
                  <span>Founded: {new Date(startup.founded_date).getFullYear()}</span>
                )}
              </div>
              
              {startup.description && (
                <p className="mt-4 text-gray-700">{startup.description}</p>
              )}
              
              <div className="mt-4 space-y-3">
                {startup.website_url && (
                  <a
                    href={startup.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                  >
                    Visit Website
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                
                {/* LinkedIn and Careers Buttons */}
                {(startup.linkedin_url || startup.careers_url) && (
                  <div className="flex space-x-3">
                    {startup.linkedin_url && (
                      <a
                        href={startup.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    
                    {startup.careers_url && (
                      <a
                        href={startup.careers_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                        </svg>
                        View Careers
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Funding Rounds */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 
            className="text-2xl font-black uppercase tracking-tight mb-6"
            style={{ 
              color: '#1A1A7F',
              fontFamily: 'Druk, system-ui, -apple-system, sans-serif'
            }}
          >
            Funding History
          </h2>
          
          {startup.funding_rounds.length > 0 ? (
            <div className="space-y-6">
              {startup.funding_rounds.map((round) => (
                <div key={round.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span 
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full text-white ${getRoundColor(round.round_type)}`}
                      >
                        {formatRoundType(round.round_type)}
                      </span>
                      <span className="text-sm" style={{ color: '#6B7280' }}>
                        {new Date(round.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    {round.amount_raised && (
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: '#1F2937' }}>
                          {formatCurrency(round.amount_raised, round.currency)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {round.investors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        Investors:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {round.investors.map((investor) => (
                          <span
                            key={investor.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm"
                            style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
                          >
                            {investor.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {round.source_url && (
                    <div className="mt-4">
                      <a
                        href={round.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                      >
                        View Source
                        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No funding information available.</p>
          )}
        </div>
      </main>

      {/* Edit Startup Modal */}
      {startup && (
        <EditStartupModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          startup={startup}
        />
      )}
    </div>
  )
}
