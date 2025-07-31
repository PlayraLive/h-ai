'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, CheckCircle, User, Bot } from 'lucide-react';
import PositiveSpecialistAvatar from '@/components/PositiveSpecialistAvatar';
import { AISpecialist } from '@/types';
import { OpenAIService, AI_SPECIALIST_CONTEXTS } from '@/lib/services/openai';

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

interface AISpecialistChatProps {
  specialist: AISpecialist;
  onBriefGenerated: (brief: AIBriefData) => void;
  onContinueOrder: () => void;
  className?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  nextSteps?: string[];
}

export default function AISpecialistChat({ 
  specialist, 
  onBriefGenerated, 
  onContinueOrder,
  className = '' 
}: AISpecialistChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [briefGenerated, setBriefGenerated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openAIService = OpenAIService.getInstance();

  // Initialize chat with specialist introduction
  useEffect(() => {
    if (!isInitialized) {
      initializeChat();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      const intro = await openAIService.generateSpecialistIntro(specialist.id);
      
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: intro,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing chat:', error);
      // Fallback message
      const context = AI_SPECIALIST_CONTEXTS[specialist.id];
      const fallbackMessage: Message = {
      id: Date.now().toString(),
        role: 'assistant',
        content: `Привет! Я ${specialist.name}, ${specialist.title}. Готов помочь с вашим проектом! Расскажите, что вам нужно?`,
        timestamp: new Date()
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate AI response using mock service
      const response = await fetch('/api/ai-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: undefined, // Let it create new conversation
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

      const assistantMessage: Message = {
        id: data.messageId || (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions,
        nextSteps: data.nextSteps
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if we have enough information to generate a brief
      const allUserMessages = [...messages.filter(m => m.role === 'user'), userMessage];
      if (allUserMessages.length >= 2 && !briefGenerated) {
        await generateBrief(allUserMessages.map(m => m.content).join('\n\n'));
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      
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

  const generateBrief = async (userRequirements: string) => {
    try {
      console.log('🎯 Generating technical brief for specialist:', specialist.name);
      
      const generatedBrief = await openAIService.generateTechnicalBrief(
        specialist.id,
        userRequirements
      );

      const briefData: AIBriefData = {
        originalRequest: userRequirements,
        generatedBrief
      };

      console.log('✅ Technical brief generated:', briefData);
      
      setBriefGenerated(true);
      onBriefGenerated(briefData);

      // Add system message about brief generation
      const briefMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `✅ Отлично! Я создал техническое задание на основе наших обсуждений:\n\n**${generatedBrief.title}**\n\n${generatedBrief.description}\n\n**Сроки:** ${generatedBrief.timeline}\n**Примерная стоимость:** $${generatedBrief.estimatedCost}\n\nВы можете продолжить оформление заказа!`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, briefMessage]);

    } catch (error) {
      console.error('❌ Error generating brief:', error);
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

  const getSpecialistContext = () => {
    return AI_SPECIALIST_CONTEXTS[specialist.id];
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
        <PositiveSpecialistAvatar 
          specialistId={specialist.id}
          specialistName={specialist.name}
          size="md"
          showStatus={true}
        />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{specialist.name}</h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">{specialist.title}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-green-600 dark:text-green-400">● Online</span>
              {getSpecialistContext() && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getSpecialistContext().experience}
                </span>
              )}
            </div>
        </div>
          {briefGenerated && (
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">ТЗ готово</span>
        </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} space-x-2`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                  </div>
                )}
            <div
              className={`max-w-[70%] ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white rounded-l-2xl rounded-tr-2xl'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-r-2xl rounded-tl-2xl'
              } px-4 py-3 shadow-sm`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 opacity-70 ${
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
                  {specialist.name} печатает...
                </span>
                </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
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
        
        {briefGenerated && (
          <div className="mt-4 text-center">
            <button
              onClick={onContinueOrder}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Продолжить оформление заказа
            </button>
          </div>
          )}
        </div>
    </div>
  );
} 