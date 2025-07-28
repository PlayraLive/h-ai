const { Client, Databases, Permission, Role, ID } = require('node-appwrite');

// Initialize the Appwrite client
const client = new Client();
const databases = new Databases(client);

// Configuration
const ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '687759fb003c8bd76b93';
const DATABASE_ID = '687796e3001241f7de17';
const API_KEY = 'standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4'; 

client
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

async function setupAICollections() {
  try {
    console.log('🚀 Setting up AI conversation collections...');

    // 1. AI Conversations Collection
    try {
      await databases.createCollection(
        DATABASE_ID,
        'ai_conversations',
        'AI Conversations',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Created ai_conversations collection');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ ai_conversations collection already exists');
      } else {
        console.error('❌ Error creating ai_conversations:', error.message);
      }
    }

    // Add attributes to ai_conversations
    const conversationAttributes = [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'specialistId', type: 'string', size: 255, required: true },
      { key: 'specialistName', type: 'string', size: 255, required: true },
      { key: 'specialistTitle', type: 'string', size: 255, required: true },
      { key: 'conversationType', type: 'string', size: 50, required: true },
      { key: 'orderId', type: 'string', size: 255, required: false },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'context', type: 'string', size: 10000, required: false },
      { key: 'metadata', type: 'string', size: 5000, required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ];

    for (const attr of conversationAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'ai_conversations',
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            'ai_conversations',
            attr.key,
            attr.required
          );
        }
        console.log(`✅ Added ${attr.key} attribute to ai_conversations`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between operations
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ ${attr.key} attribute already exists in ai_conversations`);
        } else {
          console.error(`❌ Error adding ${attr.key} to ai_conversations:`, error.message);
        }
      }
    }

    // 2. AI Messages Collection
    try {
      await databases.createCollection(
        DATABASE_ID,
        'ai_messages',
        'AI Messages',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Created ai_messages collection');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ ai_messages collection already exists');
      } else {
        console.error('❌ Error creating ai_messages:', error.message);
      }
    }

    // Add attributes to ai_messages
    const messageAttributes = [
      { key: 'conversationId', type: 'string', size: 255, required: true },
      { key: 'role', type: 'string', size: 50, required: true },
      { key: 'content', type: 'string', size: 10000, required: true },
      { key: 'messageType', type: 'string', size: 50, required: true },
      { key: 'aiContext', type: 'string', size: 5000, required: false },
      { key: 'userFeedback', type: 'string', size: 2000, required: false },
      { key: 'metadata', type: 'string', size: 2000, required: false },
      { key: 'createdAt', type: 'datetime', required: true }
    ];

    for (const attr of messageAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'ai_messages',
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            'ai_messages',
            attr.key,
            attr.required
          );
        }
        console.log(`✅ Added ${attr.key} attribute to ai_messages`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ ${attr.key} attribute already exists in ai_messages`);
        } else {
          console.error(`❌ Error adding ${attr.key} to ai_messages:`, error.message);
        }
      }
    }

    // 3. AI Sessions Collection
    try {
      await databases.createCollection(
        DATABASE_ID,
        'ai_sessions',
        'AI Sessions',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Created ai_sessions collection');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ ai_sessions collection already exists');
      } else {
        console.error('❌ Error creating ai_sessions:', error.message);
      }
    }

    // Add attributes to ai_sessions
    const sessionAttributes = [
      { key: 'conversationId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'specialistId', type: 'string', size: 255, required: true },
      { key: 'sessionType', type: 'string', size: 100, required: true },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'objectives', type: 'string', size: 5000, required: false },
      { key: 'outcomes', type: 'string', size: 5000, required: false },
      { key: 'nextSteps', type: 'string', size: 3000, required: false },
      { key: 'duration', type: 'integer', required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'completedAt', type: 'datetime', required: false }
    ];

    for (const attr of sessionAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'ai_sessions',
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            'ai_sessions',
            attr.key,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'ai_sessions',
            attr.key,
            attr.required
          );
        }
        console.log(`✅ Added ${attr.key} attribute to ai_sessions`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ ${attr.key} attribute already exists in ai_sessions`);
        } else {
          console.error(`❌ Error adding ${attr.key} to ai_sessions:`, error.message);
        }
      }
    }

    // 4. AI Learning Data Collection
    try {
      await databases.createCollection(
        DATABASE_ID,
        'ai_learning_data',
        'AI Learning Data',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log('✅ Created ai_learning_data collection');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ ai_learning_data collection already exists');
      } else {
        console.error('❌ Error creating ai_learning_data:', error.message);
      }
    }

    // Add attributes to ai_learning_data
    const learningAttributes = [
      { key: 'specialistId', type: 'string', size: 255, required: true },
      { key: 'conversationId', type: 'string', size: 255, required: true },
      { key: 'messageId', type: 'string', size: 255, required: true },
      { key: 'learningType', type: 'string', size: 100, required: true },
      { key: 'originalPrompt', type: 'string', size: 5000, required: true },
      { key: 'aiResponse', type: 'string', size: 5000, required: true },
      { key: 'userFeedback', type: 'string', size: 2000, required: false },
      { key: 'improvementSuggestion', type: 'string', size: 2000, required: false },
      { key: 'contextData', type: 'string', size: 3000, required: false },
      { key: 'confidence', type: 'float', required: true },
      { key: 'createdAt', type: 'datetime', required: true }
    ];

    for (const attr of learningAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'ai_learning_data',
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            'ai_learning_data',
            attr.key,
            attr.required
          );
        } else if (attr.type === 'float') {
          await databases.createFloatAttribute(
            DATABASE_ID,
            'ai_learning_data',
            attr.key,
            attr.required
          );
        }
        console.log(`✅ Added ${attr.key} attribute to ai_learning_data`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ ${attr.key} attribute already exists in ai_learning_data`);
        } else {
          console.error(`❌ Error adding ${attr.key} to ai_learning_data:`, error.message);
        }
      }
    }

    // Create indexes for better performance
    console.log('🔍 Creating indexes...');

    const indexes = [
      { collection: 'ai_conversations', key: 'userId', type: 'key' },
      { collection: 'ai_conversations', key: 'specialistId', type: 'key' },
      { collection: 'ai_messages', key: 'conversationId', type: 'key' },
      { collection: 'ai_sessions', key: 'conversationId', type: 'key' },
      { collection: 'ai_learning_data', key: 'specialistId', type: 'key' }
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          index.collection,
          `${index.key}_index`,
          index.type,
          [index.key]
        );
        console.log(`✅ Created index for ${index.key} in ${index.collection}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ Index for ${index.key} already exists in ${index.collection}`);
        } else {
          console.error(`❌ Error creating index for ${index.key}:`, error.message);
        }
      }
    }

    console.log('🎉 AI Collections setup completed!');
    console.log(`
📊 Created Collections:
- ai_conversations: Store conversation metadata and context
- ai_messages: Store individual messages with AI context
- ai_sessions: Track conversation sessions and objectives  
- ai_learning_data: Store feedback and learning insights

🔧 Features Enabled:
✅ Conversation persistence and restoration
✅ AI learning from user feedback
✅ Contextual memory across sessions
✅ Performance analytics and insights
✅ Self-improving AI responses
✅ Multi-stage conversation tracking
    `);

  } catch (error) {
    console.error('💥 Setup failed:', error);
  }
}

// Run the setup
setupAICollections(); 