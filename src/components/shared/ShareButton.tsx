'use client';

import React, { useState } from 'react';

// Try to import from Heroicons, fallback to simple icons
let ShareIcon, CheckIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  ShareIcon = heroicons.ShareIcon;
  CheckIcon = heroicons.CheckIcon;
} catch {
  const simpleIcons = require('@/components/icons/SimpleIcons');
  ShareIcon = simpleIcons.ShareIcon;
  CheckIcon = simpleIcons.CheckIcon;
}

export interface ShareData {
  url: string;
  title: string;
  description?: string;
  image?: string;
  hashtags?: string[];
}

export interface SharePlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  hoverColor: string;
  getShareUrl: (data: ShareData) => string;
}

// Predefined social platforms
export const SHARE_PLATFORMS: SharePlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    getShareUrl: (data) => {
      const text = `${data.title}\n\n${data.description || ''}`;
      const hashtags = data.hashtags?.join(',') || 'AI,Portfolio,Creative';
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.url)}&hashtags=${hashtags}`;
    }
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700',
    hoverColor: 'hover:bg-blue-800',
    getShareUrl: (data) => {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`;
    }
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    getShareUrl: (data) => {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`;
    }
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    getShareUrl: (data) => {
      const text = `${data.title}\n\n${data.description || ''}`;
      return `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(text)}`;
    }
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    getShareUrl: (data) => {
      const text = `${data.title}\n\n${data.description || ''}\n\n${data.url}`;
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    }
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: '🤖',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    getShareUrl: (data) => {
      return `https://reddit.com/submit?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}`;
    }
  }
];

interface ShareButtonProps {
  data: ShareData;
  platforms?: string[]; // Platform IDs to show, defaults to all
  size?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'vertical' | 'grid';
  showLabels?: boolean;
  showCopyLink?: boolean;
  onShare?: (platform: string, data: ShareData) => void;
  className?: string;
}

export default function ShareButton({
  data,
  platforms = ['twitter', 'linkedin', 'facebook', 'telegram'],
  size = 'medium',
  layout = 'horizontal',
  showLabels = true,
  showCopyLink = true,
  onShare,
  className = '',
  // Force dropdown popup regardless of platforms count
  dropdown = false
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    small: 'p-2 text-xs',
    medium: 'p-3 text-sm',
    large: 'p-4 text-base'
  };

  const iconSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-2',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-2 md:grid-cols-3 gap-2'
  };

  const selectedPlatforms = SHARE_PLATFORMS.filter(platform => 
    platforms.includes(platform.id)
  );

  const handleShare = (platform: SharePlatform) => {
    const shareUrl = platform.getShareUrl(data);
    window.open(shareUrl, '_blank', 'width=600,height=400');
    onShare?.(platform.id, data);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.('copy', data);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = data.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: data.url
        });
        onShare?.('native', data);
      } catch (error) {
        console.error('Native share failed:', error);
      }
    }
  };

  // Single share button that opens dropdown
  if (dropdown || (layout === 'horizontal' && selectedPlatforms.length > 3)) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 ${sizeClasses[size]} bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors`}
        >
          <ShareIcon className="w-4 h-4" />
          {showLabels && <span>Share</span>}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50 min-w-48">
            <div className="space-y-1">
              {selectedPlatforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => {
                    handleShare(platform);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className={iconSizes[size]}>{platform.icon}</span>
                  <span className="text-gray-900 dark:text-white">{platform.name}</span>
                </button>
              ))}
              
              {showCopyLink && (
                <button
                  onClick={() => {
                    handleCopyLink();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className={iconSizes[size]}>🔗</span>
                  <span className="text-gray-900 dark:text-white">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              )}

              {navigator.share && (
                <button
                  onClick={() => {
                    handleNativeShare();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className={iconSizes[size]}>📱</span>
                  <span className="text-gray-900 dark:text-white">More Options</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // Multiple buttons layout
  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {selectedPlatforms.map((platform) => (
        <button
          key={platform.id}
          onClick={() => handleShare(platform)}
          className={`flex items-center justify-center space-x-2 ${sizeClasses[size]} ${platform.color} ${platform.hoverColor} text-white rounded-lg transition-colors`}
          title={`Share on ${platform.name}`}
        >
          <span className={iconSizes[size]}>{platform.icon}</span>
          {showLabels && <span>{platform.name}</span>}
        </button>
      ))}

      {showCopyLink && (
        <button
          onClick={handleCopyLink}
          className={`flex items-center justify-center space-x-2 ${sizeClasses[size]} ${
            copied 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-gray-600 hover:bg-gray-700'
          } text-white rounded-lg transition-colors`}
          title="Copy link"
        >
          <span className={iconSizes[size]}>
            {copied ? '✅' : '🔗'}
          </span>
          {showLabels && (
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          )}
        </button>
      )}

      {navigator.share && (
        <button
          onClick={handleNativeShare}
          className={`flex items-center justify-center space-x-2 ${sizeClasses[size]} bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors`}
          title="Share via device"
        >
          <span className={iconSizes[size]}>📱</span>
          {showLabels && <span>Share</span>}
        </button>
      )}
    </div>
  );
}
