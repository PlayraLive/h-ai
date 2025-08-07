require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

console.log('📋 Listing all collections with details...');

// Initialize Appwrite client with API key
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function listAllCollections() {
  try {
    const collections = await databases.listCollections(DATABASE_ID);
    
    console.log(`\n✅ Found ${collections.collections.length} collections:\n`);
    
    collections.collections.forEach((collection, index) => {
      console.log(`${index + 1}. ID: ${collection.$id}`);
      console.log(`   Name: ${collection.name}`);
      console.log(`   Created: ${collection.$createdAt}`);
      console.log(`   Attributes: ${collection.attributes.length}`);
      console.log(`   Permissions: ${collection.$permissions.length}`);
      console.log('');
    });
    
    // Look for onboarding-related collections
    const onboardingCollections = collections.collections.filter(col => 
      col.name.toLowerCase().includes('onboarding') || 
      col.$id.toLowerCase().includes('onboarding')
    );
    
    if (onboardingCollections.length > 0) {
      console.log('🎯 Found onboarding-related collections:');
      onboardingCollections.forEach(col => {
        console.log(`   - ${col.name} (${col.$id})`);
      });
    } else {
      console.log('❌ No onboarding-related collections found');
    }
    
  } catch (error) {
    console.error('❌ Error listing collections:', error.message);
  }
}

listAllCollections(); 