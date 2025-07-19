import { databases, account } from './appwrite';
import { Query } from 'appwrite';
import { AdminStatsService } from './admin-stats';

export interface UserProfile {
  $id: string;
  name: string;
  email: string;
  userType: 'freelancer' | 'client';
  avatar?: string;
  bio?: string;
  skills: string[];
  languages: string[];
  hourlyRate?: number;
  totalEarnings: number;
  completedJobs: number;
  rating: number;
  reviewCount: number;
  responseTime: string;
  successRate: number;
  memberSince: string;
  isOnline: boolean;
  lastSeen: string;
  portfolioItems: number;
  badges: string[];
  verified: boolean;
  location?: string;
  timezone?: string;
  availability: 'available' | 'busy' | 'unavailable';
}

export interface FreelancerStats {
  totalEarnings: number;
  activeProjects: number;
  completedJobs: number;
  clientRating: number;
  portfolioViews: number;
  profileViews: number;
  proposalsSent: number;
  proposalsAccepted: number;
  responseRate: number;
  onTimeDelivery: number;
}

export interface ClientStats {
  totalSpent: number;
  activeJobs: number;
  hiredFreelancers: number;
  successRate: number;
  jobsPosted: number;
  avgProjectBudget: number;
  repeatHires: number;
  avgRatingGiven: number;
}

export class UserProfileService {
  private readonly DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  private readonly USERS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
  private readonly PROJECTS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!;
  private readonly REVIEWS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID!;
  private readonly PORTFOLIO_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_PORTFOLIO_COLLECTION_ID!;
  
  private adminStats = new AdminStatsService();

  // Получить полный профиль пользователя с реальными данными
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Получаем базовые данные пользователя
      const userDoc = await databases.getDocument(
        this.DATABASE_ID,
        this.USERS_COLLECTION,
        userId
      );

      // Получаем статистику пользователя
      const stats = await this.getUserStats(userId, userDoc.userType || 'freelancer');
      
      // Получаем портфолио
      const portfolioCount = await this.getPortfolioCount(userId);
      
      // Получаем рейтинг и отзывы
      const { rating, reviewCount } = await this.getUserRating(userId);

      return {
        $id: userDoc.$id,
        name: userDoc.name,
        email: userDoc.email,
        userType: userDoc.userType || 'freelancer',
        avatar: userDoc.avatar,
        bio: userDoc.bio,
        skills: userDoc.skills || [],
        languages: userDoc.languages || ['English'],
        hourlyRate: userDoc.hourlyRate,
        totalEarnings: stats.totalEarnings || 0,
        completedJobs: stats.completedJobs || 0,
        rating: rating,
        reviewCount: reviewCount,
        responseTime: userDoc.responseTime || '24 hours',
        successRate: stats.successRate || 0,
        memberSince: userDoc.created_at || userDoc.$createdAt,
        isOnline: userDoc.isOnline || false,
        lastSeen: userDoc.lastSeen || new Date().toISOString(),
        portfolioItems: portfolioCount,
        badges: userDoc.badges || [],
        verified: userDoc.verified || false,
        location: userDoc.location,
        timezone: userDoc.timezone,
        availability: userDoc.availability || 'available'
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Получить статистику для фрилансера
  async getFreelancerStats(userId: string): Promise<FreelancerStats> {
    try {
      const [projects, portfolio, reviews] = await Promise.all([
        this.getUserProjects(userId),
        this.getPortfolioStats(userId),
        this.getUserReviews(userId)
      ]);

      const completedProjects = projects.filter(p => p.status === 'completed');
      const totalEarnings = completedProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
      
      return {
        totalEarnings,
        activeProjects: projects.filter(p => p.status === 'in_progress').length,
        completedJobs: completedProjects.length,
        clientRating: reviews.averageRating || 0,
        portfolioViews: portfolio.totalViews || 0,
        profileViews: await this.getProfileViews(userId),
        proposalsSent: await this.getProposalsSent(userId),
        proposalsAccepted: await this.getProposalsAccepted(userId),
        responseRate: 95, // Calculate from messages
        onTimeDelivery: 98 // Calculate from project deadlines
      };
    } catch (error) {
      console.error('Error getting freelancer stats:', error);
      return {
        totalEarnings: 0,
        activeProjects: 0,
        completedJobs: 0,
        clientRating: 0,
        portfolioViews: 0,
        profileViews: 0,
        proposalsSent: 0,
        proposalsAccepted: 0,
        responseRate: 0,
        onTimeDelivery: 0
      };
    }
  }

  // Получить статистику для клиента
  async getClientStats(userId: string): Promise<ClientStats> {
    try {
      const projects = await this.getClientProjects(userId);
      const completedProjects = projects.filter(p => p.status === 'completed');
      const totalSpent = completedProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
      
      return {
        totalSpent,
        activeJobs: projects.filter(p => p.status === 'in_progress').length,
        hiredFreelancers: new Set(projects.map(p => p.freelancer_id)).size,
        successRate: completedProjects.length / Math.max(projects.length, 1) * 100,
        jobsPosted: projects.length,
        avgProjectBudget: totalSpent / Math.max(completedProjects.length, 1),
        repeatHires: await this.getRepeatHires(userId),
        avgRatingGiven: await this.getAverageRatingGiven(userId)
      };
    } catch (error) {
      console.error('Error getting client stats:', error);
      return {
        totalSpent: 0,
        activeJobs: 0,
        hiredFreelancers: 0,
        successRate: 0,
        jobsPosted: 0,
        avgProjectBudget: 0,
        repeatHires: 0,
        avgRatingGiven: 0
      };
    }
  }

  // Обновить профиль пользователя
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      await databases.updateDocument(
        this.DATABASE_ID,
        this.USERS_COLLECTION,
        userId,
        {
          ...updates,
          updated_at: new Date().toISOString()
        }
      );

      // Трекаем обновление профиля
      await this.adminStats.trackUserAction(userId, 'profile_updated', '/dashboard/profile');
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // Получить проекты пользователя (фрилансер)
  private async getUserProjects(userId: string) {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.PROJECTS_COLLECTION,
        [
          Query.equal('freelancer_id', userId),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents;
    } catch (error) {
      return [];
    }
  }

  // Получить проекты клиента
  private async getClientProjects(userId: string) {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.PROJECTS_COLLECTION,
        [
          Query.equal('client_id', userId),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents;
    } catch (error) {
      return [];
    }
  }

  // Получить количество портфолио
  private async getPortfolioCount(userId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.PORTFOLIO_COLLECTION,
        [
          Query.equal('user_id', userId),
          Query.limit(1)
        ]
      );
      return response.total;
    } catch (error) {
      return 0;
    }
  }

  // Получить рейтинг пользователя
  private async getUserRating(userId: string): Promise<{ rating: number; reviewCount: number }> {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.REVIEWS_COLLECTION,
        [
          Query.equal('freelancer_id', userId)
        ]
      );

      if (response.documents.length === 0) {
        return { rating: 0, reviewCount: 0 };
      }

      const totalRating = response.documents.reduce((sum, review) => sum + (review.rating || 0), 0);
      const averageRating = totalRating / response.documents.length;

      return {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: response.documents.length
      };
    } catch (error) {
      return { rating: 0, reviewCount: 0 };
    }
  }

  // Вспомогательные методы для статистики
  private async getUserStats(userId: string, userType: string) {
    if (userType === 'freelancer') {
      return await this.getFreelancerStats(userId);
    } else {
      return await this.getClientStats(userId);
    }
  }

  private async getPortfolioStats(userId: string) {
    // TODO: Implement portfolio analytics
    return { totalViews: 0 };
  }

  private async getProfileViews(userId: string): Promise<number> {
    // TODO: Implement profile view tracking
    return 0;
  }

  private async getProposalsSent(userId: string): Promise<number> {
    // TODO: Implement proposal tracking
    return 0;
  }

  private async getProposalsAccepted(userId: string): Promise<number> {
    // TODO: Implement proposal acceptance tracking
    return 0;
  }

  private async getRepeatHires(userId: string): Promise<number> {
    // TODO: Implement repeat hire tracking
    return 0;
  }

  private async getAverageRatingGiven(userId: string): Promise<number> {
    // TODO: Implement rating given tracking
    return 0;
  }

  private async getUserReviews(userId: string) {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.REVIEWS_COLLECTION,
        [Query.equal('freelancer_id', userId)]
      );

      const totalRating = response.documents.reduce((sum, review) => sum + (review.rating || 0), 0);
      const averageRating = response.documents.length > 0 ? totalRating / response.documents.length : 0;

      return {
        reviews: response.documents,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: response.documents.length
      };
    } catch (error) {
      return { reviews: [], averageRating: 0, totalReviews: 0 };
    }
  }
}
