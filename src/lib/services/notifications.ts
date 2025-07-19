import { databases, DATABASE_ID, COLLECTIONS, ID, Query, client } from '@/lib/appwrite';

export interface Notification {
  $id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'project' | 'message' | 'payment' | 'review' | 'system' | 'milestone';
  related_id?: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  metadata?: string;
  created_at: string;
}

export class NotificationService {
  // Create notification
  static async createNotification(notificationData: Omit<Notification, '$id' | 'created_at' | 'is_read'>): Promise<Notification> {
    const now = new Date().toISOString();
    
    const notification = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      ID.unique(),
      {
        ...notificationData,
        is_read: false,
        created_at: now,
      }
    );

    return notification as Notification;
  }

  // Get user notifications
  static async getUserNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<Notification[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      [
        Query.equal('user_id', userId),
        Query.orderDesc('created_at'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return response.documents as Notification[];
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      notificationId,
      {
        is_read: true,
        read_at: new Date().toISOString(),
      }
    );

    return notification as Notification;
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string): Promise<void> {
    const unreadNotifications = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      [
        Query.equal('user_id', userId),
        Query.equal('is_read', false),
      ]
    );

    const now = new Date().toISOString();

    for (const notification of unreadNotifications.documents) {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notification.$id,
        {
          is_read: true,
          read_at: now,
        }
      );
    }
  }

  // Get unread count
  static async getUnreadCount(userId: string): Promise<number> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      [
        Query.equal('user_id', userId),
        Query.equal('is_read', false),
      ]
    );

    return response.total;
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      notificationId
    );
  }

  // Notification templates
  static async notifyNewProposal(clientId: string, projectTitle: string, freelancerName: string, projectId: string): Promise<void> {
    await this.createNotification({
      user_id: clientId,
      title: 'New Proposal Received',
      message: `${freelancerName} submitted a proposal for "${projectTitle}"`,
      type: 'project',
      related_id: projectId,
      action_url: `/en/projects/${projectId}/proposals`,
    });
  }

  static async notifyProposalAccepted(freelancerId: string, projectTitle: string, projectId: string): Promise<void> {
    await this.createNotification({
      user_id: freelancerId,
      title: 'Proposal Accepted!',
      message: `Your proposal for "${projectTitle}" has been accepted`,
      type: 'project',
      related_id: projectId,
      action_url: `/en/projects/${projectId}`,
    });
  }

  static async notifyProposalRejected(freelancerId: string, projectTitle: string, projectId: string): Promise<void> {
    await this.createNotification({
      user_id: freelancerId,
      title: 'Proposal Update',
      message: `Your proposal for "${projectTitle}" was not selected`,
      type: 'project',
      related_id: projectId,
      action_url: `/en/projects/${projectId}`,
    });
  }

  static async notifyNewMessage(userId: string, senderName: string, projectTitle: string, conversationId: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'New Message',
      message: `${senderName} sent you a message about "${projectTitle}"`,
      type: 'message',
      related_id: conversationId,
      action_url: `/en/messages/${conversationId}`,
    });
  }

  static async notifyMilestoneSubmitted(clientId: string, milestoneTitle: string, freelancerName: string, projectId: string): Promise<void> {
    await this.createNotification({
      user_id: clientId,
      title: 'Milestone Submitted',
      message: `${freelancerName} submitted "${milestoneTitle}" for review`,
      type: 'milestone',
      related_id: projectId,
      action_url: `/en/projects/${projectId}/milestones`,
    });
  }

  static async notifyMilestoneApproved(freelancerId: string, milestoneTitle: string, projectId: string): Promise<void> {
    await this.createNotification({
      user_id: freelancerId,
      title: 'Milestone Approved',
      message: `"${milestoneTitle}" has been approved and payment is being processed`,
      type: 'milestone',
      related_id: projectId,
      action_url: `/en/projects/${projectId}/milestones`,
    });
  }

  static async notifyPaymentCompleted(freelancerId: string, amount: number, projectTitle: string, paymentId: string): Promise<void> {
    await this.createNotification({
      user_id: freelancerId,
      title: 'Payment Received',
      message: `You received $${amount} for "${projectTitle}"`,
      type: 'payment',
      related_id: paymentId,
      action_url: `/en/payments/${paymentId}`,
    });
  }

  static async notifyProjectCompleted(clientId: string, freelancerId: string, projectTitle: string, projectId: string): Promise<void> {
    // Notify client
    await this.createNotification({
      user_id: clientId,
      title: 'Project Completed',
      message: `"${projectTitle}" has been completed. Please leave a review.`,
      type: 'project',
      related_id: projectId,
      action_url: `/en/projects/${projectId}/review`,
    });

    // Notify freelancer
    await this.createNotification({
      user_id: freelancerId,
      title: 'Project Completed',
      message: `"${projectTitle}" has been marked as completed`,
      type: 'project',
      related_id: projectId,
      action_url: `/en/projects/${projectId}`,
    });
  }

  static async notifyNewReview(userId: string, rating: number, projectTitle: string, reviewId: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'New Review',
      message: `You received a ${rating}-star review for "${projectTitle}"`,
      type: 'review',
      related_id: reviewId,
      action_url: `/en/reviews/${reviewId}`,
    });
  }

  static async notifySystemUpdate(userId: string, title: string, message: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title,
      message,
      type: 'system',
    });
  }

  // Bulk notifications
  static async notifyMultipleUsers(userIds: string[], notificationData: Omit<Notification, '$id' | 'created_at' | 'is_read' | 'user_id'>): Promise<void> {
    for (const userId of userIds) {
      await this.createNotification({
        ...notificationData,
        user_id: userId,
      });
    }
  }

  // Clean old notifications (older than 30 days)
  static async cleanOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldNotifications = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      [
        Query.lessThan('created_at', thirtyDaysAgo.toISOString()),
      ]
    );

    for (const notification of oldNotifications.documents) {
      await this.deleteNotification(notification.$id);
    }
  }

  // Real-time подписка на уведомления пользователя
  static subscribeToUserNotifications(
    userId: string,
    onNewNotification: (notification: Notification) => void,
    onNotificationUpdate: (notification: Notification) => void
  ): () => void {
    console.log('🔔 Subscribing to notifications for user:', userId);

    const notificationsChannel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.NOTIFICATIONS}.documents`;

    const unsubscribe = client.subscribe([notificationsChannel], (response) => {
      console.log('📨 Notification update:', response);

      const notification = response.payload as Notification;

      // Проверяем что уведомление для этого пользователя
      if (notification.user_id === userId) {
        if (response.events.some(event => event.includes('.create'))) {
          onNewNotification(notification);
        } else if (response.events.some(event => event.includes('.update'))) {
          onNotificationUpdate(notification);
        }
      }
    });

    return unsubscribe;
  }

  // Создать уведомление о новом сообщении
  static async createMessageNotification(
    receiverId: string,
    senderName: string,
    messageText: string,
    conversationId: string
  ): Promise<Notification> {
    return this.createNotification({
      user_id: receiverId,
      title: `New message from ${senderName}`,
      message: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText,
      type: 'message',
      related_id: conversationId,
      action_url: `/messages?conversation=${conversationId}`,
      metadata: JSON.stringify({
        sender_name: senderName,
        conversation_id: conversationId
      })
    });
  }

  // Создать уведомление о новом проекте
  static async createProjectNotification(
    userId: string,
    projectTitle: string,
    projectId: string,
    type: 'new_project' | 'project_update' | 'project_completed'
  ): Promise<Notification> {
    const titles = {
      new_project: `New project: ${projectTitle}`,
      project_update: `Project updated: ${projectTitle}`,
      project_completed: `Project completed: ${projectTitle}`
    };

    return this.createNotification({
      user_id: userId,
      title: titles[type],
      message: `Check out the latest updates on ${projectTitle}`,
      type: 'project',
      related_id: projectId,
      action_url: `/projects/${projectId}`,
      metadata: JSON.stringify({
        project_title: projectTitle,
        project_id: projectId,
        notification_type: type
      })
    });
  }

  // Создать уведомление о платеже
  static async createPaymentNotification(
    userId: string,
    amount: number,
    currency: string,
    paymentId: string,
    type: 'payment_received' | 'payment_sent' | 'payment_failed'
  ): Promise<Notification> {
    const titles = {
      payment_received: `Payment received: ${amount} ${currency}`,
      payment_sent: `Payment sent: ${amount} ${currency}`,
      payment_failed: `Payment failed: ${amount} ${currency}`
    };

    return this.createNotification({
      user_id: userId,
      title: titles[type],
      message: `Your payment of ${amount} ${currency} has been ${type.replace('payment_', '')}.`,
      type: 'payment',
      related_id: paymentId,
      action_url: `/payments/${paymentId}`,
      metadata: JSON.stringify({
        amount,
        currency,
        payment_id: paymentId,
        notification_type: type
      })
    });
  }
}
