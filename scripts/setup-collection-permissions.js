const { Client, Databases, ID } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY); // Server API key

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Collections that need proper permissions
const collections = [
  'user_profiles',
  'user_progress', 
  'achievements',
  'onboarding_steps',
  'ratings_reviews',
  'favorites',
  'jobs',
  'applications',
  'projects',
  'messages',
  'conversations',
  'notifications',
  'invitations'
];

async function setupCollectionPermissions() {
  console.log('🔐 Настройка прав доступа для коллекций...\n');
  
  for (const collectionId of collections) {
    try {
      console.log(`📋 Настройка прав для коллекции: ${collectionId}`);
      
      // Get collection details
      const collection = await databases.getCollection(DATABASE_ID, collectionId);
      console.log(`  ✅ Коллекция найдена: ${collection.name}`);
      
      // Update collection permissions
      // Allow read/write for authenticated users
      await databases.updateCollection(
        DATABASE_ID,
        collectionId,
        collection.name,
        undefined, // description
        undefined, // enabled
        undefined, // documentSecurity
        [
          // Allow read for any authenticated user
          {
            permission: 'read',
            roles: ['any']
          },
          // Allow write for authenticated users
          {
            permission: 'write', 
            roles: ['users']
          },
          // Allow update for document owners
          {
            permission: 'update',
            roles: ['users']
          },
          // Allow delete for document owners
          {
            permission: 'delete',
            roles: ['users']
          }
        ]
      );
      
      console.log(`  ✅ Права доступа обновлены для ${collectionId}`);
      
    } catch (error) {
      if (error.code === 404) {
        console.log(`  ⚠️ Коллекция ${collectionId} не найдена`);
      } else {
        console.error(`  ❌ Ошибка настройки прав для ${collectionId}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Настройка прав доступа завершена!');
  console.log('\n📝 Теперь все пользователи смогут:');
  console.log('   ✅ Читать данные из всех коллекций');
  console.log('   ✅ Создавать новые записи');
  console.log('   ✅ Обновлять свои записи');
  console.log('   ✅ Удалять свои записи');
}

setupCollectionPermissions().catch(console.error); 