const { Client, Databases, ID, Query } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function createTestConversations() {
  console.log('🔧 Создание тестовых бесед с карточками заказов (финальная версия)...\n');
  
  try {
    // 1. Получаем пользователей
    const users = await databases.listDocuments(
      DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID
    );
    console.log(`👥 Найдено пользователей: ${users.documents.length}`);

    if (users.documents.length < 2) {
      console.log('⚠️ Нужно минимум 2 пользователя');
      return;
    }

    const user1 = users.documents[0]; // Клиент
    const user2 = users.documents[1]; // Фрилансер
    
    console.log(`👤 Клиент: ${user1.name} (${user1.$id})`);
    console.log(`👨‍💻 Фрилансер: ${user2.name} (${user2.$id})`);

    // 2. Создаем тестовую беседу
    const conversationId = ID.unique();
    
    await databases.createDocument(
      DATABASE_ID,
      'conversations',
      conversationId,
      {
        participants: [user1.$id, user2.$id],
        title: `Беседа: ${user1.name} и ${user2.name}`,
        lastMessage: 'Новая беседа создана',
        lastMessageAt: new Date().toISOString(),
        lastMessageBy: user1.$id,
        last_activity: new Date().toISOString(),
        unreadCount: JSON.stringify({
          [user1.$id]: 0,
          [user2.$id]: 0
        }),
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    
    console.log(`✅ Создана беседа ${conversationId}`);

    // 3. Создаем приветственное сообщение
    await databases.createDocument(
      DATABASE_ID,
      'messages',
      ID.unique(),
      {
        senderId: user1.$id,
        sender_id: user1.$id,
        receiverId: user2.$id,
        conversationId: conversationId,
        conversation_id: conversationId,
        content: '👋 Привет! Это тестовая беседа для демонстрации карточек заказов.',
        messageType: 'text',
        message_type: 'text',
        attachments: [],
        createdAt: new Date().toISOString()
      }
    );

    console.log(`✅ Создано приветственное сообщение`);

    // 4. Создаем карточку job
    await databases.createDocument(
      DATABASE_ID,
      'messages',
      ID.unique(),
      {
        senderId: user1.$id,
        sender_id: user1.$id,
        receiverId: user2.$id,
        conversationId: conversationId,
        conversation_id: conversationId,
        content: `💼 Работа назначена: Разработка веб-приложения\n\n📊 Прогресс: 65%\n💰 Бюджет: $500 - $1000\n🎯 Статус: В работе`,
        messageType: 'job_card',
        message_type: 'job_card',
        attachments: [],
        createdAt: new Date().toISOString()
      }
    );

    console.log(`✅ Создана карточка job в беседе`);

    // 5. Создаем AI беседу
    const aiConversationId = ID.unique();
    
    await databases.createDocument(
      DATABASE_ID,
      'ai_conversations',
      aiConversationId,
      {
        userId: user1.$id,
        specialistId: 'alex-ai',
        specialistName: 'Alex AI',
        specialistTitle: 'AI Specialist',
        conversationType: 'order',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user_id: user1.$id,
        specialist_id: 'alex-ai',
        conversation_type: 'order'
      }
    );
    
    console.log(`✅ Создана AI беседа ${aiConversationId}`);

    // 6. Создаем AI сообщение с карточкой заказа
    await databases.createDocument(
      DATABASE_ID,
      'ai_messages',
      ID.unique(),
      {
        conversation_id: aiConversationId,
        sender_type: 'user',
        content: `🤖 AI заказ: AI Чат-бот для сайта\n\n💰 Сумма: $150\n📝 Требования: Создание умного чат-бота с интеграцией GPT\n🎯 Статус: В разработке`,
        message_type: 'order_card',
        created_at: new Date().toISOString()
      }
    );

    console.log(`✅ Создана карточка AI заказа`);

    // 7. Создаем дополнительные сообщения для демонстрации
    const demoMessages = [
      'Отлично! Проект выглядит очень интересно 🚀',
      'Когда планируете завершить первый этап?',
      'Первый этап будет готов к концу недели ⏰',
      'Прекрасно! Буду ждать результаты 👍'
    ];

    for (let i = 0; i < demoMessages.length; i++) {
      const senderId = i % 2 === 0 ? user2.$id : user1.$id;
      const receiverId = i % 2 === 0 ? user1.$id : user2.$id;
      
      await databases.createDocument(
        DATABASE_ID,
        'messages',
        ID.unique(),
        {
          senderId,
          sender_id: senderId,
          receiverId,
          conversationId: conversationId,
          conversation_id: conversationId,
          content: demoMessages[i],
          messageType: 'text',
          message_type: 'text',
          attachments: [],
          createdAt: new Date(Date.now() + (i + 1) * 60000).toISOString() // +1 минута каждое
        }
      );
    }

    console.log(`✅ Создано ${demoMessages.length} демо сообщений`);

    // 8. Обновляем lastMessage в беседе
    await databases.updateDocument(
      DATABASE_ID,
      'conversations',
      conversationId,
      {
        lastMessage: demoMessages[demoMessages.length - 1],
        lastMessageAt: new Date().toISOString(),
        lastMessageBy: user1.$id,
        last_activity: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );

    // 9. Финальная статистика
    const finalConversations = await databases.listDocuments(DATABASE_ID, 'conversations');
    const finalAIConversations = await databases.listDocuments(DATABASE_ID, 'ai_conversations');
    const finalMessages = await databases.listDocuments(DATABASE_ID, 'messages');
    const finalAIMessages = await databases.listDocuments(DATABASE_ID, 'ai_messages');

    console.log(`\n📊 ИТОГОВАЯ СТАТИСТИКА:`