'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Star,
  Users,
  MessageCircle,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userType, setUserType] = useState<'freelancer' | 'client'>('freelancer');
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    console.log('Dashboard auth state:', { user, isAuthenticated, isLoading });
  }, [user, isAuthenticated, isLoading]);

  useEffect(() => {
    console.log('Dashboard useEffect triggered:', { isLoading, isAuthenticated });
    // Temporarily disable strict auth check to test
    // if (!isLoading && !isAuthenticated) {
    //   console.log('Redirecting to login...');
    //   router.push('/en/login');
    // }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Safe formatting functions
  const safeCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    } catch (e) {
      return `$${amount}`;
    }
  };

  // Dynamic data based on user type
  const freelancerStats = [
    {
      label: 'Total Earnings',
      value: safeCurrency(12500),
      change: '+12%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      label: 'Active Projects',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: Briefcase,
      color: 'text-blue-400'
    },
    {
      label: 'Completed Jobs',
      value: '156',
      change: '+5',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'text-purple-400'
    },
    {
      label: 'Client Rating',
      value: '4.9',
      change: '+0.1',
      changeType: 'positive',
      icon: Star,
      color: 'text-yellow-400'
    }
  ];

  const clientStats = [
    {
      label: 'Total Spent',
      value: safeCurrency(28750),
      change: '+18%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      label: 'Active Jobs',
      value: '5',
      change: '+1',
      changeType: 'positive',
      icon: Briefcase,
      color: 'text-blue-400'
    },
    {
      label: 'Hired Freelancers',
      value: '23',
      change: '+3',
      changeType: 'positive',
      icon: Users,
      color: 'text-purple-400'
    },
    {
      label: 'Success Rate',
      value: '96%',
      change: '+2%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-yellow-400'
    }
  ];

  const stats = userType === 'freelancer' ? freelancerStats : clientStats;

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {userType === 'freelancer' ? 'Freelancer Dashboard' : 'Client Dashboard'}
              </h1>
              <p className="text-gray-400">
                {userType === 'freelancer' 
                  ? "Manage your projects and find new opportunities" 
                  : "Post jobs and manage your hired freelancers"
                }
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {/* User Type Switcher */}
              <div className="flex items-center bg-gray-800/50 rounded-xl p-1">
                <button
                  onClick={() => setUserType('freelancer')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    userType === 'freelancer'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  👨‍💻 Freelancer
                </button>
                <button
                  onClick={() => setUserType('client')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    userType === 'client'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  🏢 Client
                </button>
              </div>

              {/* Action Button */}
              {userType === 'client' ? (
                <Link href="/en/jobs/create" className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Link>
              ) : (
                <Link href="/en/jobs" className="btn-primary">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Find Jobs
                </Link>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userType === 'client' ? (
                <>
                  <Link href="/en/jobs/create" className="btn-secondary text-center">
                    📝 Post New Job
                  </Link>
                  <Link href="/en/freelancers" className="btn-secondary text-center">
                    👥 Find Freelancers
                  </Link>
                  <Link href="/en/messages" className="btn-secondary text-center">
                    💬 Messages
                  </Link>
                  <Link href="/en/profile/edit" className="btn-secondary text-center">
                    ⚙️ Edit Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/en/jobs" className="btn-secondary text-center">
                    🔍 Find Jobs
                  </Link>
                  <Link href="/en/proposals" className="btn-secondary text-center">
                    📋 My Proposals
                  </Link>
                  <Link href="/en/messages" className="btn-secondary text-center">
                    💬 Messages
                  </Link>
                  <Link href="/en/profile/edit" className="btn-secondary text-center">
                    ⚙️ Edit Profile
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Welcome Message */}
          <div className="glass-card p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Welcome to your {userType} dashboard!
            </h2>
            <p className="text-gray-400 mb-6">
              {userType === 'freelancer' 
                ? "Start browsing available jobs or manage your current projects."
                : "Post your first job or browse our talented freelancers."
              }
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/en/jobs" className="btn-primary">
                {userType === 'freelancer' ? 'Browse Jobs' : 'Post a Job'}
              </Link>
              <Link href="/en/profile" className="btn-secondary">
                View Profile
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
