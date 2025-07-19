'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Eye,
  UserPlus,
  ShoppingCart,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { LoadingSpinner } from '@/components/Loading';
import { AdminStatsService } from '@/lib/admin-stats';

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [chartData, setChartData] = useState<{
    userGrowth: ChartData[];
    revenue: ChartData[];
    activity: ChartData[];
  }>({
    userGrowth: [],
    revenue: [],
    activity: []
  });

  // Проверка доступа админа
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/en/admin/login');
      return;
    }
  }, [user, authLoading, router]);

  // Загрузка статистики
  const loadStats = async () => {
    try {
      setRefreshing(true);
      
      // Получаем реальные данные из Appwrite
      const adminStats = new AdminStatsService();
      const data = await adminStats.getDashboardStats();

      // Формируем карточки статистики
      const statsCards: StatCard[] = [
        {
          title: 'Total Users',
          value: data.totalUsers,
          change: `+${data.newUsersToday} today`,
          changeType: 'positive',
          icon: <Users className="w-6 h-6" />,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: 'Revenue',
          value: `$${data.totalRevenue.toLocaleString()}`,
          change: `+${data.revenueGrowth}% this month`,
          changeType: data.revenueGrowth > 0 ? 'positive' : 'negative',
          icon: <DollarSign className="w-6 h-6" />,
          color: 'from-green-500 to-emerald-500'
        },
        {
          title: 'Active Sessions',
          value: data.activeSessions,
          change: `${data.sessionChange}% vs yesterday`,
          changeType: data.sessionChange > 0 ? 'positive' : 'negative',
          icon: <Activity className="w-6 h-6" />,
          color: 'from-purple-500 to-pink-500'
        },
        {
          title: 'Conversion Rate',
          value: `${data.conversionRate}%`,
          change: `+${data.conversionGrowth}% this week`,
          changeType: data.conversionGrowth > 0 ? 'positive' : 'negative',
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'from-orange-500 to-red-500'
        }
      ];

      setStats(statsCards);
      setChartData({
        userGrowth: data.userGrowthChart,
        revenue: data.revenueChart,
        activity: data.activityChart
      });

    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">H-AI Platform Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadStats}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => router.push('/en')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <div className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-400' : 
                  stat.changeType === 'negative' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {stat.change}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">User Growth</h3>
              <UserPlus className="w-5 h-5 text-blue-400" />
            </div>
            
            <div className="space-y-4">
              {chartData.userGrowth.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{item.name}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.value / Math.max(...chartData.userGrowth.map(d => d.value))) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium w-12 text-right">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Revenue Breakdown</h3>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            
            <div className="space-y-4">
              {chartData.revenue.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{item.name}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.value / Math.max(...chartData.revenue.map(d => d.value))) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium w-16 text-right">${item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          
          <div className="space-y-4">
            {chartData.activity.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700/50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">{item.name}</p>
                  <p className="text-gray-400 text-xs">Activity count: {item.value}</p>
                </div>
                <span className="text-gray-400 text-xs">Just now</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
