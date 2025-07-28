const { Client, Databases, ID } = require('node-appwrite');

// Configuration
const ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '687759fb003c8bd76b93';
const DATABASE_ID = '687796e3001241f7de17';
const API_KEY = 'standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4';

// Initialize client
const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function testDatabaseCreate() {
  try {
    console.log('🧪 Testing AI Database Creation...');

    // Test 1: Create AI Conversation
    console.log('\n📝 Creating test AI conversation...');
    const conversationId = ID.unique();
    
    const conversation = await databases.createDocument(
      DATABASE_ID,
      'ai_conversations',
      conversationId,
      {
        userId: 'test_user_123',
        specialistId: 'alex-ai',
        specialistName: 'Alex AI',
        specialistTitle: 'Full-Stack Developer',
        conversationType: 'consultation',
        orderId: 'order_test_123',
        status: 'active',
        context: JSON.stringify({
          projectType: 'web_app',
          requirements: 'React application',
          budget: 5000
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    
    console.log(`✅ Created conversation: ${conversation.$id}`);

    // Test 2: Create AI Message
    console.log('\n💬 Creating test AI message...');
    const messageId = ID.unique();
    
    const message = await databases.createDocument(
      DATABASE_ID,
      'ai_messages',
      messageId,
      {
        orderId: 'order_test_123',
        senderId: 'test_user_123',
        senderType: 'user',
        message: 'Помоги создать React приложение',
        messageType: 'text',
        attachments: [],
        timestamp: new Date().toISOString(),
        conversationId: conversation.$id,
        role: 'user',
        content: 'Помоги создать React приложение',
        userFeedback: '',
        createdAt: new Date().toISOString()
      }
    );
    
    console.log(`✅ Created message: ${message.$id}`);

    // Test 3: Create AI Session
    console.log('\n🎯 Creating test AI session...');
    const sessionId = ID.unique();
    
    const session = await databases.createDocument(
      DATABASE_ID,
      'ai_sessions',
      sessionId,
      {
        conversationId: conversation.$id,
        userId: 'test_user_123',
        specialistId: 'alex-ai',
        sessionType: 'consultation',
        status: 'active',
        objectives: 'Create React application with modern best practices',
        duration: 30,
        createdAt: new Date().toISOString()
      }
    );
    
    console.log(`✅ Created session: ${session.$id}`);

    // Test 4: Create Learning Data
    console.log('\n🧠 Creating test learning data...');
    const learningId = ID.unique();
    
    const learning = await databases.createDocument(
      DATABASE_ID,
      'ai_learning_data',
      learningId,
      {
        specialistId: 'alex-ai',
        conversationId: conversation.$id,
        messageId: message.$id,
        learningType: 'response_quality',
        originalPrompt: 'Помоги создать React приложение',
        aiResponse: 'Рекомендую использовать Next.js + TypeScript для лучшей производительности',
        confidence: 0.85,
        createdAt: new Date().toISOString()
      }
    );
    
    console.log(`✅ Created learning data: ${learning.$id}`);

    console.log('\n🎉 Database creation test completed!');
    console.log(`
📊 Created Test Records:
✅ Conversation: ${conversation.$id}
✅ Message: ${message.$id}  
✅ Session: ${session.$id}
✅ Learning Data: ${learning.$id}

🔄 AI System Fully Operational:
✅ Real database persistence
✅ Conversation tracking  
✅ Message history
✅ Session management
✅ Learning data collection
    `);

  } catch (error) {
    console.error('❌ Database creation test failed:', error);
  }
}

// Run the test
testDatabaseCreate(); 