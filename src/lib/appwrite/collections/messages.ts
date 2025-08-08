import { Client, Databases, ID, Query } from 'node-appwrite';

// Инициализация Appwrite клиента для серверной части
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey('standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4');

const databases = new Databases(client);

export const MESSAGES_COLLECTION_ID = 'messages';
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// Интерфейс для сообщения
export interface MessageDocument {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  message_type: 'text' | 'file' | 'system';
  attachments?: string[];
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Создание коллекции сообщений
export async function createMessagesCollection() {
  try {
    // Создаем коллекцию
    await databases.createCollection(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      'Messages'
    );

    // Создаем атрибуты
    await databases.createStringAttribute(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      'conversation_id',
      255,
      true,
      false
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      'sender_id',
      255,
      true,
      false
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      'sender_name',
      255,
      true,
      false
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      'sender_avatar',
      255,
      false,
      false
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      'content',
      1000,
      true,
      false
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      'message_type',
      50,
      true,
      false
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      'attachments',
      255,
      false,
      true // array
    );

    await databases.createBooleanAttribute(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      'is_read',
      true,
      false
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      'created_at',
      255,
      true,
      false
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      'updated_at',
      255,
      true,
      false
    );

    console.log('Messages collection created successfully');
    return true;
  } catch (error: any) {
    if (error.code === 409) {
      console.log('Messages collection already exists');
      return true;
    }
    console.error('Error creating messages collection:', error);
    return false;
  }
}

// Получить сообщения для конверсации
export async function getMessagesByConversationId(conversationId: string, limit: number = 50, offset: number = 0) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [
        Query.equal('conversation_id', conversationId),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );

    return {
      success: true,
      messages: response.documents,
      total: response.total
    };
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return {
      success: false,
      error: error.message,
      messages: [],
      total: 0
    };
  }
}

// Создать новое сообщение
export async function createMessage(messageData: Omit<MessageDocument, '$id' | '$createdAt' | '$updatedAt'>) {
  try {
    const message = await databases.createDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      ID.unique(),
      {
        ...messageData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );

    return {
      success: true,
      message
    };
  } catch (error: any) {
    console.error('Error creating message:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Отметить сообщения как прочитанные
export async function markMessagesAsRead(conversationId: string, userId: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [
        Query.equal('conversation_id', conversationId),
        Query.equal('is_read', false),
        Query.notEqual('sender_id', userId)
      ]
    );

    // Обновляем все непрочитанные сообщения
    for (const message of response.documents) {
      await databases.updateDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        message.$id,
        {
          is_read: true,
          updated_at: new Date().toISOString()
        }
      );
    }

    return {
      success: true,
      updatedCount: response.documents.length
    };
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
