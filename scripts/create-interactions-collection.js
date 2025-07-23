const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Database configuration
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = 'reel_interactions';

async function createInteractionsCollection() {
  console.log('🚀 Creating Interactions Collection...\n');

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
    console.error('❌ NEXT_PUBLIC_APPWRITE_ENDPOINT is not set');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
    console.error('❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
    console.error('❌ NEXT_PUBLIC_APPWRITE_DATABASE_ID is not set');
    process.exit(1);
  }

  if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY is not set');
    process.exit(1);
  }

  try {
    // Create collection
    console.log('📝 Creating Reel Interactions collection...');

    let collection;
    try {
      collection = await databases.createCollection(
        DATABASE_ID,
        COLLECTION_ID,
        'Reel Interactions',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ],
        false,
        true
      );
      console.log('✅ Reel Interactions collection created successfully');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  Reel Interactions collection already exists');
        collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
      } else {
        throw error;
      }
    }

    // Define attributes
    const attributes = [
      {
        key: 'userId',
        type: 'string',
        size: 255,
        required: true,
        array: false,
        default: null
      },
      {
        key: 'targetId',
        type: 'string',
        size: 255,
        required: true,
        array: false,
        default: null
      },
      {
        key: 'targetType',
        type: 'string',
        size: 50,
        required: true,
        array: false,
        default: null
      },
      {
        key: 'type',
        type: 'string',
        size: 50,
        required: true,
        array: false,
        default: null
      },
      {
        key: 'isActive',
        type: 'boolean',
        required: false,
        array: false,
        default: true
      },
      {
        key: 'metadata',
        type: 'string',
        size: 1000,
        required: false,
        array: false,
        default: null
      }
    ];

    // Create attributes
    console.log('\n📋 Creating attributes...');

    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required,
            attr.default,
            attr.array
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required,
            attr.default,
            attr.array
          );
        }

        console.log(`  ✅ Added ${attr.key} attribute`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        if (error.code === 409) {
          console.log(`  ℹ️  Attribute ${attr.key} already exists`);
        } else {
          console.log(`  ❌ Failed to add ${attr.key}: ${error.message}`);
        }
      }
    }

    // Create indexes for better performance
    console.log('\n🔍 Creating indexes...');

    const indexes = [
      {
        key: 'userId_index',
        type: 'key',
        attributes: ['userId'],
        orders: ['ASC']
      },
      {
        key: 'targetId_index',
        type: 'key',
        attributes: ['targetId'],
        orders: ['ASC']
      },
      {
        key: 'targetType_index',
        type: 'key',
        attributes: ['targetType'],
        orders: ['ASC']
      },
      {
        key: 'type_index',
        type: 'key',
        attributes: ['type'],
        orders: ['ASC']
      },
      {
        key: 'user_target_type_index',
        type: 'key',
        attributes: ['userId', 'targetId', 'type'],
        orders: ['ASC', 'ASC', 'ASC']
      },
      {
        key: 'active_interactions_index',
        type: 'key',
        attributes: ['isActive', 'type'],
        orders: ['ASC', 'ASC']
      }
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          COLLECTION_ID,
          index.key,
          index.type,
          index.attributes,
          index.orders
        );

        console.log(`  ✅ Created ${index.key} index`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        if (error.code === 409) {
          console.log(`  ℹ️  Index ${index.key} already exists`);
        } else {
          console.log(`  ❌ Failed to create ${index.key}: ${error.message}`);
        }
      }
    }

    console.log('\n📊 Collection Setup Summary:');
    console.log('============================');
    console.log(`✅ Collection: ${collection.name}`);
    console.log(`📁 Collection ID: ${collection.$id}`);
    console.log(`📅 Created: ${new Date(collection.$createdAt).toLocaleString()}`);
    console.log(`📋 Attributes: ${attributes.length} configured`);
    console.log(`🔍 Indexes: ${indexes.length} configured`);

    console.log('\n🎉 Reel Interactions collection setup completed successfully!');
    console.log('\nThis collection will track:');
    console.log('  👀 Views - User content views');
    console.log('  ❤️  Likes - Content likes/unlikes');
    console.log('  💾 Saves - Saved/bookmarked content');
    console.log('  👥 Follows - User follow/unfollow');
    console.log('  💬 Comments - Comment interactions');
    console.log('  📤 Shares - Content sharing');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);

    if (error.code === 401) {
      console.log('🔑 Authentication failed. Check your APPWRITE_API_KEY.');
    } else if (error.code === 404) {
      console.log('🗄️ Database not found. Check your NEXT_PUBLIC_APPWRITE_DATABASE_ID.');
    }

    process.exit(1);
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'create':
    case undefined:
      await createInteractionsCollection();
      break;

    default:
      console.log('Reel Interactions Collection Setup');
      console.log('==================================');
      console.log('');
      console.log('Usage:');
      console.log('  node scripts/create-interactions-collection.js [create]');
      console.log('');
      console.log('Environment Variables Required:');
      console.log('  NEXT_PUBLIC_APPWRITE_ENDPOINT');
      console.log('  NEXT_PUBLIC_APPWRITE_PROJECT_ID');
      console.log('  NEXT_PUBLIC_APPWRITE_DATABASE_ID');
      console.log('  APPWRITE_API_KEY');
      break;
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { createInteractionsCollection };
