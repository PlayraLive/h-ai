"use client";

import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import EnhancedChatWindow from '@/components/messaging/EnhancedChatWindow';
import Navbar from '@/components/Navbar';

interface TestMessage {
  $id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: string;
  messageType: 'text' | 'image' | 'file' | 'voice' | 'video' | 'system' | 'order_card' | 'job_card' | 'ai_response';
  isRead: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  senderName?: string;
  senderAvatar?: string;
}

const INITIAL_MESSAGES: TestMessage[] = [
  {
    $id: 'test-1',
    content: 'Добро пожаловать в тестовый чат!',
    senderId: 'system',
    receiverId: 'user',
    conversationId: 'test-conv',
    createdAt: new Date().toISOString(),
    messageType: 'text',
    isRead: true,
    status: 'delivered',
    senderName: 'Система'
  }
];

export default function TestMessagingPage() {
  const { user, isAuthenticated } = useAuthContext();
  const [messages, setMessages] = useState<TestMessage[]>(INITIAL_MESSAGES);
  const [messageCount, setMessageCount] = useState(1);

  const testConversation = {
    $id: 'test-conv',
    title: 'Тестовая беседа',
    participants: [user?.$id || 'test-user', 'test-bot']
  };

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    console.log('🧪 Test handleSendMessage called:', { content, attachments });
    
    if (!content.trim()) return;

    const newMessage: TestMessage = {
      $id: `test-msg-${Date.now()}`,
      content: content,
      senderId: user?.$id || 'test-user',
      receiverId: 'test-bot',
      conversationId: 'test-conv',
      createdAt: new Date().toISOString(),
      messageType: 'text',
      isRead: false,
      status: 'sent',
      senderName: user?.name || 'Тестовый пользователь'
    };

    console.log('➕ Adding new test message:', newMessage);
    
    setMessages(prev => {
      const newMessages = [...prev, newMessage];
      console.log('📊 Test messages updated, total:', newMessages.length);
      return newMessages;
    });

    setMessageCount(prev => prev + 1);

    // Simulate response after delay
    setTimeout(() => {
      const botResponse: TestMessage = {
        $id: `test-bot-${Date.now()}`,
        content: `Получил ваше сообщение "${content}". Это сообщение номер ${messageCount + 1}!`,
        senderId: 'test-bot',
        receiverId: user?.$id || 'test-user',
        conversationId: 'test-conv',
        createdAt: new Date().toISOString(),
        messageType: 'text',
        isRead: false,
        status: 'delivered',
        senderName: 'Тестовый бот'
      };

      console.log('🤖 Adding bot response:', botResponse);
      setMessages(prev => [...prev, botResponse]);
      setMessageCount(prev => prev + 1);
    }, 1000);
  };

  const handleDeleteMessage = async (messageId: string) => {
    console.log('🗑️ Test delete message:', messageId);
    setMessages(prev => prev.filter(msg => msg.$id !== messageId));
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    console.log('✏️ Test edit message:', messageId, newContent);
    setMessages(prev => prev.map(msg => 
      msg.$id === messageId 
        ? { ...msg, content: newContent, isEdited: true }
        : msg
    ));
  };

  const handleReplyToMessage = (messageId: string) => {
    console.log('↩️ Test reply to message:', messageId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-4">Войдите для тестирования</h2>
            <p className="text-gray-400">Необходима авторизация для тестирования чата</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <Navbar />
      
      <div className="h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
          <h1 className="text-xl font-bold">Тестирование системы сообщений</h1>
          <p className="text-purple-100 text-sm">
            Всего сообщений: {messages.length} | Пользователь: {user?.name}
          </p>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 text-white p-2 text-xs font-mono">
          <div>Debug: Conversation ID = {testConversation.$id}</div>
          <div>Messages: {JSON.stringify(messages.map(m => ({ id: m.$id, content: m.content.substring(0, 20) + '...' })))}</div>
        </div>

        {/* Chat */}
        <div className="flex-1">
          <EnhancedChatWindow
            conversation={testConversation as any}
            messages={messages as any}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onEditMessage={handleEditMessage}
            onReplyToMessage={handleReplyToMessage}
            loading={false}
          />
        </div>
      </div>
    </div>
  );
} 