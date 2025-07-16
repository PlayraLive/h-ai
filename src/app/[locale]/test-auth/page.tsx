'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function TestAuthPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const { register, login, logout, user } = useAuth();

  const testRegister = async () => {
    setLoading(true);
    setResult('Registering...');
    
    try {
      const result = await register(email, password, name);
      if (result.success) {
        setResult('✅ Registration successful! User: ' + result.user.name);
      } else {
        setResult('❌ Registration failed: ' + result.error);
      }
    } catch (error: any) {
      setResult('❌ Registration error: ' + error.message);
    }
    
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    setResult('Logging in...');
    
    try {
      const result = await login(email, password);
      if (result.success) {
        setResult('✅ Login successful! User: ' + result.user.name);
      } else {
        setResult('❌ Login failed: ' + result.error);
      }
    } catch (error: any) {
      setResult('❌ Login error: ' + error.message);
    }
    
    setLoading(false);
  };

  const testLogout = async () => {
    setLoading(true);
    setResult('Logging out...');
    
    try {
      await logout();
      setResult('✅ Logout successful!');
    } catch (error: any) {
      setResult('❌ Logout error: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Authentication Test</h1>
        
        {/* Current User Status */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current User</h2>
          {user ? (
            <div className="text-green-400">
              <p>✅ Logged in as: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>ID: {user.$id}</p>
            </div>
          ) : (
            <p className="text-gray-400">❌ Not logged in</p>
          )}
        </div>

        {/* Test Credentials */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Credentials</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Actions</h2>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={testRegister}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Testing...' : 'Test Register'}
            </button>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
            
            <button
              onClick={testLogout}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Testing...' : 'Test Logout'}
            </button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">Instructions</h2>
          <div className="text-gray-300 space-y-2">
            <p>1. First, test registration to create a new user</p>
            <p>2. Then test login with the same credentials</p>
            <p>3. Check that user status updates correctly</p>
            <p>4. Test logout to clear the session</p>
            <p>5. Check browser console for detailed logs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
