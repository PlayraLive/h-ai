import { databases, DATABASE_ID, Query } from './database';
import { ID } from 'appwrite';

export const AI_CONVERSATIONS_COLLECTION = 'ai_conversations';
export const AI_MESSAGES_COLLECTION = 'ai_messages';
export const AI_SESSIONS_COLLECTION = 'ai_sessions';
export const AI_LEARNING_DATA_COLLECTION = 'ai_learning_data';

// Interfaces for AI conversation system
export interface AIConversation {
  $id: string;
  userId: string;
  specialistId: string;
  specialistName: string;
  specialistTitle: string;
  conversationType: 'order_chat' | 'consultation' | 'support' | 'briefing';
  orderId?: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  context: {
    projectType?: string;
    requirements?: string;
    budget?: number;
    timeline?: string;
    preferences?: Record<string, any>;
  };
  metadata: {
    totalMessages: number;
    lastActivity: string;
    aiModel: string;
    conversationQuality: number;
    userSatisfaction?: number;
    completionRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  $id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageType: 'text' | 'brief' | 'suggestion' | 'question' | 'summary';
  aiContext: {
    specialistPersonality: string;
    responseStrategy: string;
    confidence: number;
    processingTime: number;
    tokensUsed: number;
  };
  userFeedback?: string;
  metadata: {
    timestamp: string;
    edited: boolean;
    regenerated: boolean;
    version: number;
  };
  createdAt: string;
}

export interface AISession {
  $id: string;
  conversationId: string;
  userId: string;
  specialistId: string;
  sessionType: 'consultation' | 'briefing' | 'development' | 'review';
  status: 'active' | 'completed' | 'paused';
  objectives: string[];
  outcomes?: string[];
  nextSteps?: string[];
  duration: number; // in minutes
  quality: {
    userSatisfaction: number;
    goalAchievement: number;
    efficiency: number;
  };
  createdAt: string;
  completedAt?: string;
}

export interface AILearningData {
  $id: string;
  specialistId: string;
  conversationId: string;
  messageId: string;
  learningType: 'response_quality' | 'user_feedback' | 'context_improvement' | 'strategy_optimization';
  originalPrompt: string;
  aiResponse: string;
  userFeedback?: string;
  improvementSuggestion?: string;
  contextData: {
    userPreferences: Record<string, any>;
    projectContext: Record<string, any>;
    conversationFlow: string[];
  };
  confidence: number;
  createdAt: string;
}

export class AIConversationService {
  /**
   * Create a new AI conversation with full context
   */
  static async createConversation(data: {
    userId: string;
    specialistId: string;
    specialistName: string;
    specialistTitle: string;
    conversationType: 'order_chat' | 'consultation' | 'support' | 'briefing';
    orderId?: string;
    context?: Record<string, any>;
  }): Promise<AIConversation> {
    try {
      const conversation = await databases.createDocument(
        DATABASE_ID,
        AI_CONVERSATIONS_COLLECTION,
        ID.unique(),
        {
          userId: data.userId,
          specialistId: data.specialistId,
          specialistName: data.specialistName,
          specialistTitle: data.specialistTitle,
          conversationType: data.conversationType,
          orderId: data.orderId || null,
          status: 'active',
          context: data.context || {},
          metadata: {
            totalMessages: 0,
            lastActivity: new Date().toISOString(),
            aiModel: 'gpt-4',
            conversationQuality: 0,
            completionRate: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      return conversation as unknown as AIConversation;
    } catch (error) {
      console.error('Error creating AI conversation:', error);
      throw error;
    }
  }

  /**
   * Add message to conversation with full context tracking
   */
  static async addMessage(data: {
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    messageType?: 'text' | 'brief' | 'suggestion' | 'question' | 'summary';
    orderId?: string;
    userId?: string;
  }): Promise<AIMessage> {
    try {
      const message = await databases.createDocument(
        DATABASE_ID,
        AI_MESSAGES_COLLECTION,
        ID.unique(),
        {
          orderId: data.orderId || '',
          senderId: data.userId || 'guest',
          senderType: data.role === 'user' ? 'user' : 'ai',
          message: data.content,
          messageType: data.messageType || 'text',
          attachments: [],
          timestamp: new Date().toISOString(),
          conversationId: data.conversationId,
          role: data.role,
          content: data.content,
          userFeedback: '',
          createdAt: new Date().toISOString()
        }
      );

      // Update conversation metadata
      await this.updateConversationMetadata(data.conversationId);

      return message as unknown as AIMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  /**
   * Get conversation history with pagination
   */
  static async getConversationHistory(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AIMessage[]> {
    try {
      const messages = await databases.listDocuments(
        DATABASE_ID,
        AI_MESSAGES_COLLECTION,
        [
          Query.equal('conversationId', conversationId),
          Query.orderAsc('createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      return messages.documents as unknown as AIMessage[];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error;
    }
  }

  /**
   * Get conversations for a user with filtering
   */
  static async getUserConversations(
    userId: string,
    filters?: {
      specialistId?: string;
      conversationType?: string;
      status?: string;
    }
  ): Promise<AIConversation[]> {
    try {
      const queries = [
        Query.equal('userId', userId),
        Query.orderDesc('updatedAt')
      ];

      if (filters?.specialistId) {
        queries.push(Query.equal('specialistId', filters.specialistId));
      }
      if (filters?.conversationType) {
        queries.push(Query.equal('conversationType', filters.conversationType));
      }
      if (filters?.status) {
        queries.push(Query.equal('status', filters.status));
      }

      const conversations = await databases.listDocuments(
        DATABASE_ID,
        AI_CONVERSATIONS_COLLECTION,
        queries
      );

      return conversations.documents as unknown as AIConversation[];
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  static async getConversation(conversationId: string): Promise<AIConversation | null> {
    try {
      const conversation = await databases.getDocument(
        DATABASE_ID,
        AI_CONVERSATIONS_COLLECTION,
        conversationId
      );

      return conversation as unknown as AIConversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Update conversation metadata (message count, activity, etc.)
   */
  static async updateConversationMetadata(conversationId: string): Promise<void> {
    try {
      // Get message count
      const messages = await databases.listDocuments(
        DATABASE_ID,
        AI_MESSAGES_COLLECTION,
        [
          Query.equal('conversationId', conversationId),
          Query.limit(1)
        ]
      );

      // Update conversation
      await databases.updateDocument(
        DATABASE_ID,
        AI_CONVERSATIONS_COLLECTION,
        conversationId,
        {
          updatedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error updating conversation metadata:', error);
    }
  }

  /**
   * Create session tracking for goal-oriented conversations
   */
  static async createSession(data: {
    conversationId: string;
    userId: string;
    specialistId: string;
    sessionType: 'consultation' | 'briefing' | 'development' | 'review';
    objectives: string[];
  }): Promise<AISession> {
    try {
      const session = await databases.createDocument(
        DATABASE_ID,
        AI_SESSIONS_COLLECTION,
        ID.unique(),
        {
          conversationId: data.conversationId,
          userId: data.userId,
          specialistId: data.specialistId,
          sessionType: data.sessionType,
          status: 'active',
          objectives: JSON.stringify(data.objectives),
          duration: 0,
          quality: JSON.stringify({
            userSatisfaction: 0,
            goalAchievement: 0,
            efficiency: 0
          }),
          createdAt: new Date().toISOString()
        }
      );

      return session as unknown as AISession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Store learning data for AI improvement
   */
  static async storeLearningData(data: {
    specialistId: string;
    conversationId: string;
    messageId: string;
    learningType: 'response_quality' | 'user_feedback' | 'context_improvement' | 'strategy_optimization';
    originalPrompt: string;
    aiResponse: string;
    userFeedback?: string;
    confidence: number;
    contextData?: Record<string, any>;
  }): Promise<AILearningData> {
    try {
      const learning = await databases.createDocument(
        DATABASE_ID,
        AI_LEARNING_DATA_COLLECTION,
        ID.unique(),
        {
          specialistId: data.specialistId,
          conversationId: data.conversationId,
          messageId: data.messageId,
          learningType: data.learningType,
          originalPrompt: data.originalPrompt,
          aiResponse: data.aiResponse,
          userFeedback: data.userFeedback || '',
          improvementSuggestion: '',
          confidence: data.confidence,
          createdAt: new Date().toISOString()
        }
      );

      return learning as unknown as AILearningData;
    } catch (error) {
      console.error('Error storing learning data:', error);
      throw error;
    }
  }

  /**
   * Get learning insights for specialist improvement
   */
  static async getSpecialistLearningData(
    specialistId: string,
    limit: number = 100
  ): Promise<AILearningData[]> {
    try {
      const learning = await databases.listDocuments(
        DATABASE_ID,
        AI_LEARNING_DATA_COLLECTION,
        [
          Query.equal('specialistId', specialistId),
          Query.orderDesc('createdAt'),
          Query.limit(limit)
        ]
      );

      return learning.documents as unknown as AILearningData[];
    } catch (error) {
      console.error('Error getting learning data:', error);
      return [];
    }
  }

  /**
   * Provide feedback on AI response
   */
  static async provideFeedback(
    messageId: string,
    feedback: string,
    rating: number
  ): Promise<AIMessage> {
    try {
      const message = await databases.updateDocument(
        DATABASE_ID,
        AI_MESSAGES_COLLECTION,
        messageId,
        {
          userFeedback: feedback
        }
      );

      return message as unknown as AIMessage;
    } catch (error) {
      console.error('Error providing feedback:', error);
      throw error;
    }
  }
} 