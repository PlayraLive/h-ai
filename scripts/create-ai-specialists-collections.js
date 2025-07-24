require('dotenv').config({ path: '.env.local' });
const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

// Инициализация клиента
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// AI Specialists Collections Schema
const aiSpecialistsCollections = [
    {
        collectionId: 'ai_specialists',
        name: 'AI Specialists',
        permissions: [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users())
        ],
        documentSecurity: true,
        enabled: true,
        attributes: [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 2000, required: true },
            { key: 'shortDescription', type: 'string', size: 500, required: true },
            { key: 'category', type: 'string', size: 100, required: true },
            { key: 'avatar', type: 'string', size: 500, required: true },
            { key: 'videoUrl', type: 'string', size: 500, required: false },
            { key: 'voiceIntro', type: 'string', size: 1000, required: true },
            { key: 'skills', type: 'string', size: 100, required: false, array: true },
            { key: 'aiProviders', type: 'string', size: 50, required: false, array: true },
            { key: 'monthlyPrice', type: 'integer', required: true },
            { key: 'taskPrice', type: 'integer', required: true },
            { key: 'currency', type: 'string', size: 10, required: true, default: 'USD' },
            { key: 'capabilities', type: 'string', size: 200, required: false, array: true },
            { key: 'deliveryTime', type: 'string', size: 100, required: true },
            { key: 'examples', type: 'string', size: 200, required: false, array: true },
            { key: 'rating', type: 'double', required: true, default: 4.5 },
            { key: 'completedTasks', type: 'integer', required: true, default: 0 },
            { key: 'responseTime', type: 'string', size: 50, required: true },
            { key: 'isActive', type: 'boolean', required: true, default: true },
            { key: 'isPopular', type: 'boolean', required: true, default: false },
            { key: 'isFeatured', type: 'boolean', required: true, default: false }
        ]
    },
    {
        collectionId: 'ai_orders',
        name: 'AI Orders',
        permissions: [
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users())
        ],
        documentSecurity: true,
        enabled: true,
        attributes: [
            { key: 'specialistId', type: 'string', size: 50, required: true },
            { key: 'clientId', type: 'string', size: 50, required: true },
            { key: 'orderType', type: 'string', size: 20, required: true }, // 'monthly' | 'task'
            { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
            { key: 'taskBrief', type: 'string', size: 1000, required: true },
            { key: 'requirements', type: 'string', size: 200, required: false, array: true },
            { key: 'attachments', type: 'string', size: 500, required: false, array: true },
            { key: 'deadline', type: 'string', size: 50, required: false },
            { key: 'messages', type: 'string', size: 10000, required: false }, // JSON string
            { key: 'deliverables', type: 'string', size: 500, required: false, array: true },
            { key: 'deliveryNotes', type: 'string', size: 2000, required: false },
            { key: 'amount', type: 'double', required: true },
            { key: 'platformFee', type: 'double', required: true },
            { key: 'statusPayment', type: 'string', size: 20, required: true, default: 'pending' },
            { key: 'approvedAt', type: 'datetime', required: false },
            { key: 'completedAt', type: 'datetime', required: false },
            { key: 'clientRating', type: 'integer', required: false },
            { key: 'clientReview', type: 'string', size: 1000, required: false },
            { key: 'timeline', type: 'string', size: 5000, required: false } // JSON string
        ]
    },
    {
        collectionId: 'ai_subscriptions',
        name: 'AI Subscriptions',
        permissions: [
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users())
        ],
        documentSecurity: true,
        enabled: true,
        attributes: [
            { key: 'clientId', type: 'string', size: 50, required: true },
            { key: 'specialistId', type: 'string', size: 50, required: true },
            { key: 'subscriptionType', type: 'string', size: 20, required: true, default: 'monthly' },
            { key: 'status', type: 'string', size: 20, required: true, default: 'active' },
            { key: 'tasksUsed', type: 'integer', required: true, default: 0 },
            { key: 'tasksLimit', type: 'integer', required: true, default: 999 },
            { key: 'amount', type: 'double', required: true },
            { key: 'nextBillingDate', type: 'datetime', required: true },
            { key: 'autoRenew', type: 'boolean', required: true, default: true },
            { key: 'pausedAt', type: 'datetime', required: false },
            { key: 'cancelledAt', type: 'datetime', required: false }
        ]
    },
    {
        collectionId: 'ai_messages',
        name: 'AI Messages',
        permissions: [
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users())
        ],
        documentSecurity: true,
        enabled: true,
        attributes: [
            { key: 'orderId', type: 'string', size: 50, required: true },
            { key: 'senderId', type: 'string', size: 50, required: true },
            { key: 'senderType', type: 'string', size: 20, required: true }, // 'ai' | 'client'
            { key: 'message', type: 'string', size: 2000, required: true },
            { key: 'messageType', type: 'string', size: 20, required: true }, // 'text' | 'file' | 'briefing' | 'progress' | 'approval'
            { key: 'attachments', type: 'string', size: 500, required: false, array: true },
            { key: 'timestamp', type: 'datetime', required: true },
            { key: 'read', type: 'boolean', required: true, default: false }
        ]
    }
];

async function createCollection(collectionData) {
    try {
        console.log(`📁 Creating collection: ${collectionData.name}...`);

        // Create collection
        const collection = await databases.createCollection(
            DATABASE_ID,
            collectionData.collectionId,
            collectionData.name,
            collectionData.permissions,
            collectionData.documentSecurity,
            collectionData.enabled
        );

        console.log(`✅ Collection ${collectionData.name} created with ID: ${collection.$id}`);

        // Add attributes
        for (const attribute of collectionData.attributes) {
            try {
                let result;
                
                switch (attribute.type) {
                    case 'string':
                        result = await databases.createStringAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attribute.key,
                            attribute.size,
                            attribute.required || false,
                            attribute.default,
                            attribute.array || false
                        );
                        break;
                    case 'integer':
                        result = await databases.createIntegerAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attribute.key,
                            attribute.required || false,
                            attribute.min,
                            attribute.max,
                            attribute.default,
                            attribute.array || false
                        );
                        break;
                    case 'double':
                        result = await databases.createFloatAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attribute.key,
                            attribute.required || false,
                            attribute.min,
                            attribute.max,
                            attribute.default,
                            attribute.array || false
                        );
                        break;
                    case 'boolean':
                        result = await databases.createBooleanAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attribute.key,
                            attribute.required || false,
                            attribute.default,
                            attribute.array || false
                        );
                        break;
                    case 'datetime':
                        result = await databases.createDatetimeAttribute(
                            DATABASE_ID,
                            collection.$id,
                            attribute.key,
                            attribute.required || false,
                            attribute.default,
                            attribute.array || false
                        );
                        break;
                    default:
                        console.log(`⚠️ Unknown attribute type: ${attribute.type}`);
                        continue;
                }

                console.log(`  ✓ Added attribute: ${attribute.key} (${attribute.type})`);
                
                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (attributeError) {
                console.log(`  ❌ Failed to add attribute ${attribute.key}: ${attributeError.message}`);
            }
        }

        console.log(`🎉 Collection ${collectionData.name} setup completed!\n`);
        return true;

    } catch (error) {
        console.log(`❌ Failed to create collection ${collectionData.name}: ${error.message}\n`);
        return false;
    }
}

async function setupAISpecialistsCollections() {
    console.log('🚀 Setting up AI Specialists collections in Appwrite...\n');
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 
        !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 
        !process.env.APPWRITE_API_KEY ||
        !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
        console.error('❌ Missing required environment variables!');
        console.log('Required variables:');
        console.log('- NEXT_PUBLIC_APPWRITE_ENDPOINT');
        console.log('- NEXT_PUBLIC_APPWRITE_PROJECT_ID');
        console.log('- APPWRITE_API_KEY');
        console.log('- NEXT_PUBLIC_APPWRITE_DATABASE_ID');
        process.exit(1);
    }
    
    console.log('📋 Environment variables loaded:');
    console.log(`- Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    console.log(`- Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
    console.log(`- Database: ${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}\n`);
    
    // Create all AI specialists collections
    for (const collectionData of aiSpecialistsCollections) {
        await createCollection(collectionData);
    }
    
    console.log('🎉 AI Specialists collections setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Add environment variables for new collections');
    console.log('2. Populate AI specialists data');
    console.log('3. Test the AI specialists functionality');
    console.log('\n📋 Add these to your .env.local:');
    console.log('NEXT_PUBLIC_APPWRITE_AI_SPECIALISTS_COLLECTION_ID=ai_specialists');
    console.log('NEXT_PUBLIC_APPWRITE_AI_ORDERS_COLLECTION_ID=ai_orders');
    console.log('NEXT_PUBLIC_APPWRITE_AI_SUBSCRIPTIONS_COLLECTION_ID=ai_subscriptions');
    console.log('NEXT_PUBLIC_APPWRITE_AI_MESSAGES_COLLECTION_ID=ai_messages');
}

// Execute the setup
setupAISpecialistsCollections().catch(console.error); 