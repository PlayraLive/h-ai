"use client";

import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  Calendar,
  Clock,
  User,
  Bot,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Star,
  StarOff,
  MessageSquare,
  Phone,
  Video,
  FileText,
  Download,
  Share2,
  ExternalLink,
  MoreVertical,
  Edit3,
  Trash2,
  Archive,
  Heart,
  ThumbsUp,
  Award,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Sparkles,
  Coffee,
  Rocket,
  Gem,
  Crown,
  Fire,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Copy,
  Flag,
  Bookmark,
  BookmarkCheck,
  Plus,
  Minus,
  X,
  ArrowRight,
  ArrowLeft,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface OrderCard {
  $id: string;
  orderId: string;
  userId: string;
  type: 'ai_order' | 'job' | 'project' | 'solution';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'paused' | 'review';
  amount: number;
  currency: string;
  deadline?: string;
  clientName: string;
  specialistName?: string;
  freelancerName?: string;
  category: string;
  skills: string[];
  createdAt: string;
  updatedAt?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  milestones?: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  rating?: number;
  reviews?: number;
  specialistId?: string;
  clientId?: string;
  conversationId?: string;
  isBookmarked?: boolean;
  isArchived?: boolean;
  lastActivity?: string;
}

interface EnhancedOrderCardsProps {
  orderCard: OrderCard;
  compact?: boolean;
  showActions?: boolean;
  onAction?: (action: string, data: any) => void;
  className?: string;
  interactive?: boolean;
  showProgress?: boolean;
  showMilestones?: boolean;
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    label: 'Ожидает'
  },
  in_progress: {
    icon: RefreshCw,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    label: 'В работе'
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    label: 'Завершен'
  },
  cancelled: {
    icon: AlertCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    label: 'Отменен'
  },
  paused: {
    icon: PauseCircle,
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/20',
    label: 'Приостановлен'
  },
  review: {
    icon: Eye,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    label: 'На проверке'
  }
};

const PRIORITY_CONFIG = {
  low: {
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-l-green-500',
    label: 'Низкий'
  },
  medium: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-l-blue-500',
    label: 'Средний'
  },
  high: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-l-orange-500',
    label: 'Высокий'
  },
  urgent: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-l-red-500',
    label: 'Срочный'
  }
};

const TYPE_CONFIG = {
  ai_order: {
    icon: Bot,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    label: 'AI Заказ',
    gradient: 'from-purple-500 to-pink-500'
  },
  job: {
    icon: Briefcase,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    label: 'Джоб',
    gradient: 'from-blue-500 to-cyan-500'
  },
  project: {
    icon: Target,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    label: 'Проект',
    gradient: 'from-green-500 to-emerald-500'
  },
  solution: {
    icon: Gem,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    label: 'Решение',
    gradient: 'from-indigo-500 to-purple-500'
  }
};

export default function EnhancedOrderCards({
  orderCard,
  compact = false,
  showActions = true,
  onAction,
  className = '',
  interactive = true,
  showProgress = true,
  showMilestones = false
}: EnhancedOrderCardsProps) {
  const { user } = useAuthContext();
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(orderCard.isBookmarked || false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const statusConfig = STATUS_CONFIG[orderCard.status];
  const priorityConfig = orderCard.priority ? PRIORITY_CONFIG[orderCard.priority] : null;
  const typeConfig = TYPE_CONFIG[orderCard.type];

  const isOwnOrder = orderCard.userId === user?.$id || orderCard.clientId === user?.$id;
  const isAssigned = orderCard.specialistId === user?.$id || orderCard.freelancerName;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'только что';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ч назад`;
    } else if (diffInHours < 48) {
      return 'вчера';
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) {
      return { text: 'Просрочен', color: 'text-red-400', urgent: true };
    } else if (diffInDays === 0) {
      return { text: 'Сегодня', color: 'text-orange-400', urgent: true };
    } else if (diffInDays === 1) {
      return { text: 'Завтра', color: 'text-yellow-400', urgent: false };
    } else if (diffInDays <= 3) {
      return { text: `${diffInDays} дня`, color: 'text-blue-400', urgent: false };
    } else {
      return { text: date.toLocaleDateString('ru-RU'), color: 'text-gray-400', urgent: false };
    }
  };

  const handleAction = (action: string, data?: any) => {
    onAction?.(action, { ...orderCard, action, ...data });
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    handleAction('bookmark', { bookmarked: !isBookmarked });
  };

  const deadlineInfo = formatDeadline(orderCard.deadline);

  return (
    <div
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        compact ? "p-4" : "p-6",
        priorityConfig && `border-l-4 ${priorityConfig.border}`,
        "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-800/50 dark:to-gray-900/30",
        "backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl",
        interactive && "hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer",
        "active:scale-[0.98]",
        className
      )}
      onClick={() => interactive && handleAction('view', orderCard)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br",
          typeConfig.gradient
        )} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
      </div>

      {/* Header */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Type Icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r",
            typeConfig.gradient,
            "shadow-lg"
          )}>
            <typeConfig.icon className="w-6 h-6 text-white" />
          </div>

          {/* Order Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={cn(
                "font-bold text-white line-clamp-1",
                compact ? "text-base" : "text-lg"
              )}>
                {orderCard.title}
              </h3>
              {orderCard.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-yellow-400 font-medium">
                    {orderCard.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span className={cn("font-medium", typeConfig.color)}>
                {typeConfig.label}
              </span>
              <span>•</span>
              <span>{orderCard.orderId}</span>
              {priorityConfig && (
                <>
                  <span>•</span>
                  <span className={priorityConfig.color}>
                    {priorityConfig.label}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Status Badge */}
          <div className={cn(
            "flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium",
            statusConfig.bg,
            statusConfig.border,
            statusConfig.color
          )}>
            <statusConfig.icon className="w-3 h-3" />
            <span>{statusConfig.label}</span>
          </div>

          {/* Bookmark */}
          {showActions && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark();
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-yellow-400" />
              ) : (
                <Bookmark className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}

          {/* Menu */}
          {showActions && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50">
                  <div className="py-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('message');
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Написать</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('call');
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Позвонить</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('share');
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Поделиться</span>
                    </button>
                    {isOwnOrder && (
                      <>
                        <hr className="my-2 border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('edit');
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Редактировать</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('archive');
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                        >
                          <Archive className="w-4 h-4" />
                          <span>Архивировать</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('delete');
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900/50 text-sm text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Удалить</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className={cn(
        "text-gray-300 leading-relaxed mb-4",
        compact ? "text-sm line-clamp-2" : showFullDescription ? "" : "line-clamp-3"
      )}>
        {orderCard.description}
      </p>

      {!compact && orderCard.description.length > 150 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowFullDescription(!showFullDescription);
          }}
          className="text-purple-400 hover:text-purple-300 text-sm mb-4 transition-colors"
        >
          {showFullDescription ? 'Свернуть' : 'Показать полностью'}
        </button>
      )}

      {/* Progress Bar */}
      {showProgress && orderCard.progress !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Прогресс</span>
            <span className="text-sm font-medium text-white">
              {orderCard.progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full bg-gradient-to-r transition-all duration-500",
                typeConfig.gradient
              )}
              style={{ width: `${orderCard.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Milestones */}
      {showMilestones && orderCard.milestones && orderCard.milestones.length > 0 && (
        <div className="mb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors mb-2"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span>Этапы ({orderCard.milestones.filter(m => m.completed).length}/{orderCard.milestones.length})</span>
          </button>
          
          {expanded && (
            <div className="space-y-2 pl-6">
              {orderCard.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center space-x-2 text-sm">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    milestone.completed 
                      ? "bg-green-500 border-green-500" 
                      : "border-gray-500"
                  )}>
                    {milestone.completed && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={cn(
                    milestone.completed ? "text-gray-400 line-through" : "text-gray-300"
                  )}>
                    {milestone.title}
                  </span>
                  {milestone.dueDate && (
                    <span className="text-xs text-gray-500">
                      ({formatDate(milestone.dueDate)})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Budget */}
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <DollarSign className="w-3 h-3" />
            <span>Бюджет</span>
          </div>
          <p className="font-bold text-green-400">
            {orderCard.amount.toLocaleString()} {orderCard.currency}
          </p>
        </div>

        {/* Deadline */}
        {deadlineInfo && (
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Дедлайн</span>
            </div>
            <p className={cn(
              "font-medium",
              deadlineInfo.color,
              deadlineInfo.urgent && "animate-pulse"
            )}>
              {deadlineInfo.text}
            </p>
          </div>
        )}

        {/* Specialist/Freelancer */}
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            {orderCard.type === 'ai_order' ? (
              <Bot className="w-3 h-3" />
            ) : (
              <User className="w-3 h-3" />
            )}
            <span>
              {orderCard.type === 'ai_order' ? 'AI Специалист' : 'Исполнитель'}
            </span>
          </div>
          <p className="font-medium text-white text-sm">
            {orderCard.specialistName || orderCard.freelancerName || 'Не назначен'}
          </p>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Target className="w-3 h-3" />
            <span>Категория</span>
          </div>
          <p className="font-medium text-white text-sm capitalize">
            {orderCard.category}
          </p>
        </div>
      </div>

      {/* Skills */}
      {orderCard.skills && orderCard.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {orderCard.skills.slice(0, compact ? 3 : 6).map((skill, index) => (
              <span
                key={index}
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium border",
                  typeConfig.bg,
                  typeConfig.color,
                  "border-current/20"
                )}
              >
                {skill}
              </span>
            ))}
            {orderCard.skills.length > (compact ? 3 : 6) && (
              <span className="px-2 py-1 rounded-full text-xs text-gray-400 bg-gray-500/10">
                +{orderCard.skills.length - (compact ? 3 : 6)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Attachments */}
      {orderCard.attachments && orderCard.attachments.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
            <FileText className="w-3 h-3" />
            <span>Вложения ({orderCard.attachments.length})</span>
          </div>
          <div className="flex space-x-2">
            {orderCard.attachments.slice(0, 3).map((attachment) => (
              <button
                key={attachment.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('download', attachment);
                }}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-xs transition-colors"
              >
                <Download className="w-3 h-3" />
                <span className="truncate max-w-20">{attachment.name}</span>
              </button>
            ))}
            {orderCard.attachments.length > 3 && (
              <span className="flex items-center px-2 py-1 bg-gray-700/50 rounded-lg text-xs text-gray-400">
                +{orderCard.attachments.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <span>Создан {formatDate(orderCard.createdAt)}</span>
          {orderCard.lastActivity && (
            <>
              <span>•</span>
              <span>Активность {formatDate(orderCard.lastActivity)}</span>
            </>
          )}
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('message');
              }}
              className="p-1 hover:bg-white/10 rounded"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('view');
              }}
              className="p-1 hover:bg-white/10 rounded"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Glassmorphism effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Click outside handler for menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
} 