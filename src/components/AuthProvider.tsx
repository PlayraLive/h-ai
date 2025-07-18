'use client';

import { useEffect } from 'react';
import { authService } from '@/services/authService';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // Автоматически проверяем аутентификацию при загрузке приложения
    authService.checkAuthStatus();
  }, []);

  return <>{children}</>;
}
