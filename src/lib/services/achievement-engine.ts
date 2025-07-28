import { databases, DATABASE_ID, ID, Query } from '@/lib/appwrite/database';

interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  condition: (userData: any) => boolean;
  progressTracker?: (userData: any) => { current: number; required: number };
}

// Определения всех достижений в системе
const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Onboarding Achievements
  {
    id: 'welcome_onboard',
    name: '🎉 Добро пожаловать!',
    description: 'Завершили настройку профиля',
    icon: '🎉',
    category: 'onboarding',
    xpReward: 50,
    rarity: 'common',
    condition: (data) => data.onboardingCompleted
  },
  
  // Client Achievements  
  {
    id: 'first_job_post',
    name: '📝 Первый заказ',
    description: 'Создали свой первый заказ',
    icon: '📝',
    category: 'client',
    xpReward: 25,
    rarity: 'common',
    condition: (data) => data.jobsCreated >= 1
  },
  {
    id: 'active_client',
    name: '💼 Активный клиент',
    description: 'Создали 5 заказов',
    icon: '💼',
    category: 'client',
    xpReward: 100,
    rarity: 'uncommon',
    condition: (data) => data.jobsCreated >= 5,
    progressTracker: (data) => ({ current: data.jobsCreated || 0, required: 5 })
  },
  {
    id: 'job_master',
    name: '🏆 Мастер заказов',
    description: 'Создали 25 заказов',
    icon: '🏆',
    category: 'client',
    xpReward: 250,
    rarity: 'rare',
    condition: (data) => data.jobsCreated >= 25,
    progressTracker: (data) => ({ current: data.jobsCreated || 0, required: 25 })
  },
  
  // Freelancer Achievements
  {
    id: 'first_application',
    name: '🚀 Первая заявка',
    description: 'Подали первую заявку на работу',
    icon: '🚀',
    category: 'freelancer',
    xpReward: 25,
    rarity: 'common',
    condition: (data) => data.applicationsSubmitted >= 1
  },
  {
    id: 'first_job_completed',
    name: '✅ Первый успех',
    description: 'Завершили первый заказ',
    icon: '✅',
    category: 'freelancer',
    xpReward: 75,
    rarity: 'uncommon',
    condition: (data) => data.jobsCompleted >= 1
  },
  {
    id: 'reliable_freelancer',
    name: '⭐ Надёжный исполнитель',
    description: 'Завершили 10 заказов с рейтингом 4+',
    icon: '⭐',
    category: 'freelancer',
    xpReward: 200,
    rarity: 'rare',
    condition: (data) => data.jobsCompleted >= 10 && data.averageRating >= 4,
    progressTracker: (data) => ({ current: data.jobsCompleted || 0, required: 10 })
  },
  
  // Social Achievements
  {
    id: 'first_like',
    name: '❤️ Первый лайк',
    description: 'Поставили первый лайк',
    icon: '❤️',
    category: 'social',
    xpReward: 10,
    rarity: 'common',
    condition: (data) => data.likesGiven >= 1
  },
  {
    id: 'socializer',
    name: '🤝 Социальная бабочка',
    description: 'Поставили 50 лайков',
    icon: '🤝',
    category: 'social',
    xpReward: 100,
    rarity: 'uncommon',
    condition: (data) => data.likesGiven >= 50,
    progressTracker: (data) => ({ current: data.likesGiven || 0, required: 50 })
  },
  {
    id: 'five_star_reviewer',
    name: '⭐ Щедрый на похвалу',
    description: 'Поставили первую 5-звездочную оценку',
    icon: '⭐',
    category: 'social',
    xpReward: 25,
    rarity: 'uncommon',
    condition: (data) => data.fiveStarReviews >= 1
  },
  
  // AI Achievements
  {
    id: 'ai_explorer',
    name: '🤖 AI исследователь',
    description: 'Сделали первый AI заказ',
    icon: '🤖',
    category: 'ai',
    xpReward: 50,
    rarity: 'common',
    condition: (data) => data.aiOrdersCreated >= 1
  },
  {
    id: 'ai_enthusiast',
    name: '🧠 AI энтузиаст',
    description: 'Сделали 10 AI заказов',
    icon: '🧠',
    category: 'ai',
    xpReward: 150,
    rarity: 'uncommon',
    condition: (data) => data.aiOrdersCreated >= 10,
    progressTracker: (data) => ({ current: data.aiOrdersCreated || 0, required: 10 })
  },
  
  // Level Achievements
  {
    id: 'level_5',
    name: '🥉 Опытный пользователь',
    description: 'Достигли 5 уровня',
    icon: '🥉',
    category: 'level',
    xpReward: 100,
    rarity: 'uncommon',
    condition: (data) => data.currentLevel >= 5
  },
  {
    id: 'level_10',
    name: '🥈 Эксперт платформы',
    description: 'Достигли 10 уровня',
    icon: '🥈',
    category: 'level',
    xpReward: 200,
    rarity: 'rare',
    condition: (data) => data.currentLevel >= 10
  },
  {
    id: 'level_20',
    name: '🥇 Мастер платформы',
    description: 'Достигли 20 уровня',
    icon: '🥇',
    category: 'level',
    xpReward: 500,
    rarity: 'epic',
    condition: (data) => data.currentLevel >= 20
  },
  
  // Special Achievements
  {
    id: 'early_bird',
    name: '🌅 Ранняя пташка',
    description: 'Активны каждый день в течение недели',
    icon: '🌅',
    category: 'special',
    xpReward: 100,
    rarity: 'rare',
    condition: (data) => data.streakDays >= 7,
    progressTracker: (data) => ({ current: data.streakDays || 0, required: 7 })
  },
  {
    id: 'perfectionist',
    name: '💎 Перфекционист',
    description: 'Средний рейтинг 4.8+ за 20+ заказов',
    icon: '💎',
    category: 'special',
    xpReward: 300,
    rarity: 'epic',
    condition: (data) => data.jobsCompleted >= 20 && data.averageRating >= 4.8,
    progressTracker: (data) => ({ current: data.jobsCompleted || 0, required: 20 })
  }
];

export class AchievementEngine {
  
  // Проверить и выдать достижения для пользователя
  static async checkAndAwardAchievements(userId: string, userData: any) {
    try {
      // Получаем уже разблокированные достижения
      const existingAchievements = await databases.listDocuments(
        DATABASE_ID,
        'achievements',
        [Query.equal('user_id', userId)]
      );

      const unlockedIds = existingAchievements.documents.map(a => a.achievement_id);
      const newAchievements = [];

      // Проверяем каждое определение достижения
      for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        // Пропускаем уже разблокированные
        if (unlockedIds.includes(achievement.id)) continue;

        // Проверяем условие
        if (achievement.condition(userData)) {
          // Разблокируем достижение
          const newAchievement = await databases.createDocument(
            DATABASE_ID,
            'achievements',
            ID.unique(),
            {
              user_id: userId,
              achievement_id: achievement.id,
              achievement_name: achievement.name,
              achievement_description: achievement.description,
              achievement_icon: achievement.icon,
              achievement_category: achievement.category,
              xp_reward: achievement.xpReward,
              rarity: achievement.rarity,
              unlocked_at: new Date().toISOString(),
              progress_current: 1,
              progress_required: 1
            }
          );

          newAchievements.push(newAchievement);

          // Награждаем XP
          await this.awardXP(userId, achievement.xpReward, `achievement_${achievement.id}`);
        }
      }

      // Обновляем счетчик достижений
      if (newAchievements.length > 0) {
        const progressResponse = await databases.listDocuments(
          DATABASE_ID,
          'user_progress',
          [Query.equal('user_id', userId)]
        );

        if (progressResponse.documents.length > 0) {
          const currentProgress = progressResponse.documents[0];
          await databases.updateDocument(
            DATABASE_ID,
            'user_progress',
            currentProgress.$id,
            {
              achievements_count: currentProgress.achievements_count + newAchievements.length
            }
          );
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // Получить прогресс по достижениям
  static async getAchievementProgress(userId: string, userData: any) {
    try {
      const existingAchievements = await databases.listDocuments(
        DATABASE_ID,
        'achievements',
        [Query.equal('user_id', userId)]
      );

      const unlockedIds = existingAchievements.documents.map(a => a.achievement_id);
      const progress = [];

      for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        const isUnlocked = unlockedIds.includes(achievement.id);
        let progressData = { current: 0, required: 1 };

        if (!isUnlocked && achievement.progressTracker) {
          progressData = achievement.progressTracker(userData);
        }

        progress.push({
          ...achievement,
          isUnlocked,
          progress: progressData
        });
      }

      return progress;
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return [];
    }
  }

  // Награждение XP с обновлением уровня
  private static async awardXP(userId: string, amount: number, reason: string) {
    try {
      const progressResponse = await databases.listDocuments(
        DATABASE_ID,
        'user_progress',
        [Query.equal('user_id', userId)]
      );

      if (progressResponse.documents.length > 0) {
        const progress = progressResponse.documents[0];
        const newCurrentXP = progress.current_xp + amount;
        const newTotalXP = progress.total_xp + amount;
        
        let newLevel = progress.current_level;
        let newNextLevelXP = progress.next_level_xp;

        // Проверяем достижение нового уровня
        if (newCurrentXP >= progress.next_level_xp) {
          newLevel += 1;
          newNextLevelXP = this.calculateXPRequirement(newLevel);
        }

        await databases.updateDocument(
          DATABASE_ID,
          'user_progress',
          progress.$id,
          {
            current_xp: newCurrentXP >= progress.next_level_xp ? newCurrentXP - progress.next_level_xp : newCurrentXP,
            total_xp: newTotalXP,
            current_level: newLevel,
            next_level_xp: newNextLevelXP
          }
        );

        return { newLevel: newLevel > progress.current_level, level: newLevel };
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  }

  // Расчет требований XP для уровня
  private static calculateXPRequirement(level: number): number {
    // Прогрессивная формула: базовое значение + (уровень^1.5 * 50)
    return Math.floor(100 + Math.pow(level, 1.5) * 50);
  }

  // Сбор данных пользователя для проверки достижений
  static async getUserDataForAchievements(userId: string) {
    try {
      // Собираем все данные пользователя из разных коллекций
      const [progress, profile, jobs, applications, orders, interactions, reviews] = await Promise.all([
        databases.listDocuments(DATABASE_ID, 'user_progress', [Query.equal('user_id', userId)]),
        databases.listDocuments(DATABASE_ID, 'user_profiles', [Query.equal('user_id', userId)]),
        databases.listDocuments(DATABASE_ID, 'jobs', [Query.equal('clientId', userId)]),
        databases.listDocuments(DATABASE_ID, 'applications', [Query.equal('freelancerId', userId)]),
        databases.listDocuments(DATABASE_ID, 'orders', [Query.equal('userId', userId)]),
        databases.listDocuments(DATABASE_ID, 'interactions', [Query.equal('user_id', userId)]),
        databases.listDocuments(DATABASE_ID, 'ratings_reviews', [Query.equal('reviewer_id', userId)])
      ]);

      const userData = {
        // Progress data
        currentLevel: progress.documents[0]?.current_level || 1,
        streakDays: progress.documents[0]?.streak_days || 0,
        jobsCompleted: progress.documents[0]?.completed_jobs || 0,
        averageRating: progress.documents[0]?.average_rating || 0,
        
        // Profile data
        onboardingCompleted: profile.documents[0]?.onboarding_completed || false,
        
        // Activity data
        jobsCreated: jobs.documents.length,
        applicationsSubmitted: applications.documents.length,
        aiOrdersCreated: orders.documents.length,
        
        // Social data
        likesGiven: interactions.documents.filter(i => i.interaction_type === 'like').length,
        fiveStarReviews: reviews.documents.filter(r => r.overall_rating === 5).length
      };

      return userData;
    } catch (error) {
      console.error('Error collecting user data:', error);
      return {};
    }
  }

  // Триггер проверки достижений после определенного действия
  static async triggerAchievementCheck(userId: string, action: string) {
    try {
      const userData = await this.getUserDataForAchievements(userId);
      const newAchievements = await this.checkAndAwardAchievements(userId, userData);
      
      if (newAchievements.length > 0) {
        console.log(`🏆 User ${userId} unlocked ${newAchievements.length} new achievements:`, 
          newAchievements.map(a => a.achievement_name));
      }
      
      return newAchievements;
    } catch (error) {
      console.error('Error triggering achievement check:', error);
      return [];
    }
  }
} 