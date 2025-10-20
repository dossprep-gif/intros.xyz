'use client';

import { useState } from 'react';
import Link from 'next/link';
import { validateEmail, validateText } from '@/utils/security';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Validate inputs
    const validatedName = validateText(formData.name, 50);
    const validatedEmail = validateEmail(formData.email);
    const validatedSubject = validateText(formData.subject, 100);
    const validatedMessage = validateText(formData.message, 1000);

    if (!validatedName || !validatedEmail || !validatedSubject || !validatedMessage) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      // In a real implementation, you would send this to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>
      {/* Header */}
      <header className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-extrabold" style={{ color: '#1A2B7A' }}>
              intros.xyz
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-md font-semibold transition-colors"
              style={{ 
                backgroundColor: '#1A2B7A',
                color: '#FFFFFF'
              }}
            >
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="rounded-2xl p-8" style={{ backgroundColor: '#FFFFFF' }}>
          <h1 className="text-4xl font-bold mb-8" style={{ color: '#1A2B7A' }}>
            Contact Us
          </h1>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A2B7A' }}>
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0F4FF' }}>
                    <svg className="w-5 h-5" style={{ color: '#1A2B7A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#1A2B7A' }}>Email</h3>
                    <p className="text-sm" style={{ color: '#6B7280' }}>hello@intros.xyz</p>
                    <p className="text-sm" style={{ color: '#6B7280' }}>support@intros.xyz</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0F4FF' }}>
                    <svg className="w-5 h-5" style={{ color: '#1A2B7A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#1A2B7A' }}>Response Time</h3>
                    <p className="text-sm" style={{ color: '#6B7280' }}>We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0F4FF' }}>
                    <svg className="w-5 h-5" style={{ color: '#1A2B7A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#1A2B7A' }}>Support</h3>
                    <p className="text-sm" style={{ color: '#6B7280' }}>For technical issues or feature requests</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#F8F8F8' }}>
                <h3 className="font-semibold mb-2" style={{ color: '#1A2B7A' }}>About intros.xyz</h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  We're building the future of professional networking by helping you track, manage, and optimize your professional introductions. 
                  Our platform makes it easy to build meaningful connections and measure your networking impact.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A2B7A' }}>
                Send us a Message
              </h2>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4', borderColor: '#22C55E' }}>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" style={{ color: '#22C55E' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium" style={{ color: '#166534' }}>
                      Message sent successfully! We'll get back to you soon.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#FEF2F2', borderColor: '#EF4444' }}>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" style={{ color: '#EF4444' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium" style={{ color: '#991B1B' }}>
                      Please check your inputs and try again.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    maxLength={50}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ borderColor: '#D1D5DB' }}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ borderColor: '#D1D5DB' }}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    maxLength={100}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ borderColor: '#D1D5DB' }}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    maxLength={1000}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ borderColor: '#D1D5DB' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: '#1A2B7A',
                    color: '#FFFFFF'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#334D99';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#1A2B7A';
                    }
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
