const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Инициализация клиента
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function setupReelsCollections() {
    try {
        console.log('🚀 Setting up AI Solutions & Reels collections...');

        // 1. Коллекция рилсов
        console.log('📱 Creating reels collection...');
        await databases.createCollection(
            DATABASE_ID,
            'reels',
            'Reels',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        const reelsAttributes = [
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 1000, required: false },
            { key: 'videoUrl', type: 'string', size: 500, required: true },
            { key: 'thumbnailUrl', type: 'string', size: 500, required: false },
            { key: 'category', type: 'string', size: 100, required: true }, // video, website, bot, design
            { key: 'tags', type: 'string', size: 1000, required: false }, // JSON array
            { key: 'creatorId', type: 'string', size: 255, required: true },
            { key: 'creatorName', type: 'string', size: 255, required: true },
            { key: 'isPremium', type: 'boolean', required: false, default: false },
            { key: 'views', type: 'integer', required: false, default: 0 },
            { key: 'likes', type: 'integer', required: false, default: 0 },
            { key: 'rating', type: 'double', required: false, default: 0 },
            { key: 'duration', type: 'integer', required: false }, // seconds
            { key: 'isActive', type: 'boolean', required: false, default: true }
        ];

        for (const attr of reelsAttributes) {
            if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DATABASE_ID,
                    'reels',
                    attr.key,
                    attr.required,
                    attr.default
                );
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DATABASE_ID,
                    'reels',
                    attr.key,
                    attr.required,
                    undefined,
                    undefined,
                    attr.default
                );
            } else if (attr.type === 'double') {
                await databases.createFloatAttribute(
                    DATABASE_ID,
                    'reels',
                    attr.key,
                    attr.required,
                    undefined,
                    undefined,
                    attr.default
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'reels',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default
                );
            }
            console.log(`✅ Added reels attribute: ${attr.key}`);
        }

        // 2. Коллекция готовых пакетов
        console.log('📦 Creating solution packages collection...');
        await databases.createCollection(
            DATABASE_ID,
            'solution_packages',
            'Solution Packages',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        const packagesAttributes = [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 2000, required: true },
            { key: 'category', type: 'string', size: 100, required: true },
            { key: 'features', type: 'string', size: 3000, required: true }, // JSON array
            { key: 'reelId', type: 'string', size: 255, required: false },
            { key: 'freelancerPrice', type: 'double', required: false },
            { key: 'aiServicePrice', type: 'double', required: true },
            { key: 'estimatedTime', type: 'string', size: 100, required: true },
            { key: 'difficulty', type: 'string', size: 50, required: true }, // easy, medium, hard
            { key: 'isPopular', type: 'boolean', required: false, default: false },
            { key: 'createdBy', type: 'string', size: 255, required: true }
        ];

        for (const attr of packagesAttributes) {
            if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DATABASE_ID,
                    'solution_packages',
                    attr.key,
                    attr.required,
                    attr.default
                );
            } else if (attr.type === 'double') {
                await databases.createFloatAttribute(
                    DATABASE_ID,
                    'solution_packages',
                    attr.key,
                    attr.required
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'solution_packages',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default
                );
            }
            console.log(`✅ Added packages attribute: ${attr.key}`);
        }

        // 3. Коллекция настроек фрилансеров
        console.log('⚙️ Creating freelancer setups collection...');
        await databases.createCollection(
            DATABASE_ID,
            'freelancer_setups',
            'Freelancer Setups',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        const setupsAttributes = [
            { key: 'freelancerId', type: 'string', size: 255, required: true },
            { key: 'freelancerName', type: 'string', size: 255, required: true },
            { key: 'serviceTitle', type: 'string', size: 255, required: true },
            { key: 'serviceDescription', type: 'string', size: 2000, required: true },
            { key: 'category', type: 'string', size: 100, required: true },
            { key: 'deliverables', type: 'string', size: 2000, required: true }, // JSON array
            { key: 'price', type: 'double', required: true },
            { key: 'deliveryTime', type: 'string', size: 100, required: true },
            { key: 'revisions', type: 'integer', required: false, default: 3 },
            { key: 'requirements', type: 'string', size: 2000, required: false },
            { key: 'isActive', type: 'boolean', required: false, default: true }
        ];

        for (const attr of setupsAttributes) {
            if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DATABASE_ID,
                    'freelancer_setups',
                    attr.key,
                    attr.required,
                    attr.default
                );
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DATABASE_ID,
                    'freelancer_setups',
                    attr.key,
                    attr.required,
                    undefined,
                    undefined,
                    attr.default
                );
            } else if (attr.type === 'double') {
                await databases.createFloatAttribute(
                    DATABASE_ID,
                    'freelancer_setups',
                    attr.key,
                    attr.required
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'freelancer_setups',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default
                );
            }
            console.log(`✅ Added setups attribute: ${attr.key}`);
        }

        // 4. Коллекция взаимодействий с рилсами
        console.log('❤️ Creating reel interactions collection...');
        await databases.createCollection(
            DATABASE_ID,
            'reel_interactions',
            'Reel Interactions',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        const interactionsAttributes = [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'reelId', type: 'string', size: 255, required: true },
            { key: 'type', type: 'string', size: 50, required: true }, // view, like, save
            { key: 'timestamp', type: 'string', size: 100, required: true }
        ];

        for (const attr of interactionsAttributes) {
            await databases.createStringAttribute(
                DATABASE_ID,
                'reel_interactions',
                attr.key,
                attr.size,
                attr.required
            );
            console.log(`✅ Added interactions attribute: ${attr.key}`);
        }

        // 5. Коллекция пользовательских проектов
        console.log('📁 Creating user projects collection...');
        await databases.createCollection(
            DATABASE_ID,
            'user_projects',
            'User Projects',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        const projectsAttributes = [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 2000, required: false },
            { key: 'category', type: 'string', size: 100, required: true },
            { key: 'status', type: 'string', size: 50, required: true }, // draft, active, completed
            { key: 'addedSolutions', type: 'string', size: 3000, required: false }, // JSON array of reel IDs
            { key: 'customizations', type: 'string', size: 5000, required: false }, // JSON object
            { key: 'isPublic', type: 'boolean', required: false, default: false }
        ];

        for (const attr of projectsAttributes) {
            if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DATABASE_ID,
                    'user_projects',
                    attr.key,
                    attr.required,
                    attr.default
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'user_projects',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default
                );
            }
            console.log(`✅ Added projects attribute: ${attr.key}`);
        }

        // 6. Коллекция заказов AI-сервиса
        console.log('🤖 Creating AI service orders collection...');
        await databases.createCollection(
            DATABASE_ID,
            'ai_service_orders',
            'AI Service Orders',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        const ordersAttributes = [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'reelId', type: 'string', size: 255, required: true },
            { key: 'packageId', type: 'string', size: 255, required: false },
            { key: 'orderType', type: 'string', size: 50, required: true }, // ai_service, freelancer
            { key: 'status', type: 'string', size: 50, required: true }, // pending, processing, completed, failed
            { key: 'requirements', type: 'string', size: 3000, required: false },
            { key: 'customPrompt', type: 'string', size: 2000, required: false },
            { key: 'price', type: 'double', required: true },
            { key: 'paymentStatus', type: 'string', size: 50, required: true }, // pending, paid, refunded
            { key: 'deliverables', type: 'string', size: 3000, required: false }, // JSON array
            { key: 'completedAt', type: 'string', size: 100, required: false }
        ];

        for (const attr of ordersAttributes) {
            if (attr.type === 'double') {
                await databases.createFloatAttribute(
                    DATABASE_ID,
                    'ai_service_orders',
                    attr.key,
                    attr.required
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'ai_service_orders',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default
                );
            }
            console.log(`✅ Added orders attribute: ${attr.key}`);
        }

        console.log('🎉 All AI Solutions & Reels collections created successfully!');

    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ Some collections already exist');
        } else {
            console.error('❌ Error setting up reels collections:', error);
        }
    }
}

// Запуск скрипта
setupReelsCollections();
