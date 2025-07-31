'use client';

import React, { useState } from 'react';
import { Star, Clock, Users, Zap, Crown, Heart } from 'lucide-react';
import { AISpecialist } from '@/types';

interface PositiveAICardProps {
  specialist: AISpecialist;
  onOrder: (specialist: AISpecialist) => void;
}

// Позитивные аватары с эмодзи
const avatarEmojis = {
  'alex-ai': '🤖',
  'luna-design': '🎨',
  'viktor-reels': '🎬',
  'max-bot': '⚡'
};

// Градиенты для каждого специалиста
const gradients = {
  'alex-ai': 'from-blue-400 via-purple-500 to-teal-400',
  'luna-design': 'from-pink-400 via-purple-500 to-orange-400',
  'viktor-reels': 'from-orange-400 via-red-500 to-pink-400',
  'max-bot': 'from-purple-400 via-blue-500 to-green-400'
};

// Анимированные звездочки
const FloatingStars = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-4 left-4 text-yellow-300 animate-pulse">✨</div>
    <div className="absolute top-8 right-6 text-blue-300 animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</div>
    <div className="absolute bottom-6 left-6 text-purple-300 animate-pulse" style={{ animationDelay: '1s' }}>💫</div>
    <div className="absolute bottom-4 right-4 text-green-300 animate-bounce" style={{ animationDelay: '1.5s' }}>🌟</div>
  </div>
);

export default function PositiveAICard({ specialist, onOrder }: PositiveAICardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const emoji = avatarEmojis[specialist.id as keyof typeof avatarEmojis] || '🚀';
  const gradient = gradients[specialist.id as keyof typeof gradients] || 'from-purple-400 to-blue-400';

  return (
    <div 
      className="group relative bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Анимированный фон */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Плавающие звездочки */}
      <FloatingStars />

      {/* Аватар-эмодзи */}
      <div className="relative h-80 flex items-center justify-center">
        <div className={`w-32 h-32 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-500 ${isHovered ? 'scale-110 rotate-12' : ''}`}>
          <div className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
            {emoji}
          </div>
        </div>

        {/* Кольца анимации */}
        <div className={`absolute w-40 h-40 rounded-full border-2 border-white/20 animate-ping ${isHovered ? 'opacity-100' : 'opacity-0'}`} style={{ animationDuration: '3s' }} />
        <div className={`absolute w-48 h-48 rounded-full border border-white/10 animate-pulse ${isHovered ? 'opacity-100' : 'opacity-0'}`} style={{ animationDuration: '4s' }} />

        {/* Рейтинг */}
        <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-white font-semibold">{specialist.rating}</span>
        </div>

        {/* Популярный бейдж */}
        {specialist.isPopular && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
            <Crown className="w-4 h-4" />
            <span>Popular</span>
          </div>
        )}
      </div>

      {/* Контент карточки */}
      <div className="relative p-6 space-y-4">
        {/* Заголовок */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{specialist.name}</h3>
          <p className="text-blue-200 font-medium">{specialist.title}</p>
        </div>

        {/* Описание */}
        <p className="text-white/80 text-sm leading-relaxed">{specialist.shortDescription}</p>

        {/* Статистика */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-white/70">
            <Users className="w-4 h-4" />
            <span>{specialist.completedTasks} задач</span>
          </div>
          <div className="flex items-center space-x-1 text-white/70">
            <Clock className="w-4 h-4" />
            <span>{specialist.responseTime}</span>
          </div>
        </div>

        {/* Кнопка заказа */}
        <button
          onClick={() => onOrder(specialist)}
          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
        >
          <Zap className="w-5 h-5" />
          <span>Попробовать</span>
          <span className="text-white/70">→</span>
        </button>

        {/* Лайк индикатор */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Heart className="w-6 h-6 text-red-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}