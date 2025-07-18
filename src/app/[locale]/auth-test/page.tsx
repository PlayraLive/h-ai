'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import Navbar from '@/components/Navbar';

export default function AuthTestPage() {
  const { user, isAuthenticated, initializing } = useAuthContext();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('Component mounted');
    addLog(`Initial state: authenticated=${isAuthenticated}, initializing=${initializing}, user=${user ? user.name || user.email : 'null'}`);

    // Подписываемся на изменения состояния
    const unsubscribe = authService.subscribe((state) => {
      addLog(`State changed: authenticated=${state.isAuthenticated}, loading=${state.isLoading}, user=${state.user ? state.user.name || state.user.email : 'null'}`);
    });

    return unsubscribe;
  }, []);

  const handleForceCheck = async () => {
    addLog('Force checking auth status...');
    await authService.forceCheckAuth();
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Auth Test Page</h1>
          
          {/* Current State */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Auth State</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded p-4">
                <div className="text-sm text-gray-400">Authenticated</div>
                <div className={`text-lg font-semibold ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                  {isAuthenticated ? '✅ Yes' : '❌ No'}
                </div>
              </div>
              
              <div className="bg-gray-700 rounded p-4">
                <div className="text-sm text-gray-400">Initializing</div>
                <div className={`text-lg font-semibold ${initializing ? 'text-yellow-400' : 'text-green-400'}`}>
                  {initializing ? '⏳ Yes' : '✅ No'}
                </div>
              </div>
              
              <div className="bg-gray-700 rounded p-4">
                <div className="text-sm text-gray-400">User</div>
                <div className="text-lg font-semibold text-white">
                  {user ? (user.name || user.email) : 'None'}
                </div>
              </div>
            </div>
          </div>

          {/* User Details */}
          {user && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">User Details</h2>
              <pre className="bg-gray-900 rounded p-4 text-sm text-gray-300 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}

          {/* Controls */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleForceCheck}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Force Check Auth
              </button>
              
              <button
                onClick={handleClearLogs}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Auth Logs</h2>
            <div className="bg-gray-900 rounded p-4 h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center">No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-sm text-gray-300 mb-1 font-mono">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Testing Instructions</h2>
            <ol className="text-gray-300 space-y-2">
              <li>1. Check the current auth state above</li>
              <li>2. Try logging in via Google OAuth on the login page</li>
              <li>3. Return to this page to see if the state updated</li>
              <li>4. Use "Force Check Auth" if needed</li>
              <li>5. Check the logs for debugging information</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
