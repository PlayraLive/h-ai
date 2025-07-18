'use client';

import React, { useState, useEffect } from 'react';
import PortfolioCard from './PortfolioCard';
import PortfolioFilters from './PortfolioFilters';
import { PortfolioItem, PortfolioService } from '@/lib/appwrite/portfolio';
// Try to import from Heroicons, fallback to simple icons
let MagnifyingGlassIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  MagnifyingGlassIcon = heroicons.MagnifyingGlassIcon;
} catch {
  const simpleIcons = require('@/components/icons/SimpleIcons');
  MagnifyingGlassIcon = simpleIcons.MagnifyingGlassIcon;
}

interface PortfolioGridProps {
  userId?: string; // If provided, shows only user's portfolio
  showFilters?: boolean;
  showSearch?: boolean;
  title?: string;
  subtitle?: string;
  limit?: number;
}

export default function PortfolioGrid({ 
  userId, 
  showFilters = true, 
  showSearch = true,
  title = "Portfolio",
  subtitle = "Discover amazing AI-powered creations",
  limit = 20
}: PortfolioGridProps) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAIServices, setSelectedAIServices] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('latest');

  // Load portfolio items
  useEffect(() => {
    loadPortfolioItems();
  }, [userId, selectedCategory, selectedSkills, selectedAIServices, sortBy]);

  const loadPortfolioItems = async () => {
    try {
      setLoading(true);
      
      let items: PortfolioItem[];
      
      if (userId) {
        // Load user's portfolio
        items = await PortfolioService.getUserPortfolio(userId, limit);
      } else {
        // Load all portfolio items with filters
        items = await PortfolioService.searchPortfolio(
          searchQuery,
          selectedCategory,
          selectedSkills,
          selectedAIServices,
          limit
        );
      }

      // Sort items
      items = sortItems(items, sortBy);
      
      setPortfolioItems(items);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      setPortfolioItems([]);
    } finally {
      setLoading(false);
    }
  };

  const sortItems = (items: PortfolioItem[], sortBy: string): PortfolioItem[] => {
    switch (sortBy) {
      case 'popular':
        return [...items].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      case 'rating':
        return [...items].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      case 'latest':
      default:
        return [...items].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  const handleLike = async (itemId: string) => {
    try {
      // Optimistic update
      setPortfolioItems(prev => 
        prev.map(item => 
          item.$id === itemId 
            ? { ...item, likesCount: (item.likesCount || 0) + 1 }
            : item
        )
      );

      // TODO: Add user authentication check
      await PortfolioService.likePortfolioItem(itemId, 'current-user-id');
    } catch (error) {
      console.error('Error liking item:', error);
      // Revert optimistic update
      setPortfolioItems(prev => 
        prev.map(item => 
          item.$id === itemId 
            ? { ...item, likesCount: Math.max((item.likesCount || 0) - 1, 0) }
            : item
        )
      );
    }
  };

  const handleView = async (itemId: string) => {
    try {
      // Update view count optimistically
      setPortfolioItems(prev => 
        prev.map(item => 
          item.$id === itemId 
            ? { ...item, viewsCount: (item.viewsCount || 0) + 1 }
            : item
        )
      );

      // Track analytics
      await PortfolioService.trackAnalytics(itemId, 'current-user-id', 'view');
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Debounce search
    setTimeout(() => {
      loadPortfolioItems();
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search portfolio..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <PortfolioFilters
          selectedCategory={selectedCategory}
          selectedSkills={selectedSkills}
          selectedAIServices={selectedAIServices}
          sortBy={sortBy}
          onCategoryChange={setSelectedCategory}
          onSkillsChange={setSelectedSkills}
          onAIServicesChange={setSelectedAIServices}
          onSortChange={setSortBy}
        />
      )}

      {/* Stats */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-300">
          {loading ? 'Loading...' : `${portfolioItems.length} items found`}
        </p>
        
        {!userId && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                sortBy === 'latest'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                sortBy === 'popular'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                sortBy === 'rating'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Top Rated
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-gray-700" />
              <div className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                <div className="flex space-x-2">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Portfolio Grid */}
      {!loading && portfolioItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {portfolioItems.map((item) => (
            <PortfolioCard
              key={item.$id}
              item={item}
              onLike={handleLike}
              onView={handleView}
              showUser={!userId}
              size="medium"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && portfolioItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No portfolio items found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {userId 
              ? "Start building your portfolio by adding your first project!"
              : "Try adjusting your search criteria or browse all items."
            }
          </p>
          {userId && (
            <button className="btn-primary">
              Add Your First Project
            </button>
          )}
        </div>
      )}
    </div>
  );
}
