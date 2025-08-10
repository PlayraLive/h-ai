// Update Appwrite collections schema for messaging (messages, conversations)
// Usage: node scripts/update-appwrite-messaging-schema.js

/* eslint-disable no-console */
const sdk = require('node-appwrite');

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID;

if (!endpoint || !projectId || !apiKey || !databaseId) {
  console.error('Missing Appwrite env vars. Required: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, NEXT_PUBLIC_APPWRITE_DATABASE_ID, APPWRITE_API_KEY');
  process.exit(1);
}

const client = new sdk.Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new sdk.Databases(client);

async function ensureStringAttribute(collectionId, key, size, required = false, array = false, defaultValue = undefined) {
  try {
    await databases.createStringAttribute(databaseId, collectionId, key, size, required, defaultValue, array);
    console.log(`✓ String attribute '${key}' added to '${collectionId}'`);
  } catch (err) {
    if (err?.code === 409) {
      console.log(`• String attribute '${key}' already exists in '${collectionId}', skipping`);
    } else {
      console.warn(`! Failed to add string attribute '${key}' in '${collectionId}': ${err.message}`);
    }
  }
}

async function ensureBooleanAttribute(collectionId, key, required = false, defaultValue = undefined) {
  try {
    await databases.createBooleanAttribute(databaseId, collectionId, key, required, defaultValue);
    console.log(`✓ Boolean attribute '${key}' added to '${collectionId}'`);
  } catch (err) {
    if (err?.code === 409) {
      console.log(`• Boolean attribute '${key}' already exists in '${collectionId}', skipping`);
    } else {
      console.warn(`! Failed to add boolean attribute '${key}' in '${collectionId}': ${err.message}`);
    }
  }
}

async function ensureDatetimeAttribute(collectionId, key, required = false, defaultValue = undefined) {
  try {
    await databases.createDatetimeAttribute(databaseId, collectionId, key, required, defaultValue);
    console.log(`✓ Datetime attribute '${key}' added to '${collectionId}'`);
  } catch (err) {
    if (err?.code === 409) {
      console.log(`• Datetime attribute '${key}' already exists in '${collectionId}', skipping`);
    } else {
      console.warn(`! Failed to add datetime attribute '${key}' in '${collectionId}': ${err.message}`);
    }
  }
}

async function updateMessagesSchema() {
  const collectionId = 'messages';
  console.log(`\nUpdating '${collectionId}' schema...`);

  // Core IDs
  await ensureStringAttribute(collectionId, 'conversationId', 255, true);
  await ensureStringAttribute(collectionId, 'senderId', 255, true);
  await ensureStringAttribute(collectionId, 'receiverId', 255, true);

  // Content / types
  await ensureStringAttribute(collectionId, 'content', 65535, true);
  await ensureStringAttribute(collectionId, 'messageType', 64, false);
  await ensureStringAttribute(collectionId, 'type', 64, false);

  // Timestamps
  await ensureDatetimeAttribute(collectionId, 'timestamp', false);
  await ensureDatetimeAttribute(collectionId, 'createdAt', true);
  await ensureDatetimeAttribute(collectionId, 'created_at', false);
  await ensureDatetimeAttribute(collectionId, 'editedAt', false);
  await ensureDatetimeAttribute(collectionId, 'readAt', false);

  // Read / flags
  await ensureBooleanAttribute(collectionId, 'isRead', false, false);
  await ensureBooleanAttribute(collectionId, 'read', false, false);
  await ensureBooleanAttribute(collectionId, 'edited', false, false);
  await ensureStringAttribute(collectionId, 'status', 32, false);

  // Sender info
  await ensureStringAttribute(collectionId, 'senderName', 255, false);
  await ensureStringAttribute(collectionId, 'senderAvatar', 2048, false);
  await ensureStringAttribute(collectionId, 'replyTo', 255, false);

  // Payloads as JSON strings for compatibility with existing code
  // Prefer array attribute for attachments if supported in your project; fallback to string
  try {
    await databases.createStringAttribute(databaseId, collectionId, 'attachments', 255, false, undefined, true);
    console.log(`✓ String[] attribute 'attachments' added to '${collectionId}'`);
  } catch (err) {
    if (err?.code === 409) {
      console.log(`• attachments attribute already exists in '${collectionId}', skipping`);
    } else {
      console.warn(`! Failed to add array attachments in '${collectionId}': ${err.message}`);
      await ensureStringAttribute(collectionId, 'attachments', 65535, false);
    }
  }
  await ensureStringAttribute(collectionId, 'reactions', 65535, false);
  await ensureStringAttribute(collectionId, 'metadata', 65535, false);
}

async function updateConversationsSchema() {
  const collectionId = 'conversations';
  console.log(`\nUpdating '${collectionId}' schema...`);

  await ensureStringAttribute(collectionId, 'title', 255, false);
  // participants as array of string IDs
  await ensureStringAttribute(collectionId, 'participants', 255, false, true);

  await ensureStringAttribute(collectionId, 'lastMessage', 2048, false);
  await ensureDatetimeAttribute(collectionId, 'lastMessageAt', false);
  await ensureStringAttribute(collectionId, 'lastMessageBy', 255, false);
  await ensureStringAttribute(collectionId, 'unreadCount', 65535, false);

  await ensureBooleanAttribute(collectionId, 'isArchived', false, false);

  await ensureDatetimeAttribute(collectionId, 'createdAt', false);
  await ensureDatetimeAttribute(collectionId, 'updatedAt', false);
  await ensureDatetimeAttribute(collectionId, 'last_activity', false);

  await ensureStringAttribute(collectionId, 'conversation_type', 64, false);
  await ensureStringAttribute(collectionId, 'status', 64, false);
  await ensureStringAttribute(collectionId, 'avatar', 2048, false);
  await ensureStringAttribute(collectionId, 'metadata', 65535, false);

  // Optional linking fields
  await ensureStringAttribute(collectionId, 'projectId', 255, false);
  await ensureStringAttribute(collectionId, 'contractId', 255, false);
  await ensureStringAttribute(collectionId, 'ai_order_id', 255, false);
  await ensureStringAttribute(collectionId, 'job_id', 255, false);
  await ensureStringAttribute(collectionId, 'solution_id', 255, false);
  await ensureStringAttribute(collectionId, 'buyer_id', 255, false);
  await ensureStringAttribute(collectionId, 'seller_id', 255, false);
  await ensureStringAttribute(collectionId, 'context_data', 65535, false);
  await ensureStringAttribute(collectionId, 'is_pinned', 8, false);
  await ensureStringAttribute(collectionId, 'tags', 65535, false);
  await ensureStringAttribute(collectionId, 'project_id', 255, false);
}

(async () => {
  try {
    console.log('Starting Appwrite messaging schema update...');
    await updateMessagesSchema();
    await updateConversationsSchema();
    console.log('\nSchema update completed.');
  } catch (err) {
    console.error('Schema update failed:', err);
    process.exit(1);
  }
})();


