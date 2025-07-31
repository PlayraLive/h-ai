'use client';

import React from 'react';

interface PositiveSpecialistAvatarProps {
  specialistId: string;
  specialistName: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

// Позитивные эмоджи для каждого специалиста
const specialistEmojis = {
  'alex-ai': '🤖',
  'luna-design': '🎨',
  'viktor-reels': '🎬',
  'max-bot': '⚡'
} as const;

// Градиенты для каждого специалиста
const specialistGradients = {
  'alex-ai': 'from-blue-400 via-purple-500 to-teal-400',
  'luna-design': 'from-pink-400 via-purple-500 to-orange-400',
  'viktor-reels': 'from-orange-400 via-red-500 to-pink-400',
  'max-bot': 'from-purple-400 via-blue-500 to-green-400'
} as const;

// Размеры
const sizes = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-3xl'
} as const;

export default function PositiveSpecialistAvatar({
  specialistId,
  specialistName,
  size = 'md',
  showStatus = false,
  className = ''
}: PositiveSpecialistAvatarProps) {
  
  const emoji = specialistEmojis[specialistId as keyof typeof specialistEmojis] || '🚀';
  const gradient = specialistGradients[specialistId as keyof typeof specialistGradients] || 'from-purple-400 to-blue-400';
  const sizeClasses = sizes[size];

  return (
    <div className={`relative ${className}`}>
      {/* Главный аватар */}
      <div className={`
        ${sizeClasses}
        bg-gradient-to-br ${gradient} 
        rounded-full 
        flex items-center justify-center 
        shadow-lg 
        border-2 border-white dark:border-gray-800
        hover:scale-110 
        transition-all duration-300
        animate-pulse
      `}>
        <span className="filter drop-shadow-md">
          {emoji}
        </span>
      </div>

      {/* Статус онлайн */}
      {showStatus && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse">
        </div>
      )}

      {/* Декоративные звездочки */}
      <div className="absolute -top-1 -right-1 text-yellow-300 animate-bounce text-xs opacity-75">
        ✨
      </div>
    </div>
  );
}