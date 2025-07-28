const { Client, Databases, ID } = require('node-appwrite');

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

async function testOrderCreation() {
  try {
    console.log('🧪 Testing order creation...');

    const orderId = ID.unique();
    const now = new Date().toISOString();

    // Create test order
    const order = await databases.createDocument(
      DATABASE_ID,
      'orders',
      orderId,
      {
        userId: 'test_user',
        specialistId: 'alex-ai',
        specialistName: 'Alex AI',
        specialistTitle: 'Full-Stack Developer',
        tariffId: 'premium',
        tariffName: 'Премиум',
        amount: 150,
        conversationId: 'conv_test_123',
        requirements: 'Создать React приложение с современным дизайном',
        timeline: '7 дней',
        createdAt: now,
        updatedAt: now
      }
    );

    console.log('✅ Test order created successfully!');
    console.log('📋 Order details:');
    console.log(`  - ID: ${order.$id}`);
    console.log(`  - Specialist: ${order.specialistName}`);
    console.log(`  - Tariff: ${order.tariffName}`);
    console.log(`  - Amount: $${order.amount}`);
    console.log(`  - Status: ${order.status}`);

    // Test getting orders
    console.log('\n🔍 Testing order retrieval...');
    const orders = await databases.listDocuments(
      DATABASE_ID,
      'orders'
    );

    console.log(`✅ Found ${orders.documents.length} orders`);
    orders.documents.forEach(order => {
      console.log(`  - ${order.specialistName}: $${order.amount} (${order.status})`);
    });

  } catch (error) {
    console.error('❌ Error testing order creation:', error);
  }
}

// Run the test
testOrderCreation(); 