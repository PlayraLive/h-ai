'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PortfolioItem } from '@/lib/appwrite/portfolio';
import ShareButton from '@/components/shared/ShareButton';

// Add line-clamp utility classes
const lineClampStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
// Try to import from Heroicons, fallback to simple icons
let HeartIcon, EyeIcon, ChatBubbleLeftIcon, ShareIcon, StarIcon, PlayIcon, CodeBracketIcon, GlobeAltIcon, HeartSolidIcon;

try {
  const heroiconsOutline = require('@heroicons/react/24/outline');
  const heroiconsSolid = require('@heroicons/react/24/solid');
  HeartIcon = heroiconsOutline.HeartIcon;
  EyeIcon = heroiconsOutline.EyeIcon;
  ChatBubbleLeftIcon = heroiconsOutline.ChatBubbleLeftIcon;
  ShareIcon = heroiconsOutline.ShareIcon;
  StarIcon = heroiconsOutline.StarIcon;
  PlayIcon = heroiconsOutline.PlayIcon;
  CodeBracketIcon = heroiconsOutline.CodeBracketIcon;
  GlobeAltIcon = heroiconsOutline.GlobeAltIcon;
  HeartSolidIcon = heroiconsSolid.HeartIcon;
} catch {
  const simpleIcons = require('@/components/icons/SimpleIcons');
  HeartIcon = simpleIcons.HeartIcon;
  EyeIcon = simpleIcons.EyeIcon;
  ChatBubbleLeftIcon = simpleIcons.ChatBubbleLeftIcon;
  ShareIcon = simpleIcons.ShareIcon;
  StarIcon = simpleIcons.StarIcon;
  PlayIcon = simpleIcons.PlayIcon;
  CodeBracketIcon = simpleIcons.CodeBracketIcon;
  GlobeAltIcon = simpleIcons.GlobeAltIcon;
  HeartSolidIcon = simpleIcons.HeartSolidIcon;
}

interface PortfolioCardProps {
  item: PortfolioItem;
  onLike?: (itemId: string) => void;
  onView?: (itemId: string) => void;
  showUser?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function PortfolioCard({ 
  item, 
  onLike, 
  onView, 
  showUser = true,
  size = 'medium' 
}: PortfolioCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(item.$id!);
  };

  const handleView = () => {
    onView?.(item.$id!);
  };

  const sizeClasses = {
    small: 'w-full max-w-sm',
    medium: 'w-full max-w-md',
    large: 'w-full max-w-lg'
  };

  const imageHeightClasses = {
    small: 'h-48',
    medium: 'h-64',
    large: 'h-80'
  };

  return (
    <div className={`${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}>
      {/* Image Container */}
      <div className={`relative ${imageHeightClasses[size]} overflow-hidden bg-gray-100 dark:bg-gray-700`}>
        <Link href={`/en/portfolio/${item.$id}`} onClick={handleView}>
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsImageLoaded(true)}
          />
          
          {/* Loading skeleton */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 animate-pulse" />
          )}

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
              {item.videoUrl && (
                <button className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all">
                  <PlayIcon className="w-5 h-5 text-gray-800" />
                </button>
              )}
              {item.liveUrl && (
                <a 
                  href={item.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GlobeAltIcon className="w-5 h-5 text-gray-800" />
                </a>
              )}
              {item.githubUrl && (
                <a 
                  href={item.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CodeBracketIcon className="w-5 h-5 text-gray-800" />
                </a>
              )}
            </div>
          </div>

          {/* Featured badge */}
          {item.featured && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full">
                ⭐ Featured
              </span>
            </div>
          )}

          {/* NFT badge */}
          {item.nftMetadata?.tokenId && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                🎨 NFT
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* User info */}
        {showUser && (
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {item.userAvatar ? (
                <Image
                  src={item.userAvatar}
                  alt={item.userName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {item.userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Title and description */}
        <Link href={`/en/portfolio/${item.$id}`} onClick={handleView}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {item.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
            {item.description}
          </p>
        </Link>

        {/* AI Services */}
        {item.aiServices && item.aiServices.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {item.aiServices.slice(0, 3).map((service, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                >
                  🤖 {service}
                </span>
              ))}
              {item.aiServices.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                  +{item.aiServices.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {item.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
            {item.skills.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                +{item.skills.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Stats and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <EyeIcon className="w-4 h-4" />
              <span>{item.viewsCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>{item.commentsCount || 0}</span>
            </div>
            {item.averageRating > 0 && (
              <div className="flex items-center space-x-1">
                <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                <span>{item.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-all ${
                isLiked 
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              {isLiked ? (
                <HeartSolidIcon className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {item.likesCount || 0}
            </span>
            
            <ShareButton
              data={{
                url: `${window.location.origin}/en/portfolio/${item.$id}`,
                title: item.title,
                description: item.description,
                image: item.thumbnailUrl,
                hashtags: ['AI', 'Portfolio', 'Creative', ...item.skills.slice(0, 3)]
              }}
              platforms={['twitter', 'linkedin']}
              size="small"
              showLabels={false}
              showCopyLink={true}
              onShare={(platform) => {
                console.log(`Shared ${item.title} on ${platform}`);
                // TODO: Track share analytics
              }}
              className="relative"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
