'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, CheckCircle, User, Bot, ThumbsUp, ThumbsDown, RotateCcw, BookOpen, Star } from 'lucide-react';
import { AISpecialist } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';
import EnhancedOpenAIService from '@/lib/services/enhanced-openai';

export interface AIBriefData {
  originalRequest: string;
  generatedBrief: {
    title: string;
    description: string;
    requirements: string[];
    deliverables: string[];
    timeline: string;
    estimatedCost: number;
  };
}

interface EnhancedAIChatProps {
  specialist: AISpecialist;
  conversationId?: string;
  onBriefGenerated?: (brief: AIBriefData) => void;
  onContinueOrder?: () => void;
  onConversationCreate?: (conversationId: string) => void;
  className?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  nextSteps?: string[];
  feedback?: {
    rating: number;
    helpful: boolean;
    comment?: string;
  };
  context?: {
    confidence: number;
    processingTime: number;
    strategy: string;
  };
}

export default function EnhancedAIChat({ 
  specialist, 
  conversationId: initialConversationId,
  onBriefGenerated, 
  onContinueOrder,
  onConversationCreate,
  className = '' 
}: EnhancedAIChatProps) {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [isRestoring, setIsRestoring] = useState(false);
  const [conversationSummary, setSummaryText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const enhancedService = EnhancedOpenAIService.getInstance();

  useEffect(() => {
    if (initialConversationId) {
      restoreConversation(initialConversationId);
    } else {
      initializeNewConversation();
    }
  }, [initialConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const restoreConversation = async (convId: string) => {
    try {
      setIsRestoring(true);
      console.log('🔄 Restoring conversation:', convId);

      const response = await fetch(`/api/ai-mock?conversationId=${convId}`);
      const data = await response.json();
      
      if (data.success) {
        // Convert database/localStorage messages to component format
        const convertedMessages: Message[] = (data.conversation.messages || []).map((msg: any) => ({
          id: msg.id || msg.$id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp || msg.createdAt),
          suggestions: msg.suggestions || [],
          nextSteps: msg.nextSteps || [],
          feedback: msg.userFeedback || msg.feedback,
          context: msg.aiContext || msg.context
        }));

        setMessages(convertedMessages);
        setSummaryText(data.summary);
        setConversationId(convId);

        // Add restoration message
        const restorationMessage: Message = {
          id: Date.now().toString(),
          role: 'system',
          content: `💫 Беседа восстановлена!\n\n📋 **Краткое содержание:** ${data.summary}\n\n💡 **Предложение:** ${data.suggestedContinuation}`,
          timestamp: new Date()
        };

        setMessages(prev => [...convertedMessages, restorationMessage]);
        
        console.log('✅ Conversation restored successfully');
      } else {
        throw new Error(data.error || 'Failed to restore conversation');
      }
    } catch (error) {
      console.error('❌ Error restoring conversation:', error);
      initializeNewConversation();
    } finally {
      setIsRestoring(false);
    }
  };

  const initializeNewConversation = async () => {
    if (!user) return;

    try {
      console.log('🆕 Initializing new conversation');
      
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Привет! Я ${specialist.name}, ${specialist.title}. Готов помочь с вашим проектом! Расскажите, что вам нужно?`,
        timestamp: new Date(),
        suggestions: [
          'Создать новый проект',
          'Консультация по существующему проекту',
          'Техническая поддержка'
        ]
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('❌ Error initializing conversation:', error);
    }
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
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('💬 Sending enhanced message');
      
      const response = await fetch('/api/ai-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
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

      // Update conversation ID if this is a new conversation
      if (!conversationId) {
        setConversationId(data.conversationId);
        if (onConversationCreate) {
          onConversationCreate(data.conversationId);
        }
      }

      const assistantMessage: Message = {
        id: data.messageId,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions,
        nextSteps: data.nextSteps,
        context: data.context
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if we should generate a brief
      const userMessages = messages.filter(m => m.role === 'user').length;
      if (userMessages >= 2 && onBriefGenerated) {
        await generateBrief();
      }

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте переформулировать ваш запрос.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBrief = async () => {
    try {
      console.log('📋 Generating technical brief');
      
      const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join('\n\n');
      
      const response = await fetch('/api/ai-specialist-chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistId: specialist.id,
          userRequirements: userMessages
        })
      });

      const data = await response.json();
      
      if (data.success && onBriefGenerated) {
        const briefData: AIBriefData = {
          originalRequest: userMessages,
          generatedBrief: data.brief
        };
        
        onBriefGenerated(briefData);

        const briefMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `✅ Техническое задание готово!\n\n**${data.brief.title}**\n\n${data.brief.description}\n\n**Сроки:** ${data.brief.timeline}\n**Стоимость:** $${data.brief.estimatedCost}`,
          timestamp: new Date(),
          nextSteps: ['Просмотреть полное ТЗ', 'Оформить заказ', 'Обсудить детали']
        };

        setMessages(prev => [...prev, briefMessage]);
      }
    } catch (error) {
      console.error('❌ Error generating brief:', error);
    }
  };

  const handleFeedback = async (messageId: string, helpful: boolean, rating: number = 0, comment?: string) => {
    try {
      if (!conversationId) return;

      const response = await fetch('/api/enhanced-ai-chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          conversationId,
          feedback: {
            rating,
            helpful,
            comment
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Mock feedback - just log for now since we're using local storage
        console.log('📝 Feedback recorded:', { messageId, rating, helpful, comment });
        
        // Update message with feedback
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, feedback: { rating, helpful, comment } }
            : msg
        ));

        console.log('✅ Feedback recorded');
      }
    } catch (error) {
      console.error('❌ Error recording feedback:', error);
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

  if (isRestoring) {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-8 text-center">
          <RotateCcw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Восстанавливаем беседу...</h3>
          <p className="text-gray-600 dark:text-gray-400">Загружаем историю сообщений и контекст</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Enhanced Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
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
              <span className="text-xs text-green-600 dark:text-green-400">● Online</span>
              {conversationId && (
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600 dark:text-blue-400">Conversation Active</span>
                </div>
              )}
            </div>
          </div>
          {conversationSummary && (
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Session Summary</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 max-w-32 truncate">{conversationSummary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Chat Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} space-x-2`}
          >
            {message.role !== 'user' && (
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'system' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                }`}>
                  {message.role === 'system' ? (
                    <BookOpen className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            )}
            
            <div
              className={`max-w-[75%] ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white rounded-l-2xl rounded-tr-2xl'
                  : message.role === 'system'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 rounded-r-2xl rounded-tl-2xl border border-indigo-200 dark:border-indigo-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-r-2xl rounded-tl-2xl'
              } px-4 py-3 shadow-sm`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Context Info */}
              {message.context && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>⚡ {message.context.confidence}% confidence</span>
                    <span>⏱️ {message.context.processingTime}ms</span>
                    <span>🎯 {message.context.strategy}</span>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">💡 Предложения:</p>
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(suggestion)}
                      className="block w-full text-left text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Next Steps */}
              {message.nextSteps && message.nextSteps.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">🚀 Следующие шаги:</p>
                  {message.nextSteps.map((step, index) => (
                    <div key={index} className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                      {step}
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback */}
              {message.role === 'assistant' && message.id && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                  {message.feedback ? (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className={message.feedback.helpful ? 'text-green-600' : 'text-red-600'}>
                        {message.feedback.helpful ? '👍 Полезно' : '👎 Не помогло'}
                      </span>
                      {message.feedback.rating > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-yellow-600">{message.feedback.rating}/5</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFeedback(message.id, true, 5)}
                        className="text-green-600 hover:text-green-700 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, false, 1)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

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
        ))}
        
        {isLoading && (
          <div className="flex justify-start space-x-2">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-r-2xl rounded-tl-2xl px-4 py-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {specialist.name} думает...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Опишите ваш проект для ${specialist.name}...`}
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
        
        {/* Conversation Controls */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {conversationId && (
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Беседа сохраняется автоматически</span>
              </span>
            )}
          </div>
          {onContinueOrder && (
            <button
              onClick={onContinueOrder}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Продолжить заказ
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 