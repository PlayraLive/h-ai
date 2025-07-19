'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { MessagesService, Message, Conversation, ChatUser } from '@/lib/messages-service';
import { NotificationService } from '@/lib/services/notifications';
import StartConversationModal from '@/components/StartConversationModal';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import UserProfileDropdown from '@/components/UserProfileDropdown';

import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Star,
  Clock,
  CheckCircle2,
  Plus
} from 'lucide-react';

// Create service instance outside component
const messagesService = new MessagesService();

interface ChatWithUser extends Conversation {
  user: ChatUser;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const { user, isAuthenticated, isLoading } = useAuthContext();

  const [selectedChat, setSelectedChat] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Real data states
  const [conversations, setConversations] = useState<ChatWithUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user || !isAuthenticated) return;

      setLoading(true);
      try {
        console.log('🔄 Loading conversations for user:', user.$id);

        const userConversations = await messagesService.getUserConversations(user.$id);

        // Load user info for each conversation
        const conversationsWithUsers = await Promise.all(
          userConversations.map(async (conversation) => {
            const otherUserId = conversation.participants.find(id => id !== user.$id);
            if (!otherUserId) return null;

            const otherUser = await messagesService.getUserInfo(otherUserId);
            if (!otherUser) return null;

            return {
              ...conversation,
              user: otherUser
            };
          })
        );

        const validConversations = conversationsWithUsers.filter(Boolean) as ChatWithUser[];
        setConversations(validConversations);

        console.log('✅ Conversations loaded:', validConversations.length);

        // Подписываемся на обновления разговоров
        const unsubscribe = messagesService.subscribeToUserConversations(
          user.$id,
          (newConversation) => {
            console.log('📨 New conversation:', newConversation);
            // Загружаем информацию о пользователе для нового разговора
            const loadNewConversationUser = async () => {
              const otherUserId = newConversation.participants.find(id => id !== user.$id);
              if (otherUserId) {
                const otherUser = await messagesService.getUserInfo(otherUserId);
                if (otherUser) {
                  setConversations(prev => [{ ...newConversation, user: otherUser }, ...prev]);
                }
              }
            };
            loadNewConversationUser();
          },
          (updatedConversation) => {
            console.log('🔄 Conversation updated:', updatedConversation);
            setConversations(prev =>
              prev.map(conv => conv.$id === updatedConversation.$id ? { ...conv, ...updatedConversation } : conv)
            );
          }
        );

        // Сохраняем функцию отписки
        return unsubscribe;
      } catch (error) {
        console.error('❌ Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && isAuthenticated && !isLoading) {
      const unsubscribe = loadConversations();

      // Отписываемся при размонтировании
      return () => {
        if (unsubscribe) {
          unsubscribe.then(unsub => unsub && unsub());
        }
      };
    }
  }, [user, isAuthenticated, isLoading]);

  // Load messages for selected conversation with real-time
  useEffect(() => {
    if (!selectedChat || !user) return;

    const loadMessages = async () => {
      try {
        console.log('🔄 Loading messages for conversation:', selectedChat);

        const conversationMessages = await messagesService.getConversationMessages(selectedChat);
        setMessages(conversationMessages);

        // Mark messages as read
        await messagesService.markMessagesAsRead(selectedChat, user.$id);

        console.log('✅ Messages loaded:', conversationMessages.length);
      } catch (error) {
        console.error('❌ Error loading messages:', error);
      }
    };

    loadMessages();

    // Подписываемся на real-time обновления
    const unsubscribe = messagesService.subscribeToConversation(
      selectedChat,
      (newMessage) => {
        console.log('📨 New message received:', newMessage);
        setMessages(prev => [...prev, newMessage]);

        // Автоматически отмечаем как прочитанное если это не наше сообщение
        if (newMessage.sender_id !== user.$id) {
          messagesService.markMessagesAsRead(selectedChat, user.$id);
        }
      },
      (updatedConversation) => {
        console.log('🔄 Conversation updated:', updatedConversation);
        // Обновляем список разговоров
        setConversations(prev =>
          prev.map(conv => conv.$id === updatedConversation.$id ? { ...conv, ...updatedConversation } : conv)
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedChat, user]);

  // Mock data for fallback
  const mockChats = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      lastMessage: 'The logo design looks great! Can we make the text a bit larger?',
      timestamp: '2 min ago',
      unread: 2,
      online: true,
      projectId: '1',
      projectTitle: 'AI Logo Design for TechCorp'
    },
    {
      id: '2',
      name: 'Mike Davis',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      lastMessage: 'Perfect! The chatbot is working exactly as expected.',
      timestamp: '1 hour ago',
      unread: 0,
      online: false,
      projectId: '2',
      projectTitle: 'Chatbot Development'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      lastMessage: 'Thank you for the amazing video content!',
      timestamp: '3 hours ago',
      unread: 0,
      online: true,
      projectId: '3',
      projectTitle: 'AI Video Content Creation'
    }
  ];

  const mockMessages: Record<string, any[]> = {
    '1': [
      {
        id: '1',
        text: 'Hi! I\'ve reviewed your portfolio and I\'m impressed with your AI design work.',
        sender: 'other',
        timestamp: '10:30 AM',
        read: true
      },
      {
        id: '2',
        text: 'Thank you! I\'d love to work on your logo project. Can you share more details about your vision?',
        sender: 'me',
        timestamp: '10:32 AM',
        read: true
      },
      {
        id: '3',
        text: 'Sure! We\'re looking for a modern, tech-focused logo that represents AI innovation.',
        sender: 'other',
        timestamp: '10:35 AM',
        read: true
      },
      {
        id: '4',
        text: 'I\'ve attached the initial concepts. Let me know what you think!',
        sender: 'me',
        timestamp: '2:15 PM',
        read: true
      },
      {
        id: '5',
        text: 'The logo design looks great! Can we make the text a bit larger?',
        sender: 'other',
        timestamp: '2:18 PM',
        read: false
      }
    ],
    '2': [
      {
        id: '1',
        text: 'The chatbot integration is complete. Would you like to test it?',
        sender: 'me',
        timestamp: '9:00 AM',
        read: true
      },
      {
        id: '2',
        text: 'Perfect! The chatbot is working exactly as expected.',
        sender: 'other',
        timestamp: '11:30 AM',
        read: true
      }
    ],
    '3': [
      {
        id: '1',
        text: 'The video content has been delivered. Please review when you have time.',
        sender: 'me',
        timestamp: '8:00 AM',
        read: true
      },
      {
        id: '2',
        text: 'Thank you for the amazing video content!',
        sender: 'other',
        timestamp: '9:15 AM',
        read: true
      }
    ]
  };

  // Use real data or fallback to mock data
  const chatsToShow = conversations.length > 0 ? conversations : mockChats;
  const currentChat = conversations.find(chat => chat.$id === selectedChat) ||
                     mockChats.find(chat => chat.id === selectedChat);

  const filteredChats = chatsToShow.filter(chat => {
    const name = 'user' in chat ? chat.user.name : chat.name;
    const projectTitle = 'project_title' in chat ? chat.project_title : chat.projectTitle;

    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           projectTitle?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !selectedChat || sending) return;

    setSending(true);
    try {
      const conversation = conversations.find(c => c.$id === selectedChat);
      if (!conversation) return;

      const receiverId = conversation.participants.find(id => id !== user.$id);
      if (!receiverId) return;

      console.log('📤 Sending message:', messageText);

      const result = await messagesService.sendMessage(
        user.$id,
        receiverId,
        messageText,
        selectedChat,
        projectId || undefined
      );

      if (result.success && result.message) {
        // Add message to local state (real-time subscription will also add it, but this is for immediate feedback)
        setMessages(prev => [...prev, result.message!]);
        setMessageText('');

        // Создаем уведомление для получателя
        try {
          const receiverUser = await messagesService.getUserInfo(receiverId);
          if (receiverUser) {
            await NotificationService.createMessageNotification(
              receiverId,
              user.name,
              messageText,
              selectedChat
            );
          }
        } catch (notificationError) {
          console.warn('⚠️ Failed to create notification:', notificationError);
        }

        console.log('✅ Message sent successfully');
      } else {
        console.error('❌ Failed to send message:', result.error);
        // TODO: Show error toast to user
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleConversationStarted = (conversationId: string) => {
    setSelectedChat(conversationId);
    // Reload conversations to include the new one
    if (user && isAuthenticated) {
      const loadConversations = async () => {
        const userConversations = await messagesService.getUserConversations(user.$id);
        const conversationsWithUsers = await Promise.all(
          userConversations.map(async (conversation) => {
            const otherUserId = conversation.participants.find(id => id !== user.$id);
            if (!otherUserId) return null;
            const otherUser = await messagesService.getUserInfo(otherUserId);
            if (!otherUser) return null;
            return { ...conversation, user: otherUser };
          })
        );
        const validConversations = conversationsWithUsers.filter(Boolean) as ChatWithUser[];
        setConversations(validConversations);
      };
      loadConversations();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading messages...</p>
          </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Please log in</h2>
            <p className="text-gray-400">You need to be logged in to access messages</p>
          </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950">
      {/* Top Navigation */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-white">Messages</h1>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            <UserProfileDropdown />
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Chat List */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-white">Messages</h1>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                title="Start new conversation"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Loading conversations...</p>
              </div>
            ) : filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const isRealChat = 'user' in chat;
                const chatId = isRealChat ? chat.$id : chat.id;
                const chatName = isRealChat ? chat.user.name : chat.name;
                const chatAvatar = isRealChat ? (chat.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.user.name)}&background=6366f1&color=fff`) : chat.avatar;
                const chatOnline = isRealChat ? chat.user.online : chat.online;
                const chatLastMessage = isRealChat ? chat.last_message : chat.lastMessage;
                const chatTimestamp = isRealChat ? new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : chat.timestamp;
                const chatUnread = isRealChat ? (() => {
                  const unreadCount = typeof chat.unread_count === 'string'
                    ? JSON.parse(chat.unread_count)
                    : chat.unread_count || {};
                  return unreadCount[user?.$id || ''] || 0;
                })() : chat.unread;
                const chatProjectTitle = isRealChat ? chat.project_title : chat.projectTitle;

                return (
                  <div
                    key={chatId}
                    onClick={() => setSelectedChat(chatId)}
                    className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
                      selectedChat === chatId ? 'bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={chatAvatar}
                          alt={chatName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {chatOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium truncate">{chatName}</h3>
                          <span className="text-xs text-gray-400">{chatTimestamp}</span>
                        </div>

                        {chatProjectTitle && (
                          <p className="text-xs text-purple-400 mb-1">{chatProjectTitle}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-400 truncate">{chatLastMessage || 'No messages yet'}</p>
                          {chatUnread > 0 && (
                            <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {chatUnread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-400">No conversations yet</p>
                <p className="text-gray-500 text-sm mt-1">Start a conversation with a freelancer or client</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={currentChat.avatar}
                      alt={currentChat.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {currentChat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-white font-medium">
                      {'user' in currentChat ? currentChat.user.name : currentChat.name}
                    </h2>
                    {(('project_title' in currentChat && currentChat.project_title) ||
                      ('projectTitle' in currentChat && currentChat.projectTitle)) && (
                      <p className="text-sm text-purple-400">
                        {'project_title' in currentChat ? currentChat.project_title : currentChat.projectTitle}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {'user' in currentChat
                        ? (currentChat.user.online ? 'Online' : `Last seen ${new Date(currentChat.user.last_seen).toLocaleDateString()}`)
                        : (currentChat.online ? 'Online' : 'Last seen 2 hours ago')
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map((message) => {
                    const isMyMessage = message.sender_id === user?.$id;
                    return (
                      <div
                        key={message.$id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isMyMessage
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-800 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {isMyMessage && (
                              <CheckCircle2 className={`w-3 h-3 ${message.read ? 'text-blue-300' : 'text-gray-300'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
                      <p className="text-gray-400">Start the conversation!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !messageText.trim()}
                    className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Select a conversation</h3>
                <p className="text-gray-400">Choose a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Start Conversation Modal */}
      <StartConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onConversationStarted={handleConversationStarted}
        projectId={projectId || undefined}
      />
    </div>
  );
}
