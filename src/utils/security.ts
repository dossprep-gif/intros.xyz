// Security utilities for input validation and sanitization

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates and sanitizes email addresses
 */
export function validateEmail(email: string): string | null {
  if (typeof email !== 'string') return null;
  
  const sanitized = sanitizeHtml(email.trim().toLowerCase());
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(sanitized) ? sanitized : null;
}

/**
 * Validates and sanitizes phone numbers
 */
export function validatePhone(phone: string): string | null {
  if (typeof phone !== 'string') return null;
  
  const sanitized = phone.replace(/[^\d\-\+\(\)\s]/g, '').trim();
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  
  return phoneRegex.test(sanitized.replace(/[\s\-\(\)]/g, '')) ? sanitized : null;
}

/**
 * Validates and sanitizes URLs
 */
export function validateUrl(url: string): string | null {
  if (typeof url !== 'string') return null;
  
  const sanitized = sanitizeHtml(url.trim());
  
  try {
    const urlObj = new URL(sanitized);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    return sanitized;
  } catch {
    return null;
  }
}

/**
 * Validates and sanitizes names (letters, spaces, hyphens, apostrophes)
 */
export function validateName(name: string): string | null {
  if (typeof name !== 'string') return null;
  
  const sanitized = sanitizeHtml(name.trim());
  const nameRegex = /^[a-zA-Z\s\-']{1,50}$/;
  
  return nameRegex.test(sanitized) ? sanitized : null;
}

/**
 * Validates and sanitizes text content (general purpose)
 */
export function validateText(text: string, maxLength: number = 500): string | null {
  if (typeof text !== 'string') return null;
  
  const sanitized = sanitizeHtml(text.trim());
  
  return sanitized.length <= maxLength && sanitized.length > 0 ? sanitized : null;
}

/**
 * Validates and sanitizes location strings
 */
export function validateLocation(location: string): string | null {
  if (typeof location !== 'string') return null;
  
  const sanitized = sanitizeHtml(location.trim());
  const locationRegex = /^[a-zA-Z\s\-',.]{1,100}$/;
  
  return locationRegex.test(sanitized) ? sanitized : null;
}

/**
 * Validates profile picture URLs (more flexible for storage URLs)
 */
export function validateProfilePictureUrl(url: string): boolean {
  if (typeof url !== 'string') return false;
  
  const trimmed = url.trim();
  
  // Allow empty strings (no profile picture)
  if (trimmed === '') return true;
  
  // Allow Supabase storage URLs
  if (trimmed.includes('supabase') && trimmed.includes('storage')) return true;
  
  // Allow standard HTTP/HTTPS URLs
  try {
    const urlObj = new URL(trimmed);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Validates array of strings (for expertise, hobbies, etc.)
 */
export function validateStringArray(items: any[], maxItems: number = 10): string[] {
  if (!Array.isArray(items)) return [];
  
  return items
    .slice(0, maxItems)
    .map(item => typeof item === 'string' ? sanitizeHtml(item.trim()) : '')
    .filter(item => item.length > 0 && item.length <= 50);
}

/**
 * Rate limiting utility for localStorage operations
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (attempt.count >= maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Secure localStorage operations with validation
 */
export class SecureStorage {
  static setItem(key: string, value: any): boolean {
    if (!rateLimiter.isAllowed(key)) {
      console.warn('Rate limit exceeded for localStorage operation');
      return false;
    }
    
    try {
      const serialized = JSON.stringify(value);
      if (serialized.length > 1024 * 1024) { // 1MB limit
        console.warn('Data too large for localStorage');
        return false;
      }
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }
  
  static getItem(key: string): any {
    if (!rateLimiter.isAllowed(key)) {
      return null;
    }
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }
  
  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  }
}

/**
 * Validates introduction data structure
 */
export function validateIntroduction(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Required fields
  if (!data.id || typeof data.id !== 'string') return false;
  if (!data.date || typeof data.date !== 'string') return false;
  
  // PersonA validation
  if (!data.personA || typeof data.personA !== 'object') return false;
  if (!validateName(data.personA.name)) return false;
  if (data.personA.email && !validateEmail(data.personA.email)) return false;
  if (data.personA.phone && !validatePhone(data.personA.phone)) return false;
  
  // PersonB validation
  if (!data.personB || typeof data.personB !== 'object') return false;
  if (!validateName(data.personB.name)) return false;
  if (data.personB.email && !validateEmail(data.personB.email)) return false;
  if (data.personB.phone && !validatePhone(data.personB.phone)) return false;
  
  // Optional fields
  if (data.notes && !validateText(data.notes, 1000)) return false;
  if (data.verified !== undefined && typeof data.verified !== 'boolean') return false;
  
  return true;
}

/**
 * Validates user data structure
 */
export function validateUser(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Required fields
  if (!validateEmail(data.email)) return false;
  if (!validateName(data.name)) return false;
  if (typeof data.isAuthenticated !== 'boolean') return false;
  
  // Optional fields
  if (data.position && !validateText(data.position, 100)) return false;
  if (data.location && !validateLocation(data.location)) return false;
  if (data.bio && !validateText(data.bio, 500)) return false;
  if (data.education && !validateText(data.education, 200)) return false;
  if (data.expertise && !Array.isArray(data.expertise)) return false;
  if (data.hobbies && !Array.isArray(data.hobbies)) return false;
  if (data.adjectives && !Array.isArray(data.adjectives)) return false;
  
  // Social links validation
  if (data.socialLinks && typeof data.socialLinks === 'object') {
    for (const [platform, url] of Object.entries(data.socialLinks)) {
      if (typeof url === 'string' && !validateUrl(url)) return false;
    }
  }
  
  // Profile picture URL validation (more flexible for storage URLs)
  if (data.profilePictureUrl && typeof data.profilePictureUrl === 'string') {
    if (!validateProfilePictureUrl(data.profilePictureUrl)) return false;
  }
  
  return true;
}
