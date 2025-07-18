'use client';

import { useState } from 'react';
import { account } from '@/lib/appwrite';
import { authService } from '@/services/authService';

export default function AuthDebugPanel() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const checkAppwriteSession = async () => {
    setLoading(true);
    addLog('Checking Appwrite session directly...');

    try {
      const user = await account.get();
      addLog(`✅ Appwrite session found: ${user.name || user.email}`);
      addLog(`User ID: ${user.$id}`);
      addLog(`Email verified: ${user.emailVerification}`);

      // Принудительно обновляем authService
      authService.setAuthenticated(user);
      addLog('✅ AuthService updated with user data');
      addLog('🔄 Page will refresh to update UI...');

      // Перезагружаем страницу чтобы обновить UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      addLog(`❌ No Appwrite session: ${error.message}`);
      addLog(`Error type: ${error.type}`);
      addLog(`Error code: ${error.code}`);
    } finally {
      setLoading(false);
    }
  };

  const checkLocalStorage = () => {
    addLog('Checking localStorage...');
    const savedUser = localStorage.getItem('user');
    const savedAuth = localStorage.getItem('isAuthenticated');
    
    addLog(`localStorage user: ${savedUser ? 'exists' : 'null'}`);
    addLog(`localStorage isAuthenticated: ${savedAuth}`);
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        addLog(`Saved user: ${user.name || user.email}`);
      } catch (e) {
        addLog('❌ Invalid user data in localStorage');
      }
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    addLog('🗑️ localStorage cleared');
  };

  const forceAuthCheck = async () => {
    setLoading(true);
    addLog('Force checking auth status...');
    await authService.forceCheckAuth();
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="font-bold mb-2">Auth Debug Panel</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={checkAppwriteSession}
          disabled={loading}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs rounded disabled:opacity-50"
        >
          Check Appwrite
        </button>
        
        <button
          onClick={checkLocalStorage}
          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-xs rounded"
        >
          Check Storage
        </button>
        
        <button
          onClick={forceAuthCheck}
          disabled={loading}
          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-xs rounded disabled:opacity-50"
        >
          Force Check
        </button>
        
        <button
          onClick={clearLocalStorage}
          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-xs rounded"
        >
          Clear Storage
        </button>
        
        <button
          onClick={() => setLogs([])}
          className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-xs rounded"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-gray-900 rounded p-2 h-32 overflow-y-auto text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1 font-mono">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
