import { databases, DATABASE_ID, ID, Query } from '@/lib/appwrite/database';

interface ChatNavigationOptions {
  userId: string;
  targetUserId?: string;
  jobId?: string;
  orderId?: string;
  projectId?: string;
  conversationType?: 'job' | 'ai_order' | 'project' | 'direct';
}

interface ConversationInfo {
  conversationId: string;
  chatUrl: string;
  isNew: boolean;
}

export class ChatNavigationService {
  
  // Главная функция для получения ссылки на чат
  static async getChatUrl(options: ChatNavigationOptions): Promise<ConversationInfo> {
    const { userId, targetUserId, jobId, orderId, projectId, conversationType } = options;
    
    try {
      // Определяем тип беседы
      if (orderId) {
        return await this.getAIOrderChatUrl(userId, orderId);
      }
      
      if (jobId && targetUserId) {
        return await this.getJobChatUrl(userId, targetUserId, jobId);
      }
      
      if (projectId && targetUserId) {
        return await this.getProjectChatUrl(userId, targetUserId, projectId);
      }
      
      if (targetUserId) {
        return await this.getDirectChatUrl(userId, targetUserId);
      }
      
      throw new Error('Insufficient parameters for chat navigation');
    } catch (error) {
      console.error('Error getting chat URL:', error);
      throw error;
    }
  }
  
  // Чат для AI заказов
  private static async getAIOrderChatUrl(userId: string, orderId: string): Promise<ConversationInfo> {
    try {
      // Ищем существующую AI беседу
      const existingConversations = await databases.listDocuments(
        DATABASE_ID,
        'ai_conversations',
        [
          Query.equal('user_id', userId),
          Query.equal('order_id', orderId)
        ]
      );
      
      if (existingConversations.documents.length > 0) {
        const conversation = existingConversations.documents[0];
        return {
          conversationId: conversation.$id,
          chatUrl: `/en/ai-specialists/${this.extractSpecialistId(orderId)}/chat?conversation=${conversation.$id}`,
          isNew: false
        };
      }
      
      // Получаем информацию о заказе чтобы определить специалиста
      const order = await databases.getDocument(DATABASE_ID, 'orders', orderId);
      const specialistId = order.specialist_id || order.specialist || 'alex-ai'; // fallback
      
      return {
        conversationId: '',
        chatUrl: `/en/ai-specialists/${specialistId}/chat?order=${orderId}`,
        isNew: true
      };
    } catch (error) {
      console.error('Error getting AI order chat URL:', error);
      // Fallback to default AI specialist
      return {
        conversationId: '',
        chatUrl: `/en/ai-specialists/alex-ai/chat?order=${orderId}`,
        isNew: true
      };
    }
  }
  
  // Чат для jobs (между клиентом и фрилансером)
  private static async getJobChatUrl(userId: string, targetUserId: string, jobId: string): Promise<ConversationInfo> {
    try {
      // Ищем существующую беседу по job
      const existingConversations = await databases.listDocuments(
        DATABASE_ID,
        'conversations',
        [
          Query.contains('participants', userId),
          Query.contains('participants', targetUserId),
          Query.equal('job_id', jobId)
        ]
      );
      
      if (existingConversations.documents.length > 0) {
        const conversation = existingConversations.documents[0];
        return {
          conversationId: conversation.$id,
          chatUrl: `/en/messages?conversation=${conversation.$id}`,
          isNew: false
        };
      }
      
      // Создаем новую беседу
      const newConversation = await databases.createDocument(
        DATABASE_ID,
        'conversations',
        ID.unique(),
        {
          participants: [userId, targetUserId],
          job_id: jobId,
          last_message: '',
          last_message_time: new Date().toISOString(),
          unread_count: JSON.stringify({ [userId]: 0, [targetUserId]: 0 }),
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
      
      return {
        conversationId: newConversation.$id,
        chatUrl: `/en/messages?conversation=${newConversation.$id}`,
        isNew: true
      };
    } catch (error) {
      console.error('Error getting job chat URL:', error);
      return {
        conversationId: '',
        chatUrl: `/en/messages?user=${targetUserId}&job=${jobId}`,
        isNew: true
      };
    }
  }
  
  // Чат для проектов
  private static async getProjectChatUrl(userId: string, targetUserId: string, projectId: string): Promise<ConversationInfo> {
    try {
      // Ищем существующую беседу по проекту
      const existingConversations = await databases.listDocuments(
        DATABASE_ID,
        'conversations',
        [
          Query.contains('participants', userId),
          Query.contains('participants', targetUserId),
          Query.equal('project_id', projectId)
        ]
      );
      
      if (existingConversations.documents.length > 0) {
        const conversation = existingConversations.documents[0];
        return {
          conversationId: conversation.$id,
          chatUrl: `/en/messages?conversation=${conversation.$id}`,
          isNew: false
        };
      }
      
      // Создаем новую беседу для проекта
      const newConversation = await databases.createDocument(
        DATABASE_ID,
        'conversations',
        ID.unique(),
        {
          participants: [userId, targetUserId],
          project_id: projectId,
          last_message: '',
          last_message_time: new Date().toISOString(),
          unread_count: JSON.stringify({ [userId]: 0, [targetUserId]: 0 }),
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
      
      return {
        conversationId: newConversation.$id,
        chatUrl: `/en/messages?conversation=${newConversation.$id}`,
        isNew: true
      };
    } catch (error) {
      console.error('Error getting project chat URL:', error);
      return {
        conversationId: '',
        chatUrl: `/en/messages?user=${targetUserId}&project=${projectId}`,
        isNew: true
      };
    }
  }
  
  // Прямой чат между пользователями
  private static async getDirectChatUrl(userId: string, targetUserId: string): Promise<ConversationInfo> {
    try {
      // Ищем существующую прямую беседу
      const existingConversations = await databases.listDocuments(
        DATABASE_ID,
        'conversations',
        [
          Query.contains('participants', userId),
          Query.contains('participants', targetUserId),
          Query.isNull('job_id'),
          Query.isNull('project_id')
        ]
      );
      
      if (existingConversations.documents.length > 0) {
        const conversation = existingConversations.documents[0];
        return {
          conversationId: conversation.$id,
          chatUrl: `/en/messages?conversation=${conversation.$id}`,
          isNew: false
        };
      }
      
      // Создаем новую прямую беседу
      const newConversation = await databases.createDocument(
        DATABASE_ID,
        'conversations',
        ID.unique(),
        {
          participants: [userId, targetUserId],
          last_message: '',
          last_message_time: new Date().toISOString(),
          unread_count: JSON.stringify({ [userId]: 0, [targetUserId]: 0 }),
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
      
      return {
        conversationId: newConversation.$id,
        chatUrl: `/en/messages?conversation=${newConversation.$id}`,
        isNew: true
      };
    } catch (error) {
      console.error('Error getting direct chat URL:', error);
      return {
        conversationId: '',
        chatUrl: `/en/messages?user=${targetUserId}`,
        isNew: true
      };
    }
  }
  
  // Вспомогательные функции
  private static extractSpecialistId(orderId: string): string {
    // Логика извлечения ID специалиста из заказа
    // По умолчанию возвращаем alex-ai если не можем определить
    return 'alex-ai';
  }
  
  // Функция для создания быстрых ссылок на популярные чаты
  static getQuickChatLinks(userId: string) {
    return {
      // Ссылка на главную страницу сообщений
      allMessages: '/en/messages',
      
      // Ссылка на AI чат по умолчанию
      defaultAI: '/en/ai-specialists/alex-ai/chat',
      
      // Ссылка на создание нового чата
      newChat: '/en/messages?new=true'
    };
  }
  
  // Функция для уведомлений о новых сообщениях
  static async sendChatNotification(
    fromUserId: string, 
    toUserId: string, 
    conversationId: string, 
    messagePreview: string
  ) {
    try {
      // Создаем уведомление о новом сообщении
      await databases.createDocument(
        DATABASE_ID,
        'notifications',
        ID.unique(),
        {
          user_id: toUserId,
          type: 'message',
          title: 'Новое сообщение',
          message: messagePreview,
          data: JSON.stringify({
            from_user_id: fromUserId,
            conversation_id: conversationId,
            chat_url: `/en/messages?conversation=${conversationId}`
          }),
          read: false,
          created_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error sending chat notification:', error);
    }
  }
} 