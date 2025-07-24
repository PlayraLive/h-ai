import { Client, Account, Databases, Storage, Functions, ID, Query, OAuthProvider, Permission, Role } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Collection IDs - Organized by functionality
export const COLLECTIONS = {
  // Core Collections
  USERS: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
  JOBS: process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
  PROJECTS: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!,
  PROPOSALS: process.env.NEXT_PUBLIC_APPWRITE_PROPOSALS_COLLECTION_ID!,

  // Communication Collections
  MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
  CONVERSATIONS: process.env.NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION_ID!,
  NOTIFICATIONS: process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,

  // Financial Collections
  PAYMENTS: process.env.NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID!,
  MILESTONES: process.env.NEXT_PUBLIC_APPWRITE_MILESTONES_COLLECTION_ID!,
  INVOICES: process.env.NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID!,
  TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,

  // Review & Rating Collections
  REVIEWS: process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID!,
  RATINGS: process.env.NEXT_PUBLIC_APPWRITE_RATINGS_COLLECTION_ID!,
  TESTIMONIALS: process.env.NEXT_PUBLIC_APPWRITE_TESTIMONIALS_COLLECTION_ID!,

  // Portfolio & Skills Collections
  PORTFOLIO: process.env.NEXT_PUBLIC_APPWRITE_PORTFOLIO_COLLECTION_ID!,
  SKILLS: process.env.NEXT_PUBLIC_APPWRITE_SKILLS_COLLECTION_ID!,
  CATEGORIES: process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!,
  CERTIFICATIONS: process.env.NEXT_PUBLIC_APPWRITE_CERTIFICATIONS_COLLECTION_ID!,

  // Support & Moderation Collections
  DISPUTES: process.env.NEXT_PUBLIC_APPWRITE_DISPUTES_COLLECTION_ID!,
  SUPPORT_TICKETS: process.env.NEXT_PUBLIC_APPWRITE_SUPPORT_TICKETS_COLLECTION_ID!,
  REPORTS: process.env.NEXT_PUBLIC_APPWRITE_REPORTS_COLLECTION_ID!,

  // Content Collections
  BLOG_POSTS: process.env.NEXT_PUBLIC_APPWRITE_BLOG_POSTS_COLLECTION_ID!,
  FAQS: process.env.NEXT_PUBLIC_APPWRITE_FAQS_COLLECTION_ID!,

  // AI Specialists Collections
  AI_SPECIALISTS: process.env.NEXT_PUBLIC_APPWRITE_AI_SPECIALISTS_COLLECTION_ID!,
  AI_ORDERS: process.env.NEXT_PUBLIC_APPWRITE_AI_ORDERS_COLLECTION_ID!,
  AI_SUBSCRIPTIONS: process.env.NEXT_PUBLIC_APPWRITE_AI_SUBSCRIPTIONS_COLLECTION_ID!,
  AI_MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_AI_MESSAGES_COLLECTION_ID!,
  TUTORIALS: process.env.NEXT_PUBLIC_APPWRITE_TUTORIALS_COLLECTION_ID!,

  // Analytics Collections
  USER_ACTIVITY: process.env.NEXT_PUBLIC_APPWRITE_USER_ACTIVITY_COLLECTION_ID!,
  PROJECT_ANALYTICS: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ANALYTICS_COLLECTION_ID!,
  PLATFORM_STATS: process.env.NEXT_PUBLIC_APPWRITE_PLATFORM_STATS_COLLECTION_ID!,

  // Admin Panel Collections
  ADMIN_STATS: process.env.NEXT_PUBLIC_APPWRITE_ADMIN_STATS_COLLECTION_ID!,
  PLATFORM_METRICS: process.env.NEXT_PUBLIC_APPWRITE_PLATFORM_METRICS_COLLECTION_ID!,
  REVENUE_TRACKING: process.env.NEXT_PUBLIC_APPWRITE_REVENUE_TRACKING_COLLECTION_ID!,
};

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// Individual collection exports for backward compatibility
export const JOBS_COLLECTION_ID = COLLECTIONS.JOBS;
export const PROPOSALS_COLLECTION_ID = COLLECTIONS.PROPOSALS;

// Auth service
export class AppwriteAuth {
  // Register with email and password
  async register(email: string, password: string, name: string) {
    try {
      const user = await account.create(ID.unique(), email, password, name);

      // Create user profile in database
      try {
        await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
          user.$id,
          {
            email: user.email,
            name: user.name,
            avatar: null,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        );
      } catch (dbError) {
        console.warn('Failed to create user profile in database:', dbError);
      }

      return { success: true, user };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  // Login with email and password
  async login(email: string, password: string) {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      return { success: true, session };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Login with Google OAuth
  async loginWithGoogle() {
    try {
      console.log('Starting Google OAuth...');
      const currentUrl = window.location.origin;
      const successUrl = `${currentUrl}/en/auth/success`;
      const failureUrl = `${currentUrl}/en/auth/error`;

      console.log('OAuth URLs:', { successUrl, failureUrl });
      console.log('OAuthProvider.Google:', OAuthProvider.Google);

      // Проверяем, что account инициализирован
      console.log('Account client:', account);

      // createOAuth2Session не возвращает Promise, а просто перенаправляет
      account.createOAuth2Session(
        OAuthProvider.Google,
        successUrl,
        failureUrl,
        ['openid', 'email', 'profile'] // Добавляем необходимые scopes
      );

      console.log('OAuth redirect initiated');
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        code: error.code
      });
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const user = await account.get();
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Logout
  async logout() {
    try {
      await account.deleteSession('current');
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const appwriteAuth = new AppwriteAuth();

export { client, ID, Query, Permission, Role };

// Storage Bucket IDs (for future use)
export const PROFILE_IMAGES_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILE_IMAGES_BUCKET_ID || '';
export const PORTFOLIO_IMAGES_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_PORTFOLIO_IMAGES_BUCKET_ID || '';
export const JOB_ATTACHMENTS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_JOB_ATTACHMENTS_BUCKET_ID || '';
export const MESSAGE_ATTACHMENTS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_MESSAGE_ATTACHMENTS_BUCKET_ID || '';
