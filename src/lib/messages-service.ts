import { databases, ID, Query, DATABASE_ID, COLLECTIONS, client } from './appwrite';

export interface Message {
  $id: string;
  text: string;
  senderId: string;
  receiverId: string;
  conversationId: string; // Исправлено поле
  timestamp: string;
  read: boolean;
  messageType?: 'text' | 'image' | 'file' | 'system' | 'order_card';
  attachments?: string[];
  editedAt?: string;
  replyTo?: string;
}

export interface Conversation {
  $id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: Record<string, number>;
  projectId?: string;
  projectTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatUser {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  online: boolean;
  lastSeen: string;
  userType: 'freelancer' | 'client';
}

export class MessagesService {
  private readonly DATABASE_ID = DATABASE_ID;
  private readonly MESSAGES_COLLECTION = COLLECTIONS.MESSAGES;
  private readonly CONVERSATIONS_COLLECTION = COLLECTIONS.CONVERSATIONS;
  private readonly USERS_COLLECTION = COLLECTIONS.USERS;
  private subscriptions: Map<string, () => void> = new Map();

  // Проверить существование коллекций
  private async checkCollectionsExist(): Promise<boolean> {
    try {
      await databases.getCollection(this.DATABASE_ID, this.MESSAGES_COLLECTION);
      await databases.getCollection(this.DATABASE_ID, this.CONVERSATIONS_COLLECTION);
      return true;
    } catch (error) {
      console.warn('⚠️ Messages collections not found. Please create them in Appwrite Console.');
      return false;
    }
  }

  // Получить все разговоры пользователя
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      // Проверяем существование коллекций
      const collectionsExist = await this.checkCollectionsExist();
      if (!collectionsExist) {
        console.log('📋 Collections not found. Returning empty conversations list.');
        return [];
      }

      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.CONVERSATIONS_COLLECTION,
        [
          Query.contains('participants', userId),
          Query.orderDesc('updatedAt'),
          Query.limit(50)
        ]
      );

      return response.documents as Conversation[];
    } catch (error: any) {
      console.error('Error getting user conversations:', error);

      // Если коллекция не существует или атрибуты не найдены
      if (error.code === 404 || error.message?.includes('Attribute not found')) {
        console.log('⚠️ Conversations collection or attributes not found. Please create them in Appwrite Console.');
        console.log('📋 Required attributes: participants, updatedAt, lastMessage, lastMessageTime, unreadCount, createdAt');
      }

      return [];
    }
  }

  // Получить сообщения разговора
  async getConversationMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    try {
      // Проверяем существование коллекций
      const collectionsExist = await this.checkCollectionsExist();
      if (!collectionsExist) {
        console.log('📋 Collections not found. Returning empty messages list.');
        return [];
      }

      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.MESSAGES_COLLECTION,
        [
          Query.equal('conversationId', conversationId), // Исправлено поле
          Query.orderDesc('timestamp'),
          Query.limit(limit)
        ]
      );

      return response.documents.reverse() as Message[];
    } catch (error: any) {
      console.error('Error getting conversation messages:', error);

      // Если коллекция не существует или атрибуты не найдены
      if (error.code === 404 || error.message?.includes('Attribute not found')) {
        console.log('⚠️ Messages collection or attributes not found. Please create them in Appwrite Console.');
        console.log('📋 Required attributes: conversationId, timestamp, text, senderId, receiverId, read, messageType');
      }

      return [];
    }
  }

  // Отправить сообщение
  async sendMessage(
    senderId: string,
    receiverId: string,
    text: string,
    conversationId?: string,
    projectId?: string
  ): Promise<{ success: boolean; message?: Message; conversation?: Conversation; error?: string }> {
    try {
      console.log('📤 Sending message:', { senderId, receiverId, text, conversationId });

      // Проверяем существование коллекций
      const collectionsExist = await this.checkCollectionsExist();
      if (!collectionsExist) {
        return {
          success: false,
          error: 'Messages collections not found. Please create them in Appwrite Console first.'
        };
      }

      let conversation: Conversation;

      // Если нет ID разговора, создаем новый или находим существующий
      if (!conversationId) {
        console.log('🔍 Finding or creating conversation...');
        conversation = await this.findOrCreateConversation(senderId, receiverId, projectId);
      } else {
        console.log('📖 Getting existing conversation:', conversationId);
        const existingConversation = await databases.getDocument(
          this.DATABASE_ID,
          this.CONVERSATIONS_COLLECTION,
          conversationId
        );
        conversation = existingConversation as Conversation;
      }

      console.log('💬 Creating message in conversation:', conversation.$id);

      // Создаем сообщение
      const message = await databases.createDocument(
        this.DATABASE_ID,
        this.MESSAGES_COLLECTION,
        ID.unique(),
        {
          text,
          senderId: senderId,
          receiverId: receiverId,
          conversationId: conversation.$id,
          timestamp: new Date().toISOString(),
          read: false,
          messageType: 'text',
          projectId: projectId
        }
      );

      console.log('✅ Message created:', message.$id);

      // Обновляем разговор
      console.log('🔄 Updating conversation...');
      const updatedConversation = await this.updateConversationLastMessage(
        conversation.$id,
        text,
        senderId,
        receiverId
      );

      console.log('✅ Message sent successfully');

      return {
        success: true,
        message: message as Message,
        conversation: updatedConversation
      };
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      return {
        success: false,
        error: error.message || 'Failed to send message'
      };
    }
  }

  // Найти или создать разговор
  private async findOrCreateConversation(
    user1Id: string,
    user2Id: string,
    projectId?: string
  ): Promise<Conversation> {
    try {
      // Ищем существующий разговор
      const existingConversations = await databases.listDocuments(
        this.DATABASE_ID,
        this.CONVERSATIONS_COLLECTION,
        [
          Query.contains('participants', user1Id),
          Query.contains('participants', user2Id),
          Query.limit(1)
        ]
      );

      if (existingConversations.documents.length > 0) {
        return existingConversations.documents[0] as Conversation;
      }

      // Создаем новый разговор
      const conversation = await databases.createDocument(
        this.DATABASE_ID,
        this.CONVERSATIONS_COLLECTION,
        ID.unique(),
        {
          participants: [user1Id, user2Id],
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: JSON.stringify({ [user1Id]: 0, [user2Id]: 0 }),
          projectId: projectId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      return conversation as Conversation;
    } catch (error) {
      console.error('Error finding/creating conversation:', error);
      throw error;
    }
  }

  // Обновить последнее сообщение разговора
  private async updateConversationLastMessage(
    conversationId: string,
    lastMessage: string,
    senderId: string,
    receiverId: string
  ): Promise<Conversation> {
    try {
      const conversation = await databases.getDocument(
        this.DATABASE_ID,
        this.CONVERSATIONS_COLLECTION,
        conversationId
      ) as Conversation;

      const currentUnreadCount = typeof conversation.unreadCount === 'string'
        ? JSON.parse(conversation.unreadCount)
        : conversation.unreadCount || {};

      const updatedUnreadCount = { ...currentUnreadCount };
      updatedUnreadCount[receiverId] = (updatedUnreadCount[receiverId] || 0) + 1;

      const updatedConversation = await databases.updateDocument(
        this.DATABASE_ID,
        this.CONVERSATIONS_COLLECTION,
        conversationId,
        {
          lastMessage: lastMessage,
          lastMessageTime: new Date().toISOString(),
          unreadCount: JSON.stringify(updatedUnreadCount),
          updatedAt: new Date().toISOString()
        }
      );

      return updatedConversation as Conversation;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  // Отметить сообщения как прочитанные
  async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      // Получаем непрочитанные сообщения
      const unreadMessages = await databases.listDocuments(
        this.DATABASE_ID,
        this.MESSAGES_COLLECTION,
        [
          Query.equal('conversationId', conversationId),
          Query.equal('receiverId', userId),
          Query.equal('read', false)
        ]
      );

      // Отмечаем как прочитанные
      const updatePromises = unreadMessages.documents.map(message =>
        databases.updateDocument(
          this.DATABASE_ID,
          this.MESSAGES_COLLECTION,
          message.$id,
          { read: true }
        )
      );

      await Promise.all(updatePromises);

      // Обновляем счетчик непрочитанных в разговоре
      const conversation = await databases.getDocument(
        this.DATABASE_ID,
        this.CONVERSATIONS_COLLECTION,
        conversationId
      ) as Conversation;

      const currentUnreadCount = typeof conversation.unreadCount === 'string'
        ? JSON.parse(conversation.unreadCount)
        : conversation.unreadCount || {};

      const updatedUnreadCount = { ...currentUnreadCount };
      updatedUnreadCount[userId] = 0;

      await databases.updateDocument(
        this.DATABASE_ID,
        this.CONVERSATIONS_COLLECTION,
        conversationId,
        { unreadCount: JSON.stringify(updatedUnreadCount) }
      );

      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  // Получить информацию о пользователе
  async getUserInfo(userId: string): Promise<ChatUser | null> {
    try {
      const user = await databases.getDocument(
        this.DATABASE_ID,
        this.USERS_COLLECTION,
        userId
      );

      return {
        $id: user.$id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        online: user.online || false,
        lastSeen: user.lastSeen || new Date().toISOString(),
        userType: user.userType || 'freelancer'
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  // Начать разговор с пользователем
  async startConversation(
    currentUserId: string,
    targetUserId: string,
    projectId?: string,
    initialMessage?: string
  ): Promise<{ success: boolean; conversationId?: string }> {
    try {
      const conversation = await this.findOrCreateConversation(
        currentUserId,
        targetUserId,
        projectId
      );

      if (initialMessage) {
        await this.sendMessage(
          currentUserId,
          targetUserId,
          initialMessage,
          conversation.$id,
          projectId
        );
      }

      return {
        success: true,
        conversationId: conversation.$id
      };
    } catch (error) {
      console.error('Error starting conversation:', error);
      return { success: false };
    }
  }

  // Поиск пользователей для начала разговора
  async searchUsers(query: string, currentUserId: string): Promise<ChatUser[]> {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.USERS_COLLECTION,
        [
          Query.search('name', query),
          Query.notEqual('$id', currentUserId),
          Query.limit(10)
        ]
      );

      return response.documents.map(user => ({
        $id: user.$id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        online: user.online || false,
        lastSeen: user.lastSeen || new Date().toISOString(),
        userType: user.userType || 'freelancer'
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Получить статистику сообщений
  async getMessageStats(userId: string): Promise<{
    totalConversations: number;
    unreadMessages: number;
    todayMessages: number;
  }> {
    try {
      const conversations = await this.getUserConversations(userId);
      const totalConversations = conversations.length;
      
      const unreadMessages = conversations.reduce((total, conv) => {
        const unreadCount = typeof conv.unreadCount === 'string'
          ? JSON.parse(conv.unreadCount)
          : conv.unreadCount || {};
        return total + (unreadCount[userId] || 0);
      }, 0);

      // Подсчитываем сообщения за сегодня
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayMessagesResponse = await databases.listDocuments(
        this.DATABASE_ID,
        this.MESSAGES_COLLECTION,
        [
          Query.equal('senderId', userId),
          Query.greaterThan('timestamp', today.toISOString())
        ]
      );

      return {
        totalConversations,
        unreadMessages,
        todayMessages: todayMessagesResponse.total
      };
    } catch (error) {
      console.error('Error getting message stats:', error);
      return {
        totalConversations: 0,
        unreadMessages: 0,
        todayMessages: 0
      };
    }
  }

  // Real-time подписки
  subscribeToConversation(
    conversationId: string,
    onMessage: (message: Message) => void,
    onUpdate: (conversation: Conversation) => void
  ): () => void {
    console.log('🔔 Subscribing to conversation:', conversationId);

    // Подписываемся на новые сообщения в разговоре
    const messagesChannel = `databases.${this.DATABASE_ID}.collections.${this.MESSAGES_COLLECTION}.documents`;
    const conversationChannel = `databases.${this.DATABASE_ID}.collections.${this.CONVERSATIONS_COLLECTION}.documents.${conversationId}`;

    const unsubscribe = client.subscribe([messagesChannel, conversationChannel], (response) => {
      console.log('📨 Real-time update:', response);

      if (response.events.some(event => event.includes('messages'))) {
        // Новое сообщение
        const message = response.payload as Message;
        if (message.conversationId === conversationId) {
          onMessage(message);
        }
      }

      if (response.events.some(event => event.includes('conversations'))) {
        // Обновление разговора
        const conversation = response.payload as Conversation;
        onUpdate(conversation);
      }
    });

    // Сохраняем подписку для отмены
    const subscriptionKey = `conversation-${conversationId}`;
    this.subscriptions.set(subscriptionKey, unsubscribe);

    return unsubscribe;
  }

  // Подписка на все разговоры пользователя
  subscribeToUserConversations(
    userId: string,
    onNewConversation: (conversation: Conversation) => void,
    onConversationUpdate: (conversation: Conversation) => void
  ): () => void {
    console.log('🔔 Subscribing to user conversations:', userId);

    const conversationsChannel = `databases.${this.DATABASE_ID}.collections.${this.CONVERSATIONS_COLLECTION}.documents`;

    const unsubscribe = client.subscribe([conversationsChannel], (response) => {
      console.log('📨 Conversations update:', response);

      const conversation = response.payload as Conversation;

      // Проверяем что пользователь участвует в разговоре
      if (conversation.participants.includes(userId)) {
        if (response.events.some(event => event.includes('.create'))) {
          onNewConversation(conversation);
        } else if (response.events.some(event => event.includes('.update'))) {
          onConversationUpdate(conversation);
        }
      }
    });

    const subscriptionKey = `user-conversations-${userId}`;
    this.subscriptions.set(subscriptionKey, unsubscribe);

    return unsubscribe;
  }

  // Отписаться от всех подписок
  unsubscribeAll(): void {
    console.log('🔕 Unsubscribing from all real-time updates');

    this.subscriptions.forEach((unsubscribe) => {
      unsubscribe();
    });

    this.subscriptions.clear();
  }

  // Отписаться от конкретной подписки
  unsubscribeFromConversation(conversationId: string): void {
    const subscriptionKey = `conversation-${conversationId}`;
    const unsubscribe = this.subscriptions.get(subscriptionKey);

    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(subscriptionKey);
      console.log('🔕 Unsubscribed from conversation:', conversationId);
    }
  }

  // Обновить статус онлайн пользователя
  async updateUserOnlineStatus(userId: string, online: boolean): Promise<boolean> {
    try {
      await databases.updateDocument(
        this.DATABASE_ID,
        this.USERS_COLLECTION,
        userId,
        {
          online,
          lastSeen: new Date().toISOString()
        }
      );

      console.log(`👤 User ${userId} status updated: ${online ? 'online' : 'offline'}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      return false;
    }
  }

  // Отправить уведомление о типизации
  async sendTypingIndicator(conversationId: string, userId: string, typing: boolean): Promise<void> {
    // Можно использовать временный документ или WebSocket для индикатора печати
    console.log(`⌨️ User ${userId} ${typing ? 'started' : 'stopped'} typing in ${conversationId}`);
  }
}
