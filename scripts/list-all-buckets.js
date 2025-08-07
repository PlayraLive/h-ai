require('dotenv').config({ path: '.env.local' });
const { Client, Storage } = require('node-appwrite');

console.log('📋 Listing all storage buckets...');

// Initialize Appwrite client with API key
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function listAllBuckets() {
  try {
    const buckets = await storage.listBuckets();
    
    console.log(`\n✅ Found ${buckets.buckets.length} buckets:`);
    
    buckets.buckets.forEach((bucket, index) => {
      console.log(`\n${index + 1}. Bucket: ${bucket.$id}`);
      console.log(`   Name: ${bucket.name}`);
      console.log(`   Permissions: ${bucket.$permissions.join(', ')}`);
      console.log(`   Created: ${bucket.$createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error listing buckets:', error.message);
  }
}

listAllBuckets(); 