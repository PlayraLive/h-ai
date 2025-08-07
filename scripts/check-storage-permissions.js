require('dotenv').config({ path: '.env.local' });
const { Client, Storage } = require('node-appwrite');

// Initialize Appwrite client with API key
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function checkStoragePermissions() {
  try {
    console.log('🔍 Checking storage permissions...');
    
    // Try to list buckets
    const buckets = await storage.listBuckets();
    console.log('✅ Successfully listed buckets:', buckets.buckets.length);
    
    // Check if avatars bucket exists
    const avatarsBucket = buckets.buckets.find(bucket => bucket.$id === 'avatars');
    if (avatarsBucket) {
      console.log('✅ Avatars bucket found');
      console.log('📋 Bucket permissions:', avatarsBucket.$permissions);
    } else {
      console.log('❌ Avatars bucket not found');
    }
    
    // Try to list files in avatars bucket
    try {
      const files = await storage.listFiles('avatars');
      console.log('✅ Successfully listed files in avatars bucket:', files.files.length);
    } catch (error) {
      console.error('❌ Cannot list files in avatars bucket:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking storage permissions:', error.message);
  }
}

// Run the check
checkStoragePermissions(); 