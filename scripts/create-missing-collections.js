#!/usr/bin/env node

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

async function createMissingCollections() {
  console.log('🔧 Creating Missing Collections...\n');

  // Initialize Appwrite client
  const client = new Client();
  const databases = new Databases(client);

  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  // Missing Collections Schema
  const missingCollections = [
    {
      id: 'milestones',
      name: 'Milestones',
      attributes: [
        { key: 'projectId', type: 'string', size: 255, required: true },
        { key: 'title', type: 'string', size: 255, required: true },
        { key: 'description', type: 'string', size: 1000, required: false },
        { key: 'amount', type: 'double', required: true },
        { key: 'dueDate', type: 'datetime', required: false },
        { key: 'status', type: 'string', size: 50, required: false, default: 'pending' },
        { key: 'completed', type: 'boolean', required: false, default: false },
        { key: 'completedAt', type: 'datetime', required: false }
      ]
    },
    {
      id: 'invoices',
      name: 'Invoices',
      attributes: [
        { key: 'projectId', type: 'string', size: 255, required: true },
        { key: 'clientId', type: 'string', size: 255, required: true },
        { key: 'freelancerId', type: 'string', size: 255, required: true },
        { key: 'amount', type: 'double', required: true },
        { key: 'currency', type: 'string', size: 10, required: false, default: 'USD' },
        { key: 'status', type: 'string', size: 50, required: false, default: 'draft' },
        { key: 'dueDate', type: 'datetime', required: false },
        { key: 'paidAt', type: 'datetime', required: false },
        { key: 'description', type: 'string', size: 1000, required: false }
      ]
    },
    {
      id: 'transactions',
      name: 'Transactions',
      attributes: [
        { key: 'fromUserId', type: 'string', size: 255, required: true },
        { key: 'toUserId', type: 'string', size: 255, required: true },
        { key: 'amount', type: 'double', required: true },
        { key: 'currency', type: 'string', size: 10, required: false, default: 'USD' },
        { key: 'type', type: 'string', size: 50, required: true }, // payment, refund, fee
        { key: 'status', type: 'string', size: 50, required: false, default: 'pending' },
        { key: 'reference', type: 'string', size: 255, required: false },
        { key: 'description', type: 'string', size: 500, required: false }
      ]
    },
    {
      id: 'ratings',
      name: 'Ratings',
      attributes: [
        { key: 'projectId', type: 'string', size: 255, required: true },
        { key: 'raterId', type: 'string', size: 255, required: true },
        { key: 'ratedId', type: 'string', size: 255, required: true },
        { key: 'rating', type: 'integer', required: true, min: 1, max: 5 },
        { key: 'category', type: 'string', size: 100, required: false }, // quality, communication, deadline
        { key: 'comment', type: 'string', size: 1000, required: false }
      ]
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      attributes: [
        { key: 'projectId', type: 'string', size: 255, required: true },
        { key: 'clientId', type: 'string', size: 255, required: true },
        { key: 'freelancerId', type: 'string', size: 255, required: true },
        { key: 'content', type: 'string', size: 2000, required: true },
        { key: 'rating', type: 'integer', required: true, min: 1, max: 5 },
        { key: 'featured', type: 'boolean', required: false, default: false },
        { key: 'approved', type: 'boolean', required: false, default: false }
      ]
    },
    {
      id: 'certifications',
      name: 'Certifications',
      attributes: [
        { key: 'userId', type: 'string', size: 255, required: true },
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'issuer', type: 'string', size: 255, required: true },
        { key: 'issueDate', type: 'datetime', required: false },
        { key: 'expiryDate', type: 'datetime', required: false },
        { key: 'credentialId', type: 'string', size: 255, required: false },
        { key: 'credentialUrl', type: 'string', size: 500, required: false },
        { key: 'verified', type: 'boolean', required: false, default: false }
      ]
    },
    {
      id: 'disputes',
      name: 'Disputes',
      attributes: [
        { key: 'projectId', type: 'string', size: 255, required: true },
        { key: 'complainantId', type: 'string', size: 255, required: true },
        { key: 'respondentId', type: 'string', size: 255, required: true },
        { key: 'reason', type: 'string', size: 100, required: true },
        { key: 'description', type: 'string', size: 2000, required: true },
        { key: 'status', type: 'string', size: 50, required: false, default: 'open' },
        { key: 'resolution', type: 'string', size: 2000, required: false },
        { key: 'resolvedAt', type: 'datetime', required: false }
      ]
    },
    {
      id: 'support_tickets',
      name: 'Support Tickets',
      attributes: [
        { key: 'userId', type: 'string', size: 255, required: true },
        { key: 'subject', type: 'string', size: 255, required: true },
        { key: 'description', type: 'string', size: 2000, required: true },
        { key: 'category', type: 'string', size: 100, required: true },
        { key: 'priority', type: 'string', size: 50, required: false, default: 'medium' },
        { key: 'status', type: 'string', size: 50, required: false, default: 'open' },
        { key: 'assignedTo', type: 'string', size: 255, required: false },
        { key: 'resolvedAt', type: 'datetime', required: false }
      ]
    },
    {
      id: 'reports',
      name: 'Reports',
      attributes: [
        { key: 'reporterId', type: 'string', size: 255, required: true },
        { key: 'reportedId', type: 'string', size: 255, required: true },
        { key: 'type', type: 'string', size: 50, required: true }, // user, job, project, content
        { key: 'reason', type: 'string', size: 100, required: true },
        { key: 'description', type: 'string', size: 1000, required: false },
        { key: 'status', type: 'string', size: 50, required: false, default: 'pending' },
        { key: 'reviewedBy', type: 'string', size: 255, required: false },
        { key: 'reviewedAt', type: 'datetime', required: false }
      ]
    }
  ];

  try {
    for (const collection of missingCollections) {
      console.log(`📁 Creating collection: ${collection.name} (${collection.id})`);
      
      try {
        // Create collection
        const createdCollection = await databases.createCollection(
          DATABASE_ID,
          collection.id,
          collection.name,
          [], // permissions will be set later
          false, // documentSecurity
          true   // enabled
        );

        console.log(`✅ Collection created: ${createdCollection.name}`);

        // Add attributes
        for (const attr of collection.attributes) {
          try {
            let attribute;
            
            if (attr.type === 'string') {
              attribute = await databases.createStringAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.size,
                attr.required,
                attr.default || null,
                attr.array || false
              );
            } else if (attr.type === 'integer') {
              attribute = await databases.createIntegerAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required,
                attr.min || null,
                attr.max || null,
                attr.default || null,
                attr.array || false
              );
            } else if (attr.type === 'double') {
              attribute = await databases.createFloatAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required,
                attr.min || null,
                attr.max || null,
                attr.default || null,
                attr.array || false
              );
            } else if (attr.type === 'boolean') {
              attribute = await databases.createBooleanAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required,
                attr.default || null,
                attr.array || false
              );
            } else if (attr.type === 'datetime') {
              attribute = await databases.createDatetimeAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required,
                attr.default || null,
                attr.array || false
              );
            }

            console.log(`   ✅ Added attribute: ${attr.key} (${attr.type})`);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (attrError) {
            console.log(`   ❌ Error adding attribute ${attr.key}:`, attrError.message);
          }
        }

        console.log('');
        
      } catch (collectionError) {
        if (collectionError.code === 409) {
          console.log(`⚠️  Collection ${collection.name} already exists`);
        } else {
          console.log(`❌ Error creating collection ${collection.name}:`, collectionError.message);
        }
      }
    }

    console.log('🎉 Missing collections setup completed!');

  } catch (error) {
    console.error('❌ Error setting up missing collections:', error.message);
  }
}

// Run the script
createMissingCollections();
