// Интерактивная Hero секция с анимациями
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Users, Star, Briefcase, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HeroSectionProps {
  locale: string;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const { isAuthenticated } = useAuth();
  const [currentStat, setCurrentStat] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Анимированные статистики
  const stats = [
    { icon: Users, label: 'Active Freelancers', value: 15000, suffix: '+' },
    { icon: Briefcase, label: 'Projects Completed', value: 50000, suffix: '+' },
    { icon: Star, label: 'Average Rating', value: 4.9, suffix: '/5' },
    { icon: TrendingUp, label: 'Success Rate', value: 98, suffix: '%' }
  ];

  // Переключение статистик
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  // Анимированный счетчик
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));

  useEffect(() => {
    const timers = stats.map((stat, index) => {
      return setTimeout(() => {
        let start = 0;
        const end = stat.value;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            start = end;
            clearInterval(timer);
          }
          setAnimatedValues(prev => {
            const newValues = [...prev];
            newValues[index] = Math.floor(start);
            return newValues;
          });
        }, 16);
      }, index * 200);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = `/${locale}/dashboard`;
    } else {
      window.location.href = `/${locale}/signup`;
    }
  };

  const handleWatchDemo = () => {
    setShowVideoModal(true);
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950 pt-20">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Find the best{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI freelancers
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                Get your projects done by verified AI specialists with proven track records
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleWatchDemo}
                className="group flex items-center text-white text-lg px-8 py-4 rounded-xl border border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>

              <Link
                href={`/${locale}/jobs`}
                className="group text-purple-400 text-lg px-8 py-4 rounded-xl hover:text-purple-300 transition-colors"
              >
                Browse Jobs
                <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Animated Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const isActive = currentStat === index;
                return (
                  <div
                    key={index}
                    className={`text-center transition-all duration-500 ${
                      isActive ? 'scale-110 text-purple-400' : 'text-gray-400'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${isActive ? 'animate-pulse' : ''}`} />
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {stat.value === 4.9 ? stat.value : animatedValues[index]}
                      {stat.suffix}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-12 opacity-60">
              <div className="flex items-center gap-2 text-gray-400">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-5 h-5" />
                <span>15,000+ freelancers</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Briefcase className="w-5 h-5" />
                <span>50,000+ projects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-xl max-w-4xl w-full aspect-video">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              ✕
            </button>
            <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">Demo video coming soon...</p>
                <p className="text-gray-400 mt-2">Experience the power of AI freelancing</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
