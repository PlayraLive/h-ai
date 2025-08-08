const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function checkAllCollections() {
  console.log('🔍 Проверка всех коллекций и их атрибутов...\n');
  
  const collections = [
    'users',
    'jobs', 
    'proposals',
    'conversations',
    'messages',
    'comments',
    'bookmarks',
    'notifications',
    'projects',
    'ai_specialists'
  ];

  for (const collectionName of collections) {
    try {
      console.log(`\n📋 Коллекция: ${collectionName}`);
      
      // Получаем информацию о коллекции
      const collection = await databases.getCollection(DATABASE_ID, collectionName);
      console.log(`  ✅ Найдена`);
      console.log(`  📊 Количество атрибутов: ${collection.attributes.length}`);
      
      // Выводим все атрибуты
      if (collection.attributes.length > 0) {
        console.log(`  📝 Атрибуты:`);
        collection.attributes.forEach((attr, index) => {
          console.log(`    ${index + 1}. ${attr.key} (${attr.type}) - required: ${attr.required}`);
        });
      } else {
        console.log(`  ⚠️ Атрибуты отсутствуют`);
      }
      
    } catch (error) {
      console.log(`  ❌ Не найдена: ${error.message}`);
    }
  }
  
  console.log('\n✅ Проверка завершена!');
}

checkAllCollections().catch(console.error);
