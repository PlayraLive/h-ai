"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Users, Clock, Zap, ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';
import { getFeaturedSpecialists } from '@/lib/data/ai-specialists';
import { AISpecialist } from '@/types';

interface SpecialistCarouselProps {
  showTitle?: boolean;
}

export default function SpecialistCarousel({ showTitle = true }: SpecialistCarouselProps) {
  const [specialists, setSpecialists] = useState<AISpecialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    loadSpecialists();
  }, []);

  const loadSpecialists = async () => {
    try {
      setLoading(true);
      const data = await getFeaturedSpecialists(6); // Load 6 featured specialists
      setSpecialists(data);
    } catch (error) {
      console.error('Error loading specialists:', error);
      // Fallback to empty array if loading fails
      setSpecialists([]);
    } finally {
      setLoading(false);
    }
  };

  // Show 3.3 items on desktop, 2.5 on tablet, 1.2 on mobile
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 3.3;
    if (window.innerWidth >= 1024) return 3.3; // Desktop: 3.3 specialists
    if (window.innerWidth >= 768) return 2.5;  // Tablet: 2.5 specialists  
    return 1.2; // Mobile: 1.2 specialists
  };

  const [itemsVisible, setItemsVisible] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      setItemsVisible(getItemsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, specialists.length - Math.floor(itemsVisible));

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  const handleTrySpecialist = (specialist: AISpecialist) => {
    console.log('Trying specialist:', specialist.name);
    // Redirect to order flow for this specialist
    window.location.href = `/en/ai-specialists/${specialist.id}/order?type=task`;
  };

  if (!mounted) {
    return (
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
          </div>
          <div className="flex gap-4 px-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse h-[480px]" style={{minWidth: '300px'}} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
          </div>
          <div className="flex gap-4 px-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse h-[480px]" style={{minWidth: '300px'}} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center border border-white/30 shadow-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                AI <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Специалисты</span>
              </h2>
              <div className="flex items-center space-x-1">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-yellow-400 font-semibold text-lg">4.8</span>
              </div>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Профессиональные AI специалисты готовы помочь с вашими проектами. 
              <span className="text-blue-600 dark:text-blue-400 font-medium"> Уникальная экспертиза </span>
              в каждой области.
            </p>
          </div>
        )}

        <div className="relative">
          <div 
            ref={trackRef}
            className="flex transition-transform duration-500 ease-out gap-4 lg:gap-6 px-2"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsVisible)}%)`
            }}
          >
            {specialists.map((specialist) => (
              <div
                key={specialist.id}
                className="flex-shrink-0"
                style={{ width: `calc(${100 / itemsVisible}% - 16px)` }}
                onMouseEnter={() => setHoveredCard(specialist.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-blue-500/10 hover:-translate-y-2 h-[480px] border border-gray-200/40 dark:border-gray-700/40 hover:border-purple-400/60 dark:hover:border-purple-500/60">
                  
                  {/* Video Background */}
                  <div className="absolute inset-0 w-full h-full">
                    {specialist.videoUrl ? (
                      <video
                        className="w-full h-full object-cover"
                        autoPlay={hoveredCard === specialist.id}
                        muted
                        loop
                        playsInline
                        poster={specialist.avatar}
                      >
                        <source src={specialist.videoUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <Image
                        src={specialist.avatar}
                        alt={specialist.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${specialist.name}`;
                        }}
                      />
                    )}
                    
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </div>

                  {/* Play button overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                    hoveredCard === specialist.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40">
                      <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                  
                  {/* Top Info Block */}
                  <div className="absolute top-2 left-2 right-2">
                    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/20 dark:border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold text-base mb-1">
                            {specialist.name}
                          </h3>
                          <p className="text-blue-200 dark:text-blue-300 font-medium text-sm">
                            {specialist.title}
                          </p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-2 py-1 flex items-center gap-1 border border-white/30">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white text-sm font-medium">{specialist.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Info Block */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/20 dark:border-white/10 space-y-3">
                      <p className="text-white/90 text-sm leading-relaxed">
                        {specialist.shortDescription}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-white/80">
                        <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-2xl border border-white/10">
                          <Users className="w-4 h-4" />
                          <span>{specialist.completedTasks} задач</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-2xl border border-white/10">
                          <Clock className="w-4 h-4" />
                          <span>{specialist.responseTime}</span>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <button
                        onClick={() => handleTrySpecialist(specialist)}
                        className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold py-2 px-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group/btn border border-white/40 hover:border-white/60"
                      >
                        <Zap className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                        <span className="text-sm">Попробовать</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-600 dark:bg-blue-400 w-8'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows for larger screens */}
        <div className="hidden lg:block">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 backdrop-blur-md border border-white/30 dark:border-white/20 rounded-3xl flex items-center justify-center transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex === maxIndex}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 backdrop-blur-md border border-white/30 dark:border-white/20 rounded-3xl flex items-center justify-center transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
        </div>
      </div>
    </section>
  );
} 