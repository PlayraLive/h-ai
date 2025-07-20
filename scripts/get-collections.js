#!/usr/bin/env node

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

async function getCollections() {
  console.log('🔍 Getting Appwrite Collections...\n');

  // Initialize Appwrite client
  const client = new Client();
  const databases = new Databases(client);

  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  try {
    // Get all collections from the database
    const response = await databases.listCollections(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
    );

    console.log(`✅ Found ${response.collections.length} collections:\n`);

    // Display collections in a readable format
    response.collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
      console.log(`   ID: ${collection.$id}`);
      console.log(`   Documents: ${collection.documentSecurity ? 'Document-level security' : 'Collection-level security'}`);
      console.log(`   Created: ${new Date(collection.$createdAt).toLocaleDateString()}`);
      console.log('');
    });

    // Generate .env format
    console.log('\n📋 Copy these to your .env.local file:\n');
    console.log('# Collection IDs from Appwrite');
    
    response.collections.forEach(collection => {
      // Convert collection name to env variable format
      const envName = collection.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      console.log(`NEXT_PUBLIC_APPWRITE_${envName}_COLLECTION_ID=${collection.$id}`);
    });

    console.log('\n✅ Done! Copy the IDs above to your .env.local file.');

  } catch (error) {
    console.error('❌ Error getting collections:', error.message);
    
    if (error.code === 401) {
      console.log('\n💡 Make sure your API key is correct and has proper permissions.');
    } else if (error.code === 404) {
      console.log('\n💡 Make sure your Project ID and Database ID are correct.');
    }
    
    console.log('\n🔧 Current configuration:');
    console.log(`Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    console.log(`Project ID: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
    console.log(`Database ID: ${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}`);
    console.log(`API Key: ${process.env.APPWRITE_API_KEY ? 'Set' : 'Not set'}`);
  }
}

// Run the script
getCollections();
