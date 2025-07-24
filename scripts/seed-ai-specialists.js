require('dotenv').config({ path: '.env.local' });
const { Client, Databases, ID } = require('node-appwrite');

// Инициализация клиента
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// AI Specialists Data
const aiSpecialists = [
    {
        name: 'Alex AI',
        title: 'AI Avatar Creator',
        description: 'Создаю профессиональные AI аватары для бизнеса, презентаций и брендинга. Использую передовые технологии для создания реалистичных и стильных аватаров.',
        shortDescription: 'Профессиональные AI аватары для бизнеса',
        category: 'Business',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexAI&backgroundColor=b6e3f4&accessories=eyepatch&clothing=blazerShirt',
        videoUrl: '/videos/specialists/alex-ai-intro.mp4',
        voiceIntro: 'Привет! Я Alex AI. Создаю потрясающие AI аватары для вашего бизнеса. От корпоративных портретов до креативных персонажей - я воплощу ваши идеи в жизнь!',
        skills: ['AI Avatar Generation', 'Business Branding', 'Portrait Creation', 'Character Design'],
        aiProviders: ['openai', 'anthropic'],
        monthlyPrice: 30,
        taskPrice: 5,
        capabilities: [
            'Корпоративные аватары',
            'Персональные портреты',
            'Брендинг персонажей',
            'Стилизованные изображения',
            'Множественные варианты'
        ],
        deliveryTime: '2-4 часа',
        examples: ['Корпоративный портрет CEO', 'Аватар для LinkedIn', 'Персонаж для бренда'],
        responseTime: '< 5 мин'
    },
    {
        name: 'Luna Design',
        title: 'AI Graphic Designer',
        description: 'Профессиональный графический дизайнер с AI. Создаю логотипы, баннеры, презентации и любую графику для вашего проекта.',
        shortDescription: 'Профессиональная графика и дизайн',
        category: 'Design',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LunaDesign&backgroundColor=ffdfbf&clothing=graphic&top=longHair&hairColor=auburn',
        videoUrl: '/videos/specialists/luna-design-intro.mp4',
        voiceIntro: 'Привет! Я Luna Design. Создаю потрясающую графику для вашего бизнеса. Логотипы, баннеры, презентации - всё будет выглядеть профессионально и стильно!',
        skills: ['Graphic Design', 'Logo Creation', 'Banner Design', 'Brand Identity'],
        aiProviders: ['openai', 'anthropic', 'grok'],
        monthlyPrice: 30,
        taskPrice: 5,
        capabilities: [
            'Логотипы и фирменный стиль',
            'Баннеры и реклама',
            'Презентации и слайды',
            'Социальные сети',
            'Печатная продукция'
        ],
        deliveryTime: '1-3 часа',
        examples: ['Логотип IT-компании', 'Баннер для Instagram', 'Корпоративная презентация'],
        responseTime: '< 3 мин'
    },
    {
        name: 'Viktor Reels',
        title: 'AI Reels Creator',
        description: 'Создаю вирусные видео для TikTok, Instagram Reels и YouTube Shorts. От сценария до монтажа - полный цикл производства.',
        shortDescription: 'Вирусные видео для соцсетей',
        category: 'Video',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ViktorReels&backgroundColor=ffd5dc&clothing=hoodie&top=shortHair&hairColor=black&accessories=sunglasses',
        videoUrl: '/videos/specialists/viktor-reels-intro.mp4',
        voiceIntro: 'Yo! Я Viktor Reels! Делаю видео, которые набирают миллионы просмотров. TikTok, Instagram, YouTube - везде будем в топе!',
        skills: ['Video Editing', 'Content Creation', 'Social Media', 'Viral Marketing'],
        aiProviders: ['openai', 'grok'],
        monthlyPrice: 30,
        taskPrice: 5,
        capabilities: [
            'Сценарии для видео',
            'Монтаж и эффекты',
            'Субтитры и текст',
            'Музыка и звук',
            'Оптимизация под платформы'
        ],
        deliveryTime: '4-8 часов',
        examples: ['Viral TikTok о продукте', 'Instagram Reels для бренда', 'YouTube Short обзор'],
        responseTime: '< 10 мин'
    },
    {
        name: 'Max Bot',
        title: 'AI Telegram Bot Creator',
        description: 'Разрабатываю умных Telegram ботов для автоматизации бизнеса. От простых чат-ботов до сложных систем управления.',
        shortDescription: 'Умные Telegram боты',
        category: 'Development',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxBot&backgroundColor=d1f2eb&clothing=shirtVNeck&top=shortHair&hairColor=brown&accessories=prescription02',
        videoUrl: '/videos/specialists/max-bot-intro.mp4',
        voiceIntro: 'Привет! Я Max Bot. Создаю Telegram ботов, которые работают 24/7. Автоматизация заказов, поддержка клиентов, уведомления - всё под ключ!',
        skills: ['Bot Development', 'Automation', 'API Integration', 'Database Management'],
        aiProviders: ['openai', 'anthropic', 'grok'],
        monthlyPrice: 30,
        taskPrice: 5,
        capabilities: [
            'Чат-боты для поддержки',
            'Системы заказов',
            'Уведомления и рассылки',
            'Интеграция с CRM',
            'Аналитика и отчёты'
        ],
        deliveryTime: '8-24 часа',
        examples: ['Бот для ресторана', 'Система записи на услуги', 'Новостной бот'],
        responseTime: '< 20 мин'
    }
];

async function seedAISpecialists() {
    console.log('🤖 Seeding AI Specialists data...\n');
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 
        !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 
        !process.env.APPWRITE_API_KEY ||
        !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
        console.error('❌ Missing required environment variables!');
        process.exit(1);
    }
    
    console.log('📋 Environment variables loaded');
    console.log(`- Database: ${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}\n`);
    
    try {
        // Clear existing specialists (optional)
        console.log('🧹 Clearing existing AI specialists...');
        try {
            const existingSpecialists = await databases.listDocuments(
                DATABASE_ID,
                'ai_specialists'
            );
            
            for (const specialist of existingSpecialists.documents) {
                await databases.deleteDocument(DATABASE_ID, 'ai_specialists', specialist.$id);
            }
            console.log(`✅ Cleared ${existingSpecialists.documents.length} existing specialists\n`);
        } catch (error) {
            console.log('ℹ️ No existing specialists to clear\n');
        }
        
        // Seed new specialists
        console.log('📝 Creating AI specialists...');
        let successCount = 0;
        
        for (const specialist of aiSpecialists) {
            try {
                const document = await databases.createDocument(
                    DATABASE_ID,
                    'ai_specialists',
                    ID.unique(),
                    specialist
                );
                
                console.log(`  ✅ Created: ${specialist.name} (${specialist.title})`);
                successCount++;
                
                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                console.log(`  ❌ Failed to create ${specialist.name}: ${error.message}`);
            }
        }
        
        console.log(`\n🎉 Successfully created ${successCount}/${aiSpecialists.length} AI specialists!`);
        
        if (successCount === aiSpecialists.length) {
            console.log('\n✅ All AI specialists seeded successfully!');
            console.log('\n📋 Next steps:');
            console.log('1. Visit your app homepage to see AI specialists');
            console.log('2. Test ordering functionality');
            console.log('3. Check Appwrite Console for data');
        } else {
            console.log('\n⚠️ Some specialists failed to create. Check the errors above.');
        }
        
    } catch (error) {
        console.error('❌ Error seeding AI specialists:', error.message);
        process.exit(1);
    }
}

// Execute the seeding
seedAISpecialists().catch(console.error); 