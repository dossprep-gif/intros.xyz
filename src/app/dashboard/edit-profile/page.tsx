'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { SupabaseUserService } from '@/lib/supabase-service';
import { validateEmail, validateUrl } from '@/utils/security';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
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
  profile_picture_url?: string;
}

export default function EditProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    location: '',
    bio: '',
    education: '',
    expertise: '',
    hobbies: '',
    adjectives: '',
    profilePictureUrl: '',
    socialLinks: {
      linkedin: '',
      instagram: '',
      twitter: '',
      github: '',
      website: '',
      other: ''
    }
  });
  const router = useRouter();

  const { user: authUser, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      router.push('/');
      return;
    }

    // Load user profile from Supabase
    const loadUserProfile = async () => {
      try {
        const userProfile = await SupabaseUserService.getCurrentUser();
        if (userProfile) {
          setUser(userProfile);
          
          // Populate form with existing data
          setFormData({
            name: userProfile.name || '',
            position: userProfile.position || '',
            location: userProfile.location || '',
            bio: userProfile.bio || '',
            education: userProfile.education || '',
            expertise: userProfile.expertise ? userProfile.expertise.join(', ') : '',
            hobbies: userProfile.hobbies ? userProfile.hobbies.join(', ') : '',
            adjectives: userProfile.adjectives ? userProfile.adjectives.join(', ') : '',
            profilePictureUrl: userProfile.profile_picture_url || '',
            socialLinks: {
              linkedin: userProfile.social_links?.linkedin || '',
              instagram: userProfile.social_links?.instagram || '',
              twitter: userProfile.social_links?.twitter || '',
              github: userProfile.social_links?.github || '',
              website: userProfile.social_links?.website || '',
              other: userProfile.social_links?.other || ''
            }
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        router.push('/');
      }
    };

    loadUserProfile();
  }, [authUser, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URLs
    const invalidUrls = Object.entries(formData.socialLinks)
      .filter(([, url]) => url.trim() !== '' && !validateUrl(url))
      .map(([platform]) => platform);
    
    if (invalidUrls.length > 0) {
      alert(`Please enter valid URLs for: ${invalidUrls.join(', ')}`);
      return;
    }
    
    try {
      // Convert comma-separated strings to arrays and filter empty social links
      const updatedUser = {
        email: user.email, // Include required email field
        name: formData.name,
        isAuthenticated: true, // Include required isAuthenticated field
        position: formData.position,
        location: formData.location,
        bio: formData.bio,
        education: formData.education,
        expertise: formData.expertise ? formData.expertise.split(',').map(s => s.trim()).filter(s => s) : [],
        hobbies: formData.hobbies ? formData.hobbies.split(',').map(s => s.trim()).filter(s => s) : [],
        adjectives: formData.adjectives ? formData.adjectives.split(',').map(s => s.trim()).filter(s => s) : [],
        profilePictureUrl: formData.profilePictureUrl,
        socialLinks: Object.fromEntries(
          Object.entries(formData.socialLinks).filter(([, value]) => value.trim() !== '')
        )
      };

      // Save updated user data to Supabase
      await SupabaseUserService.upsertUser(updatedUser);
      
      // Redirect back to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URLs are valid (optional fields)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleProfilePictureUploaded = (url: string) => {
    setFormData(prev => ({
      ...prev,
      profilePictureUrl: url
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
              <span style={{ color: '#6B7280' }}>Edit Profile</span>
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="px-8 py-6 border-b" style={{ borderColor: '#E5E7EB' }}>
            <h1 className="text-3xl font-bold" style={{ color: '#1A2B7A' }}>Edit Your Profile</h1>
            <p className="mt-2" style={{ color: '#6B7280' }}>Make your profile shareable and professional</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Profile Picture Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-6" style={{ color: '#1A2B7A' }}>Profile Picture</h2>
              <ProfilePictureUpload
                currentImageUrl={formData.profilePictureUrl}
                onImageUploaded={handleProfilePictureUploaded}
                userId={user.id}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: '#1A2B7A' }}>Basic Information</h2>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    Current Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="e.g., Senior Product Manager at TechCorp"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                <div>
                  <label htmlFor="education" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    Education
                  </label>
                  <input
                    type="text"
                    id="education"
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="e.g., Stanford University, Computer Science"
                  />
                </div>

                <div>
                  <label htmlFor="adjectives" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    Adjectives/Tags
                  </label>
                  <input
                    type="text"
                    id="adjectives"
                    value={formData.adjectives}
                    onChange={(e) => handleInputChange('adjectives', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="e.g., Strategic, Creative, Data-Driven (separate with commas)"
                  />
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                    Short descriptive words that represent you professionally
                  </p>
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: '#1A2B7A' }}>Professional Details</h2>

                <div>
                  <label htmlFor="bio" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="Tell people about yourself professionally..."
                  />
                </div>

                <div>
                  <label htmlFor="expertise" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    Areas of Expertise
                  </label>
                  <input
                    type="text"
                    id="expertise"
                    value={formData.expertise}
                    onChange={(e) => handleInputChange('expertise', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="e.g., Product Strategy, Data Analysis, Team Leadership (separate with commas)"
                  />
                </div>

                <div>
                  <label htmlFor="hobbies" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    Hobbies & Interests
                  </label>
                  <input
                    type="text"
                    id="hobbies"
                    value={formData.hobbies}
                    onChange={(e) => handleInputChange('hobbies', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="e.g., Photography, Rock Climbing, Wine Tasting (separate with commas)"
                  />
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                    Personal interests that help people connect with you
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6" style={{ color: '#1A2B7A' }}>Social Media & Links</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="linkedin" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label htmlFor="instagram" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    Instagram
                  </label>
                  <input
                    type="url"
                    id="instagram"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>

                <div>
                  <label htmlFor="twitter" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    Twitter/X
                  </label>
                  <input
                    type="url"
                    id="twitter"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="https://twitter.com/yourprofile"
                  />
                </div>

                <div>
                  <label htmlFor="github" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    GitHub
                  </label>
                  <input
                    type="url"
                    id="github"
                    value={formData.socialLinks.github}
                    onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="https://github.com/yourprofile"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={formData.socialLinks.website}
                    onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label htmlFor="other" className="block text-sm font-semibold mb-2" style={{ color: '#1A2B7A' }}>
                    Other
                  </label>
                  <input
                    type="url"
                    id="other"
                    value={formData.socialLinks.other}
                    onChange={(e) => handleSocialLinkChange('other', e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none transition-colors"
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
                    placeholder="https://other-platform.com/yourprofile"
                  />
                </div>
              </div>
              <p className="text-xs mt-4" style={{ color: '#6B7280' }}>
                Add your social media profiles and personal website to help people connect with you
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="mt-12 flex justify-end space-x-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 border rounded-md font-semibold transition-colors"
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
                className="px-8 py-3 rounded-md font-semibold transition-colors"
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
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

