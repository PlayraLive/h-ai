"use client";

import { useState, useEffect } from 'react';
import { Trophy, Star, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface AchievementNotificationProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

const AchievementNotification = ({ 
  achievement, 
  isVisible, 
  onClose,
  autoCloseDelay = 5000 
}: AchievementNotificationProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto close after delay
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoCloseDelay]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          gradient: 'from-yellow-400 via-orange-500 to-red-500',
          border: 'border-yellow-500/50',
          glow: 'shadow-yellow-500/50',
          sparkles: 'text-yellow-300'
        };
      case 'epic':
        return {
          gradient: 'from-purple-400 via-pink-500 to-purple-600',
          border: 'border-purple-500/50',
          glow: 'shadow-purple-500/50',
          sparkles: 'text-purple-300'
        };
      case 'rare':
        return {
          gradient: 'from-blue-400 via-cyan-500 to-blue-600',
          border: 'border-blue-500/50',
          glow: 'shadow-blue-500/50',
          sparkles: 'text-blue-300'
        };
      case 'uncommon':
        return {
          gradient: 'from-green-400 via-emerald-500 to-green-600',
          border: 'border-green-500/50',
          glow: 'shadow-green-500/50',
          sparkles: 'text-green-300'
        };
      default:
        return {
          gradient: 'from-gray-400 via-gray-500 to-gray-600',
          border: 'border-gray-500/50',
          glow: 'shadow-gray-500/50',
          sparkles: 'text-gray-300'
        };
    }
  };

  const colors = getRarityColors(achievement.rarity);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Achievement Card */}
      <div 
        className={cn(
          "relative pointer-events-auto max-w-md w-full bg-gray-900 rounded-2xl border-2 overflow-hidden transition-all duration-500 transform",
          colors.border,
          colors.glow,
          isAnimating 
            ? "scale-100 opacity-100 translate-y-0 shadow-2xl" 
            : "scale-75 opacity-0 translate-y-8"
        )}
      >
        {/* Animated Background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-10 animate-pulse",
          colors.gradient
        )} />
        
        {/* Sparkles Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <Sparkles
              key={i}
              className={cn(
                "absolute w-3 h-3 animate-bounce",
                colors.sparkles
              )}
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + (i % 3)}s`
              }}
            />
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative p-6 text-center">
          {/* Header */}
          <div className="mb-4">
            <div className={cn(
              "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br shadow-lg mb-4 animate-pulse",
              colors.gradient
            )}>
              <span className="text-3xl">{achievement.icon}</span>
            </div>
            
            <div className={cn(
              "inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider mb-2",
              `bg-gradient-to-r ${colors.gradient} text-white`
            )}>
              {achievement.rarity} Achievement
            </div>
          </div>

          {/* Achievement Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {achievement.name}
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {achievement.description}
            </p>
          </div>

          {/* Rewards */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">
                  +{achievement.xpReward} XP
                </span>
              </div>
              
              <div className="w-px h-6 bg-gray-600" />
              
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-semibold">
                  Достижение разблокировано
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClose}
            className={cn(
              "w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105",
              `bg-gradient-to-r ${colors.gradient} text-white shadow-lg hover:shadow-xl`
            )}
          >
            Отлично! 🎉
          </button>
        </div>

        {/* Animated Border Effect */}
        <div className={cn(
          "absolute inset-0 rounded-2xl border-2 animate-pulse",
          colors.border
        )} />
      </div>

      {/* Confetti Effect */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-2 h-2 rounded-full animate-bounce",
                i % 4 === 0 ? "bg-yellow-400" :
                i % 4 === 1 ? "bg-purple-400" :
                i % 4 === 2 ? "bg-blue-400" : "bg-green-400"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementNotification; 