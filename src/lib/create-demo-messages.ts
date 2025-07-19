import { databases, ID, DATABASE_ID, COLLECTIONS } from './appwrite';

export class DemoMessagesCreator {
  private readonly DATABASE_ID = DATABASE_ID;
  private readonly MESSAGES_COLLECTION = COLLECTIONS.MESSAGES;
  private readonly CONVERSATIONS_COLLECTION = COLLECTIONS.CONVERSATIONS;
  private readonly USERS_COLLECTION = COLLECTIONS.USERS;

  // Создать демо разговоры и сообщения
  async createDemoMessages() {
    try {
      console.log('🚀 Creating demo messages...');

      // Проверяем существование коллекций сообщений
      try {
        await databases.getCollection(this.DATABASE_ID, this.MESSAGES_COLLECTION);
        await databases.getCollection(this.DATABASE_ID, this.CONVERSATIONS_COLLECTION);
      } catch (error) {
        console.error('❌ Messages collections not found. Please setup collections first.');
        throw new Error('Messages collections not found. Please setup collections first.');
      }

      // Получаем существующих пользователей
      const usersResponse = await databases.listDocuments(
        this.DATABASE_ID,
        this.USERS_COLLECTION,
        []
      );

      if (usersResponse.documents.length < 2) {
        console.log('⚠️ Need at least 2 users to create conversations');
        throw new Error('Need at least 2 users to create conversations. Please register more users first.');
      }

      const users = usersResponse.documents;
      const freelancers = users.filter(u => u.userType === 'freelancer');
      const clients = users.filter(u => u.userType === 'client');

      // Создаем разговоры между фрилансерами и клиентами
      const conversations = [];
      
      for (let i = 0; i < Math.min(freelancers.length, clients.length, 3); i++) {
        const freelancer = freelancers[i];
        const client = clients[i % clients.length];

        // Создаем разговор
        const conversation = await databases.createDocument(
          this.DATABASE_ID,
          this.CONVERSATIONS_COLLECTION,
          ID.unique(),
          {
            participants: [freelancer.$id, client.$id],
            last_message: '',
            last_message_time: new Date().toISOString(),
            unread_count: JSON.stringify({ [freelancer.$id]: 0, [client.$id]: 0 }),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );

        conversations.push({
          conversation,
          freelancer,
          client
        });

        console.log(`✅ Created conversation between ${freelancer.name} and ${client.name}`);
      }

      // Создаем сообщения для каждого разговора
      const demoMessageTemplates = [
        {
          messages: [
            { sender: 'client', text: "Hi! I've reviewed your portfolio and I'm impressed with your AI work." },
            { sender: 'freelancer', text: "Thank you! I'd love to work on your project. Can you share more details?" },
            { sender: 'client', text: "Sure! We need an AI chatbot for customer service. Budget is $3000." },
            { sender: 'freelancer', text: "That sounds perfect! I can definitely help with that. When do you need it completed?" },
            { sender: 'client', text: "Ideally within 2 weeks. Is that feasible?" }
          ]
        },
        {
          messages: [
            { sender: 'client', text: "Hello! I saw your machine learning expertise. We have a data analysis project." },
            { sender: 'freelancer', text: "Hi! I'd be happy to help. What kind of data analysis do you need?" },
            { sender: 'client', text: "We need to predict sales trends using our historical data." },
            { sender: 'freelancer', text: "I have extensive experience with predictive modeling. Can you share the dataset size?" }
          ]
        },
        {
          messages: [
            { sender: 'client', text: "Hi there! Your AI art portfolio is amazing. We need creative content." },
            { sender: 'freelancer', text: "Thank you! I love creating AI-generated art. What's your vision?" },
            { sender: 'client', text: "We need social media content for our tech startup. Modern, futuristic style." },
            { sender: 'freelancer', text: "Perfect! I can create stunning visuals that match that aesthetic. Budget range?" },
            { sender: 'client', text: "Around $1500 for a complete social media package." },
            { sender: 'freelancer', text: "That works great! I can deliver high-quality content within that budget." }
          ]
        }
      ];

      // Создаем сообщения
      for (let i = 0; i < conversations.length; i++) {
        const { conversation, freelancer, client } = conversations[i];
        const messageTemplate = demoMessageTemplates[i % demoMessageTemplates.length];

        let lastMessageText = '';
        let lastMessageTime = new Date();

        for (let j = 0; j < messageTemplate.messages.length; j++) {
          const msgTemplate = messageTemplate.messages[j];
          const isFromFreelancer = msgTemplate.sender === 'freelancer';
          const senderId = isFromFreelancer ? freelancer.$id : client.$id;
          const receiverId = isFromFreelancer ? client.$id : freelancer.$id;

          // Создаем временную метку (каждое сообщение через 10-30 минут)
          const messageTime = new Date(lastMessageTime.getTime() + (Math.random() * 20 + 10) * 60 * 1000);
          lastMessageTime = messageTime;
          lastMessageText = msgTemplate.text;

          const message = await databases.createDocument(
            this.DATABASE_ID,
            this.MESSAGES_COLLECTION,
            ID.unique(),
            {
              text: msgTemplate.text,
              sender_id: senderId,
              receiver_id: receiverId,
              conversation_id: conversation.$id,
              timestamp: messageTime.toISOString(),
              read: j < messageTemplate.messages.length - 1, // Последнее сообщение непрочитано
              message_type: 'text'
            }
          );

          console.log(`✅ Created message: "${msgTemplate.text.substring(0, 30)}..."`);
        }

        // Обновляем разговор с последним сообщением
        const unreadCount = { [freelancer.$id]: 0, [client.$id]: 0 };
        const lastMessage = messageTemplate.messages[messageTemplate.messages.length - 1];
        if (lastMessage.sender === 'freelancer') {
          unreadCount[client.$id] = 1;
        } else {
          unreadCount[freelancer.$id] = 1;
        }

        await databases.updateDocument(
          this.DATABASE_ID,
          this.CONVERSATIONS_COLLECTION,
          conversation.$id,
          {
            last_message: lastMessageText,
            last_message_time: lastMessageTime.toISOString(),
            unread_count: JSON.stringify(unreadCount),
            updated_at: lastMessageTime.toISOString()
          }
        );
      }

      console.log('🎉 Demo messages created successfully!');
      return {
        conversations: conversations.length,
        messages: conversations.reduce((total, conv, i) => total + demoMessageTemplates[i % demoMessageTemplates.length].messages.length, 0)
      };

    } catch (error) {
      console.error('❌ Error creating demo messages:', error);
      throw error;
    }
  }

  // Очистить все сообщения (для тестирования)
  async clearAllMessages() {
    try {
      console.log('🧹 Clearing all messages...');

      // Удаляем все сообщения
      const messagesResponse = await databases.listDocuments(
        this.DATABASE_ID,
        this.MESSAGES_COLLECTION,
        []
      );

      for (const message of messagesResponse.documents) {
        await databases.deleteDocument(
          this.DATABASE_ID,
          this.MESSAGES_COLLECTION,
          message.$id
        );
      }

      // Удаляем все разговоры
      const conversationsResponse = await databases.listDocuments(
        this.DATABASE_ID,
        this.CONVERSATIONS_COLLECTION,
        []
      );

      for (const conversation of conversationsResponse.documents) {
        await databases.deleteDocument(
          this.DATABASE_ID,
          this.CONVERSATIONS_COLLECTION,
          conversation.$id
        );
      }

      console.log('✅ All messages and conversations cleared');
    } catch (error) {
      console.error('❌ Error clearing messages:', error);
      throw error;
    }
  }

  // Получить статистику сообщений
  async getMessagesStats() {
    try {
      const [messagesResponse, conversationsResponse] = await Promise.all([
        databases.listDocuments(this.DATABASE_ID, this.MESSAGES_COLLECTION, []),
        databases.listDocuments(this.DATABASE_ID, this.CONVERSATIONS_COLLECTION, [])
      ]);

      return {
        totalMessages: messagesResponse.total,
        totalConversations: conversationsResponse.total,
        messages: messagesResponse.documents,
        conversations: conversationsResponse.documents
      };
    } catch (error) {
      console.error('❌ Error getting messages stats:', error);
      return {
        totalMessages: 0,
        totalConversations: 0,
        messages: [],
        conversations: []
      };
    }
  }
}
