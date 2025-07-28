"use client";

import { useState, useRef, useEffect } from 'react';
import { Play, Heart, Eye, Crown, Sparkles, ArrowRight, TrendingUp, Star } from 'lucide-react';
import Link from 'next/link';

interface Solution {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  creatorName: string;
  isPremium: boolean;
  views: number;
  likes: number;
  rating: number;
  duration: number;
  tags: string[];
  price: number;
}

// AI Solutions data with video format
const mockSolutions: Solution[] = [
  {
    id: "1",
    title: "AI Website Builder",
    description: "Create stunning websites with AI in minutes",
    videoUrl: "/videos/website-demo.mp4",
    thumbnailUrl: "/images/website-thumb.svg",
    category: "website",
    creatorName: "Alex Designer",
    isPremium: true,
    views: 15420,
    likes: 892,
    rating: 4.9,
    duration: 45,
    tags: ["React", "AI", "Next.js"],
    price: 99
  },
  {
    id: "2",
    title: "TikTok Video Creator",
    description: "Generate viral TikTok content automatically",
    videoUrl: "/videos/tiktok-demo.mp4", 
    thumbnailUrl: "/images/tiktok-thumb.svg",
    category: "video",
    creatorName: "Video Pro",
    isPremium: false,
    views: 23100,
    likes: 1340,
    rating: 4.8,
    duration: 30,
    tags: ["Python", "OpenAI", "FFmpeg"],
    price: 79
  },
  {
    id: "3",
    title: "Telegram Bot Assistant",
    description: "Smart bot for customer support",
    videoUrl: "/videos/bot-demo.mp4",
    thumbnailUrl: "/images/bot-thumb.svg", 
    category: "bot",
    creatorName: "Bot Master",
    isPremium: false,
    views: 18750,
    likes: 967,
    rating: 4.7,
    duration: 60,
    tags: ["Node.js", "Telegram", "AI"],
    price: 149
  },
  {
    id: "4",
    title: "Logo Design AI",
    description: "Professional logos in seconds",
    videoUrl: "/videos/logo-demo.mp4",
    thumbnailUrl: "/images/logo-thumb.svg",
    category: "design", 
    creatorName: "Design Guru",
    isPremium: true,
    views: 12300,
    likes: 654,
    rating: 4.6,
    duration: 25,
    tags: ["AI", "Design", "Branding"],
    price: 59
  },
  {
    id: "5",
    title: "Voice Clone Studio",
    description: "Clone any voice with AI technology",
    videoUrl: "/videos/voice-demo.mp4",
    thumbnailUrl: "/images/voice-thumb.svg",
    category: "audio",
    creatorName: "Audio Master",
    isPremium: true,
    views: 9800,
    likes: 543,
    rating: 4.5,
    duration: 35,
    tags: ["Python", "AI", "Audio"],
    price: 199
  },
  {
    id: "6",
    title: "Content Creator AI",
    description: "Generate articles and social posts",
    videoUrl: "/videos/content-demo.mp4",
    thumbnailUrl: "/images/content-thumb.svg",
    category: "content",
    creatorName: "Content Pro",
    isPremium: false,
    views: 14200,
    likes: 821,
    rating: 4.4,
    duration: 40,
    tags: ["GPT", "Content", "SEO"],
    price: 89
  }
];

interface SolutionsCarouselProps {
  showTitle?: boolean;
}

export default function SolutionsCarousel({ showTitle = true }: SolutionsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [hoveredSolution, setHoveredSolution] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show more solutions on larger screens: 4 on desktop, 3 on tablet, 2 on mobile
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1024) return 4; // Desktop: 4 solutions
    if (window.innerWidth >= 768) return 3;  // Tablet: 3 solutions  
    return 2; // Mobile: 2 solutions
  };

  const [itemsVisible, setItemsVisible] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      setItemsVisible(getItemsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, mockSolutions.length - Math.floor(itemsVisible));

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  const handleMouseEnter = (solutionId: string, index: number) => {
    setHoveredSolution(solutionId);
    const video = videoRefs.current[index];
    if (video) {
      video.play().catch((e) => console.log("Video play failed:", e));
    }
  };

  const handleMouseLeave = (index: number) => {
    setHoveredSolution(null);
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  if (!mounted) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-3xl mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded-3xl mx-auto animate-pulse" />
          </div>
          <div className="flex gap-4 px-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse aspect-[9/16]" style={{minWidth: '280px'}} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              AI <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Solutions</span>
            </h2>
              <div className="flex items-center space-x-1">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-yellow-400 font-semibold text-lg">4.8</span>
              </div>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Предложения от пользователей и фрилансеров нашей платформы. 
              <span className="text-purple-600 dark:text-purple-400 font-medium"> Готовые решения </span>
              для вашего бизнеса.
            </p>
          </div>
        )}

        <div className="relative overflow-hidden">
          <div 
            ref={trackRef}
            className="flex transition-transform duration-500 ease-out gap-4 lg:gap-6 px-2"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsVisible)}%)`
            }}
          >
            {mockSolutions.map((solution, index) => (
              <Link
                  key={solution.id} 
                href={`/en/solutions/${solution.id}`}
                  className="flex-shrink-0 group cursor-pointer"
                style={{ width: `calc(${100 / itemsVisible}% - 16px)` }}
                onMouseEnter={() => handleMouseEnter(solution.id, index)}
                onMouseLeave={() => handleMouseLeave(index)}
              >
                <div className="relative aspect-[9/16] bg-black/60 backdrop-blur-md rounded-3xl overflow-hidden border border-gray-200/40 dark:border-gray-700/40 hover:border-purple-400/60 dark:hover:border-purple-500/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-900/30">
                  
                  {/* Background Video/Image */}
                  <div className="absolute inset-0">
                    <video
                      ref={(el) => { videoRefs.current[index] = el; }}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      src={solution.videoUrl}
                      poster={solution.thumbnailUrl}
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                    {/* Fallback gradient */}
                    {!solution.thumbnailUrl && (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-white" />
                      </div>
                    )}
                    {/* Enhanced overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent group-hover:from-black/80" />
                      </div>

                  {/* Premium Badge */}
                  {solution.isPremium && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-3xl text-xs font-bold flex items-center space-x-1 border-2 border-white/30 shadow-lg">
                      <Crown className="w-3 h-3" />
                      <span>PRO</span>
                    </div>
                  )}

                  {/* Enhanced Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 hover:border-white/60 transition-all duration-500 transform shadow-2xl ${
                        hoveredSolution === solution.id
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-75"
                      }`}
                    >
                      <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                      </div>
                    </div>
                    
                  {/* Creator Info */}
                  <div className="absolute top-3 left-3 right-12">
                    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-2 border border-white/20 dark:border-white/10">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center border border-white/30">
                          <span className="text-white text-xs font-bold">
                            {solution.creatorName[0]}
                          </span>
                        </div>
                        <p className="text-white text-sm font-medium">
                          {solution.creatorName}
                        </p>
                      </div>
                      <h3 className="text-white font-bold text-sm mt-1 line-clamp-2">
                        {solution.title}
                      </h3>
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/20 dark:border-white/10 space-y-3">
                      
                      {/* Tech Tags */}
                      <div className="flex flex-wrap gap-1">
                        {solution.tags?.slice(0, 2).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-2xl border border-white/30"
                          >
                            {tag}
                          </span>
                        ))}
                        {solution.tags && solution.tags.length > 2 && (
                          <span className="px-2 py-1 bg-purple-500/30 backdrop-blur-md text-purple-200 text-xs font-medium rounded-2xl border border-purple-400/30">
                            +{solution.tags.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Stats and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-2xl border border-white/10">
                            <Eye className="w-3 h-3 text-blue-400" />
                            <span className="text-white text-xs font-medium">{formatNumber(solution.views)}</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-2xl border border-white/10">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-white text-xs font-medium">{solution.rating}</span>
                          </div>
                        </div>
                        <div className="bg-green-500/90 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-2xl border border-green-400/30">
                          ${solution.price}
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold py-2 px-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group/btn border border-white/40 hover:border-white/60">
                        <span className="text-sm">Try Solution</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
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
                  ? 'bg-purple-600 dark:bg-purple-400 w-8'
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
            <ArrowRight className="w-5 h-5 rotate-180 text-gray-900 dark:text-white" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex === maxIndex}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 backdrop-blur-md border border-white/30 dark:border-white/20 rounded-3xl flex items-center justify-center transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/en/solutions"
            className="group inline-flex items-center justify-center px-8 py-4 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 backdrop-blur-md text-gray-900 dark:text-white rounded-3xl transition-all duration-300 font-semibold border border-gray-300/40 dark:border-white/30 hover:border-gray-400/60 dark:hover:border-white/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span className="text-lg">Explore All Solutions</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
} 