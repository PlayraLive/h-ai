const { Client, Databases, ID } = require('node-appwrite');

// Production Appwrite configuration
// Note: You need to set these environment variables for production deployment
const client = new Client()
    .setEndpoint(process.env.PRODUCTION_APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.PRODUCTION_APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.PRODUCTION_APPWRITE_API_KEY || process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.PRODUCTION_APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// AI Specialists Data for Production
const aiSpecialists = [
    {
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
        responseTime: '5 минут',
    },
    {
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
        responseTime: '10 минут',
    },
    {
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
        responseTime: '15 минут',
    },
    {
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
        responseTime: '30 минут',
    }
];

async function deployAISpecialists() {
    console.log('🚀 Deploying AI Specialists to Production...\n');
    
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 
        !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 
        !process.env.APPWRITE_API_KEY ||
        !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
        console.error('❌ Missing required environment variables!');
        console.log('Required for production deployment:');
        console.log('- NEXT_PUBLIC_APPWRITE_ENDPOINT');
        console.log('- NEXT_PUBLIC_APPWRITE_PROJECT_ID');
        console.log('- APPWRITE_API_KEY (with proper permissions)');
        console.log('- NEXT_PUBLIC_APPWRITE_DATABASE_ID');
        process.exit(1);
    }
    
    console.log('📋 Environment variables loaded:');
    console.log(`- Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    console.log(`- Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
    console.log(`- Database: ${DATABASE_ID}\n`);
    
    try {
        // Test connection
        console.log('🔗 Testing Appwrite connection...');
        await databases.get(DATABASE_ID);
        console.log('✅ Connection successful\n');
        
        // Check if collection exists
        console.log('📊 Checking AI Specialists collection...');
        try {
            const existingSpecialists = await databases.listDocuments(
                DATABASE_ID,
                'ai_specialists'
            );
            
            console.log(`📋 Found ${existingSpecialists.documents.length} existing specialists`);
            
            if (existingSpecialists.documents.length > 0) {
                console.log('🧹 Clearing existing specialists for fresh deployment...');
                for (const specialist of existingSpecialists.documents) {
                    await databases.deleteDocument(DATABASE_ID, 'ai_specialists', specialist.$id);
                    console.log(`  🗑️ Deleted: ${specialist.name}`);
                }
                console.log('✅ Cleanup completed\n');
            }
        } catch (error) {
            console.log('⚠️ Collection might not exist or be empty, proceeding with creation...\n');
        }
        
        // Deploy specialists
        console.log('📝 Deploying AI specialists...');
        let successCount = 0;
        
        for (const specialist of aiSpecialists) {
            try {
                const document = await databases.createDocument(
                    DATABASE_ID,
                    'ai_specialists',
                    ID.unique(),
                    specialist
                );
                
                console.log(`  ✅ Deployed: ${specialist.name} (${specialist.title})`);
                successCount++;
                
                // Delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.log(`  ❌ Failed to deploy ${specialist.name}: ${error.message}`);
                console.log(`     Check collection exists and has proper permissions`);
            }
        }
        
        console.log(`\n🎉 Deployment completed: ${successCount}/${aiSpecialists.length} specialists deployed!`);
        
        if (successCount === aiSpecialists.length) {
            console.log('\n✅ Production AI Specialists deployment successful!');
            console.log('\n📋 Next steps:');
            console.log('1. Visit your production website');
            console.log('2. Verify AI specialists are visible');
            console.log('3. Test ordering functionality');
            console.log('4. Monitor logs for any issues');
        } else {
            console.log('\n⚠️ Partial deployment. Some specialists failed to deploy.');
            console.log('Check error messages above and verify:');
            console.log('- Collection permissions are correct');
            console.log('- API key has proper rights');
            console.log('- Database structure matches schema');
        }
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Verify Appwrite credentials are correct');
        console.log('2. Check database and collection exist');
        console.log('3. Ensure API key has proper permissions');
        console.log('4. Verify network connectivity');
        process.exit(1);
    }
}

// Run deployment
if (require.main === module) {
    deployAISpecialists();
}

module.exports = { deployAISpecialists }; 