#!/usr/bin/env node

const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Appwrite configuration
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Collection schemas
const collections = {
  jobs: {
    id: 'jobs',
    name: 'Jobs',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 10000, required: true },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'subcategory', type: 'string', size: 100, required: false },
      { key: 'skills', type: 'string', size: 1000, required: false, array: true },
      { key: 'budgetType', type: 'string', size: 20, required: true },
      { key: 'budgetMin', type: 'integer', required: true },
      { key: 'budgetMax', type: 'integer', required: true },
      { key: 'currency', type: 'string', size: 10, required: false, default: 'USD' },
      { key: 'duration', type: 'string', size: 100, required: false },
      { key: 'experienceLevel', type: 'string', size: 50, required: false },
      { key: 'location', type: 'string', size: 255, required: false },
      { key: 'clientId', type: 'string', size: 100, required: true },
      { key: 'clientName', type: 'string', size: 255, required: true },
      { key: 'clientCompany', type: 'string', size: 255, required: false },
      { key: 'clientAvatar', type: 'string', size: 500, required: false },
      { key: 'featured', type: 'boolean', required: false, default: false },
      { key: 'urgent', type: 'boolean', required: false, default: false },
      { key: 'deadline', type: 'datetime', required: false },
      { key: 'status', type: 'string', size: 50, required: false, default: 'open' },
      { key: 'proposals', type: 'integer', required: false, default: 0 },
      { key: 'attachments', type: 'string', size: 500, required: false, array: true },
      { key: 'tags', type: 'string', size: 100, required: false, array: true }
    ]
  },
  users: {
    id: 'users',
    name: 'Users',
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'avatar', type: 'string', size: 500, required: false },
      { key: 'userType', type: 'string', size: 50, required: true },
      { key: 'company', type: 'string', size: 255, required: false },
      { key: 'bio', type: 'string', size: 2000, required: false },
      { key: 'skills', type: 'string', size: 100, required: false, array: true },
      { key: 'hourlyRate', type: 'integer', required: false },
      { key: 'location', type: 'string', size: 255, required: false },
      { key: 'portfolio', type: 'string', size: 500, required: false, array: true },
      { key: 'rating', type: 'float', required: false, default: 0 },
      { key: 'completedJobs', type: 'integer', required: false, default: 0 },
      { key: 'verified', type: 'boolean', required: false, default: false }
    ]
  },
  proposals: {
    id: 'proposals',
    name: 'Proposals',
    attributes: [
      { key: 'jobId', type: 'string', size: 100, required: true },
      { key: 'freelancerId', type: 'string', size: 100, required: true },
      { key: 'clientId', type: 'string', size: 100, required: true },
      { key: 'coverLetter', type: 'string', size: 5000, required: true },
      { key: 'bidAmount', type: 'integer', required: true },
      { key: 'deliveryTime', type: 'integer', required: true },
      { key: 'status', type: 'string', size: 50, required: false, default: 'pending' },
      { key: 'attachments', type: 'string', size: 500, required: false, array: true }
    ]
  },
  projects: {
    id: 'projects',
    name: 'Projects',
    attributes: [
      { key: 'jobId', type: 'string', size: 100, required: true },
      { key: 'freelancerId', type: 'string', size: 100, required: true },
      { key: 'clientId', type: 'string', size: 100, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'budget', type: 'integer', required: true },
      { key: 'status', type: 'string', size: 50, required: false, default: 'active' },
      { key: 'startDate', type: 'datetime', required: true },
      { key: 'endDate', type: 'datetime', required: false },
      { key: 'deliverables', type: 'string', size: 500, required: false, array: true }
    ]
  },
  messages: {
    id: 'messages',
    name: 'Messages',
    attributes: [
      { key: 'conversationId', type: 'string', size: 100, required: true },
      { key: 'senderId', type: 'string', size: 100, required: true },
      { key: 'receiverId', type: 'string', size: 100, required: true },
      { key: 'content', type: 'string', size: 5000, required: true },
      { key: 'messageType', type: 'string', size: 50, required: false, default: 'text' },
      { key: 'attachments', type: 'string', size: 500, required: false, array: true },
      { key: 'read', type: 'boolean', required: false, default: false }
    ]
  },
  conversations: {
    id: 'conversations',
    name: 'Conversations',
    attributes: [
      { key: 'participants', type: 'string', size: 100, required: true, array: true },
      { key: 'lastMessage', type: 'string', size: 500, required: false },
      { key: 'lastMessageTime', type: 'datetime', required: false },
      { key: 'projectId', type: 'string', size: 100, required: false }
    ]
  },
  reviews: {
    id: 'reviews',
    name: 'Reviews',
    attributes: [
      { key: 'projectId', type: 'string', size: 100, required: true },
      { key: 'reviewerId', type: 'string', size: 100, required: true },
      { key: 'revieweeId', type: 'string', size: 100, required: true },
      { key: 'rating', type: 'integer', required: true },
      { key: 'comment', type: 'string', size: 2000, required: false },
      { key: 'reviewType', type: 'string', size: 50, required: true }
    ]
  },
  payments: {
    id: 'payments',
    name: 'Payments',
    attributes: [
      { key: 'projectId', type: 'string', size: 100, required: true },
      { key: 'payerId', type: 'string', size: 100, required: true },
      { key: 'payeeId', type: 'string', size: 100, required: true },
      { key: 'amount', type: 'integer', required: true },
      { key: 'currency', type: 'string', size: 10, required: false, default: 'USD' },
      { key: 'status', type: 'string', size: 50, required: false, default: 'pending' },
      { key: 'paymentMethod', type: 'string', size: 50, required: true },
      { key: 'transactionId', type: 'string', size: 255, required: false }
    ]
  },
  notifications: {
    id: 'notifications',
    name: 'Notifications',
    attributes: [
      { key: 'userId', type: 'string', size: 100, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'message', type: 'string', size: 1000, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'read', type: 'boolean', required: false, default: false },
      { key: 'actionUrl', type: 'string', size: 500, required: false }
    ]
  },
  categories: {
    id: 'categories',
    name: 'Categories',
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'slug', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'icon', type: 'string', size: 100, required: false },
      { key: 'parentId', type: 'string', size: 100, required: false }
    ]
  },
  skills: {
    id: 'skills',
    name: 'Skills',
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'slug', type: 'string', size: 255, required: true },
      { key: 'categoryId', type: 'string', size: 100, required: false },
      { key: 'popularity', type: 'integer', required: false, default: 0 }
    ]
  }
};

async function createCollection(collectionData) {
  try {
    console.log(`Creating collection: ${collectionData.name}...`);
    
    // Create collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      collectionData.id,
      collectionData.name
    );
    
    console.log(`✅ Collection ${collectionData.name} created successfully`);
    
    // Add attributes
    for (const attr of collectionData.attributes) {
      try {
        console.log(`  Adding attribute: ${attr.key}...`);
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            collectionData.id,
            attr.key,
            attr.size,
            attr.required || false,
            attr.default,
            attr.array || false
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            collectionData.id,
            attr.key,
            attr.required || false,
            attr.min,
            attr.max,
            attr.default,
            attr.array || false
          );
        } else if (attr.type === 'float') {
          await databases.createFloatAttribute(
            DATABASE_ID,
            collectionData.id,
            attr.key,
            attr.required || false,
            attr.min,
            attr.max,
            attr.default,
            attr.array || false
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            collectionData.id,
            attr.key,
            attr.required || false,
            attr.default,
            attr.array || false
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            collectionData.id,
            attr.key,
            attr.required || false,
            attr.default,
            attr.array || false
          );
        }
        
        console.log(`    ✅ Attribute ${attr.key} added`);
        
        // Wait a bit between attribute creations
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        if (error.code === 409) {
          console.log(`    ⚠️  Attribute ${attr.key} already exists`);
        } else {
          console.error(`    ❌ Error creating attribute ${attr.key}:`, error.message);
        }
      }
    }
    
    console.log(`🎉 Collection ${collectionData.name} setup completed!\n`);
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️  Collection ${collectionData.name} already exists\n`);
    } else {
      console.error(`❌ Error creating collection ${collectionData.name}:`, error.message);
    }
  }
}

async function setupCollections() {
  console.log('🚀 Starting Appwrite collections setup...\n');
  
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 
      !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 
      !process.env.APPWRITE_API_KEY ||
      !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
    console.error('❌ Missing required environment variables!');
    console.log('Required variables:');
    console.log('- NEXT_PUBLIC_APPWRITE_ENDPOINT');
    console.log('- NEXT_PUBLIC_APPWRITE_PROJECT_ID');
    console.log('- APPWRITE_API_KEY');
    console.log('- NEXT_PUBLIC_APPWRITE_DATABASE_ID');
    process.exit(1);
  }
  
  console.log('📋 Environment variables loaded:');
  console.log(`- Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
  console.log(`- Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
  console.log(`- Database: ${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}\n`);
  
  // Create all collections
  for (const [key, collectionData] of Object.entries(collections)) {
    await createCollection(collectionData);
  }
  
  console.log('🎉 All collections setup completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Set up permissions for each collection in Appwrite Console');
  console.log('2. Test the application with real data');
  console.log('3. Add sample data if needed');
}

// Run the setup
setupCollections().catch(console.error);
