'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import { appwriteAuth } from '@/lib/appwrite';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('checkAuth: Checking current user...');
      const result = await appwriteAuth.getCurrentUser();
      console.log('checkAuth result:', result);

      if (result.success) {
        console.log('checkAuth: Setting user:', result.user);
        setUser(result.user);
      } else {
        console.log('checkAuth: No user found');
        setUser(null);
      }
    } catch (err) {
      console.log('checkAuth: No active session', err);
      setUser(null);
    } finally {
      console.log('checkAuth: Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('useAuth.login called with:', { email, password: password ? '***' : 'MISSING' });

      // Validate inputs
      if (!email || !password) {
        const errorMsg = 'Email and password are required';
        console.error('Validation error:', errorMsg);
        error('Login failed', errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log('Calling appwriteAuth.login...');
      const result = await appwriteAuth.login(email, password);
      console.log('appwriteAuth.login result:', result);

      if (result.success) {
        console.log('Login successful, getting current user...');
        const userResult = await appwriteAuth.getCurrentUser();
        console.log('getCurrentUser result:', userResult);

        if (userResult.success) {
          setUser(userResult.user);
          setIsAuthenticated(true);
          success('Welcome back!', 'You have successfully logged in.');
          return { success: true, user: userResult.user };
        } else {
          error('Login failed', 'Could not get user information.');
          return { success: false, error: 'Could not get user information' };
        }
      } else {
        console.error('Login failed:', result.error);
        error('Login failed', result.error || 'Please check your credentials.');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      console.error('Login error in hook:', err);
      error('Login failed', err.message || 'An unexpected error occurred.');
      return { success: false, error: err.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      await appwriteAuth.loginWithGoogle();
      // OAuth redirect will handle the rest
    } catch (err: any) {
      console.error('Google login error:', err);
      error('Google login failed', 'Please try again.');
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string, userType: 'freelancer' | 'client' = 'freelancer') => {
    try {
      const result = await appwriteAuth.register(email, password, name, userType);
      if (result.success) {
        // Set user after successful registration
        setUser(result.user);
        success('Account created!', 'Welcome to AI Freelance Platform!');
        return { success: true, user: result.user };
      } else {
        error('Registration failed', result.error || 'Please try again.');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      error('Registration failed', 'An unexpected error occurred.');
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await appwriteAuth.logout();
      setUser(null);
      success('Logged out', 'You have been logged out successfully.');
      // Redirect to home
      window.location.href = '/en';
    } catch (err) {
      error('Logout failed', 'An error occurred while logging out.');
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    loginWithGoogle,
    logout,
    register,
    checkAuth,
  };
}
