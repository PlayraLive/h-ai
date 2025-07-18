'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { PortfolioService } from '@/lib/appwrite/portfolio';
import { AuthService } from '@/lib/appwrite/auth';

export default function SimplePortfolioTest() {
  const { user } = useAuthContext();
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<string>('');

  const createTestPortfolio = async () => {
    if (!user) {
      setResult('❌ Error: User not authenticated');
      return;
    }

    setIsCreating(true);
    setResult('🔄 Creating test portfolio...');

    try {
      console.log('User data:', user);
      
      const testData = {
        title: 'Test Portfolio Item',
        description: 'This is a simple test to verify portfolio creation works.',
        category: 'Web Development',
        subcategory: 'Testing',
        images: ['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        videoUrl: '',
        liveUrl: '',
        githubUrl: '',
        aiServices: ['ChatGPT'],
        skills: ['React', 'TypeScript'],
        tools: ['VS Code'],
        tags: ['test'],
        userId: user.$id,
        userName: user.name || 'Test User',
        userAvatar: user.avatar || null,
        likesCount: 0,
        viewsCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        averageRating: 0,
        ratingsCount: 0,
        status: 'published' as const,
        featured: false,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      };

      console.log('Creating portfolio with data:', testData);
      
      const result = await PortfolioService.createPortfolioItem(testData, user.$id);
      
      console.log('Portfolio created successfully:', result);
      setResult(`✅ Success! Created portfolio item with ID: ${result.$id}`);
      
    } catch (error: any) {
      console.error('Detailed error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error type:', error.type);
      
      setResult(`❌ Error: ${error.message || 'Unknown error'}`);
      
      // Additional error details
      if (error.code) {
        setResult(prev => prev + `\nCode: ${error.code}`);
      }
      if (error.type) {
        setResult(prev => prev + `\nType: ${error.type}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const testUserAuth = async () => {
    setResult('🔄 Checking authentication...');

    try {
      // Check current user in context
      console.log('Context user:', user);

      // Check Appwrite authentication
      const appwriteUser = await AuthService.getCurrentUser();
      console.log('Appwrite user:', appwriteUser);

      if (appwriteUser) {
        setResult(`✅ Appwrite authenticated: ${appwriteUser.name} (${appwriteUser.$id})`);
      } else if (user) {
        setResult(`⚠️ Context user exists but not authenticated in Appwrite: ${user.name} (${user.$id})`);
      } else {
        setResult('❌ No user authenticated');
      }
    } catch (error: any) {
      console.error('Auth check error:', error);
      setResult(`❌ Auth check failed: ${error.message}`);
    }
  };

  const loginToAppwrite = async () => {
    setResult('🔄 Logging into Appwrite...');

    try {
      const appwriteUser = await AuthService.loginAsTestUser();
      console.log('Logged into Appwrite:', appwriteUser);
      setResult(`✅ Successfully logged into Appwrite: ${appwriteUser.name} (${appwriteUser.$id})`);
    } catch (error: any) {
      console.error('Appwrite login error:', error);
      setResult(`❌ Appwrite login failed: ${error.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Portfolio Creation Test
      </h2>
      
      <div className="space-y-4">
        <button
          onClick={testUserAuth}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Test User Authentication
        </button>

        <button
          onClick={loginToAppwrite}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Login to Appwrite
        </button>

        <button
          onClick={createTestPortfolio}
          disabled={isCreating}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create Test Portfolio'}
        </button>
        
        {result && (
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Debug Info:</strong></p>
          <p>User ID: {user?.$id || 'Not authenticated'}</p>
          <p>User Name: {user?.name || 'N/A'}</p>
          <p>User Email: {user?.email || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
