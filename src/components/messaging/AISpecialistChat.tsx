'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, CheckCircle, Clock, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { AISpecialist } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';
import { AIOrderAttachment, AIBriefData } from '@/services/messaging';

interface AISpecialistChatProps {
  specialist: AISpecialist;
  onBriefGenerated: (brief: AIBriefData) => void;
  onContinueOrder: () => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  isFromUser: boolean;
  timestamp: Date;
  type: 'text' | 'brief' | 'thinking';
  briefData?: AIBriefData;
}

export default function AISpecialistChat({ 
  specialist, 
  onBriefGenerated, 
  onContinueOrder,
  className = '' 
}: AISpecialistChatProps) {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefGenerated, setBriefGenerated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    const greetingMessage: ChatMessage = {
      id: '1',
      content: `Привет! Я ${specialist.name}, ваш ${specialist.title}. 

Расскажите мне о вашем проекте - что вы хотите создать? Чем детальнее вы опишете ваши требования, тем лучше техническое задание я смогу для вас подготовить.

Например:
• Какой тип проекта вы планируете?
• Кто ваша целевая аудитория?
• Есть ли примеры того, что вам нравится?
• Какой бюджет и сроки?`,
      isFromUser: false,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([greetingMessage]);
  }, [specialist]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateBrief = async (userRequest: string) => {
    setIsGenerating(true);
    
    // Add thinking message
    const thinkingMessage: ChatMessage = {
      id: Date.now().toString() + '_thinking',
      content: 'Анализирую ваши требования и генерирую техническое задание...',
      isFromUser: false,
      timestamp: new Date(),
      type: 'thinking'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate brief (in real implementation, this would call OpenAI/Anthropic)
    const generatedBrief: AIBriefData = {
      originalRequest: userRequest,
      generatedBrief: {
        title: `${specialist.category} проект для клиента`,
        description: `На основе ваших требований я подготовил детальное техническое задание для создания ${specialist.category.toLowerCase()} проекта.`,
        requirements: [
          'Анализ целевой аудитории и конкурентов',
          'Создание концепции и структуры проекта',
          'Разработка основных элементов',
          'Тестирование и оптимизация',
          'Предоставление финальных файлов'
        ],
        deliverables: [
          'Исходные файлы в высоком разрешении',
          'Готовые к использованию материалы',
          'Инструкция по применению',
          'Техническая документация'
        ],
        timeline: specialist.deliveryTime,
        budget: specialist.taskPrice,
        technicalSpecs: [
          'Современные стандарты и технологии',
          'Адаптивный дизайн для всех устройств',
          'Оптимизация для быстрой загрузки',
          'Соответствие лучшим практикам'
        ],
        examples: [
          'Анализ успешных кейсов в вашей нише',
          'Рекомендации по стилю и подходу',
          'Варианты развития проекта'
        ]
      },
      specialistId: specialist.id,
      specialistName: specialist.name,
      aiProvider: 'openai', // или определять динамически
      confidence: 95,
      estimatedTime: specialist.deliveryTime,
      suggestedRevisions: [
        'Уточнить предпочтения по стилю',
        'Добавить примеры для вдохновения',
        'Детализировать техническую реализацию'
      ]
    };

    // Remove thinking message and add brief
    setMessages(prev => prev.filter(msg => msg.type !== 'thinking'));

    const briefMessage: ChatMessage = {
      id: Date.now().toString(),
      content: `📝 Готово! Я подготовил для вас детальное техническое задание:`,
      isFromUser: false,
      timestamp: new Date(),
      type: 'brief',
      briefData: generatedBrief
    };

    setMessages(prev => [...prev, briefMessage]);
    setIsGenerating(false);
    setBriefGenerated(true);
    onBriefGenerated(generatedBrief);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isFromUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');

    // Generate brief if this is the first substantial message
    if (messages.length <= 1 && messageText.length > 20) {
      await generateBrief(messageText);
    } else if (!briefGenerated) {
      // Add simple AI response
      const aiResponse: ChatMessage = {
        id: Date.now().toString() + '_response',
        content: 'Спасибо за дополнительную информацию! Если вы готовы, я могу сгенерировать техническое задание на основе ваших требований.',
        isFromUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, aiResponse]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-96 bg-gray-900 rounded-xl border border-gray-700 ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-700">
        <div className="relative">
          <img
            src={specialist.avatar}
            alt={specialist.name}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${specialist.name}`;
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
        </div>
        <div>
          <h3 className="text-white font-semibold">{specialist.name}</h3>
          <p className="text-gray-400 text-sm">{specialist.title}</p>
        </div>
        <div className="ml-auto">
          <Bot className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-sm lg:max-w-md ${message.isFromUser ? 'order-2' : 'order-1'}`}>
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.isFromUser
                    ? 'bg-blue-500 text-white ml-2'
                    : 'bg-gray-800 text-gray-100 mr-2'
                }`}
              >
                {message.type === 'thinking' && (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{message.content}</span>
                  </div>
                )}

                {message.type === 'text' && (
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                )}

                {message.type === 'brief' && message.briefData && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium">{message.content}</span>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                      <h4 className="font-semibold text-green-400">{message.briefData.generatedBrief.title}</h4>
                      <p className="text-xs text-gray-300">{message.briefData.generatedBrief.description}</p>
                      
                      <div className="text-xs text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span>⏱️ {message.briefData.estimatedTime}</span>
                          <span>💰 ${message.briefData.generatedBrief.budget}</span>
                          <span>🎯 {message.briefData.confidence}% точность</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-300">
                        <strong>Основные требования:</strong>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          {message.briefData.generatedBrief.requirements.slice(0, 3).map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {briefGenerated && (
                      <button
                        onClick={onContinueOrder}
                        className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Принять ТЗ и продолжить заказ</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className={`text-xs text-gray-500 mt-1 ${message.isFromUser ? 'text-right mr-2' : 'ml-2'}`}>
                {message.timestamp.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className={`flex-shrink-0 ${message.isFromUser ? 'order-1' : 'order-2'}`}>
              {message.isFromUser ? (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              ) : (
                <img
                  src={specialist.avatar}
                  alt={specialist.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${specialist.name}`;
                  }}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!briefGenerated && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Опишите ваш проект подробнее..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              disabled={isGenerating}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isGenerating}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
            >
              {isGenerating ? (
                <Clock className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          {!isGenerating && messages.length > 1 && (
            <button
              onClick={() => generateBrief(messages[messages.length - 1]?.content || '')}
              className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Сгенерировать техническое задание</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
} 