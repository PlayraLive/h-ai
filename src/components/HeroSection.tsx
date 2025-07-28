"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Star } from 'lucide-react';

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="relative min-h-[90vh] flex items-center justify-center bg-white dark:bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />
        <div className="relative z-10 text-center w-full px-4 sm:px-6 lg:px-8">
          <div className="h-16 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-6 animate-pulse" />
          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-8 animate-pulse" />
          <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-white dark:bg-gray-950 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 dark:bg-blue-300/20 rounded-full animate-pulse"
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
      <div className="relative z-10 text-center w-full px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>Powered by Advanced AI</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
          AI Freelance
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Platform
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
          Connect with AI specialists who solve complex tasks instantly. 
          From design to development, get professional results in minutes, not days.
        </p>

        {/* Feature highlights */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-12 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Instant Results</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium">Expert Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">AI-Powered</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/en/specialists"
            className="group inline-flex items-center gap-3 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 backdrop-blur-md text-gray-900 dark:text-white font-semibold px-8 py-4 rounded-3xl transition-all duration-300 border-2 border-gray-300/40 dark:border-white/30 hover:border-gray-400/60 dark:hover:border-white/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span className="text-lg">Find AI Specialists</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">500+</div>
            <div className="text-gray-600 dark:text-gray-400">AI Specialists</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">10k+</div>
            <div className="text-gray-600 dark:text-gray-400">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">98%</div>
            <div className="text-gray-600 dark:text-gray-400">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
    </section>
  );
} 