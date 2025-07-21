'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TopNav from '@/components/TopNav';
import { 
  Package, 
  Star, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  Zap,
  User,
  Bot,
  Crown,
  Filter,
  Search,
  Grid3X3,
  List
} from 'lucide-react';
import { ReelsService, SolutionPackage } from '@/lib/appwrite/reels';
import Link from 'next/link';

const categories = [
  { id: 'all', name: 'Все пакеты', color: 'text-purple-400' },
  { id: 'website', name: 'Сайты', color: 'text-blue-400' },
  { id: 'video', name: 'Видео', color: 'text-red-400' },
  { id: 'bot', name: 'Боты', color: 'text-green-400' },
  { id: 'design', name: 'Дизайн', color: 'text-pink-400' }
];

export default function PackagesPage() {
  const [packages, setPackages] = useState<SolutionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadPackages();
  }, [selectedCategory]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const packagesData = selectedCategory === 'all' 
        ? await ReelsService.getSolutionPackages()
        : await ReelsService.getSolutionPackages(selectedCategory);
      setPackages(packagesData);
    } catch (error) {
      console.error('Error loading packages:', error);
      // Fallback to mock data
      setPackages(getMockPackages());
    } finally {
      setLoading(false);
    }
  };

  const getMockPackages = (): SolutionPackage[] => [
    {
      $id: '1',
      name: 'Starter Website Package',
      description: 'Полный пакет для создания профессионального сайта с AI',
      category: 'website',
      features: ['Адаптивный дизайн', 'SEO оптимизация', 'CMS интеграция', 'Хостинг на 1 год'],
      reelId: 'reel1',
      freelancerPrice: 299,
      aiServicePrice: 99,
      estimatedTime: '1-3 дня',
      difficulty: 'easy',
      isPopular: true,
      createdBy: 'H-AI Team'
    },
    {
      $id: '2',
      name: 'TikTok Content Creator',
      description: 'Автоматическое создание вирусного контента для TikTok',
      category: 'video',
      features: ['10 видео в месяц', 'Автоматические субтитры', 'Тренды анализ', 'Планировщик постов'],
      aiServicePrice: 49,
      estimatedTime: 'Мгновенно',
      difficulty: 'easy',
      isPopular: false,
      createdBy: 'H-AI Team'
    },
    {
      $id: '3',
      name: 'Telegram Bot Assistant',
      description: 'Умный бот для автоматизации бизнес-процессов',
      category: 'bot',
      features: ['Обработка заказов', 'Поддержка клиентов', 'Интеграция с CRM', 'Аналитика'],
      freelancerPrice: 199,
      aiServicePrice: 79,
      estimatedTime: '2-5 дней',
      difficulty: 'medium',
      isPopular: true,
      createdBy: 'H-AI Team'
    }
  ];

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <TopNav />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Загрузка пакетов...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <TopNav />
      
      <div className="w-full pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl">
                <Package className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Готовые пакеты
                </h1>
                <p className="text-gray-400 mt-1">
                  Комплексные решения для вашего бизнеса
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск пакетов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Categories */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>

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
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-gray-400">
              Найдено <span className="text-white font-semibold">{filteredPackages.length}</span> пакетов
            </p>
          </div>

          {/* Packages Grid */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.$id}
                className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                      {pkg.isPopular && (
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>TOP</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm capitalize">{pkg.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">${pkg.aiServicePrice}</div>
                    {pkg.freelancerPrice && (
                      <div className="text-sm text-gray-400 line-through">${pkg.freelancerPrice}</div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {pkg.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">Что включено:</h4>
                  <div className="space-y-2">
                    {pkg.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                    {pkg.features.length > 4 && (
                      <div className="text-purple-400 text-sm">
                        +{pkg.features.length - 4} дополнительных функций
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{pkg.estimatedTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      pkg.difficulty === 'easy' ? 'bg-green-600/20 text-green-400' :
                      pkg.difficulty === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                      {pkg.difficulty === 'easy' ? 'Легко' : 
                       pkg.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-medium">
                      <Bot className="w-4 h-4" />
                      <span>AI-сервис</span>
                    </button>
                    {pkg.freelancerPrice && (
                      <button className="flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium">
                        <User className="w-4 h-4" />
                        <span>Фрилансер</span>
                      </button>
                    )}
                  </div>
                  
                  <Link
                    href={`/en/packages/${pkg.$id}`}
                    className="block w-full py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-colors text-center font-medium border border-gray-600/50"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {filteredPackages.length > 0 && (
            <div className="mt-12 text-center">
              <button className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                Загрузить еще
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
