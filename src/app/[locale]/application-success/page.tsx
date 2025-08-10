'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Try to import from Heroicons, fallback to simple icons
let CheckCircleIcon, ArrowRightIcon, BriefcaseIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  CheckCircleIcon = heroicons.CheckCircleIcon;
  ArrowRightIcon = heroicons.ArrowRightIcon;
  BriefcaseIcon = heroicons.BriefcaseIcon;
} catch {
  CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
  BriefcaseIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
    </svg>
  );
}

export default function ApplicationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const jobTitle = searchParams.get('job') || 'the job';
  const company = searchParams.get('company') || 'the company';

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      // Получаем текущую локаль из URL
      const currentLocale = window.location.pathname.split('/')[1] || 'en';
      router.push(`/${currentLocale}/dashboard`);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-6">
        
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Application Submitted Successfully!
          </h1>
          
          <p className="text-gray-300 text-lg leading-relaxed">
            Your application for <span className="text-white font-medium">"{jobTitle}"</span> has been sent to {company}.
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">What happens next?</h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <div className="text-white font-medium">Review Process</div>
                <div className="text-gray-400 text-sm">The client will review your application and portfolio</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <div className="text-white font-medium">Client Response</div>
                <div className="text-gray-400 text-sm">You'll receive a notification about their decision</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <div className="text-white font-medium">Project Start</div>
                <div className="text-gray-400 text-sm">If selected, you can begin working on the project</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href={`/${window.location.pathname.split('/')[1] || 'en'}/dashboard`}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <BriefcaseIcon className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </Link>
          
          <Link
            href={`/${window.location.pathname.split('/')[1] || 'en'}/jobs`}
            className="w-full btn-secondary flex items-center justify-center space-x-2"
          >
            <span>Browse More Jobs</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Auto redirect notice */}
        <div className="mt-8 text-sm text-gray-400">
          You'll be automatically redirected to your dashboard in 5 seconds...
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <div className="text-blue-300 font-medium mb-2">💡 Pro Tip</div>
          <div className="text-blue-200 text-sm">
            Keep your portfolio updated and respond quickly to client messages to increase your chances of getting hired!
          </div>
        </div>
      </div>
    </div>
  );
}
