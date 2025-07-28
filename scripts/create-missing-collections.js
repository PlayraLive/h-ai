#!/usr/bin/env node

const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Collection definitions
const collections = {
  jobs: {
    name: 'Jobs',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'skills', type: 'string', size: 100, required: false, array: true },
      { key: 'budgetType', type: 'string', size: 20, required: true },
      { key: 'budgetMin', type: 'double', required: true },
      { key: 'budgetMax', type: 'double', required: true },
      { key: 'duration', type: 'string', size: 50, required: true },
      { key: 'experienceLevel', type: 'string', size: 20, required: true },
      { key: 'clientId', type: 'string', size: 50, required: true },
      { key: 'clientName', type: 'string', size: 255, required: false },
      { key: 'clientAvatar', type: 'string', size: 500, required: false },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'applicationsCount', type: 'integer', required: true, default: 0 },
      { key: 'viewsCount', type: 'integer', required: true, default: 0 },
      { key: 'featured', type: 'boolean', required: true, default: false },
      { key: 'urgent', type: 'boolean', required: true, default: false },
      { key: 'currency', type: 'string', size: 10, required: true, default: 'USD' },
      { key: 'location', type: 'string', size: 100, required: false },
      { key: 'attachments', type: 'string', size: 500, required: false, array: true }
    ]
  },
  
  applications: {
    name: 'Applications',
    attributes: [
      { key: 'jobId', type: 'string', size: 50, required: true },
      { key: 'freelancerId', type: 'string', size: 50, required: true },
      { key: 'freelancerName', type: 'string', size: 255, required: true },
      { key: 'freelancerAvatar', type: 'string', size: 500, required: false },
      { key: 'freelancerRating', type: 'double', required: false },
      { key: 'coverLetter', type: 'string', size: 2000, required: true },
      { key: 'proposedBudget', type: 'double', required: true },
      { key: 'proposedDuration', type: 'string', size: 100, required: true },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'attachments', type: 'string', size: 500, required: false, array: true },
      { key: 'clientViewed', type: 'boolean', required: true, default: false },
      { key: 'clientResponse', type: 'string', size: 1000, required: false },
      { key: 'appliedAt', type: 'datetime', required: true }
    ]
  },
  
  notifications: {
    name: 'Notifications',
    attributes: [
      { key: 'user_id', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'message', type: 'string', size: 1000, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'action_url', type: 'string', size: 500, required: false },
      { key: 'action_text', type: 'string', size: 100, required: false },
      { key: 'metadata', type: 'string', size: 2000, required: false },
      { key: 'channels', type: 'string', size: 200, required: true },
      { key: 'priority', type: 'string', size: 20, required: true },
      { key: 'schedule_at', type: 'datetime', required: false },
      { key: 'expires_at', type: 'datetime', required: false },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'sent_at', type: 'datetime', required: false },
      { key: 'read_at', type: 'datetime', required: false },
      { key: 'clicked_at', type: 'datetime', required: false },
      { key: 'delivery_status', type: 'string', size: 1000, required: false }
    ]
  },
  
  invitations: {
    name: 'Invitations',
    attributes: [
      { key: 'job_id', type: 'string', size: 50, required: true },
      { key: 'freelancer_id', type: 'string', size: 50, required: true },
      { key: 'client_id', type: 'string', size: 50, required: true },
      { key: 'freelancer_name', type: 'string', size: 255, required: true },
      { key: 'freelancer_avatar', type: 'string', size: 500, required: false },
      { key: 'freelancer_rating', type: 'double', required: false },
      { key: 'freelancer_skills', type: 'string', size: 100, required: false, array: true },
      { key: 'job_title', type: 'string', size: 255, required: true },
      { key: 'job_budget', type: 'string', size: 100, required: true },
      { key: 'message', type: 'string', size: 1000, required: true },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'invited_at', type: 'datetime', required: true },
      { key: 'responded_at', type: 'datetime', required: false },
      { key: 'response_message', type: 'string', size: 1000, required: false }
    ]
  },

  reviews: {
    name: 'Reviews',
    attributes: [
      { key: 'job_id', type: 'string', size: 50, required: true },
      { key: 'client_id', type: 'string', size: 50, required: true },
      { key: 'freelancer_id', type: 'string', size: 50, required: true },
      { key: 'reviewer_type', type: 'string', size: 20, required: true },
      { key: 'rating', type: 'integer', required: true },
      { key: 'comment', type: 'string', size: 2000, required: false },
      { key: 'skills_rating', type: 'string', size: 1000, required: false },
      { key: 'communication', type: 'integer', required: false },
      { key: 'quality', type: 'integer', required: false },
      { key: 'timeliness', type: 'integer', required: false },
      { key: 'would_recommend', type: 'boolean', required: false },
      { key: 'is_public', type: 'boolean', required: true, default: true },
      { key: 'created_at', type: 'datetime', required: true }
    ]
  }
};

async function createMissingCollections() {
  try {
    console.log('🚀 Creating missing collections for AI Freelance Platform...\n');

    for (const [collectionId, collectionData] of Object.entries(collections)) {
      console.log(`📁 Creating ${collectionId} collection...`);
      
      try {
        // Check if collection exists
        await databases.getCollection(DATABASE_ID, collectionId);
        console.log(`  ✅ Collection ${collectionId} already exists`);
        continue;
      } catch (error) {
        if (error.code !== 404) {
          console.log(`  💥 Error checking ${collectionId}: ${error.message}`);
          continue;
        }
      }

      try {
        // Create collection
        const collection = await databases.createCollection(
          DATABASE_ID,
          collectionId,
          collectionData.name,
          [
            Permission.read(Role.any()),
            Permission.create(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any())
          ]
        );
        
        console.log(`  ✅ Created collection: ${collection.name}`);

        // Add attributes
        console.log(`  📝 Adding ${collectionData.attributes.length} attributes...`);
        
        for (const attr of collectionData.attributes) {
          try {
            if (attr.type === 'string') {
              await databases.createStringAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                attr.size,
                attr.required,
                attr.default,
                attr.array || false
              );
            } else if (attr.type === 'integer') {
              await databases.createIntegerAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                attr.required,
                attr.min,
                attr.max,
                attr.default,
                attr.array || false
              );
            } else if (attr.type === 'double') {
              await databases.createFloatAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                attr.required,
                attr.min,
                attr.max,
                attr.default,
                attr.array || false
              );
            } else if (attr.type === 'boolean') {
              await databases.createBooleanAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                attr.required,
                attr.default,
                attr.array || false
              );
            } else if (attr.type === 'datetime') {
              await databases.createDatetimeAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                attr.required,
                attr.default,
                attr.array || false
              );
            }
            
            console.log(`    ✅ ${attr.key}: ${attr.type}`);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (attrError) {
            console.log(`    ❌ Failed to create ${attr.key}: ${attrError.message}`);
          }
        }

        // Create indexes for better performance
        console.log(`  🔍 Creating indexes...`);
        
        const indexPromises = [];
        
        if (collectionId === 'jobs') {
          indexPromises.push(
            databases.createIndex(DATABASE_ID, collectionId, 'clientId_index', 'key', ['clientId']),
            databases.createIndex(DATABASE_ID, collectionId, 'status_index', 'key', ['status']),
            databases.createIndex(DATABASE_ID, collectionId, 'category_index', 'key', ['category'])
          );
        } else if (collectionId === 'applications') {
          indexPromises.push(
            databases.createIndex(DATABASE_ID, collectionId, 'jobId_index', 'key', ['jobId']),
            databases.createIndex(DATABASE_ID, collectionId, 'freelancerId_index', 'key', ['freelancerId'])
          );
        } else if (collectionId === 'notifications') {
          indexPromises.push(
            databases.createIndex(DATABASE_ID, collectionId, 'user_id_index', 'key', ['user_id']),
            databases.createIndex(DATABASE_ID, collectionId, 'status_index', 'key', ['status'])
          );
        }

        try {
          await Promise.all(indexPromises);
          console.log(`    ✅ Indexes created`);
        } catch (indexError) {
          console.log(`    ⚠️ Some indexes failed: ${indexError.message}`);
        }
        
      } catch (createError) {
        console.log(`  ❌ Failed to create ${collectionId}: ${createError.message}`);
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('🎉 Collection creation completed!');
    console.log('\n📋 Next steps:');
    console.log('  1. Run check-collections.js to verify all collections');
    console.log('  2. Adjust permissions as needed in Appwrite Console');
    console.log('  3. Test application functionality');

  } catch (error) {
    console.error('💥 Creation failed:', error);
  }
}

// Run the creation
createMissingCollections();
