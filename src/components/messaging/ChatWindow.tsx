// Основной компонент окна чата
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMessaging } from '../../hooks/useMessaging';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { 
  OrderAttachment, 
  TimelineData, 
  MilestoneData,
  AIOrderAttachment,
  JobCardAttachment,
  SolutionCardAttachment,
  AIBriefData
} from '../../services/messaging';

interface ChatWindowProps {
  conversationId: string;
  userId: string;
  className?: string;
}

export function ChatWindow({ conversationId, userId, className = '' }: ChatWindowProps) {
  const [replyToMessage, setReplyToMessage] = useState<string | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    currentConversation,
    isLoadingMessages,
    error,
    typingUsers,
    sendMessage,
    sendOrderMessage,
    sendTimelineUpdate,
    sendMilestoneUpdate,
    editMessage,
    deleteMessage,
    forwardMessage,
    addReaction,
    markAsRead,
    loadMoreMessages,
    setTyping,
    isMessageFromCurrentUser,
    formatMessageTime
  } = useMessaging({
    conversationId,
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
      replyTo: replyToMessage
    });
    setReplyToMessage(null);
  };

  const handleSendOrder = async (orderData: OrderAttachment, message?: string) => {
    await sendOrderMessage(orderData, message);
    setShowOrderForm(false);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    await addReaction(messageId, emoji);
  };

  const handleEdit = async (messageId: string, newContent: string) => {
    await editMessage(messageId, newContent);
  };

  const handleDelete = async (messageId: string) => {
    if (confirm('Удалить сообщение?')) {
      await deleteMessage(messageId);
    }
  };

  const handleReply = (messageId: string) => {
    setReplyToMessage(messageId);
  };

  const handleForward = async (messageId: string) => {
    // Показать модальное окно выбора конверсации
    console.log('Forward message:', messageId);
  };

  const handleCardAction = async (action: string, data: any) => {
    console.log('Card action:', action, data);
    
    switch (action) {
      case 'approve':
        // Обработка одобрения (для AI заказов и брифов)
        if (data.specialistId) {
          console.log('Approving AI order/brief:', data);
          // В реальной реализации: вызов API для одобрения
        }
        break;
        
      case 'apply':
        // Обработка отклика на джоб
        if (data.jobId) {
          console.log('Applying to job:', data.jobId);
          // В реальной реализации: открыть модальное окно с формой отклика
        }
        break;
        
      case 'buy':
        // Обработка покупки решения
        if (data.solutionId) {
          console.log('Buying solution:', data.solutionId);
          // В реальной реализации: перенаправить на страницу оплаты
        }
        break;
        
      case 'contact':
        // Обработка связи с продавцом
        if (data.sellerId) {
          console.log('Contacting seller:', data.sellerId);
          // В реальной реализации: создать новую конверсацию или перейти к существующей
        }
        break;
        
      case 'view':
        // Обработка просмотра полной информации
        console.log('Viewing details:', data);
        // В реальной реализации: открыть страницу с подробностями
        break;
        
      case 'download':
        // Обработка скачивания
        if (data.purchaseId) {
          console.log('Downloading purchased solution:', data.purchaseId);
          // В реальной реализации: скачать файлы
        }
        break;
        
      case 'revise':
        // Обработка запроса на доработку
        console.log('Requesting revisions:', data);
        // В реальной реализации: открыть форму для описания правок
        break;
        
      default:
        console.log('Unknown card action:', action);
    }
  };

  if (!currentConversation) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium mb-2">Выберите чат</h3>
          <p>Выберите конверсацию из списка слева</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Заголовок чата */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {currentConversation.title?.[0] || '👤'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {currentConversation.title || 'Чат'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {typingUsers.length > 0 ? (
                <span className="text-blue-500">печатает...</span>
              ) : (
                <span>онлайн</span>
              )}
            </div>
          </div>
        </div>

        {/* Действия чата */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOrderForm(true)}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            title="Отправить заказ"
          >
            📋
          </button>
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

        {error && (
          <div className="text-center py-4 text-red-500">
            Ошибка: {error}
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.$id}
            message={message}
            isFromCurrentUser={isMessageFromCurrentUser(message)}
            onReaction={(emoji) => handleReaction(message.$id, emoji)}
            onEdit={(newContent) => handleEdit(message.$id, newContent)}
            onDelete={() => handleDelete(message.$id)}
            onReply={() => handleReply(message.$id)}
            onForward={() => handleForward(message.$id)}
            onCardAction={handleCardAction}
          />
        ))}

        {/* Индикатор печати */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 rounded-bl-md">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">печатает</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Ответ на сообщение */}
      {replyToMessage && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-600">↩️ Ответ на:</span>
              <span className="text-gray-600">
                {messages.find(m => m.$id === replyToMessage)?.content.substring(0, 50)}...
              </span>
            </div>
            <button
              onClick={() => setReplyToMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Поле ввода */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={setTyping}
        placeholder="Напишите сообщение..."
        disabled={!currentConversation}
      />

      {/* Модальное окно создания заказа */}
      {showOrderForm && (
        <OrderFormModal
          onSend={handleSendOrder}
          onClose={() => setShowOrderForm(false)}
        />
      )}
    </div>
  );
}

// Компонент формы создания заказа
interface OrderFormModalProps {
  onSend: (orderData: OrderAttachment, message?: string) => void;
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
    
    const orderData: OrderAttachment = {
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
