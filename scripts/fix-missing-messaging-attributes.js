const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function fixMissingMessagingAttributes() {
  console.log('🔧 Исправление недостающих атрибутов в коллекциях сообщений...\n');
  
  const collectionsToFix = [
    {
      id: 'ai_conversations',
      name: 'AI Conversations',
      missingAttributes: [
        { key: 'order_id', type: 'string', size: 255, required: false }
      ]
    },
    {
      id: 'conversations',
      name: 'Conversations',
      missingAttributes: [
        { key: 'job_id', type: 'string', size: 255, required: false },
        { key: 'project_id', type: 'string', size: 255, required: false }
      ]
    },
    {
      id: 'messages',
      name: 'Messages',
      missingAttributes: [
        { key: 'jobCardData', type: 'string', size: 5000, required: false },
        { key: 'aiOrderData', type: 'string', size: 5000, required: false },
        { key: 'solutionCardData', type: 'string', size: 5000, required: false },
        { key: 'aiBriefData', type: 'string', size: 5000, required: false },
        { key: 'attachments', type: 'string', size: 2000, required: false }
      ]
    },
    {
      id: 'ai_messages',
      name: 'AI Messages',
      missingAttributes: [
        { key: 'order_data', type: 'string', size: 5000, required: false },
        { key: 'message_type', type: 'string', size: 100, required: false }
      ]
    }
  ];

  for (const collection of collectionsToFix) {
    console.log(`📋 Проверяем коллекцию: ${collection.name}`);
    
    try {
      // Проверяем существование коллекции
      const collectionInfo = await databases.listDocuments(DATABASE_ID, collection.id, []);
      console.log(`✅ Коллекция ${collection.name} найдена (${collectionInfo.documents.length} документов)`);
      
      // Добавляем недостающие атрибуты
      for (const attr of collection.missingAttributes) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Задержка между запросами
          
          if (attr.type === 'string') {
            await databases.createStringAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.size,
              attr.required
            );
          }
          
          console.log(`  ➕ Добавлен атрибут: ${attr.key}`);
        } catch (attrError) {
          if (attrError.message.includes('already exists')) {
            console.log(`  ⚠️ Атрибут ${attr.key} уже существует`);
          } else {
            console.log(`  ❌ Ошибка добавления ${attr.key}: ${attrError.message}`);
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ Ошибка работы с коллекцией ${collection.name}:`, error.message);
    }
    
    console.log(''); // Пустая строка для разделения
  }
  
  console.log('🎉 Исправление атрибутов завершено!');
}

fixMissingMessagingAttributes().catch(console.error); 