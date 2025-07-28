'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  User, 
  MessageCircle, 
  TrendingUp,
  Calendar,
  DollarSign,
  ChevronRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Bot,
  Star,
  Zap
} from 'lucide-react';
import { OrderCard as OrderCardType } from '@/lib/services/ai-order-service';
import { AI_SPECIALIST_CONTEXTS } from '@/lib/services/openai';

interface OrderCardProps {
  order: OrderCardType;
  onActionClick?: (action: string, orderId: string) => void;
  onChatWithSpecialist?: (orderId: string, specialistId: string) => void;
  className?: string;
}

export default function OrderCard({ 
  order, 
  onActionClick, 
  onChatWithSpecialist, 
  className = '' 
}: OrderCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Get specialist context for enhanced display
  const specialistContext = AI_SPECIALIST_CONTEXTS[order.specialist.id];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'active': 
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'revision': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'active':
      case 'in_progress': return <PlayCircle className="w-3 h-3" />;
      case 'revision': return <AlertCircle className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const handleActionClick = (actionType: string) => {
    if (actionType === 'open_chat') {
      // Navigate to regular messages with this order's conversation
      router.push(`/en/messages?ai_order=${order.orderId}&specialist=${order.specialist.id}`);
    } else if (actionType === 'chat_with_specialist') {
      // Navigate to enhanced AI chat with specialist context and order
      router.push(`/en/ai-specialists/${order.specialist.id}/chat?orderId=${order.orderId}&conversationType=order_chat`);
    } else if (actionType === 'view_progress') {
      // Navigate to project details
      router.push(`/en/projects/${order.orderId}`);
    } else if (onActionClick) {
      onActionClick(actionType, order.orderId);
    }
  };

  return (
    <div 
      className={`bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/20 dark:border-gray-700/30 rounded-2xl p-5 hover:border-purple-400/40 dark:hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with enhanced AI indicator */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">AI Specialist</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {specialistContext?.profession || 'AI Professional'}
            </p>
          </div>
        </div>
        <div className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-semibold ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="capitalize">{order.status.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Enhanced Specialist Info */}
      <div className="flex items-center space-x-4 mb-4 p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl border border-gray-200/30 dark:border-gray-600/30">
        <div className="relative">
          <img
            src={order.specialist.avatar}
            alt={order.specialist.name}
            className="w-12 h-12 rounded-xl object-cover border-2 border-purple-400/50"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(order.specialist.name)}&background=6366f1&color=fff`;
            }}
          />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate">{order.specialist.name}</h3>
          <p className="text-sm text-purple-600 dark:text-purple-400 truncate">{order.specialist.title}</p>
          {specialistContext && (
            <div className="flex items-center space-x-2 mt-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{specialistContext.experience}</span>
            </div>
          )}
        </div>
      </div>

      {/* Project Title */}
      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{order.title}</h4>
      
      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{order.description}</p>

      {/* Enhanced Progress with Animation */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Прогресс</span>
          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{order.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${order.progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform translate-x-[-100%] animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center space-x-3 p-3 bg-blue-50/50 dark:bg-blue-500/10 rounded-xl border border-blue-200/30 dark:border-blue-500/20">
          <div className="w-10 h-10 bg-blue-500/20 dark:bg-blue-500/30 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Осталось</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{order.timeRemaining}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-green-50/50 dark:bg-green-500/10 rounded-xl border border-green-200/30 dark:border-green-500/20">
          <div className="w-10 h-10 bg-green-500/20 dark:bg-green-500/30 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-green-600 dark:text-green-400">Статус</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{order.status.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Specialist Context Info */}
      {specialistContext && (
        <div className="mb-4 p-3 bg-purple-50/50 dark:bg-purple-500/10 rounded-xl border border-purple-200/30 dark:border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Экспертиза</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {specialistContext.expertise.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200/50 dark:border-purple-500/30"
              >
                {skill}
              </span>
            ))}
            {specialistContext.expertise.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-full">
                +{specialistContext.expertise.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Actions */}
      <div className="space-y-2">
        {order.actions.map((action, index) => {
          const isPrimary = action.variant === 'primary';
          const isSuccess = action.variant === 'success';
          const isWarning = action.variant === 'warning';
          
          return (
            <button
              key={index}
              onClick={() => handleActionClick(action.action)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                isPrimary ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-purple-500/25' :
                isSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-green-500/25' :
                isWarning ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 shadow-orange-500/25' :
                'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
              }`}
            >
              <span className="flex items-center space-x-3">
                {action.action === 'open_chat' && <MessageCircle className="w-5 h-5" />}
                {action.action === 'chat_with_specialist' && <Bot className="w-5 h-5" />}
                {action.action === 'view_progress' && <TrendingUp className="w-5 h-5" />}
                {action.action === 'start_work' && <PlayCircle className="w-5 h-5" />}
                <span>{action.label}</span>
              </span>
              <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
            </button>
          );
        })}

        {/* AI Chat Quick Action */}
        <button
          onClick={() => handleActionClick('chat_with_specialist')}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-indigo-500/25"
        >
          <Bot className="w-5 h-5" />
          <span>Чат с AI специалистом</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Enhanced Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Последнее обновление</span>
          </div>
          <span className="text-xs font-semibold text-gray-900 dark:text-white">
            {new Date(order.lastUpdate).toLocaleDateString('ru-RU', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
} 