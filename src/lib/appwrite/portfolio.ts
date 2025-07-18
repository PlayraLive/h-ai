import {
  databases,
  DATABASE_ID,
  createPublicReadPermissions,
  createPermissions,
  Query,
  ID
} from './database';
import { account } from '../appwrite';

// Portfolio Collections
export const PORTFOLIO_COLLECTIONS = {
  PORTFOLIO_ITEMS: 'portfolio_items',
  PORTFOLIO_RATINGS: 'portfolio_ratings', 
  PORTFOLIO_COMMENTS: 'portfolio_comments',
  USER_ACHIEVEMENTS: 'user_achievements',
  AI_SERVICES: 'ai_services',
  PORTFOLIO_ANALYTICS: 'portfolio_analytics'
};

// AI Services and Tools
export interface AIService {
  $id?: string;
  name: string;
  category: 'image' | 'text' | 'code' | 'audio' | 'video' | 'design' | 'other';
  description?: string;
  website?: string;
  icon?: string;
  popular: boolean;
}

// Portfolio Item (NFT-ready structure)
export interface PortfolioItem {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  
  // Basic Info
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  
  // Media
  images: string[]; // Array of image URLs
  thumbnailUrl: string;
  videoUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  
  // AI & Tech Stack
  aiServices: string[]; // AI services used
  skills: string[]; // Technical skills
  tools: string[]; // Design/dev tools
  
  // Metadata
  userId: string;
  userName: string;
  userAvatar?: string;
  
  // Engagement
  likesCount: number;
  viewsCount: number;
  commentsCount: number;
  sharesCount: number;
  
  // Rating
  averageRating: number;
  ratingsCount: number;
  
  // Status
  status: 'draft' | 'published' | 'featured' | 'archived';
  featured: boolean;
  
  // NFT Preparation
  nftMetadata?: {
    tokenId?: string;
    contractAddress?: string;
    blockchain?: string;
    mintedAt?: string;
    royalties?: number;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  
  // Analytics
  createdAt: string;
  publishedAt?: string;
  lastViewedAt?: string;
  
  // Tags for discovery
  tags: string[];
}

// Portfolio Rating/Review
export interface PortfolioRating {
  $id?: string;
  $createdAt?: string;
  portfolioItemId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5 stars
  comment?: string;
  helpful: number; // helpful votes
  notHelpful: number;
}

// Portfolio Comment
export interface PortfolioComment {
  $id?: string;
  $createdAt?: string;
  portfolioItemId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  parentCommentId?: string; // For replies
  likesCount: number;
  repliesCount: number;
}

// User Achievement System
export interface UserAchievement {
  $id?: string;
  $createdAt?: string;
  userId: string;
  achievementType: 'portfolio' | 'rating' | 'views' | 'likes' | 'featured' | 'nft' | 'streak';
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt: string;
}

// Portfolio Analytics
export interface PortfolioAnalytics {
  $id?: string;
  $createdAt?: string;
  portfolioItemId: string;
  userId: string;
  eventType: 'view' | 'like' | 'comment' | 'share' | 'download';
  metadata?: {
    referrer?: string;
    country?: string;
    device?: string;
    source?: string;
  };
}

// Portfolio Service Class
export class PortfolioService {
  
  // Create portfolio item
  static async createPortfolioItem(
    itemData: Omit<PortfolioItem, '$id' | '$createdAt' | '$updatedAt'>,
    userId: string
  ): Promise<PortfolioItem> {
    try {
      // Check if user is authenticated
      try {
        const currentUser = await account.get();
        console.log('Current authenticated user:', currentUser);

        if (currentUser.$id !== userId) {
          throw new Error('User ID mismatch. Please log in again.');
        }
      } catch (authError) {
        console.error('Authentication error:', authError);
        throw new Error('User not authenticated. Please log in first.');
      }

      console.log('Creating portfolio item with data:', itemData);

      const item = await databases.createDocument(
        DATABASE_ID,
        PORTFOLIO_COLLECTIONS.PORTFOLIO_ITEMS,
        ID.unique(),
        {
          ...itemData,
          userId,
          likesCount: 0,
          viewsCount: 0,
          commentsCount: 0,
          sharesCount: 0,
          averageRating: 0,
          ratingsCount: 0,
          createdAt: new Date().toISOString(),
          status: 'published'
        },
        createPublicReadPermissions(userId)
      );

      return item as PortfolioItem;
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      throw new Error('Failed to create portfolio item');
    }
  }

  // Get portfolio items by user ID (alias for getUserPortfolio)
  static async getPortfolioByUser(userId: string): Promise<PortfolioItem[]> {
    return this.getUserPortfolio(userId, 50, 0);
  }

  // Get user portfolio
  static async getUserPortfolio(userId: string, limit = 20, offset = 0): Promise<PortfolioItem[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        PORTFOLIO_COLLECTIONS.PORTFOLIO_ITEMS,
        [
          Query.equal('userId', userId),
          Query.equal('status', 'published'),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      return response.documents as PortfolioItem[];
    } catch (error) {
      console.error('Error fetching user portfolio:', error);
      throw new Error('Failed to fetch portfolio');
    }
  }

  // Get featured portfolio items
  static async getFeaturedPortfolio(limit = 12): Promise<PortfolioItem[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        PORTFOLIO_COLLECTIONS.PORTFOLIO_ITEMS,
        [
          Query.equal('featured', true),
          Query.equal('status', 'published'),
          Query.orderDesc('likesCount'),
          Query.limit(limit)
        ]
      );

      return response.documents as PortfolioItem[];
    } catch (error) {
      console.error('Error fetching featured portfolio:', error);
      throw new Error('Failed to fetch featured portfolio');
    }
  }

  // Search portfolio items
  static async searchPortfolio(
    searchQuery?: string,
    category?: string,
    skills?: string[],
    aiServices?: string[],
    limit = 20,
    offset = 0
  ): Promise<PortfolioItem[]> {
    try {
      const queries = [
        Query.equal('status', 'published'),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset)
      ];

      if (category) {
        queries.push(Query.equal('category', category));
      }

      if (skills && skills.length > 0) {
        queries.push(Query.contains('skills', skills));
      }

      if (aiServices && aiServices.length > 0) {
        queries.push(Query.contains('aiServices', aiServices));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        PORTFOLIO_COLLECTIONS.PORTFOLIO_ITEMS,
        queries
      );

      return response.documents as PortfolioItem[];
    } catch (error) {
      console.error('Error searching portfolio:', error);
      throw new Error('Failed to search portfolio');
    }
  }

  // Like portfolio item
  static async likePortfolioItem(itemId: string, userId: string): Promise<void> {
    try {
      // Get current item
      const item = await databases.getDocument(
        DATABASE_ID,
        PORTFOLIO_COLLECTIONS.PORTFOLIO_ITEMS,
        itemId
      ) as PortfolioItem;

      // Update likes count
      await databases.updateDocument(
        DATABASE_ID,
        PORTFOLIO_COLLECTIONS.PORTFOLIO_ITEMS,
        itemId,
        {
          likesCount: item.likesCount + 1
        }
      );

      // Track analytics
      await this.trackAnalytics(itemId, userId, 'like');
    } catch (error) {
      console.error('Error liking portfolio item:', error);
      throw new Error('Failed to like item');
    }
  }

  // Track analytics
  static async trackAnalytics(
    portfolioItemId: string, 
    userId: string, 
    eventType: 'view' | 'like' | 'comment' | 'share'
  ): Promise<void> {
    try {
      await databases.createDocument(
        DATABASE_ID,
        PORTFOLIO_COLLECTIONS.PORTFOLIO_ANALYTICS,
        ID.unique(),
        {
          portfolioItemId,
          userId,
          eventType,
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : ''
          }
        }
      );
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }
}

export { Query, ID };
