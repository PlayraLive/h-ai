"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import PortfolioItem from '@/components/portfolio/PortfolioItem';
import {
  Award,
  Star,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioItem {
  $id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: number;
  rating: number;
  clientComment: string;
  completedAt: string;
  status: string;
  jobId?: string;
}

export default function UserPortfolioPage() {
  const params = useParams();
  const { user } = useAuthContext();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  const userId = params.userId as string;

  useEffect(() => {
    loadPortfolio();
  }, [userId]);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/portfolio/${userId}`);
      const data = await response.json();

      if (data.success) {
        setPortfolio(data.portfolio);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.portfolio.map((item: PortfolioItem) => item.category))] as string[];
        setCategories(uniqueCategories);
      } else {
        console.error('Failed to load portfolio:', data.error);
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPortfolio = portfolio.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalEarnings = portfolio.reduce((sum, item) => sum + item.budget, 0);
  const averageRating = portfolio.length > 0 
    ? portfolio.reduce((sum, item) => sum + item.rating, 0) / portfolio.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
              <p className="text-gray-300">Загрузка портфолио...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Award className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Портфолио</h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Завершенные проекты и отзывы клиентов
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Завершенных проектов</p>
                <p className="text-2xl font-bold text-white">{portfolio.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Средний рейтинг</p>
                <p className="text-2xl font-bold text-white">{averageRating.toFixed(1)}/5</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Общий заработок</p>
                <p className="text-2xl font-bold text-white">
                  ${totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по проектам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all">Все категории</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Portfolio Grid */}
        {filteredPortfolio.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolio.map((item) => (
              <PortfolioItem key={item.$id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {searchQuery || selectedCategory !== 'all' ? 'Проекты не найдены' : 'Портфолио пусто'}
            </h3>
            <p className="text-gray-400">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Попробуйте изменить параметры поиска'
                : 'Завершенные проекты появятся здесь'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
