'use client';

import { Zap } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        {/* Logo with Animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse">
            <Zap className="w-10 h-10 text-white" />
          </div>
          
          {/* Ripple Effect */}
          <div className="absolute inset-0 w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-purple-500/30 rounded-2xl animate-ping"></div>
            <div className="absolute inset-2 bg-purple-500/20 rounded-xl animate-ping animation-delay-200"></div>
            <div className="absolute inset-4 bg-purple-500/10 rounded-lg animate-ping animation-delay-400"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-white mb-4">
          Loading...
        </h2>
        <p className="text-gray-400 mb-8">
          Please wait while we prepare your experience
        </p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
}
