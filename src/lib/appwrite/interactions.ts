import { databases, DATABASE_ID, COLLECTIONS, Query, ID } from './database';

export interface Interaction {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  userId: string;
  targetId: string; // ID of the item being interacted with
  targetType: 'reel' | 'portfolio' | 'project' | 'user' | 'comment';
  type: 'view' | 'like' | 'save' | 'follow' | 'comment' | 'share';
  metadata?: string; // JSON string for additional data
  isActive: boolean; // For toggleable interactions like likes/follows
}

export interface Comment {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetId: string;
  targetType: 'reel' | 'portfolio' | 'project';
  content: string;
  parentId?: string; // For nested comments
  likes: number;
  isEdited: boolean;
  editedAt?: string;
}

export interface InteractionStats {
  views: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  followers?: number; // For user profiles
}

export interface UserInteractionState {
  hasLiked: boolean;
  hasSaved: boolean;
  hasFollowed: boolean;
  hasViewed: boolean;
}

export class InteractionsService {
  // Record a view
  static async recordView(userId: string, targetId: string, targetType: string): Promise<void> {
    try {
      // Check if user already viewed this item today
      const today = new Date().toISOString().split('T')[0];
      const existingView = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        [
          Query.equal('userId', userId),
          Query.equal('targetId', targetId),
          Query.equal('type', 'view'),
          Query.greaterThanEqual('$createdAt', `${today}T00:00:00.000Z`)
        ]
      );

      // Only record one view per user per day
      if (existingView.documents.length === 0) {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.REEL_INTERACTIONS,
          ID.unique(),
          {
            userId,
            targetId,
            targetType,
            type: 'view',
            isActive: true,
            metadata: JSON.stringify({ timestamp: new Date().toISOString() })
          }
        );

        // Update view count in target document
        await this.updateTargetStats(targetId, targetType, 'views', 1);
      }
    } catch (error) {
      console.error('Error recording view:', error);
    }
  }

  // Toggle like (like/unlike)
  static async toggleLike(userId: string, targetId: string, targetType: string): Promise<boolean> {
    try {
      // Check if user already liked this item
      const existingLike = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        [
          Query.equal('userId', userId),
          Query.equal('targetId', targetId),
          Query.equal('type', 'like'),
          Query.equal('isActive', true)
        ]
      );

      let isLiked = false;

      if (existingLike.documents.length > 0) {
        // Unlike - deactivate the like
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.REEL_INTERACTIONS,
          existingLike.documents[0].$id,
          { isActive: false }
        );
        await this.updateTargetStats(targetId, targetType, 'likes', -1);
        isLiked = false;
      } else {
        // Check for deactivated like to reactivate
        const deactivatedLike = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.REEL_INTERACTIONS,
          [
            Query.equal('userId', userId),
            Query.equal('targetId', targetId),
            Query.equal('type', 'like'),
            Query.equal('isActive', false)
          ]
        );

        if (deactivatedLike.documents.length > 0) {
          // Reactivate existing like
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.REEL_INTERACTIONS,
            deactivatedLike.documents[0].$id,
            { isActive: true }
          );
        } else {
          // Create new like
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.REEL_INTERACTIONS,
            ID.unique(),
            {
              userId,
              targetId,
              targetType,
              type: 'like',
              isActive: true,
              metadata: JSON.stringify({ timestamp: new Date().toISOString() })
            }
          );
        }
        await this.updateTargetStats(targetId, targetType, 'likes', 1);
        isLiked = true;
      }

      return isLiked;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw new Error('Failed to toggle like');
    }
  }

  // Toggle save (save/unsave)
  static async toggleSave(userId: string, targetId: string, targetType: string): Promise<boolean> {
    try {
      const existingSave = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        [
          Query.equal('userId', userId),
          Query.equal('targetId', targetId),
          Query.equal('type', 'save'),
          Query.equal('isActive', true)
        ]
      );

      let isSaved = false;

      if (existingSave.documents.length > 0) {
        // Unsave
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.REEL_INTERACTIONS,
          existingSave.documents[0].$id,
          { isActive: false }
        );
        isSaved = false;
      } else {
        // Check for deactivated save
        const deactivatedSave = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.REEL_INTERACTIONS,
          [
            Query.equal('userId', userId),
            Query.equal('targetId', targetId),
            Query.equal('type', 'save'),
            Query.equal('isActive', false)
          ]
        );

        if (deactivatedSave.documents.length > 0) {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.REEL_INTERACTIONS,
            deactivatedSave.documents[0].$id,
            { isActive: true }
          );
        } else {
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.REEL_INTERACTIONS,
            ID.unique(),
            {
              userId,
              targetId,
              targetType,
              type: 'save',
              isActive: true,
              metadata: JSON.stringify({ timestamp: new Date().toISOString() })
            }
          );
        }
        isSaved = true;
      }

      return isSaved;
    } catch (error) {
      console.error('Error toggling save:', error);
      throw new Error('Failed to toggle save');
    }
  }

  // Follow/Unfollow user
  static async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
    try {
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
      }

      const existingFollow = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        [
          Query.equal('userId', followerId),
          Query.equal('targetId', followingId),
          Query.equal('type', 'follow'),
          Query.equal('isActive', true)
        ]
      );

      let isFollowing = false;

      if (existingFollow.documents.length > 0) {
        // Unfollow
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.REEL_INTERACTIONS,
          existingFollow.documents[0].$id,
          { isActive: false }
        );
        isFollowing = false;
      } else {
        // Check for deactivated follow
        const deactivatedFollow = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.REEL_INTERACTIONS,
          [
            Query.equal('userId', followerId),
            Query.equal('targetId', followingId),
            Query.equal('type', 'follow'),
            Query.equal('isActive', false)
          ]
        );

        if (deactivatedFollow.documents.length > 0) {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.REEL_INTERACTIONS,
            deactivatedFollow.documents[0].$id,
            { isActive: true }
          );
        } else {
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.REEL_INTERACTIONS,
            ID.unique(),
            {
              userId: followerId,
              targetId: followingId,
              targetType: 'user',
              type: 'follow',
              isActive: true,
              metadata: JSON.stringify({ timestamp: new Date().toISOString() })
            }
          );
        }
        isFollowing = true;
      }

      return isFollowing;
    } catch (error) {
      console.error('Error toggling follow:', error);
      throw new Error('Failed to toggle follow');
    }
  }

  // Add comment
  static async addComment(
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    targetId: string,
    targetType: string,
    content: string,
    parentId?: string
  ): Promise<Comment> {
    try {
      const comment = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES, // Using messages collection for comments
        ID.unique(),
        {
          userId,
          userName,
          userAvatar: userAvatar || '',
          targetId,
          targetType,
          content,
          parentId: parentId || '',
          likes: 0,
          isEdited: false,
          type: 'comment'
        }
      );

      // Record comment interaction
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        ID.unique(),
        {
          userId,
          targetId,
          targetType,
          type: 'comment',
          isActive: true,
          metadata: JSON.stringify({ commentId: comment.$id })
        }
      );

      // Update comment count in target
      await this.updateTargetStats(targetId, targetType, 'comments', 1);

      return comment as Comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  // Get comments for target
  static async getComments(targetId: string, targetType: string, limit: number = 20): Promise<Comment[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [
          Query.equal('targetId', targetId),
          Query.equal('targetType', targetType),
          Query.equal('type', 'comment'),
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );

      return response.documents as Comment[];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  // Get interaction stats for target
  static async getInteractionStats(targetId: string, targetType: string): Promise<InteractionStats> {
    try {
      // Get all interactions for this target
      const interactions = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        [
          Query.equal('targetId', targetId),
          Query.equal('targetType', targetType),
          Query.equal('isActive', true)
        ]
      );

      const stats: InteractionStats = {
        views: 0,
        likes: 0,
        comments: 0,
        saves: 0,
        shares: 0
      };

      interactions.documents.forEach((interaction: any) => {
        switch (interaction.type) {
          case 'view':
            stats.views++;
            break;
          case 'like':
            stats.likes++;
            break;
          case 'comment':
            stats.comments++;
            break;
          case 'save':
            stats.saves++;
            break;
          case 'share':
            stats.shares++;
            break;
        }
      });

      // For user profiles, get follower count
      if (targetType === 'user') {
        const followers = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.REEL_INTERACTIONS,
          [
            Query.equal('targetId', targetId),
            Query.equal('type', 'follow'),
            Query.equal('isActive', true)
          ]
        );
        stats.followers = followers.documents.length;
      }

      return stats;
    } catch (error) {
      console.error('Error getting interaction stats:', error);
      return {
        views: 0,
        likes: 0,
        comments: 0,
        saves: 0,
        shares: 0
      };
    }
  }

  // Get user's interaction state with target
  static async getUserInteractionState(userId: string, targetId: string, targetType: string): Promise<UserInteractionState> {
    try {
      const interactions = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        [
          Query.equal('userId', userId),
          Query.equal('targetId', targetId),
          Query.equal('targetType', targetType),
          Query.equal('isActive', true)
        ]
      );

      const state: UserInteractionState = {
        hasLiked: false,
        hasSaved: false,
        hasFollowed: false,
        hasViewed: false
      };

      interactions.documents.forEach((interaction: any) => {
        switch (interaction.type) {
          case 'like':
            state.hasLiked = true;
            break;
          case 'save':
            state.hasSaved = true;
            break;
          case 'follow':
            state.hasFollowed = true;
            break;
          case 'view':
            state.hasViewed = true;
            break;
        }
      });

      return state;
    } catch (error) {
      console.error('Error getting user interaction state:', error);
      return {
        hasLiked: false,
        hasSaved: false,
        hasFollowed: false,
        hasViewed: false
      };
    }
  }

  // Get user's saved items
  static async getUserSavedItems(userId: string, targetType?: string, limit: number = 20): Promise<any[]> {
    try {
      const queries = [
        Query.equal('userId', userId),
        Query.equal('type', 'save'),
        Query.equal('isActive', true),
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ];

      if (targetType) {
        queries.push(Query.equal('targetType', targetType));
      }

      const savedInteractions = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        queries
      );

      return savedInteractions.documents;
    } catch (error) {
      console.error('Error getting saved items:', error);
      return [];
    }
  }

  // Get user's followers
  static async getUserFollowers(userId: string, limit: number = 50): Promise<string[]> {
    try {
      const followers = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        [
          Query.equal('targetId', userId),
          Query.equal('type', 'follow'),
          Query.equal('isActive', true),
          Query.limit(limit)
        ]
      );

      return followers.documents.map((doc: any) => doc.userId);
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  }

  // Get user's following
  static async getUserFollowing(userId: string, limit: number = 50): Promise<string[]> {
    try {
      const following = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        [
          Query.equal('userId', userId),
          Query.equal('type', 'follow'),
          Query.equal('isActive', true),
          Query.limit(limit)
        ]
      );

      return following.documents.map((doc: any) => doc.targetId);
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  }

  // Record share
  static async recordShare(userId: string, targetId: string, targetType: string, platform?: string): Promise<void> {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        ID.unique(),
        {
          userId,
          targetId,
          targetType,
          type: 'share',
          isActive: true,
          metadata: JSON.stringify({
            platform: platform || 'unknown',
            timestamp: new Date().toISOString()
          })
        }
      );

      // Update share count in target
      await this.updateTargetStats(targetId, targetType, 'shares', 1);
    } catch (error) {
      console.error('Error recording share:', error);
    }
  }

  // Update target document stats
  private static async updateTargetStats(targetId: string, targetType: string, statType: string, increment: number): Promise<void> {
    try {
      let collectionId = '';

      switch (targetType) {
        case 'reel':
          collectionId = COLLECTIONS.REELS;
          break;
        case 'portfolio':
          collectionId = COLLECTIONS.PORTFOLIO;
          break;
        case 'project':
          collectionId = COLLECTIONS.PROJECTS;
          break;
        case 'user':
          collectionId = COLLECTIONS.USERS;
          break;
        default:
          return;
      }

      // Get current document
      const currentDoc = await databases.getDocument(DATABASE_ID, collectionId, targetId);
      const currentValue = currentDoc[statType] || 0;
      const newValue = Math.max(0, currentValue + increment);

      // Update the stat
      await databases.updateDocument(DATABASE_ID, collectionId, targetId, {
        [statType]: newValue
      });
    } catch (error) {
      console.error('Error updating target stats:', error);
    }
  }

  // Get trending content based on recent interactions
  static async getTrendingContent(targetType: string, timeframe: 'day' | 'week' | 'month' = 'week', limit: number = 10): Promise<any[]> {
    try {
      const now = new Date();
      let startDate = new Date();

      switch (timeframe) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      // Get interactions within timeframe
      const interactions = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        [
          Query.equal('targetType', targetType),
          Query.equal('isActive', true),
          Query.greaterThanEqual('$createdAt', startDate.toISOString()),
          Query.orderDesc('$createdAt')
        ]
      );

      // Count interactions per target
      const targetCounts: { [key: string]: number } = {};

      interactions.documents.forEach((interaction: any) => {
        const targetId = interaction.targetId;
        // Weight different interaction types
        let weight = 1;
        switch (interaction.type) {
          case 'like':
            weight = 3;
            break;
          case 'comment':
            weight = 5;
            break;
          case 'save':
            weight = 4;
            break;
          case 'share':
            weight = 6;
            break;
          case 'view':
            weight = 1;
            break;
        }

        targetCounts[targetId] = (targetCounts[targetId] || 0) + weight;
      });

      // Sort by interaction count and get top items
      const sortedTargets = Object.entries(targetCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([targetId]) => targetId);

      return sortedTargets;
    } catch (error) {
      console.error('Error getting trending content:', error);
      return [];
    }
  }

  // Clean up old interactions (for performance)
  static async cleanupOldInteractions(olderThanDays: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const oldInteractions = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        [
          Query.lessThan('$createdAt', cutoffDate.toISOString()),
          Query.equal('type', 'view') // Only clean up views, keep likes/follows/etc
        ]
      );

      // Delete old view interactions
      for (const interaction of oldInteractions.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.REEL_INTERACTIONS,
          interaction.$id
        );
      }
    } catch (error) {
      console.error('Error cleaning up old interactions:', error);
    }
  }
}

export default InteractionsService;
