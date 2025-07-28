const { Client, Databases } = require('node-appwrite');

// Configuration from .env.local
const ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '687759fb003c8bd76b93';
const DATABASE_ID = '687796e3001241f7de17';
const API_KEY = 'standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function checkMessagesAttributes() {
  try {
    console.log('🔍 Checking messages collection attributes...');

    const collection = await databases.getCollection(DATABASE_ID, 'messages');
    
    console.log('📋 Messages collection attributes:');
    collection.attributes.forEach(attr => {
      console.log(`  - ${attr.key}: ${attr.type} (${attr.required ? 'required' : 'optional'})`);
    });

    console.log(`\n📊 Total attributes: ${collection.attributes.length}`);

  } catch (error) {
    console.error('❌ Error checking messages attributes:', error.message);
  }
}

// Run the script
checkMessagesAttributes(); 