'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';

interface BookmarkButtonProps {
  jobId: string;
  jobTitle: string;
  jobBudget: string;
  jobCategory: string;
  clientName: string;
  clientAvatar?: string;
}

export default function BookmarkButton({
  jobId,
  jobTitle,
  jobBudget,
  jobCategory,
  clientName,
  clientAvatar
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const { success, error } = useToast();

  useEffect(() => {
    if (user) {
      checkBookmarkStatus();
    }
  }, [user, jobId]);

  const checkBookmarkStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/bookmarks?userId=${user.$id}&jobId=${jobId}`);
      const data = await response.json();
      
      if (response.ok) {
        setIsBookmarked(data.isBookmarked);
      }
    } catch (err) {
      console.error('Error checking bookmark status:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      error('Please log in to bookmark jobs');
      return;
    }

    setLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks?userId=${user.$id}&jobId=${jobId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsBookmarked(false);
          success('Job removed from bookmarks');
        } else {
          error('Failed to remove bookmark');
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.$id,
            jobId,
            jobTitle,
            jobBudget,
            jobCategory,
            clientName,
            clientAvatar,
          }),
        });

        if (response.ok) {
          setIsBookmarked(true);
          success('Job added to bookmarks');
        } else {
          const data = await response.json();
          error(data.error || 'Failed to add bookmark');
        }
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      error('Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <button
      onClick={handleBookmark}
      disabled={loading}
      className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white/70 hover:text-yellow-400 transition-all hover:bg-black/50 disabled:opacity-50"
      title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-5 h-5 text-yellow-400" />
      ) : (
        <Bookmark className="w-5 h-5" />
      )}
    </button>
  );
}
