import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/services/openai';

export async function POST(request: NextRequest) {
  try {
    const { specialistId, message, conversationHistory = [], taskContext } = await request.json();

    if (!specialistId || !message) {
      return NextResponse.json(
        { error: 'Specialist ID and message are required' },
        { status: 400 }
      );
    }

    const openAIService = OpenAIService.getInstance();

    // Generate AI response using specialist context (with fallback)
    const response = await openAIService.generateSpecialistResponse(
      specialistId,
      message,
      conversationHistory,
      taskContext
    );

    return NextResponse.json({
      success: true,
      answer: response,
      specialistId
    });

  } catch (error) {
    console.error('AI Specialist Chat API error:', error);
    
    // Return a fallback response instead of error for better UX
    const fallbackResponse = 'Привет! Я ваш AI специалист. Готов помочь с вашим проектом. Расскажите подробнее о ваших требованиях, и я подготовлю для вас решение!';
    
    return NextResponse.json({
      success: true,
      answer: fallbackResponse,
      specialistId: specialistId || 'unknown',
      fallback: true
    });
  }
}

// Generate technical brief endpoint
export async function PUT(request: NextRequest) {
  try {
    const { specialistId, userRequirements, additionalContext } = await request.json();

    if (!specialistId || !userRequirements) {
      return NextResponse.json(
        { error: 'Specialist ID and user requirements are required' },
        { status: 400 }
      );
    }

    const openAIService = OpenAIService.getInstance();

    // Generate technical brief using specialist expertise (with fallback)
    const brief = await openAIService.generateTechnicalBrief(
      specialistId,
      userRequirements,
      additionalContext
    );

    return NextResponse.json({
      success: true,
      brief,
      specialistId
    });

  } catch (error) {
    console.error('Technical Brief API error:', error);
    
    // Return a fallback brief
    const fallbackBrief = {
      title: 'AI-Powered Project Solution',
      description: 'Comprehensive AI solution tailored to your specific requirements and business needs.',
      requirements: [
        'Detailed analysis of project requirements',
        'AI-powered implementation approach',
        'Quality assurance and testing',
        'Documentation and support'
      ],
      deliverables: [
        'Complete project solution',
        'Technical documentation',
        'Implementation guide',
        'Post-launch support'
      ],
      timeline: '2-4 weeks depending on project complexity',
      estimatedCost: 500
    };
    
    return NextResponse.json({
      success: true,
      brief: fallbackBrief,
      specialistId: specialistId || 'unknown',
      fallback: true
    });
  }
} 