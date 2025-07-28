const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Конфигурация Appwrite
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Недостающие атрибуты для каждой коллекции
const missingAttributes = {
  'applications': [
    { key: 'status', type: 'string', size: 20, required: true, default: 'pending' }
  ],
  'conversations': [
    { key: 'conversation_type', type: 'string', size: 50, required: true, default: 'general' }
  ],
  'messages': [
    { key: 'conversation_id', type: 'string', size: 50, required: true },
    { key: 'sender_id', type: 'string', size: 50, required: true },
    { key: 'message_type', type: 'string', size: 20, required: true, default: 'text' }
  ],
  'notifications': [
    { key: 'status', type: 'string', size: 20, required: true, default: 'unread' }
  ],
  'ai_conversations': [
    { key: 'user_id', type: 'string', size: 50, required: true },
    { key: 'specialist_id', type: 'string', size: 50, required: true },
    { key: 'conversation_type', type: 'string', size: 50, required: true, default: 'consultation' },
    { key: 'context_data', type: 'string', size: 2000, required: false }
  ],
  'ai_messages': [
    { key: 'conversation_id', type: 'string', size: 50, required: true },
    { key: 'sender_id', type: 'string', size: 50, required: true },
    { key: 'message_type', type: 'string', size: 20, required: true, default: 'text' }
  ],
  'orders': [
    { key: 'client_id', type: 'string', size: 50, required: true },
    { key: 'specialist_id', type: 'string', size: 50, required: true },
    { key: 'order_type', type: 'string', size: 30, required: true, default: 'consultation' },
    { key: 'status', type: 'string', size: 20, required: true, default: 'pending' }
  ],
  'portfolio': [
    { key: 'user_id', type: 'string', size: 50, required: true },
    { key: 'tools', type: 'string', size: 100, required: false, array: true }
  ],
  'reviews': [
    { key: 'job_id', type: 'string', size: 50, required: false },
    { key: 'client_id', type: 'string', size: 50, required: true },
    { key: 'freelancer_id', type: 'string', size: 50, required: true }
  ],
  'payments': [
    { key: 'job_id', type: 'string', size: 50, required: false },
    { key: 'client_id', type: 'string', size: 50, required: true },
    { key: 'freelancer_id', type: 'string', size: 50, required: true },
    { key: 'method', type: 'string', size: 50, required: true, default: 'stripe' }
  ]
};

async function addMissingAttributes() {
  console.log('🔧 Adding missing attributes to collections...\n');

  for (const [collectionId, attributes] of Object.entries(missingAttributes)) {
    console.log(`📋 Processing collection: ${collectionId}`);
    
    for (const attr of attributes) {
      try {
        // Создаём атрибут в зависимости от типа
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            collectionId,
            attr.key,
            attr.size,
            attr.required,
            attr.default,
            attr.array || false
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            collectionId,
            attr.key,
            attr.required,
            attr.min,
            attr.max,
            attr.default
          );
        } else if (attr.type === 'double') {
          await databases.createFloatAttribute(
            DATABASE_ID,
            collectionId,
            attr.key,
            attr.required,
            attr.min,
            attr.max,
            attr.default
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            collectionId,
            attr.key,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            collectionId,
            attr.key,
            attr.required,
            attr.default
          );
        }

        console.log(`  ✅ Added attribute: ${attr.key} (${attr.type})`);
        
        // Небольшая задержка между созданием атрибутов
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        if (error.code === 409) {
          console.log(`  ⚠️  Attribute ${attr.key} already exists`);
        } else {
          console.error(`  ❌ Error adding attribute ${attr.key}:`, error.message);
        }
      }
    }
    
    console.log(`📋 Completed collection: ${collectionId}\n`);
  }

  console.log('✅ All missing attributes have been processed!');
  console.log('\n📊 Summary:');
  console.log('  - Updated collections with missing attributes');
  console.log('  - Fixed compatibility issues');
  console.log('  - Ensured proper data structure');
  console.log('\n🚀 Your dashboard should now work with real data!');
}

// Запуск скрипта
addMissingAttributes().catch(console.error); 