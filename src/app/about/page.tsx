import Link from 'next/link';

export default function AboutPage() {
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
            About intros.xyz
          </h1>
          
          <div className="prose max-w-none" style={{ color: '#374151' }}>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Our Mission
              </h2>
              <p className="mb-4">
                At intros.xyz, we believe that meaningful professional connections are the foundation of career success and business growth. 
                Our platform helps professionals track, manage, and optimize their networking efforts by making it easy to record and verify introductions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                What We Do
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#F8F8F8' }}>
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A2B7A' }}>Track Introductions</h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Record who you've introduced to whom, with detailed notes and timestamps for better relationship management.
                  </p>
                </div>
                
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#F8F8F8' }}>
                  <div className="text-3xl mb-3">👤</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A2B7A' }}>Professional Profiles</h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Showcase your expertise, interests, and social media presence to build your professional brand.
                  </p>
                </div>
                
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#F8F8F8' }}>
                  <div className="text-3xl mb-3">🏆</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A2B7A' }}>Achievement System</h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Earn badges and track your networking milestones to stay motivated and measure your impact.
                  </p>
                </div>
                
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#F8F8F8' }}>
                  <div className="text-3xl mb-3">🔒</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A2B7A' }}>Privacy First</h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Your data stays on your device. We believe in giving you full control over your professional information.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Why We Built This
              </h2>
              <p className="mb-4">
                Traditional networking often involves making introductions and then forgetting about them. We've all been there - 
                you introduce two people, they hit it off, but you have no way to track the outcome or measure your networking impact.
              </p>
              <p className="mb-4">
                intros.xyz solves this by providing a simple, secure way to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Record every introduction you make</li>
                <li>Track which connections lead to successful outcomes</li>
                <li>Build a reputation as someone who makes quality introductions</li>
                <li>Measure your networking ROI over time</li>
                <li>Never lose track of your professional relationships</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Our Values
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#334D99' }}>Privacy & Security</h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Your professional data is sensitive. We use client-side storage and robust security measures to protect your information.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#334D99' }}>Simplicity</h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Networking should be straightforward. Our platform is designed to be intuitive and easy to use.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#334D99' }}>Transparency</h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    We're open about how we handle your data and what features we're building next.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Getting Started
              </h2>
              <p className="mb-4">
                Ready to take control of your professional networking? Getting started is easy:
              </p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>Create your professional profile with your expertise and interests</li>
                <li>Start recording the introductions you make</li>
                <li>Verify connections when they lead to successful outcomes</li>
                <li>Watch your networking achievements grow</li>
                <li>Build a reputation as a valuable connector</li>
              </ol>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-block px-6 py-3 rounded-lg font-semibold transition-colors"
                  style={{ 
                    backgroundColor: '#1A2B7A',
                    color: '#FFFFFF'
                  }}
                >
                  Start Building Your Network
                </Link>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A2B7A' }}>
                Contact Us
              </h2>
              <p className="mb-4">
                Have questions, feedback, or suggestions? We'd love to hear from you.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="/contact"
                  className="px-4 py-2 rounded-md font-semibold transition-colors border-2"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    color: '#1A2B7A',
                    borderColor: '#1A2B7A'
                  }}
                >
                  Get in Touch
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
