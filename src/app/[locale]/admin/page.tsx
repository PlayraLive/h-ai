'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { AdminService, PlatformStats } from '@/lib/admin/analytics';
import { StripePaymentService } from '@/lib/stripe/payments';

// Try to import from Heroicons, fallback to simple icons
let ChartBarIcon, UsersIcon, CurrencyDollarIcon, BriefcaseIcon, TrendingUpIcon, EyeIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  ChartBarIcon = heroicons.ChartBarIcon;
  UsersIcon = heroicons.UsersIcon;
  CurrencyDollarIcon = heroicons.CurrencyDollarIcon;
  BriefcaseIcon = heroicons.BriefcaseIcon;
  TrendingUpIcon = heroicons.TrendingUpIcon;
  EyeIcon = heroicons.EyeIcon;
} catch {
  ChartBarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
  UsersIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
  CurrencyDollarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );
  BriefcaseIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
    </svg>
  );
  TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
  EyeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [paymentAnalytics, setPaymentAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Check if user is admin (in real app, this would be a proper role check)
  const isAdmin = user?.email === 'admin@h-ai.com' || user?.email === 'sacralprojects8@gmail.com';

  useEffect(() => {
    if (!isAdmin) return;

    const loadAnalytics = async () => {
      try {
        setLoading(true);

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        switch (timeRange) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
          case '1y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        }

        // Load platform stats
        const platformStats = await AdminService.getPlatformStats();
        setStats(platformStats);

        // Load payment analytics
        const payments = await StripePaymentService.getPaymentAnalytics(startDate, endDate);
        setPaymentAnalytics(payments);

      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [isAdmin, timeRange]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-300">Please log in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-300">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">Platform analytics and management</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex space-x-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {range === '7d' && 'Last 7 days'}
                {range === '30d' && 'Last 30 days'}
                {range === '90d' && 'Last 90 days'}
                {range === '1y' && 'Last year'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Users */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
                <p className="text-green-400 text-sm mt-1">
                  +{stats?.newRegistrations || 0} this period
                </p>
              </div>
              <UsersIcon className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Projects</p>
                <p className="text-3xl font-bold text-white">{stats?.activeProjects || 0}</p>
                <p className="text-blue-400 text-sm mt-1">
                  {stats?.completedProjects || 0} completed
                </p>
              </div>
              <BriefcaseIcon className="w-12 h-12 text-purple-400" />
            </div>
          </div>

          {/* Platform Revenue */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Platform Revenue</p>
                <p className="text-3xl font-bold text-white">
                  ${paymentAnalytics?.platformRevenue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-green-400 text-sm mt-1">
                  10% commission
                </p>
              </div>
              <CurrencyDollarIcon className="w-12 h-12 text-green-400" />
            </div>
          </div>

          {/* Total Volume */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Volume</p>
                <p className="text-3xl font-bold text-white">
                  ${paymentAnalytics?.totalRevenue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-yellow-400 text-sm mt-1">
                  {paymentAnalytics?.transactionCount || 0} transactions
                </p>
              </div>
              <TrendingUpIcon className="w-12 h-12 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* User Breakdown */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">User Breakdown</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Freelancers</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${stats?.totalUsers ? (stats.freelancers / stats.totalUsers) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-white font-medium w-12 text-right">
                    {stats?.freelancers || 0}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Clients</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ 
                        width: `${stats?.totalUsers ? (stats.clients / stats.totalUsers) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-white font-medium w-12 text-right">
                    {stats?.clients || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Freelancer/Client Ratio: {stats?.totalUsers ? 
                  `${((stats.freelancers / stats.totalUsers) * 100).toFixed(1)}% / ${((stats.clients / stats.totalUsers) * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Financial Overview</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Revenue</span>
                <span className="text-white font-bold">
                  ${paymentAnalytics?.totalRevenue?.toFixed(2) || '0.00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Platform Commission (10%)</span>
                <span className="text-green-400 font-bold">
                  ${paymentAnalytics?.platformRevenue?.toFixed(2) || '0.00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Freelancer Earnings (90%)</span>
                <span className="text-blue-400 font-bold">
                  ${paymentAnalytics?.freelancerEarnings?.toFixed(2) || '0.00'}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Average Transaction</span>
                  <span className="text-white font-medium">
                    ${paymentAnalytics?.averageTransactionValue?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Platform Health</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {stats?.conversionRate ? `${(stats.conversionRate * 100).toFixed(1)}%` : '0%'}
              </div>
              <div className="text-gray-300 text-sm">Conversion Rate</div>
              <div className="text-xs text-gray-400 mt-1">Projects to completion</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                ${stats?.averageProjectValue?.toFixed(0) || '0'}
              </div>
              <div className="text-gray-300 text-sm">Avg Project Value</div>
              <div className="text-xs text-gray-400 mt-1">Per completed project</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {paymentAnalytics?.transactionCount || 0}
              </div>
              <div className="text-gray-300 text-sm">Transactions</div>
              <div className="text-xs text-gray-400 mt-1">In selected period</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>H-AI Platform Admin Dashboard • Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
