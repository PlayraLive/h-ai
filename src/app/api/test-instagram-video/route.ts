import { NextRequest, NextResponse } from 'next/server';
import InstagramVideoSpecialist from '@/lib/services/instagram-video-specialist';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId = 'test-conversation', userId = 'test-user' } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const videoSpecialist = InstagramVideoSpecialist.getInstance();
    
    const result = await videoSpecialist.processClientMessage(
      message,
      conversationId,
      userId
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Instagram Video Specialist API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        fallback: 'Привет! Я Viktor Reels, специалист по Instagram видео. Расскажите о вашем проекте!'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Instagram Video Specialist API is working!',
    specialist: 'Viktor Reels',
    capabilities: [
      'Анализ сообщений клиентов',
      'Создание технических заданий',
      'Генерация 4-8 вариантов видео',
      'Перенаправление в контекст видео',
      'Работа как настоящий фрилансер'
    ]
  });
}