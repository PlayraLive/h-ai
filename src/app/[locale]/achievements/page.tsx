"use client";

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { databases, DATABASE_ID, Query } from '@/lib/appwrite/database';
import { AchievementEngine } from '@/lib/services/achievement-engine';
import Navbar from '@/components/Navbar';
import { 
  Trophy, 
  Star, 
  Award, 
  Crown, 
  Medal,
  Target,
  TrendingUp,
  Sparkles,
  Lock,
  CheckCircle,
  Progress as ProgressIcon,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  $id: string;
  achievement_id: string;
  achievement_name: string;
  achievement_description: string;
  achievement_icon: string;
  achievement_category: string;
  xp_reward: number;
  rarity: string;
  unlocked_at: string;
  progress_current: number;
  progress_required: number;
}

interface AchievementWithProgress extends Achievement {
  isUnlocked: boolean;
  progress: {
    current: number;
    required: number;
  };
}

const AchievementsPage = () => {
  const { user } = useAuthContext();
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    try {
      // Get user data for progress calculation
      const userData = await AchievementEngine.getUserDataForAchievements(user.$id);
      
      // Get achievement progress
      const achievementProgress = await AchievementEngine.getAchievementProgress(user.$id, userData);
      
      setAchievements(achievementProgress);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-500 to-orange-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      case 'uncommon': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-500/50';
      case 'epic': return 'border-purple-500/50';
      case 'rare': return 'border-blue-500/50';
      case 'uncommon': return 'border-green-500/50';
      default: return 'border-gray-500/50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'onboarding': return Sparkles;
      case 'client': return Trophy;
      case 'freelancer': return Star;
      case 'social': return Award;
      case 'ai': return Crown;
      case 'level': return Medal;
      case 'special': return Target;
      default: return Trophy;
    }
  };

  const categories = [
    { id: 'all', name: 'Все', icon: Trophy },
    { id: 'onboarding', name: 'Онбординг', icon: Sparkles },
    { id: 'client', name: 'Клиент', icon: Trophy },
    { id: 'freelancer', name: 'Фрилансер', icon: Star },
    { id: 'social', name: 'Социальные', icon: Award },
    { id: 'ai', name: 'AI', icon: Crown },
    { id: 'level', name: 'Уровни', icon: Medal },
    { id: 'special', name: 'Особые', icon: Target }
  ];

  const filteredAchievements = achievements.filter(achievement => {
    // Filter by unlock status
    if (filter === 'unlocked' && !achievement.isUnlocked) return false;
    if (filter === 'locked' && achievement.isUnlocked) return false;
    
    // Filter by category
    if (selectedCategory !== 'all' && achievement.achievement_category !== selectedCategory) return false;
    
    // Filter by search term
    if (searchTerm && !achievement.achievement_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !achievement.achievement_description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.isUnlocked).length,
    totalXP: achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.xp_reward, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-800 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Достижения</h1>
              <p className="text-gray-400">Ваши успехи и прогресс на платформе</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.unlocked}</div>
              <div className="text-sm text-gray-400">Разблокировано</div>
              <div className="text-xs text-gray-500">из {stats.total}</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.totalXP}</div>
              <div className="text-sm text-gray-400">Общий XP</div>
              <div className="text-xs text-gray-500">за достижения</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {Math.round((stats.unlocked / stats.total) * 100)}%
              </div>
              <div className="text-sm text-gray-400">Прогресс</div>
              <div className="text-xs text-gray-500">завершённости</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск достижений..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200",
                    selectedCategory === category.id
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                      : "bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-purple-500/30"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex space-x-2">
              {[
                { id: 'all', name: 'Все' },
                { id: 'unlocked', name: 'Разблокированные' },
                { id: 'locked', name: 'Заблокированные' }
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setFilter(option.id)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-lg transition-colors",
                    filter === option.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  )}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const CategoryIcon = getCategoryIcon(achievement.achievement_category);
            const progressPercentage = achievement.isUnlocked ? 100 : 
              (achievement.progress.current / achievement.progress.required) * 100;

            return (
              <div
                key={achievement.achievement_id}
                className={cn(
                  "relative bg-gray-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105",
                  achievement.isUnlocked 
                    ? `${getRarityBorder(achievement.rarity)} shadow-lg`
                    : "border-gray-700/50 opacity-75 hover:opacity-90"
                )}
              >
                {/* Rarity Glow Effect */}
                {achievement.isUnlocked && (
                  <div className={cn(
                    "absolute inset-0 rounded-2xl opacity-20 blur-xl",
                    `bg-gradient-to-r ${getRarityColor(achievement.rarity)}`
                  )}></div>
                )}

                {/* Header */}
                <div className="relative flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl relative",
                      achievement.isUnlocked 
                        ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}`
                        : "bg-gray-700"
                    )}>
                      {achievement.isUnlocked ? achievement.achievement_icon : <Lock className="w-6 h-6 text-gray-400" />}
                      
                      {achievement.isUnlocked && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={cn(
                        "font-semibold",
                        achievement.isUnlocked ? "text-white" : "text-gray-400"
                      )}>
                        {achievement.achievement_name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400 capitalize">
                          {achievement.achievement_category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rarity Badge */}
                  <div className={cn(
                    "px-2 py-1 rounded-lg text-xs font-medium",
                    achievement.isUnlocked 
                      ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`
                      : "bg-gray-700 text-gray-400"
                  )}>
                    {achievement.rarity}
                  </div>
                </div>

                {/* Description */}
                <p className={cn(
                  "text-sm mb-4",
                  achievement.isUnlocked ? "text-gray-300" : "text-gray-500"
                )}>
                  {achievement.achievement_description}
                </p>

                {/* Progress Bar */}
                {!achievement.isUnlocked && achievement.progress.required > 1 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>Прогресс</span>
                      <span>{achievement.progress.current}/{achievement.progress.required}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className={cn(
                      "text-sm font-medium",
                      achievement.isUnlocked ? "text-yellow-400" : "text-gray-400"
                    )}>
                      +{achievement.xp_reward} XP
                    </span>
                  </div>
                  
                  {achievement.isUnlocked && (
                    <div className="text-xs text-gray-400">
                      {new Date(achievement.unlocked_at).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Нет достижений</h3>
            <p className="text-gray-400">
              {filter === 'unlocked' 
                ? 'У вас пока нет разблокированных достижений'
                : filter === 'locked'
                ? 'Все достижения уже разблокированы!'
                : 'Измените фильтры поиска'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage; 