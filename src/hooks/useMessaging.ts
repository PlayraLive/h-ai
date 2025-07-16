// React хук для мессенджинга
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  messagingService,
  Message,
  Conversation,
  OrderAttachment,
  TimelineData,
  MilestoneData,
  TypingIndicator
} from '../services/messaging';

export interface UseMessagingOptions {
  conversationId?: string;
  userId: string;
  autoMarkAsRead?: boolean;
  enableTypingIndicator?: boolean;
}

export interface UseMessagingReturn {
  // Состояние
  messages: Message[];
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  typingUsers: TypingIndicator[];
  
  // Действия с сообщениями
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<void>;
  sendOrderMessage: (orderData: OrderAttachment, message?: string) => Promise<void>;
  sendTimelineUpdate: (timelineData: TimelineData) => Promise<void>;
  sendMilestoneUpdate: (milestoneData: MilestoneData) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  forwardMessage: (messageId: string, toConversationId: string, receiverId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  
  // Действия с конверсациями
  createConversation: (participants: string[], options?: CreateConversationOptions) => Promise<Conversation>;
  loadConversations: () => Promise<void>;
  switchConversation: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  
  // Поиск и загрузка
  searchMessages: (query: string) => Promise<Message[]>;
  loadMoreMessages: () => Promise<void>;
  
  // Индикатор печати
  setTyping: (isTyping: boolean) => void;
  
  // Утилиты
  getUnreadCount: (conversationId: string) => number;
  isMessageFromCurrentUser: (message: Message) => boolean;
  formatMessageTime: (timestamp: string) => string;
  cleanup: () => void;
}

export interface SendMessageOptions {
  messageType?: Message['messageType'];
  attachments?: string[];
  replyTo?: string;
  isUrgent?: boolean;
  mentions?: string[];
}

export interface CreateConversationOptions {
  projectId?: string;
  contractId?: string;
  title?: string;
  conversationType?: Conversation['conversationType'];
}

export function useMessaging(options: UseMessagingOptions): UseMessagingReturn {
  // Состояние
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  
  // Refs
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesOffsetRef = useRef(0);

  // 📱 Загрузка сообщений
  const loadMessages = useCallback(async (conversationId: string, offset = 0) => {
    if (!conversationId) return;
    
    try {
      setIsLoadingMessages(offset === 0);
      const newMessages = await messagingService.getMessages(conversationId, 50, offset);
      
      if (offset === 0) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...newMessages, ...prev]);
      }
      
      setHasMoreMessages(newMessages.length === 50);
      messagesOffsetRef.current = offset + newMessages.length;
      
      // Автоматически отмечаем как прочитанные
      if (options.autoMarkAsRead !== false) {
        const unreadMessages = newMessages.filter(m => 
          !m.isRead && m.receiverId === options.userId
        );
        
        for (const message of unreadMessages) {
          await messagingService.markMessageAsRead(message.$id, options.userId);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки сообщений');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [options.userId, options.autoMarkAsRead]);

  // 📋 Загрузка конверсаций
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const userConversations = await messagingService.getUserConversations(options.userId);
      setConversations(userConversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки конверсаций');
    } finally {
      setIsLoading(false);
    }
  }, [options.userId]);

  // 🔄 Переключение конверсации
  const switchConversation = useCallback(async (conversationId: string) => {
    try {
      // Отписываемся от предыдущей конверсации
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Находим конверсацию
      const conversation = conversations.find(c => c.$id === conversationId);
      if (!conversation) {
        throw new Error('Конверсация не найдена');
      }

      setCurrentConversation(conversation);
      messagesOffsetRef.current = 0;
      
      // Загружаем сообщения
      await loadMessages(conversationId, 0);

      // Подписываемся на real-time обновления
      const unsubscribe = messagingService.subscribeToConversation(conversationId, {
        onMessage: (message) => {
          setMessages(prev => [...prev, message]);
          
          // Автоматически отмечаем как прочитанное
          if (options.autoMarkAsRead !== false && message.receiverId === options.userId) {
            messagingService.markMessageAsRead(message.$id, options.userId);
          }
        },
        onMessageUpdate: (message) => {
          setMessages(prev => prev.map(m => m.$id === message.$id ? message : m));
        },
        onMessageDelete: (messageId) => {
          setMessages(prev => prev.filter(m => m.$id !== messageId));
        },
        onTyping: (typing) => {
          setTypingUsers(prev => {
            const filtered = prev.filter(t => t.userId !== typing.userId);
            return typing.isTyping ? [...filtered, typing] : filtered;
          });
        }
      });

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка переключения конверсации');
    }
  }, [conversations, loadMessages, options.userId, options.autoMarkAsRead]);

  // 💬 Отправка сообщения
  const sendMessage = useCallback(async (content: string, sendOptions?: SendMessageOptions) => {
    if (!currentConversation || !content.trim()) return;

    const receiverId = currentConversation.participants.find(p => p !== options.userId);
    if (!receiverId) return;

    try {
      await messagingService.sendMessage({
        conversationId: currentConversation.$id,
        senderId: options.userId,
        receiverId,
        content: content.trim(),
        messageType: sendOptions?.messageType,
        attachments: sendOptions?.attachments,
        replyTo: sendOptions?.replyTo,
        metadata: {
          isUrgent: sendOptions?.isUrgent,
          mentions: sendOptions?.mentions
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки сообщения');
    }
  }, [currentConversation, options.userId]);

  // 📋 Отправка заказа
  const sendOrderMessage = useCallback(async (orderData: OrderAttachment, message?: string) => {
    if (!currentConversation) return;

    const receiverId = currentConversation.participants.find(p => p !== options.userId);
    if (!receiverId) return;

    try {
      await messagingService.sendOrderMessage({
        conversationId: currentConversation.$id,
        senderId: options.userId,
        receiverId,
        orderData,
        message
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки заказа');
    }
  }, [currentConversation, options.userId]);

  // ⏱️ Отправка обновления таймлайна
  const sendTimelineUpdate = useCallback(async (timelineData: TimelineData) => {
    if (!currentConversation) return;

    const receiverId = currentConversation.participants.find(p => p !== options.userId);
    if (!receiverId) return;

    try {
      await messagingService.sendTimelineUpdate({
        conversationId: currentConversation.$id,
        senderId: options.userId,
        receiverId,
        timelineData
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки обновления таймлайна');
    }
  }, [currentConversation, options.userId]);

  // 🎯 Отправка обновления milestone
  const sendMilestoneUpdate = useCallback(async (milestoneData: MilestoneData) => {
    if (!currentConversation) return;

    const receiverId = currentConversation.participants.find(p => p !== options.userId);
    if (!receiverId) return;

    try {
      await messagingService.sendMilestoneUpdate({
        conversationId: currentConversation.$id,
        senderId: options.userId,
        receiverId,
        milestoneData
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки обновления milestone');
    }
  }, [currentConversation, options.userId]);

  // 📝 Редактирование сообщения
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      await messagingService.editMessage(messageId, newContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка редактирования сообщения');
    }
  }, []);

  // 🗑️ Удаление сообщения
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await messagingService.deleteMessage(messageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления сообщения');
    }
  }, []);

  // 🔄 Пересылка сообщения
  const forwardMessage = useCallback(async (messageId: string, toConversationId: string, receiverId: string) => {
    try {
      await messagingService.forwardMessage(messageId, toConversationId, options.userId, receiverId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка пересылки сообщения');
    }
  }, [options.userId]);

  // 😀 Добавление реакции
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await messagingService.addReaction(messageId, options.userId, emoji);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления реакции');
    }
  }, [options.userId]);

  // ✅ Отметка как прочитанное
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await messagingService.markMessageAsRead(messageId, options.userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отметки сообщения');
    }
  }, [options.userId]);

  // 💬 Создание конверсации
  const createConversation = useCallback(async (participants: string[], createOptions?: CreateConversationOptions) => {
    try {
      const conversation = await messagingService.createConversation({
        participants: [options.userId, ...participants],
        ...createOptions
      });
      
      setConversations(prev => [conversation, ...prev]);
      return conversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания конверсации');
      throw err;
    }
  }, [options.userId]);

  // 🔍 Поиск сообщений
  const searchMessages = useCallback(async (query: string) => {
    try {
      return await messagingService.searchMessages(query, currentConversation?.$id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска сообщений');
      return [];
    }
  }, [currentConversation]);

  // 📄 Загрузка дополнительных сообщений
  const loadMoreMessages = useCallback(async () => {
    if (!currentConversation || !hasMoreMessages || isLoadingMessages) return;
    
    await loadMessages(currentConversation.$id, messagesOffsetRef.current);
  }, [currentConversation, hasMoreMessages, isLoadingMessages, loadMessages]);

  // ⌨️ Индикатор печати
  const setTyping = useCallback((isTyping: boolean) => {
    if (!currentConversation || !options.enableTypingIndicator) return;

    messagingService.sendTypingIndicator(currentConversation.$id, options.userId, isTyping);

    // Автоматически убираем индикатор через 3 секунды
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        messagingService.sendTypingIndicator(currentConversation.$id, options.userId, false);
      }, 3000);
    }
  }, [currentConversation, options.userId, options.enableTypingIndicator]);

  // 📊 Получение количества непрочитанных
  const getUnreadCount = useCallback((conversationId: string) => {
    const conversation = conversations.find(c => c.$id === conversationId);
    return conversation?.unreadCount[options.userId] || 0;
  }, [conversations, options.userId]);

  // 👤 Проверка автора сообщения
  const isMessageFromCurrentUser = useCallback((message: Message) => {
    return message.senderId === options.userId;
  }, [options.userId]);

  // ⏰ Форматирование времени
  const formatMessageTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  }, []);

  // 🧹 Очистка
  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    messagingService.cleanup();
  }, []);

  // 🔄 Архивирование конверсации
  const archiveConversation = useCallback(async (conversationId: string) => {
    // Реализация архивирования
    console.log('Archive conversation:', conversationId);
  }, []);

  // Эффекты
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (options.conversationId && conversations.length > 0) {
      switchConversation(options.conversationId);
    }
  }, [options.conversationId, conversations, switchConversation]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Состояние
    messages,
    conversations,
    currentConversation,
    isLoading,
    isLoadingMessages,
    error,
    typingUsers,
    
    // Действия с сообщениями
    sendMessage,
    sendOrderMessage,
    sendTimelineUpdate,
    sendMilestoneUpdate,
    editMessage,
    deleteMessage,
    forwardMessage,
    addReaction,
    markAsRead,
    
    // Действия с конверсациями
    createConversation,
    loadConversations,
    switchConversation,
    archiveConversation,
    
    // Поиск и загрузка
    searchMessages,
    loadMoreMessages,
    
    // Индикатор печати
    setTyping,
    
    // Утилиты
    getUnreadCount,
    isMessageFromCurrentUser,
    formatMessageTime,
    cleanup
  };
}
