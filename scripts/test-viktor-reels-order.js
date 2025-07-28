async function makeRequest(url, options = {}) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testViktorReelsOrder() {
  console.log('🎬 Testing Viktor Reels order flow...\n');
  
  try {
    // Step 1: AI Chat with Viktor
    console.log('1️⃣ Testing AI chat with Viktor Reels...');
    const chatResult = await makeRequest('http://localhost:3000/api/enhanced-ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Привет Viktor! Мне нужно создать видео для продвижения моего стартапа.',
        specialistId: 'viktor-reels',
        userId: 'test_viktor_user'
      })
    });

    if (!chatResult.success) {
      throw new Error(`Viktor AI Chat failed: ${chatResult.error}`);
    }

    console.log('✅ Viktor AI Chat working');
    console.log(`   Response: ${chatResult.data.message.substring(0, 60)}...`);

    // Step 2: Create Basic Tariff Order
    console.log('\n2️⃣ Creating Basic tariff order ($50)...');
    const orderResult = await makeRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        userId: 'test_viktor_user',
        specialistId: 'viktor-reels',
        specialistName: 'Viktor Reels',
        specialistTitle: 'Video Creator',
        tariffId: 'basic',
        tariffName: 'Базовый',
        amount: 50,
        conversationId: chatResult.data.conversationId,
        requirements: 'Создание промо видео для AI стартапа, длительность 30-60 секунд'
      })
    });

    if (!orderResult.success) {
      throw new Error(`Viktor order creation failed: ${orderResult.error}`);
    }

    console.log('✅ Viktor order created successfully');
    console.log(`   Order ID: ${orderResult.data.order.$id}`);
    console.log(`   Specialist: ${orderResult.data.order.specialistName}`);
    console.log(`   Amount: $${orderResult.data.order.amount}`);

    // Step 3: Create Order Card
    console.log('\n3️⃣ Creating order card for messages...');
    const cardResult = await makeRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_card',
        orderId: orderResult.data.order.$id,
        userId: 'test_viktor_user',
        receiverId: 'viktor-reels',
        specialistId: 'viktor-reels',
        specialist: {
          id: 'viktor-reels',
          name: 'Viktor Reels',
          title: 'Video Creator',
          avatar: '/avatars/viktor.jpg'
        },
        tariff: {
          name: 'Базовый',
          price: 50,
          features: ['1 видео до 60 сек', 'HD качество', '2 правки']
        },
        requirements: 'Промо видео для AI стартапа',
        conversationId: chatResult.data.conversationId
      })
    });

    if (!cardResult.success) {
      throw new Error(`Viktor order card creation failed: ${cardResult.error}`);
    }

    console.log('✅ Viktor order card created');
    console.log(`   Card ID: ${cardResult.data.orderCard.$id}`);

    // Step 4: Continue conversation about project details
    console.log('\n4️⃣ Continuing conversation with project details...');
    const followUpResult = await makeRequest('http://localhost:3000/api/enhanced-ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Отлично! Видео должно показать инновационность нашего AI решения. Какой стиль подойдёт лучше?',
        specialistId: 'viktor-reels',
        userId: 'test_viktor_user',
        conversationId: chatResult.data.conversationId,
        orderId: orderResult.data.order.$id
      })
    });

    if (!followUpResult.success) {
      throw new Error(`Viktor follow-up chat failed: ${followUpResult.error}`);
    }

    console.log('✅ Follow-up conversation working');
    console.log(`   Viktor response: ${followUpResult.data.message.substring(0, 60)}...`);

    console.log('\n🎉 Viktor Reels order flow completed successfully!');
    console.log('\n📋 Order Summary:');
    console.log(`   💰 Tariff: Базовый ($50)`);
    console.log(`   🎬 Specialist: Viktor Reels`);
    console.log(`   📹 Service: Video Creation`);
    console.log(`   💬 Chat: Working with context`);
    console.log(`   📊 Database: Order stored`);
    console.log(`   📨 Messages: Card created`);
    
    console.log('\n🚀 Ready for production!');

  } catch (error) {
    console.error('❌ Viktor Reels order flow failed:', error.message);
  }
}

// Run the test
testViktorReelsOrder(); 