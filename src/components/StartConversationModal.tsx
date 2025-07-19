'use client';

import { useState, useEffect } from 'react';
import { MessagesService, ChatUser } from '@/lib/messages-service';
import { useAuthContext } from '@/contexts/AuthContext';
import { X, Search, MessageCircle, User } from 'lucide-react';

interface StartConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationStarted: (conversationId: string) => void;
  projectId?: string;
}

const messagesService = new MessagesService();

export default function StartConversationModal({
  isOpen,
  onClose,
  onConversationStarted,
  projectId
}: StartConversationModalProps) {
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || !user) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const results = await messagesService.searchUsers(searchQuery, user.$id);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user]);

  const handleStartConversation = async (targetUser: ChatUser) => {
    if (!user || starting) return;

    setStarting(true);
    try {
      const result = await messagesService.startConversation(
        user.$id,
        targetUser.$id,
        projectId,
        `Hi ${targetUser.name}! I'd like to start a conversation with you.`
      );

      if (result.success && result.conversationId) {
        onConversationStarted(result.conversationId);
        onClose();
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setStarting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Start New Conversation</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for users..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((targetUser) => (
                <div
                  key={targetUser.$id}
                  onClick={() => handleStartConversation(targetUser)}
                  className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="relative">
                    {targetUser.avatar ? (
                      <img
                        src={targetUser.avatar}
                        alt={targetUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {targetUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {targetUser.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-medium">{targetUser.name}</h3>
                    <p className="text-sm text-gray-400">{targetUser.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        targetUser.userType === 'freelancer' 
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {targetUser.userType === 'freelancer' ? '👨‍💻 Freelancer' : '🏢 Client'}
                      </span>
                      {targetUser.online ? (
                        <span className="text-xs text-green-400">Online</span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Last seen {new Date(targetUser.last_seen).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <MessageCircle className="w-5 h-5 text-gray-400" />
                </div>
              ))
            ) : searchQuery.trim() ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No users found</p>
                <p className="text-gray-500 text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">Search for users</p>
                <p className="text-gray-500 text-sm">Type a name or email to find someone</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {projectId && (
          <div className="px-6 pb-6">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <p className="text-purple-400 text-sm">
                💼 This conversation will be linked to your project
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {starting && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg p-6 flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white">Starting conversation...</span>
          </div>
        </div>
      )}
    </div>
  );
}
