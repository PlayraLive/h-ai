require('dotenv').config({ path: '.env.local' });
const { Client, Storage } = require('node-appwrite');

console.log('🔧 Setting up Storage permissions according to Appwrite docs...');

// Initialize Appwrite client with API key
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function setupStoragePermissions() {
  try {
    console.log('📋 Checking current bucket permissions...');
    
    // List all buckets
    const buckets = await storage.listBuckets();
    console.log('✅ Found buckets:', buckets.buckets.length);
    
    // Find avatars bucket
    const avatarsBucket = buckets.buckets.find(bucket => bucket.$id === 'avatars');
    if (avatarsBucket) {
      console.log('✅ Avatars bucket found');
      console.log('📋 Current permissions:', avatarsBucket.$permissions);
      
      // Check if permissions are correct according to docs
      const hasCreatePermission = avatarsBucket.$permissions.includes('create("any")');
      const hasReadPermission = avatarsBucket.$permissions.includes('read("any")');
      
      if (hasCreatePermission && hasReadPermission) {
        console.log('✅ Permissions are correctly set according to Appwrite docs');
        console.log('📋 CREATE and READ permissions for "any" role are configured');
      } else {
        console.log('⚠️ Permissions may need adjustment');
        console.log('📋 According to docs, bucket should have:');
        console.log('   - CREATE permission for "any" role');
        console.log('   - READ permission for "any" role');
      }
    } else {
      console.log('❌ Avatars bucket not found');
      console.log('📋 Available buckets:', buckets.buckets.map(b => b.$id));
    }
    
    // Test file upload (skipping for Node.js environment)
    console.log('\n🧪 Skipping file upload test in Node.js environment');
    console.log('📋 File upload will be tested in the browser environment');
    
  } catch (error) {
    console.error('❌ Error setting up storage permissions:', error.message);
  }
}

setupStoragePermissions(); 