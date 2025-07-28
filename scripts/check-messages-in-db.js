const { Client, Databases } = require('node-appwrite');

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

async function checkMessages() {
  try {
    console.log('🔍 Checking messages in database...');

    // Получаем все сообщения
    const messages = await databases.listDocuments(DATABASE_ID, 'messages');
    
    console.log(`📊 Total messages: ${messages.documents.length}`);
    
    // Ищем сообщения с типом order_card
    const orderCards = messages.documents.filter(msg => msg.messageType === 'order_card');
    console.log(`🎯 Order card messages: ${orderCards.length}`);
    
    if (orderCards.length > 0) {
      console.log('\n📋 Recent order card messages:');
      orderCards.slice(-3).forEach(msg => {
        console.log(`  • ID: ${msg.$id}`);
        console.log(`    Content: ${msg.content}`);
        console.log(`    Sender: ${msg.senderId}`);
        console.log(`    Receiver: ${msg.receiverId}`);
        console.log(`    ConversationId: ${msg.conversationId}`);
        console.log(`    Created: ${msg.createdAt}`);
        console.log('');
      });
    }

    // Проверяем последние сообщения
    console.log('📝 Latest messages:');
    messages.documents.slice(-5).forEach(msg => {
      console.log(`  • ${msg.messageType || 'text'}: ${msg.content?.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('❌ Error checking messages:', error.message);
  }
}

// Run the check
checkMessages(); 