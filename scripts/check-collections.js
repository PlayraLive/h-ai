#!/usr/bin/env node

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Configuration
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '687759fb003c8bd76b93';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '687796e3001241f7de17';
const API_KEY = process.env.APPWRITE_API_KEY;

// Initialize client
const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// Required collections for the platform
const requiredCollections = {
  // Core collections
  'users': {
    description: 'Пользователи платформы',
    required: ['name', 'email', 'userType', 'skills']
  },
  'jobs': {
    description: 'Заказы/работы',
    required: ['title', 'description', 'category', 'skills', 'budgetType', 'budgetMin', 'budgetMax', 'duration', 'clientId', 'status']
  },
  'applications': {
    description: 'Заявки на работы',
    required: ['jobId', 'freelancerId', 'coverLetter', 'proposedBudget', 'proposedDuration', 'status']
  },
  
  // Communication collections  
  'conversations': {
    description: 'Чаты/беседы',
    required: ['participants', 'conversation_type', 'title', 'last_activity']
  },
  'messages': {
    description: 'Сообщения в чатах',
    required: ['conversation_id', 'sender_id', 'content', 'message_type']
  },
  'notifications': {
    description: 'Уведомления',
    required: ['user_id', 'title', 'message', 'type', 'channels', 'status']
  },
  
  // AI Specialists collections
  'ai_specialists': {
    description: 'AI специалисты',
    required: ['name', 'title', 'description', 'category', 'skills', 'monthlyPrice', 'taskPrice']
  },
  'ai_conversations': {
    description: 'AI беседы',
    required: ['user_id', 'specialist_id', 'conversation_type', 'context_data']
  },
  'ai_messages': {
    description: 'AI сообщения',
    required: ['conversation_id', 'sender_id', 'content', 'message_type']
  },
  'orders': {
    description: 'AI заказы',
    required: ['client_id', 'specialist_id', 'order_type', 'amount', 'status']
  },
  
  // Portfolio collections
  'portfolio': {
    description: 'Портфолио работ',
    required: ['user_id', 'title', 'description', 'category', 'tools', 'images']
  },
  
  // Review collections
  'reviews': {
    description: 'Отзывы и рейтинги',
    required: ['job_id', 'client_id', 'freelancer_id', 'rating', 'comment']
  },
  
  // Payment collections
  'payments': {
    description: 'Платежи',
    required: ['job_id', 'client_id', 'freelancer_id', 'amount', 'status', 'method']
  },
  
  // Invitation collections
  'invitations': {
    description: 'Приглашения на работы',
    required: ['job_id', 'freelancer_id', 'client_id', 'status', 'message']
  }
};

async function checkCollections() {
  try {
    console.log('🔍 Checking required collections for AI Freelance Platform...\n');

    const existingCollections = [];
    const missingCollections = [];
    const incompleteCollections = [];

    for (const [collectionId, collectionInfo] of Object.entries(requiredCollections)) {
      console.log(`📋 Checking ${collectionId} (${collectionInfo.description}):`);
      
      try {
        const collection = await databases.getCollection(DATABASE_ID, collectionId);
        console.log(`  ✅ Exists: ${collection.name}`);
        console.log(`  📊 Total attributes: ${collection.attributes.length}`);
        
        // Check required attributes
        const missingAttributes = [];
        const existingAttributeKeys = collection.attributes.map(attr => attr.key);
        
        for (const requiredAttr of collectionInfo.required) {
          if (!existingAttributeKeys.includes(requiredAttr)) {
            missingAttributes.push(requiredAttr);
          }
        }
        
        if (missingAttributes.length > 0) {
          console.log(`  ⚠️  Missing required attributes: ${missingAttributes.join(', ')}`);
          incompleteCollections.push({
            id: collectionId,
            missing: missingAttributes
          });
        } else {
          console.log(`  ✅ All required attributes present`);
        }
        
        // Show all attributes
        console.log('     Attributes:');
        collection.attributes.forEach(attr => {
          const required = attr.required ? '(required)' : '(optional)';
          const isRequired = collectionInfo.required.includes(attr.key) ? '🔹' : '🔸';
          console.log(`       ${isRequired} ${attr.key}: ${attr.type} ${required}`);
        });
        
        // Show indexes
        if (collection.indexes.length > 0) {
          console.log('     Indexes:');
          collection.indexes.forEach(index => {
            console.log(`       - ${index.key}: ${index.type}`);
          });
        }
        
        existingCollections.push(collectionId);
        
      } catch (error) {
        if (error.code === 404) {
          console.log(`  ❌ Missing: ${collectionId}`);
          missingCollections.push(collectionId);
        } else {
          console.log(`  💥 Error: ${error.message}`);
        }
      }
      
      console.log(''); // Empty line for readability
    }

    // Summary
    console.log('📈 SUMMARY:');
    console.log(`  ✅ Existing collections: ${existingCollections.length}/${Object.keys(requiredCollections).length}`);
    console.log(`  ❌ Missing collections: ${missingCollections.length}`);
    console.log(`  ⚠️  Incomplete collections: ${incompleteCollections.length}`);
    
    if (missingCollections.length > 0) {
      console.log('\n🚨 Missing Collections:');
      missingCollections.forEach(id => {
        console.log(`  - ${id}: ${requiredCollections[id].description}`);
      });
    }
    
    if (incompleteCollections.length > 0) {
      console.log('\n⚠️  Incomplete Collections:');
      incompleteCollections.forEach(({id, missing}) => {
        console.log(`  - ${id}: missing attributes [${missing.join(', ')}]`);
      });
    }
    
    if (existingCollections.length === Object.keys(requiredCollections).length && incompleteCollections.length === 0) {
      console.log('\n🎉 All required collections are present and complete!');
    } else {
      console.log('\n📋 Next steps:');
      if (missingCollections.length > 0) {
        console.log('  1. Run collection creation scripts for missing collections');
      }
      if (incompleteCollections.length > 0) {
        console.log('  2. Add missing attributes to incomplete collections');
      }
      console.log('  3. Set up proper permissions for all collections');
      console.log('  4. Test the application functionality');
    }

  } catch (error) {
    console.error('💥 Check failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check your .env.local file has correct Appwrite credentials');
    console.log('  2. Verify API key has proper permissions');
    console.log('  3. Ensure database exists in your Appwrite project');
  }
}

// Run the check
checkCollections();
