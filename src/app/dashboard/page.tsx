'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { SupabaseUserService, SupabaseIntroductionService, SupabaseFriendsService } from '@/lib/supabase-service';
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
  email: string;
  name: string;
  isAuthenticated: boolean;
  position?: string;
  location?: string;
  bio?: string;
  education?: string;
  expertise?: string[];
  hobbies?: string[];
  adjectives?: string[];
  socialLinks?: SocialLinks;
  badges?: string[];
  profile_picture_url?: string;
}

interface Introduction {
  id: string;
  personA: {
    name: string;
    email?: string;
    phone?: string;
  };
  personB: {
    name: string;
    email?: string;
    phone?: string;
  };
  date: string;
  notes?: string;
  verified?: boolean;
}

interface Friend {
  id: string;
  name: string;
  email: string;
  position?: string;
  location?: string;
  profile_picture_url?: string;
  expertise?: string[];
  hobbies?: string[];
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

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [introductions, setIntroductions] = useState<Introduction[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [activeTab, setActiveTab] = useState<'connections' | 'network' | 'analytics'>('connections');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { user: authUser, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      router.push('/');
      return;
    }

    // Load user profile and introductions from Supabase
    const loadUserData = async () => {
      try {
        const [userProfile, userIntroductions, userFriends, incomingFriendRequests, pendingFriendRequests] = await Promise.all([
          SupabaseUserService.getCurrentUser(),
          SupabaseIntroductionService.getIntroductions(),
          SupabaseFriendsService.getFriends(),
          SupabaseFriendsService.getIncomingRequests(),
          SupabaseFriendsService.getPendingRequests()
        ]);
        
        if (userProfile) {
          setUser(userProfile);
          setIntroductions(userIntroductions);
          setFriends(userFriends);
          setIncomingRequests(incomingFriendRequests);
          setPendingRequests(pendingFriendRequests);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [authUser, authLoading, router]);

  const getSocialMediaColor = (platform: string) => {
    switch (platform) {
      case 'linkedin': return '#0077B5';
      case 'instagram': return '#E4405F';
      case 'twitter': return '#1DA1F2';
      case 'github': return '#333333';
      case 'website': return '#1A2B7A';
      case 'other': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const handleFriendAction = async (friendId: string, action: 'accept' | 'reject' | 'remove') => {
    try {
      switch (action) {
        case 'accept':
          await SupabaseFriendsService.acceptFriendRequest(friendId);
          // Reload friends data
          const [userFriends, incomingFriendRequests] = await Promise.all([
            SupabaseFriendsService.getFriends(),
            SupabaseFriendsService.getIncomingRequests()
          ]);
          setFriends(userFriends);
          setIncomingRequests(incomingFriendRequests);
          break;
        case 'reject':
          await SupabaseFriendsService.rejectFriendRequest(friendId);
          // Reload incoming requests
          const updatedIncomingRequests = await SupabaseFriendsService.getIncomingRequests();
          setIncomingRequests(updatedIncomingRequests);
          break;
        case 'remove':
          await SupabaseFriendsService.removeFriend(friendId);
          // Reload friends data
          const updatedFriends = await SupabaseFriendsService.getFriends();
          setFriends(updatedFriends);
          break;
      }
    } catch (error) {
      console.error('Error with friend action:', error);
      alert('Failed to perform action. Please try again.');
    }
  };


  if (authLoading || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4" style={{ color: '#6B7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>
      {/* Header */}
      <header className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-extrabold" style={{ color: '#1A2B7A' }}>
                intros.xyz
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Header Section */}
        <div className="relative mb-8">
          <div className="rounded-2xl overflow-hidden" style={{ 
            background: 'linear-gradient(135deg, #F0F4FF 0%, #E0E7FF 50%, #DDD6FE 100%)',
            minHeight: '400px'
          }}>
            <div className="p-4 sm:p-12 flex flex-col sm:flex-row sm:items-start sm:justify-between">
              {/* Left Side - Profile Info */}
              <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Profile Picture */}
                <div className="relative flex flex-col items-center sm:items-start">
                  <div className="w-32 h-32 sm:w-60 sm:h-60 rounded-2xl flex items-center justify-center text-3xl sm:text-6xl font-bold shadow-lg overflow-hidden" style={{ 
                    backgroundColor: '#FFFFFF',
                    color: '#1A2B7A'
                  }}>
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  {/* Social Media Links */}
                  {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
                    <div className="mt-4 sm:mt-6">
                      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                        {Object.entries(user.socialLinks).map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-200 hover:scale-110 hover:shadow-lg"
                            style={{ 
                              backgroundColor: platform === 'linkedin' ? '#0077B5' : 
                                             platform === 'instagram' ? '#E4405F' :
                                             platform === 'twitter' ? '#1DA1F2' :
                                             platform === 'github' ? '#333333' :
                                             platform === 'website' ? '#1A2B7A' : '#6B7280'
                            }}
                          >
                            <SocialIcon platform={platform} className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold break-words" style={{ color: '#1A2B7A' }}>
                      {user.name}
                    </h1>
                    {/* Achievement Badge */}
                    {introductions.filter(intro => intro.verified).length >= 1 && (
                      <div className="relative group">
                        <div 
                          className="w-6 h-6 flex items-center justify-center text-white font-bold text-xs"
                          style={{
                            background: (() => {
                              const verifiedCount = introductions.filter(intro => intro.verified).length;
                              return verifiedCount >= 50 ? '#1A2B7A' :
                                     verifiedCount >= 25 ? '#9B59B6' :
                                     verifiedCount >= 10 ? '#2ECC71' :
                                     verifiedCount >= 5 ? '#4A90E2' : '#FF6B35';
                            })(),
                            clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                          }}
                        >
                          {(() => {
                            const verifiedCount = introductions.filter(intro => intro.verified).length;
                            return verifiedCount >= 50 ? '50' :
                                   verifiedCount >= 25 ? '25' :
                                   verifiedCount >= 10 ? '10' :
                                   verifiedCount >= 5 ? '5' : '1';
                          })()}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          {(() => {
                            const verifiedCount = introductions.filter(intro => intro.verified).length;
                            return verifiedCount >= 50 ? 'Legend - 50+ Verified Introductions' :
                                   verifiedCount >= 25 ? 'Network Master - 25+ Verified Introductions' :
                                   verifiedCount >= 10 ? 'Connector - 10+ Verified Introductions' :
                                   verifiedCount >= 5 ? 'Network Builder - 5+ Verified Introductions' : 'First Connection - 1+ Verified Introduction';
                          })()}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Personal Information with Icons */}
                  <div className="space-y-3 mb-6">
                    {user.position && (
                      <div className="flex items-center justify-center sm:justify-start space-x-3">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                        <span className="text-sm sm:text-base break-words" style={{ color: '#374151' }}>{user.position}</span>
                      </div>
                    )}
                    
                    {user.location && (
                      <div className="flex items-center justify-center sm:justify-start space-x-3">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span className="text-sm sm:text-base break-words" style={{ color: '#374151' }}>Homebase: {user.location}</span>
                      </div>
                    )}
                    
                    {user.education && (
                      <div className="flex items-center justify-center sm:justify-start space-x-3">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                        </svg>
                        <span className="text-sm sm:text-base break-words" style={{ color: '#374151' }}>{user.education}</span>
                      </div>
                    )}
                    
                    {user.expertise && user.expertise.length > 0 && (
                      <div className="flex items-start justify-center sm:justify-start space-x-3">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span className="text-sm sm:text-base break-words" style={{ color: '#374151' }}>Expertise: {user.expertise.join(', ')}</span>
                      </div>
                    )}
                    
                    {user.hobbies && user.hobbies.length > 0 && (
                      <div className="flex items-start justify-center sm:justify-start space-x-3">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span className="text-sm sm:text-base break-words" style={{ color: '#374151' }}>Interests: {user.hobbies.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Link
                      href="/dashboard/edit-profile"
                      className="px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 text-sm sm:text-base text-center"
                      style={{ 
                        backgroundColor: '#1A2B7A',
                        color: '#FFFFFF'
                      }}
                    >
                      Edit Profile
                    </Link>
                    <Link
                      href="/dashboard/add-introduction"
                      className="px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 border-2 text-sm sm:text-base text-center"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        color: '#1A2B7A',
                        borderColor: '#1A2B7A'
                      }}
                    >
                      Make an Intro
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Side - Achievement Badges */}
              <div className="text-right">
                <div className="space-y-6">
                  <div>
                    <div className="text-2xl font-bold" style={{ color: '#1A2B7A' }}>
                      {introductions.length}
                    </div>
                    <div className="text-sm font-medium" style={{ color: '#6B7280' }}>
                      Total Introductions
                    </div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>
                      {introductions.filter(intro => intro.verified).length} verified
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold" style={{ color: '#1A2B7A' }}>
                      {introductions.length * 2}
                    </div>
                    <div className="text-sm font-medium" style={{ color: '#6B7280' }}>
                      People Connected
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Connections */}
        <div className="rounded-2xl" style={{ backgroundColor: '#FFFFFF' }}>
          {/* Tab Navigation */}
          <div className="border-b" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex space-x-8 px-8">
              <button 
                onClick={() => setActiveTab('connections')}
                className="py-4 text-lg font-bold border-b-2 transition-colors" 
                style={{ 
                  color: activeTab === 'connections' ? '#1A2B7A' : '#6B7280',
                  borderColor: activeTab === 'connections' ? '#1A2B7A' : 'transparent'
                }}
              >
                Connections
                {introductions.length > 0 && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium" style={{ 
                    backgroundColor: '#F0F4FF',
                    color: '#1A2B7A'
                  }}>
                    {introductions.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('network')}
                className="py-4 text-lg font-bold border-b-2 transition-colors" 
                style={{ 
                  color: activeTab === 'network' ? '#1A2B7A' : '#6B7280',
                  borderColor: activeTab === 'network' ? '#1A2B7A' : 'transparent'
                }}
              >
                Network
                {(friends.length > 0 || incomingRequests.length > 0) && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium" style={{ 
                    backgroundColor: '#F0F4FF',
                    color: '#1A2B7A'
                  }}>
                    {friends.length + incomingRequests.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className="py-4 text-lg font-bold border-b-2 transition-colors" 
                style={{ 
                  color: activeTab === 'analytics' ? '#1A2B7A' : '#6B7280',
                  borderColor: activeTab === 'analytics' ? '#1A2B7A' : 'transparent'
                }}
              >
                Analytics
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'connections' && (
              <>
                {introductions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-6">🤝</div>
                    <h3 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>No connections yet</h3>
                    <p className="text-lg mb-8" style={{ color: '#6B7280' }}>
                      Start building your network by making your first introduction
                    </p>
                    <Link
                      href="/dashboard/add-introduction"
                      className="inline-block px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105"
                      style={{ 
                        backgroundColor: '#1A2B7A',
                        color: '#FFFFFF'
                      }}
                    >
                      Make Your First Connection
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {introductions.map((intro) => (
                      <div
                        key={intro.id}
                        className="p-6 rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-105"
                        style={{ 
                          borderColor: '#E5E7EB',
                          backgroundColor: '#F9FAFB'
                        }}
                      >
                        {/* Connection Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-md" style={{ 
                              backgroundColor: '#F0F4FF',
                              color: '#1A2B7A'
                            }}>
                              {intro.personA.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1A2B7A' }}></div>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1A2B7A' }}></div>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1A2B7A' }}></div>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-md" style={{ 
                              backgroundColor: '#F0F4FF',
                              color: '#1A2B7A'
                            }}>
                              {intro.personB.name?.charAt(0).toUpperCase() || 'B'}
                            </div>
                            {/* Verification Checkmark */}
                            {intro.verified && (
                              <div className="flex items-center justify-center w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: '#10B981' }}>
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ 
                            backgroundColor: '#F0F4FF',
                            color: '#1A2B7A'
                          }}>
                            {new Date(intro.date).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Connection Details */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold" style={{ color: '#1A2B7A' }}>
                              {intro.personA.name}
                            </span>
                            <span className="text-lg" style={{ color: '#6B7280' }}>→</span>
                            <span className="font-semibold" style={{ color: '#1A2B7A' }}>
                              {intro.personB.name}
                            </span>
                          </div>
                          
                          {intro.notes && (
                            <p className="text-sm mt-3 leading-relaxed" style={{ color: '#6B7280' }}>
                              &ldquo;{intro.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Connection Stats */}
                        <div className="flex items-center justify-between text-xs" style={{ color: '#9CA3AF' }}>
                          <span>Connection #{intro.id}</span>
                          <div className="flex items-center space-x-2">
                            <span>✓ Completed</span>
                            {intro.verified && (
                              <span className="flex items-center space-x-1" style={{ color: '#10B981' }}>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Verified</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'network' && (
              <div className="space-y-8">
                {/* Incoming Friend Requests */}
                {incomingRequests.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                      Friend Requests ({incomingRequests.length})
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {incomingRequests.map((friend) => (
                        <div
                          key={friend.id}
                          className="p-4 rounded-xl border transition-all duration-200 hover:shadow-lg"
                          style={{ 
                            borderColor: '#E5E7EB',
                            backgroundColor: '#F9FAFB'
                          }}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-md" style={{ 
                              backgroundColor: '#F0F4FF',
                              color: '#1A2B7A'
                            }}>
                              {friend.profile_picture_url ? (
                                <img
                                  src={friend.profile_picture_url}
                                  alt={friend.name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                friend.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold" style={{ color: '#1A2B7A' }}>{friend.name}</h4>
                              {friend.position && (
                                <p className="text-sm" style={{ color: '#6B7280' }}>{friend.position}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleFriendAction(friend.id, 'accept')}
                              className="flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
                              style={{ 
                                backgroundColor: '#10B981',
                                color: '#FFFFFF'
                              }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleFriendAction(friend.id, 'reject')}
                              className="flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
                              style={{ 
                                backgroundColor: '#EF4444',
                                color: '#FFFFFF'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Find Friends Button */}
                <div className="mb-6">
                  <Link
                    href="/dashboard/find-friends"
                    className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: '#1A2B7A',
                      color: '#FFFFFF'
                    }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find Friends
                  </Link>
                </div>

                {/* Friends List */}
                <div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                    Friends ({friends.length})
                  </h3>
                  {friends.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">👥</div>
                      <h4 className="text-lg font-semibold mb-2" style={{ color: '#1A2B7A' }}>No friends yet</h4>
                      <p className="text-sm" style={{ color: '#6B7280' }}>
                        Connect with other users to build your network
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="p-4 rounded-xl border transition-all duration-200 hover:shadow-lg"
                          style={{ 
                            borderColor: '#E5E7EB',
                            backgroundColor: '#F9FAFB'
                          }}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-md" style={{ 
                              backgroundColor: '#F0F4FF',
                              color: '#1A2B7A'
                            }}>
                              {friend.profile_picture_url ? (
                                <img
                                  src={friend.profile_picture_url}
                                  alt={friend.name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                friend.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold" style={{ color: '#1A2B7A' }}>{friend.name}</h4>
                              {friend.position && (
                                <p className="text-sm" style={{ color: '#6B7280' }}>{friend.position}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/profile/${friend.id}`}
                              className="flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 text-center"
                              style={{ 
                                backgroundColor: '#1A2B7A',
                                color: '#FFFFFF'
                              }}
                            >
                              View Profile
                            </Link>
                            <button
                              onClick={() => handleFriendAction(friend.id, 'remove')}
                              className="px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
                              style={{ 
                                backgroundColor: '#EF4444',
                                color: '#FFFFFF'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">📊</div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>Analytics Coming Soon</h3>
                <p className="text-lg" style={{ color: '#6B7280' }}>
                  Track your networking progress and insights
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
