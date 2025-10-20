import Link from 'next/link';

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          
          <div className="prose max-w-none" style={{ color: '#374151' }}>
            <p className="text-lg mb-6" style={{ color: '#6B7280' }}>
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing and using intros.xyz ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Description of Service
              </h2>
              <p className="mb-4">
                intros.xyz is a professional networking platform that allows users to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Create and manage professional profiles</li>
                <li>Track and manage professional introductions</li>
                <li>Connect with their professional network</li>
                <li>Showcase achievements and social media presence</li>
                <li>Build and maintain professional relationships</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                User Accounts and Responsibilities
              </h2>
              
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#334D99' }}>
                Account Creation
              </h3>
              <p className="mb-4">
                When creating an account, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Keep your information up to date</li>
                <li>Maintain the security of your account</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3" style={{ color: '#334D99' }}>
                Prohibited Activities
              </h3>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Use the service for illegal or unauthorized purposes</li>
                <li>Impersonate others or provide false information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Spam or send unsolicited communications</li>
                <li>Attempt to gain unauthorized access to the service</li>
                <li>Use automated systems to access the service</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Content and Data
              </h2>
              
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#334D99' }}>
                User Content
              </h3>
              <p className="mb-4">
                You retain ownership of the content you create and share on the platform. By using the service, you grant us a license to use, display, and distribute your content as necessary to provide the service.
              </p>

              <h3 className="text-xl font-semibold mb-3" style={{ color: '#334D99' }}>
                Data Storage
              </h3>
              <p className="mb-4">
                User data is stored securely in our cloud database using Supabase. Your data is encrypted, backed up automatically, and protected by industry-standard security measures. You can export your data at any time through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Privacy and Data Protection
              </h2>
              <p className="mb-4">
                Your privacy is important to us. Please review our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>, which also governs your use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Service Availability
              </h2>
              <p className="mb-4">
                We strive to provide continuous service availability, but we cannot guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, updates, or technical issues.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Intellectual Property
              </h2>
              <p className="mb-4">
                The service and its original content, features, and functionality are owned by intros.xyz and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Termination
              </h2>
              <p className="mb-4">
                We may terminate or suspend your access to the service immediately, without prior notice, for any reason, including breach of these terms. Upon termination, your right to use the service will cease immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Disclaimers and Limitations
              </h2>
              
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#334D99' }}>
                Service Disclaimer
              </h3>
              <p className="mb-4">
                The service is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted or error-free.
              </p>

              <h3 className="text-xl font-semibold mb-3" style={{ color: '#334D99' }}>
                Limitation of Liability
              </h3>
              <p className="mb-4">
                In no event shall intros.xyz be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or use, arising out of or relating to your use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Changes to Terms
              </h2>
              <p className="mb-4">
                We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Governing Law
              </h2>
              <p className="mb-4">
                These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Contact Information
              </h2>
              <p className="mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#F8F8F8' }}>
                <p><strong>Email:</strong> legal@intros.xyz</p>
                <p><strong>Website:</strong> <Link href="/contact" className="text-blue-600 hover:underline">Contact Form</Link></p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
