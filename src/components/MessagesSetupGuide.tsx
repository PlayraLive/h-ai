'use client';

import { useState } from 'react';
import { X, Database, CheckCircle, AlertCircle, Copy } from 'lucide-react';

interface MessagesSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MessagesSetupGuide({ isOpen, onClose }: MessagesSetupGuideProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Messages Setup Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <h3 className="text-lg font-semibold text-white">Create "messages" Collection</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <p className="text-gray-300">Go to Appwrite Console → Database → Create Collection</p>
              
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Collection ID:</span>
                  <button
                    onClick={() => copyToClipboard('messages', 1)}
                    className="flex items-center space-x-1 text-purple-400 hover:text-purple-300"
                  >
                    <span className="font-mono">messages</span>
                    {copiedStep === 1 ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-gray-400">
                <strong>Required Attributes:</strong>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• text (String, 2000 chars, Required)</li>
                  <li>• sender_id (String, 50 chars, Required)</li>
                  <li>• receiver_id (String, 50 chars, Required)</li>
                  <li>• conversation_id (String, 50 chars, Required)</li>
                  <li>• timestamp (DateTime, Required)</li>
                  <li>• read (Boolean, Required, Default: false)</li>
                  <li>• message_type (Enum: text,file,image, Required, Default: text)</li>
                  <li>• file_url (String, 500 chars, Optional)</li>
                  <li>• file_name (String, 255 chars, Optional)</li>
                  <li>• project_id (String, 50 chars, Optional)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <h3 className="text-lg font-semibold text-white">Create "conversations" Collection</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <p className="text-gray-300">Go to Appwrite Console → Database → Create Collection</p>
              
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Collection ID:</span>
                  <button
                    onClick={() => copyToClipboard('conversations', 2)}
                    className="flex items-center space-x-1 text-purple-400 hover:text-purple-300"
                  >
                    <span className="font-mono">conversations</span>
                    {copiedStep === 2 ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-gray-400">
                <strong>Required Attributes:</strong>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• participants (String Array, 50 chars each, Required)</li>
                  <li>• last_message (String, 500 chars, Optional)</li>
                  <li>• last_message_time (DateTime, Required)</li>
                  <li>• unread_count (String, 1000 chars, Optional)</li>
                  <li>• project_id (String, 50 chars, Optional)</li>
                  <li>• project_title (String, 255 chars, Optional)</li>
                  <li>• created_at (DateTime, Required)</li>
                  <li>• updated_at (DateTime, Required)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <h3 className="text-lg font-semibold text-white">Set Permissions</h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-400">
              <p>For both collections, set these permissions:</p>
              <ul className="space-y-1 ml-4">
                <li>• Read: Any</li>
                <li>• Create: Users</li>
                <li>• Update: Users</li>
                <li>• Delete: Users</li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
              <h3 className="text-lg font-semibold text-white">Test the Setup</h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-400">
              <p>After creating the collections:</p>
              <ol className="space-y-1 ml-4">
                <li>1. Click "Check Collections" in the dashboard</li>
                <li>2. Click "Create Demo Messages" to add test data</li>
                <li>3. Go to Messages page to see it working!</li>
              </ol>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-400 font-medium mb-1">Important Notes:</p>
                <ul className="text-yellow-300 space-y-1">
                  <li>• Collection IDs must match exactly: "messages" and "conversations"</li>
                  <li>• All required attributes must be created with correct types</li>
                  <li>• Permissions must allow Users to Create/Read/Update</li>
                  <li>• Check browser console for detailed error messages</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full btn-primary"
          >
            Got it! Let's set up the collections
          </button>
        </div>
      </div>
    </div>
  );
}
