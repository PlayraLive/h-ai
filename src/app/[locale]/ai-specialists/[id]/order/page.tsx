import { Suspense } from 'react';
import { getAISpecialists } from '@/lib/data/ai-specialists';
import OrderFlowChat from '@/components/OrderFlowChat';
import AuthGuard from '@/components/AuthGuard';

interface OrderPageProps {
  params: { 
    locale: string; 
    id: string; 
  };
  searchParams: { 
    type?: string;
  };
}

async function OrderPage({ params, searchParams }: OrderPageProps) {
  // Get specialist data
  const awaitedParams = await params;
  
  console.log('🔍 OrderPage: Loading specialist with ID:', awaitedParams.id);
  
  const specialists = await getAISpecialists();
  console.log('📋 OrderPage: Available specialists:', specialists.map(s => s.id));
  
  let specialist = specialists.find(s => s.id === awaitedParams.id);
  console.log('✅ OrderPage: Found specialist:', specialist ? specialist.name : 'NOT FOUND');
  
  if (!specialist) {
    console.error('❌ OrderPage: Specialist not found, redirecting to Alex AI as fallback');
    // Fallback к Alex AI если специалист не найден
    const fallbackSpecialist = specialists.find(s => s.id === 'alex-ai') || specialists[0];
    
    if (!fallbackSpecialist) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Данные специалистов недоступны
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Попробуйте перезагрузить страницу или обратитесь в поддержку.
            </p>
            <a 
              href="/en" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться на главную
            </a>
          </div>
        </div>
      );
    }
    
    // Используем fallback специалиста
    specialist = fallbackSpecialist;
    console.log('🔄 OrderPage: Using fallback specialist:', specialist.name);
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Заказать услуги {specialist.name}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Упрощенный процесс заказа: обсуждение → выбор тарифа → оплата
            </p>
          </div>

        {/* Specialist Info Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                <img
                    src={specialist.avatar}
                    alt={specialist.name}
                  className="w-full h-full object-cover"
                />
                </div>
                <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {specialist.name}
                </h2>
                <p className="text-lg text-blue-600 dark:text-blue-400 mb-2 font-medium">
                  {specialist.title}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {specialist.shortDescription}
                </p>
                    </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {specialist.rating}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {specialist.completedTasks} задач
                </p>
              </div>
            </div>
                    </div>
                  </div>
                  
        {/* Order Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          }>
            <OrderFlowChat
              specialist={specialist}
            />
          </Suspense>
            </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Прямое общение
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Обсуждайте проект напрямую с AI специалистом
              </p>
            </div>

            <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Быстрый старт
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Начните работу над проектом сразу после заказа
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Результат
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Получите качественное решение вашей задачи
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
} 

export default OrderPage; 