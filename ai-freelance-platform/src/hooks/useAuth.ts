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
      const result = await appwriteAuth.getCurrentUser();
      if (result.success) {
        setUser(result.user);
      }
    } catch (err) {
      console.log('No active session');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await appwriteAuth.login(email, password);
      if (result.success) {
        const userResult = await appwriteAuth.getCurrentUser();
        if (userResult.success) {
          setUser(userResult.user);
        }
        success('Welcome back!', 'You have successfully logged in.');
        return { success: true };
      } else {
        error('Login failed', result.error || 'Please check your credentials.');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      error('Login failed', 'An unexpected error occurred.');
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

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await appwriteAuth.register(email, password, name);
      if (result.success) {
        success('Account created!', 'Please sign in with your new account.');
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
