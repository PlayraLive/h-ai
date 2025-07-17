import { Client, Account, Databases, Storage, Functions, ID, Query } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Collection IDs
export const COLLECTIONS = {
  JOBS: process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
  USERS: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
  PROJECTS: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!,
  PROPOSALS: process.env.NEXT_PUBLIC_APPWRITE_PROPOSALS_COLLECTION_ID!,
  MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
  CONVERSATIONS: process.env.NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION_ID!,
  PAYMENTS: process.env.NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID!,
  MILESTONES: process.env.NEXT_PUBLIC_APPWRITE_MILESTONES_COLLECTION_ID!,
  REVIEWS: process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID!,
  NOTIFICATIONS: process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
  DISPUTES: process.env.NEXT_PUBLIC_APPWRITE_DISPUTES_COLLECTION_ID!,
  CATEGORIES: process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!,
  SKILLS: process.env.NEXT_PUBLIC_APPWRITE_SKILLS_COLLECTION_ID!,
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
      await account.createOAuth2Session(
        'google',
        `${window.location.origin}/en/dashboard`,
        `${window.location.origin}/en/auth/error`
      );
    } catch (error: any) {
      console.error('Google login error:', error);
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

export { client, ID };

// Storage Bucket IDs (for future use)
export const PROFILE_IMAGES_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILE_IMAGES_BUCKET_ID || '';
export const PORTFOLIO_IMAGES_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_PORTFOLIO_IMAGES_BUCKET_ID || '';
export const JOB_ATTACHMENTS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_JOB_ATTACHMENTS_BUCKET_ID || '';
export const MESSAGE_ATTACHMENTS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_MESSAGE_ATTACHMENTS_BUCKET_ID || '';
