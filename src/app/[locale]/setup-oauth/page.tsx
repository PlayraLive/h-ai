'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function SetupOAuthPage() {
  const [copiedText, setCopiedText] = useState<string>('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const redirectURIs = [
    'http://localhost:3000/en/auth/success',
    'https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/687759fb003c8bd76b93'
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/"
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            🔧 Google OAuth Setup Guide
          </h1>

          <div className="prose prose-invert max-w-none">
            {/* Step 1 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
                Google Cloud Console Setup
              </h2>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                  <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center">Google Cloud Console <ExternalLink className="w-4 h-4 ml-1" /></a></li>
                  <li>Create a new project or select existing one</li>
                  <li>Go to <strong>APIs & Services</strong> → <strong>Credentials</strong></li>
                  <li>Click <strong>Create Credentials</strong> → <strong>OAuth 2.0 Client IDs</strong></li>
                  <li>Select <strong>Web application</strong></li>
                </ol>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                <h3 className="text-yellow-400 font-semibold mb-2">📋 Authorized Redirect URIs</h3>
                <p className="text-gray-300 mb-3">Add these URLs to your Google OAuth configuration:</p>
                
                {redirectURIs.map((uri, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <code className="bg-gray-800 px-3 py-1 rounded text-sm text-green-400 flex-1">
                      {uri}
                    </code>
                    <button
                      onClick={() => copyToClipboard(uri, `uri-${index}`)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedText === `uri-${index}` ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">2</span>
                Appwrite Console Setup
              </h2>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                  <li>Go to <a href="https://cloud.appwrite.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center">Appwrite Console <ExternalLink className="w-4 h-4 ml-1" /></a></li>
                  <li>Select your project: <code className="bg-gray-800 px-2 py-1 rounded text-green-400">687759fb003c8bd76b93</code></li>
                  <li>Go to <strong>Auth</strong> → <strong>Settings</strong></li>
                  <li>Find <strong>OAuth2 Providers</strong> section</li>
                  <li>Enable <strong>Google</strong></li>
                  <li>Enter your Google <strong>Client ID</strong> and <strong>Client Secret</strong></li>
                </ol>
              </div>

              <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                <h3 className="text-blue-400 font-semibold mb-2">🔗 Success/Failure URLs</h3>
                <p className="text-gray-300 mb-3">Configure these URLs in Appwrite OAuth settings:</p>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-400">Success URL:</label>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-800 px-3 py-1 rounded text-sm text-green-400 flex-1">
                        http://localhost:3000/en/auth/success
                      </code>
                      <button
                        onClick={() => copyToClipboard('http://localhost:3000/en/auth/success', 'success-url')}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedText === 'success-url' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Failure URL:</label>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-800 px-3 py-1 rounded text-sm text-red-400 flex-1">
                        http://localhost:3000/en/auth/error
                      </code>
                      <button
                        onClick={() => copyToClipboard('http://localhost:3000/en/auth/error', 'error-url')}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedText === 'error-url' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">3</span>
                Test the Setup
              </h2>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-gray-300 mb-4">After completing the setup:</p>
                <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                  <li>Go back to the <Link href="/" className="text-blue-400 hover:underline">home page</Link></li>
                  <li>Click the <strong className="text-red-400">"Google"</strong> button in the navbar</li>
                  <li>You should be redirected to Google for authentication</li>
                  <li>After successful login, you'll be redirected back to the dashboard</li>
                </ol>
              </div>
            </div>

            {/* Alternative */}
            <div className="bg-green-900/20 border border-green-600 rounded-lg p-6">
              <h3 className="text-green-400 font-semibold mb-3">💡 Alternative: Use Test User</h3>
              <p className="text-gray-300 mb-4">
                If you don't want to set up Google OAuth right now, you can use the <strong>"Test User"</strong> button 
                to create a real user account in Appwrite and test all the functionality.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <span>Try Test User</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
