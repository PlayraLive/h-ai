'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  User, 
  MessageCircle, 
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Bot,
  Star,
  Zap,
  ExternalLink
} from 'lucide-react';

export interface OrderProject {
  $id: string;
  orderId: string;
  userId: string;
  specialistId: string;
  specialistName: string;
  specialistTitle: string;
  tariffName: string;
  amount: number;
  requirements: string;
  timeline: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  conversationId: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderProjectCardProps {
  order: OrderProject;
  onChatClick?: (orderId: string, conversationId: string) => void;
  className?: string;
}

export default function OrderProjectCard({ 
  order, 
  onChatClick, 
  className = '' 
}: OrderProjectCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'active': return <PlayCircle className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'cancelled': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const handleChatClick = () => {
    if (onChatClick) {
      onChatClick(order.orderId, order.conversationId);
    } else {
      // Перенаправляем в сообщения с конкретным заказом
      router.push(`/en/messages?orderId=${order.orderId}&conversationId=${order.conversationId}`);
    }
  };

  const handleAIChatClick = () => {
    // Перенаправляем в AI чат с контекстом заказа
    router.push(`/en/ai-specialists/${order.specialistId}/chat?orderId=${order.orderId}&conversationType=order_chat`);
  };

  return (
    <div className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 hover:border-purple-400/40 dark:hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 ${className}`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {order.specialistName}
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              {order.specialistTitle}
            </p>
          </div>
        </div>
        
        <div className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-semibold ${getStatusColor(order.status || 'active')}`}>
          {getStatusIcon(order.status || 'active')}
          <span className="capitalize">{order.status || 'active'}</span>
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Тариф:</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{order.tariffName}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Стоимость:</span>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">${order.amount}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Сроки:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{order.timeline}</span>
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Требования:</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {order.requirements}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleChatClick}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-blue-500/25"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Открыть чат</span>
          <ExternalLink className="w-4 h-4" />
        </button>

        <button
          onClick={handleAIChatClick}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-indigo-500/25"
        >
          <Bot className="w-4 h-4" />
          <span>AI чат</span>
          <Zap className="w-4 h-4" />
        </button>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Создан {new Date(order.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">AI Проект</span>
          </div>
        </div>
      </div>
    </div>
  );
} 