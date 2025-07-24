import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import { 
  MessagingService, 
  AIOrderAttachment, 
  JobCardAttachment, 
  SolutionCardAttachment,
  AIBriefData,
  Message,
  Conversation
} from '@/services/messaging';
import { NotificationService } from './notification-service';

export interface UnifiedConversation extends Conversation {
  participants: string[];
  participantDetails: Array<{
    userId: string;
    name: string;
    avatar?: string;
    role: 'client' | 'freelancer' | 'ai_specialist';
    isOnline?: boolean;
  }>;
  projectId?: string;
  aiOrderId?: string;
  jobId?: string;
  solutionId?: string;
  conversationType: 'direct' | 'project' | 'ai_order' | 'job' | 'solution' | 'support';
  contextData?: {
    orderType?: 'regular' | 'ai' | 'job' | 'solution';
    status?: string;
    budget?: number;
    deadline?: string;
    skills?: string[];
    category?: string;
  };
  lastActivity: string;
  unreadCounts: Record<string, number>;
  isPinned?: boolean;
  isArchived?: boolean;
  tags?: string[];
}

export interface ConversationFilter {
  userId: string;
  type?: 'all' | 'ai_orders' | 'jobs' | 'solutions' | 'projects' | 'direct';
  status?: 'active' | 'completed' | 'archived';
  unreadOnly?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export class UnifiedChatService extends MessagingService {
  
  // Создать или получить конверсацию для AI заказа
  static async getOrCreateAIOrderConversation(
    aiOrderId: string,
    clientId: string,
    specialistData: {
      specialistId: string;
      specialistName: string;
      specialistTitle: string;
      specialistAvatar: string;
    }
  ): Promise<UnifiedConversation> {
    try {
      // Ищем существующую конверсацию
      const existingConversations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        [
          Query.equal('ai_order_id', aiOrderId),
          Query.equal('client_id', clientId),
          Query.limit(1)
        ]
      );

      if (existingConversations.documents.length > 0) {
        return this.enrichConversation(existingConversations.documents[0]);
      }

      // Создаем новую конверсацию для AI заказа
      const now = new Date().toISOString();
      const conversation = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        ID.unique(),
        {
          participants: [clientId, specialistData.specialistId],
          ai_order_id: aiOrderId,
          conversation_type: 'ai_order',
          title: `AI заказ: ${specialistData.specialistTitle}`,
          last_activity: now,
          unread_counts: JSON.stringify({ [clientId]: 0, [specialistData.specialistId]: 0 }),
          is_pinned: false,
          is_archived: false,
          created_at: now,
          updated_at: now,
          context_data: JSON.stringify({
            orderType: 'ai',
            specialistName: specialistData.specialistName,
            specialistTitle: specialistData.specialistTitle
          })
        }
      );

      return this.enrichConversation(conversation);
    } catch (error) {
      console.error('Error creating AI order conversation:', error);
      throw error;
    }
  }

  // Создать или получить конверсацию для джоба
  static async getOrCreateJobConversation(
    jobId: string,
    clientId: string,
    freelancerId: string,
    jobData: {
      jobTitle: string;
      budget: { min: number; max: number; currency: string };
      skills: string[];
    }
  ): Promise<UnifiedConversation> {
    try {
      // Ищем существующую конверсацию
      const existingConversations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        [
          Query.equal('job_id', jobId),
          Query.equal('client_id', clientId),
          Query.equal('freelancer_id', freelancerId),
          Query.limit(1)
        ]
      );

      if (existingConversations.documents.length > 0) {
        return this.enrichConversation(existingConversations.documents[0]);
      }

      // Создаем новую конверсацию для джоба
      const now = new Date().toISOString();
      const conversation = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        ID.unique(),
        {
          participants: [clientId, freelancerId],
          job_id: jobId,
          client_id: clientId,
          freelancer_id: freelancerId,
          conversation_type: 'job',
          title: `Джоб: ${jobData.jobTitle}`,
          last_activity: now,
          unread_counts: JSON.stringify({ [clientId]: 0, [freelancerId]: 0 }),
          is_pinned: false,
          is_archived: false,
          created_at: now,
          updated_at: now,
          context_data: JSON.stringify({
            orderType: 'job',
            jobTitle: jobData.jobTitle,
            budget: jobData.budget,
            skills: jobData.skills
          })
        }
      );

      return this.enrichConversation(conversation);
    } catch (error) {
      console.error('Error creating job conversation:', error);
      throw error;
    }
  }

  // Создать или получить конверсацию для решения
  static async getOrCreateSolutionConversation(
    solutionId: string,
    buyerId: string,
    sellerId: string,
    solutionData: {
      solutionTitle: string;
      price: number;
      category: string;
    }
  ): Promise<UnifiedConversation> {
    try {
      // Ищем существующую конверсацию
      const existingConversations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        [
          Query.equal('solution_id', solutionId),
          Query.equal('buyer_id', buyerId),
          Query.equal('seller_id', sellerId),
          Query.limit(1)
        ]
      );

      if (existingConversations.documents.length > 0) {
        return this.enrichConversation(existingConversations.documents[0]);
      }

      // Создаем новую конверсацию для решения
      const now = new Date().toISOString();
      const conversation = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        ID.unique(),
        {
          participants: [buyerId, sellerId],
          solution_id: solutionId,
          buyer_id: buyerId,
          seller_id: sellerId,
          conversation_type: 'solution',
          title: `Решение: ${solutionData.solutionTitle}`,
          last_activity: now,
          unread_counts: JSON.stringify({ [buyerId]: 0, [sellerId]: 0 }),
          is_pinned: false,
          is_archived: false,
          created_at: now,
          updated_at: now,
          context_data: JSON.stringify({
            orderType: 'solution',
            solutionTitle: solutionData.solutionTitle,
            price: solutionData.price,
            category: solutionData.category
          })
        }
      );

      return this.enrichConversation(conversation);
    } catch (error) {
      console.error('Error creating solution conversation:', error);
      throw error;
    }
  }

  // Обогатить конверсацию дополнительными данными
  static async enrichConversation(conversation: any): Promise<UnifiedConversation> {
    try {
      // Получаем данные участников
      const participantDetails = await Promise.all(
        conversation.participants.map(async (userId: string) => {
          try {
            const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, userId);
            return {
              userId,
              name: user.name || 'Пользователь',
              avatar: user.avatar,
              role: this.determineUserRole(userId, conversation),
              isOnline: false // В реальной реализации проверяем онлайн статус
            };
          } catch (error) {
            return {
              userId,
              name: 'Неизвестный пользователь',
              role: 'client' as const,
              isOnline: false
            };
          }
        })
      );

      return {
        ...conversation,
        participantDetails,
        contextData: conversation.context_data ? JSON.parse(conversation.context_data) : undefined,
        unreadCounts: conversation.unread_counts ? JSON.parse(conversation.unread_counts) : {},
        lastActivity: conversation.last_activity || conversation.updated_at,
        isPinned: conversation.is_pinned || false,
        isArchived: conversation.is_archived || false,
        tags: conversation.tags ? JSON.parse(conversation.tags) : []
      };
    } catch (error) {
      console.error('Error enriching conversation:', error);
      return conversation as UnifiedConversation;
    }
  }

  // Определить роль пользователя в конверсации
  static determineUserRole(userId: string, conversation: any): 'client' | 'freelancer' | 'ai_specialist' {
    if (conversation.conversation_type === 'ai_order') {
      return conversation.client_id === userId ? 'client' : 'ai_specialist';
    }
    if (conversation.conversation_type === 'job') {
      return conversation.client_id === userId ? 'client' : 'freelancer';
    }
    if (conversation.conversation_type === 'solution') {
      return conversation.buyer_id === userId ? 'client' : 'freelancer';
    }
    return 'client'; // По умолчанию
  }

  // Получить все конверсации пользователя с фильтрацией
  static async getUserConversations(filter: ConversationFilter): Promise<UnifiedConversation[]> {
    try {
      const queries = [
        Query.contains('participants', filter.userId),
        Query.orderDesc('last_activity'),
        Query.limit(filter.limit || 50),
        Query.offset(filter.offset || 0)
      ];

      // Фильтрация по типу
      if (filter.type && filter.type !== 'all') {
        const typeMap = {
          'ai_orders': 'ai_order',
          'jobs': 'job',
          'solutions': 'solution',
          'projects': 'project',
          'direct': 'direct'
        };
        queries.push(Query.equal('conversation_type', typeMap[filter.type]));
      }

      // Фильтрация по статусу
      if (filter.status === 'archived') {
        queries.push(Query.equal('is_archived', true));
      } else if (filter.status === 'active') {
        queries.push(Query.equal('is_archived', false));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        queries
      );

      // Обогащаем каждую конверсацию
      const enrichedConversations = await Promise.all(
        response.documents.map(conv => this.enrichConversation(conv))
      );

      // Дополнительная фильтрация
      let filteredConversations = enrichedConversations;

      if (filter.unreadOnly) {
        filteredConversations = filteredConversations.filter(conv => 
          (conv.unreadCounts[filter.userId] || 0) > 0
        );
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredConversations = filteredConversations.filter(conv =>
          conv.title?.toLowerCase().includes(searchLower) ||
          conv.participantDetails.some(p => p.name.toLowerCase().includes(searchLower)) ||
          conv.contextData?.jobTitle?.toLowerCase().includes(searchLower) ||
          conv.contextData?.solutionTitle?.toLowerCase().includes(searchLower)
        );
      }

      return filteredConversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  // Отправить AI заказ в чат
  static async sendAIOrderToChat(
    conversationId: string,
    senderId: string,
    receiverId: string,
    aiOrderData: AIOrderAttachment,
    message?: string
  ): Promise<Message> {
    const messageResult = await MessagingService.sendAIOrderMessage({
      conversationId,
      senderId,
      receiverId,
      aiOrderData,
      message
    });

    // Отправляем уведомление
    await NotificationService.notifyAIOrderCreated(
      receiverId,
      aiOrderData.specialistName,
      aiOrderData.specialistId
    );

    return messageResult;
  }

  // Отправить джоб в чат
  static async sendJobToChat(
    conversationId: string,
    senderId: string,
    receiverId: string,
    jobCardData: JobCardAttachment,
    message?: string
  ): Promise<Message> {
    const messageResult = await MessagingService.sendJobCardMessage({
      conversationId,
      senderId,
      receiverId,
      jobCardData,
      message
    });

    // Отправляем уведомление
    await NotificationService.notifyNewJob(
      receiverId,
      jobCardData.jobTitle,
      `$${jobCardData.budget.min} - $${jobCardData.budget.max}`,
      jobCardData.jobId
    );

    return messageResult;
  }

  // Отправить решение в чат
  static async sendSolutionToChat(
    conversationId: string,
    senderId: string,
    receiverId: string,
    solutionCardData: SolutionCardAttachment,
    message?: string
  ): Promise<Message> {
    const messageResult = await MessagingService.sendSolutionCardMessage({
      conversationId,
      senderId,
      receiverId,
      solutionCardData,
      message
    });

    return messageResult;
  }

  // Отправить AI бриф в чат
  static async sendAIBriefToChat(
    conversationId: string,
    senderId: string,
    receiverId: string,
    aiBriefData: AIBriefData,
    message?: string
  ): Promise<Message> {
    const messageResult = await MessagingService.sendAIBriefMessage({
      conversationId,
      senderId,
      receiverId,
      aiBriefData,
      message
    });

    // Отправляем уведомление
    await NotificationService.notifyAIBriefReady(
      receiverId,
      aiBriefData.specialistName,
      'order_id' // В реальной реализации получить из контекста
    );

    return messageResult;
  }

  // Архивировать конверсацию
  static async archiveConversation(conversationId: string, userId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        conversationId,
        {
          is_archived: true,
          updated_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  }

  // Закрепить конверсацию
  static async pinConversation(conversationId: string, userId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        conversationId,
        {
          is_pinned: true,
          updated_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error pinning conversation:', error);
      throw error;
    }
  }

  // Добавить теги к конверсации
  static async addTagsToConversation(conversationId: string, tags: string[]): Promise<void> {
    try {
      const conversation = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        conversationId
      );

      const existingTags = conversation.tags ? JSON.parse(conversation.tags) : [];
      const updatedTags = [...new Set([...existingTags, ...tags])];

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        conversationId,
        {
          tags: JSON.stringify(updatedTags),
          updated_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error adding tags to conversation:', error);
      throw error;
    }
  }

  // Получить статистику конверсаций пользователя
  static async getUserConversationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    active: number;
    archived: number;
  }> {
    try {
      const conversations = await this.getUserConversations({
        userId,
        limit: 1000
      });

      const stats = {
        total: conversations.length,
        unread: conversations.filter(c => (c.unreadCounts[userId] || 0) > 0).length,
        byType: {} as Record<string, number>,
        active: conversations.filter(c => !c.isArchived).length,
        archived: conversations.filter(c => c.isArchived).length
      };

      // Группировка по типам
      conversations.forEach(conv => {
        const type = conv.conversationType || 'direct';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      throw error;
    }
  }
} 