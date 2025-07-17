'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, MessageCircle, ArrowLeft } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  const handleRefresh = () => {
    // Try to recover by attempting to re-render the segment
    reset();
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-16 h-16 text-red-400 animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="glass-card p-8 rounded-2xl">
          <h1 className="text-3xl font-bold text-white mb-4">
            Something went wrong!
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            We encountered an unexpected error. Our team has been notified and is working to fix this issue.
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-left">
              <h3 className="text-red-400 font-semibold mb-2">Error Details:</h3>
              <pre className="text-red-300 text-sm overflow-x-auto whitespace-pre-wrap">
                {error.message}
              </pre>
              {error.digest && (
                <p className="text-red-400 text-xs mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={handleRefresh}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={handleReload}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Reload Page</span>
            </button>
            
            <Link
              href="/en"
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </Link>
          </div>

          {/* Help Section */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/en/support"
                className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center group"
              >
                <MessageCircle className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-300">Contact Support</span>
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center group"
              >
                <ArrowLeft className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-300">Go Back</span>
              </button>
            </div>
          </div>

          {/* Status Information */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              🔧 <strong>Status:</strong> Our team has been automatically notified of this issue. 
              You can also check our{' '}
              <Link href="/en/status" className="text-blue-400 hover:text-blue-300 transition-colors underline">
                status page
              </Link>{' '}
              for any ongoing incidents.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Error occurred at {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
