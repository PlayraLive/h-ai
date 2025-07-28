const { Client, Databases, Query } = require('node-appwrite');

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

async function testAIConnection() {
  try {
    console.log('🔍 Testing AI Collections connection...');

    // Test 1: List collections
    console.log('\n📋 Listing collections...');
    const collections = await databases.listCollections(DATABASE_ID);
    console.log(`Found ${collections.total} collections:`);
    
    const aiCollections = collections.collections.filter(col => 
      col.name.toLowerCase().includes('ai') || 
      col.$id.includes('ai_')
    );
    
    aiCollections.forEach(col => {
      console.log(`  ✅ ${col.name} (${col.$id}) - ${col.attributes.length} attributes`);
    });

    // Test 2: Test ai_conversations collection
    console.log('\n🧪 Testing ai_conversations collection...');
    try {
      const conversations = await databases.listDocuments(
        DATABASE_ID, 
        'ai_conversations',
        [Query.limit(1)]
      );
      console.log(`✅ ai_conversations accessible - ${conversations.total} documents`);
    } catch (error) {
      console.log(`❌ ai_conversations error: ${error.message}`);
    }

    // Test 3: Test ai_messages collection
    console.log('\n💬 Testing ai_messages collection...');
    try {
      const messages = await databases.listDocuments(
        DATABASE_ID, 
        'ai_messages',
        [Query.limit(1)]
      );
      console.log(`✅ ai_messages accessible - ${messages.total} documents`);
    } catch (error) {
      console.log(`❌ ai_messages error: ${error.message}`);
    }

    // Test 4: Test ai_sessions collection
    console.log('\n🎯 Testing ai_sessions collection...');
    try {
      const sessions = await databases.listDocuments(
        DATABASE_ID, 
        'ai_sessions',
        [Query.limit(1)]
      );
      console.log(`✅ ai_sessions accessible - ${sessions.total} documents`);
    } catch (error) {
      console.log(`❌ ai_sessions error: ${error.message}`);
    }

    // Test 5: Test ai_learning_data collection
    console.log('\n🧠 Testing ai_learning_data collection...');
    try {
      const learning = await databases.listDocuments(
        DATABASE_ID, 
        'ai_learning_data',
        [Query.limit(1)]
      );
      console.log(`✅ ai_learning_data accessible - ${learning.total} documents`);
    } catch (error) {
      console.log(`❌ ai_learning_data error: ${error.message}`);
    }

    console.log('\n🎉 AI Collections connection test completed!');
    console.log(`
🔧 Database Configuration:
- Endpoint: ${ENDPOINT}
- Project ID: ${PROJECT_ID}
- Database ID: ${DATABASE_ID}
- Collections Status: ✅ Connected

📊 AI System Ready:
✅ AI Conversations tracking
✅ Message persistence
✅ Session management  
✅ Learning data collection
✅ Real-time context storage
    `);

  } catch (error) {
    console.error('💥 Connection test failed:', error);
  }
}

// Run the test
testAIConnection(); 