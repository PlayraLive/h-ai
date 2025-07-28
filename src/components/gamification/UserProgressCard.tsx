"use client";

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { databases, DATABASE_ID, Query } from '@/lib/appwrite/database';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Award, 
  Zap,
  Crown,
  Medal,
  Target,
  Flame,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProgress {
  current_level: number;
  current_xp: number;
  total_xp: number;
  next_level_xp: number;
  rank_title: string;
  completed_jobs: number;
  success_rate: number;
  average_rating: number;
  total_earnings: number;
  streak_days: number;
  achievements_count: number;
}

interface Achievement {
  achievement_id: string;
  achievement_name: string;
  achievement_description: string;
  achievement_icon: string;
  achievement_category: string;
  xp_reward: number;
  rarity: string;
  unlocked_at: string;
}

const UserProgressCard = () => {
  const { user } = useAuthContext();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProgress();
      loadRecentAchievements();
    }
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      const progressResponse = await databases.listDocuments(
        DATABASE_ID,
        'user_progress',
        [Query.equal('user_id', user.$id)]
      );

      if (progressResponse.documents.length > 0) {
        setProgress(progressResponse.documents[0] as UserProgress);
      } else {
        // Create default progress if not exists
        const defaultProgress = await databases.createDocument(
          DATABASE_ID,
          'user_progress',
          user.$id + '_progress',
          {
            user_id: user.$id,
            current_level: 1,
            current_xp: 0,
            total_xp: 0,
            next_level_xp: 100,
            rank_title: user.userType === 'client' ? 'Новый клиент' : 'Начинающий фрилансер',
            completed_jobs: 0,
            success_rate: 0,
            average_rating: 0,
            total_earnings: 0,
            streak_days: 0,
            achievements_count: 0
          }
        );
        setProgress(defaultProgress as UserProgress);
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const loadRecentAchievements = async () => {
    if (!user) return;

    try {
      const achievementsResponse = await databases.listDocuments(
        DATABASE_ID,
        'achievements',
        [
          Query.equal('user_id', user.$id),
          Query.orderDesc('unlocked_at'),
          Query.limit(3)
        ]
      );

      setRecentAchievements(achievementsResponse.documents as Achievement[]);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (level: number) => {
    if (level >= 20) return Crown;
    if (level >= 10) return Medal;
    if (level >= 5) return Trophy;
    return Star;
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'from-yellow-500 to-yellow-600';
    if (level >= 10) return 'from-purple-500 to-purple-600';
    if (level >= 5) return 'from-blue-500 to-blue-600';
    return 'from-gray-500 to-gray-600';
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

  const xpPercentage = progress ? (progress.current_xp / progress.next_level_xp) * 100 : 0;
  const LevelIcon = progress ? getLevelIcon(progress.current_level) : Star;

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
          Ваш прогресс
        </h3>
        <div className="text-sm text-gray-400">
          Уровень {progress.current_level}
        </div>
      </div>

      {/* Level and XP */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center",
              getLevelColor(progress.current_level)
            )}>
              <LevelIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-medium">{progress.rank_title}</h4>
              <p className="text-sm text-gray-400">
                {progress.current_xp} / {progress.next_level_xp} XP
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{progress.current_level}</div>
            <div className="text-xs text-gray-400">Уровень</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
            style={{ width: `${Math.min(xpPercentage, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="text-xs text-gray-400 text-center">
          {progress.next_level_xp - progress.current_xp} XP до следующего уровня
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{progress.completed_jobs}</div>
          <div className="text-xs text-gray-400">Завершено</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {progress.average_rating > 0 ? progress.average_rating.toFixed(1) : '—'}
          </div>
          <div className="text-xs text-gray-400">Рейтинг</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{progress.achievements_count}</div>
          <div className="text-xs text-gray-400">Достижения</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400 flex items-center justify-center">
            <Flame className="w-5 h-5 mr-1" />
            {progress.streak_days}
          </div>
          <div className="text-xs text-gray-400">Дней подряд</div>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white flex items-center">
              <Award className="w-4 h-4 mr-1 text-yellow-400" />
              Последние достижения
            </h4>
            <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center">
              Все
              <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="space-y-2">
            {recentAchievements.map((achievement) => (
              <div 
                key={achievement.achievement_id}
                className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:bg-gray-800/50 transition-all duration-200"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center text-sm",
                  getRarityColor(achievement.rarity)
                )}>
                  {achievement.achievement_icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {achievement.achievement_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {achievement.achievement_description}
                  </p>
                </div>
                <div className="text-xs text-purple-400 font-medium">
                  +{achievement.xp_reward} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Goal */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">Следующая цель</span>
        </div>
        <p className="text-xs text-gray-400">
          {user?.userType === 'client' 
            ? 'Создайте ещё 2 заказа чтобы получить достижение "Активный клиент"'
            : 'Завершите первый заказ чтобы получить достижение "Первый успех"'}
        </p>
      </div>
    </div>
  );
};

export default UserProgressCard; 