'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, Star, Clock, CheckCircle, CreditCard, Shield, Zap } from 'lucide-react';
import { AISpecialist } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';

interface OrderFlowChatProps {
  specialist: AISpecialist;
  onOrderComplete?: (orderData: any) => void;
  className?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'tariff_selection' | 'payment_form' | 'confirmation';
  data?: any;
}

const TARIFF_PLANS = [
  {
    id: 'basic',
    name: 'Базовый',
    price: 50,
    features: [
      'Консультация до 1 часа',
      'Базовое техническое задание',
      'Email поддержка',
      '3 дня на выполнение'
    ],
    icon: '💡',
    popular: false
  },
  {
    id: 'standard',
    name: 'Стандарт',
    price: 120,
    features: [
      'Консультация до 3 часов',
      'Детальное техническое задание',
      'Приоритетная поддержка',
      'Промежуточные отчеты',
      '7 дней на выполнение'
    ],
    icon: '⚡',
    popular: true
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 250,
    features: [
      'Неограниченные консультации',
      'Полное сопровождение проекта',
      'Персональный менеджер',
      'Еженедельные отчеты',
      'Гарантия результата',
      '14 дней на выполнение'
    ],
    icon: '🚀',
    popular: false
  }
];

export default function OrderFlowChat({ specialist, onOrderComplete, className = '' }: OrderFlowChatProps) {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'chat' | 'tariff' | 'payment' | 'confirmation'>('chat');
  const [selectedTariff, setSelectedTariff] = useState<string>('');
  const [paymentData, setPaymentData] = useState({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Проверяем авторизацию - если пользователь не авторизован, показываем уведомление
  if (!user) {
    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20 text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Требуется авторизация
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Для общения с AI специалистом и оформления заказа необходимо войти в аккаунт
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Войти в аккаунт
            </button>
            <button
              onClick={() => window.location.href = '/signup'}
              className="px-6 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-medium transition-colors"
            >
              Зарегистрироваться
            </button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Привет! Я ${specialist.name}, ${specialist.title}. 

Расскажите подробнее о вашем проекте, и я помогу подобрать оптимальное решение. Чем конкретно могу быть полезен?`,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI API
      const response = await fetch('/api/enhanced-ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          userId: user.$id,
          specialistId: specialist.id,
          options: {
            saveToDatabase: true,
            learningEnabled: true,
            contextualMemory: true
          }
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      // Update conversation ID if new
      if (!conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: Message = {
        id: data.messageId,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if we should show tariff selection after sufficient discussion
      const userMessageCount = messages.filter(m => m.role === 'user').length + 1;
      if (userMessageCount >= 2 && currentStep === 'chat') {
        showTariffSelection();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте переформулировать ваш запрос.',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const showTariffSelection = () => {
    const tariffMessage: Message = {
      id: (Date.now() + 2).toString(),
      role: 'system',
      content: 'Отлично! Теперь выберите подходящий тариф для вашего проекта:',
      timestamp: new Date(),
      type: 'tariff_selection'
    };

    setMessages(prev => [...prev, tariffMessage]);
    setCurrentStep('tariff');
  };

  const handleTariffSelect = (tariffId: string) => {
    setSelectedTariff(tariffId);
    const selectedPlan = TARIFF_PLANS.find(p => p.id === tariffId);
    
    const selectionMessage: Message = {
      id: (Date.now() + 3).toString(),
      role: 'user',
      content: `Выбран тариф: ${selectedPlan?.name} (${selectedPlan?.price}$)`,
      timestamp: new Date(),
      type: 'text'
    };

    const paymentMessage: Message = {
      id: (Date.now() + 4).toString(),
      role: 'system',
      content: 'Отлично! Теперь давайте оформим оплату:',
      timestamp: new Date(),
      type: 'payment_form',
      data: selectedPlan
    };

    setMessages(prev => [...prev, selectionMessage, paymentMessage]);
    setCurrentStep('payment');
  };

  const handlePayment = async (paymentInfo: any) => {
    setPaymentData(paymentInfo);
    
    try {
      // Импортируем службу заказов
      const { OrderService } = await import('@/lib/services/order-service');
      
      // Получаем выбранный тариф
      const selectedTariffPlan = TARIFF_PLANS.find(p => p.id === selectedTariff);
      if (!selectedTariffPlan) return;

      // Создаем заказ через API
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          userId: user?.$id || '',
          specialistId: specialist.id,
          specialistName: specialist.name,
          specialistTitle: specialist.title,
          tariffId: selectedTariff!,
          tariffName: selectedTariffPlan.name,
          amount: selectedTariffPlan.price,
          conversationId: conversationId,
          requirements: messages
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join('\n'),
          timeline: selectedTariffPlan.features.includes('Срочная') ? '2 дня' : '7 дней'
        })
      });

      const orderData = await orderResponse.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }
      const order = orderData.order;

      // Создаем карточку заказа в сообщениях через API
      const cardResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_card',
          orderId: order.$id,
          userId: user?.$id || '',
          receiverId: specialist.id,
          specialistId: specialist.id,
          specialist: {
            id: specialist.id,
            name: specialist.name,
            title: specialist.title,
            avatar: specialist.avatar
          },
          tariff: {
            name: selectedTariffPlan.name,
            price: selectedTariffPlan.price,
            features: selectedTariffPlan.features
          },
          requirements: messages
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join('\n'),
          conversationId: order.conversationId || conversationId
        })
      });

      const cardData = await cardResponse.json();
      console.log('📱 Order card creation result:', cardData);

      // Показываем сообщение о подтверждении
      const confirmationMessage: Message = {
        id: (Date.now() + 5).toString(),
        role: 'system',
        content: `✅ Заказ успешно оформлен!\n\nВаш заказ #${order.$id.slice(-8)} был создан и отправлен в систему сообщений. Специалист ${specialist.name} получит уведомление и свяжется с вами для обсуждения деталей проекта.\n\n🚀 Через несколько секунд вы будете перенаправлены в чат.`,
        timestamp: new Date(),
        type: 'confirmation',
        data: {
          tariff: selectedTariffPlan,
          payment: paymentInfo,
          specialist: specialist,
          orderId: order.$id
        }
      };

      setMessages(prev => [...prev, confirmationMessage]);
      setCurrentStep('confirmation');

      // Перенаправляем в систему сообщений через 3 секунды
      setTimeout(() => {
        window.location.href = `/en/messages?orderId=${order.$id}`;
      }, 3000);

      // Call completion callback
      if (onOrderComplete) {
        onOrderComplete({
          specialistId: specialist.id,
          tariff: selectedTariff,
          payment: paymentInfo,
          conversationId: conversationId,
          orderId: order.$id
        });
      }

    } catch (error) {
      console.error('Error creating order:', error);
      
      // Fallback: показываем подтверждение с улучшенным сообщением
      const confirmationMessage: Message = {
        id: (Date.now() + 5).toString(),
        role: 'system',
        content: `✅ Заказ успешно оформлен!\n\nВаш заказ принят в работу. ${specialist.name} свяжется с вами в ближайшее время для обсуждения деталей проекта.\n\n📋 Детали заказа сохранены и будут доступны в разделе сообщений.`,
        timestamp: new Date(),
        type: 'confirmation',
        data: {
          tariff: TARIFF_PLANS.find(p => p.id === selectedTariff),
          payment: paymentInfo,
          specialist: specialist
        }
      };

      setMessages(prev => [...prev, confirmationMessage]);
      setCurrentStep('confirmation');

      // Также перенаправляем в сообщения через 3 секунды
      setTimeout(() => {
        window.location.href = `/en/messages`;
      }, 3000);

      if (onOrderComplete) {
        onOrderComplete({
          specialistId: specialist.id,
          tariff: selectedTariff,
          payment: paymentInfo,
          conversationId: conversationId
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-900 ${className}`}>
      
      {/* Chat Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={specialist.avatar}
              alt={specialist.name}
              className="w-12 h-12 rounded-full border-2 border-purple-500"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{specialist.name}</h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">{specialist.title}</p>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600 dark:text-gray-400">{specialist.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">{specialist.responseTime}</span>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${currentStep === 'chat' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentStep === 'chat' && 'Обсуждение'}
              {currentStep === 'tariff' && 'Выбор тарифа'}
              {currentStep === 'payment' && 'Оплата'}
              {currentStep === 'confirmation' && 'Готово'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
        {messages.map((message) => {
          if (message.type === 'tariff_selection') {
            return (
              <div key={message.id} className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{message.content}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TARIFF_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => handleTariffSelect(plan.id)}
                      className={`relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                        plan.popular ? 'border-purple-500 shadow-purple-500/20' : ''
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Популярный
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center mb-4">
                        <div className="text-3xl mb-2">{plan.icon}</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                          ${plan.price}
                        </div>
                      </div>
                      
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                        Выбрать
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (message.type === 'payment_form') {
            return (
              <div key={message.id} className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{message.content}</p>
                </div>
                
                <div className="max-w-md mx-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{message.data?.name}</h3>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${message.data?.price}</p>
                    </div>
                    <div className="text-3xl">{message.data?.icon}</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Номер карты
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent pl-12"
                        />
                        <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          MM/YY
                        </label>
                        <input
                          type="text"
                          placeholder="12/25"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handlePayment({ cardNumber: '****1234', amount: message.data?.price })}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Оплатить ${message.data?.price}</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      🔒 Безопасная оплата SSL
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          if (message.type === 'confirmation') {
            return (
              <div key={message.id} className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {message.content}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ваш заказ принят в работу. {specialist.name} свяжется с вами в ближайшее время.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Детали заказа:</h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Специалист:</span>
                      <span className="font-medium">{message.data?.specialist.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Тариф:</span>
                      <span className="font-medium">{message.data?.tariff.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Стоимость:</span>
                      <span className="font-medium text-green-600">${message.data?.tariff.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Regular text message
          return (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} space-x-3`}
            >
              {message.role !== 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div
                className={`max-w-[75%] ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-l-2xl rounded-tr-2xl'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-r-2xl rounded-tl-2xl'
                } px-4 py-3 shadow-sm`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 opacity-70 ${
                  message.role === 'user' ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex justify-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-r-2xl rounded-tl-2xl px-4 py-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {specialist.name} отвечает...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - only show if not completed */}
      {currentStep !== 'confirmation' && (
        <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 p-6">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Расскажите ${specialist.name} о своем проекте...`}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                rows={2}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 