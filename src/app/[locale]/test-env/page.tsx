'use client';

export default function TestEnvPage() {
  const envVars = {
    APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    APPWRITE_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Environment Variables Test</h1>
        
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Appwrite Configuration</h2>
          
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="mb-4 p-4 bg-gray-800/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm text-gray-300">{key}:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  value ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {value ? '✓ SET' : '✗ NOT SET'}
                </span>
              </div>
              {value && (
                <div className="mt-2 font-mono text-xs text-gray-400 break-all">
                  {value}
                </div>
              )}
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-2">Status:</h3>
            <p className="text-sm">
              {Object.values(envVars).every(v => v) ? (
                <span className="text-green-400">✓ All environment variables are configured</span>
              ) : (
                <span className="text-red-400">✗ Some environment variables are missing</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
