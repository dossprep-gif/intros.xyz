import Link from 'next/link';

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          
          <div className="prose max-w-none" style={{ color: '#374151' }}>
            <p className="text-lg mb-6" style={{ color: '#6B7280' }}>
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Introduction
              </h2>
              <p className="mb-4">
                intros.xyz ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our professional networking platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#334D99' }}>
                Personal Information
              </h3>
              <p className="mb-4">
                When you use our platform, we may collect:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Name and contact information (email, phone)</li>
                <li>Professional information (job title, company, location)</li>
                <li>Social media links and profiles</li>
                <li>Introduction records and networking activity</li>
                <li>Profile information (bio, expertise, interests)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3" style={{ color: '#334D99' }}>
                Technical Information
              </h3>
              <p className="mb-4">
                We automatically collect certain technical information:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Browser type and version</li>
                <li>Device information and operating system</li>
                <li>IP address and general location</li>
                <li>Usage patterns and interaction data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                How We Use Your Information
              </h2>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide and maintain our networking platform</li>
                <li>Track and manage your professional introductions</li>
                <li>Display your profile and achievements</li>
                <li>Improve our services and user experience</li>
                <li>Communicate with you about the platform</li>
                <li>Ensure platform security and prevent abuse</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Data Storage and Security
              </h2>
              <p className="mb-4">
                intros.xyz uses Supabase, a secure cloud database service, to store your data. This means:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your data is encrypted in transit and at rest</li>
                <li>Data is stored in secure, SOC 2 compliant data centers</li>
                <li>We implement Row Level Security (RLS) to ensure data isolation</li>
                <li>Regular security audits and monitoring are performed</li>
                <li>Data is backed up automatically to prevent loss</li>
                <li>Access is controlled through secure authentication</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Information Sharing
              </h2>
              <p className="mb-4">
                We do not share, sell, or trade your personal information with third parties, except:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>When required by law or legal process</li>
                <li>To protect our rights or prevent harm</li>
                <li>With your explicit consent</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Your Rights
              </h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of certain data processing</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Cookies and Tracking
              </h2>
              <p className="mb-4">
                We may use cookies and similar technologies to enhance your experience, analyze usage, and ensure platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Children's Privacy
              </h2>
              <p className="mb-4">
                Our platform is not intended for children under 13. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Changes to This Policy
              </h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#F8F8F8' }}>
                <p><strong>Email:</strong> privacy@intros.xyz</p>
                <p><strong>Website:</strong> <Link href="/contact" className="text-blue-600 hover:underline">Contact Form</Link></p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
