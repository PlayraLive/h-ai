const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

// Configuration from .env.local
const ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '687759fb003c8bd76b93';
const DATABASE_ID = '687796e3001241f7de17';
const API_KEY = 'standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function createOrderCollections() {
  try {
    console.log('🚀 Creating order collections...');

    // 1. Create 'orders' collection
    console.log('📦 Creating orders collection...');
    try {
      const ordersCollection = await databases.createCollection(
        DATABASE_ID,
        'orders',
        'Orders',
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]
      );
      console.log('✅ Orders collection created:', ordersCollection.$id);
    } catch (error) {
      if (error.code === 409) {
        console.log('📦 Orders collection already exists');
      } else {
        throw error;
      }
    }

    // Add attributes to orders collection
    console.log('📝 Adding attributes to orders collection...');
    const orderAttributes = [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'specialistId', type: 'string', size: 255, required: true },
      { key: 'specialistName', type: 'string', size: 255, required: true },
      { key: 'specialistTitle', type: 'string', size: 255, required: true },
      { key: 'tariffId', type: 'string', size: 255, required: true },
      { key: 'tariffName', type: 'string', size: 255, required: true },
      { key: 'amount', type: 'integer', required: true },
      { key: 'currency', type: 'string', size: 10, required: true, default: 'USD' },
      { key: 'status', type: 'string', size: 50, required: true, default: 'pending' },
      { key: 'conversationId', type: 'string', size: 255, required: true },
      { key: 'messageId', type: 'string', size: 255, required: false },
      { key: 'requirements', type: 'string', size: 10000, required: true },
      { key: 'deliverables', type: 'string', size: 10000, required: false, default: '[]' },
      { key: 'timeline', type: 'string', size: 255, required: false, default: '7 дней' },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ];

    for (const attr of orderAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID, 
            'orders', 
            attr.key, 
            attr.size, 
            attr.required,
            attr.default
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID, 
            'orders', 
            attr.key, 
            attr.required
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID, 
            'orders', 
            attr.key, 
            attr.required
          );
        }
        console.log(`✅ Added ${attr.key} attribute`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`📝 Attribute ${attr.key} already exists`);
        } else {
          console.log(`⚠️ Could not add ${attr.key}:`, error.message);
        }
      }
    }

    // 2. Update messages collection for order cards
    console.log('💬 Updating messages collection for order cards...');
    try {
      await databases.createStringAttribute(
        DATABASE_ID, 
        'messages', 
        'orderData', 
        10000, 
        false
      );
      console.log('✅ Added orderData attribute to messages');
    } catch (error) {
      if (error.code === 409) {
        console.log('💬 orderData attribute already exists in messages');
      } else {
        console.log('⚠️ Could not add orderData to messages:', error.message);
      }
    }

    console.log('🎉 Order collections setup completed!');
    console.log('\n📋 Collections created:');
    console.log('  - orders (for storing order data)');
    console.log('  - messages.orderData (for order cards in chat)');

  } catch (error) {
    console.error('❌ Error creating order collections:', error);
  }
}

// Run the setup
createOrderCollections(); 