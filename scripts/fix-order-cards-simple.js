const { Client, Databases, ID, Query } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function fixOrderCardsSimple() {
  console.log('🔧 Создание карточек заказов в сообщениях (упрощенная версия)...\n');
  
  try {
    // 1. Получаем всех пользователей
    const users = await databases.listDocuments(
      DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID
    );
    console.log(`👥 Найдено пользователей: ${users.documents.length}`);

    if (users.documents.length === 0) {
      console.log('⚠️ Нет пользователей для работы');
      return;
    }

    const testUser = users.documents[0];
    console.log(`🧪 Главный пользователь: ${testUser.name} (${testUser.$id})`);

    // 2. Получаем все jobs
    const allJobs = await databases.listDocuments(DATABASE_ID, 'jobs');
    console.log(`💼 Всего jobs: ${allJobs.documents.length}`);

    // Фильтруем jobs с назначенными фрилансерами
    const jobsWithFreelancers = allJobs.documents.filter(job => 
      job.assignedFreelancer && job.assignedFreelancer !== null
    );
    console.log(`💼 Jobs с фрилансерами: ${jobsWithFreelancers.length}`);

    // 3. Получаем AI заказы
    const orders = await databases.listDocuments(DATABASE_ID, 'orders');
    console.log(`🤖 AI заказы: ${orders.documents.length}`);

    // 4. Создаем тестовые беседы и карточки для первых 3 jobs
    let createdConversations = 0;
    let createdCards = 0;

    for (const job of jobsWithFreelancers.slice(0, 3)) {
      try {
        // Создаем беседу между клиентом и фрилансером
        const conversationId = ID.unique();
        
        const newConversation = await databases.createDocument(
          DATABASE_ID,
          'conversations',
          conversationId,
          {
            participants: [job.clientId, job.assignedFreelancer],
            job_id: job.$id,
            title: `Работа: ${job.title}`,
            last_message: `Работа назначена: ${job.title}`,
            last_message_time: new Date().toISOString(),
            unread_count: JSON.stringify({
              [job.clientId]: 1,
              [job.assignedFreelancer]: 1
            }),
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );

        createdConversations++;
        console.log(`  ✅ Создана беседа для job ${job.title} (${job.$id})`);

        // Создаем карточку job в сообщениях
        const jobCardData = {
          jobId: job.$id,
          jobTitle: job.title,
          budget: `$${job.budgetMin} - $${job.budgetMax || job.budgetMin}`,
          freelancerName: 'Назначенный фрилансер',
          freelancerId: job.assignedFreelancer,
          clientName: job.clientName || 'Клиент',
          clientId: job.clientId,
          status: job.status || 'active',
          category: job.category || 'Development',
          skills: job.skills || ['Web Development'],
          description: job.description || 'Описание работы',
          workStatus: job.workStatus || 'in_progress',
          progressPercentage: job.progressPercentage || 50,
          createdAt: job.$createdAt,
          assignedAt: new Date().toISOString()
        };

        await databases.createDocument(
          DATABASE_ID,
          'messages',
          ID.unique(),
          {
            senderId: job.clientId,
            receiverId: job.assignedFreelancer,
            conversationId: conversationId,
            content: `💼 Работа назначена: ${job.title}\n\nБюджет: $${job.budgetMin} - $${job.budgetMax || job.budgetMin}\nСтатус: ${job.workStatus || 'В работе'}`,
            messageType: 'job_card',
            isRead: false,
            createdAt: job.$createdAt,
            isDeleted: false,
            attachments: JSON.stringify([])
          }
        );

        createdCards++;
        console.log(`  ✅ Создана карточка job в сообщениях`);

      } catch (error) {
        console.error(`❌ Ошибка создания беседы для job ${job.$id}:`, error.message);
      }
    }

    // 5. Создаем тестовые AI беседы для первых 3 заказов
    for (const order of orders.documents.slice(0, 3)) {
      try {
        // Создаем AI беседу
        const aiConversationId = ID.unique();
        
        const newAIConversation = await databases.createDocument(
          DATABASE_ID,
          'ai_conversations',
          aiConversationId,
          {
            user_id: order.userId,
            specialist_id: order.specialist || 'alex-ai',
            order_id: order.$id,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );

        console.log(`  ✅ Создана AI беседа для заказа ${order.$id}`);

        // Создаем карточку AI заказа
        const aiOrderData = {
          orderId: order.$id,
          userId: order.userId,
          specialistId: order.specialist || 'alex-ai',
          specialist: {
            id: order.specialist || 'alex-ai',
            name: 'Alex AI',
            title: 'AI Specialist',
            avatar: '/avatars/alex-ai.jpg'
          },
          title: order.title || 'AI Заказ',
          requirements: order.requirements || 'AI заказ в разработке',
          status: order.status || 'pending',
          amount: order.amount || 50,
          conversationId: aiConversationId,
          createdAt: order.createdAt || new Date().toISOString()
        };

        await databases.createDocument(
          DATABASE_ID,
          'ai_messages',
          ID.unique(),
          {
            conversation_id: aiConversationId,
            sender_type: 'user',
            content: `🤖 AI заказ: ${order.title || 'Новый заказ'}\n\nСумма: $${order.amount || 50}\nСтатус: ${order.status || 'В обработке'}`,
            message_type: 'order_card',
            created_at: order.createdAt || new Date().toISOString()
          }
        );

        console.log(`  ✅ Создана карточка AI заказа в сообщениях`);

      } catch (error) {
        console.error(`❌ Ошибка создания AI беседы для заказа ${order.$id}:`, error.message);
      }
    }

    // 6. Финальная статистика
    console.log(`\n📊 РЕЗУЛЬТАТЫ:\n`);
    console.log(`✅ Создано бесед: ${createdConversations}`);
    console.log(`✅ Создано карточек jobs: ${createdCards}`);

    // Проверяем финальное состояние
    const finalConversations = await databases.listDocuments(DATABASE_ID, 'conversations');
    const finalAIConversations = await databases.listDocuments(DATABASE_ID, 'ai_conversations');
    const finalMessages = await databases.listDocuments(DATABASE_ID, 'messages');
    const finalAIMessages = await databases.listDocuments(DATABASE_ID, 'ai_messages');

    console.log(`\n📋 ФИНАЛЬНАЯ СТАТИСТИКА:`);
    console.log(`💬 Обычные беседы: ${finalConversations.documents.length}`);
    console.log(`🤖 AI беседы: ${finalAIConversations.documents.length}`);
    console.log(`📨 Сообщения: ${finalMessages.documents.length}`);
    console.log(`🤖 AI сообщения: ${finalAIMessages.documents.length}`);

    const jobCardMessages = finalMessages.documents.filter(m => m.messageType === 'job_card');
    const aiOrderMessages = finalAIMessages.documents.filter(m => m.message_type === 'order_card');

    console.log(`💼 Карточки jobs в сообщениях: ${jobCardMessages.length}`);
    console.log(`🤖 Карточки AI заказов в сообщениях: ${aiOrderMessages.length}`);

    console.log(`\n🎉 Карточки заказов созданы!`);
    console.log(`Теперь в разделе Сообщения должны появиться беседы с карточками активных заказов.`);

  } catch (error) {
    console.error('❌ Ошибка создания карточек:', error.message);
  }
}

fixOrderCardsSimple().catch(console.error); 