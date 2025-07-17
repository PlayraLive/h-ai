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

async function checkCollections() {
  try {
    console.log('🔍 Checking existing collections...\n');
    
    // Get all collections
    const collections = await databases.listCollections(DATABASE_ID);
    
    console.log(`📊 Found ${collections.collections.length} collections:\n`);
    
    for (const collection of collections.collections) {
      console.log(`📁 ${collection.name} (ID: ${collection.$id})`);
      
      try {
        // Get attributes for this collection
        const attributes = await databases.listAttributes(DATABASE_ID, collection.$id);
        console.log(`   📋 Attributes (${attributes.attributes.length}):`);
        
        if (attributes.attributes.length === 0) {
          console.log('      ⚠️  No attributes found');
        } else {
          for (const attr of attributes.attributes) {
            const required = attr.required ? '(required)' : '(optional)';
            const array = attr.array ? '[]' : '';
            console.log(`      - ${attr.key}: ${attr.type}${array} ${required}`);
          }
        }
      } catch (error) {
        console.log(`      ❌ Error getting attributes: ${error.message}`);
      }
      
      console.log(''); // Empty line
    }
    
    // Check for required collections
    const requiredCollections = [
      'jobs',
      'users', 
      'proposals',
      'projects',
      'messages',
      'conversations',
      'reviews',
      'payments',
      'notifications',
      'categories',
      'skills'
    ];
    
    console.log('🎯 Checking required collections:\n');
    
    const existingIds = collections.collections.map(c => c.$id.toLowerCase());
    const missing = [];
    
    for (const required of requiredCollections) {
      const exists = existingIds.includes(required.toLowerCase()) || 
                    existingIds.includes(required.toLowerCase() + 's') ||
                    existingIds.some(id => id.includes(required.toLowerCase()));
      
      if (exists) {
        console.log(`✅ ${required} - Found`);
      } else {
        console.log(`❌ ${required} - Missing`);
        missing.push(required);
      }
    }
    
    if (missing.length > 0) {
      console.log(`\n⚠️  Missing collections: ${missing.join(', ')}`);
      console.log('Run: node scripts/setup-appwrite-collections.js to create them');
    } else {
      console.log('\n🎉 All required collections exist!');
    }
    
    // Check Jobs collection specifically
    const jobsCollection = collections.collections.find(c => 
      c.$id.toLowerCase() === 'jobs' || c.name.toLowerCase() === 'jobs'
    );
    
    if (jobsCollection) {
      console.log('\n🎯 Jobs Collection Details:');
      console.log(`   ID: ${jobsCollection.$id}`);
      console.log(`   Name: ${jobsCollection.name}`);
      console.log(`   Created: ${jobsCollection.$createdAt}`);
      
      try {
        const jobsAttributes = await databases.listAttributes(DATABASE_ID, jobsCollection.$id);
        console.log(`   Attributes: ${jobsAttributes.attributes.length}`);
        
        const requiredJobsAttributes = [
          'title', 'description', 'category', 'budgetType', 
          'budgetMin', 'budgetMax', 'clientId', 'clientName'
        ];
        
        const existingAttrs = jobsAttributes.attributes.map(a => a.key);
        const missingAttrs = requiredJobsAttributes.filter(attr => !existingAttrs.includes(attr));
        
        if (missingAttrs.length > 0) {
          console.log(`   ⚠️  Missing attributes: ${missingAttrs.join(', ')}`);
        } else {
          console.log('   ✅ All required attributes exist');
        }
        
      } catch (error) {
        console.log(`   ❌ Error checking Jobs attributes: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking collections:', error.message);
  }
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 
    !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 
    !process.env.APPWRITE_API_KEY ||
    !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
  console.error('❌ Missing required environment variables!');
  process.exit(1);
}

console.log('📋 Environment variables loaded:');
console.log(`- Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
console.log(`- Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
console.log(`- Database: ${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}\n`);

// Run the check
checkCollections().catch(console.error);
