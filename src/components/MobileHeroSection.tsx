"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Star } from 'lucide-react';

export default function MobileHeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 overflow-hidden md:hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />
        <div className="relative z-10 text-center px-4">
          <div className="h-12 w-72 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-6 animate-pulse" />
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 overflow-hidden md:hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-blue-400/30 dark:bg-blue-300/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-sm mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-full text-blue-700 dark:text-blue-300 text-xs font-medium mb-6">
          <Sparkles className="w-3 h-3" />
          <span>AI-Powered</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          AI Freelance
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Platform
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Connect with AI specialists who solve complex tasks instantly. Get professional results in minutes.
        </p>

        {/* Feature highlights */}
        <div className="flex flex-col items-center gap-4 mb-8 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-sm">Instant Results</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-sm">Expert Quality</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/en/specialists"
          className="group inline-flex items-center gap-2 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 backdrop-blur-md text-gray-900 dark:text-white font-semibold px-6 py-3 rounded-3xl transition-all duration-300 border-2 border-gray-300/40 dark:border-white/30 hover:border-gray-400/60 dark:hover:border-white/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <span>Find Specialists</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">500+</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Specialists</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">10k+</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Tasks</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">98%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Success</div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
    </section>
  );
} 