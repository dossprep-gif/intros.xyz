'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { SupabaseIntroductionService } from '@/lib/supabase-service';
import { validateEmail, validatePhone, validateName, validateText } from '@/utils/security';
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
  expertise?: string[];
  hobbies?: string[];
  adjectives?: string[];
  socialLinks?: SocialLinks;
}

interface IntroductionForm {
  personA: {
    name: string;
    email: string;
    phone: string;
  };
  personB: {
    name: string;
    email: string;
    phone: string;
  };
  notes: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Badge definitions
const BADGES: Badge[] = [
  {
    id: 'first_connection',
    name: 'First Connection',
    description: 'Made your first introduction',
    icon: '🤝',
    requirement: 1,
    color: '#10B981',
    rarity: 'common'
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Connected 10 people',
    icon: '🦋',
    requirement: 10,
    color: '#8B5CF6',
    rarity: 'common'
  },
  {
    id: 'networker',
    name: 'Networker',
    description: 'Connected 50 people',
    icon: '🔗',
    requirement: 50,
    color: '#3B82F6',
    rarity: 'rare'
  },
  {
    id: 'connector',
    name: 'Connector',
    description: 'Connected 100 people',
    icon: '🌐',
    requirement: 100,
    color: '#F59E0B',
    rarity: 'rare'
  },
  {
    id: 'superconnector',
    name: 'Superconnector',
    description: 'Connected 500+ people',
    icon: '⚡',
    requirement: 500,
    color: '#EF4444',
    rarity: 'epic'
  },
  {
    id: 'network_master',
    name: 'Network Master',
    description: 'Connected 1000+ people',
    icon: '👑',
    requirement: 1000,
    color: '#7C3AED',
    rarity: 'legendary'
  }
];

// Function to calculate earned badges
const calculateBadges = (introCount: number): string[] => {
  const earnedBadges: string[] = [];
  
  BADGES.forEach(badge => {
    if (introCount >= badge.requirement) {
      earnedBadges.push(badge.id);
    }
  });
  
  return earnedBadges;
};

export default function AddIntroduction() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<IntroductionForm>({
    personA: { name: '', email: '', phone: '' },
    personB: { name: '', email: '', phone: '' },
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const { user: authUser, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      router.push('/');
      return;
    }

    // Set user from auth context
    setUser({
      ...authUser,
      isAuthenticated: true
    });
  }, [authUser, authLoading, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Person A validation
    if (!formData.personA.name.trim()) {
      newErrors.personA_name = 'Name is required for Person A';
    }
    if (!formData.personA.email.trim() && !formData.personA.phone.trim()) {
      newErrors.personA_contact = 'Either email or phone is required for Person A';
    }

    // Person B validation
    if (!formData.personB.name.trim()) {
      newErrors.personB_name = 'Name is required for Person B';
    }
    if (!formData.personB.email.trim() && !formData.personB.phone.trim()) {
      newErrors.personB_contact = 'Either email or phone is required for Person B';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Create introduction object with id for validation
      const newIntroduction = {
        id: Date.now().toString(), // Add id for validation
        personA: {
          name: formData.personA.name.trim(),
          email: formData.personA.email.trim() || undefined,
          phone: formData.personA.phone.trim() || undefined,
        },
        personB: {
          name: formData.personB.name.trim(),
          email: formData.personB.email.trim() || undefined,
          phone: formData.personB.phone.trim() || undefined,
        },
        date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        notes: formData.notes.trim() || undefined,
        verified: false
      };

      // Save to Supabase
      await SupabaseIntroductionService.addIntroduction(newIntroduction);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error adding introduction:', error);
      alert('Failed to add introduction. Please try again.');
    }
  };

  const handleInputChange = (person: 'personA' | 'personB', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [person]: {
        ...prev[person],
        [field]: value
      }
    }));

    // Clear error when user starts typing
    const errorKey = `${person}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleNotesChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      notes: value
    }));
  };


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
              <span style={{ color: '#6B7280' }}>Add Introduction</span>
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
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
          {/* Compact Header */}
          <div className="px-6 py-4 border-b" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">🤝</span>
              <h1 className="text-2xl font-bold" style={{ color: '#1A2B7A' }}>Make a Connection</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Person A */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: '#F0F4FF', color: '#1A2B7A' }}>
                    A
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: '#1A2B7A' }}>Person A</h2>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={formData.personA.name}
                      onChange={(e) => handleInputChange('personA', 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none transition-all duration-200 text-sm"
                      style={{ 
                        borderColor: errors.personA_name ? '#EF4444' : '#E5E7EB',
                        backgroundColor: '#F8F8F8'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1A2B7A';
                        e.target.style.backgroundColor = '#FFFFFF';
                        e.target.style.boxShadow = '0 0 0 2px rgba(26, 43, 122, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.personA_name ? '#EF4444' : '#E5E7EB';
                        e.target.style.backgroundColor = '#F8F8F8';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Name *"
                    />
                    {errors.personA_name && (
                      <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.personA_name}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      value={formData.personA.email}
                      onChange={(e) => handleInputChange('personA', 'email', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none transition-all duration-200 text-sm"
                      style={{ 
                        borderColor: '#E5E7EB',
                        backgroundColor: '#F8F8F8'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1A2B7A';
                        e.target.style.backgroundColor = '#FFFFFF';
                        e.target.style.boxShadow = '0 0 0 2px rgba(26, 43, 122, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.backgroundColor = '#F8F8F8';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Email"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      value={formData.personA.phone}
                      onChange={(e) => handleInputChange('personA', 'phone', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none transition-all duration-200 text-sm"
                      style={{ 
                        borderColor: '#E5E7EB',
                        backgroundColor: '#F8F8F8'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1A2B7A';
                        e.target.style.backgroundColor = '#FFFFFF';
                        e.target.style.boxShadow = '0 0 0 2px rgba(26, 43, 122, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.backgroundColor = '#F8F8F8';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Phone"
                    />
                    {errors.personA_contact && (
                      <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.personA_contact}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Connection Visual */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#F0F4FF', color: '#1A2B7A' }}>
                    A
                  </div>
                  <div className="w-4 h-0.5" style={{ backgroundColor: '#1A2B7A' }}></div>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#1A2B7A', color: '#FFFFFF' }}>
                    ↓
                  </div>
                  <div className="w-4 h-0.5" style={{ backgroundColor: '#1A2B7A' }}></div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#F0F4FF', color: '#1A2B7A' }}>
                    B
                  </div>
                </div>
                
                {/* Notes in Center */}
                <div className="w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm">💬</span>
                    <span className="text-xs font-medium" style={{ color: '#1A2B7A' }}>Context (optional)</span>
                  </div>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none transition-all duration-200 text-sm resize-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F8F8F8'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1A2B7A';
                      e.target.style.backgroundColor = '#FFFFFF';
                      e.target.style.boxShadow = '0 0 0 2px rgba(26, 43, 122, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.backgroundColor = '#F8F8F8';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Why connect them?"
                  />
                </div>
              </div>

              {/* Person B */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: '#F0F4FF', color: '#1A2B7A' }}>
                    B
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: '#1A2B7A' }}>Person B</h2>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={formData.personB.name}
                      onChange={(e) => handleInputChange('personB', 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none transition-all duration-200 text-sm"
                      style={{ 
                        borderColor: errors.personB_name ? '#EF4444' : '#E5E7EB',
                        backgroundColor: '#F8F8F8'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1A2B7A';
                        e.target.style.backgroundColor = '#FFFFFF';
                        e.target.style.boxShadow = '0 0 0 2px rgba(26, 43, 122, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.personB_name ? '#EF4444' : '#E5E7EB';
                        e.target.style.backgroundColor = '#F8F8F8';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Name *"
                    />
                    {errors.personB_name && (
                      <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.personB_name}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      value={formData.personB.email}
                      onChange={(e) => handleInputChange('personB', 'email', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none transition-all duration-200 text-sm"
                      style={{ 
                        borderColor: '#E5E7EB',
                        backgroundColor: '#F8F8F8'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1A2B7A';
                        e.target.style.backgroundColor = '#FFFFFF';
                        e.target.style.boxShadow = '0 0 0 2px rgba(26, 43, 122, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.backgroundColor = '#F8F8F8';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Email"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      value={formData.personB.phone}
                      onChange={(e) => handleInputChange('personB', 'phone', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none transition-all duration-200 text-sm"
                      style={{ 
                        borderColor: '#E5E7EB',
                        backgroundColor: '#F8F8F8'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1A2B7A';
                        e.target.style.backgroundColor = '#FFFFFF';
                        e.target.style.boxShadow = '0 0 0 2px rgba(26, 43, 122, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.backgroundColor = '#F8F8F8';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Phone"
                    />
                    {errors.personB_contact && (
                      <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.personB_contact}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 border rounded-lg font-medium transition-all duration-200 text-sm"
                style={{ 
                  borderColor: '#E5E7EB',
                  color: '#6B7280'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8F8F8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                style={{ 
                  backgroundColor: '#1A2B7A',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#334D99';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1A2B7A';
                }}
              >
                Make Connection ✨
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
