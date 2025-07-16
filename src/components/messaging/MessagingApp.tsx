// Главный компонент мессенджера
'use client';

import React, { useState, useEffect } from 'react';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { useMessaging } from '../../hooks/useMessaging';

interface MessagingAppProps {
  userId: string;
  initialConversationId?: string;
  className?: string;
}

export function MessagingApp({ 
  userId, 
  initialConversationId,
  className = '' 
}: MessagingAppProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const {
    conversations,
    isLoading,
    error,
    createConversation,
    loadConversations
  } = useMessaging({
    conversationId: selectedConversationId,
    userId
  });

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Обработка выбора конверсации
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    
    // На мобильных скрываем сайдбар при выборе чата
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  // Создание новой конверсации
  const handleCreateConversation = async (participants: string[], options?: any) => {
    try {
      const conversation = await createConversation(participants, options);
      setSelectedConversationId(conversation.$id);
      setShowNewChatModal(false);
      
      if (isMobile) {
        setShowSidebar(false);
      }
    } catch (error) {
      console.error('Ошибка создания конверсации:', error);
    }
  };

  // Возврат к списку чатов (мобильная версия)
  const handleBackToList = () => {
    setShowSidebar(true);
    setSelectedConversationId(undefined);
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full bg-red-50 ${className}`}>
        <div className="text-center text-red-600">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium mb-2">Ошибка загрузки</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={loadConversations}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full bg-gray-100 ${className}`}>
      {/* Сайдбар с конверсациями */}
      <div className={`
        ${isMobile ? 'absolute inset-0 z-10' : 'relative'}
        ${showSidebar ? 'block' : 'hidden'}
        ${isMobile ? 'w-full' : 'w-80'}
        flex-shrink-0
      `}>
        <ConversationList
          conversations={conversations}
          currentConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={() => setShowNewChatModal(true)}
          userId={userId}
          isLoading={isLoading}
          className="h-full"
        />
      </div>

      {/* Основная область чата */}
      <div className={`
        flex-1 flex flex-col
        ${isMobile && showSidebar ? 'hidden' : 'block'}
      `}>
        {selectedConversationId ? (
          <>
            {/* Мобильная шапка */}
            {isMobile && (
              <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
                <button
                  onClick={handleBackToList}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ←
                </button>
                <h2 className="font-semibold text-gray-900">Чат</h2>
              </div>
            )}
            
            {/* Окно чата */}
            <ChatWindow
              conversationId={selectedConversationId}
              userId={userId}
              className="flex-1"
            />
          </>
        ) : (
          /* Заглушка когда чат не выбран */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500 max-w-md mx-4">
              <div className="text-6xl mb-6">💬</div>
              <h3 className="text-xl font-medium mb-3">Добро пожаловать в мессенджер!</h3>
              <p className="text-gray-400 mb-6">
                Выберите чат из списка слева или создайте новую конверсацию для начала общения.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Начать новый чат
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно создания чата */}
      {showNewChatModal && (
        <NewChatModal
          onCreateConversation={handleCreateConversation}
          onClose={() => setShowNewChatModal(false)}
          userId={userId}
        />
      )}
    </div>
  );
}

// Компонент модального окна создания нового чата
interface NewChatModalProps {
  onCreateConversation: (participants: string[], options?: any) => void;
  onClose: () => void;
  userId: string;
}

function NewChatModal({ onCreateConversation, onClose, userId }: NewChatModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chatTitle, setChatTitle] = useState('');
  const [chatType, setChatType] = useState<'direct' | 'group' | 'project'>('direct');

  // Заглушка для поиска пользователей
  const [users] = useState([
    { id: 'user1', name: 'Анна Иванова', avatar: '👩', online: true },
    { id: 'user2', name: 'Петр Сидоров', avatar: '👨', online: false },
    { id: 'user3', name: 'Мария Петрова', avatar: '👩', online: true },
    { id: 'user4', name: 'Алексей Козлов', avatar: '👨', online: true },
  ]);

  const filteredUsers = users.filter(user => 
    user.id !== userId && 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) return;

    const options = {
      title: chatTitle || undefined,
      conversationType: chatType
    };

    onCreateConversation(selectedUsers, options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Новый чат</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Тип чата */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип чата
            </label>
            <div className="flex gap-2">
              {[
                { value: 'direct', label: 'Личный', icon: '👤' },
                { value: 'group', label: 'Группа', icon: '👥' },
                { value: 'project', label: 'Проект', icon: '📋' }
              ].map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setChatType(value as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    chatType === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{icon}</span>
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Название чата (для групп) */}
          {chatType !== 'direct' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название чата
              </label>
              <input
                type="text"
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                placeholder="Введите название..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Поиск пользователей */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Участники
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск пользователей..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Список пользователей */}
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Пользователи не найдены
              </div>
            ) : (
              filteredUsers.map(user => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserToggle(user.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative">
                      <span className="text-2xl">{user.avatar}</span>
                      {user.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        {user.online ? 'онлайн' : 'не в сети'}
                      </div>
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Выбранные пользователи */}
          {selectedUsers.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Выбрано: {selectedUsers.length}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(userId => {
                  const user = users.find(u => u.id === userId);
                  return user ? (
                    <div
                      key={userId}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                    >
                      <span>{user.avatar}</span>
                      <span>{user.name}</span>
                      <button
                        type="button"
                        onClick={() => handleUserToggle(userId)}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        ✕
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={selectedUsers.length === 0}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Создать чат
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
