'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

interface User {
  name: string;
  profile_picture_url?: string;
}

interface ProfileDropdownProps {
  user: User;
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50"
        style={{ backgroundColor: isOpen ? '#F8F8F8' : 'transparent' }}
      >
        {/* Profile Picture */}
        <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border-2 border-white">
          {user.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-sm font-bold"
              style={{ 
                backgroundColor: '#F0F4FF',
                color: '#1A2B7A'
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {/* User Name */}
        <span className="text-sm font-medium" style={{ color: '#1A2B7A' }}>
          {user.name}
        </span>
        
        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: '#6B7280' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50" style={{ 
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB'
        }}>
          <div className="py-1">
            {/* Profile Info */}
            <div className="px-4 py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
              <p className="text-sm font-medium" style={{ color: '#1A2B7A' }}>
                {user.name}
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                View and manage your profile
              </p>
            </div>
            
            {/* Edit Profile Link */}
            <Link
              href="/dashboard/edit-profile"
              className="flex items-center px-4 py-3 text-sm transition-colors hover:bg-gray-50"
              style={{ color: '#374151' }}
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Edit Profile
            </Link>
            
            {/* Logout Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex items-center w-full px-4 py-3 text-sm transition-colors hover:bg-red-50"
              style={{ color: '#EF4444' }}
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
