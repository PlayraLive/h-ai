import { Suspense } from 'react';
import { getAISpecialists } from '@/lib/data/ai-specialists';
import { getTranslations } from 'next-intl/server';
import EnhancedAIChat from '@/components/messaging/EnhancedAIChat';

interface AISpecialistChatPageProps {
  params: { 
    locale: string; 
    id: string; 
  };
  searchParams: { 
    orderId?: string; 
    conversationId?: string;
    conversationType?: 'order_chat' | 'consultation' | 'support' | 'briefing';
  };
}

async function AISpecialistChatPage({ params, searchParams }: AISpecialistChatPageProps) {
  const t = await getTranslations('ai-specialists');
  
  // Get specialist data
  const specialists = await getAISpecialists();
  const specialist = specialists.find(s => s.id === params.id);
  
  if (!specialist) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            AI Специалист не найден
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Запрашиваемый специалист не существует или был удален.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={specialist.avatar}
              alt={specialist.name}
              className="w-16 h-16 rounded-2xl object-cover border-4 border-purple-500/30 shadow-lg"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(specialist.name)}&background=6366f1&color=fff`;
              }}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Чат с {specialist.name}
              </h1>
              <p className="text-lg text-purple-600 dark:text-purple-400">
                {specialist.title}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Online
                  </span>
                </div>
                {searchParams.orderId && (
                  <span className="text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                    Заказ #{searchParams.orderId.slice(-8)}
                  </span>
                )}
                {searchParams.conversationType && (
                  <span className="text-sm bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full font-medium">
                    {searchParams.conversationType === 'order_chat' ? 'Обсуждение заказа' :
                     searchParams.conversationType === 'consultation' ? 'Консультация' :
                     searchParams.conversationType === 'support' ? 'Поддержка' :
                     'Техническое задание'}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⭐</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Рейтинг</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{specialist.rating}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚡</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Время ответа</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{specialist.responseTime}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🎯</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Задач завершено</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{specialist.completedTasks}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced AI Chat */}
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          }>
            <EnhancedAIChat
              specialist={specialist}
              conversationId={searchParams.conversationId}
              className="h-[600px]"
              onBriefGenerated={(brief) => {
                console.log('Brief generated:', brief);
                // Handle brief generation - could create order, save to database, etc.
              }}
              onConversationCreate={(conversationId) => {
                console.log('Conversation created:', conversationId);
                // Update URL to include conversation ID for future restoration
                const url = new URL(window.location.href);
                url.searchParams.set('conversationId', conversationId);
                window.history.replaceState({}, '', url.toString());
              }}
            />
          </Suspense>
        </div>

        {/* Footer Info */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              О специалисте
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {specialist.shortDescription}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Специализации</h4>
                <div className="flex flex-wrap gap-2">
                  {specialist.skills.slice(0, 6).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Возможности</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Техническое консультирование</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Создание технических заданий</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Поддержка проектов 24/7</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Обучение и помощь</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AISpecialistChatPage; 