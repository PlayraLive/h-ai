import { databases, Permission, Role, DATABASE_ID, COLLECTIONS } from './appwrite';

export class MessagesCollectionsSetup {
  private readonly DATABASE_ID = DATABASE_ID;
  private readonly MESSAGES_COLLECTION = COLLECTIONS.MESSAGES;
  private readonly CONVERSATIONS_COLLECTION = COLLECTIONS.CONVERSATIONS;

  // Создать коллекцию сообщений с атрибутами
  async createMessagesCollection() {
    try {
      console.log('📝 Creating messages collection...');

      // Создаем коллекцию
      const collection = await databases.createCollection(
        this.DATABASE_ID,
        this.MESSAGES_COLLECTION,
        'Messages',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );

      console.log('✅ Messages collection created, adding attributes...');

      // Ждем немного чтобы коллекция была готова
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Создаем атрибуты по одному с задержками
      const attributes = [
        { key: 'text', type: 'string', size: 2000, required: true },
        { key: 'sender_id', type: 'string', size: 50, required: true },
        { key: 'receiver_id', type: 'string', size: 50, required: true },
        { key: 'conversation_id', type: 'string', size: 50, required: true },
        { key: 'timestamp', type: 'datetime', required: true },
        { key: 'read', type: 'boolean', required: true, default: false },
        { key: 'message_type', type: 'enum', elements: ['text', 'file', 'image'], required: true, default: 'text' },
        { key: 'file_url', type: 'string', size: 500, required: false },
        { key: 'file_name', type: 'string', size: 255, required: false },
        { key: 'project_id', type: 'string', size: 50, required: false }
      ];

      for (const attr of attributes) {
        try {
          console.log(`  Adding attribute: ${attr.key}`);

          if (attr.type === 'string') {
            await databases.createStringAttribute(
              this.DATABASE_ID,
              this.MESSAGES_COLLECTION,
              attr.key,
              attr.size!,
              attr.required,
              attr.default
            );
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(
              this.DATABASE_ID,
              this.MESSAGES_COLLECTION,
              attr.key,
              attr.required,
              attr.default
            );
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(
              this.DATABASE_ID,
              this.MESSAGES_COLLECTION,
              attr.key,
              attr.required,
              attr.default
            );
          } else if (attr.type === 'enum') {
            await databases.createEnumAttribute(
              this.DATABASE_ID,
              this.MESSAGES_COLLECTION,
              attr.key,
              attr.elements!,
              attr.required,
              attr.default
            );
          }

          // Небольшая задержка между атрибутами
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (attrError: any) {
          console.warn(`⚠️ Could not create attribute ${attr.key}:`, attrError.message);
        }
      }

      console.log('✅ Messages collection setup completed');
      return collection;
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️ Messages collection already exists');
        return null;
      }
      console.error('❌ Error creating messages collection:', error);
      throw error;
    }
  }

  // Создать коллекцию разговоров с атрибутами
  async createConversationsCollection() {
    try {
      console.log('💬 Creating conversations collection...');

      // Создаем коллекцию
      const collection = await databases.createCollection(
        this.DATABASE_ID,
        this.CONVERSATIONS_COLLECTION,
        'Conversations',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );

      console.log('✅ Conversations collection created, adding attributes...');

      // Ждем немного чтобы коллекция была готова
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Создаем атрибуты по одному с задержками
      const attributes = [
        { key: 'participants', type: 'string', size: 50, required: true, array: true },
        { key: 'last_message', type: 'string', size: 500, required: false },
        { key: 'last_message_time', type: 'datetime', required: true },
        { key: 'unread_count', type: 'string', size: 1000, required: false },
        { key: 'project_id', type: 'string', size: 50, required: false },
        { key: 'project_title', type: 'string', size: 255, required: false },
        { key: 'created_at', type: 'datetime', required: true },
        { key: 'updated_at', type: 'datetime', required: true }
      ];

      for (const attr of attributes) {
        try {
          console.log(`  Adding attribute: ${attr.key}`);

          if (attr.type === 'string') {
            await databases.createStringAttribute(
              this.DATABASE_ID,
              this.CONVERSATIONS_COLLECTION,
              attr.key,
              attr.size!,
              attr.required,
              attr.default,
              attr.array
            );
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(
              this.DATABASE_ID,
              this.CONVERSATIONS_COLLECTION,
              attr.key,
              attr.required,
              attr.default
            );
          }

          // Небольшая задержка между атрибутами
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (attrError: any) {
          console.warn(`⚠️ Could not create attribute ${attr.key}:`, attrError.message);
        }
      }

      console.log('✅ Conversations collection setup completed');
      return collection;
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️ Conversations collection already exists');
        return null;
      }
      console.error('❌ Error creating conversations collection:', error);
      throw error;
    }
  }

  // Полная настройка коллекций
  async setupMessagesCollections() {
    try {
      console.log('🚀 Setting up messages collections...');

      // Проверяем существующие коллекции
      const status = await this.checkCollections();

      if (status.both) {
        console.log('✅ All collections already exist and ready!');
        return { success: true, created: false };
      }

      // Создаем недостающие коллекции
      if (!status.messages) {
        await this.createMessagesCollection();
      }

      if (!status.conversations) {
        await this.createConversationsCollection();
      }

      // Ждем немного чтобы все было готово
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Создаем индексы
      await this.createIndexes();

      console.log('🎉 Messages collections setup completed successfully!');
      return { success: true, created: true };
    } catch (error) {
      console.error('❌ Error setting up messages collections:', error);
      return { success: false, error: error };
    }
  }

  // Создать индексы для оптимизации
  async createIndexes() {
    try {
      console.log('🔍 Creating indexes...');

      const indexes = [
        // Индексы для сообщений
        { collection: this.MESSAGES_COLLECTION, key: 'conversation_messages', type: 'key', attributes: ['conversation_id', 'timestamp'] },
        { collection: this.MESSAGES_COLLECTION, key: 'sender_messages', type: 'key', attributes: ['sender_id', 'timestamp'] },
        { collection: this.MESSAGES_COLLECTION, key: 'unread_messages', type: 'key', attributes: ['receiver_id', 'read'] },

        // Индексы для разговоров
        { collection: this.CONVERSATIONS_COLLECTION, key: 'user_conversations', type: 'key', attributes: ['participants', 'updated_at'] },
        { collection: this.CONVERSATIONS_COLLECTION, key: 'project_conversations', type: 'key', attributes: ['project_id'] }
      ];

      for (const index of indexes) {
        try {
          console.log(`  Creating index: ${index.key}`);
          await databases.createIndex(
            this.DATABASE_ID,
            index.collection,
            index.key,
            index.type as any,
            index.attributes
          );
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (indexError: any) {
          if (indexError.code === 409) {
            console.log(`  Index ${index.key} already exists`);
          } else {
            console.warn(`⚠️ Could not create index ${index.key}:`, indexError.message);
          }
        }
      }

      console.log('✅ Indexes setup completed');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
    }
  }

  // Проверить существование коллекций
  async checkCollections() {
    try {
      console.log('🔍 Checking messages collections...');

      const [messagesCollection, conversationsCollection] = await Promise.all([
        databases.getCollection(this.DATABASE_ID, this.MESSAGES_COLLECTION).catch(() => null),
        databases.getCollection(this.DATABASE_ID, this.CONVERSATIONS_COLLECTION).catch(() => null)
      ]);

      const status = {
        messages: !!messagesCollection,
        conversations: !!conversationsCollection,
        both: !!messagesCollection && !!conversationsCollection
      };

      console.log('📊 Collections status:', status);
      return status;
    } catch (error) {
      console.error('❌ Error checking collections:', error);
      return { messages: false, conversations: false, both: false };
    }
  }

  // Получить статистику коллекций
  async getCollectionsStats() {
    try {
      const [messagesResponse, conversationsResponse] = await Promise.all([
        databases.listDocuments(this.DATABASE_ID, this.MESSAGES_COLLECTION, []).catch(() => ({ total: 0, documents: [] })),
        databases.listDocuments(this.DATABASE_ID, this.CONVERSATIONS_COLLECTION, []).catch(() => ({ total: 0, documents: [] }))
      ]);

      return {
        messages: messagesResponse.total,
        conversations: conversationsResponse.total,
        messagesData: messagesResponse.documents,
        conversationsData: conversationsResponse.documents
      };
    } catch (error) {
      console.error('❌ Error getting collections stats:', error);
      return {
        messages: 0,
        conversations: 0,
        messagesData: [],
        conversationsData: []
      };
    }
  }
}
