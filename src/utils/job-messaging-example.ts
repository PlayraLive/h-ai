// 🔐 Пример интеграции безопасной системы сообщений с джобами
// Этот файл показывает, как правильно интегрировать сообщения в ваше приложение

import { MessagingHelpers } from '../lib/messaging-integration';
import { messagingService } from '../services/messaging';

/**
 * 🔐 Пример 1: Создание канала при публикации джоба
 */
export async function onJobPublished(jobData: {
  $id: string;
  title: string;
  clientId: string;
  budget: { min: number; max: number; currency: string };
}) {
  try {
    console.log('💼 Creating secure channel for job:', jobData.title);
    
    // Создаем уникальный канал для джоба
    const jobChannel = await MessagingHelpers.createJobChannel({
      $id: jobData.$id,
      title: jobData.title,
      clientId: jobData.clientId,
      status: 'open',
      budget: jobData.budget,
      freelancerId: undefined // Будет добавлен при принятии заявки
    });
    
    console.log('✅ Job channel created:', jobChannel.$id);
    return jobChannel;
    
  } catch (error) {
    console.error('❌ Failed to create job channel:', error);
    throw error;
  }
}

/**
 * 🤝 Пример 2: Добавление фрилансера при принятии заявки  
 */
export async function onJobApplicationAccepted(jobId: string, freelancerId: string) {
  try {
    console.log('✅ Adding freelancer to job channel...');
    
    // Добавляем фрилансера в канал джоба
    await MessagingHelpers.addFreelancerToJob(jobId, freelancerId);
    
    console.log('✅ Freelancer added to job channel');
    
  } catch (error) {
    console.error('❌ Failed to add freelancer to job channel:', error);
    throw error;
  }
}

/**
 * 🏗️ Пример 3: Создание проектного канала при подписании контракта
 */
export async function onContractSigned(contractData: {
  $id: string;
  jobId: string;
  contractId: string;
  title: string;
  clientId: string;
  freelancerId: string;
}) {
  try {
    console.log('📋 Creating project channel for contract...');
    
    const projectChannel = await MessagingHelpers.createProjectChannel({
      $id: contractData.$id,
      jobId: contractData.jobId,
      contractId: contractData.contractId,
      title: contractData.title,
      clientId: contractData.clientId,
      freelancerId: contractData.freelancerId,
      status: 'active'
    });
    
    console.log('✅ Project channel created:', projectChannel.$id);
    return projectChannel;
    
  } catch (error) {
    console.error('❌ Failed to create project channel:', error);
    throw error;
  }
}

/**
 * 💬 Пример 4: Безопасная отправка сообщения
 */
export async function sendSecureMessage(data: {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType?: 'text' | 'file' | 'system';
}) {
  try {
    console.log('🔒 Sending secure message...');
    
    // Отправляем сообщение с проверкой безопасности
    const message = await messagingService.sendMessage({
      conversationId: data.conversationId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      content: data.content,
      messageType: data.messageType || 'text'
    });
    
    console.log('✅ Secure message sent:', message.$id);
    return message;
    
  } catch (error) {
    console.error('🚫 Message blocked by security check:', error);
    throw error;
  }
}

/**
 * 🔍 Пример 5: Проверка доступа к каналу
 */
export async function checkChannelAccess(jobId: string, userId: string): Promise<boolean> {
  try {
    // Находим канал джоба
    const jobChannel = await messagingService.findJobChannel(jobId);
    
    if (!jobChannel) {
      console.log('❌ Job channel not found');
      return false;
    }
    
    // Проверяем участие пользователя
    const hasAccess = jobChannel.participants.includes(userId);
    
    console.log(hasAccess ? '✅ Access granted' : '🚫 Access denied');
    return hasAccess;
    
  } catch (error) {
    console.error('❌ Error checking channel access:', error);
    return false;
  }
}

/**
 * 📊 Пример 6: Получение безопасной истории сообщений
 */
export async function getSecureMessageHistory(conversationId: string, userId: string) {
  try {
    console.log('🔒 Loading secure message history...');
    
    // Загружаем сообщения с проверкой доступа
    const messages = await messagingService.getMessages(conversationId, userId, 50, 0);
    
    console.log(`✅ Loaded ${messages.length} secure messages`);
    return messages;
    
  } catch (error) {
    console.error('🚫 Access to messages denied:', error);
    return [];
  }
}

/**
 * 🧪 Функция для тестирования всей системы
 */
export async function testSecureMessagingSystem() {
  console.log('🧪 Testing secure messaging system...');
  
  try {
    // 1. Тест создания джоба
    const testJobData = {
      $id: 'test-job-123',
      title: 'Тестовый джоб',
      clientId: 'test-client-456',
      budget: { min: 1000, max: 5000, currency: 'USD' }
    };
    
    const jobChannel = await onJobPublished(testJobData);
    console.log('✅ Test 1 passed: Job channel created');
    
    // 2. Тест добавления фрилансера
    await onJobApplicationAccepted(testJobData.$id, 'test-freelancer-789');
    console.log('✅ Test 2 passed: Freelancer added');
    
    // 3. Тест проверки доступа
    const hasAccess = await checkChannelAccess(testJobData.$id, testJobData.clientId);
    console.log('✅ Test 3 passed: Access check works');
    
    // 4. Тест отправки сообщения
    await sendSecureMessage({
      conversationId: jobChannel.$id,
      senderId: testJobData.clientId,
      receiverId: 'test-freelancer-789',
      content: 'Привет! Обсудим проект?'
    });
    console.log('✅ Test 4 passed: Secure message sent');
    
    // 5. Тест загрузки истории
    const messages = await getSecureMessageHistory(jobChannel.$id, testJobData.clientId);
    console.log('✅ Test 5 passed: Message history loaded');
    
    console.log('🎉 ALL TESTS PASSED! Secure messaging system is working!');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  }
}

// Экспортируем все функции
export default {
  onJobPublished,
  onJobApplicationAccepted,
  onContractSigned,
  sendSecureMessage,
  checkChannelAccess,
  getSecureMessageHistory,
  testSecureMessagingSystem
};
