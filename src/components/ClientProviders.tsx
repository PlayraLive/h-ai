"use client";

import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider as AuthContextProvider } from '@/contexts/AuthContext';
import { AchievementProvider } from '@/contexts/AchievementContext';
import AuthProvider from '@/components/AuthProvider';
import AuthCallback from '@/components/AuthCallback';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthContextProvider>
          <AchievementProvider>
            <AuthProvider>
              <AuthCallback />
              {children}
            </AuthProvider>
          </AchievementProvider>
        </AuthContextProvider>
      </ToastProvider>
    </ThemeProvider>
  );
} 