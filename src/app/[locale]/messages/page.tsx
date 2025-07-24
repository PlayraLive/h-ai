'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { MessagesService, Message, Conversation, ChatUser } from '@/lib/messages-service';
import { NotificationService } from '@/lib/services/notifications';
import StartConversationModal from '@/components/StartConversationModal';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import { AIOrderService, OrderCard as OrderCardType } from '@/lib/services/ai-order-service';
import OrderCard from '@/components/messaging/OrderCard';
import { useRouter } from 'next/navigation';
import EmojiPicker from '@/components/messaging/EmojiPicker';
import Navbar from '@/components/Navbar';

import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
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
  const aiOrderId = searchParams.get('ai_order');
  const conversationId = searchParams.get('conversation');
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  const [selectedChat, setSelectedChat] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderCards, setOrderCards] = useState<OrderCardType[]>([]);
  const [conversations, setConversations] = useState<ChatWithUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  // Load user's order cards
  useEffect(() => {
    if (!user) return;
    try {
      const userOrders = AIOrderService.getUserOrders(user.$id);
      const cards = userOrders.map(order => 
        AIOrderService.generateOrderCard(order, 'client')
      );
      setOrderCards(cards);
    } catch (error) {
      console.error('Error loading order cards:', error);
    }
  }, [user]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user || !isAuthenticated) return;
      setLoading(true);
      try {
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
      } catch (error) {
        console.error('❌ Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && isAuthenticated && !isLoading) {
      loadConversations();
    }
  }, [user, isAuthenticated, isLoading]);

  // Auto-select conversation
  useEffect(() => {
    if (conversations.length === 0) return;
    if (conversationId) {
      const targetConversation = conversations.find(conv => conv.$id === conversationId);
      if (targetConversation) {
        setSelectedChat(conversationId);
        return;
      }
    }
    if (aiOrderId) {
      const aiOrderConversation = conversations.find(conv => conv.project_id === aiOrderId);
      if (aiOrderConversation) {
        setSelectedChat(aiOrderConversation.$id);
      } else if (conversations.length > 0) {
        setSelectedChat(conversations[0].$id);
      }
    } else if (projectId) {
      const projectConversation = conversations.find(conv => conv.project_id === projectId);
      if (projectConversation) {
        setSelectedChat(projectConversation.$id);
      }
    } else if (!selectedChat && conversations.length > 0) {
      setSelectedChat(conversations[0].$id);
    }
  }, [conversations, aiOrderId, projectId, conversationId, selectedChat]);

  // Load messages
  useEffect(() => {
    if (!selectedChat || !user) return;
    const loadMessages = async () => {
      try {
        const conversationMessages = await messagesService.getConversationMessages(selectedChat);
        setMessages(conversationMessages);
        await messagesService.markMessagesAsRead(selectedChat, user.$id);
      } catch (error) {
        console.error('❌ Error loading messages:', error);
      }
    };
    loadMessages();
  }, [selectedChat, user]);

  // Mock data for demo
  const mockChats = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff',
      lastMessage: 'The logo design looks great! Can we make the text a bit larger? 👍',
      timestamp: '2 min ago',
      unread: 2,
      online: true,
      projectTitle: 'AI Logo Design for TechCorp'
    },
    {
      id: '2',
      name: 'Mike Davis',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Davis&background=8b5cf6&color=fff',
      lastMessage: 'Perfect! The chatbot is working exactly as expected. 🚀',
      timestamp: '1 hour ago',
      unread: 0,
      online: false,
      projectTitle: 'Chatbot Development'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=06b6d4&color=fff',
      lastMessage: 'Thank you for the amazing video content! 🎥',
      timestamp: '3 hours ago',
      unread: 0,
      online: true,
      projectTitle: 'AI Video Content Creation'
    }
  ];

  const mockMessages: Record<string, any[]> = {
    '1': [
      { id: '1', text: 'Hi! I\'ve reviewed your portfolio and I\'m impressed with your AI design work. 🎨', sender_id: 'other-user-1', timestamp: '10:30 AM', read: true },
      { id: '2', text: 'Thank you! I\'d love to work on your logo project. Can you share more details about your vision? ✨', sender_id: user?.$id || 'current-user', timestamp: '10:32 AM', read: true },
      { id: '3', text: 'Sure! We\'re looking for a modern, tech-focused logo that represents AI innovation. 🚀', sender_id: 'other-user-1', timestamp: '10:35 AM', read: true },
      { id: '4', text: 'I\'ve attached the initial concepts. Let me know what you think! 📎', sender_id: user?.$id || 'current-user', timestamp: '2:15 PM', read: true },
      { id: '5', text: 'The logo design looks great! Can we make the text a bit larger? 👏', sender_id: 'other-user-1', timestamp: '2:18 PM', read: false }
    ],
    '2': [
      { id: '1', text: 'The chatbot integration is complete. Would you like to test it? 🤖', sender_id: user?.$id || 'current-user', timestamp: '9:00 AM', read: true },
      { id: '2', text: 'Perfect! The chatbot is working exactly as expected. Great job! 🎉', sender_id: 'other-user-2', timestamp: '11:30 AM', read: true }
    ],
    '3': [
      { id: '1', text: 'The video content has been delivered. Please review when you have time. 📹', sender_id: user?.$id || 'current-user', timestamp: '8:00 AM', read: true },
      { id: '2', text: 'Thank you for the amazing video content! Exactly what we were looking for! 🙌', sender_id: 'other-user-3', timestamp: '9:15 AM', read: true }
    ]
  };

  const chatsToShow = conversations.length > 0 ? conversations : mockChats;
  const currentChat = conversations.find(chat => chat.$id === selectedChat) || mockChats.find(chat => chat.id === selectedChat);
  
  const messagesToShow = messages.length > 0 ? messages : 
    (selectedChat && mockMessages[selectedChat] ? 
      mockMessages[selectedChat].map(msg => ({
        $id: msg.id,
        text: msg.text,
        sender_id: msg.sender_id,
        timestamp: msg.timestamp,
        read: msg.read
      })) : []);

  const filteredChats = chatsToShow.filter(chat => {
    const name = 'user' in chat ? chat.user.name : (chat as any).name;
    const projectTitle = 'project_title' in chat ? (chat as any).project_title : (chat as any).projectTitle;
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           projectTitle?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !selectedChat || sending) return;
    setSending(true);
    
    try {
      let conversation = conversations.find(c => c.$id === selectedChat);
      
      if (!conversation) {
        const mockChat = mockChats.find(chat => chat.id === selectedChat);
        if (mockChat) {
          // Add to mock messages for demo
          const newMockMessage = {
            id: Date.now().toString(),
            text: messageText,
            sender_id: user.$id,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false
          };
          
          if (!mockMessages[selectedChat]) {
            mockMessages[selectedChat] = [];
          }
          mockMessages[selectedChat].push(newMockMessage);
          
          setMessages(prev => [...prev, {
            $id: newMockMessage.id,
            text: newMockMessage.text,
            sender_id: newMockMessage.sender_id,
            timestamp: new Date().toISOString(),
            read: false
          } as any]);
          
          setMessageText('');
          setSending(false);
          return;
        }
      } else {
        const receiverId = conversation.participants.find(id => id !== user.$id);
        if (!receiverId) {
          setSending(false);
          return;
        }

        const result = await messagesService.sendMessage(
          user.$id,
          receiverId,
          messageText,
          selectedChat,
          projectId || undefined
        );

        if (result.success && result.message) {
          setMessages(prev => [...prev, result.message!]);
          setMessageText('');
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
        }
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleConversationStarted = (conversationId: string) => {
    setSelectedChat(conversationId);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="relative h-screen pt-16">
        <div className="flex h-full">
          {/* Chat List */}
          <div className="w-80 bg-gray-900/80 backdrop-blur-lg border-r border-gray-800/50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-white">Messages</h1>
                <button
                  onClick={() => setShowNewConversationModal(true)}
                  className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
                  title="Start new conversation"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {/* Active Orders Section */}
              {orderCards.length > 0 && (
                <div className="p-4 border-b border-gray-800/50">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                    Активные заказы
                  </h3>
                  <div className="space-y-3">
                    {orderCards.slice(0, 2).map((order) => (
                      <OrderCard
                        key={order.orderId}
                        order={order}
                        onActionClick={(action, orderId) => {
                          if (action === 'open_chat') {
                            const orderConversation = conversations.find(conv => 
                              conv.project_id === orderId
                            );
                            if (orderConversation) {
                              setSelectedChat(orderConversation.$id);
                            }
                          }
                        }}
                        className="transform hover:scale-105 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              )}

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
                      className={`p-4 border-b border-gray-800/50 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 ${
                        selectedChat === chatId ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-r-2 border-r-purple-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={chatAvatar}
                            alt={chatName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700/50"
                          />
                          {chatOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-medium truncate">{chatName}</h3>
                            <span className="text-xs text-gray-400">{chatTimestamp}</span>
                          </div>

                          {chatProjectTitle && (
                            <p className="text-xs text-purple-400 mb-1 truncate">{chatProjectTitle}</p>
                          )}

                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400 truncate">{chatLastMessage || 'No messages yet'}</p>
                            {chatUnread > 0 && (
                              <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center animate-pulse">
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
                <div className="p-4 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={(currentChat as any).avatar}
                        alt={'user' in currentChat ? currentChat.user.name : (currentChat as any).name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700/50"
                      />
                      {(currentChat as any).online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                      )}
                    </div>
                    
                    <div>
                      <h2 className="text-white font-medium">
                        {'user' in currentChat ? currentChat.user.name : currentChat.name}
                      </h2>
                      {(('project_title' in currentChat && (currentChat as any).project_title) ||
                        ('projectTitle' in currentChat && (currentChat as any).projectTitle)) && (
                        <p className="text-sm text-purple-400">
                          {'project_title' in currentChat ? (currentChat as any).project_title : (currentChat as any).projectTitle}
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
                    <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesToShow.length > 0 ? (
                    messagesToShow.map((message, index) => {
                      const isMyMessage = message.sender_id === user?.$id;
                      const showAvatar = index === messagesToShow.length - 1 || 
                        messagesToShow[index + 1]?.sender_id !== message.sender_id;
                      const isConsecutive = index > 0 && 
                        messagesToShow[index - 1]?.sender_id === message.sender_id;
                      
                      return (
                        <div
                          key={message.$id}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} ${
                            isConsecutive ? 'mt-1' : 'mt-4'
                          } animate-in slide-in-from-bottom-2 duration-300`}
                        >
                          {!isMyMessage && showAvatar && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium mr-3 mt-auto">
                              {(currentChat as any)?.user?.name?.[0] || (currentChat as any)?.name?.[0] || 'U'}
                            </div>
                          )}
                          
                          {!isMyMessage && !showAvatar && (
                            <div className="w-8 mr-3"></div>
                          )}
                          
                          <div className={`group relative max-w-xs lg:max-w-md ${isMyMessage ? 'ml-auto' : ''}`}>
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-200 hover:shadow-xl ${
                                isMyMessage
                                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-transparent ml-auto'
                                  : 'bg-gray-800/80 text-white border-gray-700/50'
                              } ${
                                isConsecutive 
                                  ? isMyMessage 
                                    ? 'rounded-tr-md' 
                                    : 'rounded-tl-md'
                                  : ''
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                              
                              <div className="flex items-center justify-end mt-2 space-x-1">
                                <span className="text-xs opacity-70">
                                  {typeof message.timestamp === 'string' && message.timestamp.includes(':') 
                                    ? message.timestamp 
                                    : new Date(message.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                  }
                                </span>
                                {isMyMessage && (
                                  <div className="flex items-center space-x-1">
                                    <CheckCircle2 className={`w-3 h-3 transition-colors ${
                                      message.read ? 'text-blue-300' : 'text-gray-300'
                                    }`} />
                                    {message.read && (
                                      <CheckCircle2 className="w-3 h-3 text-blue-300 -ml-2" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Message reactions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 right-0 bg-gray-800/90 backdrop-blur-md rounded-full p-1 shadow-lg border border-gray-700/50">
                              <div className="flex space-x-1">
                                <button className="w-6 h-6 text-xs hover:bg-gray-700 rounded-full transition-colors" title="React">❤️</button>
                                <button className="w-6 h-6 text-xs hover:bg-gray-700 rounded-full transition-colors" title="React">👍</button>
                                <button className="w-6 h-6 text-xs hover:bg-gray-700 rounded-full transition-colors" title="React">😂</button>
                              </div>
                            </div>
                          </div>

                          {isMyMessage && showAvatar && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-medium ml-3 mt-auto">
                              {user?.name?.[0] || 'M'}
                            </div>
                          )}
                          
                          {isMyMessage && !showAvatar && (
                            <div className="w-8 ml-3"></div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Send className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
                        <p className="text-gray-400">Start the conversation! 💬</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 bg-gray-900/80 backdrop-blur-lg border-t border-gray-800/50">
                  <div className="flex items-end space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message... (Shift+Enter for new line)"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[44px] max-h-32 backdrop-blur-sm"
                        rows={1}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                        }}
                      />
                    </div>
                    
                    <EmojiPicker
                      onEmojiSelect={(emoji) => {
                        setMessageText(prev => prev + emoji);
                      }}
                    />
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !messageText.trim()}
                      className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg"
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
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
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
    </div>
  );
}
