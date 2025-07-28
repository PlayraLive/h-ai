'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Play, 
  Pause, 
  Star, 
  Clock, 
  CheckCircle, 
  Zap,
  Crown,
  Heart,
  MessageCircle,
  DollarSign,
  ChevronRight,
  Users,
  Sparkles
} from 'lucide-react';
import { AISpecialist } from '@/types';
import { getFeaturedSpecialists } from '@/lib/data/ai-specialists';

interface AISpecialistCardProps {
  specialist: AISpecialist;
  onOrder: (specialist: AISpecialist, orderType: 'monthly' | 'task') => void;
}

function AISpecialistCard({ specialist, onOrder }: AISpecialistCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showVoiceIntro, setShowVoiceIntro] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowVoiceIntro(true);
    // Auto-hide voice intro after 3 seconds
    setTimeout(() => setShowVoiceIntro(false), 3000);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowVoiceIntro(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Generate consistent colors based on specialist name
  const getGradientFromName = (name: string) => {
    const colors = [
      'from-purple-500 to-blue-500',
      'from-pink-500 to-purple-500', 
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div 
      className="relative group modern-card overflow-hidden border border-white/10 dark:border-gray-700/30 hover:border-blue-400/50 transition-all duration-500 transform hover:scale-105"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Featured/Popular Badge */}
      {(specialist.isFeatured || specialist.isPopular) && (
        <div className="absolute top-3 left-3 z-20">
          {specialist.isFeatured ? (
            <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              <Crown className="w-3 h-3" />
              <span>Featured</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span>Popular</span>
            </div>
          )}
        </div>
      )}

      {/* Avatar/Image Background */}
      <div className="relative h-80 overflow-hidden">
        {imageError ? (
          // Gradient fallback with initials
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradientFromName(specialist.name)} flex items-center justify-center`}>
            <div className="text-white text-6xl font-bold">
              {specialist.name.split(' ').map(word => word[0]).join('')}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-blue-600/30">
            <Image
              src={specialist.avatar}
              alt={specialist.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              onError={handleImageError}
            />
          </div>
        )}
        
        {/* Video Play Button */}
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handleVideoClick}
        >
          <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-300 hover:scale-110">
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </div>
        </div>

        {/* Voice Intro Overlay */}
        {showVoiceIntro && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
              <div className="flex items-start space-x-2">
                <MessageCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-white text-sm leading-relaxed">{specialist.voiceIntro}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overlay */}
        <div className="absolute top-3 right-3 space-y-2">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-white text-xs font-medium">{specialist.rating}</span>
          </div>
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
            <Users className="w-3 h-3 text-blue-400" />
            <span className="text-white text-xs font-medium">{specialist.completedTasks}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div>
          <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-tight">{specialist.name}</h3>
          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{specialist.title}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{specialist.shortDescription}</p>
        </div>

        {/* AI Providers */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-xs">Powered by:</span>
          <div className="flex space-x-1">
            {specialist.aiProviders.map((provider) => (
              <div 
                key={provider}
                className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded-full border border-gray-600/30"
              >
                {provider === 'openai' && 'OpenAI'}
                {provider === 'anthropic' && 'Claude'}
                {provider === 'grok' && 'Grok'}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{specialist.responseTime}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>{specialist.deliveryTime}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Online</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="space-y-2 pt-2 border-t border-gray-700/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-white font-bold">${specialist.taskPrice}</span>
                <span className="text-gray-400 text-sm">/ task</span>
              </div>
              <div className="text-gray-400 text-xs">
                or ${specialist.monthlyPrice}/month
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onOrder(specialist, 'task')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Order Task
              </button>
              <button
                onClick={() => onOrder(specialist, 'monthly')}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AISpecialistsGridProps {
  limit?: number;
  showTitle?: boolean;
  onOrder?: (specialist: AISpecialist, orderType: 'monthly' | 'task') => void;
}

export default function AISpecialistsGrid({ 
  limit = 4, 
  showTitle = true,
  onOrder 
}: AISpecialistsGridProps) {
  const [specialists, setSpecialists] = useState<AISpecialist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpecialists = async () => {
      try {
        setLoading(true);
        const data = await getFeaturedSpecialists(limit);
        setSpecialists(data);
      } catch (error) {
        console.error('Error loading AI specialists:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpecialists();
  }, [limit]);

  const handleOrder = (specialist: AISpecialist, orderType: 'monthly' | 'task') => {
    if (onOrder) {
      onOrder(specialist, orderType);
    } else {
      // Default behavior - redirect to order page
      window.location.href = `/en/ai-specialists/${specialist.id}/order?type=${orderType}`;
    }
  };

  if (loading) {
    return (
      <section className="w-full">
        {showTitle && (
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              AI <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Specialists</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Meet our AI specialists who solve complex tasks instantly. From design to development - get results in minutes, not days.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="bg-gray-800/50 rounded-2xl p-6 animate-pulse">
              <div className="h-80 bg-gray-700 rounded-xl mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            AI <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Specialists</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Meet our AI specialists who solve complex tasks instantly. From design to development - get results in minutes, not days.
          </p>
        </div>
      )}

      {specialists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No AI specialists available at the moment.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialists.map((specialist) => (
              <AISpecialistCard
                key={specialist.id}
                specialist={specialist}
                onOrder={handleOrder}
              />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <button className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold text-sm shadow-xl hover:shadow-purple-500/25 hover:scale-105 border border-white/10">
              <span className="mr-2">View All AI Specialists</span>
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </>
      )}
    </section>
  );
} 