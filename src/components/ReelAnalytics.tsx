'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  DollarSign, 
  Users, 
  Clock, 
  Star,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Bot,
  User
} from 'lucide-react';

interface ReelAnalyticsProps {
  reelId: string;
  views: number;
  likes: number;
  rating: number;
  category: string;
}

export default function ReelAnalytics({ reelId, views, likes, rating, category }: ReelAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  // Вычисляем статистики на основе просмотров
  const totalOrders = Math.floor(views * 0.15);
  const aiOrders = Math.floor(totalOrders * 0.65);
  const freelancerOrders = Math.floor(totalOrders * 0.35);
  const totalRevenue = Math.floor(views * 0.02);
  const avgOrderValue = totalOrders > 0 ? Math.floor(totalRevenue / totalOrders) : 0;
  const conversionRate = ((totalOrders / views) * 100).toFixed(2);
  const projectsCreated = Math.floor(views * 0.02);

  // Тренды (симуляция)
  const viewsTrend = Math.random() > 0.5 ? 'up' : 'down';
  const ordersTrend = Math.random() > 0.5 ? 'up' : 'down';
  const revenueTrend = Math.random() > 0.5 ? 'up' : 'down';

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-400' : 'text-red-400';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">📈 Аналитика решения</h3>
        <div className="flex items-center bg-gray-800/50 border border-gray-700/50 rounded-xl p-1">
          {['24h', '7d', '30d', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range === 'all' ? 'Все время' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <div className="flex items-center space-x-1">
              <>
                {React.createElement(getTrendIcon(viewsTrend), { className: `w-4 h-4 ${getTrendColor(viewsTrend)}` })}
                <span className={`text-xs ${getTrendColor(viewsTrend)}`}>
                  {Math.floor(Math.random() * 20 + 5)}%
                </span>
              </>
            </div>
          </div>
          <div className="text-xl font-bold text-white">{formatNumber(views)}</div>
          <div className="text-xs text-gray-400">Views</div>
        </div>

        <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <div className="flex items-center space-x-1">
              <>
                {React.createElement(getTrendIcon(ordersTrend), { className: `w-4 h-4 ${getTrendColor(ordersTrend)}` })}
                <span className={`text-xs ${getTrendColor(ordersTrend)}`}>
                  {Math.floor(Math.random() * 15 + 3)}%
                </span>
              </>
            </div>
          </div>
          <div className="text-xl font-bold text-white">{totalOrders}</div>
          <div className="text-xs text-gray-400">Orders</div>
        </div>

        <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <div className="flex items-center space-x-1">
              <>
                {React.createElement(getTrendIcon(revenueTrend), { className: `w-4 h-4 ${getTrendColor(revenueTrend)}` })}
                <span className={`text-xs ${getTrendColor(revenueTrend)}`}>
                  {Math.floor(Math.random() * 25 + 8)}%
                </span>
              </>
            </div>
          </div>
          <div className="text-xl font-bold text-white">${formatNumber(totalRevenue)}</div>
          <div className="text-xs text-gray-400">Revenue</div>
        </div>

        <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <div className="flex items-center space-x-1">
              <span className="text-xs text-green-400">+{Math.floor(Math.random() * 10 + 2)}%</span>
            </div>
          </div>
          <div className="text-xl font-bold text-white">{conversionRate}%</div>
          <div className="text-xs text-gray-400">Конверсия</div>
        </div>
      </div>

      {/* Service Distribution */}
      <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <PieChart className="w-5 h-5 text-purple-400" />
          <h4 className="text-white font-semibold">Распределение заказов</h4>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">AI-сервис</span>
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">{aiOrders}</div>
              <div className="text-xs text-gray-400">65%</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Фрилансеры</span>
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">{freelancerOrders}</div>
              <div className="text-xs text-gray-400">35%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 border border-green-600/20 rounded-xl p-4 text-center">
          <Star className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">98%</div>
          <div className="text-xs text-gray-400">Успешность выполнения</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-yellow-600/20 rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">&lt; 5 мин</div>
          <div className="text-xs text-gray-400">Среднее время</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-600/20 rounded-xl p-4 text-center">
          <DollarSign className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">${avgOrderValue}</div>
          <div className="text-xs text-gray-400">Средний чек</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h4 className="text-white font-semibold">Дополнительная статистика</h4>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{projectsCreated}</div>
            <div className="text-xs text-gray-400">В проектах</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{Math.floor(likes / views * 100)}%</div>
            <div className="text-xs text-gray-400">Лайков</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{Math.floor(views * 0.3)}</div>
            <div className="text-xs text-gray-400">Сохранений</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{Math.floor(views * 0.1)}</div>
            <div className="text-xs text-gray-400">Репостов</div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-pink-600/10 border border-purple-600/20 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4">Производительность в категории "{category}"</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">TOP 15%</div>
            <div className="text-xs text-gray-400">Рейтинг в категории</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">+{Math.floor(Math.random() * 50 + 20)}%</div>
            <div className="text-xs text-gray-400">Выше среднего</div>
          </div>
        </div>
      </div>
    </div>
  );
}
