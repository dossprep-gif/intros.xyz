import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "intros.xyz - Professional Network Introduction Tracker",
  description: "Track introductions, showcase your profile, and connect with your network. Build your professional network with verified introductions.",
  keywords: ["networking", "professional connections", "introductions", "business networking", "career"],
  authors: [{ name: "intros.xyz" }],
  creator: "intros.xyz",
  publisher: "intros.xyz",
  robots: "index, follow",
  openGraph: {
    title: "intros.xyz - Professional Network Introduction Tracker",
    description: "Track introductions, showcase your profile, and connect with your network.",
    type: "website",
    locale: "en_US",
    siteName: "intros.xyz",
  },
  twitter: {
    card: "summary_large_image",
    title: "intros.xyz - Professional Network Introduction Tracker",
    description: "Track introductions, showcase your profile, and connect with your network.",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1A2B7A",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Security Headers */}
        <meta httpEquiv="Content-Security-Policy" content="
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline';
          style-src 'self' 'unsafe-inline' fonts.googleapis.com;
          font-src 'self' fonts.gstatic.com;
          img-src 'self' data: https: blob:;
          connect-src 'self' https://*.supabase.co https://*.supabase.in;
          frame-ancestors 'none';
          base-uri 'self';
          form-action 'self';
        " />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
