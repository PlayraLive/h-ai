import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import type { User } from '@/types';

export class AuthService {
  // Register new user
  async register(email: string, password: string, name: string, userType: 'freelancer' | 'client') {
    try {
      console.log('AuthService.register called with:', { email, name, userType });

      // Create account
      console.log('Creating Appwrite account...');
      const account_response = await account.create(ID.unique(), email, password, name);
      console.log('Account created:', account_response);
      
      // Create user profile in database
      const profile = await createUserProfile(account_response, userType);
      console.log('Profile created in database:', profile);

      const userProfile = profile;

      // Create session
      console.log('Creating email/password session...');
      await account.createEmailPasswordSession(email, password);
      console.log('Session created successfully');

      console.log('Registration completed successfully');
      return { success: true, user: userProfile };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  // Login user
  async login(email: string, password: string) {
    try {
      console.log('AuthService.login called with:', { email, password: password ? '***' : 'MISSING' });

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      await account.createEmailPasswordSession(email, password);
      const user = await this._getCurrentUser();
      return { success: true, user };
    } catch (error: any) {
      console.error('Login error:', error);
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

  // Get current user (internal method)
  async _getCurrentUser() {
    try {
      const account_user = await account.get();

      // TODO: Get user profile from database (temporarily using account data)
      // Return simplified user object for now
      const simpleUser = {
        $id: account_user.$id,
        name: account_user.name,
        email: account_user.email,
        userType: 'freelancer', // Default for now
        verified: account_user.emailVerification,
        online: true,
        rating: 0,
        reviewCount: 0,
        completedJobs: 0,
        totalEarnings: 0,
        successRate: 0,
        responseTime: '24 hours',
        memberSince: account_user.$createdAt,
        skills: [],
        languages: ['English'],
        badges: [],
        portfolioItems: []
      };

      return simpleUser as User;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get current user (public method with success/error wrapper)
  async getCurrentUser() {
    try {
      const user = await this._getCurrentUser();
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
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
        queries.push(Query.equal('verified', filters.verified));
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
