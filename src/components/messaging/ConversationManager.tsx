"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { MessagesService, Conversation } from '@/lib/messages-service';
import { databases, DATABASE_ID, Query } from '@/lib/appwrite/database';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Search,
  Users,
  Plus,
  Star,
  Archive,
  Settings,
  Filter,
  SortAsc,
  MoreVertical,
  Bell,
  BellOff,
  Pin,
  Trash2,
  Edit3,
  X,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Bot,
  Briefcase,
  Zap,
  Heart,
  Target,
  TrendingUp,
  Award,
  Sparkles,
  RefreshCw,
  Coffee,
  ChevronDown,
  ChevronRight,
  Circle,
  Dot
} from 'lucide-react';

interface ConversationManagerProps {
  selectedConversation: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation?: (conversation: Conversation) => void;
}

interface OrderCard {
  $id: string;
  orderId: string;
  userId: string;
  type: 'ai_order' | 'job' | 'project';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  currency: string;
  deadline?: string;
  clientName: string;
  specialistName?: string;
  freelancerName?: string;
  category: string;
  skills: string[];
  createdAt: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  unreadCount?: number;
}

interface ExtendedConversation extends Conversation {
  lastMessagePreview?: string;
  isOnline?: boolean;
  avatar?: string;
  userName?: string;
  userType?: 'client' | 'freelancer' | 'ai_specialist' | 'support';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  isPinned?: boolean;
  isArchived?: boolean;
  hasUnread?: boolean;
  typing?: boolean;
}

const SAMPLE_ORDER_CARDS: OrderCard[] = [
  {
    $id: 'order-1',
    orderId: 'AI-2025-001',
    userId: 'user1',
    type: 'ai_order',
    title: '🎨 AI Дизайн логотипа',
    description: 'Создание современного логотипа для IT стартапа с использованием нейросетей',
    status: 'in_progress',
    amount: 15000,
    currency: 'RUB',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    clientName: 'Александр К.',
    specialistName: 'Алекс AI',
    category: 'design',
    skills: ['AI Design', 'Branding', 'Logo'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    unreadCount: 3
  },
  {
    $id: 'order-2',
    orderId: 'JOB-2025-002',
    userId: 'user1',
    type: 'job',
    title: '💻 Разработка чат-бота',
    description: 'Создание умного telegram-бота для автоматизации продаж',
    status: 'pending',
    amount: 45000,
    currency: 'RUB',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    clientName: 'Мария С.',
    freelancerName: 'Не назначен',
    category: 'development',
    skills: ['Python', 'Telegram API', 'AI'],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    unreadCount: 1
  },
  {
    $id: 'order-3',
    orderId: 'AI-2025-003',
    userId: 'user1',
    type: 'ai_order',
    title: '🎬 AI Видео контент',
    description: 'Создание промо-роликов с AI анимацией для соц. сетей',
    status: 'completed',
    amount: 25000,
    currency: 'RUB',
    clientName: 'Дмитрий Л.',
    specialistName: 'Эмма AI',
    category: 'video',
    skills: ['Video AI', 'Animation', 'SMM'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    priority: 'low'
  }
];

const SAMPLE_CONVERSATIONS: ExtendedConversation[] = [
  {
    $id: 'conv-1',
    participants: ['user1', 'alex-ai'],
    lastMessage: 'Отправил новые варианты логотипа! Посмотри что думаешь 🎨',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: { user1: 2 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessagePreview: 'Отправил новые варианты логотипа! Посмотри что думаешь 🎨',
    isOnline: true,
    avatar: '/images/specialists/alex-ai.svg',
    userName: 'Алекс AI',
    userType: 'ai_specialist',
    priority: 'high',
    isPinned: true,
    hasUnread: true,
    typing: false
  },
  {
    $id: 'conv-2',
    participants: ['user1', 'maria-dev'],
    lastMessage: 'Начинаю работу над чат-ботом. Есть вопросы по техническому заданию',
    lastMessageTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    unreadCount: { user1: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessagePreview: 'Начинаю работу над чат-ботом. Есть вопросы по техническому заданию',
    isOnline: false,
    avatar: '/images/specialists/maria-dev.svg',
    userName: 'Мария Dev',
    userType: 'freelancer',
    priority: 'medium',
    hasUnread: true,
    typing: true
  },
  {
    $id: 'conv-3',
    participants: ['user1', 'support'],
    lastMessage: 'Спасибо за обращение! Проблема решена ✅',
    lastMessageTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    unreadCount: { user1: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessagePreview: 'Спасибо за обращение! Проблема решена ✅',
    isOnline: true,
    avatar: '/images/support-avatar.svg',
    userName: 'Поддержка H-AI',
    userType: 'support',
    priority: 'low'
  }
];

export default function ConversationManager({
  selectedConversation,
  onSelectConversation,
  onNewConversation
}: ConversationManagerProps) {
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [orderCards, setOrderCards] = useState<OrderCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'chats' | 'ai'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'unread'>('time');
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'pinned' | 'archived'>('all');
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    orders: true,
    chats: true,
    ai: true
  });
  
  const messagesService = new MessagesService();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load real conversations or use sample data
      try {
        const realConversations = await messagesService.getUserConversations(user.$id);
        if (realConversations.length > 0) {
          setConversations(realConversations as ExtendedConversation[]);
        } else {
          setConversations(SAMPLE_CONVERSATIONS);
        }
      } catch (error) {
        console.warn('Using sample conversations:', error);
        setConversations(SAMPLE_CONVERSATIONS);
      }

      // Load order cards
      setOrderCards(SAMPLE_ORDER_CARDS);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3 text-amber-400" />;
      case 'in_progress': return <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-green-400" />;
      case 'cancelled': return <AlertCircle className="w-3 h-3 text-red-400" />;
      default: return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-500/5';
      case 'high': return 'border-l-orange-500 bg-orange-500/5';
      case 'medium': return 'border-l-blue-500 bg-blue-500/5';
      case 'low': return 'border-l-green-500 bg-green-500/5';
      default: return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  const getUserTypeIcon = (userType?: string) => {
    switch (userType) {
      case 'ai_specialist': return <Bot className="w-4 h-4 text-purple-400" />;
      case 'freelancer': return <User className="w-4 h-4 text-blue-400" />;
      case 'client': return <Briefcase className="w-4 h-4 text-green-400" />;
      case 'support': return <Heart className="w-4 h-4 text-pink-400" />;
      default: return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredData = () => {
    let filtered = [...conversations, ...orderCards];
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        'title' in item 
          ? item.title.toLowerCase().includes(searchQuery.toLowerCase())
          : item.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab !== 'all') {
      if (activeTab === 'orders') {
        filtered = filtered.filter(item => 'orderId' in item);
      } else if (activeTab === 'chats') {
        filtered = filtered.filter(item => 'participants' in item && !('userType' in item && item.userType === 'ai_specialist'));
      } else if (activeTab === 'ai') {
        filtered = filtered.filter(item => 
          ('participants' in item && 'userType' in item && item.userType === 'ai_specialist') ||
          ('type' in item && item.type === 'ai_order')
        );
      }
    }

    if (filterBy === 'unread') {
      filtered = filtered.filter(item => 
        ('hasUnread' in item && item.hasUnread) || 
        ('unreadCount' in item && item.unreadCount && item.unreadCount > 0)
      );
    } else if (filterBy === 'pinned') {
      filtered = filtered.filter(item => 'isPinned' in item && item.isPinned);
    }

    return filtered;
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderOrderCard = (order: OrderCard) => (
    <div
      key={order.$id}
      onClick={() => onSelectConversation(`order-${order.$id}`)}
      className={cn(
        "group relative p-4 mb-3 rounded-2xl border-l-4 cursor-pointer transition-all duration-300",
        "bg-gradient-to-r from-white/10 to-white/5 dark:from-gray-800/50 dark:to-gray-900/30",
        "backdrop-blur-xl border border-white/20 dark:border-gray-700/30",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20",
        "active:scale-[0.98]",
        getPriorityColor(order.priority),
        selectedConversation === `order-${order.$id}` && "ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/25"
      )}
    >
      {/* Status & Priority Indicators */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(order.status)}
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            {order.type === 'ai_order' ? 'AI Заказ' : order.type === 'job' ? 'Джоб' : 'Проект'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {order.unreadCount && order.unreadCount > 0 && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold">
              {order.unreadCount}
            </div>
          )}
          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg transition-all">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Order Title */}
      <h3 className="font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors">
        {order.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-3 line-clamp-2 leading-relaxed">
        {order.description}
      </p>

      {/* Order Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Бюджет:</span>
          <span className="font-bold text-green-400">
            {order.amount.toLocaleString()} {order.currency}
          </span>
        </div>
        
        {order.deadline && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Дедлайн:</span>
            <span className="text-blue-400">
              {new Date(order.deadline).toLocaleDateString('ru-RU')}
            </span>
          </div>
        )}
      </div>

      {/* Specialist/Freelancer Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            {order.type === 'ai_order' ? 
              <Bot className="w-3 h-3 text-white" /> : 
              <User className="w-3 h-3 text-white" />
            }
          </div>
          <span className="text-xs text-gray-300">
            {order.specialistName || order.freelancerName || 'Не назначен'}
          </span>
        </div>
        
        <span className="text-xs text-gray-500">
          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
        </span>
      </div>

      {/* Skills Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {order.skills.slice(0, 3).map((skill, index) => (
          <span 
            key={index}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/20"
          >
            {skill}
          </span>
        ))}
        {order.skills.length > 3 && (
          <span className="text-xs text-gray-400">
            +{order.skills.length - 3}
          </span>
        )}
      </div>

      {/* Glassmorphism effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
    </div>
  );

  const renderConversation = (conversation: ExtendedConversation) => (
    <div
      key={conversation.$id}
      onClick={() => onSelectConversation(conversation.$id)}
      className={cn(
        "group relative p-4 mb-3 rounded-2xl cursor-pointer transition-all duration-300",
        "bg-gradient-to-r from-white/10 to-white/5 dark:from-gray-800/50 dark:to-gray-900/30",
        "backdrop-blur-xl border border-white/20 dark:border-gray-700/30",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20",
        "active:scale-[0.98]",
        selectedConversation === conversation.$id && "ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/25",
        conversation.hasUnread && "border-l-4 border-l-blue-500"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              {getUserTypeIcon(conversation.userType)}
            </div>
            {conversation.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-white truncate">
                {conversation.userName}
              </h3>
              {conversation.isPinned && (
                <Pin className="w-3 h-3 text-yellow-400" />
              )}
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-400">
                {conversation.userType === 'ai_specialist' ? 'AI Специалист' :
                 conversation.userType === 'freelancer' ? 'Фрилансер' :
                 conversation.userType === 'support' ? 'Поддержка' : 'Клиент'}
              </span>
              {conversation.typing && (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side indicators */}
        <div className="flex flex-col items-end space-y-1">
          <span className="text-xs text-gray-400">
            {new Date(conversation.lastMessageTime).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {conversation.hasUnread && typeof conversation.unreadCount === 'object' && conversation.unreadCount[user?.$id || ''] > 0 && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold">
              {conversation.unreadCount[user?.$id || '']}
            </div>
          )}
        </div>
      </div>

      {/* Last Message Preview */}
      <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
        {conversation.lastMessagePreview || conversation.lastMessage}
      </p>

      {/* Glassmorphism effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl border-r border-gray-700/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-purple-400" />
            Сообщения
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Поиск сообщений и заказов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl">
          {[
            { id: 'all', label: 'Все', icon: Circle },
            { id: 'orders', label: 'Заказы', icon: Briefcase },
            { id: 'chats', label: 'Чаты', icon: MessageSquare },
            { id: 'ai', label: 'AI', icon: Bot }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <tab.icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Фильтры</span>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="time">По времени</option>
                <option value="priority">По приоритету</option>
                <option value="unread">Непрочитанные</option>
              </select>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="all">Все</option>
                <option value="unread">Непрочитанные</option>
                <option value="pinned">Закрепленные</option>
                <option value="archived">Архивированные</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Order Cards Section */}
        {(activeTab === 'all' || activeTab === 'orders' || activeTab === 'ai') && orderCards.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('orders')}
              className="flex items-center justify-between w-full p-2 text-left hover:bg-white/5 rounded-lg transition-colors mb-3"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                <span className="font-medium text-white">Активные заказы</span>
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                  {orderCards.filter(order => 
                    activeTab === 'all' || 
                    (activeTab === 'orders') ||
                    (activeTab === 'ai' && order.type === 'ai_order')
                  ).length}
                </span>
              </div>
              {expandedSections.orders ? 
                <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                <ChevronRight className="w-4 h-4 text-gray-400" />
              }
            </button>
            
            {expandedSections.orders && (
              <div className="space-y-3">
                {orderCards
                  .filter(order => 
                    activeTab === 'all' || 
                    (activeTab === 'orders') ||
                    (activeTab === 'ai' && order.type === 'ai_order')
                  )
                  .map(renderOrderCard)}
              </div>
            )}
          </div>
        )}

        {/* Conversations Section */}
        {(activeTab === 'all' || activeTab === 'chats' || activeTab === 'ai') && conversations.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('chats')}
              className="flex items-center justify-between w-full p-2 text-left hover:bg-white/5 rounded-lg transition-colors mb-3"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                <span className="font-medium text-white">Беседы</span>
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                  {conversations.filter(conv => 
                    activeTab === 'all' || 
                    (activeTab === 'chats' && conv.userType !== 'ai_specialist') ||
                    (activeTab === 'ai' && conv.userType === 'ai_specialist')
                  ).length}
                </span>
              </div>
              {expandedSections.chats ? 
                <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                <ChevronRight className="w-4 h-4 text-gray-400" />
              }
            </button>
            
            {expandedSections.chats && (
              <div className="space-y-3">
                {conversations
                  .filter(conv => 
                    activeTab === 'all' || 
                    (activeTab === 'chats' && conv.userType !== 'ai_specialist') ||
                    (activeTab === 'ai' && conv.userType === 'ai_specialist')
                  )
                  .map(renderConversation)}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredData().length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery ? 'Ничего не найдено' : 'Нет сообщений'}
            </h3>
            <p className="text-gray-400 text-sm">
              {searchQuery 
                ? 'Попробуйте изменить поисковый запрос'
                : 'Начните общение с AI специалистами или создайте заказ'
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            {conversations.filter(c => c.hasUnread).length + orderCards.filter(o => o.unreadCount && o.unreadCount > 0).length} непрочитанных
          </span>
          <span>
            {filteredData().length} всего
          </span>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
        }
      `}</style>
    </div>
  );
} 