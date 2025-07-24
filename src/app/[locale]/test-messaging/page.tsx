'use client';

import React, { useState } from 'react';
import { MessageBubble } from '@/components/messaging/MessageBubble';
import { 
  AIOrderCard, 
  JobCard, 
  SolutionCard, 
  AIBriefCard 
} from '@/components/messaging/MessageCards';
import { 
  Message,
  AIOrderAttachment,
  JobCardAttachment,
  SolutionCardAttachment,
  AIBriefData
} from '@/services/messaging';
import Navbar from '@/components/Navbar';

export default function TestMessagingPage() {
  const [selectedDemo, setSelectedDemo] = useState<'cards' | 'messages' | 'chat'>('cards');

  // Демо данные для AI заказа
  const aiOrderData: AIOrderAttachment = {
    specialistId: 'alex-ai',
    specialistName: 'Alex AI',
    specialistTitle: 'AI Avatar Creator',
    specialistAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexAI',
    orderType: 'task',
    orderTitle: 'Создать аватар для LinkedIn',
    orderDescription: 'Нужен профессиональный аватар для профиля в LinkedIn. Стиль - деловой, современный.',
    brief: 'Мужчина, 30-35 лет, деловой костюм, уверенный взгляд, нейтральный фон',
    price: 5,
    currency: 'USD',
    status: 'brief_provided',
    deliveryTime: '2 часа',
    aiProvider: 'openai',
    generatedBrief: 'Создам профессиональный деловой аватар на основе ваших требований',
    revisionCount: 0,
    maxRevisions: 3
  };

  // Демо данные для джоба
  const jobCardData: JobCardAttachment = {
    jobId: 'job-123',
    jobTitle: 'Разработка React компонентов',
    jobDescription: 'Требуется создать набор переиспользуемых React компонентов для дизайн-системы',
    budget: {
      min: 500,
      max: 1500,
      currency: 'USD'
    },
    deadline: '2025-02-15',
    skills: ['React', 'TypeScript', 'Storybook', 'CSS-in-JS'],
    clientId: 'client-456',
    clientName: 'TechStartup Inc',
    clientAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TS',
    applicationsCount: 12,
    status: 'open',
    proposalAmount: 800,
    proposalDeadline: '2025-02-10',
    proposalMessage: 'Готов выполнить проект качественно и в срок'
  };

  // Демо данные для решения
  const solutionCardData: SolutionCardAttachment = {
    solutionId: 'solution-789',
    solutionTitle: 'Готовая CRM система',
    solutionDescription: 'Полнофункциональная CRM система с управлением клиентами, сделками и аналитикой',
    price: 199,
    currency: 'USD',
    category: 'Business Software',
    tags: ['CRM', 'React', 'Node.js', 'MongoDB'],
    sellerId: 'seller-101',
    sellerName: 'DevSolutions',
    sellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DS',
    rating: 4.8,
    salesCount: 156,
    previewImages: ['/images/crm-preview.jpg'],
    deliveryTime: '24 часа',
    features: [
      'Управление клиентами',
      'Воронка продаж',
      'Отчеты и аналитика',
      'Интеграции с email'
    ],
    customization: {
      requirements: 'Добавить интеграцию с Telegram API',
      additionalPrice: 50,
      estimatedTime: '2-3 дня'
    }
  };

  // Демо данные для AI брифа
  const aiBriefData: AIBriefData = {
    originalRequest: 'Создать логотип для стартапа в сфере FinTech',
    generatedBrief: {
      title: 'Логотип для FinTech стартапа',
      description: 'Современный, технологичный логотип, отражающий инновации в финансовой сфере',
      requirements: [
        'Минималистичный дизайн',
        'Использование синего/зеленого цвета',
        'Символ надежности и технологий',
        'Адаптивность для разных размеров'
      ],
      deliverables: [
        'Логотип в векторном формате (SVG, AI)',
        'Растровые версии (PNG, JPG)',
        'Favicon',
        'Брендбук с правилами использования'
      ],
      timeline: '3-5 дней',
      budget: 150,
      technicalSpecs: [
        'Векторная графика',
        'Цветовая палитра CMYK и RGB',
        'Монохромная версия',
        'Размеры от 16x16px до 1000x1000px'
      ],
      examples: [
        'Stripe - минимализм и надежность',
        'Revolut - современность и динамика',
        'Wise - простота и доверие'
      ]
    },
    specialistId: 'luna-design',
    specialistName: 'Luna Design',
    aiProvider: 'anthropic',
    confidence: 92,
    estimatedTime: '3-5 дней',
    suggestedRevisions: [
      'Уточнить целевую аудиторию',
      'Добавить примеры конкурентов',
      'Определить основные ценности бренда'
    ]
  };

  // Демо сообщения
  const demoMessages: Message[] = [
    {
      $id: '1',
      senderId: 'user-1',
      receiverId: 'user-2',
      conversationId: 'conv-1',
      content: 'Привет! Как дела с проектом?',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isDeleted: false
    },
    {
      $id: '2',
      senderId: 'user-2',
      receiverId: 'user-1',
      conversationId: 'conv-1',
      content: '🤖 AI заказ: Создать аватар для LinkedIn',
      messageType: 'ai_order',
      aiOrderData: aiOrderData,
      isRead: true,
      createdAt: new Date(Date.now() - 3000000).toISOString(),
      isDeleted: false
    },
    {
      $id: '3',
      senderId: 'user-1',
      receiverId: 'user-2',
      conversationId: 'conv-1',
      content: '💼 Новый джоб: Разработка React компонентов',
      messageType: 'job_card',
      jobCardData: jobCardData,
      isRead: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      isDeleted: false
    },
    {
      $id: '4',
      senderId: 'user-2',
      receiverId: 'user-1',
      conversationId: 'conv-1',
      content: '📝 Техническое задание готово!',
      messageType: 'ai_brief',
      aiBriefData: aiBriefData,
      isRead: false,
      createdAt: new Date(Date.now() - 900000).toISOString(),
      isDeleted: false,
      metadata: {
        aiGenerated: true,
        needsApproval: true,
        confidenceScore: 92
      }
    },
    {
      $id: '5',
      senderId: 'user-1',
      receiverId: 'user-2',
      conversationId: 'conv-1',
      content: '💡 Решение: Готовая CRM система',
      messageType: 'solution_card',
      solutionCardData: solutionCardData,
      isRead: false,
      createdAt: new Date(Date.now() - 300000).toISOString(),
      isDeleted: false
    }
  ];

  const handleCardAction = (action: string, data: any) => {
    console.log('Card action:', action, data);
    alert(`Действие: ${action}\nДанные: ${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              🧪 Тестирование системы сообщений
            </h1>
            <p className="text-gray-400 mb-6">
              Демонстрация новых типов сообщений и карточек в чате
            </p>
            
            {/* Navigation */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSelectedDemo('cards')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDemo === 'cards'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Карточки
              </button>
              <button
                onClick={() => setSelectedDemo('messages')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDemo === 'messages'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Сообщения
              </button>
              <button
                onClick={() => setSelectedDemo('chat')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDemo === 'chat'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Демо чат
              </button>
            </div>
          </div>

          {/* Content */}
          {selectedDemo === 'cards' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white mb-6">Типы карточек</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Order Card */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">🤖 AI Order Card</h3>
                  <AIOrderCard data={aiOrderData} onAction={handleCardAction} />
                </div>

                {/* Job Card */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">💼 Job Card</h3>
                  <JobCard data={jobCardData} onAction={handleCardAction} />
                </div>

                {/* Solution Card */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">💡 Solution Card</h3>
                  <SolutionCard data={solutionCardData} onAction={handleCardAction} />
                </div>

                {/* AI Brief Card */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">📝 AI Brief Card</h3>
                  <AIBriefCard data={aiBriefData} onAction={handleCardAction} />
                </div>
              </div>
            </div>
          )}

          {selectedDemo === 'messages' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white mb-6">Сообщения с карточками</h2>
              
              <div className="max-w-2xl mx-auto space-y-4">
                {demoMessages.map((message, index) => (
                  <MessageBubble
                    key={message.$id}
                    message={message}
                    isFromCurrentUser={index % 2 === 0}
                    onCardAction={handleCardAction}
                    onReaction={(emoji) => console.log('Reaction:', emoji)}
                    onEdit={(content) => console.log('Edit:', content)}
                    onDelete={() => console.log('Delete message')}
                    onReply={() => console.log('Reply to message')}
                    onForward={() => console.log('Forward message')}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedDemo === 'chat' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white mb-6">Демо чат</h2>
              
              <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=AlexAI"
                      alt="Alex AI"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="text-white font-semibold">Alex AI</h3>
                      <p className="text-gray-400 text-sm">AI Avatar Creator</p>
                    </div>
                    <div className="ml-auto">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Онлайн
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-950">
                  {demoMessages.map((message, index) => (
                    <MessageBubble
                      key={message.$id}
                      message={message}
                      isFromCurrentUser={index % 2 === 0}
                      onCardAction={handleCardAction}
                      onReaction={(emoji) => console.log('Reaction:', emoji)}
                      onEdit={(content) => console.log('Edit:', content)}
                      onDelete={() => console.log('Delete message')}
                      onReply={() => console.log('Reply to message')}
                      onForward={() => console.log('Forward message')}
                    />
                  ))}
                </div>

                {/* Chat Input */}
                <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Напишите сообщение..."
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                      Отправить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-12 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              ℹ️ Информация о тестовой странице
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">Реализованные функции:</h4>
                <ul className="space-y-1 text-sm">
                  <li>✅ Карточки AI заказов</li>
                  <li>✅ Карточки джобов</li>
                  <li>✅ Карточки решений</li>
                  <li>✅ Карточки AI брифов</li>
                  <li>✅ Интерактивные действия</li>
                  <li>✅ Система уведомлений</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Следующие шаги:</h4>
                <ul className="space-y-1 text-sm">
                  <li>🔄 Интеграция с реальным AI</li>
                  <li>🔄 Push уведомления</li>
                  <li>🔄 Email уведомления</li>
                  <li>🔄 Реалтайм обновления</li>
                  <li>🔄 Файловые вложения</li>
                  <li>🔄 Продвинутая аналитика</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 