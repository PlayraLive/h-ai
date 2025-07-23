"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataSeeder from '@/components/admin/DataSeeder';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/database';
import {
  Database,
  Users,
  Briefcase,
  Star,
  MessageCircle,
  Bell,
  FileImage,
  Zap,
  BarChart3,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface DatabaseStats {
  users: number;
  projects: number;
  reviews: number;
  messages: number;
  notifications: number;
  portfolio: number;
  skills: number;
  categories: number;
  lastUpdated: string;
}

export default function AdminDataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDatabaseStats = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const statsPromises = Object.entries(COLLECTIONS).map(async ([key, collectionId]) => {
        try {
          const result = await databases.listDocuments(DATABASE_ID, collectionId, []);
          return { collection: key.toLowerCase(), count: result.total };
        } catch (err) {
          console.warn(`Failed to fetch ${key}:`, err);
          return { collection: key.toLowerCase(), count: 0 };
        }
      });

      const results = await Promise.all(statsPromises);

      const statsMap = results.reduce((acc, { collection, count }) => {
        acc[collection] = count;
        return acc;
      }, {} as any);

      setStats({
        users: statsMap.users || 0,
        projects: statsMap.projects || 0,
        reviews: statsMap.reviews || 0,
        messages: statsMap.messages || 0,
        notifications: statsMap.notifications || 0,
        portfolio: statsMap.portfolio || 0,
        skills: statsMap.skills || 0,
        categories: statsMap.categories || 0,
        lastUpdated: new Date().toISOString()
      });

    } catch (err: any) {
      setError(err.message || 'Failed to fetch database statistics');
      console.error('Error fetching database stats:', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const statsItems = stats ? [
    { icon: Users, label: 'Users', value: stats.users, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { icon: Briefcase, label: 'Projects', value: stats.projects, color: 'text-green-400', bgColor: 'bg-green-500/10' },
    { icon: Star, label: 'Reviews', value: stats.reviews, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    { icon: MessageCircle, label: 'Messages', value: stats.messages, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
    { icon: Bell, label: 'Notifications', value: stats.notifications, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    { icon: FileImage, label: 'Portfolio', value: stats.portfolio, color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
    { icon: Zap, label: 'Skills', value: stats.skills, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    { icon: BarChart3, label: 'Categories', value: stats.categories, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
  ] : [];

  const totalRecords = stats ? Object.values(stats).reduce((sum, value) => {
    return typeof value === 'number' ? sum + value : sum;
  }, 0) : 0;

  const isDatabaseEmpty = totalRecords === 0;
  const hasMinimalData = totalRecords > 0 && totalRecords < 50;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading database information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/en/admin/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-700"></div>
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl font-semibold text-white">Data Management</h1>
              </div>
            </div>

            <button
              onClick={fetchDatabaseStats}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Database Status */}
        <div className="mb-8">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Database Status</h2>
                <p className="text-gray-400">
                  Last updated: {stats ? new Date(stats.lastUpdated).toLocaleString() : 'Never'}
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-white">{totalRecords.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Records</div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="mb-6">
              {isDatabaseEmpty ? (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <div>
                    <div className="font-medium text-red-400">Database is Empty</div>
                    <div className="text-sm text-red-300">No data found. Consider seeding the database with demo data.</div>
                  </div>
                </div>
              ) : hasMinimalData ? (
                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  <div>
                    <div className="font-medium text-yellow-400">Minimal Data</div>
                    <div className="text-sm text-yellow-300">Limited data available. Consider adding more demo data for testing.</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="font-medium text-green-400">Database Healthy</div>
                    <div className="text-sm text-green-300">Sufficient data available for testing and development.</div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statsItems.map((item, index) => (
                <div key={index} className={`${item.bgColor} rounded-lg p-4 border border-gray-700/50`}>
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm font-medium text-gray-300">{item.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{item.value.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8">
            <div className="glass-card p-6 rounded-xl border-l-4 border-red-500">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="font-medium text-red-400">Database Error</h3>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Seeder Component */}
        <DataSeeder />

        {/* Additional Information */}
        <div className="mt-8">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Database Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-3">Collections Overview:</h3>
                <div className="space-y-2">
                  {Object.entries(COLLECTIONS).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
                      <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">{value}</code>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-3">Best Practices:</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>• Always backup data before cleaning</li>
                  <li>• Use "Clean & Seed" for fresh start</li>
                  <li>• Monitor logs during seeding process</li>
                  <li>• Verify data integrity after seeding</li>
                  <li>• Test all application features with new data</li>
                  <li>• Update user permissions if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
