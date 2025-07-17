'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search, HelpCircle, RefreshCw } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/en');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="text-[12rem] font-bold text-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text leading-none">
            404
          </div>
          <div className="absolute inset-0 text-[12rem] font-bold text-purple-500/10 leading-none animate-pulse">
            404
          </div>
        </div>

        {/* Content */}
        <div className="glass-card p-8 rounded-2xl">
          <h1 className="text-3xl font-bold text-white mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            The page you're looking for doesn't exist or has been moved. 
            Don't worry, it happens to the best of us!
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleGoBack}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
            
            <Link
              href="/en"
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/en/jobs"
                className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center group"
              >
                <Search className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-300">Browse Jobs</span>
              </Link>
              
              <Link
                href="/en/freelancers"
                className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center group"
              >
                <Search className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-300">Find Freelancers</span>
              </Link>
              
              <Link
                href="/en/dashboard"
                className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center group"
              >
                <Home className="w-6 h-6 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-300">Dashboard</span>
              </Link>
              
              <Link
                href="/en/support"
                className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center group"
              >
                <HelpCircle className="w-6 h-6 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-300">Get Help</span>
              </Link>
            </div>
          </div>

          {/* Search Suggestion */}
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-purple-300 text-sm">
              💡 <strong>Tip:</strong> Try using the search bar in the navigation to find what you're looking for.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            If you believe this is an error, please{' '}
            <Link href="/en/support" className="text-purple-400 hover:text-purple-300 transition-colors">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
