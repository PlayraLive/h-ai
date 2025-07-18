'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { account } from '@/lib/appwrite';
import { authService } from '@/services/authService';

export default function AuthDebugPage() {
  const { user, isAuthenticated, initializing } = useAuthContext();
  const [appwriteUser, setAppwriteUser] = useState<any>(null);
  const [appwriteError, setAppwriteError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('Component mounted');
    addLog(`Auth Context: authenticated=${isAuthenticated}, initializing=${initializing}, user=${user ? user.name || user.email : 'null'}`);
  }, [user, isAuthenticated, initializing]);

  const checkAppwriteDirectly = async () => {
    addLog('Checking Appwrite session directly...');
    try {
      const user = await account.get();
      setAppwriteUser(user);
      setAppwriteError('');
      addLog(`✅ Appwrite session found: ${user.name || user.email}`);
      addLog(`User ID: ${user.$id}`);
    } catch (error: any) {
      setAppwriteUser(null);
      setAppwriteError(error.message);
      addLog(`❌ No Appwrite session: ${error.message}`);
    }
  };

  const forceAuthUpdate = async () => {
    addLog('Force updating auth state...');
    try {
      const user = await account.get();
      authService.setAuthenticated(user);
      addLog('✅ Auth state updated');
      addLog('🔄 Refreshing page...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      addLog(`❌ Failed to update auth: ${error.message}`);
    }
  };

  const clearAuth = () => {
    addLog('Clearing auth state...');
    authService.clearAuthentication();
    addLog('✅ Auth cleared');
  };

  const createTestUser = async () => {
    addLog('Creating test user...');
    try {
      const testEmail = 'test@example.com';
      const testPassword = 'test123456';
      const testName = 'Test User';

      // Try to create account
      const { ID } = await import('appwrite');
      const response = await account.create(ID.unique(), testEmail, testPassword, testName);
      addLog(`✅ Test user created: ${response.name}`);

      // Now login
      const session = await account.createEmailPasswordSession(testEmail, testPassword);
      addLog('✅ Logged in as test user');
      addLog(`Session ID: ${session.$id}`);

      // Wait a bit for session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update auth state - use session data instead of account.get()
      const userData = {
        $id: response.$id,
        name: response.name,
        email: response.email,
        emailVerification: response.emailVerification,
        $createdAt: response.$createdAt
      };

      authService.setAuthenticated(userData);
      addLog('✅ Auth state updated with user data');
      addLog('🔄 Refreshing page in 2 seconds...');

      setTimeout(() => window.location.reload(), 2000);

    } catch (error: any) {
      if (error.code === 409) {
        addLog('Test user already exists, trying to login...');
        try {
          const session = await account.createEmailPasswordSession('test@example.com', 'test123456');
          addLog('✅ Logged in as existing test user');
          addLog(`Session ID: ${session.$id}`);

          // Wait a bit for session to be established
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Try to get user data, but handle errors gracefully
          try {
            const user = await account.get();
            authService.setAuthenticated(user);
            addLog('✅ Auth state updated');
          } catch (getUserError: any) {
            addLog(`⚠️ Could not get user data: ${getUserError.message}`);
            // Use session data as fallback
            const userData = {
              $id: session.userId,
              name: 'Test User',
              email: 'test@example.com',
              emailVerification: false,
              $createdAt: new Date().toISOString()
            };
            authService.setAuthenticated(userData);
            addLog('✅ Auth state updated with session data');
          }

          addLog('🔄 Refreshing page in 2 seconds...');
          setTimeout(() => window.location.reload(), 2000);

        } catch (loginError: any) {
          addLog(`❌ Login failed: ${loginError.message}`);
        }
      } else {
        addLog(`❌ Failed to create test user: ${error.message}`);
      }
    }
  };

  const loginWithGoogle = async () => {
    addLog('Attempting Google OAuth...');
    try {
      const { OAuthProvider } = await import('appwrite');
      account.createOAuth2Session(
        OAuthProvider.Google,
        'http://localhost:3000/en/auth/success',
        'http://localhost:3000/en/auth/error'
      );
      addLog('🔄 Redirecting to Google...');
    } catch (error: any) {
      addLog(`❌ Google OAuth failed: ${error.message}`);
    }
  };

  const checkAppwriteConfig = () => {
    addLog('Checking Appwrite configuration...');
    addLog(`Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    addLog(`Project ID: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
    addLog(`Database ID: ${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}`);

    // Check if we can reach Appwrite
    fetch(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT + '/health')
      .then(response => {
        if (response.ok) {
          addLog('✅ Appwrite endpoint is reachable');
        } else {
          addLog(`❌ Appwrite endpoint returned: ${response.status}`);
        }
      })
      .catch(error => {
        addLog(`❌ Cannot reach Appwrite endpoint: ${error.message}`);
      });
  };

  const simulateLogin = () => {
    addLog('Simulating login without Appwrite...');
    const mockUser = {
      $id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com',
      emailVerification: true,
      $createdAt: new Date().toISOString()
    };

    // Manually save to localStorage first
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('isAuthenticated', 'true');
    addLog('✅ Saved to localStorage');

    authService.setAuthenticated(mockUser);
    addLog('✅ Mock user authenticated');

    // Check if it was saved
    const savedUser = localStorage.getItem('user');
    const savedAuth = localStorage.getItem('isAuthenticated');
    addLog(`localStorage check: user=${savedUser ? 'exists' : 'null'}, auth=${savedAuth}`);

    addLog('🔄 Refreshing page in 2 seconds...');
    setTimeout(() => window.location.reload(), 2000);
  };

  const checkLocalStorage = () => {
    addLog('Checking localStorage contents...');
    const savedUser = localStorage.getItem('user');
    const savedAuth = localStorage.getItem('isAuthenticated');

    addLog(`localStorage user: ${savedUser || 'null'}`);
    addLog(`localStorage isAuthenticated: ${savedAuth || 'null'}`);

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        addLog(`Parsed user: ${user.name} (${user.email})`);

        // Try to restore auth state
        authService.setAuthenticated(user);
        addLog('✅ Restored auth state from localStorage');
      } catch (e) {
        addLog('❌ Failed to parse saved user');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Auth Debug Page</h1>
        
        {/* Auth Context State */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Auth Context State</h2>
          <div className="space-y-2 text-sm">
            <div className="text-gray-300">
              <strong>Authenticated:</strong> <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated ? 'Yes' : 'No'}</span>
            </div>
            <div className="text-gray-300">
              <strong>Initializing:</strong> <span className={initializing ? 'text-yellow-400' : 'text-gray-400'}>{initializing ? 'Yes' : 'No'}</span>
            </div>
            <div className="text-gray-300">
              <strong>User:</strong> {user ? (
                <div className="ml-4 mt-2 text-green-400">
                  <div>Name: {user.name}</div>
                  <div>Email: {user.email}</div>
                  <div>ID: {user.$id}</div>
                </div>
              ) : (
                <span className="text-red-400">null</span>
              )}
            </div>
          </div>
        </div>

        {/* Appwrite Direct Check */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Appwrite Direct Check</h2>
          <button 
            onClick={checkAppwriteDirectly}
            className="btn-primary mb-4"
          >
            Check Appwrite Session
          </button>
          
          {appwriteUser && (
            <div className="text-green-400 text-sm">
              <div>✅ Appwrite User Found:</div>
              <div>Name: {appwriteUser.name}</div>
              <div>Email: {appwriteUser.email}</div>
              <div>ID: {appwriteUser.$id}</div>
            </div>
          )}
          
          {appwriteError && (
            <div className="text-red-400 text-sm">
              ❌ Appwrite Error: {appwriteError}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
          <div className="grid grid-cols-3 gap-4">
            <button onClick={forceAuthUpdate} className="btn-primary">
              Force Auth Update
            </button>
            <button onClick={clearAuth} className="btn-secondary">
              Clear Auth
            </button>
            <button onClick={createTestUser} className="btn-primary">
              Create/Login Test User
            </button>
            <button onClick={loginWithGoogle} className="btn-primary">
              Login with Google
            </button>
            <button onClick={checkAppwriteConfig} className="btn-secondary">
              Check Appwrite Config
            </button>
            <button onClick={checkLocalStorage} className="btn-secondary">
              Check localStorage
            </button>
            <button onClick={simulateLogin} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors col-span-3">
              🎯 Simulate Login (Mock)
            </button>
          </div>
        </div>

        {/* Debug Logs */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Logs</h2>
          <div className="bg-gray-900 rounded p-4 h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-xs text-gray-400 font-mono mb-1">
                {log}
              </div>
            ))}
          </div>
          <button 
            onClick={() => setLogs([])}
            className="btn-secondary mt-4"
          >
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  );
}
