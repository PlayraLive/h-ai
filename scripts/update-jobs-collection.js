#!/usr/bin/env node

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Appwrite configuration
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function updateJobsCollection() {
  try {
    console.log('🚀 Updating Jobs collection...\n');
    
    // Add missing attributes
    const missingAttributes = [
      { key: 'currency', type: 'string', size: 10, required: false, default: 'USD' },
      { key: 'duration', type: 'string', size: 100, required: false },
      { key: 'experienceLevel', type: 'string', size: 50, required: false },
      { key: 'location', type: 'string', size: 255, required: false },
      { key: 'clientId', type: 'string', size: 100, required: true },
      { key: 'clientName', type: 'string', size: 255, required: true },
      { key: 'clientCompany', type: 'string', size: 255, required: false },
      { key: 'clientAvatar', type: 'string', size: 500, required: false },
      { key: 'featured', type: 'boolean', required: false, default: false },
      { key: 'urgent', type: 'boolean', required: false, default: false },
      { key: 'deadline', type: 'datetime', required: false },
      { key: 'status', type: 'string', size: 50, required: false, default: 'open' },
      { key: 'proposals', type: 'integer', required: false, default: 0 },
      { key: 'attachments', type: 'string', size: 500, required: false, array: true },
      { key: 'tags', type: 'string', size: 100, required: false, array: true }
    ];
    
    for (const attr of missingAttributes) {
      try {
        console.log(`  Adding attribute: ${attr.key}...`);
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'jobs',
            attr.key,
            attr.size,
            attr.required || false,
            attr.default,
            attr.array || false
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'jobs',
            attr.key,
            attr.required || false,
            undefined, // min
            undefined, // max
            attr.default,
            attr.array || false
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            'jobs',
            attr.key,
            attr.required || false,
            attr.default,
            attr.array || false
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            'jobs',
            attr.key,
            attr.required || false,
            attr.default,
            attr.array || false
          );
        }
        
        console.log(`    ✅ Attribute ${attr.key} added`);
        
        // Wait between attribute creations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        if (error.code === 409) {
          console.log(`    ⚠️  Attribute ${attr.key} already exists`);
        } else {
          console.error(`    ❌ Error creating attribute ${attr.key}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Jobs collection update completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to Appwrite Console → Database → Jobs collection');
    console.log('2. Set up permissions:');
    console.log('   - Create: Users');
    console.log('   - Read: Any');
    console.log('   - Update: Users (only creator)');
    console.log('   - Delete: Users (only creator)');
    console.log('3. Test creating a job in the application');
    
  } catch (error) {
    console.error('❌ Error updating Jobs collection:', error.message);
  }
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 
    !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 
    !process.env.APPWRITE_API_KEY ||
    !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
  console.error('❌ Missing required environment variables!');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_APPWRITE_ENDPOINT');
  console.log('- NEXT_PUBLIC_APPWRITE_PROJECT_ID');
  console.log('- APPWRITE_API_KEY');
  console.log('- NEXT_PUBLIC_APPWRITE_DATABASE_ID');
  process.exit(1);
}

console.log('📋 Environment variables loaded:');
console.log(`- Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
console.log(`- Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
console.log(`- Database: ${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}\n`);

// Run the update
updateJobsCollection().catch(console.error);
