const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function fixMissingUserAttributes() {
  console.log('🔧 Исправление недостающих атрибутов в коллекции users...\n');
  
  const missingAttributes = [
    // Основные атрибуты пользователя
    { key: 'name', type: 'string', size: 255, required: false },
    { key: 'email', type: 'string', size: 255, required: true },
    { key: 'userType', type: 'string', size: 50, required: true },
    { key: 'avatar', type: 'string', size: 500, required: false },
    { key: 'bio', type: 'string', size: 1000, required: false },
    { key: 'location', type: 'string', size: 255, required: false },
    { key: 'skills', type: 'string', size: 255, required: false, array: true },
    { key: 'languages', type: 'string', size: 100, required: false, array: true },
    { key: 'hourlyRate', type: 'integer', required: false, min: 0, max: 1000 },
    
    // Статистика и рейтинги
    { key: 'rating', type: 'float', required: false, min: 0, max: 5 },
    { key: 'reviewCount', type: 'integer', required: false, min: 0 },
    { key: 'totalEarnings', type: 'float', required: false, min: 0 },
    { key: 'completedProjects', type: 'integer', required: false, min: 0 },
    
    // Статус и верификация
    { key: 'verified', type: 'boolean', required: false },
    { key: 'topRated', type: 'boolean', required: false },
    { key: 'availability', type: 'string', size: 50, required: false },
    
    // Социальные сети
    { key: 'linkedin', type: 'string', size: 500, required: false },
    { key: 'twitter', type: 'string', size: 500, required: false },
    { key: 'website', type: 'string', size: 500, required: false },
    
    // Дополнительные поля
    { key: 'phone', type: 'string', size: 50, required: false },
    { key: 'timezone', type: 'string', size: 100, required: false },
    { key: 'preferences', type: 'string', size: 2000, required: false },
  ];

  try {
    // Проверяем существование коллекции users
    const usersCollection = await databases.listDocuments(DATABASE_ID, 'users');
    console.log(`✅ Коллекция users найдена (${usersCollection.documents.length} документов)`);
    
    // Добавляем недостающие атрибуты
    for (const attr of missingAttributes) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Задержка между запросами
        
        if (attr.type === 'string') {
          if (attr.array) {
            await databases.createStringAttribute(
              DATABASE_ID,
              'users',
              attr.key,
              attr.size,
              attr.required
            );
          } else {
            await databases.createStringAttribute(
              DATABASE_ID,
              'users',
              attr.key,
              attr.size,
              attr.required
            );
          }
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'users',
            attr.key,
            attr.required,
            attr.min,
            attr.max
          );
        } else if (attr.type === 'float') {
          await databases.createFloatAttribute(
            DATABASE_ID,
            'users',
            attr.key,
            attr.required,
            attr.min,
            attr.max
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            'users',
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
    
    console.log('\n✅ Обновление атрибутов users завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка работы с коллекцией users:', error.message);
  }
}

fixMissingUserAttributes().catch(console.error);
