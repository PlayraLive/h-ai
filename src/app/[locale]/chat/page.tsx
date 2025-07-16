// Страница мессенджера
'use client';

import React, { useEffect } from 'react';
import { MessagingApp } from '../../../components/messaging/MessagingApp';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';

interface ChatPageProps {
  params: {
    locale: string;
  };
  searchParams: {
    conversation?: string;
  };
}

export default function ChatPage({ params, searchParams }: ChatPageProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${params.locale}/login`);
    }
  }, [isLoading, isAuthenticated, router, params.locale]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка мессенджера...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Редирект происходит в useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Заголовок страницы */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/${params.locale}/dashboard`)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors lg:hidden"
              title="Назад к дашборду"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💬 Мессенджер</h1>
              <p className="text-gray-600">Супер продуманная система сообщений с заказами и таймлайном</p>
            </div>
          </div>
          
          {/* Статус пользователя */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Онлайн</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        </div>
      </div>

      {/* Основной мессенджер */}
      <div className="h-[calc(100vh-88px)]">
        <MessagingApp
          userId={user.$id}
          initialConversationId={searchParams.conversation}
          className="h-full"
        />
      </div>
    </div>
  );
}
