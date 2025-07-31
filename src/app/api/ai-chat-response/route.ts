import { NextRequest, NextResponse } from 'next/server';
import InstagramVideoSpecialist from '@/lib/services/instagram-video-specialist';

export async function POST(request: NextRequest) {
  try {
    const { message, specialistId, conversationId, userId } = await request.json();
    
    if (!message || !specialistId || !conversationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let aiResponseContent = '';
    let options = null;
    let technicalSpec = null;

    switch (specialistId) {
      case 'viktor-reels':
        try {
          const videoSpecialist = InstagramVideoSpecialist.getInstance();
          const result = await videoSpecialist.processClientMessage(
            message,
            conversationId,
            userId
          );
          
          aiResponseContent = result.response;
          options = result.options;
          technicalSpec = result.technicalSpec;
          
        } catch (error) {
          console.error('Error with Viktor Reels specialist:', error);
          aiResponseContent = 'Привет! Я Viktor Reels, специалист по Instagram видео. Расскажите о вашем проекте - создам крутое видео для вашего бренда! 🎬';
        }
        break;
        
      case 'alex-ai':
        // Fallback for Alex AI - можно добавить специальную логику
        const alexResponses = [
          'Понял! Работаю над вашим запросом. Скоро пришлю варианты 🤖✨',
          'Отличная идея! Уже начинаю работу над концепцией 🎨',
          'Учту все ваши пожелания. В течение часа будет готов первый вариант 📝',
          'Спасибо за уточнения! Это поможет сделать результат еще лучше 👍',
          'Работаю над этим. Покажу несколько вариантов на выбор ⚡',
        ];
        aiResponseContent = alexResponses[Math.floor(Math.random() * alexResponses.length)];
        break;
        
      default:
        aiResponseContent = 'Привет! Я AI специалист, готов помочь с вашим проектом!';
    }

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponseContent,
        options,
        technicalSpec,
        specialistId
      }
    });

  } catch (error: any) {
    console.error('AI Chat Response API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}