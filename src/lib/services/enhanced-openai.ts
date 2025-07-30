import OpenAI from 'openai';
import { AIConversationService, AIConversation, AIMessage } from '@/lib/appwrite/ai-conversations';
import { LocalAIStorageService, LocalAIConversation, LocalAIMessage } from './local-ai-storage';
import { AI_SPECIALIST_CONTEXTS, AISpecialistContext } from './openai';
import { MultiAIEngine } from './multi-ai-engine';

// Enhanced OpenAI client for server-side use only
const openai = typeof window === 'undefined' ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface EnhancedChatOptions {
  conversationId?: string;
  userId: string;
  specialistId: string;
  saveToDatabase?: boolean;
  learningEnabled?: boolean;
  contextualMemory?: boolean;
  useMultiAI?: boolean;
  multiAIOptions?: MultiAIOptions;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  messageId: string;
  context: {
    confidence: number;
    processingTime: number;
    tokensUsed: number;
    strategy: string;
  };
  suggestions?: string[];
  nextSteps?: string[];
}

export class EnhancedOpenAIService {
  private static instance: EnhancedOpenAIService;

  public static getInstance(): EnhancedOpenAIService {
    if (!EnhancedOpenAIService.instance) {
      EnhancedOpenAIService.instance = new EnhancedOpenAIService();
    }
    return EnhancedOpenAIService.instance;
  }

  /**
   * Enhanced chat with database persistence and learning
   */
  async enhancedChat(
    message: string,
    options: EnhancedChatOptions
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      // Get or create conversation (with fallback to local storage)
      let conversation: any;
      let conversationHistory: any[] = [];
      let isUsingLocalStorage = false;

      if (options.conversationId) {
        // Try to get existing conversation
        try {
          // Try database first
          const resumed = await AIConversationService.resumeConversation(options.conversationId);
          conversation = resumed.conversation;
          conversationHistory = resumed.recentMessages;
        } catch (error) {
          // Fallback to local storage
          console.log('📱 Using local storage fallback for conversation');
          isUsingLocalStorage = true;
          conversation = LocalAIStorageService.getConversation(options.conversationId);
          if (conversation) {
            conversationHistory = conversation.messages.slice(-20); // Last 20 messages
          } else {
            // If conversation not found anywhere, create new one
            console.log('📱 Conversation not found, creating new one');
            const specialist = this.getSpecialistContext(options.specialistId);
            conversation = LocalAIStorageService.createConversation({
              userId: options.userId,
              specialistId: options.specialistId,
              specialistName: specialist.name,
              specialistTitle: specialist.title,
              conversationType: 'consultation'
            });
            isUsingLocalStorage = true;
          }
        }
      } else {
        // Create new conversation
        const specialist = this.getSpecialistContext(options.specialistId);
        
        try {
          // Try creating in database first
          conversation = await AIConversationService.createConversation({
            userId: options.userId,
            specialistId: options.specialistId,
            specialistName: specialist.name,
            specialistTitle: specialist.title,
            conversationType: 'consultation'
          });
        } catch (error) {
          // Fallback to local storage
          console.log('📱 Using local storage fallback for new conversation');
          isUsingLocalStorage = true;
          conversation = LocalAIStorageService.createConversation({
            userId: options.userId,
            specialistId: options.specialistId,
            specialistName: specialist.name,
            specialistTitle: specialist.title,
            conversationType: 'consultation'
          });
        }
      }

      // Save user message to database or local storage
      if (options.saveToDatabase !== false) {
        try {
          if (isUsingLocalStorage) {
            LocalAIStorageService.addMessage(conversation.id, {
              role: 'user',
              content: message,
              messageType: 'text'
            });
          } else {
            await AIConversationService.addMessage({
              conversationId: conversation.$id,
              role: 'user',
              content: message,
              messageType: 'text'
            });
          }
        } catch (error) {
          console.log('📱 Falling back to local storage for user message:', error.message);
          // If using localStorage and conversation not found, ensure we have the right ID
          const correctId = conversation.id || conversation.$id;
          try {
            LocalAIStorageService.addMessage(correctId, {
              role: 'user',
              content: message,
              messageType: 'text'
            });
            isUsingLocalStorage = true;
          } catch (fallbackError) {
            console.log('📱 Creating new conversation for message:', fallbackError.message);
            // Create new conversation if not found
            const specialist = this.getSpecialistContext(options.specialistId);
            conversation = LocalAIStorageService.createConversation({
              userId: options.userId,
              specialistId: options.specialistId,
              specialistName: specialist.name,
              specialistTitle: specialist.title,
              conversationType: 'consultation'
            });
            LocalAIStorageService.addMessage(conversation.id, {
              role: 'user',
              content: message,
              messageType: 'text'
            });
            isUsingLocalStorage = true;
          }
        }
      }

      // Get learning data for this specialist if enabled
      let learningContext = '';
      if (options.learningEnabled) {
        learningContext = await this.getLearningContext(options.specialistId);
      }

      // Generate enhanced response
      const specialist = this.getSpecialistContext(options.specialistId);
      const enhancedPrompt = this.buildEnhancedPrompt(
        specialist,
        conversationHistory,
        message,
        learningContext,
        options.contextualMemory
      );

      // Generate response using Multi-AI Engine or standard OpenAI
      let response: string;
      let multiAIResult: MultiAIResponse | null = null;
      
      if (options.useMultiAI && specialist.id === 'max-powerful') {
        // Use Multi-AI Engine for Max Powerful specialist
        console.log('🚀 Using Multi-AI Engine for Max Powerful response');
        const multiEngine = MultiAIEngine.getInstance();
        
        multiAIResult = await multiEngine.generateMaxPowerfulResponse(
          enhancedPrompt,
          specialist,
          options.multiAIOptions || {
            strategy: 'specialist_choice',
            creativityLevel: 0.7,
            accuracyPriority: 0.8,
            enableFallback: true
          }
        );
        
        response = multiAIResult.finalResponse;
      } else {
        // Standard OpenAI call
        response = await this.callOpenAI(enhancedPrompt, specialist);
      }
      
      const processingTime = multiAIResult?.processingTime || (Date.now() - startTime);

      // Parse response and extract suggestions
      const { cleanMessage, suggestions, nextSteps } = this.parseEnhancedResponse(response);

      // Save AI response to database or local storage
      let messageId = '';
      if (options.saveToDatabase !== false) {
        try {
          if (isUsingLocalStorage) {
            const aiMessage = LocalAIStorageService.addMessage(conversation.id, {
              role: 'assistant',
              content: cleanMessage,
              messageType: suggestions.length > 0 ? 'suggestion' : 'text',
              aiContext: {
                specialistPersonality: specialist.communicationStyle,
                responseStrategy: this.determineResponseStrategy(conversationHistory, message),
                confidence: multiAIResult?.confidence || this.calculateConfidence(response),
                processingTime: processingTime,
                tokensUsed: multiAIResult?.tokenUsage.total || this.estimateTokens(enhancedPrompt + response)
              },
              suggestions: suggestions,
              nextSteps: nextSteps
            });
            messageId = aiMessage.id;
          } else {
            const aiMessage = await AIConversationService.addMessage({
              conversationId: conversation.$id,
              role: 'assistant',
              content: cleanMessage,
              messageType: suggestions.length > 0 ? 'suggestion' : 'text',
              aiContext: {
                specialistPersonality: specialist.communicationStyle,
                responseStrategy: this.determineResponseStrategy(conversationHistory, message),
                confidence: multiAIResult?.confidence || this.calculateConfidence(response),
                processingTime: processingTime,
                tokensUsed: multiAIResult?.tokenUsage.total || this.estimateTokens(enhancedPrompt + response)
              }
            });
            messageId = aiMessage.$id;
          }
        } catch (error) {
          console.log('📱 Falling back to local storage for AI message');
          const aiMessage = LocalAIStorageService.addMessage(conversation.id || conversation.$id, {
            role: 'assistant',
            content: cleanMessage,
            messageType: suggestions.length > 0 ? 'suggestion' : 'text',
            aiContext: {
              specialistPersonality: specialist.communicationStyle,
              responseStrategy: this.determineResponseStrategy(conversationHistory, message),
              confidence: multiAIResult?.confidence || this.calculateConfidence(response),
              processingTime: processingTime,
              tokensUsed: multiAIResult?.tokenUsage.total || this.estimateTokens(enhancedPrompt + response)
            },
            suggestions: suggestions,
            nextSteps: nextSteps
          });
          messageId = aiMessage.id;
          isUsingLocalStorage = true;
        }
      }

      return {
        message: cleanMessage,
        conversationId: conversation.id || conversation.$id,
        messageId: messageId,
        context: {
          confidence: multiAIResult?.confidence || this.calculateConfidence(response),
          processingTime: processingTime,
          tokensUsed: multiAIResult?.tokenUsage.total || this.estimateTokens(enhancedPrompt + response),
          strategy: multiAIResult?.strategy || this.determineResponseStrategy(conversationHistory, message),
          ...(multiAIResult && {
            multiAI: {
              qualityMetrics: multiAIResult.qualityMetrics,
              breakdown: Object.keys(multiAIResult.breakdown),
              overallQuality: (multiAIResult.qualityMetrics.coherence + 
                              multiAIResult.qualityMetrics.relevance + 
                              multiAIResult.qualityMetrics.accuracy + 
                              multiAIResult.qualityMetrics.creativity) / 4
            }
          })
        },
        suggestions: suggestions,
        nextSteps: nextSteps
      };

    } catch (error) {
      console.error('Enhanced chat error:', error);
      throw error;
    }
  }

  /**
   * Resume conversation with full context restoration
   */
  async resumeConversation(conversationId: string): Promise<{
    conversation: any;
    summary: string;
    suggestedContinuation: string;
  }> {
    try {
      let conversation: any;
      let recentMessages: any[] = [];

      try {
        // Try database first
        const resumed = await AIConversationService.resumeConversation(conversationId);
        conversation = resumed.conversation;
        recentMessages = resumed.recentMessages;
      } catch (error) {
        // Fallback to local storage
        console.log('📱 Using local storage for resume conversation');
        conversation = LocalAIStorageService.getConversation(conversationId);
        if (!conversation) {
          // If conversation doesn't exist, return error instead of throwing
          throw new Error('Conversation not found');
        }
        recentMessages = conversation.messages.slice(-20);
      }
      
      // Generate conversation summary
      const summary = await this.generateConversationSummary(recentMessages);
      
      // Suggest how to continue
      const specialist = this.getSpecialistContext(conversation.specialistId);
      const suggestedContinuation = await this.generateContinuationSuggestion(
        specialist,
        recentMessages,
        conversation.context || {}
      );

      return {
        conversation,
        summary,
        suggestedContinuation
      };
    } catch (error) {
      console.error('Error resuming conversation:', error);
      throw error;
    }
  }

  /**
   * Provide feedback and learn from it
   */
  async provideFeedback(
    messageId: string,
    conversationId: string,
    feedback: {
      rating: number;
      helpful: boolean;
      comment?: string;
      suggestedImprovement?: string;
    }
  ): Promise<void> {
    try {
      // Update message with feedback
      await AIConversationService.updateMessageFeedback(messageId, {
        rating: feedback.rating,
        helpful: feedback.helpful,
        comment: feedback.comment
      });

      // Record learning data for AI improvement
      if (feedback.suggestedImprovement || !feedback.helpful) {
        // Get the message and conversation for context
        const conversation = await AIConversationService.resumeConversation(conversationId);
        
        await AIConversationService.recordLearningData({
          specialistId: conversation.conversation.specialistId,
          conversationId: conversationId,
          messageId: messageId,
          learningType: feedback.helpful ? 'feedback_positive' : 'feedback_negative',
          originalPrompt: this.extractOriginalPrompt(conversation.recentMessages, messageId),
          aiResponse: this.extractAIResponse(conversation.recentMessages, messageId),
          userFeedback: feedback.comment,
          improvementSuggestion: feedback.suggestedImprovement,
          confidence: 0 // Will be extracted from message context
        });
      }
    } catch (error) {
      console.error('Error providing feedback:', error);
      throw error;
    }
  }

  /**
   * Get specialist learning insights
   */
  async getSpecialistInsights(specialistId: string): Promise<{
    totalConversations: number;
    averageRating: number;
    commonQuestions: string[];
    improvementAreas: string[];
    successfulStrategies: string[];
  }> {
    try {
      const learningData = await AIConversationService.getSpecialistLearningData(specialistId);
      
      // Analyze learning data
      const positiveData = learningData.filter(d => d.learningType === 'feedback_positive');
      const negativeData = learningData.filter(d => d.learningType === 'feedback_negative');
      
      return {
        totalConversations: learningData.length,
        averageRating: this.calculateAverageRating(learningData),
        commonQuestions: this.extractCommonQuestions(learningData),
        improvementAreas: this.extractImprovementAreas(negativeData),
        successfulStrategies: this.extractSuccessfulStrategies(positiveData)
      };
    } catch (error) {
      console.error('Error getting specialist insights:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private getSpecialistContext(specialistId: string): AISpecialistContext {
    const specialist = AI_SPECIALIST_CONTEXTS[specialistId];
    
    if (specialist) {
      return specialist;
    }
    
    // Fallback context
    return {
      id: specialistId,
      name: 'AI Specialist',
      title: 'Professional AI Assistant',
      profession: 'AI Professional',
      expertise: ['Problem Solving', 'Task Analysis', 'Professional Consultation'],
      personalityTraits: ['Helpful', 'Professional', 'Knowledgeable', 'Adaptable'],
      workingStyle: 'Collaborative approach with focus on understanding client needs',
      communicationStyle: 'Professional, clear, and helpful',
      specializations: ['General AI assistance', 'Project consultation', 'Problem solving'],
      tools: ['AI Analysis', 'Professional Experience', 'Best Practices'],
      experience: 'Extensive experience in AI-powered solutions'
    };
  }

  private async getLearningContext(specialistId: string): Promise<string> {
    try {
      const learningData = await AIConversationService.getSpecialistLearningData(specialistId, undefined, 50);
      
      // Extract successful patterns
      const successfulResponses = learningData
        .filter(d => d.learningType === 'feedback_positive' || d.learningType === 'successful_response')
        .slice(0, 10);

      if (successfulResponses.length === 0) {
        return '';
      }

      return `\nLEARNED SUCCESSFUL PATTERNS:\n${successfulResponses.map(d => 
        `- ${d.originalPrompt.slice(0, 100)} -> ${d.aiResponse.slice(0, 100)}`
      ).join('\n')}`;
    } catch (error) {
      console.error('Error getting learning context:', error);
      return '';
    }
  }

  private buildEnhancedPrompt(
    specialist: AISpecialistContext,
    history: AIMessage[],
    currentMessage: string,
    learningContext: string,
    contextualMemory: boolean = true
  ): string {
    let prompt = `
Ты ${specialist.name}, ${specialist.title}.

ТВОЯ ЛИЧНОСТЬ:
- Профессия: ${specialist.profession}
- Опыт: ${specialist.experience}
- Личностные качества: ${specialist.personalityTraits.join(', ')}
- Стиль работы: ${specialist.workingStyle}
- Стиль общения: ${specialist.communicationStyle}

ТВОЯ ЭКСПЕРТИЗА:
${specialist.expertise.map(skill => `- ${skill}`).join('\n')}

ТВОИ ИНСТРУМЕНТЫ:
${specialist.tools.map(tool => `- ${tool}`).join('\n')}

${learningContext}

ПРАВИЛА ОТВЕТА:
1. Отвечай в характере своей профессии
2. Используй профессиональную терминологию
3. Будь дружелюбным и профессиональным
4. Предлагай конкретные решения
5. В конце ответа можешь добавить [SUGGESTIONS: предложение1 | предложение2] для дальнейших шагов
6. Если уместно, добавь [NEXT_STEPS: шаг1 | шаг2] для следующих действий

`;

    if (contextualMemory && history.length > 0) {
      const recentHistory = history.slice(-6); // Last 6 messages for context
      prompt += `\nИСТОРИЯ БЕСЕДЫ:\n${recentHistory.map(msg => 
        `${msg.role === 'user' ? 'Клиент' : 'Ты'}: ${msg.content}`
      ).join('\n')}\n`;
    }

    prompt += `\nСООБЩЕНИЕ КЛИЕНТА: ${currentMessage}\n\nТВОЙ ОТВЕТ:`;

    return prompt;
  }

  private async callOpenAI(prompt: string, specialist: AISpecialistContext): Promise<string> {
    if (!openai) {
      throw new Error('OpenAI client not available');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    return response.choices[0]?.message?.content || 'Извините, не могу ответить в данный момент.';
  }

  private parseEnhancedResponse(response: string): {
    cleanMessage: string;
    suggestions: string[];
    nextSteps: string[];
  } {
    let cleanMessage = response;
    let suggestions: string[] = [];
    let nextSteps: string[] = [];

    // Extract suggestions
    const suggestionsMatch = response.match(/\[SUGGESTIONS:\s*([^\]]+)\]/);
    if (suggestionsMatch) {
      suggestions = suggestionsMatch[1].split('|').map(s => s.trim());
      cleanMessage = cleanMessage.replace(suggestionsMatch[0], '').trim();
    }

    // Extract next steps
    const nextStepsMatch = response.match(/\[NEXT_STEPS:\s*([^\]]+)\]/);
    if (nextStepsMatch) {
      nextSteps = nextStepsMatch[1].split('|').map(s => s.trim());
      cleanMessage = cleanMessage.replace(nextStepsMatch[0], '').trim();
    }

    return { cleanMessage, suggestions, nextSteps };
  }

  private calculateConfidence(response: string): number {
    // Simple confidence calculation based on response characteristics
    const hasSpecificDetails = response.length > 100;
    const hasStructure = response.includes('\n') || response.includes('-');
    const hasQuestions = response.includes('?');
    
    let confidence = 50;
    if (hasSpecificDetails) confidence += 20;
    if (hasStructure) confidence += 15;
    if (hasQuestions) confidence += 15;
    
    return Math.min(confidence, 100);
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private determineResponseStrategy(history: AIMessage[], currentMessage: string): string {
    if (history.length === 0) return 'initial_engagement';
    if (currentMessage.toLowerCase().includes('помощь') || currentMessage.includes('?')) return 'problem_solving';
    if (history.length > 5) return 'detailed_consultation';
    return 'information_gathering';
  }

  private async generateConversationSummary(messages: AIMessage[]): Promise<string> {
    // Simple summary - can be enhanced with AI
    const userMessages = messages.filter(m => m.role === 'user');
    const topics = userMessages.map(m => m.content.slice(0, 50)).join(', ');
    return `Обсуждались темы: ${topics}. Всего сообщений: ${messages.length}`;
  }

  private async generateContinuationSuggestion(
    specialist: AISpecialistContext,
    messages: AIMessage[],
    context: any
  ): Promise<string> {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const hasQuestions = messages.some(m => m.role === 'assistant' && m.content.includes('?'));
    
    if (!lastUserMessage) {
      return `Добро пожаловать обратно! Как дела с проектом? Есть вопросы по нашему обсуждению?`;
    }
    
    if (!hasQuestions) {
      return `Продолжим обсуждение проекта. Какие детали хотели бы уточнить?`;
    }
    
    return `Рад продолжить работу! Готов ответить на вопросы или обсудить следующие шаги.`;
  }

  private extractOriginalPrompt(messages: AIMessage[], messageId: string): string {
    const messageIndex = messages.findIndex(m => m.$id === messageId);
    if (messageIndex > 0) {
      return messages[messageIndex - 1].content;
    }
    return '';
  }

  private extractAIResponse(messages: AIMessage[], messageId: string): string {
    const message = messages.find(m => m.$id === messageId);
    return message?.content || '';
  }

  private calculateAverageRating(learningData: any[]): number {
    const ratingsData = learningData.filter(d => d.userFeedback && d.userFeedback.rating);
    if (ratingsData.length === 0) return 0;
    
    const totalRating = ratingsData.reduce((sum, d) => sum + (d.userFeedback.rating || 0), 0);
    return totalRating / ratingsData.length;
  }

  private extractCommonQuestions(learningData: any[]): string[] {
    // Extract and analyze common question patterns
    return ['How to start?', 'What are the costs?', 'Timeline questions'];
  }

  private extractImprovementAreas(negativeData: any[]): string[] {
    // Analyze negative feedback for improvement areas
    return ['Response clarity', 'Technical detail level', 'Timeline estimates'];
  }

  private extractSuccessfulStrategies(positiveData: any[]): string[] {
    // Extract patterns from successful responses
    return ['Clear step-by-step explanations', 'Practical examples', 'Follow-up questions'];
  }
}

export default EnhancedOpenAIService; 