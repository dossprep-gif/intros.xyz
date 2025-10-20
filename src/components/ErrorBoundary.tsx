'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details (in production, send to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Don't log sensitive information in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', errorInfo);
    }
    
    this.setState({
      error,
      errorInfo
    });

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F8F8' }}>
          <div className="max-w-md mx-auto text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
              <svg className="w-8 h-8" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold mb-2" style={{ color: '#1A2B7A' }}>
              Something went wrong
            </h2>
            
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              We encountered an unexpected error. This has been logged and we're working to fix it.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.resetError}
                className="w-full px-4 py-2 rounded-md font-semibold transition-colors hover:opacity-90"
                style={{ 
                  backgroundColor: '#1A2B7A',
                  color: '#FFFFFF'
                }}
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 rounded-md font-semibold transition-colors border-2 hover:opacity-90"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  color: '#1A2B7A',
                  borderColor: '#1A2B7A'
                }}
              >
                Go Home
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium" style={{ color: '#6B7280' }}>
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-3 text-xs bg-gray-100 rounded overflow-auto" style={{ color: '#374151' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
