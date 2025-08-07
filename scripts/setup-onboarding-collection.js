require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

console.log('🔧 Setting up onboarding_steps collection...');

// Initialize Appwrite client with API key
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function setupOnboardingCollection() {
  try {
    console.log('📋 Checking if onboarding_steps collection exists...');
    
    // List all collections
    const collections = await databases.listCollections(DATABASE_ID);
    console.log('✅ Found collections:', collections.collections.length);
    
    // Check if onboarding_steps exists
    const onboardingCollection = collections.collections.find(col => col.$id === 'onboarding_steps');
    
    if (onboardingCollection) {
      console.log('✅ onboarding_steps collection found');
      console.log('📋 Collection attributes:', onboardingCollection.attributes.map(attr => attr.key));
      
      // Check if all required attributes exist
      const requiredAttributes = [
        'user_id', 'user_type', 'current_step', 'total_steps', 
        'completed_steps', 'step_data', 'started_at', 'completed_at', 'trigger_type'
      ];
      
      const existingAttributes = onboardingCollection.attributes.map(attr => attr.key);
      const missingAttributes = requiredAttributes.filter(attr => !existingAttributes.includes(attr));
      
      if (missingAttributes.length > 0) {
        console.log('⚠️ Missing attributes:', missingAttributes);
        console.log('📤 Adding missing attributes...');
        
        for (const attr of missingAttributes) {
          try {
            if (attr === 'step_data') {
              await databases.createStringAttribute(DATABASE_ID, 'onboarding_steps', attr, 1000, false);
            } else if (attr === 'completed_steps') {
              await databases.createStringAttribute(DATABASE_ID, 'onboarding_steps', attr, 500, false);
            } else if (attr === 'user_type') {
              await databases.createStringAttribute(DATABASE_ID, 'onboarding_steps', attr, 50, false);
            } else if (attr === 'trigger_type') {
              await databases.createStringAttribute(DATABASE_ID, 'onboarding_steps', attr, 50, false);
            } else if (attr === 'started_at' || attr === 'completed_at') {
              await databases.createStringAttribute(DATABASE_ID, 'onboarding_steps', attr, 100, false);
            } else {
              await databases.createStringAttribute(DATABASE_ID, 'onboarding_steps', attr, 100, false);
            }
            console.log(`✅ Added attribute: ${attr}`);
          } catch (error) {
            console.log(`⚠️ Could not add attribute ${attr}:`, error.message);
          }
        }
      } else {
        console.log('✅ All required attributes exist');
      }
      
    } else {
      console.log('❌ onboarding_steps collection not found');
      console.log('📋 Available collections:', collections.collections.map(col => col.$id));
    }
    
  } catch (error) {
    console.error('❌ Error setting up onboarding collection:', error.message);
  }
}

setupOnboardingCollection(); 