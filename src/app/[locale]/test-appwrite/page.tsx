'use client';

import { useState } from 'react';
import { appwriteAuth, client } from '@/lib/appwrite';

export default function TestAppwritePage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing connection...');

    try {
      // Test basic client connection
      const health = await fetch(`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/health`);
      if (health.ok) {
        setStatus('✅ Appwrite endpoint is reachable');
      } else {
        setStatus('❌ Appwrite endpoint is not reachable');
        setLoading(false);
        return;
      }

      // Test project connection
      try {
        const user = await appwriteAuth.getCurrentUser();
        if (user.success) {
          setStatus('✅ Connected to Appwrite! User is logged in: ' + user.user.name);
        } else {
          setStatus('✅ Connected to Appwrite! No user logged in (this is normal)');
        }
      } catch (error: any) {
        if (error.code === 401) {
          setStatus('✅ Connected to Appwrite! No user logged in (this is normal)');
        } else {
          setStatus('❌ Error connecting to project: ' + error.message);
        }
      }

    } catch (error: any) {
      setStatus('❌ Connection failed: ' + error.message);
    }

    setLoading(false);
  };

  const testGoogleAuth = async () => {
    setLoading(true);
    setStatus('Testing Google OAuth...');

    try {
      await appwriteAuth.loginWithGoogle();
    } catch (error: any) {
      setStatus('❌ Google OAuth error: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Appwrite Connection Test</h1>
        
        <div className="glass-card p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Configuration</h2>
          <div className="space-y-2 text-sm">
            <div className="text-gray-300">
              <span className="text-gray-400">Endpoint:</span> {process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}
            </div>
            <div className="text-gray-300">
              <span className="text-gray-400">Project ID:</span> {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}
            </div>
            <div className="text-gray-300">
              <span className="text-gray-400">Database ID:</span> {process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Connection Test</h2>
          
          <button
            onClick={testConnection}
            disabled={loading}
            className="btn-primary mb-4 mr-4"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>

          <button
            onClick={testGoogleAuth}
            disabled={loading}
            className="btn-secondary mb-4"
          >
            Test Google OAuth
          </button>

          {status && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">{status}</pre>
            </div>
          )}
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">Next Steps</h2>
          <div className="text-gray-300 space-y-2">
            <p>1. ✅ Add web platform in Appwrite Console</p>
            <p>2. ⏳ Create database collections</p>
            <p>3. ⏳ Set up Google OAuth</p>
            <p>4. ⏳ Configure storage buckets</p>
          </div>
        </div>
      </div>
    </div>
  );
}
