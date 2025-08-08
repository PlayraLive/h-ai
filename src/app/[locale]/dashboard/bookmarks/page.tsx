'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { Bookmark, BookmarkCheck, Eye, DollarSign, MapPin, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Bookmark {
  $id: string;
  job_id: string;
  job_title: string;
  job_budget: string;
  job_category: string;
  client_name: string;
  client_avatar?: string;
  created_at: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const { error } = useToast();

  useEffect(() => {
    if (user) {
      loadBookmarks();
    }
  }, [user]);

  const loadBookmarks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/bookmarks?userId=${user.$id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setBookmarks(data.bookmarks);
      } else {
        console.error('Failed to load bookmarks:', data.error);
        error('Failed to load bookmarks');
      }
    } catch (err) {
      console.error('Error loading bookmarks:', err);
      error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (jobId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/bookmarks?userId=${user.$id}&jobId=${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.job_id !== jobId));
      } else {
        error('Failed to remove bookmark');
      }
    } catch (err) {
      console.error('Error removing bookmark:', err);
      error('Failed to remove bookmark');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading bookmarks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookmarkCheck className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">My Bookmarks</h1>
          </div>
          <p className="text-gray-400">
            {bookmarks.length} {bookmarks.length === 1 ? 'job' : 'jobs'} saved
          </p>
        </div>

        {/* Bookmarks Grid */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No bookmarks yet</h3>
            <p className="text-gray-400 mb-6">
              Start browsing jobs and save the ones you're interested in
            </p>
            <Link
              href="/en/jobs"
              className="btn-primary"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.$id}
                className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
                      <img
                        src={bookmark.client_avatar || '/api/placeholder/40/40'}
                        alt={bookmark.client_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                        {bookmark.job_title}
                      </h3>
                      <p className="text-gray-400 text-sm">{bookmark.client_name}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeBookmark(bookmark.job_id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full transition-all"
                    title="Remove from bookmarks"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                  </button>
                </div>

                {/* Meta Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">{bookmark.job_budget}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Remote</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Saved {formatDate(bookmark.created_at)}</span>
                  </div>
                </div>

                {/* Category */}
                <div className="mb-4">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                    {bookmark.job_category}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <Link
                    href={`/en/jobs/${bookmark.job_id}`}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Job</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
