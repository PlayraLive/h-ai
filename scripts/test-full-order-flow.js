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

async function makeRequest(url, options = {}) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testFullOrderFlow() {
  console.log('🧪 Testing full order flow...\n');
  
  try {
    // Step 1: AI Chat Conversation
    console.log('1️⃣ Testing AI chat conversation...');
    const chatResult = await makeRequest('http://localhost:3000/api/enhanced-ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Мне нужно создать сайт для AI стартапа',
        specialistId: 'alex-ai',
        userId: 'test_full_flow'
      })
    });

    if (!chatResult.success) {
      throw new Error(`AI Chat failed: ${chatResult.error}`);
    }

    console.log('✅ AI Chat working');
    console.log(`   Conversation: ${chatResult.data.conversationId}`);
    console.log(`   Response: ${chatResult.data.message.substring(0, 50)}...`);

    // Step 2: Create Order
    console.log('\n2️⃣ Testing order creation...');
    const orderResult = await makeRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        userId: 'test_full_flow',
        specialistId: 'alex-ai',
        specialistName: 'Alex AI',
        specialistTitle: 'Full-Stack Developer',
        tariffId: 'premium',
        tariffName: 'Премиум',
        amount: 150,
        conversationId: chatResult.data.conversationId,
        requirements: 'AI стартап сайт с современным дизайном'
      })
    });

    if (!orderResult.success) {
      throw new Error(`Order creation failed: ${orderResult.error}`);
    }

    console.log('✅ Order created successfully');
    console.log(`   Order ID: ${orderResult.data.order.$id}`);
    console.log(`   Specialist: ${orderResult.data.order.specialistName}`);
    console.log(`   Amount: $${orderResult.data.order.amount}`);

    // Step 3: Verify order in database
    console.log('\n3️⃣ Verifying order in database...');
    const orders = await databases.listDocuments(DATABASE_ID, 'orders');
    const createdOrder = orders.documents.find(o => o.$id === orderResult.data.order.$id);
    
    if (!createdOrder) {
      throw new Error('Order not found in database');
    }

    console.log('✅ Order verified in database');
    console.log(`   Total orders: ${orders.documents.length}`);

    // Step 4: Test getting user orders
    console.log('\n4️⃣ Testing user orders API...');
    const userOrdersResult = await makeRequest(
      `http://localhost:3000/api/orders?userId=test_full_flow&action=list`
    );

    if (!userOrdersResult.success) {
      throw new Error(`Get user orders failed: ${userOrdersResult.error}`);
    }

    console.log('✅ User orders API working');
    console.log(`   Found ${userOrdersResult.data.orders.length} orders for user`);

    // Step 5: Test AI chat with order context
    console.log('\n5️⃣ Testing AI chat with order context...');
    const contextChatResult = await makeRequest('http://localhost:3000/api/enhanced-ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Какие технологии будем использовать?',
        specialistId: 'alex-ai',
        userId: 'test_full_flow',
        conversationId: chatResult.data.conversationId,
        orderId: orderResult.data.order.$id
      })
    });

    if (!contextChatResult.success) {
      throw new Error(`Context chat failed: ${contextChatResult.error}`);
    }

    console.log('✅ AI chat with order context working');
    console.log(`   Response: ${contextChatResult.data.message.substring(0, 50)}...`);

    console.log('\n🎉 Full order flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • AI Chat: ✅ Working`);
    console.log(`   • Order Creation: ✅ Working`);
    console.log(`   • Database Storage: ✅ Working`);
    console.log(`   • User Orders API: ✅ Working`);
    console.log(`   • Order Context Chat: ✅ Working`);

  } catch (error) {
    console.error('❌ Full order flow test failed:', error.message);
  }
}

// Run the test
testFullOrderFlow(); 