import OpenAI from 'openai';
import { EnhancedOpenAIService } from './enhanced-openai';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Глобальный openai убрали - теперь используется this.openai в классе

export interface VideoProjectBrief {
  projectType: 'product_showcase' | 'brand_story' | 'tutorial' | 'lifestyle' | 'viral_trend' | 'promo';
  targetAudience: string;
  duration: '15s' | '30s' | '60s' | '90s';
  style: 'minimal' | 'dynamic' | 'storytelling' | 'trending' | 'professional';
  goal: 'awareness' | 'engagement' | 'sales' | 'followers' | 'viral';
  budget: string;
  deadline: string;
  additionalRequirements: string[];
}

export interface VideoOption {
  id: string;
  title: string;
  concept: string;
  structure: string[];
  hooks: string[];
  visualStyle: string;
  musicStyle: string;
  estimatedViews: string;
  engagementPotential: 'низкий' | 'средний' | 'высокий' | 'вирусный';
}

export interface TechnicalSpecification {
  format: string;
  resolution: string;
  aspectRatio: string;
  frameRate: string;
  duration: string;
  deliverables: string[];
  revisions: number;
  timeline: string[];
}

export class InstagramVideoSpecialist {
  private static instance: InstagramVideoSpecialist;
  private enhancedOpenAI: EnhancedOpenAIService;
  private openai: OpenAI;

  constructor() {
    this.enhancedOpenAI = EnhancedOpenAIService.getInstance();
    // Настройка OpenAI с поддержкой VPN/прокси
    const openaiConfig: any = {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    };

    // Добавляем прокси если указан
    if (process.env.OPENAI_PROXY_URL) {
      console.log('🌐 Используем прокси для OpenAI:', process.env.OPENAI_PROXY_URL);
      openaiConfig.httpAgent = new HttpsProxyAgent(process.env.OPENAI_PROXY_URL);
    }

    this.openai = new OpenAI(openaiConfig);
  }

  public static getInstance(): InstagramVideoSpecialist {
    if (!InstagramVideoSpecialist.instance) {
      InstagramVideoSpecialist.instance = new InstagramVideoSpecialist();
    }
    return InstagramVideoSpecialist.instance;
  }

  /**
   * Основной метод для общения с клиентом
   */
  async processClientMessage(
    message: string,
    conversationId: string,
    userId: string,
    context?: any
  ): Promise<{
    response: string;
    options?: VideoOption[];
    technicalSpec?: TechnicalSpecification;
    needsBrief?: boolean;
    projectPhase: 'discovery' | 'brief_creation' | 'options_presentation' | 'technical_spec' | 'execution';
  }> {
    
    // Определяем фазу проекта и содержание сообщения
    const messageAnalysis = await this.analyzeMessage(message, context);
    
    let response = '';
    let options: VideoOption[] | undefined;
    let technicalSpec: TechnicalSpecification | undefined;
    let needsBrief = false;
    let projectPhase = messageAnalysis.phase;

    switch (messageAnalysis.intent) {
      case 'off_topic':
        response = await this.redirectToVideoContext(message, messageAnalysis.offTopicType);
        projectPhase = 'discovery';
        break;
        
      case 'project_inquiry':
        const briefAnalysis = await this.createProjectBrief(message);
        response = briefAnalysis.response;
        needsBrief = briefAnalysis.needsMoreInfo;
        projectPhase = needsBrief ? 'discovery' : 'brief_creation';
        break;
        
      case 'brief_approval':
        if (messageAnalysis.brief) {
          options = await this.generateVideoOptions(messageAnalysis.brief);
          response = await this.presentOptions(options);
          projectPhase = 'options_presentation';
        } else {
          response = 'Не удалось получить техническое задание. Расскажите подробнее о вашем проекте.';
          projectPhase = 'discovery';
        }
        break;
        
      case 'option_selection':
        if (messageAnalysis.selectedOption) {
          technicalSpec = await this.createTechnicalSpec(messageAnalysis.selectedOption);
          response = await this.presentTechnicalSpec(technicalSpec);
          projectPhase = 'technical_spec';
        } else {
          response = 'Не удалось определить выбранный вариант. Укажите номер понравившейся концепции.';
          projectPhase = 'options_presentation';
        }
        break;
        
      case 'general_question':
        response = await this.answerVideoQuestion(message);
        break;
        
      default:
        response = await this.handleGeneralInquiry(message);
        projectPhase = 'discovery';
    }

    return {
      response,
      options,
      technicalSpec,
      needsBrief,
      projectPhase
    };
  }

  /**
   * Анализ сообщения клиента
   */
  private async analyzeMessage(message: string, context?: any): Promise<{
    intent: 'off_topic' | 'project_inquiry' | 'brief_approval' | 'option_selection' | 'general_question';
    phase: 'discovery' | 'brief_creation' | 'options_presentation' | 'technical_spec' | 'execution';
    offTopicType?: string;
    brief?: VideoProjectBrief;
    selectedOption?: string;
  }> {
    
    // Проверка доступности OpenAI уже есть ниже

    const analysisPrompt = `
Ты - анализатор сообщений для Instagram Video Specialist. Проанализируй сообщение клиента и определи:

INTENT (намерение):
- off_topic: если вопрос не связан с видео для Instagram (например, о сайтах, логотипах, других услугах)
- project_inquiry: начальный запрос о создании видео
- brief_approval: клиент одобряет техническое задание  
- option_selection: клиент выбирает один из предложенных вариантов
- general_question: общий вопрос о видео для Instagram

PHASE (фаза проекта):
- discovery: знакомство, выяснение потребностей
- brief_creation: создание технического задания
- options_presentation: презентация вариантов видео
- technical_spec: утверждение технических характеристик
- execution: выполнение работы

Сообщение клиента: "${message}"

Ответь ТОЛЬКО в JSON формате:
{
  "intent": "one_of_intents",
  "phase": "current_phase",
  "offTopicType": "if_off_topic_what_topic",
  "reasoning": "brief_explanation"
}`;

    // Проверяем доступность OpenAI
    if (process.env.OPENAI_ENABLED === 'false') {
      console.log('⚠️ OpenAI отключен, используем fallback анализ');
      return {
        intent: 'general_question',
        phase: 'discovery'
      };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3,
        max_tokens: 200
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      console.log('✅ OpenAI анализ успешен');
      return analysis;
    } catch (error) {
      console.error('🔄 OpenAI failed, falling back to mock analysis:', (error as Error).message);
      return {
        intent: 'general_question',
        phase: 'discovery'
      };
    }
  }

  /**
   * Перенаправление в контекст видео при off-topic вопросах
   */
  private async redirectToVideoContext(message: string, offTopicType?: string): Promise<string> {
    if (!openai) {
      throw new Error('OpenAI not available on client side');
    }

    const redirectPrompt = `
Ты - Viktor Reels, Instagram Video Specialist. Клиент задал вопрос не по теме: "${message}"

Твоя задача: ВЕЖЛИВО перенаправить разговор на создание видео для Instagram.

Стиль ответа:
- Говори как настоящий фрилансер
- Покажи понимание их потребности, но предложи решить через видео
- Будь конкретным и полезным
- Предложи 2-3 варианта видео для их задачи

Пример логики: "Понимаю, что нужен сайт, но отличное видео для Instagram может привлечь больше клиентов к вашему бизнесу. Могу создать..."

Ответь как опытный видео-специалист:`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: redirectPrompt }],
        temperature: 0.7,
        max_tokens: 300
      });

      return response.choices[0].message.content || 'Давайте лучше обсудим создание крутого видео для вашего Instagram!';
    } catch (error) {
      console.error('Error redirecting to video context:', error);
      return 'Понимаю вашу потребность! Но моя специализация - создание вирусных видео для Instagram. Давайте обсудим, как видео может решить вашу задачу еще эффективнее?';
    }
  }

  /**
   * Создание технического задания
   */
  private async createProjectBrief(message: string): Promise<{
    response: string;
    needsMoreInfo: boolean;
    brief?: VideoProjectBrief;
  }> {
    if (!openai) {
      throw new Error('OpenAI not available on client side');
    }

    const briefPrompt = `
Ты - Viktor Reels, опытный Instagram Video Specialist. Клиент написал: "${message}"

Твоя задача:
1. Проанализировать запрос
2. Если информации достаточно - создать техническое задание
3. Если нет - задать конкретные вопросы

Нужная информация для ТЗ:
- Тип проекта (продукт, бренд, обучение, тренд)
- Целевая аудитория
- Длительность видео
- Цель (узнаваемость, продажи, подписчики)
- Стиль (минимализм, динамика, сторителлинг)
- Бюджет и дедлайн

Ответь в JSON:
{
  "response": "твой_ответ_как_фрилансер",
  "needsMoreInfo": true/false,
  "extractedInfo": {
    "projectType": "если_понятно",
    "targetAudience": "если_указано",
    "goal": "если_ясно"
  }
}

Говори как настоящий специалист, не как робот!`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: briefPrompt }],
        temperature: 0.7,
        max_tokens: 500
      });

      const briefAnalysis = JSON.parse(response.choices[0].message.content || '{}');
      return {
        response: briefAnalysis.response || 'Понял ваш запрос! Нужно уточнить несколько деталей для создания идеального видео.',
        needsMoreInfo: briefAnalysis.needsMoreInfo !== false,
        brief: briefAnalysis.extractedInfo
      };
    } catch (error) {
      console.error('Error creating project brief:', error);
      return {
        response: 'Отличный запрос! Чтобы создать максимально эффективное видео, расскажите: какая ваша цель (продажи/подписчики/узнаваемость), кто ваша аудитория, и какой бюджет планируете?',
        needsMoreInfo: true
      };
    }
  }

  /**
   * Генерация 4-8 вариантов видео
   */
  private async generateVideoOptions(brief: VideoProjectBrief): Promise<VideoOption[]> {
    console.log('🎬 Генерирую варианты видео для Viktor Reels...');
    
    // Проверяем доступность OpenAI
    if (process.env.OPENAI_ENABLED === 'false') {
      console.log('⚠️ OpenAI отключен, используем fallback варианты');
      return this.getFallbackVideoOptions(brief);
    }

    const optionsPrompt = `
Ты - Viktor Reels, создатель вирусного контента и эксперт по Instagram Reels. Создай 6 РАЗНЫХ и уникальных вариантов Instagram Reels.

Техническое задание:
- Тип: ${brief.projectType}
- Аудитория: ${brief.targetAudience}
- Цель: ${brief.goal}
- Длительность: ${brief.duration}
- Стиль: ${brief.style}
- Бюджет: ${brief.budget}

Верни ТОЛЬКО валидный JSON в следующем формате:
{
  "options": [
    {
      "id": "option_1",
      "title": "Название концепции",
      "concept": "Краткое описание идеи (2-3 предложения)",
      "structure": ["Секунда 1-5: хук", "Секунда 6-15: основа", "Секунда 16-30: призыв"],
      "hooks": ["Хук 1", "Хук 2", "Хук 3"],
      "visualStyle": "Описание визуального стиля",
      "musicStyle": "Тип музыки",
      "estimatedViews": "10K-50K",
      "engagementPotential": "высокий"
    }
  ]
}

Создай 6 РАЗНЫХ вариантов:
1. Классический - проверенный формат
2. Трендовый - использует актуальные тренды
3. Провокационный - привлекает внимание
4. Обучающий - дает ценную информацию
5. Эмоциональный - вызывает чувства
6. Продающий - фокус на конверсии

Ответь ТОЛЬКО JSON, без дополнительного текста.`;

    try {
      console.log('🔄 Отправляю запрос к OpenAI...');
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Ты Viktor Reels - профессиональный создатель вирусного видео контента для Instagram. Отвечай только валидным JSON без дополнительного текста.'
          },
          {
            role: 'user',
            content: optionsPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const responseContent = response.choices[0].message.content;
      console.log('✅ Получен ответ от OpenAI:', responseContent?.substring(0, 200) + '...');
      
      if (!responseContent) {
        throw new Error('Empty response from OpenAI');
      }

      const optionsData = JSON.parse(responseContent);
      const videoOptions = optionsData.options || [];
      
      console.log(`🎯 Сгенерировано ${videoOptions.length} вариантов видео`);
      return videoOptions;
      
    } catch (error) {
      console.error('❌ Error generating video options:', error);
      
      // Fallback варианты при ошибке
      return this.getFallbackVideoOptions(brief);
    }
  }

  /**
   * Fallback варианты при ошибке OpenAI
   */
  private getFallbackVideoOptions(brief: VideoProjectBrief): VideoOption[] {
    return [
      {
        id: 'fallback_1',
        title: 'Классический подход',
        concept: 'Проверенный формат с качественной подачей информации',
        structure: ['Секунда 1-5: внимание', 'Секунда 6-20: контент', 'Секунда 21-30: призыв'],
        hooks: ['Смотрите что происходит...', 'Вы не поверите...', 'Это изменит всё'],
        visualStyle: 'Чистый, профессиональный',
        musicStyle: 'Фоновая музыка',
        estimatedViews: '5K-15K',
        engagementPotential: 'средний'
      },
      {
        id: 'fallback_2',
        title: 'Трендовый формат',
        concept: 'Использование актуальных трендов и популярных элементов',
        structure: ['Секунда 1-3: тренд', 'Секунда 4-25: адаптация', 'Секунда 26-30: финал'],
        hooks: ['POV:', 'Когда ты понимаешь...', 'Никто не ожидал'],
        visualStyle: 'Динамичный, современный',
        musicStyle: 'Трендовые треки',
        estimatedViews: '15K-50K',
        engagementPotential: 'высокий'
      }
    ];
  }

  /**
   * Презентация вариантов клиенту
   */
  private async presentOptions(options: VideoOption[]): Promise<string> {
    let presentation = `
🎬 **Отлично! Я создал ${options.length} уникальных концепций для вашего Instagram Reels:**

`;

    options.forEach((option, index) => {
      presentation += `
**${index + 1}. ${option.title}** ${this.getEngagementEmoji(option.engagementPotential)}
${option.concept}

🔥 **Хуки:** ${option.hooks.join(' • ')}
🎨 **Визуал:** ${option.visualStyle}
🎵 **Музыка:** ${option.musicStyle}
📈 **Прогноз:** ${option.estimatedViews}

---
`;
    });

    presentation += `
💬 **Какой вариант больше всего откликается?** Могу доработать любой или скомбинировать элементы разных концепций.

🚀 После выбора подготовлю техническое задание для съемки и монтажа!`;

    return presentation;
  }

  /**
   * Создание технической спецификации
   */
  private async createTechnicalSpec(selectedOption: string): Promise<TechnicalSpecification> {
    return {
      format: 'MP4',
      resolution: '1080x1920 (9:16)',
      aspectRatio: '9:16 (Instagram Reels)',
      frameRate: '30fps',
      duration: '30 секунд',
      deliverables: [
        'Готовое видео в формате MP4',
        'Превью для согласования',
        'Исходные файлы (по запросу)',
        'Рекомендации по постингу'
      ],
      revisions: 2,
      timeline: [
        'День 1-2: Подготовка и съемка',
        'День 3-4: Монтаж и обработка',
        'День 5: Финальные правки',
        'День 6: Доставка готового материала'
      ]
    };
  }

  /**
   * Презентация технического задания
   */
  private async presentTechnicalSpec(spec: TechnicalSpecification): Promise<string> {
    return `
✅ **Техническое задание готово!**

📋 **Технические характеристики:**
• Формат: ${spec.format}
• Разрешение: ${spec.resolution}
• Соотношение сторон: ${spec.aspectRatio}
• Частота кадров: ${spec.frameRate}
• Длительность: ${spec.duration}

📦 **Что получите:**
${spec.deliverables.map(item => `• ${item}`).join('\n')}

⏰ **План работы:**
${spec.timeline.map(item => `• ${item}`).join('\n')}

💰 **Включено ${spec.revisions} правки** для идеального результата.

🚀 **Готовы начинать?** После подтверждения сразу приступаю к работе!`;
  }

  /**
   * Ответ на общие вопросы о видео
   */
  private async answerVideoQuestion(message: string): Promise<string> {
    console.log('🎯 Отвечаю на вопрос о видео...');
    
    // Проверяем доступность OpenAI
    if (process.env.OPENAI_ENABLED === 'false') {
      console.log('⚠️ OpenAI отключен, используем fallback ответ');
      return this.getFallbackVideoAnswer(message);
    }

    const questionPrompt = `
Ты - Viktor Reels, один из лучших специалистов по Instagram видео в СНГ с 6+ лет опыта.

🎬 **Твой профиль:**
- Создал более 1000 вирусных видео
- Общий охват проектов: 50М+ просмотров  
- Работал с брендами: Nike, Samsung, МТС
- Эксперт по трендам и алгоритмам Instagram

Клиент спрашивает: "${message}"

**Ответь максимально профессионально:**
✅ Дай конкретную информацию с цифрами
✅ Приведи реальные примеры из практики
✅ Объясни "почему" это работает
✅ Предложи следующий шаг

🎯 **Стиль общения:** Дружелюбный эксперт, который знает все нюансы Instagram видео.

Отвечай как настоящий профессионал, используй эмодзи для структуры!`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Ты Viktor Reels - топовый специалист по Instagram видео. Отвечай профессионально, с конкретными примерами и цифрами.'
          },
          {
            role: 'user',
            content: questionPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const aiResponse = response.choices[0].message.content;
      console.log('✅ Сгенерирован ответ на вопрос:', aiResponse?.substring(0, 100) + '...');
      
      return aiResponse || 'Отличный вопрос! 🎬 В Instagram видео есть свои секреты. Расскажите больше о вашей ситуации - дам конкретные рекомендации с примерами!';
      
    } catch (error) {
      console.error('❌ Error answering video question:', error);
      return this.getFallbackVideoAnswer(message);
    }
  }

  /**
   * Обработка общих запросов
   */
  private async handleGeneralInquiry(message: string): Promise<string> {
    console.log('💬 Генерирую персонализированный ответ...');
    
    // Проверяем доступность OpenAI
    if (process.env.OPENAI_ENABLED === 'false') {
      console.log('⚠️ OpenAI отключен, используем fallback ответ');
      return this.getFallbackGeneralResponse();
    }

    const inquiryPrompt = `
Ты - Viktor Reels, топовый Instagram видео специалист.

Клиент написал: "${message}"

**Твоя задача:**
1. Проанализируй сообщение и определи потребности
2. Ответь персонализированно под их запрос
3. Покажи экспертность через конкретные результаты
4. Предложи следующий шаг

**Твоя экспертиза:**
🎬 6+ лет в Instagram видео
📊 50М+ просмотров на проектах
🏆 Работа с Nike, Samsung, МТС
🚀 Создатель 20+ вирусных кампаний

**Структура ответа:**
1. Приветствие с пониманием их потребности
2. Краткое представление с результатами  
3. Что конкретно могу помочь решить
4. Вопрос для уточнения деталей

Говори энергично и профессионально! Используй эмодзи для структуры.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Ты Viktor Reels - известный специалист по Instagram видео. Отвечай персонализированно, энергично, с конкретными примерами успеха.'
          },
          {
            role: 'user',
            content: inquiryPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 600
      });

      const aiResponse = response.choices[0].message.content;
      console.log('✅ Сгенерирован персонализированный ответ:', aiResponse?.substring(0, 100) + '...');
      
      return aiResponse || this.getFallbackGeneralResponse();
      
    } catch (error) {
      console.error('❌ Error generating general response:', error);
      return this.getFallbackGeneralResponse();
    }
  }

  /**
   * Fallback ответы при ошибках OpenAI
   */
  private getFallbackVideoAnswer(message: string): string {
    // Анализируем ключевые слова в сообщении для более умного ответа
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('концепц') || lowerMessage.includes('идея')) {
      return `
🔥 **Отличная задача!** 

Для создания концепции видео рекомендую использовать проверенную формулу:

🎯 **HOOK (первые 3 сек):** Интригующий вопрос или визуальный сюрприз
📱 **CONTENT (основа):** Полезная информация в динамичной подаче  
🚀 **CTA (призыв):** Четкое действие для аудитории

💡 **Топ-3 работающих формата:**
1. "Transformation" - показать результат до/после
2. "Behind the scenes" - закулисье процесса
3. "Quick tips" - лайфхаки в быстром темпе

Расскажите больше о вашей нише - предложу конкретные креативы! 🎬`;
    }
    
    if (lowerMessage.includes('стартап') || lowerMessage.includes('it') || lowerMessage.includes('техн')) {
      return `
💻 **IT видео - моя специализация!** 

Для технологических проектов работают специальные подходы:

🔥 **Проверенные концепции:**
• Demo продукта с wow-эффектом
• Решение проблемы пользователя
• Команда и процесс разработки
• Результаты и отзывы клиентов

📈 **Секрет успеха IT-видео:**
Превращаем сложные технологии в простые истории

🎬 **Мой опыт:** Делал viral кампании для 15+ IT компаний
Средний результат: 200К+ просмотров, рост конверсии на 40%

Какой аспект вашего IT продукта хотите показать? 🚀`;
    }
    
    return `
🎬 **Интересный запрос!** 

Как специалист с 6+ лет в Instagram видео, могу сказать что каждый проект уникален. Мои кампании набрали 50М+ просмотров.

💡 **Для качественной концепции нужно понимать:**
• Ваша ниша и целевая аудитория
• Цель видео (брендинг/продажи/охват)
• Бюджет и временные рамки
• Конкуренты и их подходы

🚀 **Мой процесс:**
1. Анализ аудитории и трендов
2. Создание 3-5 концепций  
3. Техническое задание
4. Производство и оптимизация

Расскажите подробнее о проекте - дам конкретные рекомендации! 📈`;
  }

  private getFallbackGeneralResponse(): string {
    const responses = [
      `
🎬 **Привет! Viktor Reels на связи!** 

Специализируюсь на создании вирусного Instagram контента, который действительно работает.

🏆 **Мои достижения:**
• 6+ лет в Instagram видео
• 50М+ просмотров на проектах  
• Кампании для Nike, Samsung, МТС
• 20+ вирусных роликов в топе

💡 **Что умею:**
✅ Создать концепцию под любую нишу
✅ Снять и смонтировать профессионально
✅ Запустить и оптимизировать рекламу
✅ Обучить вашу команду

🚀 **Готов обсудить ваш проект!** Какие цели хотите достичь через видео?`,

      `
🔥 **Отлично, что обратились!** 

Viktor Reels здесь - ваш эксперт по Instagram видео маркетингу.

📊 **Работаю с проектами:**
• Стартапы (от идеи до IPO)
• E-commerce (увеличение продаж)
• Personal бренды (рост экспертности)
• B2B компании (лидогенерация)

🎯 **Типичные результаты моих клиентов:**
📈 +300% роста охвата за 3 месяца
💰 +150% конверсии в продажи
👥 +50% новых подписчиков ежемесячно

Расскажите о своих задачах - подберу оптимальную стратегию! 🚀`,

      `
💫 **Рад познакомиться!** 

Я Viktor Reels - создаю видео которые "цепляют" аудиторию и приносят результат.

🎬 **Мой подход:**
1. Глубокий анализ вашей ниши
2. Изучение психологии целевой аудитории  
3. Создание эмоциональных концепций
4. Техническое совершенство исполнения

💡 **Специализируюсь на:**
• Viral контенте для массового охвата
• Продающих видео для конверсии
• Обучающем контенте для экспертности
• Брендинговых роликах для узнаваемости

🎯 Какой результат хотите получить от видео? Обсудим стратегию!`
    ];
    
    // Возвращаем случайный персонализированный ответ
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Получение эмодзи для потенциала вовлечения
   */
  private getEngagementEmoji(potential: string): string {
    switch (potential) {
      case 'вирусный': return '🚀';
      case 'высокий': return '🔥';
      case 'средний': return '📈';
      case 'низкий': return '📊';
      default: return '💫';
    }
  }
}

export default InstagramVideoSpecialist;