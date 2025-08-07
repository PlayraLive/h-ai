import { databases, DATABASE_ID, ID, Query } from '@/lib/appwrite/database';
import { NotificationService } from './notifications';

// Message Interface
export interface EnhancedMessage {
  $id?: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'order_card' | 'video' | 'voice' | 'job_card' | 'ai_response';
  timestamp: string;
  isRead: boolean;
  edited?: boolean;
  editedAt?: string;
  replyTo?: string;
  attachments?: string[];
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  senderName?: string;
  senderAvatar?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

// Conversation Interface
export interface EnhancedConversation {
  $id?: string;
  title: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  lastMessageBy: string;
  unreadCount: Record<string, number>; // userId -> unread count
  type: 'direct' | 'group' | 'ai_specialist' | 'project';
  conversation_type: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  last_activity: string;
  projectId?: string | null;
  contractId?: string | null;
  ai_order_id?: string | null;
  job_id?: string | null;
  solution_id?: string | null;
  buyer_id?: string | null;
  seller_id?: string | null;
  context_data?: any;
  is_pinned: boolean;
  tags?: any;
  project_id?: string | null;
  $createdAt?: string;
  $updatedAt?: string;
}

const COLLECTIONS = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages'
};

export class EnhancedMessagingService {
  // Create or get conversation
  static async getOrCreateConversation(
    participants: string[],
    title: string,
    type: EnhancedConversation['type'] = 'direct',
    metadata?: Record<string, any>
  ): Promise<EnhancedConversation> {
    try {
      // Sort participants for consistent lookup
      const sortedParticipants = [...participants].sort();
      
      // Try to find existing conversation
      const existingConversations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        [
          Query.equal('participants', sortedParticipants),
          Query.limit(1)
        ]
      );

      if (existingConversations.documents.length > 0) {
        return existingConversations.documents[0] as unknown as EnhancedConversation;
      }

      // Create new conversation
      const unreadCount: Record<string, number> = {};
      participants.forEach(p => {
        unreadCount[p] = 0;
      });

      const conversationData = {
        title,
        participants: sortedParticipants,
        lastMessage: 'Новая беседа создана',
        lastMessageAt: new Date().toISOString(),
        lastMessageBy: participants[0],
        unreadCount: JSON.stringify(unreadCount),
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        conversation_type: type,
        projectId: null,
        contractId: null,
        ai_order_id: null,
        job_id: null,
        solution_id: null,
        buyer_id: null,
        seller_id: null,
        context_data: null,
        is_pinned: false,
        tags: null,
        project_id: null,
        // Add any other required fields that might be missing
        status: 'active',
        avatar: '',
        metadata: JSON.stringify(metadata || {})
      };

      const conversation = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        ID.unique(),
        conversationData
      );

      return {
        ...conversation,
        unreadCount: JSON.parse(conversation.unreadCount || '{}'),
        metadata: JSON.parse(conversation.metadata || '{}')
      } as unknown as EnhancedConversation;

    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        throw new Error(`Failed to create conversation: ${error.message}`);
      }
      throw new Error('Failed to create conversation');
    }
  }

  // Send message
  static async sendMessage(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    messageType?: EnhancedMessage['messageType'];
    attachments?: string[];
    replyTo?: string;
    senderName?: string;
    senderAvatar?: string;
  }): Promise<EnhancedMessage> {
    try {
      const messageData = {
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        messageType: data.messageType || 'text',
        timestamp: new Date().toISOString(),
        isRead: false,
        edited: false,
        attachments: JSON.stringify(data.attachments || []),
        status: 'sent',
        senderName: data.senderName || '',
        senderAvatar: data.senderAvatar || '',
        replyTo: data.replyTo || ''
      };

      // Create message
      const message = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        ID.unique(),
        messageData
      );

      // Update conversation
      await this.updateConversationLastMessage(
        data.conversationId,
        data.content,
        data.receiverId
      );

      // Send notification
      try {
        await NotificationService.createNotification({
          user_id: data.receiverId,
          title: `💬 Новое сообщение от ${data.senderName || 'пользователя'}`,
          message: data.content.length > 50 
            ? data.content.substring(0, 50) + '...' 
            : data.content,
          type: 'message',
          metadata: JSON.stringify({
            conversationId: data.conversationId,
            senderId: data.senderId
          })
        });
      } catch (notificationError) {
        console.warn('Failed to send notification:', notificationError);
      }
      
      return {
        ...message,
        attachments: JSON.parse(message.attachments || '[]')
      } as unknown as EnhancedMessage;

    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  // Get conversation messages
  static async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<EnhancedMessage[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [
          Query.equal('conversationId', conversationId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      return response.documents.map(doc => ({
        ...doc,
        attachments: JSON.parse(doc.attachments || '[]')
      })) as unknown as EnhancedMessage[];

    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages');
    }
  }

  // Get user conversations
  static async getUserConversations(userId: string): Promise<EnhancedConversation[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        [
          Query.search('participants', userId),
          Query.orderDesc('updatedAt'),
          Query.limit(50)
        ]
      );

      return response.documents.map(doc => ({
        ...doc,
        unreadCount: JSON.parse(doc.unreadCount || '{}'),
        metadata: JSON.parse(doc.metadata || '{}')
      })) as unknown as EnhancedConversation[];

    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      // Get unread messages  
      const unreadMessages = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [
          Query.equal('conversationId', conversationId),
          Query.equal('receiverId', userId),
          Query.equal('isRead', false)
        ]
      );

      // Update each message
      const updatePromises = unreadMessages.documents.map(message =>
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.MESSAGES,
          message.$id,
          { isRead: true, status: 'read' }
        )
      );

      await Promise.all(updatePromises);

      // Update conversation unread count
      const conversation = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        conversationId
      );

      const unreadCount = JSON.parse(conversation.unreadCount || '{}');
      unreadCount[userId] = 0;

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        conversationId,
        {
          unreadCount: JSON.stringify(unreadCount),
          updatedAt: new Date().toISOString()
        }
      );

    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw new Error('Failed to mark messages as read');
    }
  }

  // Update conversation last message
  private static async updateConversationLastMessage(
    conversationId: string,
    lastMessage: string,
    receiverId: string
  ): Promise<void> {
    try {
      const conversation = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        conversationId
      );

      const unreadCount = JSON.parse(conversation.unreadCount || '{}');
      unreadCount[receiverId] = (unreadCount[receiverId] || 0) + 1;

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        conversationId,
        {
          lastMessage: lastMessage.length > 100 
            ? lastMessage.substring(0, 100) + '...' 
            : lastMessage,
          lastMessageAt: new Date().toISOString(),
          lastMessageBy: receiverId,
          unreadCount: JSON.stringify(unreadCount),
          updatedAt: new Date().toISOString(),
          last_activity: new Date().toISOString()
        }
      );

    } catch (error) {
      console.error('Error updating conversation:', error);
      throw new Error('Failed to update conversation');
    }
  }

  // Delete message
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        messageId
      );
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }

  // Edit message
  static async editMessage(
    messageId: string,
    newContent: string
  ): Promise<EnhancedMessage> {
    try {
      const message = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        messageId,
        {
          content: newContent,
          edited: true,
          editedAt: new Date().toISOString()
        }
      );

      return {
        ...message,
        attachments: JSON.parse(message.attachments || '[]')
      } as unknown as EnhancedMessage;

    } catch (error) {
      console.error('Error editing message:', error);
      throw new Error('Failed to edit message');
    }
  }

  // Search messages
  static async searchMessages(
    userId: string,
    query: string,
    conversationId?: string
  ): Promise<EnhancedMessage[]> {
    try {
      const queries = [
        Query.search('content', query),
        Query.limit(50)
      ];

      if (conversationId) {
        queries.push(Query.equal('conversationId', conversationId));
      } else {
        // Search in user's conversations only
        queries.push(Query.equal('senderId', userId));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        queries
      );

      return response.documents.map(doc => ({
        ...doc,
        attachments: JSON.parse(doc.attachments || '[]')
      })) as unknown as EnhancedMessage[];

    } catch (error) {
      console.error('Error searching messages:', error);
      throw new Error('Failed to search messages');
    }
  }

  // Archive conversation
  static async archiveConversation(conversationId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        conversationId,
        {
          status: 'archived',
          updatedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw new Error('Failed to archive conversation');
    }
  }

  // Unarchive conversation
  static async unarchiveConversation(conversationId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CONVERSATIONS,
        conversationId,
        {
          status: 'active',
          updatedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
      throw new Error('Failed to unarchive conversation');
    }
  }
} 