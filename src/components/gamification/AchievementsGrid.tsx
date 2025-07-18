'use client';

import React, { useState } from 'react';
import { 
  ACHIEVEMENTS, 
  Achievement, 
  UserStats, 
  checkNewAchievements,
  getRarityColor 
} from '@/lib/gamification/achievements';
// Try to import from Heroicons, fallback to simple icons
let LockClosedIcon, CheckCircleIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  LockClosedIcon = heroicons.LockClosedIcon;
  CheckCircleIcon = heroicons.CheckCircleIcon;
} catch {
  const simpleIcons = require('@/components/icons/SimpleIcons');
  LockClosedIcon = simpleIcons.LockClosedIcon;
  CheckCircleIcon = simpleIcons.CheckCircleIcon;
}

interface AchievementsGridProps {
  userStats: UserStats;
  unlockedAchievements: string[];
  className?: string;
}

export default function AchievementsGrid({ 
  userStats, 
  unlockedAchievements, 
  className = '' 
}: AchievementsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  const categories = [
    { id: 'all', label: 'All', icon: '🏆' },
    { id: 'portfolio', label: 'Portfolio', icon: '📁' },
    { id: 'views', label: 'Views', icon: '👀' },
    { id: 'likes', label: 'Likes', icon: '❤️' },
    { id: 'rating', label: 'Rating', icon: '⭐' },
    { id: 'featured', label: 'Featured', icon: '🌟' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'streak', label: 'Streak', icon: '🔥' }
  ];

  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const unlockedMatch = !showOnlyUnlocked || unlockedAchievements.includes(achievement.id);
    return categoryMatch && unlockedMatch;
  });

  const isUnlocked = (achievementId: string) => unlockedAchievements.includes(achievementId);
  const canUnlock = (achievement: Achievement) => achievement.unlockCondition(userStats);

  const getAchievementStatus = (achievement: Achievement) => {
    if (isUnlocked(achievement.id)) return 'unlocked';
    if (canUnlock(achievement)) return 'available';
    return 'locked';
  };

  const unlockedCount = ACHIEVEMENTS.filter(a => isUnlocked(a.id)).length;
  const totalPoints = ACHIEVEMENTS
    .filter(a => isUnlocked(a.id))
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Achievements</h2>
          <p className="text-gray-400">
            {unlockedCount} of {ACHIEVEMENTS.length} unlocked • {totalPoints} points earned
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showOnlyUnlocked}
              onChange={(e) => setShowOnlyUnlocked(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
            <span>Show only unlocked</span>
          </label>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => {
          const status = getAchievementStatus(achievement);
          const rarityColors = getRarityColor(achievement.rarity);
          
          return (
            <div
              key={achievement.id}
              className={`relative p-4 rounded-xl border transition-all duration-300 ${
                status === 'unlocked'
                  ? `${rarityColors} border-current shadow-lg`
                  : status === 'available'
                  ? 'bg-gray-800 border-yellow-500/50 shadow-yellow-500/20'
                  : 'bg-gray-900 border-gray-700 opacity-75'
              }`}
            >
              {/* Status Icon */}
              <div className="absolute top-3 right-3">
                {status === 'unlocked' ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                ) : status === 'available' ? (
                  <div className="w-5 h-5 bg-yellow-400 rounded-full animate-pulse" />
                ) : (
                  <LockClosedIcon className="w-5 h-5 text-gray-500" />
                )}
              </div>

              {/* Achievement Content */}
              <div className="pr-8">
                <div className="text-3xl mb-3">{achievement.icon}</div>
                
                <h3 className={`font-bold mb-1 ${
                  status === 'unlocked' ? 'text-white' : 'text-gray-400'
                }`}>
                  {achievement.title}
                </h3>
                
                <p className={`text-sm mb-3 ${
                  status === 'unlocked' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {achievement.description}
                </p>

                {/* Rarity and Points */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${rarityColors}`}>
                    {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                  </span>
                  <span className={`text-sm font-medium ${
                    status === 'unlocked' ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    {achievement.points} pts
                  </span>
                </div>

                {/* Progress Indicator */}
                {status === 'available' && (
                  <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="text-xs text-yellow-400 font-medium">
                      🎯 Ready to unlock!
                    </div>
                  </div>
                )}

                {status === 'locked' && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">
                      Requirement: {achievement.requirements.type.replace('_', ' ')} ≥ {achievement.requirements.value}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No achievements found
          </h3>
          <p className="text-gray-400">
            {showOnlyUnlocked 
              ? "You haven't unlocked any achievements in this category yet."
              : "Try selecting a different category."
            }
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {['common', 'rare', 'epic', 'legendary'].map(rarity => {
          const rarityAchievements = ACHIEVEMENTS.filter(a => a.rarity === rarity);
          const unlockedInRarity = rarityAchievements.filter(a => isUnlocked(a.id)).length;
          const rarityColors = getRarityColor(rarity as Achievement['rarity']);
          
          return (
            <div key={rarity} className={`p-3 rounded-lg ${rarityColors}`}>
              <div className="text-lg font-bold">
                {unlockedInRarity}/{rarityAchievements.length}
              </div>
              <div className="text-sm opacity-75 capitalize">
                {rarity} Achievements
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
