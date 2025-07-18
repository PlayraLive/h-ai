'use client';

import React, { useEffect, useState } from 'react';
import { PortfolioItem } from '@/lib/appwrite/portfolio';
import { checkNewAchievements, UserStats } from '@/lib/gamification/achievements';

// Try to import from Heroicons, fallback to simple icons
let XMarkIcon, TrophyIcon, StarIcon, EyeIcon, HeartIcon, ShareIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  XMarkIcon = heroicons.XMarkIcon;
  TrophyIcon = heroicons.TrophyIcon;
  StarIcon = heroicons.StarIcon;
  EyeIcon = heroicons.EyeIcon;
  HeartIcon = heroicons.HeartIcon;
  ShareIcon = heroicons.ShareIcon;
} catch {
  const simpleIcons = require('@/components/icons/SimpleIcons');
  XMarkIcon = simpleIcons.XMarkIcon;
  TrophyIcon = simpleIcons.TrophyIcon;
  StarIcon = simpleIcons.StarIcon;
  EyeIcon = simpleIcons.EyeIcon;
  HeartIcon = simpleIcons.HeartIcon;
  ShareIcon = simpleIcons.ShareIcon;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioItem: PortfolioItem;
  userStats?: UserStats;
  onShare?: (platform: string) => void;
  onViewPortfolio?: () => void;
}

export default function SuccessModal({
  isOpen,
  onClose,
  portfolioItem,
  userStats,
  onShare,
  onViewPortfolio
}: SuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      
      // Check for new achievements
      if (userStats) {
        const achievements = checkNewAchievements(userStats, []);
        setNewAchievements(achievements.slice(0, 3)); // Show max 3 achievements
      }

      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isOpen, userStats]);

  if (!isOpen) return null;

  const shareText = `🎨 Just added "${portfolioItem.title}" to my AI-powered portfolio! Check it out:`;
  const shareUrl = `${window.location.origin}/en/portfolio/${portfolioItem.$id}`;

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=AI,Portfolio,Creative`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        return;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
    
    onShare?.(platform);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
            <p className="text-lg opacity-90">
              Your portfolio item has been created successfully
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Portfolio Item Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="flex items-start space-x-4">
              <img
                src={portfolioItem.thumbnailUrl}
                alt={portfolioItem.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {portfolioItem.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                  {portfolioItem.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {portfolioItem.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {portfolioItem.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                      +{portfolioItem.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New Achievements */}
          {newAchievements.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2 mb-3">
                <TrophyIcon className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  New Achievements Unlocked!
                </h4>
              </div>
              <div className="space-y-2">
                {newAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <div className="font-medium text-yellow-800 dark:text-yellow-200">
                        {achievement.title}
                      </div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-300">
                        +{achievement.points} points
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <EyeIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Views</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <HeartIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Likes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <StarIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
            </div>
          </div>

          {/* Share Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-3">
              <ShareIcon className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                Share Your Creation
              </h4>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-300 mb-4">
              Let the world see your amazing AI-powered work!
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <span className="text-sm font-medium">Twitter</span>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <span className="text-sm font-medium">LinkedIn</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="text-sm font-medium">Facebook</span>
              </button>
              <button
                onClick={() => handleShare('telegram')}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <span className="text-sm font-medium">Telegram</span>
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center justify-center space-x-2 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm font-medium">Copy Link</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onViewPortfolio}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              View My Portfolio
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
