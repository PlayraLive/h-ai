'use client';

import { useEffect } from 'react';
import { authService } from '@/services/authService';

export default function AuthCallback() {
  useEffect(() => {
    // Проверяем аутентификацию после OAuth редиректа
    const checkAuthAfterOAuth = async () => {
      console.log('OAuth redirect detected, force checking auth status...');

      // Принудительно проверяем состояние аутентификации
      await authService.forceCheckAuth();
    };

    // Проверяем если мы пришли с OAuth редиректа
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams = urlParams.has('code') || urlParams.has('state') ||
                          window.location.hash.includes('access_token') ||
                          document.referrer.includes('appwrite') ||
                          window.location.pathname.includes('auth');

    if (hasOAuthParams) {
      checkAuthAfterOAuth();
    }

    // Также проверяем при каждой загрузке страницы
    // на случай если пользователь уже залогинен
    const checkOnLoad = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await authService.checkAuthStatus();
    };

    checkOnLoad();
  }, []);

  return null; // Этот компонент не рендерит ничего
}
