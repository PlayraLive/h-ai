const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function fixMissingJobAttributes() {
  console.log('🔧 Исправление недостающих атрибутов в коллекции jobs...\n');
  
  const missingAttributes = [
    { key: 'assignedFreelancer', type: 'string', size: 255, required: false },
    { key: 'workStatus', type: 'string', size: 100, required: false, default: 'pending' },
    { key: 'completedAt', type: 'string', size: 255, required: false },
    { key: 'acceptedAt', type: 'string', size: 255, required: false },
    { key: 'deadlineAt', type: 'string', size: 255, required: false },
    { key: 'progressPercentage', type: 'integer', required: false, default: 0 },
    { key: 'milestones', type: 'string', size: 5000, required: false },
    { key: 'freelancerNotes', type: 'string', size: 2000, required: false },
    { key: 'clientFeedback', type: 'string', size: 2000, required: false },
    { key: 'finalRating', type: 'float', required: false }
  ];

  try {
    // Проверяем существование коллекции jobs
    const jobsCollection = await databases.listDocuments(DATABASE_ID, 'jobs');
    console.log(`✅ Коллекция jobs найдена (${jobsCollection.documents.length} документов)`);
    
    // Добавляем недостающие атрибуты
    for (const attr of missingAttributes) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Задержка между запросами
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'jobs',
            attr.key,
            attr.size,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'jobs',
            attr.key,
            attr.required,
            attr.min || 0,
            attr.max || 100,
            attr.default
          );
        } else if (attr.type === 'float') {
          await databases.createFloatAttribute(
            DATABASE_ID,
            'jobs',
            attr.key,
            attr.required,
            attr.min || 0,
            attr.max || 5,
            attr.default
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
    
    console.log('\n✅ Обновление атрибутов jobs завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка работы с коллекцией jobs:', error.message);
  }
}

fixMissingJobAttributes().catch(console.error); 