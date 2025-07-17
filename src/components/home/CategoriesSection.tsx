// Интерактивная секция категорий с фильтрами и поиском
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Palette,
  Code,
  Video,
  Gamepad2,
  ArrowRight,
  Search,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  Briefcase
} from 'lucide-react';

interface CategoriesSectionProps {
  locale: string;
}

interface Category {
  icon: any;
  title: string;
  description: string;
  color: string;
  jobs: number;
  avgPrice: number;
  rating: number;
  trending: boolean;
}

export function CategoriesSection({ locale }: CategoriesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'jobs' | 'price' | 'rating'>('jobs');

  const categories: Category[] = [
    {
      icon: Palette,
      title: 'AI Design',
      description: 'AI-powered design services, logos, graphics, and creative content',
      color: 'from-pink-500 to-rose-500',
      jobs: 234,
      avgPrice: 150,
      rating: 4.8,
      trending: true
    },
    {
      icon: Code,
      title: 'AI Development',
      description: 'AI development, automation, chatbots, and machine learning',
      color: 'from-blue-500 to-cyan-500',
      jobs: 189,
      avgPrice: 300,
      rating: 4.9,
      trending: true
    },
    {
      icon: Video,
      title: 'AI Video',
      description: 'AI video editing, animation, and content creation',
      color: 'from-purple-500 to-indigo-500',
      jobs: 156,
      avgPrice: 200,
      rating: 4.7,
      trending: false
    },
    {
      icon: Gamepad2,
      title: 'AI Games',
      description: 'AI game development, NPCs, and interactive experiences',
      color: 'from-green-500 to-emerald-500',
      jobs: 98,
      avgPrice: 250,
      rating: 4.6,
      trending: false
    }
  ];

  // Фильтрация и сортировка
  const filteredCategories = categories
    .filter(category => 
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'jobs':
          return b.jobs - a.jobs;
        case 'price':
          return a.avgPrice - b.avgPrice;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const handleCategoryClick = (categoryTitle: string) => {
    const categorySlug = categoryTitle.toLowerCase().replace(' ', '_');
    window.location.href = `/${locale}/jobs?category=${categorySlug}`;
  };

  const handleViewAllJobs = () => {
    window.location.href = `/${locale}/jobs`;
  };

  const handlePostJob = () => {
    window.location.href = `/${locale}/jobs/create`;
  };

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Explore AI Services
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Discover talented AI specialists across various categories and find the perfect match for your project
          </p>

          {/* Search and filters */}
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400"
              />
            </div>

            {/* Sort options */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-500 self-center mr-2">Sort by:</span>
              {[
                { key: 'jobs', label: 'Most Jobs' },
                { key: 'price', label: 'Lowest Price' },
                { key: 'rating', label: 'Highest Rated' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    sortBy === key
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {filteredCategories.map((category, index) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.title;
            
            return (
              <div
                key={index}
                className={`group relative bg-gray-800 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 ${
                  isSelected ? 'border-purple-500 scale-105' : 'border-transparent hover:scale-105'
                }`}
                onClick={() => handleCategoryClick(category.title)}
                onMouseEnter={() => setSelectedCategory(category.title)}
                onMouseLeave={() => setSelectedCategory(null)}
              >
                {/* Trending badge */}
                {category.trending && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </div>
                )}

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Briefcase className="w-4 h-4" />
                        <span>{category.jobs} jobs</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-400">
                        <DollarSign className="w-4 h-4" />
                        <span>from ${category.avgPrice}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{category.rating}/5</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search terms</p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-12 text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to start your AI project?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied clients and find your perfect AI freelancer today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handlePostJob}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Post a Job
            </button>
            <button
              onClick={handleViewAllJobs}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all"
            >
              Browse All Jobs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
