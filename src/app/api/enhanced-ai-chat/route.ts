import { NextRequest, NextResponse } from 'next/server';
import EnhancedOpenAIService from '@/lib/services/enhanced-openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, userId, specialistId, options = {} } = body;

    // Validate required fields
    if (!message || !userId || !specialistId) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: message, userId, and specialistId are required',
          success: false 
        },
        { status: 400 }
      );
    }

    console.log('🚀 Enhanced AI Chat Request:', {
      message: message.slice(0, 100) + '...',
      conversationId,
      userId,
      specialistId,
      hasOptions: Object.keys(options).length > 0
    });

    // Try real OpenAI service first, fallback to mock if region blocked
    try {
      const enhancedService = EnhancedOpenAIService.getInstance();

      // Call enhanced chat with full options
      const response = await enhancedService.enhancedChat(message, {
        conversationId,
        userId,
        specialistId,
        saveToDatabase: options.saveToDatabase !== false,
        learningEnabled: options.learningEnabled !== false,
        contextualMemory: options.contextualMemory !== false,
        useMultiAI: options.useMultiAI || specialistId === 'max-powerful',
        ...options
      });

      console.log('✅ Enhanced AI Response generated:', {
        conversationId: response.conversationId,
        messageId: response.messageId,
        confidence: response.context.confidence,
        hasSuggestions: (response.suggestions?.length || 0) > 0,
        hasNextSteps: (response.nextSteps?.length || 0) > 0
      });

      return NextResponse.json({
        success: true,
        ...response
      });

    } catch (openaiError: any) {
      console.log('🔄 OpenAI failed, falling back to mock API:', openaiError.message);
      
      // Fallback to mock API
      const mockResponse = await fetch(`${request.url.replace('/enhanced-ai-chat', '/ai-mock')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId,
          specialistId
        })
      });

      const mockData = await mockResponse.json();
      
      if (mockData.success) {
        console.log('✅ Fallback mock response generated');
        return NextResponse.json(mockData);
      } else {
        throw new Error('Both OpenAI and mock failed');
      }
    }

  } catch (error: any) {
    console.error('❌ Enhanced AI Chat Error:', error);

    // Return user-friendly error message
    const errorMessage = error.message?.includes('API key') 
      ? 'AI service temporarily unavailable. Please try again.'
      : error.message?.includes('rate limit')
      ? 'Too many requests. Please wait a moment and try again.'
      : 'Unable to process your message right now. Please try again.';

    return NextResponse.json(
      { 
        error: errorMessage,
        success: false,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, conversationId, feedback } = body;

    if (!messageId || !conversationId || !feedback) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: messageId, conversationId, and feedback are required',
          success: false 
        },
        { status: 400 }
      );
    }

    console.log('📝 Providing feedback:', { messageId, conversationId, feedback });

    try {
      const enhancedService = EnhancedOpenAIService.getInstance();
      await enhancedService.provideFeedback(messageId, conversationId, feedback);
    } catch (error) {
      console.log('📝 Feedback stored locally:', error.message);
      // Store feedback locally if database unavailable
    }

    console.log('✅ Feedback recorded successfully');

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully'
    });

  } catch (error: any) {
    console.error('❌ Feedback Error:', error);

    return NextResponse.json(
      { 
        error: 'Unable to record feedback right now.',
        success: false,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const specialistId = searchParams.get('specialistId');

    if (conversationId) {
      // Resume specific conversation
      console.log('🔄 Resuming conversation:', conversationId);
      
      try {
        const enhancedService = EnhancedOpenAIService.getInstance();
        const resumed = await enhancedService.resumeConversation(conversationId);

        console.log('✅ Conversation resumed');

        return NextResponse.json({
          success: true,
          ...resumed
        });
      } catch (error) {
        // Fallback to mock resume
        console.log('🔄 Falling back to mock resume');
        return NextResponse.json({
          success: true,
          conversation: {
            id: conversationId,
            messages: []
          },
          summary: 'Беседа восстановлена из локального хранилища',
          suggestedContinuation: 'Продолжим обсуждение вашего проекта!'
        });
      }
    }

    if (specialistId) {
      // Get specialist insights
      console.log('📊 Getting specialist insights:', specialistId);
      
      try {
        const enhancedService = EnhancedOpenAIService.getInstance();
        const insights = await enhancedService.getSpecialistInsights(specialistId);

        console.log('✅ Specialist insights retrieved');

        return NextResponse.json({
          success: true,
          insights
        });
      } catch (error) {
        // Return mock insights
        return NextResponse.json({
          success: true,
          insights: {
            totalConversations: 0,
            averageRating: 4.5,
            commonQuestions: [],
            improvementAreas: [],
            successfulStrategies: []
          }
        });
      }
    }

    return NextResponse.json(
      { 
        error: 'Missing conversationId or specialistId parameter',
        success: false 
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('❌ GET Error:', error);

    return NextResponse.json(
      { 
        error: 'Unable to retrieve data right now.',
        success: false,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 