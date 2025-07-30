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

async function addIsReadAttribute() {
  try {
    console.log('🔧 Adding isRead attribute to messages collection...');

    // Add isRead boolean attribute
    await databases.createBooleanAttribute(
      DATABASE_ID,
      'messages',
      'isRead',
      false, // required
      false  // default value
    );

    console.log('✅ Successfully added isRead attribute');
    console.log('⏳ Waiting for attribute to be available...');
    
    // Wait for attribute to be available
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🎉 isRead attribute is ready!');

  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️ isRead attribute already exists');
    } else {
      console.error('❌ Error adding isRead attribute:', error.message);
    }
  }
}

// Run the script
addIsReadAttribute(); 