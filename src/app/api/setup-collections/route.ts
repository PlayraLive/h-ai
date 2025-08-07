import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/database';
import { Client, Databases } from 'node-appwrite';

// Инициализация Appwrite клиента
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const db = new Databases(client);

export async function POST(request: NextRequest) {
  try {
    const collections = [
      {
        id: COLLECTIONS.COMMENTS,
        name: 'Comments',
        attributes: [
          { key: 'jobId', type: 'string', required: true, array: false },
          { key: 'userId', type: 'string', required: true, array: false },
          { key: 'userName', type: 'string', required: true, array: false },
          { key: 'userAvatar', type: 'string', required: false, array: false },
          { key: 'content', type: 'string', required: true, array: false },
          { key: 'type', type: 'string', required: true, array: false },
          { key: 'parentId', type: 'string', required: false, array: false },
          { key: 'likes', type: 'integer', required: true, array: false },
          { key: 'dislikes', type: 'integer', required: true, array: false },
          { key: 'createdAt', type: 'string', required: true, array: false },
          { key: 'updatedAt', type: 'string', required: true, array: false }
        ]
      },
      {
        id: COLLECTIONS.FAVORITES,
        name: 'Favorites',
        attributes: [
          { key: 'user_id', type: 'string', required: true, array: false },
          { key: 'item_id', type: 'string', required: true, array: false },
          { key: 'item_type', type: 'string', required: true, array: false },
          { key: 'added_at', type: 'string', required: true, array: false },
          { key: 'category', type: 'string', required: false, array: false },
          { key: 'notes', type: 'string', required: false, array: false }
        ]
      },
      {
        id: COLLECTIONS.INTERACTIONS,
        name: 'Interactions',
        attributes: [
          { key: 'user_id', type: 'string', required: true, array: false },
          { key: 'target_id', type: 'string', required: true, array: false },
          { key: 'target_type', type: 'string', required: true, array: false },
          { key: 'interaction_type', type: 'string', required: true, array: false },
          { key: 'created_at', type: 'string', required: true, array: false },
          { key: 'metadata', type: 'string', required: false, array: false }
        ]
      },
      {
        id: COLLECTIONS.CONVERSATIONS,
        name: 'Conversations',
        attributes: [
          { key: 'participants', type: 'string', required: true, array: true },
          { key: 'lastMessage', type: 'string', required: false, array: false },
          { key: 'lastMessageTime', type: 'string', required: false, array: false },
          { key: 'lastMessageBy', type: 'string', required: false, array: false },
          { key: 'unreadCount', type: 'integer', required: true, array: false },
          { key: 'conversation_type', type: 'string', required: true, array: false },
          { key: 'isArchived', type: 'boolean', required: true, array: false },
          { key: 'last_activity', type: 'string', required: true, array: false },
          { key: 'projectId', type: 'string', required: false, array: false },
          { key: 'contractId', type: 'string', required: false, array: false },
          { key: 'ai_order_id', type: 'string', required: false, array: false },
          { key: 'job_id', type: 'string', required: false, array: false },
          { key: 'solution_id', type: 'string', required: false, array: false },
          { key: 'buyer_id', type: 'string', required: false, array: false },
          { key: 'seller_id', type: 'string', required: false, array: false },
          { key: 'context_data', type: 'string', required: false, array: false },
          { key: 'is_pinned', type: 'boolean', required: true, array: false },
          { key: 'tags', type: 'string', required: false, array: true },
          { key: 'project_id', type: 'string', required: false, array: false },
          { key: 'status', type: 'string', required: true, array: false },
          { key: 'avatar', type: 'string', required: false, array: false },
          { key: 'metadata', type: 'string', required: false, array: false },
          { key: 'createdAt', type: 'string', required: true, array: false },
          { key: 'updatedAt', type: 'string', required: true, array: false }
        ]
      },
      {
        id: COLLECTIONS.MESSAGES,
        name: 'Messages',
        attributes: [
          { key: 'conversationId', type: 'string', required: true, array: false },
          { key: 'senderId', type: 'string', required: true, array: false },
          { key: 'senderName', type: 'string', required: true, array: false },
          { key: 'senderAvatar', type: 'string', required: false, array: false },
          { key: 'content', type: 'string', required: true, array: false },
          { key: 'messageType', type: 'string', required: true, array: false },
          { key: 'attachments', type: 'string', required: false, array: true },
          { key: 'isRead', type: 'boolean', required: true, array: false },
          { key: 'createdAt', type: 'string', required: true, array: false },
          { key: 'updatedAt', type: 'string', required: true, array: false }
        ]
      }
    ];

    const results = [];

    for (const collection of collections) {
      try {
        // Проверяем, существует ли коллекция
        try {
          await db.getCollection(DATABASE_ID, collection.id);
          results.push({ collection: collection.id, status: 'exists' });
        } catch (error: any) {
          if (error.code === 404) {
            // Создаем коллекцию
            await db.createCollection(DATABASE_ID, collection.id, collection.name);
            
                         // Создаем атрибуты
             for (const attr of collection.attributes) {
               if (attr.type === 'string') {
                 await db.createStringAttribute(
                   DATABASE_ID,
                   collection.id,
                   attr.key,
                   attr.required,
                   attr.array ? undefined : 255,
                   attr.array
                 );
               } else if (attr.type === 'integer') {
                 await db.createIntegerAttribute(
                   DATABASE_ID,
                   collection.id,
                   attr.key,
                   attr.required,
                   undefined,
                   attr.array
                 );
               } else if (attr.type === 'boolean') {
                 await db.createBooleanAttribute(
                   DATABASE_ID,
                   collection.id,
                   attr.key,
                   attr.required,
                   undefined,
                   attr.array
                 );
               }
             }
            
            results.push({ collection: collection.id, status: 'created' });
          } else {
            results.push({ collection: collection.id, status: 'error', error: error.message });
          }
        }
      } catch (error: any) {
        results.push({ collection: collection.id, status: 'error', error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error: any) {
    console.error('Error setting up collections:', error);
    return NextResponse.json(
      { error: 'Failed to setup collections', details: error.message },
      { status: 500 }
    );
  }
}
