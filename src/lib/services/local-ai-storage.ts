// Local storage fallback for AI conversations
export interface LocalAIConversation {
  id: string;
  userId: string;
  specialistId: string;
  specialistName: string;
  specialistTitle: string;
  conversationType: 'order_chat' | 'consultation' | 'support' | 'briefing';
  status: 'active' | 'completed' | 'paused' | 'archived';
  messages: LocalAIMessage[];
  context: Record<string, any>;
  metadata: {
    totalMessages: number;
    lastActivity: string;
    conversationQuality: number;
    completionRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LocalAIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageType: 'text' | 'brief' | 'suggestion' | 'question' | 'summary';
  aiContext?: {
    specialistPersonality: string;
    responseStrategy: string;
    confidence: number;
    processingTime: number;
    tokensUsed: number;
  };
  userFeedback?: {
    rating: number;
    helpful: boolean;
    comment?: string;
  };
  suggestions?: string[];
  nextSteps?: string[];
  timestamp: string;
}

export class LocalAIStorageService {
  private static readonly STORAGE_KEY = 'ai_conversations';
  private static readonly LEARNING_KEY = 'ai_learning_data';

  /**
   * Create a new conversation
   */
  static createConversation(data: {
    userId: string;
    specialistId: string;
    specialistName: string;
    specialistTitle: string;
    conversationType: 'order_chat' | 'consultation' | 'support' | 'briefing';
    context?: Record<string, any>;
  }): LocalAIConversation {
    const conversation: LocalAIConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId,
      specialistId: data.specialistId,
      specialistName: data.specialistName,
      specialistTitle: data.specialistTitle,
      conversationType: data.conversationType,
      status: 'active',
      messages: [],
      context: data.context || {},
      metadata: {
        totalMessages: 0,
        lastActivity: new Date().toISOString(),
        conversationQuality: 0,
        completionRate: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveConversation(conversation);
    return conversation;
  }

  /**
   * Add message to conversation
   */
  static addMessage(
    conversationId: string,
    message: Omit<LocalAIMessage, 'id' | 'timestamp'>
  ): LocalAIMessage {
    const conversations = this.getAllConversations();
    let conversationIndex = conversations.findIndex(c => c.id === conversationId);
    
    // If conversation not found, create it automatically
    if (conversationIndex === -1) {
      console.log('📱 Conversation not found, creating new conversation...', conversationId);
      
      const newConversation: LocalAIConversation = {
        id: conversationId,
        userId: 'guest',
        specialistId: 'unknown',
        specialistName: 'AI Specialist',
        specialistTitle: 'AI Assistant',
        conversationType: 'consultation',
        status: 'active',
        messages: [],
        context: {},
        metadata: {
          totalMessages: 0,
          lastActivity: new Date().toISOString(),
          conversationQuality: 0.8,
          completionRate: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      conversations.push(newConversation);
      conversationIndex = conversations.length - 1;
      console.log('✅ New conversation created:', conversationId);
    }

    const newMessage: LocalAIMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    conversations[conversationIndex].messages.push(newMessage);
    conversations[conversationIndex].metadata.totalMessages = conversations[conversationIndex].messages.length;
    conversations[conversationIndex].metadata.lastActivity = new Date().toISOString();
    conversations[conversationIndex].updatedAt = new Date().toISOString();

    this.saveAllConversations(conversations);
    console.log('📱 Message added successfully to conversation:', conversationId);
    return newMessage;
  }

  /**
   * Get conversation by ID
   */
  static getConversation(conversationId: string): LocalAIConversation | null {
    const conversations = this.getAllConversations();
    return conversations.find(c => c.id === conversationId) || null;
  }

  /**
   * Get user conversations
   */
  static getUserConversations(
    userId: string,
    specialistId?: string,
    status?: string
  ): LocalAIConversation[] {
    const conversations = this.getAllConversations();
    
    return conversations.filter(c => {
      if (c.userId !== userId) return false;
      if (specialistId && c.specialistId !== specialistId) return false;
      if (status && c.status !== status) return false;
      return true;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Update message feedback
   */
  static updateMessageFeedback(
    conversationId: string,
    messageId: string,
    feedback: {
      rating: number;
      helpful: boolean;
      comment?: string;
    }
  ): void {
    const conversations = this.getAllConversations();
    const conversationIndex = conversations.findIndex(c => c.id === conversationId);
    
    if (conversationIndex === -1) return;

    const messageIndex = conversations[conversationIndex].messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    conversations[conversationIndex].messages[messageIndex].userFeedback = feedback;
    
    // Record learning data
    this.recordLearningData({
      specialistId: conversations[conversationIndex].specialistId,
      conversationId,
      messageId,
      learningType: feedback.helpful ? 'feedback_positive' : 'feedback_negative',
      originalPrompt: this.extractOriginalPrompt(conversations[conversationIndex].messages, messageId),
      aiResponse: conversations[conversationIndex].messages[messageIndex].content,
      userFeedback: feedback.comment,
      confidence: conversations[conversationIndex].messages[messageIndex].aiContext?.confidence || 0
    });

    this.saveAllConversations(conversations);
  }

  /**
   * Record learning data
   */
  static recordLearningData(data: {
    specialistId: string;
    conversationId: string;
    messageId: string;
    learningType: 'successful_response' | 'user_correction' | 'feedback_positive' | 'feedback_negative';
    originalPrompt: string;
    aiResponse: string;
    userFeedback?: string;
    confidence: number;
  }): void {
    const learningData = this.getLearningData();
    
    const newEntry = {
      id: `learn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString()
    };

    learningData.push(newEntry);
    
    // Keep only last 1000 entries
    if (learningData.length > 1000) {
      learningData.splice(0, learningData.length - 1000);
    }

    this.saveLearningData(learningData);
  }

  /**
   * Get learning data for specialist
   */
  static getSpecialistLearningData(
    specialistId: string,
    learningType?: string,
    limit: number = 100
  ): any[] {
    const learningData = this.getLearningData();
    
    let filtered = learningData.filter(d => d.specialistId === specialistId);
    
    if (learningType) {
      filtered = filtered.filter(d => d.learningType === learningType);
    }

    return filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Generate conversation summary
   */
  static generateConversationSummary(conversationId: string): string {
    const conversation = this.getConversation(conversationId);
    if (!conversation) return '';

    const userMessages = conversation.messages.filter(m => m.role === 'user');
    const lastUserMessages = userMessages.slice(-3);
    
    return `Recent discussion: ${lastUserMessages.map(m => m.content.slice(0, 100)).join(' | ')}`;
  }

  /**
   * Private helper methods
   */
  private static getAllConversations(): LocalAIConversation[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading conversations from localStorage:', error);
      return [];
    }
  }

  private static saveAllConversations(conversations: LocalAIConversation[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations to localStorage:', error);
    }
  }

  private static saveConversation(conversation: LocalAIConversation): void {
    const conversations = this.getAllConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }
    
    this.saveAllConversations(conversations);
  }

  private static getLearningData(): any[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.LEARNING_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading learning data from localStorage:', error);
      return [];
    }
  }

  private static saveLearningData(data: any[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.LEARNING_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving learning data to localStorage:', error);
    }
  }

  private static extractOriginalPrompt(messages: LocalAIMessage[], messageId: string): string {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex > 0) {
      return messages[messageIndex - 1].content;
    }
    return '';
  }
} 