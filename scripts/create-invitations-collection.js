require('dotenv').config({ path: '.env.local' });

console.log('📋 Invitations Collection Schema');
console.log('Please create this collection manually in Appwrite Console:');
console.log('');
console.log('Collection ID: invitations');
console.log('Collection Name: Invitations');
console.log('');
console.log('Attributes:');
console.log('- jobId (string, 255, required)');
console.log('- jobTitle (string, 500, required)');
console.log('- clientId (string, 255, required)');
console.log('- clientName (string, 255, required)');
console.log('- freelancerId (string, 255, required)');
console.log('- freelancerName (string, 255, required)');
console.log('- freelancerEmail (string, 255, required)');
console.log('- status (string, 50, required, default: "pending")');
console.log('- message (string, 2000, optional)');
console.log('- matchScore (float, optional)');
console.log('- matchReasons (string array, 100, optional)');
console.log('- invitedAt (datetime, required)');
console.log('- respondedAt (datetime, optional)');
console.log('- expiresAt (datetime, required)');
console.log('- metadata (string, 2000, optional)');
console.log('');
console.log('Indexes:');
console.log('- jobId_index (key: jobId)');
console.log('- freelancerId_index (key: freelancerId)');
console.log('- clientId_index (key: clientId)');
console.log('- status_index (key: status)');
console.log('- invitedAt_index (key: invitedAt)');
console.log('- expiresAt_index (key: expiresAt)');
console.log('');
console.log('🌐 Appwrite Console URL:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT.replace('/v1', ''));
console.log('📁 Database ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
  try {
    console.log('🚀 Creating Invitations collection...');

    // Create the collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      'invitations',
      'Invitations',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection created:', collection.name);

    // Define attributes
    const attributes = [
      { key: 'jobId', type: 'string', size: 255, required: true },
      { key: 'jobTitle', type: 'string', size: 500, required: true },
      { key: 'clientId', type: 'string', size: 255, required: true },
      { key: 'clientName', type: 'string', size: 255, required: true },
      { key: 'freelancerId', type: 'string', size: 255, required: true },
      { key: 'freelancerName', type: 'string', size: 255, required: true },
      { key: 'freelancerEmail', type: 'string', size: 255, required: true },
      { key: 'status', type: 'string', size: 50, required: true, default: 'pending' },
      { key: 'message', type: 'string', size: 2000, required: false },
      { key: 'matchScore', type: 'double', required: false },
      { key: 'matchReasons', type: 'string', size: 100, required: false, array: true },
      { key: 'invitedAt', type: 'datetime', required: true },
      { key: 'respondedAt', type: 'datetime', required: false },
      { key: 'expiresAt', type: 'datetime', required: true },
      { key: 'metadata', type: 'string', size: 2000, required: false }
    ];

    // Create attributes
    for (const attr of attributes) {
      try {
        console.log(`📝 Creating attribute: ${attr.key}`);
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'invitations',
            attr.key,
            attr.size,
            attr.required,
            attr.default,
            attr.array || false
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            'invitations',
            attr.key,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'double') {
          await databases.createFloatAttribute(
            DATABASE_ID,
            'invitations',
            attr.key,
            attr.required,
            attr.min,
            attr.max,
            attr.default
          );
        }

        // Wait a bit between attribute creation
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error creating attribute ${attr.key}:`, error.message);
      }
    }

    console.log('⏳ Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Create indexes for better performance
    const indexes = [
      { key: 'jobId_index', type: 'key', attributes: ['jobId'] },
      { key: 'freelancerId_index', type: 'key', attributes: ['freelancerId'] },
      { key: 'clientId_index', type: 'key', attributes: ['clientId'] },
      { key: 'status_index', type: 'key', attributes: ['status'] },
      { key: 'invitedAt_index', type: 'key', attributes: ['invitedAt'] },
      { key: 'expiresAt_index', type: 'key', attributes: ['expiresAt'] }
    ];

    for (const index of indexes) {
      try {
        console.log(`🔍 Creating index: ${index.key}`);
        await databases.createIndex(
          DATABASE_ID,
          'invitations',
          index.key,
          index.type,
          index.attributes
        );
        
        // Wait between index creation
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error creating index ${index.key}:`, error.message);
      }
    }

    console.log('🎉 Invitations collection created successfully!');
    
    // Display collection info
    const collectionInfo = await databases.get(DATABASE_ID, 'invitations');
    console.log('\n📊 Collection Info:');
    console.log(`Name: ${collectionInfo.name}`);
    console.log(`ID: ${collectionInfo.$id}`);
    console.log(`Created: ${collectionInfo.$createdAt}`);

  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️  Collection already exists');
    } else {
      console.error('❌ Error creating collection:', error);
    }
  }
}

// Check if collection exists
async function checkCollection() {
  try {
    const collection = await databases.get(DATABASE_ID, 'invitations');
    console.log('✅ Invitations collection already exists:', collection.name);
    return true;
  } catch (error) {
    if (error.code === 404) {
      console.log('📝 Invitations collection does not exist, creating...');
      return false;
    } else {
      console.error('❌ Error checking collection:', error);
      return false;
    }
  }
}

async function main() {
  console.log('🔍 Checking Invitations collection...');
  
  const exists = await checkCollection();
  
  if (!exists) {
    await createInvitationsCollection();
  }
  
  console.log('✨ Done!');
}

main().catch(console.error);
