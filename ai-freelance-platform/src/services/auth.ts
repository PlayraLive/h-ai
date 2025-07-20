import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import type { User } from '@/types';

export class AuthService {
  // Register new user
  async register(email: string, password: string, name: string, userType: 'freelancer' | 'client') {
    try {
      // Create account
      const account_response = await account.create(ID.unique(), email, password, name);
      
      // Create user profile in database
      const userProfile = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          userId: account_response.$id,
          name,
          email,
          userType,
          verification_status: 'pending',
          online: false,
          rating: 0,
          reviewCount: 0,
          completedJobs: 0,
          totalEarnings: 0,
          successRate: 0,
          responseTime: '24 hours',
          memberSince: new Date().toISOString(),
          skills: [],
          languages: ['English'],
          badges: [],
          portfolioItems: []
        }
      );

      // Create session
      await account.createEmailPasswordSession(email, password);
      
      return { success: true, user: userProfile };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Login user
  async login(email: string, password: string) {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await this.getCurrentUser();
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Logout user
  async logout() {
    try {
      await account.deleteSession('current');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const account_user = await account.get();
      
      // Get user profile from database
      const userProfiles = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('userId', account_user.$id)]
      );

      if (userProfiles.documents.length === 0) {
        throw new Error('User profile not found');
      }

      return userProfiles.documents[0] as User;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Update user profile
  async updateProfile(userId: string, data: Partial<User>) {
    try {
      const updatedUser = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        data
      );
      return { success: true, user: updatedUser };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string) {
    try {
      await account.updatePassword(newPassword, oldPassword);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Send password recovery email
  async forgotPassword(email: string) {
    try {
      await account.createRecovery(email, `${window.location.origin}/reset-password`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Reset password
  async resetPassword(userId: string, secret: string, password: string) {
    try {
      await account.updateRecovery(userId, secret, password);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Verify email
  async verifyEmail(userId: string, secret: string) {
    try {
      await account.updateVerification(userId, secret);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Send verification email
  async sendVerificationEmail() {
    try {
      await account.createVerification(`${window.location.origin}/verify-email`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // OAuth login
  async loginWithOAuth(provider: 'google' | 'github') {
    try {
      account.createOAuth2Session(
        provider,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/auth/failure`
      );
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      await account.get();
      return true;
    } catch {
      return false;
    }
  }

  // Get user by ID
  async getUserById(userId: string) {
    try {
      const user = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      );
      return { success: true, user: user as User };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Search users
  async searchUsers(query: string, filters?: any) {
    try {
      const queries = [Query.search('name', query)];
      
      if (filters?.userType) {
        queries.push(Query.equal('userType', filters.userType));
      }
      
      if (filters?.verified) {
        queries.push(Query.equal('verification_status', 'verified'));
      }

      const users = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        queries
      );
      
      return { success: true, users: users.documents as User[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update user online status
  async updateOnlineStatus(userId: string, online: boolean) {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        { online, lastSeen: new Date().toISOString() }
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
