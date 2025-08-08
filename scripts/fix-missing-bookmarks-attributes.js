const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function fixMissingBookmarksAttributes() {
  console.log('🔧 Исправление недостающих атрибутов в коллекции bookmarks...\n');
  
  const missingAttributes = [
    { key: 'user_id', type: 'string', size: 255, required: true },
    { key: 'job_id', type: 'string', size: 255, required: true },
    { key: 'job_title', type: 'string', size: 500, required: true },
    { key: 'job_budget', type: 'string', size: 100, required: false },
    { key: 'job_category', type: 'string', size: 100, required: false },
    { key: 'client_name', type: 'string', size: 255, required: false },
    { key: 'created_at', type: 'string', size: 255, required: false },
  ];

  try {
    // Проверяем существование коллекции bookmarks
    const bookmarksCollection = await databases.listDocuments(DATABASE_ID, 'bookmarks');
    console.log(`✅ Коллекция bookmarks найдена (${bookmarksCollection.documents.length} документов)`);
    
    // Добавляем недостающие атрибуты
    for (const attr of missingAttributes) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Задержка между запросами
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'bookmarks',
            attr.key,
            attr.size,
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
    
    console.log('\n✅ Обновление атрибутов bookmarks завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка работы с коллекцией bookmarks:', error.message);
  }
}

fixMissingBookmarksAttributes().catch(console.error);
