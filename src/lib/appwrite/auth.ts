import { account } from '../appwrite';
import { ID } from 'appwrite';

export interface User {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export class AuthService {
  
  // Login with email and password
  static async login(email: string, password: string): Promise<User> {
    try {
      console.log('Attempting to login with:', email);
      
      // Create session
      const session = await account.createEmailPasswordSession(email, password);
      console.log('Session created:', session);
      
      // Get user info
      const user = await account.get();
      console.log('User authenticated:', user);
      
      return {
        $id: user.$id,
        name: user.name,
        email: user.email,
        avatar: user.prefs?.avatar || null,
        createdAt: user.$createdAt
      };
      
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }
  
  // Login as test user
  static async loginAsTestUser(): Promise<User> {
    try {
      return await this.login('test@example.com', 'password123');
    } catch (error) {
      console.log('Test user login failed, trying to create account...');
      
      // Try to create test user account
      try {
        await account.create(
          ID.unique(),
          'test@example.com',
          'password123',
          'Test User'
        );
        
        console.log('Test user created, now logging in...');
        return await this.login('test@example.com', 'password123');
        
      } catch (createError: any) {
        console.error('Failed to create test user:', createError);
        throw new Error(`Failed to authenticate test user: ${createError.message}`);
      }
    }
  }
  
  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const user = await account.get();
      return {
        $id: user.$id,
        name: user.name,
        email: user.email,
        avatar: user.prefs?.avatar || null,
        createdAt: user.$createdAt
      };
    } catch (error) {
      console.log('No authenticated user found');
      return null;
    }
  }
  
  // Logout
  static async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      console.log('User logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(`Logout failed: ${error.message}`);
    }
  }
  
  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      await account.get();
      return true;
    } catch (error) {
      return false;
    }
  }
}
