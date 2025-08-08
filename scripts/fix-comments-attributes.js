const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function fixCommentsAttributes() {
  console.log('🔧 Исправление атрибутов в коллекции comments...\n');
  
  const missingAttributes = [
    { key: 'job_id', type: 'string', size: 255, required: true },
    { key: 'user_id', type: 'string', size: 255, required: true },
    { key: 'user_name', type: 'string', size: 255, required: true },
    { key: 'user_avatar', type: 'string', size: 500, required: false },
    { key: 'content', type: 'string', size: 2000, required: true },
    { key: 'type', type: 'string', size: 50, required: false, default: 'comment' },
    { key: 'parent_id', type: 'string', size: 255, required: false },
    { key: 'likes', type: 'integer', required: false, min: 0, default: 0 },
    { key: 'dislikes', type: 'integer', required: false, min: 0, default: 0 },
    { key: 'created_at', type: 'datetime', required: true },
    { key: 'updated_at', type: 'datetime', required: false },
  ];

  try {
    // Проверяем существование коллекции comments
    const commentsCollection = await databases.listDocuments(DATABASE_ID, 'comments');
    console.log(`✅ Коллекция comments найдена (${commentsCollection.documents.length} документов)`);
    
    // Добавляем недостающие атрибуты
    for (const attr of missingAttributes) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Задержка между запросами
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'comments',
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'comments',
            attr.key,
            attr.required,
            attr.min
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            'comments',
            attr.key,
            attr.required
          );
        }
        
        console.log(`  ➕ Добавлен атрибут: ${attr.key} (${attr.type})`);
      } catch (attrError) {
        if (attrError.message.includes('already exists')) {
          console.log(`  ⚠️ Атрибут ${attr.key} уже существует`);
        } else if (attrError.message.includes('maximum number')) {
          console.log(`  ⚠️ Достигнут лимит атрибутов для ${attr.key}`);
        } else {
          console.log(`  ❌ Ошибка добавления ${attr.key}: ${attrError.message}`);
        }
      }
    }
    
    console.log('\n✅ Обновление атрибутов comments завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка работы с коллекцией comments:', error.message);
  }
}

fixCommentsAttributes().catch(console.error);
