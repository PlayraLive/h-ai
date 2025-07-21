'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TopNav from '@/components/TopNav';
import ReelsGrid from '@/components/ReelsGrid';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Sparkles,
  Video,
  Globe,
  Bot,
  Palette,
  TrendingUp,
  Crown,
  Zap
} from 'lucide-react';
import Link from 'next/link';

const categories = [
  { id: 'all', name: 'All Solutions', icon: Grid3X3, color: 'text-purple-400' },
  { id: 'video', name: 'Video', icon: Video, color: 'text-red-400' },
  { id: 'website', name: 'Websites', icon: Globe, color: 'text-blue-400' },
  { id: 'bot', name: 'Bots', icon: Bot, color: 'text-green-400' },
  { id: 'design', name: 'Design', icon: Palette, color: 'text-pink-400' }
];

const sortOptions = [
  { id: 'trending', name: 'Trending', icon: TrendingUp },
  { id: 'newest', name: 'Newest', icon: Sparkles },
  { id: 'premium', name: 'Premium', icon: Crown }
];

export default function SolutionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <TopNav />
      
      <div className="w-full pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    AI Solutions
                  </h1>
                  <p className="text-gray-400 mt-1">
                    Ready-made solutions for your business
                  </p>
                </div>
              </div>

              {/* AI Service Button */}
              <Link
                href="/en/ai-service"
                className="group inline-flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white rounded-xl transition-all duration-300 font-bold shadow-lg hover:shadow-orange-500/25 hover:scale-105"
              >
                <Bot className="w-5 h-5" />
                <span>AI Service</span>
                <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Categories */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${selectedCategory === category.id ? 'text-white' : category.color}`} />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sort and View Options */}
              <div className="flex items-center space-x-3">
                {/* Sort Dropdown */}
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-800/50 border border-gray-700/50 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'list'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Filters Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-300"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filters</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Дополнительные фильтры</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ценовой диапазон
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="От"
                        className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                      />
                      <span className="text-gray-400">—</span>
                      <input
                        type="number"
                        placeholder="До"
                        className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Сложность
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50">
                      <option value="">Любая</option>
                      <option value="easy">Легкая</option>
                      <option value="medium">Средняя</option>
                      <option value="hard">Сложная</option>
                    </select>
                  </div>

                  {/* Delivery Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Время выполнения
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50">
                      <option value="">Любое</option>
                      <option value="instant">Мгновенно</option>
                      <option value="1day">1 день</option>
                      <option value="3days">3 дня</option>
                      <option value="1week">1 неделя</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                Найдено <span className="text-white font-semibold">247</span> решений
              </p>
              <div className="text-sm text-gray-400">
                Показано 1-20 из 247
              </div>
            </div>
          </div>

          {/* Reels Grid */}
          <ReelsGrid limit={20} showTitle={false} />

          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
              Загрузить еще
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
