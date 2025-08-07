require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

console.log('🔧 Adding user_type attribute to user_profiles collection...');

// Initialize Appwrite client with API key
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function addUserTypeAttribute() {
  try {
    console.log('📋 Checking current collection attributes...');
    
    // Get collection info
    const collection = await databases.getCollection(DATABASE_ID, 'user_profiles');
    console.log('✅ Collection found:', collection.name);
    console.log('📋 Current attributes:', collection.attributes.map(attr => attr.key));
    
    // Check if user_type attribute already exists
    const hasUserType = collection.attributes.some(attr => attr.key === 'user_type');
    
    if (hasUserType) {
      console.log('✅ user_type attribute already exists');
      return;
    }
    
    console.log('📤 Adding user_type attribute...');
    
    // Add user_type attribute
    await databases.createStringAttribute(
      DATABASE_ID,
      'user_profiles',
      'user_type',
      255, // max length
      false, // required
      'client' // default value
    );
    
    console.log('✅ user_type attribute added successfully');
    
    // Wait a bit for the attribute to be created
    console.log('⏳ Waiting for attribute to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify the attribute was added
    const updatedCollection = await databases.getCollection(DATABASE_ID, 'user_profiles');
    console.log('📋 Updated attributes:', updatedCollection.attributes.map(attr => attr.key));
    
  } catch (error) {
    console.error('❌ Error adding user_type attribute:', error.message);
  }
}

addUserTypeAttribute(); 