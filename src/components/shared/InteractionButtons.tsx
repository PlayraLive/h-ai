"use client";

import { useState, useEffect } from 'react';
import { Heart, Bookmark, Eye, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGamification } from '@/hooks/useGamification';

interface InteractionButtonsProps {
  targetId: string;
  targetType: 'job' | 'solution' | 'portfolio' | 'profile' | 'ai_specialist';
  showLike?: boolean;
  showFavorite?: boolean;
  showViews?: boolean;
  showShare?: boolean;
  className?: string;
  onShare?: () => void;
}

const InteractionButtons = ({
  targetId,
  targetType,
  showLike = true,
  showFavorite = true,
  showViews = false,
  showShare = false,
  className,
  onShare
}: InteractionButtonsProps) => {
  const {
    toggleLike,
    addToFavorites,
    removeFromFavorites,
    checkFavorite,
    checkUserLike,
    getLikesCount,
    loading
  } = useGamification();

  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  useEffect(() => {
    loadInteractionState();
  }, [targetId, targetType]);

  const loadInteractionState = async () => {
    try {
      // Load current state
      const [isLiked, isFavorited, likes] = await Promise.all([
        checkUserLike(targetId, targetType),
        checkFavorite(targetId, targetType),
        getLikesCount(targetId, targetType)
      ]);

      setLiked(isLiked);
      setFavorited(isFavorited);
      setLikesCount(likes);
    } catch (error) {
      console.error('Error loading interaction state:', error);
    }
  };

  const handleLike = async () => {
    try {
      const result = await toggleLike(targetId, targetType);
      if (result.success) {
        setLiked(result.action === 'added');
        setLikesCount(prev => result.action === 'added' ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      if (favorited) {
        const result = await removeFromFavorites(targetId, targetType);
        if (result.success) {
          setFavorited(false);
        }
      } else {
        const result = await addToFavorites(targetId, targetType);
        if (result.success) {
          setFavorited(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share functionality
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: url
        });
      } else {
        navigator.clipboard.writeText(url);
        // You could add a toast notification here
      }
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {showLike && (
        <button
          onClick={handleLike}
          disabled={loading}
          className={cn(
            "flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200 group",
            liked
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-gray-800/50 text-gray-400 border border-gray-600/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
          )}
        >
          <Heart 
            className={cn(
              "w-4 h-4 transition-all duration-200",
              liked ? "fill-current" : "group-hover:scale-110"
            )} 
          />
          {likesCount > 0 && (
            <span className="text-xs font-medium">{likesCount}</span>
          )}
        </button>
      )}

      {showFavorite && (
        <button
          onClick={handleFavorite}
          disabled={loading}
          className={cn(
            "flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200 group",
            favorited
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : "bg-gray-800/50 text-gray-400 border border-gray-600/50 hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/30"
          )}
        >
          <Bookmark 
            className={cn(
              "w-4 h-4 transition-all duration-200",
              favorited ? "fill-current" : "group-hover:scale-110"
            )} 
          />
        </button>
      )}

      {showViews && (
        <div className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-800/50 text-gray-400 border border-gray-600/50">
          <Eye className="w-4 h-4" />
          <span className="text-xs font-medium">{viewsCount}</span>
        </div>
      )}

      {showShare && (
        <button
          onClick={handleShare}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-800/50 text-gray-400 border border-gray-600/50 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-200 group"
        >
          <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
        </button>
      )}
    </div>
  );
};

export default InteractionButtons; 