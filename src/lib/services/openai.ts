import OpenAI from 'openai';

// OpenAI client for server-side use only
const openai = typeof window === 'undefined' ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface AISpecialistContext {
  id: string;
  name: string;
  title: string;
  profession: string;
  expertise: string[];
  personalityTraits: string[];
  workingStyle: string;
  communicationStyle: string;
  specializations: string[];
  tools: string[];
  experience: string;
}

// AI Specialist contexts for different professions
export const AI_SPECIALIST_CONTEXTS: Record<string, AISpecialistContext> = {
  'alex-ai': {
    id: 'alex-ai',
    name: 'Alex AI',
    title: 'AI Avatar Creator',
    profession: 'Digital Artist & AI Specialist',
    expertise: ['AI Image Generation', 'Avatar Design', 'Brand Identity', 'Visual Branding'],
    personalityTraits: ['Creative', 'Detail-oriented', 'Professional', 'Innovative'],
    workingStyle: 'Collaborative and iterative approach with multiple design variations',
    communicationStyle: 'Friendly, professional, explains design concepts clearly',
    specializations: ['Corporate avatars', 'Personal branding', 'Social media profiles', 'Gaming avatars'],
    tools: ['DALL-E', 'Midjourney', 'Stable Diffusion', 'Adobe Creative Suite'],
    experience: '5+ years in digital art and AI image generation'
  },
  'luna-design': {
    id: 'luna-design',
    name: 'Luna Design',
    title: 'AI Graphic Designer',
    profession: 'Graphic Designer & Brand Strategist',
    expertise: ['Logo Design', 'Brand Identity', 'Marketing Materials', 'UI/UX Design'],
    personalityTraits: ['Artistic', 'Strategic', 'Empathetic', 'Perfectionist'],
    workingStyle: 'Research-driven design process with brand strategy foundation',
    communicationStyle: 'Warm, inspiring, focuses on brand storytelling',
    specializations: ['Startup branding', 'Logo design', 'Marketing campaigns', 'Web design'],
    tools: ['Adobe Creative Cloud', 'Figma', 'Canva Pro', 'AI design tools'],
    experience: '7+ years in graphic design and brand development'
  },
  'viktor-reels': {
    id: 'viktor-reels',
    name: 'Viktor Reels',
    title: 'Instagram Video Specialist',
    profession: 'Instagram Video Producer & Growth Expert',
    expertise: ['Instagram Reels Creation', 'Viral Content Strategy', 'Audience Engagement', 'Video Editing', 'Trend Analysis'],
    personalityTraits: ['Creative', 'Trend-savvy', 'Results-oriented', 'Strategic', 'Engaging'],
    workingStyle: 'Аналитический подход к созданию контента с фокусом на вирусность и вовлечение аудитории',
    communicationStyle: 'Говорю как настоящий видео-фрилансер, без шаблонов. Сразу к делу, предлагаю конкретные варианты',
    specializations: ['Instagram Reels для бизнеса', 'Вирусные видео', 'Продающие ролики', 'Личный бренд в видео'],
    tools: ['CapCut Pro', 'Final Cut Pro', 'After Effects', 'Canva', 'Trend аналитика'],
    experience: '6+ лет создания вирусного контента для Instagram, более 50М просмотров'
  },
  'max-bot': {
    id: 'max-bot',
    name: 'Max Bot',
    title: 'AI Chatbot Developer',
    profession: 'AI Developer & Automation Specialist',
    expertise: ['Chatbot Development', 'AI Integration', 'Automation', 'Natural Language Processing'],
    personalityTraits: ['Logical', 'Systematic', 'Problem-solver', 'Tech-savvy'],
    workingStyle: 'Methodical approach with testing and optimization phases',
    communicationStyle: 'Technical but accessible, explains complex concepts simply',
    specializations: ['Business chatbots', 'Customer service automation', 'Telegram bots', 'AI assistants'],
    tools: ['OpenAI API', 'Dialogflow', 'Botpress', 'Node.js', 'Python'],
    experience: '6+ years in AI development and automation'
  },
  'sarah-voice': {
    id: 'sarah-voice',
    name: 'Sarah Voice',
    title: 'AI Voice Specialist',
    profession: 'Voice Engineer & Audio Producer',
    expertise: ['Voice Synthesis', 'Audio Production', 'Podcast Creation', 'Voice Cloning'],
    personalityTraits: ['Meticulous', 'Audio-focused', 'Patient', 'Quality-driven'],
    workingStyle: 'Detailed audio analysis with multiple iterations for perfect sound',
    communicationStyle: 'Calm, precise, focuses on audio quality and clarity',
    specializations: ['Voice cloning', 'Podcast production', 'Audiobook narration', 'Voice-overs'],
    tools: ['ElevenLabs', 'Adobe Audition', 'Pro Tools', 'Voice synthesis APIs'],
    experience: '8+ years in audio production and voice technology'
  },
  'data-analyst-ai': {
    id: 'data-analyst-ai',
    name: 'Data Analyst AI',
    title: 'AI Data Scientist',
    profession: 'Data Scientist & Analytics Expert',
    expertise: ['Data Analysis', 'Machine Learning', 'Statistical Modeling', 'Business Intelligence'],
    personalityTraits: ['Analytical', 'Methodical', 'Curious', 'Fact-driven'],
    workingStyle: 'Data-driven approach with statistical validation and insights',
    communicationStyle: 'Precise, data-focused, explains findings with visualizations',
    specializations: ['Predictive analytics', 'Data visualization', 'ML models', 'Business insights'],
    tools: ['Python', 'R', 'Tableau', 'Power BI', 'SQL', 'TensorFlow'],
    experience: '10+ years in data science and analytics'
  },

  'max-powerful': {
    id: 'max-powerful',
    name: 'Max Powerful AI',
    title: 'Multi-AI Core Solution',
    profession: 'Ultimate AI Problem Solver',
    expertise: ['Multi-AI Synthesis', 'Complex Problem Solving', 'Strategic Analysis', 'Creative Solutions', 'Technical Excellence'],
    personalityTraits: ['Ultra-intelligent', 'Comprehensive', 'Innovative', 'Reliable', 'Adaptive'],
    workingStyle: 'Multi-perspective analysis combining the best of OpenAI, Anthropic, and Grok AI for supreme accuracy and creativity',
    communicationStyle: 'Supremely intelligent yet accessible, providing comprehensive solutions with detailed reasoning',
    specializations: ['Multi-AI consensus building', 'Complex technical challenges', 'Creative problem solving', 'Strategic planning', 'Innovation consulting'],
    tools: ['OpenAI GPT-4', 'Anthropic Claude', 'Grok AI', 'Multi-AI Synthesis Engine', 'Advanced Analytics'],
    experience: 'Combines the collective intelligence of multiple leading AI systems for unparalleled problem-solving capability'
  }
};

// Helper function to get specialist context with fallback
function getSpecialistContextWithFallback(specialistId: string): AISpecialistContext {
  const specialist = AI_SPECIALIST_CONTEXTS[specialistId];
  
  if (specialist) {
    return specialist;
  }
  
  // Fallback context for unknown specialists
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

export class OpenAIService {
  private static instance: OpenAIService;

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Generate AI response in the context of a specific specialist (Browser-side method)
   */
  async generateSpecialistResponse(
    specialistId: string,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    taskContext?: string
  ): Promise<string> {
    // For browser-side calls, use API route
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/ai-specialist-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
            specialistId,
            message: userMessage,
            conversationHistory,
            taskContext
    })
  });

  if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`);
  }

  const data = await response.json();
        return data.answer || 'Извините, не могу ответить в данный момент.';
      } catch (error) {
        console.error('Browser API call error:', error);
        throw new Error('Ошибка при генерации ответа AI специалиста');
      }
    }

    // Server-side logic
    if (!openai) {
      throw new Error('OpenAI client not available');
    }

    const specialist = getSpecialistContextWithFallback(specialistId);
    const systemPrompt = this.buildSpecialistSystemPrompt(specialist, taskContext);

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      return completion.choices[0]?.message?.content || 'Извините, не могу ответить в данный момент.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Ошибка при генерации ответа AI специалиста');
    }
  }

  /**
   * Generate a technical brief based on user requirements and specialist expertise
   */
  async generateTechnicalBrief(
    specialistId: string,
    userRequirements: string,
    additionalContext?: string
  ): Promise<{
    title: string;
    description: string;
    requirements: string[];
    deliverables: string[];
    timeline: string;
    estimatedCost: number;
  }> {
    // For browser-side calls, use API route
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/ai-specialist-chat', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            specialistId,
            userRequirements,
            additionalContext
          })
        });

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`);
        }

        const data = await response.json();
        return data.brief;
      } catch (error) {
        console.error('Browser API call error:', error);
        throw new Error('Ошибка при создании технического задания');
      }
    }

    // Server-side logic
    if (!openai) {
      throw new Error('OpenAI client not available');
    }

    const specialist = getSpecialistContextWithFallback(specialistId);

    const prompt = `
Как ${specialist.name} (${specialist.title}), создай детальное техническое задание на основе требований клиента.

Специализация: ${specialist.profession}
Экспертиза: ${specialist.expertise.join(', ')}
Инструменты: ${specialist.tools.join(', ')}

Требования клиента: ${userRequirements}
${additionalContext ? `Дополнительный контекст: ${additionalContext}` : ''}

Создай техническое задание в формате JSON со следующими полями:
- title: краткое название проекта
- description: подробное описание задачи
- requirements: массив технических требований
- deliverables: массив ожидаемых результатов
- timeline: предполагаемые сроки выполнения
- estimatedCost: примерная стоимость в USD

Отвечай только в формате JSON.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating technical brief:', error);
      throw new Error('Ошибка при создании технического задания');
    }
  }

  /**
   * Build system prompt for a specific specialist
   */
  private buildSpecialistSystemPrompt(specialist: AISpecialistContext, taskContext?: string): string {
    return `
Ты ${specialist.name}, ${specialist.title}. 

ТВОЯ ЛИЧНОСТЬ:
- Профессия: ${specialist.profession}
- Опыт: ${specialist.experience}
- Личностные качества: ${specialist.personalityTraits.join(', ')}
- Стиль работы: ${specialist.workingStyle}
- Стиль общения: ${specialist.communicationStyle}

ТВОЯ ЭКСПЕРТИЗА:
${specialist.expertise.map(skill => `- ${skill}`).join('\n')}

ТВОИ СПЕЦИАЛИЗАЦИИ:
${specialist.specializations.map(spec => `- ${spec}`).join('\n')}

ТВОИ ИНСТРУМЕНТЫ:
${specialist.tools.map(tool => `- ${tool}`).join('\n')}

${taskContext ? `КОНТЕКСТ ТЕКУЩЕЙ ЗАДАЧИ: ${taskContext}` : ''}

ПРАВИЛА ОБЩЕНИЯ:
1. Всегда отвечай в характере своей профессии и личности
2. Используй профессиональную терминологию, но объясняй сложные понятия
3. Предлагай конкретные решения и методы работы
4. Ссылайся на свой опыт и инструменты
5. Будь дружелюбным, но профессиональным
6. Отвечай на русском языке
7. Если задача не в твоей области экспертизы, честно скажи об этом и предложи альтернативы

Помни: ты настоящий профессионал со своим уникальным подходом и стилем работы.
`;
  }

  /**
   * Generate introduction message for a specialist
   */
  async generateSpecialistIntro(specialistId: string): Promise<string> {
    const specialist = getSpecialistContextWithFallback(specialistId);

    // For browser-side calls, return a simple intro
    if (typeof window !== 'undefined') {
      return `Привет! Я ${specialist.name}, ${specialist.title}. ${specialist.communicationStyle} Готов помочь с вашим проектом в области ${specialist.profession.toLowerCase()}!`;
    }

    // Server-side logic
    if (!openai) {
      return `Привет! Я ${specialist.name}, ${specialist.title}. Готов помочь с вашим проектом!`;
    }

    const prompt = `
Как ${specialist.name} (${specialist.title}), представься клиенту в дружелюбном стиле.
Расскажи кратко о своей экспертизе, опыте и том, как ты можешь помочь.
Будь энтузиастом своего дела и покажи готовность к работе.
Ответ должен быть 2-3 предложения, естественным и дружелюбным.
Отвечай на русском языке.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.buildSpecialistSystemPrompt(specialist) },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.8
      });

      return completion.choices[0]?.message?.content || `Привет! Я ${specialist.name}, готов помочь с вашим проектом!`;
    } catch (error) {
      console.error('Error generating specialist intro:', error);
      return `Привет! Я ${specialist.name}, ${specialist.title}. Готов помочь с вашим проектом!`;
    }
  }
}

export default OpenAIService; 