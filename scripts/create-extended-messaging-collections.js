const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Обновление коллекции messages для поддержки новых типов
async function updateMessagesCollection() {
  console.log('🔄 Updating messages collection...');
  
  try {
    const MESSAGES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID;
    
    // Добавляем новые атрибуты для расширенных типов сообщений
    const newAttributes = [
      {
        key: 'aiOrderData',
        type: 'string',
        size: 5000,
        required: false,
        default: null
      },
      {
        key: 'jobCardData',
        type: 'string',
        size: 5000,
        required: false,
        default: null
      },
      {
        key: 'solutionCardData',
        type: 'string',
        size: 5000,
        required: false,
        default: null
      },
      {
        key: 'aiBriefData',
        type: 'string',
        size: 10000,
        required: false,
        default: null
      }
    ];

    for (const attr of newAttributes) {
      try {
        await databases.createStringAttribute(
          DATABASE_ID,
          MESSAGES_COLLECTION,
          attr.key,
          attr.size,
          attr.required,
          attr.default
        );
        console.log(`✅ Added attribute: ${attr.key}`);
        
        // Ждем создания атрибута
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code === 409) {
          console.log(`⚠️  Attribute ${attr.key} already exists`);
        } else {
          console.error(`❌ Failed to create attribute ${attr.key}:`, error.message);
        }
      }
    }

    console.log('✅ Messages collection updated successfully!');
  } catch (error) {
    console.error('❌ Error updating messages collection:', error);
  }
}

// Создание коллекции уведомлений
async function createNotificationsCollection() {
  console.log('📱 Creating notifications collection...');
  
  try {
    const NOTIFICATIONS_COLLECTION = 'notifications';
    
    // Создаем коллекцию
    try {
      await databases.createCollection(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION,
        'Notifications'
      );
      console.log('✅ Notifications collection created');
    } catch (error) {
      if (error.code === 409) {
        console.log('⚠️  Notifications collection already exists');
      } else {
        throw error;
      }
    }

    // Атрибуты для уведомлений
    const attributes = [
      { key: 'user_id', type: 'string', size: 36, required: true },
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'message', type: 'string', size: 1000, required: true },
      { key: 'type', type: 'string', size: 50, required: true, default: 'system' },
      { key: 'action_url', type: 'string', size: 500, required: false },
      { key: 'action_text', type: 'string', size: 100, required: false },
      { key: 'metadata', type: 'string', size: 2000, required: false },
      { key: 'channels', type: 'string', size: 200, required: true },
      { key: 'priority', type: 'string', size: 20, required: true, default: 'normal' },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'schedule_at', type: 'datetime', required: false },
      { key: 'expires_at', type: 'datetime', required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'sent_at', type: 'datetime', required: false },
      { key: 'read_at', type: 'datetime', required: false },
      { key: 'clicked_at', type: 'datetime', required: false },
      { key: 'delivery_status', type: 'string', size: 1000, required: false }
    ];

    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION,
            attr.key,
            attr.size,
            attr.required,
            attr.default || null
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION,
            attr.key,
            attr.required,
            attr.default || null
          );
        }
        
        console.log(`✅ Added notification attribute: ${attr.key}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code === 409) {
          console.log(`⚠️  Notification attribute ${attr.key} already exists`);
        } else {
          console.error(`❌ Failed to create notification attribute ${attr.key}:`, error.message);
        }
      }
    }

    // Индексы
    const indexes = [
      { key: 'user_notifications', attributes: ['user_id', 'created_at'] },
      { key: 'unread_notifications', attributes: ['user_id', 'read_at'] },
      { key: 'notification_status', attributes: ['status', 'schedule_at'] }
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          NOTIFICATIONS_COLLECTION,
          index.key,
          'key',
          index.attributes
        );
        console.log(`✅ Created notification index: ${index.key}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`⚠️  Notification index ${index.key} already exists`);
        } else {
          console.error(`❌ Failed to create notification index ${index.key}:`, error.message);
        }
      }
    }

    console.log('✅ Notifications collection setup complete!');
  } catch (error) {
    console.error('❌ Error creating notifications collection:', error);
  }
}

// Обновление коллекции conversations
async function updateConversationsCollection() {
  console.log('💬 Updating conversations collection...');
  
  try {
    const CONVERSATIONS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION_ID;
    
    // Новые атрибуты для расширенной функциональности
    const newAttributes = [
      { key: 'ai_order_id', type: 'string', size: 36, required: false },
      { key: 'job_id', type: 'string', size: 36, required: false },
      { key: 'solution_id', type: 'string', size: 36, required: false },
      { key: 'buyer_id', type: 'string', size: 36, required: false },
      { key: 'seller_id', type: 'string', size: 36, required: false },
      { key: 'conversation_type', type: 'string', size: 20, required: true, default: 'direct' },
      { key: 'title', type: 'string', size: 200, required: false },
      { key: 'context_data', type: 'string', size: 2000, required: false },
      { key: 'is_pinned', type: 'boolean', required: false, default: false },
      { key: 'tags', type: 'string', size: 500, required: false },
      { key: 'last_activity', type: 'datetime', required: true }
    ];

    for (const attr of newAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            CONVERSATIONS_COLLECTION,
            attr.key,
            attr.size,
            attr.required,
            attr.default || null
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            CONVERSATIONS_COLLECTION,
            attr.key,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            CONVERSATIONS_COLLECTION,
            attr.key,
            attr.required,
            attr.default || null
          );
        }
        
        console.log(`✅ Added conversation attribute: ${attr.key}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code === 409) {
          console.log(`⚠️  Conversation attribute ${attr.key} already exists`);
        } else {
          console.error(`❌ Failed to create conversation attribute ${attr.key}:`, error.message);
        }
      }
    }

    console.log('✅ Conversations collection updated successfully!');
  } catch (error) {
    console.error('❌ Error updating conversations collection:', error);
  }
}

// Главная функция
async function main() {
  console.log('🚀 Setting up extended messaging system...');
  console.log('📊 Database ID:', DATABASE_ID);
  
  try {
    await updateMessagesCollection();
    await createNotificationsCollection();
    await updateConversationsCollection();
    
    console.log('\n🎉 Extended messaging system setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env.local with NOTIFICATIONS collection ID');
    console.log('2. Set up Appwrite Functions for email/push notifications');
    console.log('3. Configure Web Push notifications');
    console.log('4. Test the new message types in your application');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  main();
} 