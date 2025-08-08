const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function checkBookmarksAttributes() {
  console.log('🔍 Проверка атрибутов коллекции bookmarks...\n');
  
  try {
    // Получаем информацию о коллекции
    const collection = await databases.getCollection(DATABASE_ID, 'bookmarks');
    console.log(`✅ Коллекция bookmarks найдена`);
    console.log(`📊 Количество атрибутов: ${collection.attributes.length}`);
    
    // Выводим все атрибуты
    console.log('\n📋 Атрибуты коллекции bookmarks:');
    collection.attributes.forEach((attr, index) => {
      console.log(`  ${index + 1}. ${attr.key} (${attr.type}) - required: ${attr.required}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка при проверке коллекции bookmarks:', error.message);
  }
}

checkBookmarksAttributes().catch(console.error);
