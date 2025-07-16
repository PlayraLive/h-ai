// Компонент списка конверсаций
'use client';

import React, { useState } from 'react';
import { Conversation } from '../../services/messaging';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation?: () => void;
  userId: string;
  isLoading?: boolean;
  className?: string;
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onCreateConversation,
  userId,
  isLoading = false,
  className = ''
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

  // Фильтрация конверсаций
  const filteredConversations = conversations.filter(conversation => {
    // Поиск по названию или последнему сообщению
    const matchesSearch = !searchQuery || 
      conversation.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());

    // Фильтр по статусу
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && (conversation.unreadCount[userId] || 0) > 0) ||
      (filter === 'archived' && conversation.isArchived);

    return matchesSearch && matchesFilter;
  });

  // Сортировка по времени последнего сообщения
  const sortedConversations = filteredConversations.sort((a, b) => {
    // Закрепленные чаты сверху
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Затем по времени последнего сообщения
    const aTime = new Date(a.lastMessageAt || a.updatedAt).getTime();
    const bTime = new Date(b.lastMessageAt || b.updatedAt).getTime();
    return bTime - aTime;
  });

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    
    // Для прямых чатов показываем имя собеседника
    const otherParticipant = conversation.participants.find(p => p !== userId);
    return otherParticipant || 'Неизвестный пользователь';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.conversationType === 'group') return '👥';
    if (conversation.conversationType === 'project') return '📋';
    if (conversation.conversationType === 'contract') return '📄';
    if (conversation.conversationType === 'support') return '🎧';
    return '👤';
  };

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: ru 
      });
    } catch {
      return '';
    }
  };

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unreadCount[userId] || 0;
  };

  const truncateMessage = (message: string, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Сообщения</h2>
          {onCreateConversation && (
            <button
              onClick={onCreateConversation}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="Новый чат"
            >
              ✏️
            </button>
          )}
        </div>

        {/* Поиск */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск чатов..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>

        {/* Фильтры */}
        <div className="flex gap-1 mt-3">
          {[
            { key: 'all', label: 'Все', count: conversations.length },
            { key: 'unread', label: 'Непрочитанные', count: conversations.filter(c => (c.unreadCount[userId] || 0) > 0).length },
            { key: 'archived', label: 'Архив', count: conversations.filter(c => c.isArchived).length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label} {count > 0 && `(${count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Список конверсаций */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? (
              <>
                <div className="text-4xl mb-2">🔍</div>
                <p>Ничего не найдено</p>
                <p className="text-sm">Попробуйте изменить запрос</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">💬</div>
                <p>Нет сообщений</p>
                <p className="text-sm">Начните новый чат</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedConversations.map((conversation) => {
              const isSelected = conversation.$id === currentConversationId;
              const unreadCount = getUnreadCount(conversation);
              const title = getConversationTitle(conversation);
              const avatar = getConversationAvatar(conversation);

              return (
                <button
                  key={conversation.$id}
                  onClick={() => onSelectConversation(conversation.$id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors relative ${
                    isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Аватар */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                        conversation.conversationType === 'group' ? 'bg-purple-100' :
                        conversation.conversationType === 'project' ? 'bg-blue-100' :
                        conversation.conversationType === 'contract' ? 'bg-green-100' :
                        conversation.conversationType === 'support' ? 'bg-orange-100' :
                        'bg-gray-100'
                      }`}>
                        {avatar}
                      </div>
                      
                      {/* Индикатор онлайн */}
                      {conversation.conversationType === 'direct' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                      
                      {/* Закрепленный чат */}
                      {conversation.isPinned && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs">
                          📌
                        </div>
                      )}
                    </div>

                    {/* Контент */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium truncate ${
                          unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {conversation.lastMessageAt && (
                            <span className="text-xs text-gray-500">
                              {formatLastMessageTime(conversation.lastMessageAt)}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <div className="bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Последнее сообщение */}
                      {conversation.lastMessage && (
                        <p className={`text-sm truncate ${
                          unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {conversation.lastMessageBy === userId && (
                            <span className="text-blue-500 mr-1">Вы:</span>
                          )}
                          {truncateMessage(conversation.lastMessage)}
                        </p>
                      )}

                      {/* Метаданные */}
                      <div className="flex items-center gap-2 mt-1">
                        {conversation.conversationType === 'project' && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                            Проект
                          </span>
                        )}
                        {conversation.conversationType === 'contract' && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                            Контракт
                          </span>
                        )}
                        {conversation.isGroup && (
                          <span className="text-xs text-gray-500">
                            {conversation.participants.length} участников
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Индикатор архива */}
                  {conversation.isArchived && (
                    <div className="absolute top-2 right-2 text-gray-400">
                      📦
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Всего чатов: {conversations.length}</span>
          <span>
            Непрочитанных: {conversations.reduce((sum, c) => sum + (c.unreadCount[userId] || 0), 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
