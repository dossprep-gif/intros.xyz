'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import AuthModal from '@/components/AuthModal'

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    if (user) {
      // User is authenticated, go to dashboard
      router.push('/dashboard')
    } else {
      // User not authenticated, show signup modal
      setAuthMode('signup')
      setShowAuthModal(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4" style={{ color: '#6B7280' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="text-center max-w-4xl px-6">
          {/* Main heading with bold, blocky typography */}
          <h1 
            className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-8 tracking-tight"
            style={{ 
              color: '#1A1A7F',
              fontFamily: 'Druk, system-ui, -apple-system, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em'
            }}
          >
            Show the value<br />of your network
          </h1>
          
          {/* Action button */}
          <button
            onClick={handleGetStarted}
            className="inline-block px-12 py-6 text-xl font-bold transition-all duration-200 uppercase tracking-wide"
            style={{ 
              backgroundColor: '#1A1A7F',
              color: '#F8F8F8',
              fontFamily: 'Druk, system-ui, -apple-system, sans-serif',
              borderRadius: '0',
              border: '3px solid #1A1A7F'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8F8F8';
              e.currentTarget.style.color = '#1A1A7F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1A1A7F';
              e.currentTarget.style.color = '#F8F8F8';
            }}
          >
            {user ? "Go to Dashboard" : "Start tracking your intro's"}
          </button>

          {/* Additional auth options for non-authenticated users */}
          {!user && (
            <div className="mt-8 space-y-4">
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('signin')
                    setShowAuthModal(true)
                  }}
                  className="underline hover:no-underline"
                  style={{ color: '#1A1A7F' }}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  )
}
