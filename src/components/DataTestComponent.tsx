'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { DemoDataCreator } from '@/lib/create-demo-data';

export default function DataTestComponent() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingDemo, setCreatingDemo] = useState(false);

  const demoDataCreator = new DemoDataCreator();

  const testDatabaseConnections = async () => {
    setLoading(true);
    const results = [];

    const collections = [
      { name: 'Users', id: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID },
      { name: 'Projects', id: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID },
      { name: 'Portfolio', id: process.env.NEXT_PUBLIC_APPWRITE_PORTFOLIO_COLLECTION_ID },
      { name: 'Reviews', id: process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID },
      { name: 'Admin Stats', id: process.env.NEXT_PUBLIC_APPWRITE_ADMIN_STATS_COLLECTION_ID },
    ];

    for (const collection of collections) {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          collection.id!,
          [Query.limit(5)]
        );
        
        results.push({
          name: collection.name,
          status: 'success',
          count: response.total,
          documents: response.documents.length,
          data: response.documents.slice(0, 2)
        });
      } catch (error: any) {
        results.push({
          name: collection.name,
          status: 'error',
          error: error.message,
          count: 0,
          documents: 0
        });
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  const createDemoData = async () => {
    setCreatingDemo(true);
    try {
      await demoDataCreator.createAllDemoData();
      // Refresh test results after creating demo data
      await testDatabaseConnections();
    } catch (error) {
      console.error('Error creating demo data:', error);
    } finally {
      setCreatingDemo(false);
    }
  };

  useEffect(() => {
    testDatabaseConnections();
  }, []);

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Database Connection Test</h3>
        <button
          onClick={testDatabaseConnections}
          disabled={loading}
          className="btn-secondary text-sm"
        >
          {loading ? 'Testing...' : 'Refresh Test'}
        </button>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border ${
              result.status === 'success'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">{result.name}</h4>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  result.status === 'success'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {result.status}
              </span>
            </div>

            {result.status === 'success' ? (
              <div className="text-sm text-gray-300">
                <p>Total documents: {result.count}</p>
                <p>Retrieved: {result.documents}</p>
                {result.data && result.data.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-purple-400 hover:text-purple-300">
                      View sample data
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ) : (
              <div className="text-sm text-red-400">
                Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {testResults.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">No test results yet. Click "Refresh Test" to start.</p>
        </div>
      )}
    </div>
  );
}
