"use client";

import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider as AuthContextProvider } from '@/contexts/AuthContext';
import { AchievementProvider } from '@/contexts/AchievementContext';
import { UserTypeProvider } from '@/contexts/UserTypeContext';
import AuthProvider from '@/components/AuthProvider';
import AuthCallback from '@/components/AuthCallback';
import Web3Provider from '@/providers/Web3Provider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Web3Provider>
      <ThemeProvider>
        <ToastProvider>
          <AuthContextProvider>
            <UserTypeProvider>
              <AchievementProvider>
                <AuthProvider>
                  <AuthCallback />
                  {children}
                </AuthProvider>
              </AchievementProvider>
            </UserTypeProvider>
          </AuthContextProvider>
        </ToastProvider>
      </ThemeProvider>
    </Web3Provider>
  );
} 