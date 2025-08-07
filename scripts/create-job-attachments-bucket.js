require('dotenv').config({ path: '.env.local' });
const { Client, Storage } = require('node-appwrite');

console.log('🔧 Creating job-attachments bucket...');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function createJobAttachmentsBucket() {
  try {
    console.log('📋 Checking existing buckets...');
    const buckets = await storage.listBuckets();
    const existingBucket = buckets.buckets.find(bucket => bucket.$id === 'job-attachments');
    if (existingBucket) {
      console.log('✅ job-attachments bucket already exists');
      console.log('📋 Bucket details:', {
        id: existingBucket.$id,
        name: existingBucket.name,
        permissions: existingBucket.$permissions
      });
      return;
    }

    console.log('📤 Creating job-attachments bucket...');
    const bucket = await storage.createBucket(
      'job-attachments',
      'Job Attachments',
      [
        'read("any")',
        'create("users")',
        'update("users")',
        'delete("users")'
      ]
    );

    console.log('✅ job-attachments bucket created successfully');
    console.log('📋 Bucket details:', {
      id: bucket.$id,
      name: bucket.name,
      permissions: bucket.$permissions
    });

  } catch (error) {
    console.error('❌ Error creating job-attachments bucket:', error.message);
  }
}

createJobAttachmentsBucket(); 