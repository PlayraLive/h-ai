import { AISpecialist } from '@/types';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../appwrite/database';

// Fallback mock data for when database is not available
const mockSpecialists: AISpecialist[] = [
  {
    id: 'alex-ai',
    name: 'Alex AI',
    title: 'AI Avatar Creator',
    description: 'Создаю профессиональные AI аватары для бизнеса, презентаций и брендинга. Использую передовые технологии для создания реалистичных и стильных аватаров.',
    shortDescription: 'Профессиональные AI аватары для бизнеса',
    category: 'Business',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexAI',
    videoUrl: '/videos/specialists/alex-ai-intro.mp4',
    voiceIntro: 'Привет! Я Alex AI. Создаю потрясающие AI аватары для вашего бизнеса. От корпоративных портретов до креативных персонажей - я воплощу ваши идеи в жизнь!',
    skills: ['AI Avatar Generation', 'Business Branding', 'Portrait Creation', 'Character Design'],
    aiProviders: ['openai', 'anthropic'],
    monthlyPrice: 30,
    taskPrice: 5,
    currency: 'USD',
    capabilities: [
      'Корпоративные аватары',
      'Персональные портреты',
      'Брендинг персонажей',
      'Стилизованные изображения',
      'Множественные варианты'
    ],
    deliveryTime: '2-4 часа',
    examples: [
      'Корпоративные LinkedIn аватары',
      'Персонажи для брендинга',
      'Аватары для презентаций'
    ],
    rating: 4.9,
    completedTasks: 847,
    responseTime: '5 минут',
    isActive: true,
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'luna-design',
    name: 'Luna Design',
    title: 'AI Graphic Designer',
    description: 'Специализируюсь на создании логотипов, брендинга и маркетинговых материалов с помощью AI. От концепции до финального дизайна.',
    shortDescription: 'AI дизайн логотипов и брендинга',
    category: 'Design',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LunaDesign',
    videoUrl: '/videos/specialists/luna-design-intro.mp4',
    voiceIntro: 'Привет! Я Luna Design. Создаю потрясающие логотипы и брендинг с помощью AI. Ваш бренд будет выделяться среди конкурентов!',
    skills: ['Logo Design', 'Brand Identity', 'Marketing Materials', 'Print Design'],
    aiProviders: ['openai', 'anthropic'],
    monthlyPrice: 35,
    taskPrice: 8,
    currency: 'USD',
    capabilities: [
      'Логотипы и фирменный стиль',
      'Брендбуки и гайдлайны',
      'Маркетинговые материалы',
      'Упаковка и этикетки',
      'Социальные медиа дизайн'
    ],
    deliveryTime: '1-3 дня',
    examples: [
      'Логотипы для стартапов',
      'Фирменные стили',
      'Маркетинговые буклеты'
    ],
    rating: 4.8,
    completedTasks: 692,
    responseTime: '10 минут',
    isActive: true,
    isPopular: true,
    isFeatured: false
  },
  {
    id: 'viktor-reels',
    name: 'Viktor Reels',
    title: 'AI Reels Creator',
    description: 'Создаю вирусные видео для TikTok, Instagram Reels и YouTube Shorts. AI-генерация контента, который привлекает внимание и набирает просмотры.',
    shortDescription: 'Вирусные AI видео для соцсетей',
    category: 'Content',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ViktorReels',
    videoUrl: '/videos/specialists/viktor-reels-intro.mp4',
    voiceIntro: 'Yo! Я Viktor Reels. Создаю вирусные видео, которые взрывают соцсети! TikTok, Instagram, YouTube - ваш контент будет на топе!',
    skills: ['Video Creation', 'Content Strategy', 'Social Media', 'Viral Marketing'],
    aiProviders: ['openai'],
    monthlyPrice: 25,
    taskPrice: 6,
    currency: 'USD',
    capabilities: [
      'TikTok и Instagram Reels',
      'YouTube Shorts',
      'Вирусный контент',
      'Тренды и хештеги',
      'Монтаж и эффекты'
    ],
    deliveryTime: '1-2 дня',
    examples: [
      'Вирусные TikTok видео',
      'Instagram Reels кампании',
      'YouTube Shorts серии'
    ],
    rating: 4.7,
    completedTasks: 1243,
    responseTime: '15 минут',
    isActive: true,
    isPopular: false,
    isFeatured: true
  },
  {
    id: 'max-bot',
    name: 'Max Bot',
    title: 'AI Telegram Bot Creator',
    description: 'Разрабатываю умных Telegram ботов для автоматизации бизнеса. От простых чат-ботов до сложных систем с AI интеллектом.',
    shortDescription: 'Умные Telegram боты с AI',
    category: 'Development',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxBot',
    videoUrl: '/videos/specialists/max-bot-intro.mp4',
    voiceIntro: 'Привет! Я Max Bot. Программирую умных Telegram ботов, которые экономят ваше время и автоматизируют рутину. Давайте создадим бота для вашего бизнеса!',
    skills: ['Bot Development', 'AI Integration', 'Automation', 'Python'],
    aiProviders: ['openai', 'anthropic', 'grok'],
    monthlyPrice: 40,
    taskPrice: 12,
    currency: 'USD',
    capabilities: [
      'Чат-боты с AI',
      'Автоматизация процессов',
      'Интеграция с сервисами',
      'Аналитика и отчеты',
      'Администрирование групп'
    ],
    deliveryTime: '3-7 дней',
    examples: [
      'Боты для магазинов',
      'Системы поддержки',
      'Автоматизация задач'
    ],
    rating: 4.9,
    completedTasks: 456,
    responseTime: '30 минут',
    isActive: true,
    isPopular: false,
    isFeatured: false
  }
];

// Get all AI specialists from database
export const getAISpecialists = async (): Promise<AISpecialist[]> => {
  try {
    console.log('🔍 Attempting to fetch AI specialists from database...');
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.AI_SPECIALISTS,
      [Query.orderDesc('$createdAt')]
    );
    
    console.log(`✅ Successfully fetched ${response.documents.length} specialists from database`);
    
    const specialists = response.documents.map(doc => ({
      id: doc.$id,
      name: doc.name,
      title: doc.title,
      description: doc.description,
      shortDescription: doc.shortDescription,
      category: doc.category,
      avatar: doc.avatar,
      videoUrl: doc.videoUrl,
      voiceIntro: doc.voiceIntro,
      skills: doc.skills || [],
      aiProviders: doc.aiProviders || [],
      monthlyPrice: doc.monthlyPrice,
      taskPrice: doc.taskPrice,
      currency: 'USD', // Default since not in database
      capabilities: doc.capabilities || [],
      deliveryTime: doc.deliveryTime,
      examples: doc.examples || [],
      rating: 4.8, // Default since not in database
      completedTasks: Math.floor(Math.random() * 2000) + 500, // Random for demo
      responseTime: doc.responseTime,
      isActive: true, // Default since not in database
      isPopular: Math.random() > 0.5, // Random for demo
      isFeatured: Math.random() > 0.7 // Random for demo
    })) as AISpecialist[];

    // If database is empty, use mock data
    if (specialists.length === 0) {
      console.log('⚠️ Database is empty, using fallback mock data');
      return mockSpecialists;
    }

    return specialists;
  } catch (error) {
    console.error('❌ Error fetching AI specialists from database:', error);
    console.log('🔄 Falling back to mock data for better user experience');
    return mockSpecialists;
  }
};

// Get featured specialists for homepage
export const getFeaturedSpecialists = async (limit: number = 4): Promise<AISpecialist[]> => {
  const specialists = await getAISpecialists();
  return specialists
    .filter(specialist => specialist.isFeatured || specialist.isPopular)
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.rating - a.rating;
    })
    .slice(0, limit);
};

// Get specialist by ID
export const getSpecialistById = async (id: string): Promise<AISpecialist | undefined> => {
  try {
    console.log(`🔍 Attempting to fetch specialist with ID: ${id}`);
    
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.AI_SPECIALISTS, id);
    
    console.log(`✅ Successfully fetched specialist: ${doc.name}`);
    
    return {
      id: doc.$id,
      name: doc.name,
      title: doc.title,
      description: doc.description,
      shortDescription: doc.shortDescription,
      category: doc.category,
      avatar: doc.avatar,
      videoUrl: doc.videoUrl,
      voiceIntro: doc.voiceIntro,
      skills: doc.skills || [],
      aiProviders: doc.aiProviders || [],
      monthlyPrice: doc.monthlyPrice,
      taskPrice: doc.taskPrice,
      currency: 'USD',
      capabilities: doc.capabilities || [],
      deliveryTime: doc.deliveryTime,
      examples: doc.examples || [],
      rating: 4.8,
      completedTasks: Math.floor(Math.random() * 2000) + 500,
      responseTime: doc.responseTime,
      isActive: true,
      isPopular: Math.random() > 0.5,
      isFeatured: Math.random() > 0.7
    } as AISpecialist;
  } catch (error) {
    console.error(`❌ Error fetching specialist by ID ${id}:`, error);
    console.log('🔄 Falling back to mock data');
    return mockSpecialists.find(specialist => specialist.id === id);
  }
};

// Get specialists by category
export const getSpecialistsByCategory = async (category: string): Promise<AISpecialist[]> => {
  try {
    console.log(`🔍 Attempting to fetch specialists for category: ${category}`);
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.AI_SPECIALISTS,
      [
        Query.equal('category', category),
        Query.orderDesc('$createdAt')
      ]
    );
    
    console.log(`✅ Successfully fetched ${response.documents.length} specialists for category: ${category}`);
    
    const specialists = response.documents.map(doc => ({
      id: doc.$id,
      name: doc.name,
      title: doc.title,
      description: doc.description,
      shortDescription: doc.shortDescription,
      category: doc.category,
      avatar: doc.avatar,
      videoUrl: doc.videoUrl,
      voiceIntro: doc.voiceIntro,
      skills: doc.skills || [],
      aiProviders: doc.aiProviders || [],
      monthlyPrice: doc.monthlyPrice,
      taskPrice: doc.taskPrice,
      currency: 'USD',
      capabilities: doc.capabilities || [],
      deliveryTime: doc.deliveryTime,
      examples: doc.examples || [],
      rating: 4.8,
      completedTasks: Math.floor(Math.random() * 2000) + 500,
      responseTime: doc.responseTime,
      isActive: true,
      isPopular: Math.random() > 0.5,
      isFeatured: Math.random() > 0.7
    })) as AISpecialist[];

    // If no specialists found in database, filter mock data
    if (specialists.length === 0) {
      console.log(`⚠️ No specialists found in database for category ${category}, using mock data`);
      return mockSpecialists.filter(specialist => specialist.category.toLowerCase() === category.toLowerCase());
    }

    return specialists;
  } catch (error) {
    console.error(`❌ Error fetching specialists by category ${category}:`, error);
    console.log('🔄 Falling back to mock data');
    return mockSpecialists.filter(specialist => specialist.category.toLowerCase() === category.toLowerCase());
  }
}; 