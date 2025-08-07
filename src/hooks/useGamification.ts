import { useState, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite/database';

export const useGamification = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  // Добавить в избранное
  const addToFavorites = useCallback(async (itemId: string, itemType: string, category?: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    setLoading(true);
    try {
      // Проверяем, не добавлен ли уже в избранное
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FAVORITES,
        [
          Query.equal('user_id', user.$id),
          Query.equal('item_id', itemId),
          Query.equal('item_type', itemType)
        ]
      );

      if (existing.documents.length > 0) {
        return { success: false, error: 'Already in favorites' };
      }

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FAVORITES,
        ID.unique(),
        {
          user_id: user.$id,
          item_id: itemId,
          item_type: itemType,
          added_at: new Date().toISOString(),
          category: category || itemType,
          notes: ''
        }
      );

      // Award XP for adding to favorites
      await awardXP(5, 'favorite_added');

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Удалить из избранного
  const removeFromFavorites = useCallback(async (itemId: string, itemType: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    setLoading(true);
    try {
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FAVORITES,
        [
          Query.equal('user_id', user.$id),
          Query.equal('item_id', itemId),
          Query.equal('item_type', itemType)
        ]
      );

      if (existing.documents.length > 0) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.FAVORITES,
          existing.documents[0].$id
        );
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Проверить, в избранном ли элемент
  const checkFavorite = useCallback(async (itemId: string, itemType: string) => {
    if (!user) return false;

    try {
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FAVORITES,
        [
          Query.equal('user_id', user.$id),
          Query.equal('item_id', itemId),
          Query.equal('item_type', itemType)
        ]
      );

      return existing.documents.length > 0;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }, [user]);

  // Поставить лайк
  const toggleLike = useCallback(async (targetId: string, targetType: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    setLoading(true);
    try {
      // Проверяем, есть ли уже лайк
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INTERACTIONS,
        [
          Query.equal('user_id', user.$id),
          Query.equal('target_id', targetId),
          Query.equal('target_type', targetType),
          Query.equal('interaction_type', 'like')
        ]
      );

      if (existing.documents.length > 0) {
        // Убираем лайк
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.INTERACTIONS,
          existing.documents[0].$id
        );
        return { success: true, action: 'removed' };
      } else {
        // Ставим лайк
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.INTERACTIONS,
          ID.unique(),
          {
            user_id: user.$id,
            target_id: targetId,
            target_type: targetType,
            interaction_type: 'like',
            created_at: new Date().toISOString(),
            metadata: JSON.stringify({ timestamp: Date.now() })
          }
        );

        // Award XP for liking
        await awardXP(2, 'like_given');

        return { success: true, action: 'added' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Получить количество лайков
  const getLikesCount = useCallback(async (targetId: string, targetType: string) => {
    try {
      const likes = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INTERACTIONS,
        [
          Query.equal('target_id', targetId),
          Query.equal('target_type', targetType),
          Query.equal('interaction_type', 'like')
        ]
      );

      return likes.documents.length;
    } catch (error) {
      console.error('Error getting likes count:', error);
      return 0;
    }
  }, []);

  // Проверить, поставлен ли лайк пользователем
  const checkUserLike = useCallback(async (targetId: string, targetType: string) => {
    if (!user) return false;

    try {
      const like = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INTERACTIONS,
        [
          Query.equal('user_id', user.$id),
          Query.equal('target_id', targetId),
          Query.equal('target_type', targetType),
          Query.equal('interaction_type', 'like')
        ]
      );

      return like.documents.length > 0;
    } catch (error) {
      console.error('Error checking user like:', error);
      return false;
    }
  }, [user]);

  // Записать просмотр
  const recordView = useCallback(async (targetId: string, targetType: string) => {
    if (!user) return;

    try {
      // Проверяем, не записан ли уже просмотр недавно (последние 24 часа)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recentViews = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INTERACTIONS,
        [
          Query.equal('user_id', user.$id),
          Query.equal('target_id', targetId),
          Query.equal('target_type', targetType),
          Query.equal('interaction_type', 'view'),
          Query.greaterThan('created_at', yesterday.toISOString())
        ]
      );

      if (recentViews.documents.length === 0) {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.INTERACTIONS,
          ID.unique(),
          {
            user_id: user.$id,
            target_id: targetId,
            target_type: targetType,
            interaction_type: 'view',
            created_at: new Date().toISOString(),
            metadata: JSON.stringify({ 
              user_agent: navigator.userAgent,
              timestamp: Date.now() 
            })
          }
        );

        // Award XP for viewing content
        await awardXP(1, 'content_viewed');
      }
    } catch (error) {
      console.error('Error recording view:', error);
    }
  }, [user]);

  // Наградить XP
  const awardXP = useCallback(async (amount: number, reason: string) => {
    if (!user) return;

    try {
      // Получаем текущий прогресс
      const progressResponse = await databases.listDocuments(
        DATABASE_ID,
        'user_progress',
        [Query.equal('user_id', user.$id)]
      );

      if (progressResponse.documents.length > 0) {
        const progress = progressResponse.documents[0];
        const newCurrentXP = progress.current_xp + amount;
        const newTotalXP = progress.total_xp + amount;
        
        let newLevel = progress.current_level;
        let newNextLevelXP = progress.next_level_xp;

        // Проверяем, достигнут ли новый уровень
        if (newCurrentXP >= progress.next_level_xp) {
          newLevel += 1;
          newNextLevelXP = newLevel * 100; // Простая формула: уровень * 100 XP
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

        // Если достигнут новый уровень, награждаем достижением
        if (newLevel > progress.current_level) {
          await unlockAchievement(`level_${newLevel}`, `🏆 Уровень ${newLevel}`, `Достигнут ${newLevel} уровень!`, 'level', 50);
        }
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  }, [user]);

  // Разблокировать достижение
  const unlockAchievement = useCallback(async (
    achievementId: string, 
    name: string, 
    description: string, 
    category: string, 
    xpReward: number,
    rarity: string = 'common'
  ) => {
    if (!user) return;

    try {
      // Проверяем, не разблокировано ли уже
      const existing = await databases.listDocuments(
        DATABASE_ID,
        'achievements',
        [
          Query.equal('user_id', user.$id),
          Query.equal('achievement_id', achievementId)
        ]
      );

      if (existing.documents.length === 0) {
        await databases.createDocument(
          DATABASE_ID,
          'achievements',
          ID.unique(),
          {
            user_id: user.$id,
            achievement_id: achievementId,
            achievement_name: name,
            achievement_description: description,
            achievement_icon: '🏆',
            achievement_category: category,
            xp_reward: xpReward,
            rarity: rarity,
            unlocked_at: new Date().toISOString(),
            progress_current: 1,
            progress_required: 1
          }
        );

        // Обновляем счетчик достижений
        const progressResponse = await databases.listDocuments(
          DATABASE_ID,
          'user_progress',
          [Query.equal('user_id', user.$id)]
        );

        if (progressResponse.documents.length > 0) {
          await databases.updateDocument(
            DATABASE_ID,
            'user_progress',
            progressResponse.documents[0].$id,
            {
              achievements_count: progressResponse.documents[0].achievements_count + 1
            }
          );
        }

        // Award bonus XP
        await awardXP(xpReward, `achievement_${achievementId}`);
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }, [user, awardXP]);

  return {
    loading,
    addToFavorites,
    removeFromFavorites,
    checkFavorite,
    toggleLike,
    getLikesCount,
    checkUserLike,
    recordView,
    awardXP,
    unlockAchievement
  };
}; 