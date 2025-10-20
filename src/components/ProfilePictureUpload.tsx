'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  userId: string;
}

export default function ProfilePictureUpload({ 
  currentImageUrl, 
  onImageUploaded, 
  userId 
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading file:', error);
        
        // Handle specific error cases
        if (error.message.includes('Bucket not found')) {
          alert('Storage bucket not found. Please contact support or try again later.');
        } else if (error.message.includes('File size')) {
          alert('File is too large. Please choose an image smaller than 5MB.');
        } else if (error.message.includes('Invalid file type')) {
          alert('Invalid file type. Please choose a JPG, PNG, GIF, or WebP image.');
        } else {
          alert('Failed to upload image. Please try again.');
        }
        
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Call the callback with the new URL
      onImageUploaded(publicUrl);
      setUploading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;

    try {
      // Extract filename from URL
      const urlParts = currentImageUrl.split('/');
      const fileName = urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1];

      // Delete from storage
      const { error } = await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting file:', error);
        alert('Failed to remove image. Please try again.');
        return;
      }

      // Clear preview and call callback
      setPreviewUrl(null);
      onImageUploaded('');
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Failed to remove image. Please try again.');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Picture Display */}
      <div className="relative">
        <div 
          className="w-32 h-32 rounded-full border-4 overflow-hidden"
          style={{ 
            borderColor: '#E5E7EB',
            backgroundColor: '#F8F8F8'
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-12 h-12"
                style={{ color: '#9CA3AF' }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        
        {/* Upload Progress Indicator */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={uploading}
          className="px-4 py-2 rounded-md font-semibold transition-colors disabled:opacity-50"
          style={{ 
            backgroundColor: '#1A2B7A',
            color: '#FFFFFF'
          }}
          onMouseEnter={(e) => {
            if (!uploading) {
              e.currentTarget.style.backgroundColor = '#334D99';
            }
          }}
          onMouseLeave={(e) => {
            if (!uploading) {
              e.currentTarget.style.backgroundColor = '#1A2B7A';
            }
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>

        {previewUrl && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={uploading}
            className="px-4 py-2 border rounded-md font-semibold transition-colors disabled:opacity-50"
            style={{ 
              borderColor: '#E5E7EB',
              color: '#6B7280'
            }}
            onMouseEnter={(e) => {
              if (!uploading) {
                e.currentTarget.style.backgroundColor = '#F8F8F8';
              }
            }}
            onMouseLeave={(e) => {
              if (!uploading) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Remove
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help Text */}
      <p className="text-xs text-center" style={{ color: '#6B7280' }}>
        Upload a professional headshot. Max size: 5MB. Supported formats: JPG, PNG, GIF
      </p>
    </div>
  );
}
