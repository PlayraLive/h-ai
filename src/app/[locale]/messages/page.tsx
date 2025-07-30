"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  EnhancedMessagingService, 
  EnhancedMessage, 
  EnhancedConversation 
} from '@/lib/services/enhanced-messaging';
import { UnifiedOrderService, UnifiedOrder } from '@/lib/services/unified-order-service';
import Navbar from '@/components/Navbar';
import EnhancedOrderTimeline from '@/components/messaging/EnhancedOrderTimeline';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Search,
  Phone,
  Video,
  Info,
  Archive,
  Star,
  Plus,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Bot,
  Briefcase,
  ArrowLeft,
  Users,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Edit,
  Trash2,
  Reply,
  Forward,
  Clock,
  Check,
  CheckCheck,
  DollarSign
} from 'lucide-react';
// Order Card Interface
interface OrderCard {
  $id: string;
  orderId: string;
  userId: string;
  type: 'ai_order' | 'job' | 'project' | 'solution';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  currency: string;
  deadline?: string;
  clientName: string;
  specialistName?: string;
  category: string;
  skills: string[];
  createdAt: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  unreadCount?: number;
  progress?: number;
  conversationId?: string;
}
// Demo data
const demoConversations: EnhancedConversation[] = [
  {
    $id: 'conv-1',
    title: 'Алекс AI - Дизайн логотипа',
    participants: ['user1', 'alex-ai'],
    lastMessage: 'Отлично! Уже готов первый концепт дизайна 🎨',
    lastMessageTime: new Date(Date.now() - 30000).toISOString(),
    unreadCount: { 'user1': 2, 'alex-ai': 0 },
    type: 'ai_specialist',
    avatar: '/images/specialists/alex-ai.jpg',
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30000).toISOString()
  },
  {
    $id: 'conv-2', 
    title: 'Проект веб-разработки',
    participants: ['user1', 'freelancer2'],
    lastMessage: 'Когда сможете начать работу?',
    lastMessageTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    unreadCount: { 'user1': 0, 'freelancer2': 1 },
    type: 'project',
    avatar: '/images/default-avatar.jpg',
    status: 'active',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  }
];
const demoOrderCards: OrderCard[] = [
  {
    $id: 'order-1',
    orderId: 'AI-2025-001',
    userId: 'user1',
    type: 'ai_order',
    title: '🎨 AI Дизайн логотипа для стартапа',
    description: 'Создание современного логотипа для IT стартапа с использованием нейросетей.',
    status: 'in_progress',
    amount: 15000,
    currency: 'RUB',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    clientName: 'Александр К.',
    specialistName: 'Алекс AI',
    category: 'design',
    skills: ['AI Design', 'Branding', 'Logo', 'Figma'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    unreadCount: 3,
    progress: 65,
    conversationId: 'conv-1'
  }
];
// Demo unified order
const demoUnifiedOrder: UnifiedOrder = {
  $id: 'unified-order-1',
  orderId: 'AI-2025-001',
  type: 'ai_order',
  title: '🎨 AI Дизайн логотипа для стартапа',
  description: 'Создание современного логотипа для IT стартапа с использованием нейросетей и современных дизайн-принципов.',
  status: 'in_progress',
  totalAmount: 15000,
  currency: 'RUB',
  progress: 65,
  
  clientId: 'demo-user',
  clientName: 'Александр К.',
  clientAvatar: '/images/default-avatar.jpg',
  workerId: 'alex-ai',
  workerName: 'Алекс AI',
  workerAvatar: '/images/specialists/alex-ai.jpg',
  workerType: 'ai_specialist',
  
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  
  category: 'design',
  skills: ['AI Design', 'Branding', 'Logo', 'Figma'],
  priority: 'high',
  requirements: [
    'Современный минималистичный дизайн',
    'Подходит для IT компании',
    'Векторный формат',
    'Несколько цветовых вариантов'
  ],
  
  milestones: [
    {
      id: 'milestone-1',
      title: 'Initial Concepts',
      description: 'Create 3-5 initial logo concepts based on requirements',
      status: 'completed',
      percentage: 40,
      amount: 6000,
      completedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      deliverables: [
        {
          id: 'deliverable-1',
          name: 'Logo Concepts v1.pdf',
          url: '/demo/logo-concepts.pdf',
          type: 'file',
          uploadedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          uploadedBy: 'alex-ai',
          description: '5 initial logo concepts with variations'
        }
      ],
      approvedBy: 'demo-user',
      approvedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      rating: 5,
      feedback: 'Отличные концепты! Особенно понравился вариант #3.'
    },
    {
      id: 'milestone-2',
      title: 'Refinement & Variations',
      description: 'Refine selected concept and create color variations',
      status: 'in_progress',
      percentage: 35,
      amount: 5250,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'milestone-3',
      title: 'Final Delivery',
      description: 'Final logo files in all required formats',
      status: 'pending',
      percentage: 25,
      amount: 3750,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  payments: [
    {
      id: 'payment-1',
      milestoneId: 'milestone-1',
      amount: 6000,
      currency: 'RUB',
      status: 'completed',
      description: 'Payment for initial concepts',
      processedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      releasedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      escrowStatus: 'released',
      platformFee: 300,
      workerReceives: 5700
    },
    {
      id: 'payment-2',
      milestoneId: 'milestone-2',
      amount: 5250,
      currency: 'RUB',
      status: 'pending',
      description: 'Payment for refinement phase',
      escrowStatus: 'held'
    },
    {
      id: 'payment-3',
      milestoneId: 'milestone-3',
      amount: 3750,
      currency: 'RUB',
      status: 'pending',
      description: 'Final delivery payment',
      escrowStatus: 'held'
    }
  ],
  
  timeline: [
    {
      id: 'event-1',
      type: 'created',
      title: 'Order Created',
      description: 'AI Design order created by client',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      userId: 'demo-user',
      userType: 'client'
    },
    {
      id: 'event-2',
      type: 'started',
      title: 'Work Started',
      description: 'AI specialist began working on the project',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      userId: 'alex-ai',
      userType: 'worker'
    },
    {
      id: 'event-3',
      type: 'milestone_completed',
      title: 'Initial Concepts Completed',
      description: 'First milestone completed with 5 logo concepts',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      userId: 'alex-ai',
      userType: 'worker',
      data: { 
        milestoneId: 'milestone-1',
        deliverables: 1
      }
    },
    {
      id: 'event-4',
      type: 'milestone_approved',
      title: 'Concepts Approved',
      description: 'Client approved initial concepts with 5-star rating',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      userId: 'demo-user',
      userType: 'client',
      data: {
        milestoneId: 'milestone-1',
        rating: 5,
        paymentAmount: 6000
      }
    }
  ],
  
  conversationId: 'conv-1',
  lastActivity: new Date().toISOString(),
  
  metadata: {
    specialistType: 'design',
    aiModel: 'advanced-design-v2',
    clientIndustry: 'technology',
    brandGuidelines: 'modern, minimalist, tech-focused',
    revisions: 1,
    priorityLevel: 'high'
  }
};
export default function EnhancedMessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthContext();
  // State
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [currentConversation, setCurrentConversation] = useState<EnhancedConversation | null>(null);
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [conversations, setConversations] = useState<EnhancedConversation[]>(demoConversations);
  const [orderCards, setOrderCards] = useState<OrderCard[]>(demoOrderCards);
  const [unifiedOrders, setUnifiedOrders] = useState<UnifiedOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'conversations' | 'orders'>('conversations');
  const [viewMode, setViewMode] = useState<'chat' | 'order_timeline'>('chat');
  const [newMessage, setNewMessage] = useState('');
  // Load initial data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    }
  }, [isAuthenticated, user]);
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load real conversations from database
      const userConversations = await EnhancedMessagingService.getUserConversations(user.$id);
      setConversations(userConversations);
      
      // Load unified orders
      const clientOrders = await UnifiedOrderService.getUserOrders(user.$id, 'client');
      const workerOrders = await UnifiedOrderService.getUserOrders(user.$id, 'worker');
      const allOrders = [...clientOrders, ...workerOrders];
      setUnifiedOrders(allOrders);
      
      // Load demo order cards for now
      setOrderCards(demoOrderCards);
      setUnifiedOrders([demoUnifiedOrder]);
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      // Fallback to demo data
      setConversations(demoConversations);
      setOrderCards(demoOrderCards);
      setUnifiedOrders([]);
    } finally {
      setLoading(false);
    }
  };
  // Load conversation messages  
  const loadConversationMessages = useCallback(async (conversationId: string) => {
    if (!conversationId || !user) return;
    try {
      // Load real messages from database
      const conversationMessages = await EnhancedMessagingService.getConversationMessages(conversationId);
      setMessages(conversationMessages.reverse()); // Reverse to show chronologically
      
      // Mark messages as read
      await EnhancedMessagingService.markMessagesAsRead(conversationId, user.$id);
      
      // Update conversation in state
      setCurrentConversation(conversations.find(c => c.$id === conversationId) || null);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      // Fallback to demo messages
      const demoMessages: EnhancedMessage[] = [
        {
          $id: 'msg-1',
          conversationId,
          senderId: user.$id,
          receiverId: 'alex-ai',
          content: 'Привет! Как дела с проектом дизайна логотипа?',
          messageType: 'text',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true,
          status: 'read',
          senderName: user.name || 'Вы',
          senderAvatar: user.avatar
        },
        {
          $id: 'msg-2',
          conversationId,
          senderId: 'alex-ai',
          receiverId: user.$id,
          content: 'Привет! Отлично работаю над концепцией. Уже готов первый вариант дизайна 🎨',
          messageType: 'text',
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          read: false,
          status: 'delivered',
          senderName: 'Алекс AI',
          senderAvatar: '/images/specialists/alex-ai.jpg'
        }
      ];
      setMessages(demoMessages);
      setCurrentConversation(conversations.find(c => c.$id === conversationId) || null);
    }
  }, [user, conversations]);
  // Handle conversation selection
  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversation(conversationId);
    loadConversationMessages(conversationId);
  }, [loadConversationMessages]);
  // Handle order selection
  const handleSelectOrder = useCallback((orderId: string) => {
    console.log('📋 Selecting order:', orderId);
    
    // Find order in unified orders
    const order = unifiedOrders.find(o => o.orderId === orderId);
    if (order) {
      setSelectedOrder(order);
      setViewMode('order_timeline');
      
      // Also load the conversation
      if (order.conversationId) {
        handleSelectConversation(order.conversationId);
      }
    } else {
      // Fallback to old logic for demo orders
    const orderConversationId = `order-${orderId}`;
    handleSelectConversation(orderConversationId);
    }
  }, [unifiedOrders, handleSelectConversation]);
  // Handle order updates
  const handleUpdateOrder = useCallback(async (orderId: string, updates: Partial<UnifiedOrder>) => {
    try {
      const updatedOrder = await UnifiedOrderService.updateOrder(orderId, updates, user.$id, 'client');
      
      // Update in state
      setUnifiedOrders(prev => prev.map(order => 
        order.orderId === orderId ? updatedOrder : order
      ));
      
      // Update selected order if it's the current one
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(updatedOrder);
      }
      
    } catch (error) {
      console.error('❌ Error updating order:', error);
      alert('Не удалось обновить заказ. Попробуйте еще раз.');
    }
  }, [user, selectedOrder]);
  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation || !user || sending) return;
    setSending(true);
    try {
      // Find conversation to get receiver
      const conversation = conversations.find(c => c.$id === selectedConversation);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      // Find receiver (other participant)
      const receiverId = conversation.participants.find(p => p !== user.$id) || 'alex-ai';
      
      // Send message to database
      const sentMessage = await EnhancedMessagingService.sendMessage({
        conversationId: selectedConversation,
        senderId: user.$id,
        receiverId,
        content: newMessage.trim(),
        messageType: 'text',
        senderName: user.name || 'Вы',
        senderAvatar: user.avatar
      });
      // Add message to state
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      // Update conversation in state
      const updatedConversations = conversations.map(conv => 
        conv.$id === selectedConversation 
          ? {
              ...conv,
              lastMessage: newMessage.trim(),
              lastMessageTime: sentMessage.timestamp,
              updatedAt: sentMessage.timestamp
            }
          : conv
      );
      setConversations(updatedConversations);
      // Simulate AI response for AI specialists
      if (receiverId === 'alex-ai') {
        setTimeout(async () => {
          try {
            const aiResponse = await EnhancedMessagingService.sendMessage({
              conversationId: selectedConversation,
          senderId: 'alex-ai',
          receiverId: user.$id,
              content: getAIResponse(newMessage.trim()),
              messageType: 'ai_response',
              senderName: 'Алекс AI',
              senderAvatar: '/images/specialists/alex-ai.jpg'
            });
        
        setMessages(prev => [...prev, aiResponse]);
          } catch (error) {
            console.error('Error sending AI response:', error);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Show error to user
      alert('Не удалось отправить сообщение. Попробуйте еще раз.');
    } finally {
      setSending(false);
    }
  }, [newMessage, selectedConversation, user, sending, conversations]);
  // Handle order timeline messages
  const handleOrderTimelineMessage = useCallback(async (content: string, type: 'text' | 'milestone' | 'payment' = 'text') => {
    if (!selectedOrder || !selectedConversation) return;
    
    // Set the message content and send
    setNewMessage(content);
    await handleSendMessage();
    
    // Add specific formatting for milestone/payment messages
    if (type === 'milestone') {
      // Add milestone-specific styling or data
    } else if (type === 'payment') {
      // Add payment-specific styling or data
    }
  }, [selectedOrder, selectedConversation, handleSendMessage]);
  // Create new conversation
  const handleCreateNewConversation = useCallback(async (
    participantId: string,
    participantName: string,
    type: 'ai_specialist' | 'direct' = 'direct'
  ) => {
    if (!user) return;
    try {
      const conversation = await EnhancedMessagingService.getOrCreateConversation(
        [user.$id, participantId],
        type === 'ai_specialist' 
          ? `${participantName} - AI Специалист`
          : `Чат с ${participantName}`,
        type,
        {
          participantName,
          participantId,
          avatar: type === 'ai_specialist' 
            ? `/images/specialists/${participantId}.jpg`
            : '/images/default-avatar.jpg'
        }
      );
      // Add to conversations list if not exists
      const existingConv = conversations.find(c => c.$id === conversation.$id);
      if (!existingConv) {
        setConversations(prev => [conversation, ...prev]);
      }
      // Select the conversation
      handleSelectConversation(conversation.$id!);
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      alert('Не удалось создать разговор. Попробуйте еще раз.');
    }
  }, [user, conversations, handleSelectConversation]);
  // Quick start AI conversation
  const handleStartAIConversation = useCallback(() => {
    handleCreateNewConversation('alex-ai', 'Алекс AI', 'ai_specialist');
  }, [handleCreateNewConversation]);
  // Get AI response
  const getAIResponse = (userMessage: string): string => {
    const responses = [
      'Понял! Работаю над вашим запросом. Скоро пришлю варианты 🤖✨',
      'Отличная идея! Уже начинаю работу над концепцией 🎨',
      'Учту все ваши пожелания. В течение часа будет готов первый вариант 📝',
      'Спасибо за уточнения! Это поможет сделать результат еще лучше 👍',
      'Работаю над этим. Покажу несколько вариантов на выбор ⚡',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  // Format time
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // Format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      });
    }
  };
  // Render message status icon
  const MessageStatusIcon = ({ status }: { status: EnhancedMessage['status'] }) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400 animate-pulse" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Загрузка сообщений...</p>
          </div>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Войдите для доступа к сообщениям</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Войдите в систему, чтобы общаться с AI специалистами и управлять заказами
            </p>
              <button
                onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-medium transition-all"
              >
                Войти в систему
              </button>
          </div>
        </div>
      </div>
    );
  }
      return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      {/* Main Content with proper padding */}
      <div className="pt-16 md:pt-20">
        <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
          {/* Sidebar */}
          <div className={cn(
            "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300",
            "flex flex-col",
            selectedConversation 
              ? "w-0 lg:w-80 xl:w-96 overflow-hidden lg:overflow-visible" 
              : "w-full lg:w-80 xl:w-96"
          )}>
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Сообщения
                </h1>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all">
                    <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 rounded-xl bg-purple-100/50 dark:bg-purple-900/20 hover:bg-purple-200/50 dark:hover:bg-purple-800/30 transition-all">
                    <Plus className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
                  </button>
            </div>
              </div>
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-1">
              {['conversations', 'orders'].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view as any)}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeView === view
                      ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  {view === 'conversations' ? 'Чаты' : 'Заказы'}
                </button>
          ))}
        </div>
            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeView === 'conversations' ? (
              <div className="p-4 space-y-2">
                {conversations.map((conversation) => {
                  const userUnreadCount = user ? (conversation.unreadCount[user.$id] || 0) : 0;
                  
      return (
                    <div
                      key={conversation.$id}
                      onClick={() => conversation.$id && handleSelectConversation(conversation.$id)}
                      className={cn(
                        "p-4 rounded-xl cursor-pointer transition-all",
                        selectedConversation === conversation.$id
                          ? "bg-purple-100/50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-700/30"
                          : "bg-white/50 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {conversation.type === 'ai_specialist' ? (
                              <Bot className="w-6 h-6" />
                            ) : (
                              conversation.title.charAt(0).toUpperCase()
                            )}
          </div>
                          {userUnreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                              {userUnreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {conversation.title}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(conversation.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
        </div>
      );
                })}
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {/* Unified Orders */}
                {unifiedOrders.length > 0 ? (
                  unifiedOrders.map((order) => (
                    <div
                      key={order.$id}
                      onClick={() => handleSelectOrder(order.orderId)}
                      className="p-4 bg-white/50 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl border border-gray-200/30 dark:border-gray-700/30 cursor-pointer transition-all"
                    >
                      {/* Order Header */}
            <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            {order.type === 'ai_order' ? (
                              <Bot className="w-4 h-4 text-white" />
                            ) : (
                              <Briefcase className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                              {order.title}
              </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              #{order.orderId}
                            </p>
                          </div>
                        </div>
              <span className={cn(
                "px-2 py-1 rounded-lg text-xs font-medium",
                          order.status === 'in_progress' && "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
                          order.status === 'pending' && "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
                          order.status === 'completed' && "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                          order.status === 'review' && "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
                          order.status === 'revision' && "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                        )}>
                          {order.status === 'in_progress' && 'В работе'}
                          {order.status === 'pending' && 'Ожидает'}
                          {order.status === 'completed' && 'Завершен'}
                          {order.status === 'review' && 'На проверке'}
                          {order.status === 'revision' && 'Доработка'}
                          {order.status === 'cancelled' && 'Отменен'}
              </span>
            </div>
                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {order.description}
                      </p>
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-1">
                          <span>Прогресс</span>
                          <span>{order.progress}%</span>
            </div>
                        <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${order.progress}%` }}
                          />
          </div>
      </div>
                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-3">
                          <span>
                            {user?.$id === order.clientId ? order.workerName : order.clientName}
                          </span>
                          {order.deadline && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(order.deadline).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-semibold">
                            {order.totalAmount.toLocaleString()} {order.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback to demo order cards
                  orderCards.map((order) => (
                    <div
                      key={order.$id}
                      onClick={() => handleSelectOrder(order.orderId)}
                      className="p-4 bg-white/50 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl border border-gray-200/30 dark:border-gray-700/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {order.title}
                        </h3>
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-xs font-medium",
                          order.status === 'in_progress' && "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
                          order.status === 'pending' && "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
                          order.status === 'completed' && "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        )}>
                          {order.status === 'in_progress' && 'В работе'}
                          {order.status === 'pending' && 'Ожидает'}
                          {order.status === 'completed' && 'Завершен'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {order.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{order.clientName}</span>
                        <span className="font-semibold">
                          {order.amount.toLocaleString()} {order.currency}
                        </span>
                      </div>
                    </div>
                  ))
                )}
            </div>
            )}
          </div>
        </div>
        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col",
          selectedConversation ? "flex" : "hidden lg:flex"
        )}>
          {!selectedConversation ? (
            // Empty state
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                  <MessageSquare className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Выберите чат
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  Выберите существующий разговор или создайте новый чат
                </p>
                
                {/* Quick actions */}
                <div className="space-y-3">
                <button
                    onClick={handleStartAIConversation}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
                >
                    <Bot className="w-5 h-5" />
                    <span>Начать чат с AI специалистом</span>
                </button>
                  
                  <button className="w-full bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-medium transition-all border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Найти фрилансера</span>
                  </button>
            </div>
          </div>
        </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedConversation('')}
                      className="lg:hidden p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      <Bot className="w-5 h-5" />
                  </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {currentConversation?.title || 'Чат'}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        В сети
                      </p>
                </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* View Mode Toggle */}
                    {selectedOrder && (
                      <div className="flex items-center space-x-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-1">
                    <button
                          onClick={() => setViewMode('chat')}
                      className={cn(
                            "px-3 py-1 rounded text-sm font-medium transition-all",
                            viewMode === 'chat'
                              ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                          )}
                        >
                          Chat
                    </button>
                    <button
                          onClick={() => setViewMode('order_timeline')}
                      className={cn(
                            "px-3 py-1 rounded text-sm font-medium transition-all",
                            viewMode === 'order_timeline'
                              ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                          )}
                        >
                          Timeline
                    </button>
                </div>
                    )}
                    
                    <button className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all">
                      <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all">
                      <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all">
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Main Content Area */}
              {viewMode === 'order_timeline' && selectedOrder ? (
                // Enhanced Order Timeline
                <div className="flex-1 overflow-y-auto p-4">
                  <EnhancedOrderTimeline 
                    order={selectedOrder}
                    onUpdateOrder={handleUpdateOrder}
                    onSendMessage={handleOrderTimelineMessage}
                  />
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.$id}
                        className={cn(
                          "flex",
                          message.senderId === user?.$id ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-xs lg:max-w-md xl:max-w-lg",
                          message.senderId === user?.$id ? "order-2" : "order-1"
                        )}>
                          <div className={cn(
                            "rounded-2xl px-4 py-3 break-words",
                            message.senderId === user?.$id
                              ? "bg-purple-600 text-white rounded-br-sm"
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50 rounded-bl-sm"
                          )}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          <div className={cn(
                            "flex items-center mt-1 space-x-1 text-xs text-gray-500 dark:text-gray-400",
                            message.senderId === user?.$id ? "justify-end" : "justify-start"
                          )}>
                            <span>{formatTime(message.timestamp)}</span>
                            {message.senderId === user?.$id && (
                              <MessageStatusIcon status={message.status} />
                )}
              </div>
            </div>
          </div>
                    ))}
                  </div>
                  {/* Message Input */}
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4">
                    <div className="flex items-end space-x-3">
                      <button className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all">
                        <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Напишите сообщение..."
                          rows={1}
                          className="w-full px-4 py-3 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                        />
                </div>
                      <button className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all">
                        <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className={cn(
                          "p-3 rounded-xl transition-all",
                          newMessage.trim() && !sending
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-gray-200/50 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed"
                        )}
                      >
                        <Send className="w-5 h-5" />
                      </button>
              </div>
              </div>
                </>
              )}
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
