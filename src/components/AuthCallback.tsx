'use client';

import { useEffect } from 'react';
import { authService } from '@/services/authService';
import { account } from '@/lib/appwrite';
import { MockAuthManager } from '@/utils/mockAuth';

export default function AuthCallback() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthCallback: Checking for active session...');

        // Сначала проверяем, есть ли mock сессия
        if (MockAuthManager.isMockSession()) {
          console.log('AuthCallback: Mock session detected, skipping Appwrite check');
          return; // Не проверяем Appwrite для mock пользователей
        }

        // Проверяем есть ли активная сессия в Appwrite только для реальных пользователей
        const user = await account.get();
        console.log('AuthCallback: Found active session:', user);

        // Принудительно обновляем состояние
        authService.setAuthenticated(user);
        console.log('AuthCallback: State updated with user data');

      } catch (error) {
        console.log('AuthCallback: No active session found');

        // Проверяем, есть ли mock сессия перед очисткой
        if (MockAuthManager.isMockSession()) {
          console.log('AuthCallback: Preserving mock user session');
          return; // Не очищаем состояние для mock пользователей
        }

        // Очищаем состояние только если нет mock пользователя
        authService.clearAuthentication();
      }
    };

    // Проверяем сразу при загрузке
    checkAuth();

    // Также проверяем через небольшую задержку (для OAuth)
    const timeoutId = setTimeout(() => {
      console.log('AuthCallback: Delayed check for OAuth...');
      checkAuth();
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}
