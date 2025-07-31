"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Conversation } from '@/lib/messages-service';
import { cn } from '@/lib/utils';
import {
  Send,
  Smile,
  Paperclip,
  Mic,
  MicOff,
  Image as ImageIcon,
  File,
  Video,
  Phone,
  VideoIcon,
  Info,
  Search,
  MoreVertical,
  Reply,
  Forward,
  Copy,
  Edit3,
  Trash2,
  Star,
  StarOff,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Bot,
  User,
  Zap,
  Sparkles,
  Plus,
  X,
  ArrowLeft,
  ChevronDown,
  Calendar,
  DollarSign,
  Briefcase,
  Eye,
  EyeOff,
  Settings,
  Shield,
  Lock,
  Globe
} from 'lucide-react';
import PositiveSpecialistAvatar from '@/components/PositiveSpecialistAvatar';
import { ConfirmationModal } from '@/components/Modal';
import { 
  hapticFeedback, 
  formatMessageTime, 
  formatFileSize, 
  createTouchGesture, 
  copyToClipboard,
  isMobile,
  isTouch
} from '@/lib/utils';

interface Message {
  $id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: string;
  messageType: 'text' | 'image' | 'file' | 'voice' | 'video' | 'system' | 'order_card' | 'job_card' | 'ai_response';
  isRead: boolean;
  isEdited?: boolean;
  editedAt?: string;
  replyTo?: string;
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  orderData?: any;
  jobData?: any;
  isDeleted?: boolean;
  isForwarded?: boolean;
  forwardedFrom?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  senderName?: string;
  senderAvatar?: string;
}

interface EnhancedChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>;
  onReplyToMessage?: (messageId: string) => void;
  loading?: boolean;
}

const EMOJI_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '😡'];

const QUICK_REPLIES = [
  '👍 Понятно',
  '✅ Согласен',
  '🤔 Подумаю',
  '⚡ Срочно',
  '📅 Перенесем',
  '💰 Обсудим цену'
];

export default function EnhancedChatWindow({
  conversation,
  messages,
  onSendMessage,
  onDeleteMessage,
  onEditMessage,
  onReplyToMessage,
  loading = false
}: EnhancedChatWindowProps) {
  const { user } = useAuthContext();
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  // Добавляем состояние для модала удаления
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    messageId: string;
    messageContent: string;
  } | null>(null);

  // Improved touch gesture handler with haptic feedback
  const [swipeAction, setSwipeAction] = useState<{
    messageId: string;
    action: 'reply' | 'delete';
  } | null>(null);

  // Improved touch gesture handler with haptic feedback
  const [longPressMessage, setLongPressMessage] = useState<string | null>(null);

  // Добавляем новые состояния для модала подтверждения
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Debug: Log when messages prop changes
  useEffect(() => {
    console.log('💬 EnhancedChatWindow received messages update:', {
      messageCount: messages.length,
      conversationId: conversation?.$id,
      messages: messages.map(m => ({ id: m.$id, content: m.content, sender: m.senderId }))
    });
  }, [messages, conversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    console.log('📜 Scrolling to bottom due to messages change');
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (inputMessage.trim()) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [inputMessage]);

  const scrollToBottom = () => {
    console.log('⬇️ Executing scrollToBottom');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    console.log('📤 EnhancedChatWindow handleSend called:', {
      inputMessage: inputMessage.trim(),
      attachments: attachments.length,
      voiceBlob: !!voiceBlob
    });

    if (!inputMessage.trim() && attachments.length === 0 && !voiceBlob) {
      console.log('❌ EnhancedChatWindow handleSend: nothing to send');
      return;
    }

    try {
      console.log('🚀 EnhancedChatWindow calling onSendMessage...');
      if (voiceBlob) {
        // Handle voice message
        const file = new File([voiceBlob], 'voice-message.webm', { type: 'audio/webm' });
        await onSendMessage('🎤 Голосовое сообщение', [file]);
        setVoiceBlob(null);
        setAudioUrl(null);
      } else {
        await onSendMessage(inputMessage, attachments);
      }
      
      console.log('✅ EnhancedChatWindow onSendMessage completed, clearing input');
      setInputMessage('');
      setAttachments([]);
      setReplyingTo(null);
      setShowQuickReplies(false);
      inputRef.current?.focus();
    } catch (error) {
      console.error('❌ EnhancedChatWindow Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setVoiceBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setVoiceBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    // Implementation for adding reactions
    console.log('Adding reaction:', emoji, 'to message:', messageId);
    setShowReactions(null);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMessageStatus = (message: Message) => {
    if (message.senderId !== user?.$id) return null;
    
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      default:
        return <Check className="w-3 h-3 text-gray-400" />;
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.isDeleted) {
      return (
        <div className="italic text-gray-500 dark:text-gray-400">
          Сообщение удалено
        </div>
      );
    }

    switch (message.messageType) {
      case 'image':
        return (
          <div className="space-y-2">
            {message.attachments?.map((attachment, index) => (
              <div key={index} className="relative group">
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="max-w-sm rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(attachment.url, '_blank')}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 bg-black/50 rounded-full text-white hover:bg-black/70">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            {message.attachments?.map((attachment, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <File className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{attachment.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                </div>
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'voice':
        return (
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
            <button
              onClick={() => setPlayingAudio(playingAudio === message.$id ? null : message.$id)}
              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:shadow-lg transition-all"
            >
              {playingAudio === message.$id ? 
                <Pause className="w-5 h-5 text-white" /> : 
                <Play className="w-5 h-5 text-white ml-0.5" />
              }
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Mic className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Голосовое сообщение</span>
              </div>
              <div className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-1/3"></div>
              </div>
            </div>
            <span className="text-xs text-gray-500">0:42</span>
          </div>
        );

      case 'order_card':
      case 'job_card':
        return (
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-3">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-blue-500">
                {message.messageType === 'order_card' ? 'Заказ' : 'Джоб'}
              </span>
            </div>
            {message.orderData && (
              <div className="space-y-2">
                <h4 className="font-semibold">{message.orderData.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{message.orderData.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Бюджет:</span>
                  <span className="font-bold text-green-500">
                    {message.orderData.amount?.toLocaleString()} {message.orderData.currency}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 'system':
        return (
          <div className="text-center py-2">
            <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
              {message.content}
            </span>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            {message.replyTo && (
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                <p className="text-xs text-gray-500 mb-1">Ответ на сообщение</p>
                <p className="text-sm line-clamp-2">Исходное сообщение...</p>
              </div>
            )}
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            {message.isEdited && (
              <span className="text-xs text-gray-400 italic">изменено</span>
            )}
          </div>
        );
    }
  };

  const handleAddReaction = useCallback(async (messageId: string, emoji: string) => {
    // Implementation for adding reactions
    console.log('Adding reaction:', emoji, 'to message:', messageId);
    setShowReactions(null);
  }, []);

  // Improved message actions
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      hapticFeedback('medium');
      
      // Optimistic update - удаляем из UI немедленно
      // setMessages(prev => prev.filter(m => m.$id !== messageId)); // This line was removed from the new_code, so it's removed here.
      
      // Вызываем пропс для удаления из базы
      await onDeleteMessage?.(messageId);
      setShowDeleteModal(null);
      setLongPressMessage(null);
      
    } catch (error) {
      console.error('Error deleting message:', error);
      // Возвращаем сообщение в случае ошибки
      // TODO: Implement proper error handling and message restoration
    }
  }, [onDeleteMessage]);

  const handleConfirmDelete = useCallback(async (messageId: string) => {
    try {
      hapticFeedback('medium');
      
      // Optimistic update - удаляем из UI немедленно
      // setMessages(prev => prev.filter(m => m.$id !== messageId)); // This line was removed from the new_code, so it's removed here.
      
      // Вызываем пропс для удаления из базы
      await onDeleteMessage?.(messageId);
      
    } catch (error) {
      console.error('Error deleting message:', error);
      // Возвращаем сообщение в случае ошибки
      // TODO: Implement proper error handling and message restoration
    }
  }, [onDeleteMessage]);

  const handleReplyToMessage = useCallback((messageId: string) => {
    const message = messages.find(m => m.$id === messageId);
    if (message) {
      setReplyingTo(message);
      inputRef.current?.focus();
      hapticFeedback('light');
    }
    setLongPressMessage(null);
    setSwipeAction(null);
  }, [messages]);

  const handleCopyMessage = useCallback(async (content: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      hapticFeedback('light');
      // TODO: Show toast notification
    }
    setLongPressMessage(null);
  }, []);

  const renderMessage = (message: Message, index: number) => {
    console.log(`🎨 Rendering message ${index}:`, {
      id: message.$id,
      content: message.content?.substring(0, 50) + '...',
      senderId: message.senderId,
      isOwn: message.senderId === user?.$id
    });

    const isOwn = message.senderId === user?.$id;
    const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId);
    const showTimestamp = index === 0 || 
      new Date(message.createdAt).getTime() - new Date(messages[index - 1]?.createdAt).getTime() > 5 * 60 * 1000;

    return (
      <div
        key={message.$id}
        className={cn(
          "flex group relative transition-all duration-200",
          isOwn ? "justify-end" : "justify-start",
          // Мобильно-оптимизированные отступы
          "px-3 sm:px-4 lg:px-6 py-1",
          // Улучшенные hover эффекты
          "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg"
        )}
        onTouchStart={(e) => handleTouchStart(e, message.$id)}
      >
        {/* Enhanced swipe indicators with glassmorphism */}
        {swipeAction?.messageId === message.$id && (
          <div className={cn(
            "absolute inset-y-0 flex items-center px-4 rounded-xl transition-all duration-300 backdrop-blur-sm",
            swipeAction.action === 'reply' 
              ? "left-0 bg-blue-500/20 text-blue-600 border border-blue-500/30" 
              : "right-0 bg-red-500/20 text-red-600 border border-red-500/30",
            // Анимация появления
            "animate-in slide-in-from-left-2 duration-200"
          )}>
            <div className="flex items-center space-x-2">
              {swipeAction.action === 'reply' ? <Reply className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
              <span className="text-sm font-medium hidden sm:block">
                {swipeAction.action === 'reply' ? 'Ответить' : 'Удалить'}
              </span>
            </div>
          </div>
        )}

        {/* Timestamp separator with improved mobile design */}
        {showTimestamp && (
          <div className="w-full flex justify-center my-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              {formatMessageTime(message.createdAt)}
            </span>
          </div>
        )}

        <div className={cn("flex max-w-[90%] sm:max-w-[85%] lg:max-w-[75%]", isOwn ? "flex-row-reverse" : "flex-row")}>
          {/* Enhanced avatar with better mobile sizing */}
          {showAvatar && !isOwn && (
            <div className="flex-shrink-0 mr-2 sm:mr-3">
              {/* Проверяем если это AI специалист */}
              {message.senderName?.includes('Viktor Reels') || 
               message.senderName?.includes('Alex AI') || 
               message.senderName?.includes('Luna Design') || 
               message.senderName?.includes('Max Bot') ? (
                <PositiveSpecialistAvatar 
                  specialistId={
                    message.senderName?.includes('Viktor Reels') ? 'viktor-reels' :
                    message.senderName?.includes('Alex AI') ? 'alex-ai' :
                    message.senderName?.includes('Luna Design') ? 'luna-design' : 'max-bot'
                  }
                  specialistName={message.senderName || ''}
                  size="sm"
                  showStatus={false}
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-medium shadow-lg ring-2 ring-white dark:ring-slate-800">
                  {message.senderName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          )}

          <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
            {/* Sender name (только для группы) */}
            {!isOwn && showAvatar && (
              <span className="text-xs text-slate-600 dark:text-slate-400 mb-1 px-1 font-medium">
                {message.senderName || 'Неизвестный'}
              </span>
            )}

            {/* Enhanced message bubble */}
            <div
              className={cn(
                "relative px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-lg",
                // Touch-friendly sizing
                "min-w-[44px] max-w-full min-h-[44px]",
                isOwn
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md shadow-lg shadow-blue-500/25"
                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md shadow-lg shadow-slate-500/10",
                // Enhanced glassmorphism
                "backdrop-blur-sm border border-white/20 dark:border-slate-700/50",
                // Мобильные улучшения
                "touch-manipulation"
              )}
            >
              {/* Enhanced reactions display */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="absolute -bottom-3 left-2 flex flex-wrap gap-1 max-w-[200px]">
                  {Object.entries(
                    message.reactions.reduce((acc, reaction) => {
                      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([emoji, count]) => (
                    <div
                      key={emoji}
                      className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 rounded-full px-2 py-1 text-xs flex items-center space-x-1 shadow-md backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => handleAddReaction(message.$id, emoji)}
                    >
                      <span className="text-sm">{emoji}</span>
                      {count > 1 && <span className="text-slate-600 dark:text-slate-400 font-medium">{count}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Message content */}
              <div className="space-y-2">
                {/* Reply indicator */}
                {message.replyTo && (
                  <div className="border-l-2 border-white/30 dark:border-slate-600/50 pl-3 py-1 text-sm opacity-90 bg-black/5 dark:bg-white/5 rounded-r-lg">
                    <div className="text-xs opacity-75 mb-1">Ответ на сообщение</div>
                    <div className="truncate">Исходное сообщение</div>
                  </div>
                )}

                {/* Text content with improved typography */}
                {message.content && (
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}

                {/* Enhanced attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {message.attachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className="bg-black/10 dark:bg-white/10 rounded-xl p-3 flex items-center space-x-3 hover:bg-black/15 dark:hover:bg-white/15 transition-colors"
                      >
                        <File className="w-5 h-5 flex-shrink-0 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.name}</p>
                          <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
                        </div>
                        <button 
                          className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                          onClick={() => {
                            // Handle download
                            hapticFeedback('light');
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhanced message status & time */}
              <div className={cn(
                "flex items-center justify-end space-x-1 mt-2 text-xs",
                isOwn ? "text-white/70" : "text-slate-500 dark:text-slate-400"
              )}>
                <span>{new Date(message.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                {isOwn && (
                  <div className="flex items-center ml-1">
                    {message.status === 'sending' && <Clock className="w-3 h-3 animate-pulse" />}
                    {message.status === 'sent' && <Check className="w-3 h-3" />}
                    {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                    {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-300" />}
                    {message.status === 'failed' && <AlertCircle className="w-3 h-3 text-red-400" />}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced mobile message actions */}
        {longPressMessage === message.$id && (
          <div className="fixed inset-x-4 bottom-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50 backdrop-blur-xl bg-white/95 dark:bg-slate-800/95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Действия с сообщением</h3>
              <button
                onClick={() => setLongPressMessage(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setShowReactionPicker(message.$id)}
                className="flex flex-col items-center p-4 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <Heart className="w-6 h-6 text-red-500 mb-2" />
                <span className="text-sm font-medium">Реакция</span>
              </button>
              
              <button
                onClick={() => handleReplyToMessage(message.$id)}
                className="flex flex-col items-center p-4 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <Reply className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-sm font-medium">Ответить</span>
              </button>
              
              {message.content && (
                <button
                  onClick={() => handleCopyMessage(message.content)}
                  className="flex flex-col items-center p-4 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <Copy className="w-6 h-6 text-green-500 mb-2" />
                  <span className="text-sm font-medium">Копировать</span>
                </button>
              )}
              
              {isOwn && (
                <button
                  onClick={() => {
                    setShowDeleteModal(message.$id);
                    setLongPressMessage(null);
                  }}
                  className="flex flex-col items-center p-4 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                >
                  <Trash2 className="w-6 h-6 text-red-500 mb-2" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Удалить</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick reaction button - только на desktop */}
        {!isMobile() && (
          <button
            onClick={() => setShowReactionPicker(message.$id)}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110",
              isOwn ? "-left-12" : "-right-12"
            )}
          >
            <Heart className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        )}
      </div>
    );
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Добро пожаловать в H-AI Messages</h2>
          <p className="text-gray-400 leading-relaxed">
            Выберите беседу или заказ из списка слева, чтобы начать общение с AI специалистами или другими пользователями.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 relative"
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-purple-500/20 border-2 border-dashed border-purple-500 rounded-xl flex items-center justify-center z-50">
          <div className="text-center">
            <Paperclip className="w-12 h-12 text-purple-500 mx-auto mb-2" />
            <p className="text-white font-medium">Отпустите файлы для прикрепления</p>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <h3 className="font-semibold text-white">Алекс AI</h3>
              <p className="text-sm text-gray-400">AI Дизайнер • Онлайн</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <VideoIcon className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Info className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-1 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-400">Загрузка сообщений...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Начните диалог</h3>
              <p className="text-gray-400 text-sm">
                Напишите первое сообщение, чтобы начать общение
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => renderMessage(message, index))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-6 py-3 bg-blue-500/10 border-l-4 border-blue-500 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-400 font-medium">Ответ на сообщение</p>
              <p className="text-sm text-gray-300 line-clamp-1">{replyingTo.content}</p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Voice recording indicator */}
      {(isRecording || voiceBlob) && (
        <div className="px-6 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-gray-700/50">
          <div className="flex items-center space-x-4">
            {isRecording ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-medium">Запись...</span>
                  <span className="text-gray-300">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={cancelRecording}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                  >
                    Отменить
                  </button>
                  <button
                    onClick={stopRecording}
                    className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors"
                  >
                    Готово
                  </button>
                </div>
              </>
            ) : voiceBlob && (
              <>
                <div className="flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-medium">Голосовое сообщение готово</span>
                  {audioUrl && (
                    <audio ref={audioRef} src={audioUrl} className="hidden" />
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={cancelRecording}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                  >
                    Удалить
                  </button>
                  <button
                    onClick={handleSend}
                    className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Отправить
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700/50">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-gray-700/50 rounded-lg px-3 py-2"
              >
                <File className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300 truncate max-w-32">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="p-0.5 hover:bg-gray-600 rounded"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick replies */}
      {showQuickReplies && (
        <div className="px-6 py-3 bg-gray-800/30 border-b border-gray-700/50">
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map((reply, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputMessage(reply);
                  setShowQuickReplies(false);
                }}
                className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-full text-sm transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 p-6 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-xl">
        <div className="flex items-end space-x-3">
          {/* Attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors group"
          >
            <Paperclip className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
          </button>

          {/* Main input area */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all max-h-32 custom-scrollbar"
              rows={1}
              style={{ minHeight: '48px' }}
            />
            
            {/* Emoji button */}
            <button
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-400 hover:text-purple-400 transition-colors" />
            </button>
          </div>

          {/* Voice/Send button */}
          {inputMessage.trim() || attachments.length > 0 || voiceBlob ? (
            <button
              onClick={handleSend}
              className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all transform hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "p-3 rounded-xl transition-all transform hover:scale-105 active:scale-95",
                isRecording
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              )}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />

      {/* Click outside handler */}
      {(selectedMessage || showReactions) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setSelectedMessage(null);
            setShowReactions(null);
          }}
        />
      )}

      {/* Enhanced Reaction picker modal */}
      {/* This state was removed from the new_code, so it's removed here. */}
      {/* {showReactionPicker && ( */}
      {/*   <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"> */}
      {/*     <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 m-4 shadow-2xl max-w-sm w-full border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl bg-white/95 dark:bg-slate-800/95"> */}
      {/*       <div className="flex justify-between items-center mb-6"> */}
      {/*         <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Выберите реакцию</h3> */}
      {/*         <button */}
      {/*           onClick={() => setShowReactionPicker(null)} */}
      {/*           className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors" */}
      {/*         > */}
      {/*           <X className="w-5 h-5" /> */}
      {/*         </button> */}
      {/*       </div> */}
      {/*       <div className="grid grid-cols-4 gap-4"> */}
      {/*         {reactions.map((emoji) => ( */}
      {/*           <button */}
      {/*             key={emoji} */}
      {/*             onClick={() => handleAddReaction(showReactionPicker, emoji)} */}
      {/*             className="p-4 text-3xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95" */}
      {/*           > */}
      {/*             {emoji} */}
      {/*           </button> */}
      {/*         ))} */}
      {/*       </div> */}
      {/*     </div> */}
      {/*   </div> */}
      {/* )} */}

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={() => showDeleteModal && handleDeleteMessage(showDeleteModal)}
        title="Удалить сообщение"
        message="Вы уверены, что хотите удалить это сообщение? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
      />

      {/* Close overlays when clicking outside */}
      {(longPressMessage || swipeAction) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setLongPressMessage(null);
            setSwipeAction(null);
          }}
        />
      )}

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