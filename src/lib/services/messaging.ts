import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';

export interface Message {
  $id: string;
  text: string;
  senderId: string;
  receiverId: string;
  conversationId: string; // Исправлено поле
  timestamp: string;
  read: boolean;
  messageType?: 'text' | 'image' | 'file' | 'system';
  attachments?: string[];
  editedAt?: string;
  replyTo?: string;
}

export interface Conversation {
  $id: string;
  project_id: string;
  client_id: string;
  freelancer_id: string;
  last_message?: string;
  last_message_at?: string;
  unread_count_client: number;
  unread_count_freelancer: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export class MessagingService {
  // Create or get conversation
  static async getOrCreateConversation(projectId: string, clientId: string, freelancerId: string): Promise<Conversation> {
    // Try to find existing conversation
    const existingConversations = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CONVERSATIONS,
      [
        Query.equal('project_id', projectId),
        Query.equal('client_id', clientId),
        Query.equal('freelancer_id', freelancerId),
      ]
    );

    if (existingConversations.documents.length > 0) {
      return existingConversations.documents[0] as Conversation;
    }

    // Create new conversation
    const now = new Date().toISOString();
    const conversation = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CONVERSATIONS,
      ID.unique(),
      {
        project_id: projectId,
        client_id: clientId,
        freelancer_id: freelancerId,
        unread_count_client: 0,
        unread_count_freelancer: 0,
        is_archived: false,
        created_at: now,
        updated_at: now,
      }
    );

    return conversation as Conversation;
  }

  // Send message
  static async sendMessage(messageData: Omit<Message, '$id' | 'created_at' | 'updated_at' | 'is_read'>): Promise<Message> {
    const now = new Date().toISOString();
    
    const message = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      ID.unique(),
      {
        ...messageData,
        is_read: false,
        created_at: now,
        updated_at: now,
      }
    );

    // Update conversation
    await this.updateConversationLastMessage(
      messageData.conversationId,
      messageData.content,
      messageData.sender_id,
      now
    );

    return message as Message;
  }

  // Get conversation messages
  static async getConversationMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      [
        Query.equal('conversationId', conversationId),
        Query.orderDesc('created_at'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return response.documents.reverse() as Message[];
  }

  // Get user conversations
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CONVERSATIONS,
      [
        Query.or([
          Query.equal('client_id', userId),
          Query.equal('freelancer_id', userId),
        ]),
        Query.orderDesc('last_message_at'),
      ]
    );

    return response.documents as Conversation[];
  }

  // Mark messages as read
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Get unread messages
    const unreadMessages = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      [
        Query.equal('conversationId', conversationId),
        Query.equal('receiver_id', userId),
        Query.equal('is_read', false),
      ]
    );

    const now = new Date().toISOString();

    // Mark each message as read
    for (const message of unreadMessages.documents) {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        message.$id,
        {
          is_read: true,
          read_at: now,
        }
      );
    }

    // Update conversation unread count
    const conversation = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.CONVERSATIONS,
      conversationId
    ) as Conversation;

    const isClient = conversation.client_id === userId;
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.CONVERSATIONS,
      conversationId,
      {
        [isClient ? 'unread_count_client' : 'unread_count_freelancer']: 0,
      }
    );
  }

  // Update conversation last message
  private static async updateConversationLastMessage(
    conversationId: string,
    lastMessage: string,
    senderId: string,
    timestamp: string
  ): Promise<void> {
    const conversation = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.CONVERSATIONS,
      conversationId
    ) as Conversation;

    const isClient = conversation.client_id === senderId;
    const unreadCountField = isClient ? 'unread_count_freelancer' : 'unread_count_client';
    const currentUnreadCount = isClient ? conversation.unread_count_freelancer : conversation.unread_count_client;

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.CONVERSATIONS,
      conversationId,
      {
        last_message: lastMessage.substring(0, 100), // Truncate for preview
        last_message_at: timestamp,
        [unreadCountField]: currentUnreadCount + 1,
        updated_at: timestamp,
      }
    );
  }

  // Send system message
  static async sendSystemMessage(
    conversationId: string,
    content: string,
    metadata?: any
  ): Promise<Message> {
    const conversation = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.CONVERSATIONS,
      conversationId
    ) as Conversation;

    return this.sendMessage({
      conversationId: conversationId,
      sender_id: 'system',
      receiver_id: conversation.client_id, // System messages go to both, but we need a receiver
      content,
      message_type: 'system',
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });
  }

  // Send milestone update message
  static async sendMilestoneMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    milestoneData: any
  ): Promise<Message> {
    return this.sendMessage({
      conversationId: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: `Milestone "${milestoneData.title}" has been ${milestoneData.status}`,
      message_type: 'milestone',
      metadata: JSON.stringify(milestoneData),
    });
  }

  // Send payment notification message
  static async sendPaymentMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    paymentData: any
  ): Promise<Message> {
    return this.sendMessage({
      conversationId: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: `Payment of $${paymentData.amount} has been ${paymentData.status}`,
      message_type: 'payment',
      metadata: JSON.stringify(paymentData),
    });
  }

  // Archive conversation
  static async archiveConversation(conversationId: string): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.CONVERSATIONS,
      conversationId,
      {
        is_archived: true,
        updated_at: new Date().toISOString(),
      }
    );
  }

  // Get unread message count for user
  static async getUnreadMessageCount(userId: string): Promise<number> {
    const conversations = await this.getUserConversations(userId);
    
    return conversations.reduce((total, conv) => {
      const isClient = conv.client_id === userId;
      return total + (isClient ? conv.unread_count_client : conv.unread_count_freelancer);
    }, 0);
  }
}
