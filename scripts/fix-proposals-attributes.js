const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function fixProposalsAttributes() {
  console.log('🔧 Исправление атрибутов в коллекции proposals...\n');
  
  const missingAttributes = [
    { key: 'status', type: 'string', size: 50, required: false, default: 'pending' },
    { key: 'clientResponse', type: 'string', size: 1000, required: false },
    { key: 'jobTitle', type: 'string', size: 255, required: false },
    { key: 'jobId', type: 'string', size: 255, required: false },
    { key: 'freelancerName', type: 'string', size: 255, required: false },
    { key: 'freelancerAvatar', type: 'string', size: 500, required: false },
    { key: 'updatedAt', type: 'datetime', required: false },
  ];

  try {
    // Проверяем существование коллекции proposals
    const proposalsCollection = await databases.listDocuments(DATABASE_ID, 'proposals');
    console.log(`✅ Коллекция proposals найдена (${proposalsCollection.documents.length} документов)`);
    
    // Добавляем недостающие атрибуты
    for (const attr of missingAttributes) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Задержка между запросами
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'proposals',
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            'proposals',
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
    
    console.log('\n✅ Обновление атрибутов proposals завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка работы с коллекцией proposals:', error.message);
  }
}

fixProposalsAttributes().catch(console.error);
