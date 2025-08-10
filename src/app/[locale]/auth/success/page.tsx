'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { authService } from '@/services/authService';

export default function AuthSuccessPage() {
  const [status, setStatus] = useState('checking');
  const [logs, setLogs] = useState<string[]>([]);
  const [showManualOptions, setShowManualOptions] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
  };

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      addLog('OAuth success page loaded');

      // Логируем URL параметры
      const urlParams = Object.fromEntries(searchParams.entries());
      addLog(`URL params: ${JSON.stringify(urlParams)}`);

      // Логируем текущий URL
      addLog(`Current URL: ${window.location.href}`);
      
      try {
        setStatus('verifying');
        addLog('Checking for active session...');
        
        // Пробуем несколько раз с увеличивающимися задержками
        let user = null;
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts && !user) {
          attempts++;
          const delay = attempts * 2000; // 2s, 4s, 6s, 8s, 10s

          addLog(`Attempt ${attempts}/${maxAttempts} - waiting ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));

          try {
            user = await account.get();
            addLog(`✅ Session found on attempt ${attempts}: ${user.name || user.email}`);
            addLog(`User ID: ${user.$id}`);
            break;
          } catch (error: any) {
            addLog(`❌ Attempt ${attempts} failed: ${error.message}`);
            if (attempts === maxAttempts) {
              throw error;
            }
          }
        }
        
        // Обновляем состояние аутентификации
        authService.setAuthenticated(user);
        addLog('✅ Auth state updated');
        
        setStatus('success');
        addLog('🎉 Authentication successful!');
        
        // Редирект на dashboard через 2 секунды
        setTimeout(() => {
          addLog('Redirecting to dashboard...');
          // Получаем текущую локаль из URL
          const currentLocale = window.location.pathname.split('/')[1] || 'en';
          router.push(`/${currentLocale}/dashboard`);
        }, 2000);
        
      } catch (error: any) {
        addLog(`❌ Error: ${error.message}`);
        addLog(`Error type: ${error.type || 'unknown'}`);
        addLog(`Error code: ${error.code || 'unknown'}`);
        addLog('');
        addLog('🔧 This usually means Google OAuth is not properly configured.');
        addLog('');
        addLog('To fix this:');
        addLog('1. Configure Google OAuth in Appwrite Console');
        addLog('2. Add correct redirect URIs in Google Cloud Console');
        addLog('3. Check that Client ID/Secret are correct');
        addLog('');
        addLog('💡 For now, you can use the "Test User" button to continue testing.');

        setStatus('error');

        // Не перенаправляем автоматически, показываем кнопки выбора
        setTimeout(() => {
          setShowManualOptions(true);
        }, 2000);
      }
    };

    handleOAuthSuccess();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            {status === 'checking' && '🔄 Checking Authentication...'}
            {status === 'verifying' && '🔍 Verifying Session...'}
            {status === 'success' && '✅ Login Successful!'}
            {status === 'error' && '❌ Authentication Failed'}
          </h1>
          
          <p className="text-gray-400">
            {status === 'checking' && 'Please wait while we process your login...'}
            {status === 'verifying' && 'Verifying your Google account...'}
            {status === 'success' && 'Redirecting to dashboard...'}
            {status === 'error' && 'Something went wrong. Redirecting to login...'}
          </p>
        </div>

        {/* Loading spinner */}
        {(status === 'checking' || status === 'verifying') && (
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Success icon */}
        {status === 'success' && (
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Error icon */}
        {status === 'error' && (
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        )}

        {/* Debug logs */}
        <div className="bg-gray-900 rounded p-4 max-h-40 overflow-y-auto mb-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Debug Log:</h3>
          {logs.map((log, index) => (
            <div key={index} className="text-xs text-gray-400 font-mono mb-1">
              {log}
            </div>
          ))}
        </div>

        {/* Manual Options */}
        {showManualOptions && (
          <div className="space-y-3">
            <p className="text-sm text-gray-300 text-center mb-4">
              Choose an option to continue:
            </p>

            <div className="flex flex-col space-y-2">
              <button
                onClick={async () => {
                  try {
                    const { MockAuthManager } = await import('@/utils/mockAuth');
                    await MockAuthManager.loginMockUser();
                    addLog('✅ Test user login successful');
                    setTimeout(() => {
                      // Получаем текущую локаль из URL
                      const currentLocale = window.location.pathname.split('/')[1] || 'en';
                      router.push(`/${currentLocale}/dashboard`);
                    }, 1000);
                  } catch (error) {
                    addLog('❌ Test user login failed');
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Continue with Test User
              </button>

              <button
                onClick={() => router.push('/en/setup-oauth')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📖 Setup Google OAuth
              </button>

              <button
                onClick={() => router.push('/en/login')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Login
              </button>

              <button
                onClick={() => router.push('/')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
