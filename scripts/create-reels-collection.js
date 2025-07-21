const { Client, Databases, Permission, Role } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function createReelsCollection() {
  try {
    console.log('🚀 Creating Reels collection...');
    
    // Create the collection
    const collection = await databases.createCollection(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      'reels',
      'Reels',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );
    
    console.log('✅ Collection created:', collection.$id);
    
    // Create attributes
    const attributes = [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'videoUrl', type: 'string', size: 500, required: false },
      { key: 'thumbnailUrl', type: 'string', size: 500, required: false },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'creatorId', type: 'string', size: 100, required: true },
      { key: 'creatorName', type: 'string', size: 255, required: true },
      { key: 'isPremium', type: 'boolean', required: false, default: false },
      { key: 'views', type: 'integer', required: false, default: 0 },
      { key: 'likes', type: 'integer', required: false, default: 0 },
      { key: 'rating', type: 'float', required: false, default: 0 },
      { key: 'duration', type: 'integer', required: false },
      { key: 'tags', type: 'string', size: 1000, required: false },
      { key: 'price', type: 'integer', required: false },
      { key: 'deliveryTime', type: 'string', size: 100, required: false },
      { key: 'features', type: 'string', size: 2000, required: false },
      { key: 'requirements', type: 'string', size: 1000, required: false }
    ];
    
    console.log('📝 Creating attributes...');
    
    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            'reels',
            attr.key,
            attr.size,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            'reels',
            attr.key,
            attr.required,
            undefined,
            undefined,
            attr.default
          );
        } else if (attr.type === 'float') {
          await databases.createFloatAttribute(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            'reels',
            attr.key,
            attr.required,
            undefined,
            undefined,
            attr.default
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            'reels',
            attr.key,
            attr.required,
            attr.default
          );
        }
        
        console.log(`  ✅ ${attr.key} (${attr.type})`);
        
        // Wait a bit between attribute creation
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`  ❌ ${attr.key}: ${error.message}`);
      }
    }
    
    console.log('📊 Creating indexes...');
    
    // Create indexes
    const indexes = [
      { key: 'category_index', type: 'key', attributes: ['category'] },
      { key: 'creator_index', type: 'key', attributes: ['creatorId'] },
      { key: 'views_index', type: 'key', attributes: ['views'] },
      { key: 'rating_index', type: 'key', attributes: ['rating'] },
      { key: 'created_index', type: 'key', attributes: ['$createdAt'] }
    ];
    
    for (const index of indexes) {
      try {
        await databases.createIndex(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          'reels',
          index.key,
          index.type,
          index.attributes
        );
        console.log(`  ✅ ${index.key}`);
        
        // Wait a bit between index creation
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`  ❌ ${index.key}: ${error.message}`);
      }
    }
    
    console.log('🎉 Reels collection setup complete!');
    
  } catch (error) {
    if (error.code === 409) {
      console.log('✅ Reels collection already exists');
    } else {
      console.error('❌ Error creating collection:', error.message);
    }
  }
}

createReelsCollection();
