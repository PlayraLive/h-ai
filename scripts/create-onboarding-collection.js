require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

console.log('🔧 Creating onboarding_steps collection...');

// Initialize Appwrite client with API key
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function createOnboardingCollection() {
  try {
    console.log('📤 Creating onboarding_steps collection...');
    
    // Create the collection with unique ID
    const collection = await databases.createCollection(
      DATABASE_ID,
      require('node-appwrite').ID.unique(),
      'Onboarding Steps'
    );
    
    console.log('✅ Collection created:', collection.$id);
    
    // Add attributes
    console.log('📤 Adding attributes...');
    
    const attributes = [
      { key: 'user_id', size: 100, required: true },
      { key: 'user_type', size: 50, required: false },
      { key: 'current_step', size: 100, required: false },
      { key: 'total_steps', size: 100, required: false },
      { key: 'completed_steps', size: 500, required: false },
      { key: 'step_data', size: 1000, required: false },
      { key: 'started_at', size: 100, required: false },
      { key: 'completed_at', size: 100, required: false },
      { key: 'trigger_type', size: 50, required: false }
    ];
    
    for (const attr of attributes) {
      try {
        await databases.createStringAttribute(
          DATABASE_ID,
          'onboarding_steps',
          attr.key,
          attr.size,
          attr.required
        );
        console.log(`✅ Added attribute: ${attr.key}`);
      } catch (error) {
        console.log(`⚠️ Could not add attribute ${attr.key}:`, error.message);
      }
    }
    
    console.log('✅ onboarding_steps collection setup complete');
    
  } catch (error) {
    console.error('❌ Error creating onboarding collection:', error.message);
  }
}

createOnboardingCollection(); 