import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'order' | 'job' | 'solution' | 'ai_brief' | 'payment' | 'system';
  actionUrl?: string;
  actionText?: string;
  metadata?: any;
  channels: ('push' | 'email' | 'sms')[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduleAt?: string; // ISO string for scheduled notifications
  expiresAt?: string; // ISO string for notification expiry
}

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export interface EmailNotificationData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export class NotificationService {
  // Создать уведомление
  static async createNotification(data: NotificationData): Promise<string> {
    try {
      const notification = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        ID.unique(),
        {
          user_id: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          action_url: data.actionUrl,
          action_text: data.actionText,
          metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
          channels: JSON.stringify(data.channels),
          priority: data.priority,
          schedule_at: data.scheduleAt,
          expires_at: data.expiresAt,
          status: 'pending',
          created_at: new Date().toISOString(),
          sent_at: null,
          read_at: null,
          clicked_at: null,
          delivery_status: JSON.stringify({
            push: { status: 'pending', attempts: 0 },
            email: { status: 'pending', attempts: 0 },
            sms: { status: 'pending', attempts: 0 }
          })
        }
      );

      // Немедленно отправить если не запланировано
      if (!data.scheduleAt) {
        await this.sendNotification(notification.$id);
      }

      return notification.$id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Отправить уведомление
  static async sendNotification(notificationId: string): Promise<void> {
    try {
      const notification = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notificationId
      );

      const channels = JSON.parse(notification.channels) as ('push' | 'email' | 'sms')[];
      const deliveryStatus = JSON.parse(notification.delivery_status);

      // Отправляем по каждому каналу
      for (const channel of channels) {
        try {
          switch (channel) {
            case 'push':
              await this.sendPushNotification(notification);
              deliveryStatus.push = { status: 'sent', sentAt: new Date().toISOString() };
              break;
            case 'email':
              await this.sendEmailNotification(notification);
              deliveryStatus.email = { status: 'sent', sentAt: new Date().toISOString() };
              break;
            case 'sms':
              await this.sendSMSNotification(notification);
              deliveryStatus.sms = { status: 'sent', sentAt: new Date().toISOString() };
              break;
          }
        } catch (channelError) {
          console.error(`Error sending ${channel} notification:`, channelError);
          deliveryStatus[channel] = { 
            status: 'failed', 
            error: (channelError as any)?.message,
            failedAt: new Date().toISOString()
          };
        }
      }

      // Обновляем статус уведомления
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notificationId,
        {
          status: 'sent',
          sent_at: new Date().toISOString(),
          delivery_status: JSON.stringify(deliveryStatus)
        }
      );

    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Push уведомление через Web Push API
  static async sendPushNotification(notification: any): Promise<void> {
    // В реальной реализации здесь будет интеграция с Web Push API
    // Или сторонним сервисом типа Firebase Cloud Messaging
    
    const pushData: PushNotificationData = {
      title: notification.title,
      body: notification.message,
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      data: {
        notificationId: notification.$id,
        actionUrl: notification.action_url,
        type: notification.type
      },
      tag: `notification-${notification.$id}`,
      requireInteraction: notification.priority === 'high' || notification.priority === 'urgent',
      vibrate: notification.priority === 'urgent' ? [200, 100, 200] : [100]
    };

    if (notification.action_url && notification.action_text) {
      pushData.actions = [{
        action: 'open',
        title: notification.action_text,
        icon: '/icons/open-icon.png'
      }];
    }

    // Здесь должен быть код для отправки через Push API
    console.log('📱 Push notification would be sent:', pushData);
    
    // Симуляция отправки
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Email уведомление
  static async sendEmailNotification(notification: any): Promise<void> {
    try {
      // Получаем данные пользователя
      const user = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        notification.user_id
      );

      const emailData: EmailNotificationData = {
        to: user.email,
        subject: notification.title,
        textContent: notification.message,
        htmlContent: this.generateEmailHTML(notification)
      };

      // В реальной реализации здесь будет интеграция с Appwrite Functions
      // или внешним email провайдером (SendGrid, AWS SES, etc.)
      
      console.log('📧 Email notification would be sent:', emailData);
      
      // Симуляция отправки
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  // SMS уведомление  
  static async sendSMSNotification(notification: any): Promise<void> {
    try {
      // Получаем данные пользователя
      const user = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        notification.user_id
      );

      if (!user.phone) {
        throw new Error('User phone number not found');
      }

      const smsData = {
        to: user.phone,
        message: `${notification.title}\n${notification.message}`,
        from: 'AI-Platform'
      };

      // В реальной реализации здесь будет интеграция с SMS провайдером
      console.log('📱 SMS notification would be sent:', smsData);
      
      // Симуляция отправки
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      throw error;
    }
  }

  // Генерация HTML для email
  static generateEmailHTML(notification: any): string {
    const actionButton = notification.action_url ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${notification.action_url}" 
           style="background: linear-gradient(45deg, #6366f1, #8b5cf6); 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  display: inline-block;
                  font-weight: bold;">
          ${notification.action_text || 'Открыть'}
        </a>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                   background-color: #f3f4f6; 
                   margin: 0; 
                   padding: 20px;">
        <div style="max-width: 600px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 12px; 
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(45deg, #1f2937, #374151); 
                      color: white; 
                      padding: 24px; 
                      text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${notification.title}</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 24px;">
            <p style="color: #374151; 
                      font-size: 16px; 
                      line-height: 1.6; 
                      margin: 0 0 20px 0;">
              ${notification.message}
            </p>
            
            ${actionButton}
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; 
                      padding: 20px; 
                      text-align: center; 
                      border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; 
                      font-size: 14px; 
                      margin: 0;">
              AI Freelance Platform | 
              <a href="#" style="color: #6366f1; text-decoration: none;">Настройки уведомлений</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Получить уведомления пользователя
  static async getUserNotifications(
    userId: string, 
    limit = 20, 
    offset = 0,
    unreadOnly = false
  ): Promise<any[]> {
    try {
      const queries = [
        `user_id = "${userId}"`,
        `ORDER BY created_at DESC`,
        `LIMIT ${limit}`,
        `OFFSET ${offset}`
      ];

      if (unreadOnly) {
        queries.push('read_at = null');
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        queries
      );

      return response.documents;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Отметить уведомление как прочитанное
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notificationId,
        {
          read_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Отметить уведомление как кликнутое
  static async markAsClicked(notificationId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notificationId,
        {
          clicked_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error marking notification as clicked:', error);
      throw error;
    }
  }

  // Удалить уведомление
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notificationId
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Методы для быстрого создания типичных уведомлений

  // Уведомление о новом сообщении
  static async notifyNewMessage(userId: string, senderName: string, messagePreview: string, conversationId: string): Promise<string> {
    return this.createNotification({
      userId,
      title: `Новое сообщение от ${senderName}`,
      message: messagePreview,
      type: 'message',
      actionUrl: `/messages?conversation=${conversationId}`,
      actionText: 'Открыть чат',
      channels: ['push', 'email'],
      priority: 'normal'
    });
  }

  // Уведомление о новом AI заказе
  static async notifyAIOrderCreated(userId: string, specialistName: string, orderId: string): Promise<string> {
    return this.createNotification({
      userId,
      title: `🤖 Новый AI заказ`,
      message: `Ваш заказ для ${specialistName} создан и передан в работу`,
      type: 'order',
      actionUrl: `/ai-specialists/orders/${orderId}`,
      actionText: 'Посмотреть заказ',
      channels: ['push', 'email'],
      priority: 'high'
    });
  }

  // Уведомление о готовом AI брифе
  static async notifyAIBriefReady(userId: string, specialistName: string, orderId: string): Promise<string> {
    return this.createNotification({
      userId,
      title: `📝 Техническое задание готово`,
      message: `${specialistName} подготовил техническое задание для вашего проекта`,
      type: 'ai_brief',
      actionUrl: `/ai-specialists/orders/${orderId}`,
      actionText: 'Посмотреть ТЗ',
      channels: ['push', 'email'],
      priority: 'high'
    });
  }

  // Уведомление о новом джобе
  static async notifyNewJob(userId: string, jobTitle: string, budget: string, jobId: string): Promise<string> {
    return this.createNotification({
      userId,
      title: `💼 Новый джоб в вашей сфере`,
      message: `${jobTitle} | Бюджет: ${budget}`,
      type: 'job',
      actionUrl: `/jobs/${jobId}`,
      actionText: 'Посмотреть джоб',
      channels: ['push'],
      priority: 'normal'
    });
  }

  // Уведомление о платеже
  static async notifyPaymentReceived(userId: string, amount: string, orderId: string): Promise<string> {
    return this.createNotification({
      userId,
      title: `💰 Платеж получен`,
      message: `Вы получили платеж ${amount}`,
      type: 'payment',
      actionUrl: `/payments/${orderId}`,
      actionText: 'Подробности',
      channels: ['push', 'email'],
      priority: 'high'
    });
  }
} 