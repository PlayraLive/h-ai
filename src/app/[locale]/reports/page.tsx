'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TopNav from '@/components/TopNav';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  Download,
  Filter,
  Eye,
  FileText,
  PieChart,
  Activity,
  Target,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportData {
  period: string;
  earnings: number;
  projects: number;
  clients: number;
  hours: number;
  rating: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportData, setReportData] = useState<ReportData[]>([]);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setReportData([
        { period: 'Jan 2024', earnings: 12500, projects: 8, clients: 6, hours: 160, rating: 4.8 },
        { period: 'Feb 2024', earnings: 15200, projects: 10, clients: 8, hours: 180, rating: 4.9 },
        { period: 'Mar 2024', earnings: 18900, projects: 12, clients: 9, hours: 200, rating: 4.7 },
        { period: 'Apr 2024', earnings: 22100, projects: 14, clients: 11, hours: 220, rating: 4.8 },
        { period: 'May 2024', earnings: 19800, projects: 11, clients: 8, hours: 190, rating: 4.9 },
        { period: 'Jun 2024', earnings: 25600, projects: 16, clients: 12, hours: 240, rating: 4.8 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const currentMonth = reportData[reportData.length - 1];
  const previousMonth = reportData[reportData.length - 2];
  
  const calculateGrowth = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <TopNav />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading reports...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#1A1A2E] via-[#1A1A2E] to-[#2A1A3E] border-b border-gray-700/50 p-4 md:p-6 lg:p-8 overflow-hidden rounded-t-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
                <p className="text-gray-400">Track your performance and business insights</p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                <button className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                  <Download className="w-4 h-4 mr-2" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6 mb-8">
            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm">Total Earnings</p>
                  <p className="text-xl md:text-2xl font-bold text-white break-words">
                    ${currentMonth?.earnings.toLocaleString() || '0'}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {calculateGrowth(currentMonth?.earnings || 0, previousMonth?.earnings || 0) >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                    ) : (
                      <ArrowDownLeft className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                    )}
                    <p className={cn(
                      'text-xs md:text-sm',
                      calculateGrowth(currentMonth?.earnings || 0, previousMonth?.earnings || 0) >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    )}>
                      {Math.abs(calculateGrowth(currentMonth?.earnings || 0, previousMonth?.earnings || 0)).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm">Projects Completed</p>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {currentMonth?.projects || 0}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {calculateGrowth(currentMonth?.projects || 0, previousMonth?.projects || 0) >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                    ) : (
                      <ArrowDownLeft className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                    )}
                    <p className={cn(
                      'text-xs md:text-sm',
                      calculateGrowth(currentMonth?.projects || 0, previousMonth?.projects || 0) >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    )}>
                      {Math.abs(calculateGrowth(currentMonth?.projects || 0, previousMonth?.projects || 0)).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm">Active Clients</p>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {currentMonth?.clients || 0}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {calculateGrowth(currentMonth?.clients || 0, previousMonth?.clients || 0) >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                    ) : (
                      <ArrowDownLeft className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                    )}
                    <p className={cn(
                      'text-xs md:text-sm',
                      calculateGrowth(currentMonth?.clients || 0, previousMonth?.clients || 0) >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    )}>
                      {Math.abs(calculateGrowth(currentMonth?.clients || 0, previousMonth?.clients || 0)).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm">Average Rating</p>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {currentMonth?.rating.toFixed(1) || '0.0'}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
                    <p className="text-yellow-400 text-xs md:text-sm">Excellent</p>
                  </div>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts and detailed reports will be added here */}
          <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Overview</h3>
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p>Charts and detailed analytics coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
