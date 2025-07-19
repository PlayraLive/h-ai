'use client';

import { useState, useEffect } from 'react';
import { appwriteAuth } from '@/lib/appwrite';
import { account } from '@/lib/appwrite';
import { authService } from '@/services/authService';
import { useToast } from '@/components/Toast';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const { success, error } = useToast();

  // Check if user is admin
  const checkAdminStatus = (userData: any) => {
    const adminEmails = ['admin@h-ai.com', 'sacralprojects8@gmail.com'];
    return adminEmails.includes(userData?.email);
  };
  // Подписываемся на изменения состояния аутентификации
  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setUser(state.user);
      setIsAuthenticated(state.isAuthenticated);
      setLoading(state.isLoading);
      setInitializing(state.isLoading);

      // Check admin status when user changes
      if (state.user) {
        setIsAdmin(checkAdminStatus(state.user));
      } else {
        setIsAdmin(false);
      }
    });

    return unsubscribe;
  }, []);

  const checkAuth = async () => {
    await authService.checkAuthStatus();
  };

  const loginWithGoogle = async () => {
    try {
      authService.setLoading(true);
      await appwriteAuth.loginWithGoogle();
      // OAuth redirect will handle the rest
    } catch (err: any) {
      authService.setLoading(false);
      error('Google login failed', 'Please try again.');
      throw err;
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

      authService.setLoading(true);

      console.log('Calling appwriteAuth.login...');
      const result = await appwriteAuth.login(email, password);
      console.log('appwriteAuth.login result:', result);

      if (result.success) {
        console.log('Login successful, getting current user...');
        // Небольшая задержка чтобы сессия успела установиться
        await new Promise(resolve => setTimeout(resolve, 200));

        const user = await account.get();
        console.log('User data:', user);

        authService.setAuthenticated(user);
        success('Welcome back!', 'You have successfully logged in.');
        return { success: true, user };
      } else {
        console.error('Login failed:', result.error);
        authService.setLoading(false);
        error('Login failed', result.error || 'Please check your credentials.');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      console.error('Login error in hook:', err);
      authService.setLoading(false);
      error('Login failed', err.message || 'An unexpected error occurred.');
      return { success: false, error: err.message };
    }
  };



  const register = async (email: string, password: string, name: string, userType: 'freelancer' | 'client' = 'freelancer') => {
    try {
      authService.setLoading(true);

      const result = await appwriteAuth.register(email, password, name);
      if (result.success) {
        // Get user after successful registration
        const user = await account.get();
        authService.setAuthenticated(user);
        success('Account created!', 'Welcome to AI Freelance Platform!');
        return { success: true, user };
      } else {
        authService.setLoading(false);
        error('Registration failed', result.error || 'Please try again.');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      authService.setLoading(false);
      error('Registration failed', 'An unexpected error occurred.');
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await appwriteAuth.logout();
      authService.clearAuthentication();
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
    initializing,
    login,
    loginWithGoogle,
    logout,
    register,
    checkAuth,
  };
}
