"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AchievementNotification from '@/components/notifications/AchievementNotification';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface AchievementContextType {
  showAchievement: (achievement: Achievement) => void;
  isShowing: boolean;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

interface AchievementProviderProps {
  children: ReactNode;
}

export const AchievementProvider = ({ children }: AchievementProviderProps) => {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  const showAchievement = useCallback((achievement: Achievement) => {
    if (isVisible) {
      // If an achievement is already showing, queue this one
      setAchievementQueue(prev => [...prev, achievement]);
    } else {
      // Show the achievement immediately
      setCurrentAchievement(achievement);
      setIsVisible(true);
    }
  }, [isVisible]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setCurrentAchievement(null);

    // Show next achievement in queue if any
    setTimeout(() => {
      if (achievementQueue.length > 0) {
        const nextAchievement = achievementQueue[0];
        setAchievementQueue(prev => prev.slice(1));
        setCurrentAchievement(nextAchievement);
        setIsVisible(true);
      }
    }, 500); // Wait a bit before showing next achievement
  }, [achievementQueue]);

  const contextValue: AchievementContextType = {
    showAchievement,
    isShowing: isVisible
  };

  return (
    <AchievementContext.Provider value={contextValue}>
      {children}
      
      {/* Achievement Notification */}
      {currentAchievement && (
        <AchievementNotification
          achievement={currentAchievement}
          isVisible={isVisible}
          onClose={handleClose}
        />
      )}
    </AchievementContext.Provider>
  );
};

export const useAchievement = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievement must be used within an AchievementProvider');
  }
  return context;
};

// Utility hook for triggering achievements with sound effects
export const useAchievementTrigger = () => {
  const { showAchievement } = useAchievement();

  const triggerAchievement = useCallback((achievement: Achievement, playSound = true) => {
    // Play achievement sound if enabled
    if (playSound) {
      try {
        const audio = new Audio('/sounds/achievement.mp3');
        audio.volume = 0.5;
        audio.play().catch(console.error);
      } catch (error) {
        console.error('Error playing achievement sound:', error);
      }
    }

    showAchievement(achievement);
  }, [showAchievement]);

  return { triggerAchievement };
}; 