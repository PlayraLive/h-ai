'use client';

import { useState, useEffect } from 'react';
// import { useToast } from '@/components/Toast';
import { appwriteAuth } from '@/lib/appwrite';
import { account } from '@/lib/appwrite';

export function useAuth() {
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isAuthenticated') === 'true';
    }
    return false;
  });
  // const { success, error } = useToast();
  const success = (title: string, message: string) => console.log('SUCCESS:', title, message);
  const error = (title: string, message: string) => console.error('ERROR:', title, message);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
  }, [user, isAuthenticated]);

  const checkAuth = async () => {
    try {
      console.log('checkAuth: Checking current user...');

      // Проверяем переменные окружения
      if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
          !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
        console.log('checkAuth: Appwrite not configured');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const user = await account.get();
      console.log('checkAuth: User found:', user);

      setUser(user);
      setIsAuthenticated(true);

    } catch (err) {
      console.log('checkAuth: No active session', err);
      setUser(null);
      setIsAuthenticated(false);
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
        // Небольшая задержка чтобы сессия успела установиться
        await new Promise(resolve => setTimeout(resolve, 200));

        const user = await account.get();
        console.log('User data:', user);

        setUser(user);
        setIsAuthenticated(true);
        success('Welcome back!', 'You have successfully logged in.');
        return { success: true, user };
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
      const result = await appwriteAuth.register(email, password, name);
      if (result.success) {
        // Get user after successful registration
        const user = await account.get();
        setUser(user);
        setIsAuthenticated(true);
        success('Account created!', 'Welcome to AI Freelance Platform!');
        return { success: true, user };
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
      setIsAuthenticated(false);
      success('Logged out', 'You have been logged out successfully.');
      // Redirect to home
      window.location.href = '/en';
    } catch (err) {
      error('Logout failed', 'An error occurred while logging out.');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: loading,
    login,
    loginWithGoogle,
    logout,
    register,
    checkAuth,
  };
}
