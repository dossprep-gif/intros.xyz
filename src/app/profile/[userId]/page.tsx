'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { SupabaseFriendsService } from '@/lib/supabase-service';
import ProfileDropdown from '@/components/ProfileDropdown';

interface SocialLinks {
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  github?: string;
  website?: string;
  other?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  position?: string;
  location?: string;
  bio?: string;
  education?: string;
  expertise?: string[];
  hobbies?: string[];
  adjectives?: string[];
  social_links?: SocialLinks;
  profile_picture_url?: string;
  created_at: string;
}

interface FriendshipStatus {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
}

// Social media icons as SVG components
const SocialIcon = ({ platform, className }: { platform: string; className?: string }) => {
  const iconProps = { className: className || "w-5 h-5" };
  
  switch (platform) {
    case 'linkedin':
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    case 'github':
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      );
    case 'website':
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      );
    case 'other':
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
        </svg>
      );
    default:
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      );
  }
};

export default function ViewProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const params = useParams();
  const router = useRouter();

  const { user: authUser, loading: authLoading, signOut } = useAuth();
  const userId = params.userId as string;

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      router.push('/');
      return;
    }

    const loadProfile = async () => {
      try {
        const [profileData, friendshipData] = await Promise.all([
          SupabaseFriendsService.getUserById(userId),
          SupabaseFriendsService.getFriendshipStatus(userId)
        ]);
        
        if (profileData) {
          setProfile(profileData);
          setFriendshipStatus(friendshipData);
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [authUser, authLoading, router, userId]);

  const handleFriendAction = async (action: 'send' | 'accept' | 'reject' | 'remove') => {
    if (!profile) return;

    setIsProcessing(true);
    try {
      switch (action) {
        case 'send':
          await SupabaseFriendsService.sendFriendRequest(profile.id);
          setFriendshipStatus({ id: '', user_id: authUser?.id || '', friend_id: profile.id, status: 'pending' });
          break;
        case 'accept':
          await SupabaseFriendsService.acceptFriendRequest(profile.id);
          setFriendshipStatus({ id: '', user_id: authUser?.id || '', friend_id: profile.id, status: 'accepted' });
          break;
        case 'reject':
          await SupabaseFriendsService.rejectFriendRequest(profile.id);
          setFriendshipStatus(null);
          break;
        case 'remove':
          await SupabaseFriendsService.removeFriend(profile.id);
          setFriendshipStatus(null);
          break;
      }
    } catch (error) {
      console.error('Error with friend action:', error);
      alert('Failed to perform action. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };


  if (authLoading || isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4" style={{ color: '#6B7280' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = authUser?.id === profile.id;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>
      {/* Header */}
      <header className="p-4 sm:p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="text-xl sm:text-2xl font-extrabold" style={{ color: '#1A2B7A' }}>
                intros.xyz
              </Link>
              <span className="hidden sm:inline" style={{ color: '#E5E7EB' }}>|</span>
              <span className="hidden sm:inline text-sm sm:text-base" style={{ color: '#6B7280' }}>Profile</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-6">
              <Link
                href="/dashboard"
                className="font-semibold px-2 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base"
                style={{ color: '#334D99' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0F4FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <ProfileDropdown user={authUser} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Profile Card */}
        <div className="rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="p-4 sm:p-8">
            {/* Mobile-first responsive layout */}
            <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Profile Picture - Centered on mobile, left-aligned on desktop */}
              <div className="relative flex flex-col items-center sm:items-start">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-2xl sm:text-4xl font-bold shadow-lg overflow-hidden" style={{ 
                  backgroundColor: '#F0F4FF',
                  color: '#1A2B7A'
                }}>
                  {profile.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile.name?.charAt(0).toUpperCase()
                  )}
                </div>
                
                {/* Social Media Links */}
                {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                  <div className="mt-3 sm:mt-4">
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {Object.entries(profile.social_links).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-200 hover:scale-110 hover:shadow-lg"
                          style={{ 
                            backgroundColor: platform === 'linkedin' ? '#0077B5' : 
                                           platform === 'instagram' ? '#E4405F' :
                                           platform === 'twitter' ? '#1DA1F2' :
                                           platform === 'github' ? '#333333' :
                                           platform === 'website' ? '#1A2B7A' : '#6B7280'
                          }}
                        >
                          <SocialIcon platform={platform} className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                  <h1 className="text-2xl sm:text-3xl font-bold break-words" style={{ color: '#1A2B7A' }}>
                    {profile.name}
                  </h1>
                  
                  {/* Friend Action Button */}
                  {!isOwnProfile && (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      {!friendshipStatus && (
                        <button
                          onClick={() => handleFriendAction('send')}
                          disabled={isProcessing}
                          className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 text-sm sm:text-base"
                          style={{ 
                            backgroundColor: '#1A2B7A',
                            color: '#FFFFFF'
                          }}
                        >
                          {isProcessing ? 'Sending...' : 'Add Friend'}
                        </button>
                      )}
                      
                      {friendshipStatus?.status === 'pending' && friendshipStatus.user_id === authUser?.id && (
                        <span className="px-4 py-2 rounded-lg font-medium text-sm sm:text-base" style={{ 
                          backgroundColor: '#FEF3C7',
                          color: '#D97706'
                        }}>
                          Request Sent
                        </span>
                      )}
                      
                      {friendshipStatus?.status === 'pending' && friendshipStatus.friend_id === authUser?.id && (
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => handleFriendAction('accept')}
                            disabled={isProcessing}
                            className="px-3 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 text-sm"
                            style={{ 
                              backgroundColor: '#10B981',
                              color: '#FFFFFF'
                            }}
                          >
                            {isProcessing ? 'Accepting...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleFriendAction('reject')}
                            disabled={isProcessing}
                            className="px-3 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 text-sm"
                            style={{ 
                              backgroundColor: '#EF4444',
                              color: '#FFFFFF'
                            }}
                          >
                            {isProcessing ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      )}
                      
                      {friendshipStatus?.status === 'accepted' && (
                        <button
                          onClick={() => handleFriendAction('remove')}
                          disabled={isProcessing}
                          className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 text-sm sm:text-base"
                          style={{ 
                            backgroundColor: '#EF4444',
                            color: '#FFFFFF'
                          }}
                        >
                          {isProcessing ? 'Removing...' : 'Remove Friend'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Personal Information */}
                <div className="space-y-3 mb-6">
                  {profile.position && (
                    <div className="flex items-center justify-center sm:justify-start space-x-3">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      <span className="text-sm sm:text-base break-words" style={{ color: '#374151' }}>{profile.position}</span>
                    </div>
                  )}
                  
                  {profile.location && (
                    <div className="flex items-center justify-center sm:justify-start space-x-3">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span className="text-sm sm:text-base break-words" style={{ color: '#374151' }}>Homebase: {profile.location}</span>
                    </div>
                  )}
                  
                  {profile.education && (
                    <div className="flex items-center justify-center sm:justify-start space-x-3">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                      </svg>
                      <span className="text-sm sm:text-base break-words" style={{ color: '#374151' }}>{profile.education}</span>
                    </div>
                  )}
                  
                  {profile.expertise && profile.expertise.length > 0 && (
                    <div className="flex items-start justify-center sm:justify-start space-x-3">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-sm sm:text-base break-words" style={{ color: '#374151' }}>Expertise: {profile.expertise.join(', ')}</span>
                    </div>
                  )}
                  
                  {profile.hobbies && profile.hobbies.length > 0 && (
                    <div className="flex items-start justify-center sm:justify-start space-x-3">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span className="text-sm sm:text-base break-words" style={{ color: '#374151' }}>Interests: {profile.hobbies.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="mb-6 text-center sm:text-left">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A2B7A' }}>About</h3>
                    <p className="text-sm sm:text-base leading-relaxed break-words" style={{ color: '#374151' }}>
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Member Since */}
                <div className="text-xs sm:text-sm text-center sm:text-left" style={{ color: '#9CA3AF' }}>
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
