// Супер продуманная система мессенджинга с Appwrite
import { Client, Databases, ID, Query } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
// TODO: Fix Realtime import issue
// const realtime = new Realtime(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export interface Message {
  $id: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  content: string;
  messageType: 'text' | 'file' | 'image' | 'video' | 'audio' | 'order' | 'system' | 'timeline' | 'milestone' | 'ai_order' | 'job_card' | 'solution_card' | 'ai_brief' | 'ai_response';
  attachments?: string[];
  orderData?: OrderAttachment;
  aiOrderData?: AIOrderAttachment;
  jobCardData?: JobCardAttachment;
  solutionCardData?: SolutionCardAttachment;
  aiBriefData?: AIBriefData;
  timelineData?: TimelineData;
  milestoneData?: MilestoneData;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  editedAt?: string;
  isDeleted: boolean;
  replyTo?: string; // ID сообщения на которое отвечаем
  reactions?: MessageReaction[];
  isForwarded?: boolean;
  forwardedFrom?: string;
  isEdited?: boolean;
  metadata?: MessageMetadata;
}

// Расширенные типы для AI специалистов
export interface AIOrderAttachment {
  specialistId: string;
  specialistName: string;
  specialistTitle: string;
  specialistAvatar: string;
  orderType: 'monthly' | 'task';
  orderTitle: string;
  orderDescription: string;
  brief: string;
  requirements?: string;
  deadline?: string;
  price: number;
  currency: string;
  status: 'draft' | 'brief_requested' | 'brief_provided' | 'approved' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  deliveryTime: string;
  attachments?: string[];
  aiProvider?: 'openai' | 'anthropic' | 'grok';
  generatedBrief?: string;
  revisionCount?: number;
  maxRevisions?: number;
}

// Карточка джоба в сообщениях
export interface JobCardAttachment {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  deadline: string;
  skills: string[];
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  applicationsCount: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  proposalId?: string; // Если это предложение на джоб
  proposalAmount?: number;
  proposalDeadline?: string;
  proposalMessage?: string;
}

// Карточка решения в сообщениях
export interface SolutionCardAttachment {
  solutionId: string;
  solutionTitle: string;
  solutionDescription: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  rating: number;
  salesCount: number;
  previewImages: string[];
  deliveryTime: string;
  features: string[];
  purchaseId?: string; // Если это покупка решения
  customization?: {
    requirements: string;
    additionalPrice: number;
    estimatedTime: string;
  };
}

// Данные для AI брифа
export interface AIBriefData {
  originalRequest: string;
  generatedBrief: {
    title: string;
    description: string;
    requirements: string[];
    deliverables: string[];
    timeline: string;
    budget?: number;
    technicalSpecs?: string[];
    examples?: string[];
  };
  specialistId: string;
  specialistName: string;
  aiProvider: 'openai' | 'anthropic' | 'grok';
  confidence: number; // 0-100
  estimatedTime: string;
  suggestedRevisions?: string[];
}

export interface OrderAttachment {
  orderId: string;
  orderTitle: string;
  orderDescription: string;
  budget: number;
  currency: string;
  deadline?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'in_progress' | 'completed';
  milestones?: OrderMilestone[];
  attachments?: string[];
  requirements?: string[];
  deliverables?: string[];
}

export interface OrderMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  deliverables?: string[];
}

export interface TimelineData {
  type: 'project_created' | 'proposal_sent' | 'contract_signed' | 'milestone_completed' | 'payment_sent' | 'review_left' | 'ai_order_created' | 'ai_brief_generated' | 'ai_work_started' | 'ai_work_completed';
  title: string;
  description: string;
  timestamp: string;
  relatedId: string;
  relatedType: string;
  metadata?: any;
}

export interface MilestoneData {
  milestoneId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  deliverables?: string[];
  submittedFiles?: string[];
  feedback?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

export interface MessageMetadata {
  isUrgent?: boolean;
  isPrivate?: boolean;
  expiresAt?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  mentions?: string[]; // User IDs
  aiGenerated?: boolean;
  needsApproval?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  confidenceScore?: number;
}

export interface Conversation {
  $id: string;
  participants: string[];
  projectId?: string;
  contractId?: string;
  title?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageBy?: string;
  unreadCount: Record<string, number>;
  isArchived: boolean;
  isPinned?: boolean;
  isGroup?: boolean;
  groupAdmin?: string;
  conversationType: 'direct' | 'project' | 'contract' | 'group' | 'support';
  metadata?: ConversationMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMetadata {
  theme?: string;
  customEmojis?: string[];
  autoDeleteAfter?: number; // hours
  isEncrypted?: boolean;
  allowedFileTypes?: string[];
  maxFileSize?: number; // MB
}

export interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface MessageStatus {
  messageId: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

class MessagingService {
  private realtimeSubscriptions: Map<string, () => void> = new Map();

  // 💬 Создание нового сообщения
  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    messageType?: Message['messageType'];
    attachments?: string[];
    orderData?: OrderAttachment;
    aiOrderData?: AIOrderAttachment;
    jobCardData?: JobCardAttachment;
    solutionCardData?: SolutionCardAttachment;
    aiBriefData?: AIBriefData;
    timelineData?: TimelineData;
    milestoneData?: MilestoneData;
    replyTo?: string;
    metadata?: MessageMetadata;
  }): Promise<Message> {
    try {
      console.log('📤 Sending message:', data);
      console.log('📊 Database config:', { DATABASE_ID, endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT });

      // Validate required data
      if (!data.conversationId || !data.senderId || !data.receiverId || !data.content) {
        throw new Error('Missing required message data');
      }

      const messageData = {
        senderId: data.senderId,
        receiverId: data.receiverId,
        conversationId: data.conversationId,
        content: data.content,
        messageType: data.messageType || 'text',
        attachments: data.attachments || [],
        orderData: data.orderData ? JSON.stringify(data.orderData) : undefined,
        aiOrderData: data.aiOrderData ? JSON.stringify(data.aiOrderData) : undefined,
        jobCardData: data.jobCardData ? JSON.stringify(data.jobCardData) : undefined,
        solutionCardData: data.solutionCardData ? JSON.stringify(data.solutionCardData) : undefined,
        aiBriefData: data.aiBriefData ? JSON.stringify(data.aiBriefData) : undefined,
        timelineData: data.timelineData ? JSON.stringify(data.timelineData) : undefined,
        milestoneData: data.milestoneData ? JSON.stringify(data.milestoneData) : undefined,
        isRead: false,
        createdAt: new Date().toISOString(),
        isDeleted: false,
        replyTo: data.replyTo,
        reactions: JSON.stringify([]),
        isForwarded: false,
        isEdited: false,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined
      };

      console.log('📝 Message data prepared:', messageData);

      console.log('🗄️ Creating document in database...');
      const message = await databases.createDocument(
        DATABASE_ID,
        'messages',
        ID.unique(),
        messageData
      );

      console.log('✅ Document created:', message);

      // Обновляем последнее сообщение в конверсации
      console.log('🔄 Updating conversation last message...');
      await this.updateConversationLastMessage(data.conversationId, message);

      // Увеличиваем счетчик непрочитанных для получателя
      console.log('📊 Incrementing unread count...');
      await this.incrementUnreadCount(data.conversationId, data.receiverId);

      console.log('🎉 Message sent successfully:', message);
      return this.parseMessage(message);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', {
        name: (error as Error)?.name,
        message: (error as Error)?.message,
        code: (error as { code?: string })?.code,
        type: (error as { type?: string })?.type
      });
      throw error;
    }
  }

  // 📋 Отправка заказа как сообщение
  async sendOrderMessage(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    orderData: OrderAttachment;
    message?: string;
  }): Promise<Message> {
    const content = data.message || `📋 Новый заказ: ${data.orderData.orderTitle}`;
    
    return this.sendMessage({
      ...data,
      content,
      messageType: 'order',
      orderData: data.orderData
    });
  }

  // ⏱️ Отправка обновления таймлайна
  async sendTimelineUpdate(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    timelineData: TimelineData;
  }): Promise<Message> {
    const content = `⏱️ ${data.timelineData.title}`;
    
    return this.sendMessage({
      ...data,
      content,
      messageType: 'timeline',
      timelineData: data.timelineData
    });
  }

  // 🎯 Отправка обновления milestone
  async sendMilestoneUpdate(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    milestoneData: MilestoneData;
  }): Promise<Message> {
    const content = `🎯 Milestone: ${data.milestoneData.title}`;
    
    return this.sendMessage({
      ...data,
      content,
      messageType: 'milestone',
      milestoneData: data.milestoneData
    });
  }

  // 🤖 Отправка AI заказа
  async sendAIOrderMessage(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    aiOrderData: AIOrderAttachment;
    message?: string;
  }): Promise<Message> {
    const content = data.message || `🤖 AI заказ: ${data.aiOrderData.orderTitle}`;
    
    return this.sendMessage({
      ...data,
      content,
      messageType: 'ai_order',
      aiOrderData: data.aiOrderData
    });
  }

  // 💼 Отправка карточки джоба
  async sendJobCardMessage(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    jobCardData: JobCardAttachment;
    message?: string;
  }): Promise<Message> {
    const content = data.message || `💼 Джоб: ${data.jobCardData.jobTitle}`;
    
    return this.sendMessage({
      ...data,
      content,
      messageType: 'job_card',
      jobCardData: data.jobCardData
    });
  }

  // 💡 Отправка карточки решения
  async sendSolutionCardMessage(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    solutionCardData: SolutionCardAttachment;
    message?: string;
  }): Promise<Message> {
    const content = data.message || `💡 Решение: ${data.solutionCardData.solutionTitle}`;
    
    return this.sendMessage({
      ...data,
      content,
      messageType: 'solution_card',
      solutionCardData: data.solutionCardData
    });
  }

  // 📝 Отправка AI брифа
  async sendAIBriefMessage(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    aiBriefData: AIBriefData;
    message?: string;
  }): Promise<Message> {
    const content = data.message || `📝 Техническое задание от ${data.aiBriefData.specialistName}`;
    
    return this.sendMessage({
      ...data,
      content,
      messageType: 'ai_brief',
      aiBriefData: data.aiBriefData,
      metadata: {
        aiGenerated: true,
        needsApproval: true,
        confidenceScore: data.aiBriefData.confidence
      }
    });
  }

  // 📱 Получение сообщений конверсации
  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'messages',
        [
          Query.equal('conversationId', conversationId),
          Query.equal('isDeleted', false),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      return response.documents.map(doc => this.parseMessage(doc)).reverse();
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  // 💬 Создание новой конверсации
  async createConversation(data: {
    participants: string[];
    projectId?: string;
    contractId?: string;
    title?: string;
    conversationType?: Conversation['conversationType'];
    metadata?: ConversationMetadata;
  }): Promise<Conversation> {
    try {
      const conversationData = {
        participants: data.participants,
        projectId: data.projectId,
        contractId: data.contractId,
        title: data.title,
        unreadCount: JSON.stringify({}),
        isArchived: false,
        isPinned: false,
        isGroup: data.participants.length > 2,
        conversationType: data.conversationType || 'direct',
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const conversation = await databases.createDocument(
        DATABASE_ID,
        'conversations',
        ID.unique(),
        conversationData
      );

      return this.parseConversation(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // 📋 Получение конверсаций пользователя
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'conversations',
        [
          Query.search('participants', userId),
          Query.orderDesc('updatedAt'),
          Query.limit(100)
        ]
      );

      return response.documents.map(doc => this.parseConversation(doc));
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  // ✅ Отметка сообщения как прочитанного
  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        'messages',
        messageId,
        {
          isRead: true,
          readAt: new Date().toISOString()
        }
      );

      // Получаем сообщение для обновления счетчика
      const message = await databases.getDocument(DATABASE_ID, 'messages', messageId);
      await this.decrementUnreadCount(message.conversationId, userId);
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // 🔄 Подписка на real-time обновления
  subscribeToConversation(
    conversationId: string,
    _callbacks: {
      onMessage?: (message: Message) => void;
      onMessageUpdate?: (message: Message) => void;
      onMessageDelete?: (messageId: string) => void;
      onTyping?: (typing: TypingIndicator) => void;
    }
  ): () => void {
    // TODO: Fix Realtime import and re-enable
    console.log('Real-time subscriptions temporarily disabled for:', conversationId);

    // Return empty unsubscribe function
    const unsubscribe = () => {};
    this.realtimeSubscriptions.set(conversationId, unsubscribe);
    return unsubscribe;
  }

  // ⌨️ Индикатор печати
  async sendTypingIndicator(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    // Используем Appwrite Functions или WebSocket для real-time typing
    // Временно логируем
    console.log('Typing indicator:', { conversationId, userId, isTyping });
  }

  // 😀 Добавление реакции
  async addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    try {
      const message = await databases.getDocument(DATABASE_ID, 'messages', messageId);
      const reactions: MessageReaction[] = message.reactions ? JSON.parse(message.reactions) : [];
      
      // Удаляем предыдущую реакцию пользователя
      const filteredReactions = reactions.filter(r => r.userId !== userId);
      
      // Добавляем новую реакцию
      filteredReactions.push({
        emoji,
        userId,
        timestamp: new Date().toISOString()
      });

      await databases.updateDocument(
        DATABASE_ID,
        'messages',
        messageId,
        {
          reactions: JSON.stringify(filteredReactions)
        }
      );
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  // 📝 Редактирование сообщения
  async editMessage(messageId: string, newContent: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        'messages',
        messageId,
        {
          content: newContent,
          isEdited: true,
          editedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }

  // 🗑️ Удаление сообщения
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        'messages',
        messageId,
        {
          isDeleted: true,
          content: 'Сообщение удалено'
        }
      );
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // 🔄 Пересылка сообщения
  async forwardMessage(
    messageId: string,
    toConversationId: string,
    senderId: string,
    receiverId: string
  ): Promise<Message> {
    try {
      const originalMessage = await databases.getDocument(DATABASE_ID, 'messages', messageId);
      
      return this.sendMessage({
        conversationId: toConversationId,
        senderId,
        receiverId,
        content: originalMessage.content,
        messageType: originalMessage.messageType,
        attachments: originalMessage.attachments,
        metadata: {
          ...originalMessage.metadata ? JSON.parse(originalMessage.metadata) : {},
          isForwarded: true,
          forwardedFrom: originalMessage.senderId
        }
      });
    } catch (error) {
      console.error('Error forwarding message:', error);
      throw error;
    }
  }

  // 🔍 Поиск сообщений
  async searchMessages(query: string, conversationId?: string): Promise<Message[]> {
    try {
      const queries = [
        Query.search('content', query),
        Query.equal('isDeleted', false),
        Query.orderDesc('createdAt'),
        Query.limit(50)
      ];

      if (conversationId) {
        queries.push(Query.equal('conversationId', conversationId));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        'messages',
        queries
      );

      return response.documents.map(doc => this.parseMessage(doc));
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  // 🔧 Вспомогательные методы
  private parseMessage(doc: { [key: string]: unknown }): Message {
    return {
      ...doc,
      orderData: doc.orderData ? JSON.parse(doc.orderData as string) : undefined,
      timelineData: doc.timelineData ? JSON.parse(doc.timelineData as string) : undefined,
      milestoneData: doc.milestoneData ? JSON.parse(doc.milestoneData as string) : undefined,
      reactions: doc.reactions ? JSON.parse(doc.reactions as string) : [],
      metadata: doc.metadata ? JSON.parse(doc.metadata as string) : undefined
    } as Message;
  }

  private parseConversation(doc: { [key: string]: unknown }): Conversation {
    return {
      ...doc,
      unreadCount: doc.unreadCount ? JSON.parse(doc.unreadCount as string) : {},
      metadata: doc.metadata ? JSON.parse(doc.metadata as string) : undefined
    } as Conversation;
  }

  private async updateConversationLastMessage(conversationId: string, message: { [key: string]: unknown }): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      'conversations',
      conversationId,
      {
        lastMessage: (message.content as string)?.substring(0, 100) || '',
        lastMessageAt: message.createdAt as string,
        lastMessageBy: message.senderId as string,
        updatedAt: new Date().toISOString()
      }
    );
  }

  private async incrementUnreadCount(conversationId: string, userId: string): Promise<void> {
    try {
      const conversation = await databases.getDocument(DATABASE_ID, 'conversations', conversationId);
      const unreadCount = conversation.unreadCount ? JSON.parse(conversation.unreadCount) : {};
      unreadCount[userId] = (unreadCount[userId] || 0) + 1;

      await databases.updateDocument(
        DATABASE_ID,
        'conversations',
        conversationId,
        { unreadCount: JSON.stringify(unreadCount) }
      );
    } catch (error) {
      console.error('Error incrementing unread count:', error);
    }
  }

  private async decrementUnreadCount(conversationId: string, userId: string): Promise<void> {
    try {
      const conversation = await databases.getDocument(DATABASE_ID, 'conversations', conversationId);
      const unreadCount = conversation.unreadCount ? JSON.parse(conversation.unreadCount) : {};
      unreadCount[userId] = Math.max(0, (unreadCount[userId] || 0) - 1);

      await databases.updateDocument(
        DATABASE_ID,
        'conversations',
        conversationId,
        { unreadCount: JSON.stringify(unreadCount) }
      );
    } catch (error) {
      console.error('Error decrementing unread count:', error);
    }
  }

  // 🧹 Очистка подписок
  cleanup(): void {
    this.realtimeSubscriptions.forEach(unsubscribe => unsubscribe());
    this.realtimeSubscriptions.clear();
  }
}

export const messagingService = new MessagingService();
