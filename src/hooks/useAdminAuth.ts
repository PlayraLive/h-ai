'use client';

import { useState, useEffect } from 'react';
import { appwriteAuth } from '@/lib/appwrite';

interface AdminUser {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface AdminAuthState {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
}

interface AdminAuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export function useAdminAuth(): AdminAuthState & AdminAuthActions {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Проверка аутентификации без использования account API
  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Проверяем что мы на клиентской стороне
      if (typeof window !== 'undefined') {
        // Проверяем есть ли сохраненные данные админа в localStorage
        const savedAdmin = localStorage.getItem('admin_user');
        if (savedAdmin) {
          try {
            const adminData = JSON.parse(savedAdmin);
            setUser(adminData);
            return;
          } catch (e) {
            localStorage.removeItem('admin_user');
          }
        }
      }

      // Если нет сохраненных данных, пользователь не авторизован
      setUser(null);
    } catch (err) {
      console.error('Auth check error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Логин
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Проверяем что это админ email
      const isAdminEmail = email === 'admin@h-ai.com' || email === 'sacralprojects8@gmail.com';
      if (!isAdminEmail) {
        setError('Access denied. Admin credentials required.');
        return { success: false, error: 'Access denied. Admin credentials required.' };
      }

      const result = await appwriteAuth.login(email, password);

      if (result.success) {
        // Создаем объект админа с известными данными
        const adminUser: AdminUser = {
          $id: `admin_${Date.now()}`, // Временный ID
          name: email === 'admin@h-ai.com' ? 'H-AI Admin' : 'Sacral Admin',
          email: email,
          avatar: undefined,
          createdAt: new Date().toISOString()
        };

        // Сохраняем в localStorage для последующих проверок (только на клиенте)
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_user', JSON.stringify(adminUser));
        }

        setUser(adminUser);
        return { success: true };
      } else {
        setError(result.error || 'Login failed');
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Логаут
  const logout = async () => {
    try {
      setLoading(true);
      await appwriteAuth.logout();

      // Очищаем localStorage (только на клиенте)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_user');
      }

      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth
  };
}
