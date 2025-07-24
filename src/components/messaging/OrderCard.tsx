'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  Progress, 
  User, 
  MessageCircle, 
  TrendingUp,
  Calendar,
  DollarSign,
  ChevronRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { OrderCard as OrderCardType } from '@/lib/services/ai-order-service';

interface OrderCardProps {
  order: OrderCardType;
  onActionClick?: (action: string, orderId: string) => void;
  className?: string;
}

export default function OrderCard({ order, onActionClick, className = '' }: OrderCardProps) {
  const router = useRouter();

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
      // Navigate to messages with this order's conversation
      router.push(`/en/messages?ai_order=${order.orderId}`);
    } else if (actionType === 'view_progress') {
      // Navigate to project details
      router.push(`/en/projects/${order.orderId}`);
    } else if (onActionClick) {
      onActionClick(actionType, order.orderId);
    }
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 hover:border-gray-600/50 transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">AI Order</span>
        </div>
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="capitalize">{order.status.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Specialist Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <img
            src={order.specialist.avatar}
            alt={order.specialist.name}
            className="w-10 h-10 rounded-xl object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(order.specialist.name)}&background=6366f1&color=fff`;
            }}
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-2 h-2 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{order.specialist.name}</h3>
          <p className="text-xs text-gray-400 truncate">{order.specialist.title}</p>
        </div>
      </div>

      {/* Project Title */}
      <h4 className="font-medium text-white mb-2 line-clamp-2">{order.title}</h4>
      
      {/* Description */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{order.description}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400">Progress</span>
          <span className="text-xs font-bold text-white">{order.progress}%</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${order.progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Time Left</p>
            <p className="text-sm font-medium text-white">{order.timeRemaining}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Status</p>
            <p className="text-sm font-medium text-white capitalize">{order.status.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {order.actions.map((action, index) => {
          const isPrimary = action.variant === 'primary';
          const isSuccess = action.variant === 'success';
          const isWarning = action.variant === 'warning';
          
          return (
            <button
              key={index}
              onClick={() => handleActionClick(action.action)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 ${
                isPrimary ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600' :
                isSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600' :
                isWarning ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600' :
                'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <span className="flex items-center space-x-2">
                {action.action === 'open_chat' && <MessageCircle className="w-4 h-4" />}
                {action.action === 'view_progress' && <TrendingUp className="w-4 h-4" />}
                {action.action === 'start_work' && <PlayCircle className="w-4 h-4" />}
                <span>{action.label}</span>
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Last Update */}
      <div className="mt-3 pt-3 border-t border-gray-700/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Last update</span>
          <span className="text-gray-400">
            {new Date(order.lastUpdate).toLocaleDateString('en-US', {
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