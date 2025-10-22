'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import AuthModal from '@/components/AuthModal'
import ProfileDropdown from '@/components/ProfileDropdown'

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
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F8F8' }}>
        {/* Header */}
        <header className="w-full px-6 py-4 flex justify-between items-center">
          {/* Logo */}
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

          {/* Navigation */}
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
            
            {/* Sign In button for non-authenticated users */}
            {!user && (
              <button
                onClick={() => {
                  setAuthMode('signin')
                  setShowAuthModal(true)
                }}
                className="px-4 py-2 font-bold text-white transition-all duration-200 uppercase tracking-wide"
                style={{ 
                  backgroundColor: '#1A1A7F',
                  fontFamily: 'Druk, system-ui, -apple-system, sans-serif',
                  borderRadius: '0'
                }}
              >
                Sign In
              </button>
            )}
            
            {/* Profile Dropdown for authenticated users */}
            {user && (
              <ProfileDropdown 
                user={{
                  name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                  profile_picture_url: user.user_metadata?.profile_picture_url
                }} 
              />
            )}
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center">
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
        </main>

        {/* Footer */}
        <footer className="w-full px-6 py-8 border-t" style={{ borderColor: '#E5E7EB' }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="text-sm" style={{ color: '#6B7280' }}>
                © 2024 intros.xyz. All rights reserved.
              </div>
              
              {/* Footer Links */}
              <div className="flex space-x-6">
                <Link 
                  href="/terms" 
                  className="text-sm hover:underline"
                  style={{ color: '#6B7280' }}
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/privacy" 
                  className="text-sm hover:underline"
                  style={{ color: '#6B7280' }}
                >
                  Privacy Policy
                </Link>
                <a 
                  href="mailto:introsxyzteam@gmail.com" 
                  className="text-sm hover:underline"
                  style={{ color: '#6B7280' }}
                >
                  Get in Touch
                </a>
                <Link 
                  href="/about" 
                  className="text-sm hover:underline"
                  style={{ color: '#6B7280' }}
                >
                  About
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  )
}
