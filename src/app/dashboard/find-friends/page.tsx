'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { SupabaseFriendsService } from '@/lib/supabase-service';
import ProfileDropdown from '@/components/ProfileDropdown';

interface User {
  id: string;
  name: string;
  email: string;
  position?: string;
  location?: string;
  profile_picture_url?: string;
  expertise?: string[];
  hobbies?: string[];
}

interface FriendshipStatus {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
}

export default function FindFriends() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friendshipStatuses, setFriendshipStatuses] = useState<Record<string, FriendshipStatus | null>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const { user: authUser, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      router.push('/');
      return;
    }
  }, [authUser, authLoading, router]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await SupabaseFriendsService.searchUsers(query);
      setSearchResults(results);

      // Check friendship status for each user
      const statusPromises = results.map(async (user) => {
        const status = await SupabaseFriendsService.getFriendshipStatus(user.id);
        return { userId: user.id, status };
      });

      const statuses = await Promise.all(statusPromises);
      const statusMap: Record<string, FriendshipStatus | null> = {};
      statuses.forEach(({ userId, status }) => {
        statusMap[userId] = status;
      });
      setFriendshipStatuses(statusMap);
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFriendAction = async (userId: string, action: 'send' | 'remove') => {
    setIsProcessing(prev => ({ ...prev, [userId]: true }));
    
    try {
      switch (action) {
        case 'send':
          await SupabaseFriendsService.sendFriendRequest(userId);
          setFriendshipStatuses(prev => ({
            ...prev,
            [userId]: { id: '', user_id: authUser?.id || '', friend_id: userId, status: 'pending' }
          }));
          break;
        case 'remove':
          await SupabaseFriendsService.removeFriend(userId);
          setFriendshipStatuses(prev => ({
            ...prev,
            [userId]: null
          }));
          break;
      }
    } catch (error) {
      console.error('Error with friend action:', error);
      alert('Failed to perform action. Please try again.');
    } finally {
      setIsProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getFriendButton = (user: User) => {
    const status = friendshipStatuses[user.id];
    const isProcessingUser = isProcessing[user.id];

    if (!status) {
      return (
        <button
          onClick={() => handleFriendAction(user.id, 'send')}
          disabled={isProcessingUser}
          className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50"
          style={{ 
            backgroundColor: '#1A2B7A',
            color: '#FFFFFF'
          }}
        >
          {isProcessingUser ? 'Sending...' : 'Add Friend'}
        </button>
      );
    }

    if (status.status === 'pending' && status.user_id === authUser?.id) {
      return (
        <span className="px-4 py-2 rounded-lg font-medium" style={{ 
          backgroundColor: '#FEF3C7',
          color: '#D97706'
        }}>
          Request Sent
        </span>
      );
    }

    if (status.status === 'pending' && status.friend_id === authUser?.id) {
      return (
        <span className="px-4 py-2 rounded-lg font-medium" style={{ 
          backgroundColor: '#FEF3C7',
          color: '#D97706'
        }}>
          Request Received
        </span>
      );
    }

    if (status.status === 'accepted') {
      return (
        <button
          onClick={() => handleFriendAction(user.id, 'remove')}
          disabled={isProcessingUser}
          className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50"
          style={{ 
            backgroundColor: '#EF4444',
            color: '#FFFFFF'
          }}
        >
          {isProcessingUser ? 'Removing...' : 'Remove Friend'}
        </button>
      );
    }

    return null;
  };


  if (authLoading) {
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
              <span style={{ color: '#E5E7EB' }}>|</span>
              <span style={{ color: '#6B7280' }}>Find Friends</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="font-semibold px-4 py-2 rounded-md transition-colors"
                style={{ color: '#334D99' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0F4FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Back to Dashboard
              </Link>
              <ProfileDropdown user={authUser} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="rounded-2xl p-8 mb-8" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#1A2B7A' }}>Find Friends</h1>
            <p className="text-lg" style={{ color: '#6B7280' }}>
              Search for other users to connect with and expand your network
            </p>
          </div>

          {/* Search Input */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="w-full px-6 py-4 pr-12 rounded-xl border focus:outline-none transition-all duration-200 text-lg"
                style={{ 
                  borderColor: '#E5E7EB',
                  backgroundColor: '#F8F8F8'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1A2B7A';
                  e.target.style.backgroundColor = '#FFFFFF';
                  e.target.style.boxShadow = '0 0 0 3px rgba(26, 43, 122, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.backgroundColor = '#F8F8F8';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Search by name or email..."
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                ) : (
                  <svg className="w-6 h-6" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="rounded-2xl" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-xl font-bold" style={{ color: '#1A2B7A' }}>
                Search Results
                {searchResults.length > 0 && (
                  <span className="ml-2 text-sm font-normal" style={{ color: '#6B7280' }}>
                    ({searchResults.length} found)
                  </span>
                )}
              </h2>
            </div>

            <div className="p-6">
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A2B7A' }}>No users found</h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Try searching with a different name or email
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="p-6 rounded-xl border transition-all duration-200 hover:shadow-lg"
                      style={{ 
                        borderColor: '#E5E7EB',
                        backgroundColor: '#F9FAFB'
                      }}
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold shadow-md" style={{ 
                          backgroundColor: '#F0F4FF',
                          color: '#1A2B7A'
                        }}>
                          {user.profile_picture_url ? (
                            <img
                              src={user.profile_picture_url}
                              alt={user.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            user.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold" style={{ color: '#1A2B7A' }}>{user.name}</h3>
                          {user.position && (
                            <p className="text-sm" style={{ color: '#6B7280' }}>{user.position}</p>
                          )}
                          {user.location && (
                            <p className="text-sm" style={{ color: '#6B7280' }}>{user.location}</p>
                          )}
                        </div>
                      </div>

                      {/* Expertise and Hobbies */}
                      {(user.expertise?.length || user.hobbies?.length) && (
                        <div className="mb-4">
                          {user.expertise?.length && (
                            <div className="mb-2">
                              <span className="text-xs font-medium" style={{ color: '#1A2B7A' }}>Expertise: </span>
                              <span className="text-xs" style={{ color: '#6B7280' }}>
                                {user.expertise.slice(0, 3).join(', ')}
                                {user.expertise.length > 3 && '...'}
                              </span>
                            </div>
                          )}
                          {user.hobbies?.length && (
                            <div>
                              <span className="text-xs font-medium" style={{ color: '#1A2B7A' }}>Interests: </span>
                              <span className="text-xs" style={{ color: '#6B7280' }}>
                                {user.hobbies.slice(0, 3).join(', ')}
                                {user.hobbies.length > 3 && '...'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <Link
                          href={`/profile/${user.id}`}
                          className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 text-center"
                          style={{ 
                            backgroundColor: '#F0F4FF',
                            color: '#1A2B7A',
                            border: '1px solid #E5E7EB'
                          }}
                        >
                          View Profile
                        </Link>
                        {getFriendButton(user)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="text-6xl mb-6">👥</div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>Start Your Search</h3>
            <p className="text-lg mb-8" style={{ color: '#6B7280' }}>
              Enter a name or email above to find other users on the platform
            </p>
            <div className="flex justify-center space-x-4 text-sm" style={{ color: '#9CA3AF' }}>
              <span>• Search by name</span>
              <span>• Search by email</span>
              <span>• Connect with friends</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
