const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function fixUnifiedOrdersAttributes() {
  try {
    console.log('🚀 Fixing unified_orders collection attributes...');

    // Check current attributes
    const collection = await databases.getCollection(DATABASE_ID, 'unified_orders');
    console.log('📋 Current attributes:', collection.attributes.map(attr => attr.key).join(', '));

    const missingAttributes = [
      { key: 'status', type: 'enum', values: ['pending', 'in_progress', 'review', 'revision', 'completed', 'cancelled', 'paused'], required: true },
      { key: 'totalAmount', type: 'float', required: true },
      { key: 'currency', type: 'string', size: 10, required: false, default: 'USD' },
      { key: 'progress', type: 'integer', required: false, default: 0 },
      
      // Participants
      { key: 'clientId', type: 'string', size: 50, required: true },
      { key: 'clientName', type: 'string', size: 255, required: true },
      { key: 'clientAvatar', type: 'string', size: 500, required: false },
      { key: 'workerId', type: 'string', size: 50, required: false },
      { key: 'workerName', type: 'string', size: 255, required: false },
      { key: 'workerAvatar', type: 'string', size: 500, required: false },
      { key: 'workerType', type: 'enum', values: ['ai_specialist', 'freelancer'], required: true },
      
      // Timeline
      { key: 'createdAt', type: 'string', size: 50, required: true },
      { key: 'updatedAt', type: 'string', size: 50, required: true },
      { key: 'startedAt', type: 'string', size: 50, required: false },
      { key: 'deadline', type: 'string', size: 50, required: false },
      { key: 'completedAt', type: 'string', size: 50, required: false },
      
      // Project Details
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'skills', type: 'string', size: 2000, required: false, default: '[]' },
      { key: 'priority', type: 'enum', values: ['low', 'medium', 'high', 'urgent'], required: false },
      { key: 'requirements', type: 'string', size: 2000, required: false, default: '[]' },
      { key: 'deliverables', type: 'string', size: 2000, required: false, default: '[]' },
      
      // Progress Tracking (JSON fields)
      { key: 'milestones', type: 'string', size: 10000, required: false, default: '[]' },
      { key: 'payments', type: 'string', size: 5000, required: false, default: '[]' },
      { key: 'timeline', type: 'string', size: 10000, required: false, default: '[]' },
      
      // Communication
      { key: 'conversationId', type: 'string', size: 50, required: true },
      { key: 'lastActivity', type: 'string', size: 50, required: true },
      
      // Metadata
      { key: 'metadata', type: 'string', size: 5000, required: false, default: '{}' }
    ];

    let added = 0;
    let skipped = 0;

    for (const attr of missingAttributes) {
      try {
        console.log(`📝 Adding attribute: ${attr.key}...`);
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID, 
            'unified_orders', 
            attr.key, 
            attr.size, 
            attr.required, 
            attr.default
          );
        } else if (attr.type === 'float') {
          await databases.createFloatAttribute(
            DATABASE_ID, 
            'unified_orders', 
            attr.key, 
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID, 
            'unified_orders', 
            attr.key, 
            attr.required, 
            undefined, 
            undefined, 
            attr.default
          );
        } else if (attr.type === 'enum') {
          await databases.createEnumAttribute(
            DATABASE_ID, 
            'unified_orders', 
            attr.key, 
            attr.values, 
            attr.required
          );
        }
        
        console.log(`  ✅ Added: ${attr.key}`);
        added++;
      } catch (error) {
        if (error.code === 409) {
          console.log(`  ⚠️  Already exists: ${attr.key}`);
          skipped++;
        } else {
          console.log(`  ❌ Error adding ${attr.key}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Process completed!`);
    console.log(`✅ Added: ${added} attributes`);
    console.log(`⏭️  Skipped: ${skipped} attributes`);

    // Verify final structure
    const updatedCollection = await databases.getCollection(DATABASE_ID, 'unified_orders');
    console.log(`\n📊 Final collection has ${updatedCollection.attributes.length} attributes`);
    console.log('🔍 Key attributes:', updatedCollection.attributes.map(attr => attr.key).sort().join(', '));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixUnifiedOrdersAttributes();