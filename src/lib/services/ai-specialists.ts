import { databases, DATABASE_ID, ID, Query, COLLECTIONS } from '../appwrite/database';
import { AISpecialist, AISpecialistOrder, AISpecialistMessage, AITaskTimeline, AISpecialistSubscription } from '@/types';
import { chatCompletion, OpenAIMessage } from './openai';

export class AISpecialistsService {
  
  // Create a new order for an AI specialist
  static async createOrder(orderData: {
    specialistId: string;
    clientId: string;
    orderType: 'monthly' | 'task';
    taskBrief: string;
    requirements: string[];
    attachments: string[];
    deadline: string;
    amount: number;
  }): Promise<AISpecialistOrder> {
    try {
      const platformFee = orderData.amount * 0.1; // 10% platform fee
      
      const order = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.AI_ORDERS,
        ID.unique(),
        {
          ...orderData,
          status: 'pending',
          status_payment: 'pending',
          platformFee,
          messages: [],
          deliverables: [],
          deliveryNotes: '',
          timeline: [
            {
              id: ID.unique(),
              stage: 'brief_received',
              title: 'Brief Received',
              description: 'Your project brief has been received and is being reviewed.',
              timestamp: new Date().toISOString(),
            }
          ]
        }
      );

      // Send initial AI message
      await this.sendAIMessage(order.$id, {
        message: `Hello! I've received your project brief for "${orderData.taskBrief}". I'm reviewing the requirements and will get back to you shortly with questions or to confirm I can start work immediately.`,
        messageType: 'briefing'
      });

              return order as unknown as AISpecialistOrder;
    } catch (error: any) {
      console.error('Error creating AI specialist order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  // Get orders for a client
  static async getClientOrders(clientId: string): Promise<AISpecialistOrder[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.AI_ORDERS,
        [
          Query.equal('clientId', clientId),
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]
      );

      return response.documents as unknown as AISpecialistOrder[];
    } catch (error: any) {
      console.error('Error fetching client orders:', error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
  }

  // Get specific order
  static async getOrder(orderId: string): Promise<AISpecialistOrder> {
    try {
      const order = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.AI_ORDERS,
        orderId
      );

      return order as unknown as AISpecialistOrder;
    } catch (error: any) {
      console.error('Error fetching order:', error);
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string, 
    status: AISpecialistOrder['status'],
    timelineUpdate?: {
      stage: AITaskTimeline['stage'];
      title: string;
      description: string;
      data?: any;
    }
  ): Promise<void> {
    try {
      const updateData: any = { status };

      if (timelineUpdate) {
        // Get current order to update timeline
        const currentOrder = await this.getOrder(orderId);
        const newTimelineEntry: AITaskTimeline = {
          id: ID.unique(),
          stage: timelineUpdate.stage,
          title: timelineUpdate.title,
          description: timelineUpdate.description,
          timestamp: new Date().toISOString(),
          data: timelineUpdate.data
        };
        
        updateData.timeline = [...(currentOrder.timeline || []), newTimelineEntry];
      }

      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.AI_ORDERS,
        orderId,
        updateData
      );
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  // Send AI message
  static async sendAIMessage(
    orderId: string,
    messageData: {
      message: string;
      messageType: AISpecialistMessage['messageType'];
      attachments?: string[];
    }
  ): Promise<void> {
    try {
      const newMessage: AISpecialistMessage = {
        id: ID.unique(),
        senderId: 'ai',
        senderType: 'ai',
        message: messageData.message,
        messageType: messageData.messageType,
        attachments: messageData.attachments || [],
        timestamp: new Date().toISOString(),
        read: false
      };

      // Get current order and update messages
      const currentOrder = await this.getOrder(orderId);
      const updatedMessages = [...(currentOrder.messages || []), newMessage];

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.AI_ORDERS,
        orderId,
        { messages: updatedMessages }
      );

      // TODO: Send real-time notification to client
      
    } catch (error: any) {
      console.error('Error sending AI message:', error);
      throw new Error(`Failed to send AI message: ${error.message}`);
    }
  }

  // Send client message
  static async sendClientMessage(
    orderId: string,
    clientId: string,
    messageData: {
      message: string;
      messageType: AISpecialistMessage['messageType'];
      attachments?: string[];
    }
  ): Promise<void> {
    try {
      const newMessage: AISpecialistMessage = {
        id: ID.unique(),
        senderId: clientId,
        senderType: 'client',
        message: messageData.message,
        messageType: messageData.messageType,
        attachments: messageData.attachments || [],
        timestamp: new Date().toISOString(),
        read: false
      };

      // Get current order and update messages
      const currentOrder = await this.getOrder(orderId);
      const updatedMessages = [...(currentOrder.messages || []), newMessage];

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.AI_ORDERS,
        orderId,
        { messages: updatedMessages }
      );

      // Trigger AI response based on message content
      await this.processClientMessage(orderId, messageData.message, messageData.messageType);
      
    } catch (error: any) {
      console.error('Error sending client message:', error);
      throw new Error(`Failed to send client message: ${error.message}`);
    }
  }

  // Process client message and generate AI response
  private static async processClientMessage(
    orderId: string,
    message: string,
    messageType: AISpecialistMessage['messageType']
  ): Promise<void> {
    try {
      // Get order details
      const order = await this.getOrder(orderId);
      let aiResponse = '';
      let shouldUpdateStatus = false;
      let newStatus: AISpecialistOrder['status'] | null = null;

      // --- Уникальный контекст для каждого спеца ---
      const specialistId = order.specialistId;
      let systemPrompt = '';
      switch (specialistId) {
        case 'alex-ai':
          systemPrompt = 'Ты — профессиональный AI-специалист по созданию фото-аватаров и портретов для бизнеса, соцсетей и брендинга. Отвечай как эксперт по AI-аватарам, помогай с выбором стиля, техническими деталями, советуй лучшие практики.';
          break;
        case 'viktor-reels':
          systemPrompt = 'Ты — AI-специалист по созданию вирусных видео для соцсетей (TikTok, Instagram Reels, YouTube Shorts). Отвечай как эксперт по видеомаркетингу, монтажу, трендам и вовлечению аудитории.';
          break;
        case 'luna-design':
          systemPrompt = 'Ты — AI-дизайнер сайтов, логотипов и фирменного стиля. Отвечай как эксперт по веб-дизайну, UX/UI, брендингу и визуальной айдентике.';
          break;
        case 'max-bot':
          systemPrompt = 'Ты — AI-разработчик Telegram-ботов и автоматизации. Отвечай как эксперт по созданию чат-ботов, интеграциям, автоматизации бизнес-процессов.';
          break;
        default:
          systemPrompt = 'Ты — AI-специалист, помогающий пользователям с их задачами.';
      }
      // --- END контекст ---

      // Если обычный текст — генерируем ответ через OpenAI
      if (messageType === 'text') {
        const openaiApiKey = process.env.OPENAI_API_KEY;
        const messages: OpenAIMessage[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ];
        try {
          aiResponse = await chatCompletion({
            apiKey: openaiApiKey,
            messages
          });
        } catch (err) {
          aiResponse = 'Извините, произошла ошибка при генерации AI-ответа.';
        }
        shouldUpdateStatus = order.status === 'pending';
        newStatus = shouldUpdateStatus ? 'in_progress' : null;
      } else {
        // Старое поведение для других типов сообщений
        switch (messageType) {
          case 'approval':
            if (message.toLowerCase().includes('approve') || message.toLowerCase().includes('accept')) {
              aiResponse = `Excellent! I'm glad you're happy with the result. The project is now complete and the final deliverables are ready for download.`;
              shouldUpdateStatus = true;
              newStatus = 'completed';
            }
            break;
          case 'briefing':
            aiResponse = `Thank you for the detailed brief! I have everything I need to get started. I'll begin work immediately and keep you updated on progress.`;
            shouldUpdateStatus = true;
            newStatus = 'in_progress';
            break;
        }
      }

      // Send AI response
      if (aiResponse) {
        await this.sendAIMessage(orderId, {
          message: aiResponse,
          messageType: 'text'
        });
      }

      // Update status if needed
      if (shouldUpdateStatus && newStatus) {
        await this.updateOrderStatus(orderId, newStatus, {
          stage: newStatus === 'completed' ? 'work_completed' : 'work_started',
          title: newStatus === 'completed' ? 'Work Completed' : 'Work Started',
          description: newStatus === 'completed' 
            ? 'The project has been completed and delivered.'
            : 'Work has begun on your project.'
        });
      }

    } catch (error: any) {
      console.error('Error processing client message:', error);
      // Send a generic AI response if processing fails
      await this.sendAIMessage(orderId, {
        message: `I received your message and I'm processing it. I'll get back to you with a detailed response shortly!`,
        messageType: 'text'
      });
    }
  }

  // Simulate AI work progress
  static async simulateWorkProgress(orderId: string): Promise<void> {
    try {
      const order = await this.getOrder(orderId);
      
      if (order.status !== 'in_progress') return;

      // Simulate work progression with timeline updates
      const progressUpdates = [
        {
          stage: 'progress_update' as const,
          title: 'Initial Concepts Ready',
          description: '🎨 I\'ve created the initial concepts based on your requirements. Review and let me know your thoughts!',
          delay: 2000 // 2 seconds
        },
        {
          stage: 'progress_update' as const,
          title: 'Refining Design',
          description: '✨ Making refinements and optimizing the details. Almost ready for your review!',
          delay: 5000 // 5 seconds
        },
        {
          stage: 'work_completed' as const,
          title: 'Work Completed',
          description: '🎉 Your project is complete! Please review the final deliverables and let me know if you need any adjustments.',
          delay: 8000 // 8 seconds
        }
      ];

      // Schedule progress updates
      for (const update of progressUpdates) {
        setTimeout(async () => {
          await this.sendAIMessage(orderId, {
            message: update.description,
            messageType: 'progress'
          });

          if (update.stage === 'work_completed') {
            await this.updateOrderStatus(orderId, 'review', {
              stage: update.stage,
              title: update.title,
              description: 'Project completed and ready for client review.'
            });
          } else {
            await this.updateOrderStatus(orderId, 'in_progress', {
              stage: update.stage,
              title: update.title,
              description: update.description
            });
          }
        }, update.delay);
      }

    } catch (error: any) {
      console.error('Error simulating work progress:', error);
    }
  }

  // Create subscription
  static async createSubscription(subscriptionData: {
    clientId: string;
    specialistId: string;
    amount: number;
  }): Promise<AISpecialistSubscription> {
    try {
      const subscription = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.AI_SUBSCRIPTIONS,
        ID.unique(),
        {
          ...subscriptionData,
          subscriptionType: 'monthly',
          status: 'active',
          tasksUsed: 0,
          tasksLimit: 999, // Unlimited for monthly subscription
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          autoRenew: true
        }
      );

      return subscription as unknown as AISpecialistSubscription;
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  // Get client subscriptions
  static async getClientSubscriptions(clientId: string): Promise<AISpecialistSubscription[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.AI_SUBSCRIPTIONS,
        [
          Query.equal('clientId', clientId),
          Query.orderDesc('$createdAt')
        ]
      );

      return response.documents as unknown as AISpecialistSubscription[];
    } catch (error: any) {
      console.error('Error fetching client subscriptions:', error);
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }
  }

  // Rate completed order
  static async rateOrder(
    orderId: string,
    clientRating: number,
    clientReview?: string
  ): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.AI_ORDERS,
        orderId,
        {
          clientRating,
          clientReview: clientReview || ''
        }
      );

      // Send thank you AI message
      await this.sendAIMessage(orderId, {
        message: `Thank you for the ${clientRating}-star rating! ${clientReview ? 'I appreciate your feedback: "' + clientReview + '"' : ''} It was a pleasure working with you! 🌟`,
        messageType: 'text'
      });

    } catch (error: any) {
      console.error('Error rating order:', error);
      throw new Error(`Failed to rate order: ${error.message}`);
    }
  }
} 