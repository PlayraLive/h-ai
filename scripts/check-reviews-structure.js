const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function checkReviewsStructure() {
  try {
    console.log('🔍 Проверяю структуру коллекции Reviews...\n');

    const reviewsCollection = 'reviews';
    
    // Получаем детали коллекции
    const collection = await databases.getCollection(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      reviewsCollection
    );

    console.log('📋 Атрибуты коллекции Reviews:');
    collection.attributes.forEach(attr => {
      console.log(`  - ${attr.key}: ${attr.type}${attr.required ? ' (required)' : ''}`);
    });

    // Проверяем существующие документы
    const reviews = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      reviewsCollection,
      undefined, // queries
      5 // limit
    );

    console.log(`\n📝 Найдено документов: ${reviews.documents.length}`);
    
    if (reviews.documents.length > 0) {
      console.log('\n📄 Пример документа:');
      const sample = reviews.documents[0];
      Object.keys(sample).forEach(key => {
        if (!key.startsWith('$')) {
          console.log(`  ${key}: ${sample[key]}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkReviewsStructure();
