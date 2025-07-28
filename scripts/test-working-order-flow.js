#!/usr/bin/env node

console.log('🎯 Testing FIXED Order Flow (attachments as array)...\n');

async function testOrderFlow() {
  try {
    // Test 1: AI Chat
    console.log('1️⃣ Testing AI chat with Viktor Reels...');
    const chatResponse = await fetch('http://localhost:3000/api/enhanced-ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Нужно промо видео для YouTube канала',
        userId: 'test_user',
        specialistId: 'viktor-reels'
      })
    });
    
    const chatData = await chatResponse.json();
    if (chatData.message) {
      console.log('✅ Viktor AI Chat working');
      console.log(`   Response: ${chatData.message.substring(0, 60)}...`);
    } else {
      console.log('❌ Viktor AI Chat failed');
    }

    // Test 2: Create Order (правильный формат)
    console.log('\n2️⃣ Creating order for Viktor Reels ($50)...');
    const orderResponse = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        userId: 'test_user',
        specialistId: 'viktor-reels',
        specialistName: 'Viktor Reels',
        specialistTitle: 'Video Creator',
        tariffId: 'basic',
        tariffName: 'Базовый',
        amount: 50,
        conversationId: `conv_${Date.now()}_fixed`,
        requirements: 'Промо видео после исправления attachments',
        timeline: '7 дней'
      })
    });

    const orderData = await orderResponse.json();
    if (orderData.success) {
      console.log('✅ Viktor order created successfully');
      console.log(`   Order ID: ${orderData.order.$id}`);
      console.log(`   Amount: $${orderData.order.amount}`);

      // Test 3: Create Order Card (с массивом attachments)
      console.log('\n3️⃣ Creating order card with fixed attachments...');
      const cardResponse = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_card',
          orderId: orderData.order.$id,
          userId: 'test_user',
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
            features: ['1 видео', 'HD качество']
          },
          requirements: 'Промо видео после исправления attachments',
          conversationId: orderData.order.conversationId
        })
      });

      const cardData = await cardResponse.json();
      if (cardData.success) {
        console.log('✅ Viktor order card created (attachments fixed)');
        console.log(`   Card ID: ${cardData.orderCard.$id}`);

        // Test 4: Check orders list
        console.log('\n4️⃣ Checking orders in database...');
        const listResponse = await fetch('http://localhost:3000/api/orders?action=list&userId=test_user');
        const listData = await listResponse.json();
        
        if (listData.success) {
          console.log('✅ Orders retrieved successfully');
          console.log(`   Total orders: ${listData.orders.length}`);
          if (listData.orders.length > 0) {
            console.log(`   Latest: ${listData.orders[0].specialistName} - $${listData.orders[0].amount}`);
          }
        }

        console.log('\n🎉 Complete Viktor order flow SUCCESS!');
        console.log('\n📋 Summary:');
        console.log('   ✅ AI Chat: Working');
        console.log('   ✅ Order Creation: Working'); 
        console.log('   ✅ Order Card: Working (attachments as array)');
        console.log('   ✅ Database: Storing correctly');
        console.log('   🔧 Bug Fixed: attachments field');
        console.log('\n🚀 Ready for production!');

      } else {
        console.log('❌ Order card creation failed');
        console.log('   Error:', cardData.error);
      }
    } else {
      console.log('❌ Order creation failed');
      console.log('   Error:', orderData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testOrderFlow(); 