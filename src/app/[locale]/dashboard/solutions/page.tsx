'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { 
  Plus, 
  Play, 
  Eye, 
  Heart, 
  DollarSign, 
  TrendingUp, 
  Edit, 
  Trash2,
  Upload,
  Video,
  Image as ImageIcon,
  Star,
  Clock
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { ReelsService, Reel } from '@/lib/appwrite/reels';

export default function SolutionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthContext();
  const [solutions, setSolutions] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgRating: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/en/auth/login');
      return;
    }
    if (user) {
      loadSolutions();
    }
  }, [user, authLoading, router]);

  const loadSolutions = async () => {
    try {
      setLoading(true);
      // Load user's solutions
      const userSolutions = await ReelsService.getReelsByCreator(user!.$id);
      setSolutions(userSolutions);
      
      // Calculate stats
      const totalViews = userSolutions.reduce((sum, reel) => sum + reel.views, 0);
      const totalOrders = userSolutions.reduce((sum, reel) => sum + Math.floor(reel.views * 0.15), 0);
      const totalRevenue = userSolutions.reduce((sum, reel) => sum + Math.floor(reel.views * 0.02), 0);
      const avgRating = userSolutions.length > 0 
        ? userSolutions.reduce((sum, reel) => sum + reel.rating, 0) / userSolutions.length 
        : 0;

      setStats({
        totalViews,
        totalRevenue,
        totalOrders,
        avgRating: Math.round(avgRating * 10) / 10
      });
    } catch (error) {
      console.error('Error loading solutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">My Solutions</h1>
                <p className="text-gray-400 mt-2">Manage your AI solutions and track performance</p>
              </div>
              <Link
                href="/en/dashboard/solutions/create"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Create Solution</span>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="w-8 h-8 text-blue-400" />
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.totalViews)}</div>
                <div className="text-gray-400 text-sm">Total Views</div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-green-400" />
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">${formatNumber(stats.totalRevenue)}</div>
                <div className="text-gray-400 text-sm">Total Revenue</div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Heart className="w-8 h-8 text-pink-400" />
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.totalOrders)}</div>
                <div className="text-gray-400 text-sm">Total Orders</div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Star className="w-8 h-8 text-yellow-400" />
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.avgRating}</div>
                <div className="text-gray-400 text-sm">Avg Rating</div>
              </div>
            </div>

            {/* Solutions Grid */}
            {solutions.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No solutions yet</h3>
                <p className="text-gray-400 mb-6">Create your first AI solution to start earning</p>
                <Link
                  href="/en/dashboard/solutions/create"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Solution</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {solutions.map((solution) => (
                  <div key={solution.$id} className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden hover:border-gray-700/50 transition-all duration-300">
                    {/* Thumbnail */}
                    <div className="relative aspect-[9/16] bg-gray-800">
                      {solution.thumbnailUrl ? (
                        <img
                          src={solution.thumbnailUrl}
                          alt={solution.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play className="w-8 h-8 text-white" />
                      </div>

                      {/* Actions */}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button className="p-1.5 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 bg-black/50 backdrop-blur-sm text-red-400 rounded-lg hover:bg-black/70 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2 line-clamp-2">{solution.title}</h3>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{formatNumber(solution.views)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{formatNumber(solution.likes)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>{solution.rating}</span>
                        </div>
                      </div>

                      {/* Revenue */}
                      <div className="flex items-center justify-between">
                        <div className="text-green-400 font-semibold">
                          ${Math.floor(solution.views * 0.02)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.floor(solution.views * 0.15)} orders
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </div>
    </div>
  );
}
