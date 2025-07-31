import { NextRequest, NextResponse } from 'next/server';

// Mock AI responses for different specialists
const SPECIALIST_RESPONSES = {
  'alex-ai': {
    name: 'Alex AI',
    responses: [
      'Отличный вопрос о веб-разработке! Для React проекта я рекомендую начать с создания компонентной архитектуры. Какой именно функционал вы планируете реализовать?',
      'Для этой задачи предлагаю использовать современный стек: React + TypeScript + Next.js. Это обеспечит масштабируемость и производительность.',
      'Я помогу вам создать техническую архитектуру. Расскажите подробнее о требованиях к проекту.',
    ],
    suggestions: [
      'Обсудить техническую архитектуру',
      'Выбрать технологический стек',
      'Создать план разработки'
    ]
  },
  'luna-design': {
    name: 'Luna Design',
    responses: [
      'Давайте создадим красивый и удобный дизайн! Расскажите о вашей целевой аудитории и стиле, который вам нравится.',
      'Для современного интерфейса рекомендую минималистичный подход с акцентом на пользовательский опыт. Какие экраны нужно спроектировать?',
      'Отличная идея! Я помогу создать wireframes и UI kit. Есть ли у вас бренд-гайдлайны?',
    ],
    suggestions: [
      'Создать wireframes',
      'Разработать UI kit',
      'Проанализировать пользователей'
    ]
  },
  'viktor-reels': {
    name: 'Viktor Reels',
    responses: [
      'Крутая идея для видео! Давайте создадим захватывающий контент. Какой формат вас интересует - реклама, обучение или развлечение?',
      'Для эффектного видео важен сценарий и визуальная концепция. Расскажите о целях и бюджете проекта.',
      'Отлично! Я помогу с монтажом и анимацией. Какую атмосферу хотите передать зрителям?',
    ],
    suggestions: [
      'Написать сценарий',
      'Выбрать визуальный стиль',
      'Спланировать съемку'
    ]
  },
  'max-bot': {
    name: 'Max Bot',
    responses: [
      'Автоматизация - это мощно! Расскажите, какие процессы хотите автоматизировать. Я создам эффективного бота.',
      'Для вашей задачи подойдет Telegram бот с webhooks. Какой функционал нужно реализовать?',
      'Отличная идея! Автоматизация сэкономит много времени. Давайте определим логику работы бота.',
    ],
    suggestions: [
      'Определить функции бота',
      'Настроить автоматизацию',
      'Создать пользовательские сценарии'
    ]
  },
  'sarah-voice': {
    name: 'Sarah Voice',
    responses: [
      'Голосовые интерфейсы открывают новые возможности! Расскажите о вашей идее голосового взаимодействия.',
      'Для качественного voice UX важна естественность диалога. Какие команды должен понимать ваш помощник?',
      'Замечательно! Голосовые технологии очень перспективны. Планируете интеграцию с умными устройствами?',
    ],
    suggestions: [
      'Спроектировать голосовые команды',
      'Создать диалоговые сценарии',
      'Настроить распознавание речи'
    ]
  },
  'data-analyst-ai': {
    name: 'Data Analyst AI',
    responses: [
      'Анализ данных поможет принимать обоснованные решения! Какие данные у вас есть и какие инсайты нужны?',
      'Отличный вопрос! Для вашей задачи подойдет машинное обучение. Расскажите о целях анализа.',
      'Данные - это новая нефть! Я помогу извлечь ценную информацию. Какие метрики важны для бизнеса?',
    ],
    suggestions: [
      'Проанализировать данные',
      'Создать дашборд',
      'Построить ML модель'
    ]
  },
  'max-powerful': {
    name: 'Max Powerful AI',
    responses: [
      '🚀 Активирован Max Powerful режим! Анализирую вашу задачу с помощью мульти-AI подхода... Готов предоставить супер-решение любой сложности!',
      '⚡ Объединяю знания всех AI систем для создания оптимального решения! Ваша задача требует комплексного подхода - давайте разберем все аспекты.',
      '🧠 Multi-AI анализ завершен! Синтезирую лучшие решения от OpenAI, Anthropic и Grok для максимальной эффективности. Готов к работе!',
    ],
    suggestions: [
      'Получить мульти-AI анализ',
      'Создать комплексную стратегию',
      'Применить передовые методы'
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, specialistId, conversationId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required', success: false },
        { status: 400 }
      );
    }

    console.log('🎭 Mock AI Chat Request:', { message, specialistId });

    // Get specialist data  
    console.log('🔍 Looking for specialist:', specialistId);
    console.log('🔍 Available specialists:', Object.keys(SPECIALIST_RESPONSES));
    
    const specialist = SPECIALIST_RESPONSES[specialistId as keyof typeof SPECIALIST_RESPONSES] || SPECIALIST_RESPONSES['alex-ai'];
    console.log('✅ Mock AI Response generated for', specialist.name);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Select response based on message content
    let selectedResponse: string;
    let suggestions: string[] = specialist.suggestions;
    
    if (message.toLowerCase().includes('помощь') || message.toLowerCase().includes('help')) {
      selectedResponse = specialist.responses[0];
    } else if (message.toLowerCase().includes('создать') || message.toLowerCase().includes('разработ')) {
      selectedResponse = specialist.responses[1];
    } else {
      selectedResponse = specialist.responses[Math.floor(Math.random() * specialist.responses.length)];
    }

    // Add contextual response based on specialist
    if (specialistId === 'max-powerful') {
      selectedResponse += '\n\n📊 **Multi-AI Analysis:**\n- Confidence: 96%\n- Strategy: Hybrid consensus\n- Quality Score: 94/100\n- Processing: OpenAI + Anthropic + Grok synthesis';
      suggestions = [...suggestions, 'Получить детальный анализ', 'Применить AI-стратегию'];
    }

    // Generate response with metadata
    const newConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('✅ Mock AI Response generated for', specialist.name);

    return NextResponse.json({
      success: true,
      message: selectedResponse,
      conversationId: newConversationId,
      messageId: newMessageId,
      suggestions: suggestions,
      nextSteps: [
        'Уточнить требования',
        'Обсудить детали',
        'Приступить к реализации'
      ],
      context: {
        confidence: specialistId === 'max-powerful' ? 0.96 : 0.85 + Math.random() * 0.1,
        processingTime: 1000 + Math.random() * 2000,
        tokensUsed: Math.floor(100 + Math.random() * 200),
        strategy: specialistId === 'max-powerful' ? 'multi_ai_synthesis' : 'specialist_response',
        ...(specialistId === 'max-powerful' && {
          multiAI: {
            breakdown: ['openai', 'anthropic', 'grok'],
            overallQuality: 0.94,
            qualityMetrics: {
              coherence: 0.95,
              relevance: 0.93,
              accuracy: 0.94,
              creativity: 0.94
            }
          }
        })
      }
    });

  } catch (error: any) {
    console.error('❌ Mock AI Error:', error);

    return NextResponse.json(
      { 
        error: 'Mock AI service error',
        success: false,
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required', success: false },
        { status: 400 }
      );
    }

    // Mock conversation restoration
    console.log('🔄 Mock resuming conversation:', conversationId);

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversationId,
        messages: [
          {
            id: 'msg_1',
            role: 'assistant',
            content: 'Добро пожаловать обратно! Продолжим нашу беседу.',
            timestamp: new Date().toISOString()
          }
        ]
      },
      summary: 'Обсуждали разработку проекта и выбор технологий',
      suggestedContinuation: 'Готов продолжить работу над вашим проектом! Есть новые вопросы?'
    });

  } catch (error: any) {
    console.error('❌ Mock Resume Error:', error);
    return NextResponse.json(
      { error: 'Failed to resume conversation', success: false },
      { status: 500 }
    );
  }
} 