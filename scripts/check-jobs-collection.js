require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

console.log('🔍 Checking jobs collection attributes...');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function checkJobsCollection() {
  try {
    console.log('📋 Getting jobs collection details...');
    const collection = await databases.getCollection(DATABASE_ID, 'jobs');
    console.log('✅ Collection found:', collection.name);
    console.log('📋 Current attributes:');
    
    collection.attributes.forEach((attr, index) => {
      console.log(`   ${index + 1}. ${attr.key} (${attr.type}) - Required: ${attr.required}`);
    });

    // Проверяем, есть ли атрибут userId
    const hasUserId = collection.attributes.some(attr => attr.key === 'userId');
    console.log(`\n🔍 Has userId attribute: ${hasUserId}`);

    if (!hasUserId) {
      console.log('⚠️  userId attribute is missing!');
      console.log('💡 You need to add userId attribute to jobs collection');
    }

  } catch (error) {
    console.error('❌ Error checking jobs collection:', error.message);
  }
}

checkJobsCollection(); 