require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

console.log('🔧 Adding userId attribute to jobs collection...');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function addUserIdToJobs() {
  try {
    console.log('📋 Checking current collection attributes...');
    const collection = await databases.getCollection(DATABASE_ID, 'jobs');
    console.log('✅ Collection found:', collection.name);
    console.log('📋 Current attributes:', collection.attributes.map(attr => attr.key));

    const hasUserId = collection.attributes.some(attr => attr.key === 'userId');
    if (hasUserId) {
      console.log('✅ userId attribute already exists');
      return;
    }

    console.log('📤 Adding userId attribute...');
    await databases.createStringAttribute(
      DATABASE_ID,
      'jobs',
      'userId',
      255, // max length
      false, // required
      '' // default value
    );
    console.log('✅ userId attribute added successfully');
    
    console.log('⏳ Waiting for attribute to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedCollection = await databases.getCollection(DATABASE_ID, 'jobs');
    console.log('📋 Updated attributes:', updatedCollection.attributes.map(attr => attr.key));
    
  } catch (error) {
    console.error('❌ Error adding userId attribute:', error.message);
  }
}

addUserIdToJobs(); 