'use client';

import { useState } from 'react';
import { getFeaturedSpecialists } from '@/lib/data/ai-specialists';

export default function TestAIPage() {
  const [selectedSpecialist, setSelectedSpecialist] = useState('alex-ai');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');

  const specialists = [
    { id: 'alex-ai', name: 'Alex AI - Tech Architect' },
    { id: 'luna-design', name: 'Luna Design - UI/UX Designer' },
    { id: 'viktor-reels', name: 'Viktor Reels - Video Creator' },
    { id: 'max-bot', name: 'Max Bot - Automation Expert' },
    { id: 'sarah-voice', name: 'Sarah Voice - Voice Solutions' },
    { id: 'data-analyst-ai', name: 'Data Analyst AI - Data Scientist' },
    { id: 'max-powerful', name: 'Max Powerful - Multi-AI Solution' },
  ];

  const testAI = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          specialistId: selectedSpecialist,
          conversationId: conversationId || undefined
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setResponse(data.message);
        setConversationId(data.conversationId);
      } else {
        setResponse('Error: ' + data.error);
      }
    } catch (error) {
      setResponse('Network error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          🤖 AI Specialists Test Page
        </h1>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          
          {/* Specialist Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Выберите AI специалиста:
            </label>
            <select 
              value={selectedSpecialist}
              onChange={(e) => setSelectedSpecialist(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {specialists.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Ваше сообщение:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Например: Помоги создать веб-приложение"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Test Button */}
          <button
            onClick={testAI}
            disabled={loading || !message.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>AI обрабатывает...</span>
              </>
            ) : (
              <>
                <span>🚀 Протестировать AI</span>
              </>
            )}
          </button>

          {/* Response */}
          {response && (
            <div className="mt-8">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Ответ AI специалиста:
              </label>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                  {response}
                </pre>
              </div>
            </div>
          )}

          {/* Conversation ID */}
          {conversationId && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💬 Conversation ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{conversationId}</code>
              </p>
            </div>
          )}

          {/* Quick Test Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Быстрые тесты:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setMessage('Помоги создать React приложение')}
                className="text-left px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                💻 Веб-разработка
              </button>
              <button
                onClick={() => setMessage('Создай дизайн для мобильного приложения')}
                className="text-left px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                🎨 Дизайн
              </button>
              <button
                onClick={() => setMessage('Сделай видео для рекламы')}
                className="text-left px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                🎬 Видео
              </button>
              <button
                onClick={() => setMessage('Создай стратегию развития AI стартапа')}
                className="text-left px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                🚀 Max Powerful
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            🧪 Тестовая страница для проверки AI специалистов<br/>
            Система работает с mock API для демонстрации возможностей
          </p>
        </div>
      </div>
    </div>
  );
} 