// Gamification and Achievement System

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  category: 'portfolio' | 'rating' | 'views' | 'likes' | 'featured' | 'nft' | 'streak' | 'social';
  requirements: {
    type: string;
    value: number;
    timeframe?: string; // e.g., 'week', 'month', 'year'
  };
  unlockCondition: (userStats: UserStats) => boolean;
}

export interface UserStats {
  portfolioItems: number;
  totalViews: number;
  totalLikes: number;
  averageRating: number;
  featuredItems: number;
  nftItems: number;
  streakDays: number;
  followers: number;
  following: number;
  commentsReceived: number;
  sharesReceived: number;
  joinedDate: string;
}

export interface UserLevel {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  badge: string;
  color: string;
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Portfolio Achievements
  {
    id: 'first_portfolio',
    title: 'First Steps',
    description: 'Add your first project to portfolio',
    icon: '🎯',
    rarity: 'common',
    points: 10,
    category: 'portfolio',
    requirements: { type: 'portfolio_items', value: 1 },
    unlockCondition: (stats) => stats.portfolioItems >= 1
  },
  {
    id: 'portfolio_collector',
    title: 'Portfolio Collector',
    description: 'Add 10 projects to your portfolio',
    icon: '📚',
    rarity: 'rare',
    points: 50,
    category: 'portfolio',
    requirements: { type: 'portfolio_items', value: 10 },
    unlockCondition: (stats) => stats.portfolioItems >= 10
  },
  {
    id: 'portfolio_master',
    title: 'Portfolio Master',
    description: 'Add 25 projects to your portfolio',
    icon: '👑',
    rarity: 'epic',
    points: 150,
    category: 'portfolio',
    requirements: { type: 'portfolio_items', value: 25 },
    unlockCondition: (stats) => stats.portfolioItems >= 25
  },

  // View Achievements
  {
    id: 'first_thousand',
    title: 'First Thousand',
    description: 'Reach 1,000 total portfolio views',
    icon: '👀',
    rarity: 'common',
    points: 25,
    category: 'views',
    requirements: { type: 'total_views', value: 1000 },
    unlockCondition: (stats) => stats.totalViews >= 1000
  },
  {
    id: 'viral_creator',
    title: 'Viral Creator',
    description: 'Reach 10,000 total portfolio views',
    icon: '🚀',
    rarity: 'rare',
    points: 100,
    category: 'views',
    requirements: { type: 'total_views', value: 10000 },
    unlockCondition: (stats) => stats.totalViews >= 10000
  },
  {
    id: 'view_legend',
    title: 'View Legend',
    description: 'Reach 100,000 total portfolio views',
    icon: '⭐',
    rarity: 'legendary',
    points: 500,
    category: 'views',
    requirements: { type: 'total_views', value: 100000 },
    unlockCondition: (stats) => stats.totalViews >= 100000
  },

  // Like Achievements
  {
    id: 'liked_creator',
    title: 'Liked Creator',
    description: 'Receive 100 total likes',
    icon: '❤️',
    rarity: 'common',
    points: 20,
    category: 'likes',
    requirements: { type: 'total_likes', value: 100 },
    unlockCondition: (stats) => stats.totalLikes >= 100
  },
  {
    id: 'love_magnet',
    title: 'Love Magnet',
    description: 'Receive 1,000 total likes',
    icon: '💖',
    rarity: 'rare',
    points: 75,
    category: 'likes',
    requirements: { type: 'total_likes', value: 1000 },
    unlockCondition: (stats) => stats.totalLikes >= 1000
  },

  // Rating Achievements
  {
    id: 'quality_creator',
    title: 'Quality Creator',
    description: 'Maintain 4.5+ average rating with 10+ ratings',
    icon: '⭐',
    rarity: 'rare',
    points: 100,
    category: 'rating',
    requirements: { type: 'average_rating', value: 4.5 },
    unlockCondition: (stats) => stats.averageRating >= 4.5
  },
  {
    id: 'perfection_seeker',
    title: 'Perfection Seeker',
    description: 'Maintain 4.8+ average rating with 20+ ratings',
    icon: '💎',
    rarity: 'epic',
    points: 200,
    category: 'rating',
    requirements: { type: 'average_rating', value: 4.8 },
    unlockCondition: (stats) => stats.averageRating >= 4.8
  },

  // Featured Achievements
  {
    id: 'featured_debut',
    title: 'Featured Debut',
    description: 'Get your first project featured',
    icon: '🌟',
    rarity: 'rare',
    points: 75,
    category: 'featured',
    requirements: { type: 'featured_items', value: 1 },
    unlockCondition: (stats) => stats.featuredItems >= 1
  },
  {
    id: 'featured_regular',
    title: 'Featured Regular',
    description: 'Get 5 projects featured',
    icon: '✨',
    rarity: 'epic',
    points: 250,
    category: 'featured',
    requirements: { type: 'featured_items', value: 5 },
    unlockCondition: (stats) => stats.featuredItems >= 5
  },

  // Social Achievements
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Get 50 followers',
    icon: '🦋',
    rarity: 'rare',
    points: 100,
    category: 'social',
    requirements: { type: 'followers', value: 50 },
    unlockCondition: (stats) => stats.followers >= 50
  },
  {
    id: 'influencer',
    title: 'Influencer',
    description: 'Get 500 followers',
    icon: '📢',
    rarity: 'epic',
    points: 300,
    category: 'social',
    requirements: { type: 'followers', value: 500 },
    unlockCondition: (stats) => stats.followers >= 500
  },

  // Streak Achievements
  {
    id: 'consistent_creator',
    title: 'Consistent Creator',
    description: 'Upload for 7 days in a row',
    icon: '🔥',
    rarity: 'common',
    points: 30,
    category: 'streak',
    requirements: { type: 'streak_days', value: 7 },
    unlockCondition: (stats) => stats.streakDays >= 7
  },
  {
    id: 'dedication_master',
    title: 'Dedication Master',
    description: 'Upload for 30 days in a row',
    icon: '💪',
    rarity: 'epic',
    points: 200,
    category: 'streak',
    requirements: { type: 'streak_days', value: 30 },
    unlockCondition: (stats) => stats.streakDays >= 30
  },

  // Special Achievements
  {
    id: 'early_adopter',
    title: 'Early Adopter',
    description: 'Join the platform in its first month',
    icon: '🚀',
    rarity: 'legendary',
    points: 1000,
    category: 'social',
    requirements: { type: 'join_date', value: 1 },
    unlockCondition: (stats) => {
      const joinDate = new Date(stats.joinedDate);
      const launchDate = new Date('2024-01-01'); // Platform launch date
      const monthAfterLaunch = new Date(launchDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      return joinDate <= monthAfterLaunch;
    }
  }
];

// User levels
export const USER_LEVELS: UserLevel[] = [
  {
    level: 1,
    title: 'Newcomer',
    minPoints: 0,
    maxPoints: 99,
    benefits: ['Basic portfolio features'],
    badge: '🌱',
    color: 'text-green-400'
  },
  {
    level: 2,
    title: 'Creator',
    minPoints: 100,
    maxPoints: 299,
    benefits: ['Portfolio analytics', 'Custom tags'],
    badge: '🎨',
    color: 'text-blue-400'
  },
  {
    level: 3,
    title: 'Artist',
    minPoints: 300,
    maxPoints: 699,
    benefits: ['Featured submissions', 'Priority support'],
    badge: '🖼️',
    color: 'text-purple-400'
  },
  {
    level: 4,
    title: 'Expert',
    minPoints: 700,
    maxPoints: 1499,
    benefits: ['NFT minting', 'Advanced analytics', 'Beta features'],
    badge: '⭐',
    color: 'text-yellow-400'
  },
  {
    level: 5,
    title: 'Master',
    minPoints: 1500,
    maxPoints: 2999,
    benefits: ['Verified badge', 'Revenue sharing', 'Mentorship program'],
    badge: '👑',
    color: 'text-orange-400'
  },
  {
    level: 6,
    title: 'Legend',
    minPoints: 3000,
    maxPoints: Infinity,
    benefits: ['All features', 'Platform partnership', 'Custom branding'],
    badge: '💎',
    color: 'text-pink-400'
  }
];

// Utility functions
export function calculateUserLevel(totalPoints: number): UserLevel {
  return USER_LEVELS.find(level => 
    totalPoints >= level.minPoints && totalPoints <= level.maxPoints
  ) || USER_LEVELS[0];
}

export function getNextLevel(currentLevel: number): UserLevel | null {
  return USER_LEVELS.find(level => level.level === currentLevel + 1) || null;
}

export function calculateProgress(totalPoints: number, currentLevel: UserLevel): number {
  const pointsInLevel = totalPoints - currentLevel.minPoints;
  const levelRange = currentLevel.maxPoints - currentLevel.minPoints;
  return Math.min((pointsInLevel / levelRange) * 100, 100);
}

export function checkNewAchievements(userStats: UserStats, currentAchievements: string[]): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => 
    !currentAchievements.includes(achievement.id) && 
    achievement.unlockCondition(userStats)
  );
}

export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return 'text-gray-400 bg-gray-100 dark:bg-gray-800';
    case 'rare': return 'text-blue-400 bg-blue-100 dark:bg-blue-900';
    case 'epic': return 'text-purple-400 bg-purple-100 dark:bg-purple-900';
    case 'legendary': return 'text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
    default: return 'text-gray-400 bg-gray-100 dark:bg-gray-800';
  }
}
