// Основной компонент окна чата
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { MessageBubble } from './MessageBubble';
import { Message, Conversation } from '@/services/messaging';

interface ChatWindowProps {
  conversation: Conversation;
  userId: string;
  onBack?: () => void;
}

export function ChatWindow({ conversation, userId, onBack }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoadingMessages,
    sendMessage,
    setTyping,
    loadMoreMessages,
    isMessageFromCurrentUser,
  } = useMessaging({
    conversationId: conversation.$id,
    userId,
    autoMarkAsRead: true,
    enableTypingIndicator: true
  });

  // Автоскролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Обработка скролла для загрузки истории
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop === 0 && !isLoadingMessages) {
      loadMoreMessages();
    }
  };

  // Обработчики сообщений
  const handleSendMessage = async (content: string, options?: any) => {
    await sendMessage(content, {
      ...options,
      replyTo: null // No replyTo for new messages
    });
    setNewMessage('');
  };

  // Handle card actions (approve, apply, buy, etc.)
  const handleCardAction = (action: string, data: Record<string, unknown>) => {
    console.log('Card action:', action, data);
    
    switch (action) {
      case 'approve':
        console.log('Approving TZ:', data);
        // Логика одобрения ТЗ
        break;
      case 'revise':
        console.log('Requesting revision:', data);
        // Логика запроса доработки
        break;
      case 'apply':
        console.log('Applying to job:', data);
        // Логика подачи заявки на джоб
        break;
      case 'buy':
        console.log('Buying solution:', data);
        // Логика покупки решения
        break;
      case 'contact':
        console.log('Contacting seller:', data);
        // Логика связи с продавцом
        break;
      case 'view':
        console.log('Viewing details:', data);
        // Логика просмотра деталей
        break;
      case 'download':
        console.log('Downloading files:', data);
        // Логика скачивания файлов
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium mb-2">Выберите чат</h3>
          <p>Выберите конверсацию из списка слева</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Заголовок чата */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {conversation.title?.[0] || '👤'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {conversation.title || 'Чат'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {/* typingUsers removed */}
              <span>онлайн</span>
            </div>
          </div>
        </div>

        {/* Действия чата */}
        <div className="flex items-center gap-2">
          {/* showOrderForm removed */}
          <button
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Поиск"
          >
            🔍
          </button>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Настройки"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Сообщения */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {isLoadingMessages && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* error removed */}

        {messages.map((message) => (
          <MessageBubble
            key={message.$id}
            message={message}
            isFromCurrentUser={isMessageFromCurrentUser(message)}
            onReaction={(_emoji: string) => { /* addReaction removed */ }}
            onEdit={(_newContent: string) => { /* editMessage removed */ }}
            onDelete={() => { /* deleteMessage removed */ }}
            onReply={() => { /* handleReply removed */ }}
            onForward={() => { /* handleForward removed */ }}
            onCardAction={handleCardAction}
          />
        ))}

        {/* Индикатор печати */}
        {/* typingUsers removed */}

        <div ref={messagesEndRef} />
      </div>

      {/* Ответ на сообщение */}
      {/* replyToMessage removed */}

      {/* Поле ввода */}
      {/* MessageInput removed */}

      {/* Модальное окно создания заказа */}
      {/* OrderFormModal removed */}
    </div>
  );
}

// Компонент формы создания заказа
interface OrderFormModalProps {
  onSend: (orderData: any, message?: string) => void;
  onClose: () => void;
}

function OrderFormModal({ onSend, onClose }: OrderFormModalProps) {
  const [formData, setFormData] = useState({
    orderTitle: '',
    orderDescription: '',
    budget: 0,
    currency: 'USD',
    deadline: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData: any = {
      orderId: Date.now().toString(),
      orderTitle: formData.orderTitle,
      orderDescription: formData.orderDescription,
      budget: formData.budget,
      currency: formData.currency,
      deadline: formData.deadline,
      status: 'sent',
      milestones: [],
      attachments: [],
      requirements: [],
      deliverables: []
    };

    onSend(orderData, formData.message);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Создать заказ</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название заказа
            </label>
            <input
              type="text"
              value={formData.orderTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, orderTitle: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              value={formData.orderDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, orderDescription: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Бюджет
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Валюта
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="RUB">RUB</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дедлайн
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сообщение (опционально)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Дополнительная информация..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Отправить заказ
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

export default ChatWindow;
