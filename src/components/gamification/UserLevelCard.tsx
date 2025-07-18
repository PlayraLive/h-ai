'use client';

import React from 'react';
import { 
  calculateUserLevel, 
  getNextLevel, 
  calculateProgress, 
  UserStats,
  USER_LEVELS 
} from '@/lib/gamification/achievements';
// Try to import from Heroicons, fallback to simple icons
let TrophyIcon, StarIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  TrophyIcon = heroicons.TrophyIcon;
  StarIcon = heroicons.StarIcon;
} catch {
  const simpleIcons = require('@/components/icons/SimpleIcons');
  TrophyIcon = simpleIcons.TrophyIcon;
  StarIcon = simpleIcons.StarIcon;
}

interface UserLevelCardProps {
  userStats: UserStats;
  totalPoints: number;
  className?: string;
}

export default function UserLevelCard({ userStats, totalPoints, className = '' }: UserLevelCardProps) {
  const currentLevel = calculateUserLevel(totalPoints);
  const nextLevel = getNextLevel(currentLevel.level);
  const progress = calculateProgress(totalPoints, currentLevel);
  const pointsToNext = nextLevel ? nextLevel.minPoints - totalPoints : 0;

  return (
    <div className={`bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{currentLevel.badge}</div>
          <div>
            <h3 className="text-xl font-bold text-white">Level {currentLevel.level}</h3>
            <p className={`text-sm font-medium ${currentLevel.color}`}>
              {currentLevel.title}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{totalPoints}</div>
          <div className="text-sm text-gray-400">Total Points</div>
        </div>
      </div>

      {/* Progress Bar */}
      {nextLevel && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress to {nextLevel.title}</span>
            <span>{pointsToNext} points to go</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{currentLevel.minPoints}</span>
            <span>{nextLevel.minPoints}</span>
          </div>
        </div>
      )}

      {/* Current Level Benefits */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
          <StarIcon className="w-4 h-4 mr-1" />
          Current Benefits
        </h4>
        <div className="space-y-1">
          {currentLevel.benefits.map((benefit, index) => (
            <div key={index} className="text-sm text-gray-400 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
              {benefit}
            </div>
          ))}
        </div>
      </div>

      {/* Next Level Preview */}
      {nextLevel && (
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
            <TrophyIcon className="w-4 h-4 mr-1" />
            Next Level: {nextLevel.title}
          </h4>
          <div className="space-y-1">
            {nextLevel.benefits.slice(0, 2).map((benefit, index) => (
              <div key={index} className="text-sm text-gray-500 flex items-center">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2" />
                {benefit}
              </div>
            ))}
            {nextLevel.benefits.length > 2 && (
              <div className="text-xs text-gray-600">
                +{nextLevel.benefits.length - 2} more benefits
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">{userStats.portfolioItems}</div>
            <div className="text-xs text-gray-400">Projects</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{userStats.totalViews.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Views</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{userStats.totalLikes}</div>
            <div className="text-xs text-gray-400">Likes</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{userStats.averageRating.toFixed(1)}</div>
            <div className="text-xs text-gray-400">Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}
