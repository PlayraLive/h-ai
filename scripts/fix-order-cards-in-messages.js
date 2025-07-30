const { Client, Databases, ID, Query } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function fixOrderCardsInMessages() {
  console.log('🔧 Исправление карточек заказов в сообщениях...\n');
  
  try {
    // 1. Получаем всех пользователей
    const users = await databases.listDocuments(
      DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID
    );
    console.log(`👥 Найдено пользователей: ${users.documents.length}`);

    // 2. Получаем jobs с назначенными фрилансерами
    const jobs = await databases.listDocuments(
      DATABASE_ID,
      'jobs',
      [Query.isNotNull('assignedFreelancer')]
    );
    console.log(`💼 Jobs с фрилансерами: ${jobs.documents.length}`);

    // 3. Получаем AI заказы
    const orders = await databases.listDocuments(DATABASE_ID, 'orders');
    console.log(`🤖 AI заказы: ${orders.documents.length}`);

    // 4. Создаем беседы и карточки для jobs
    let createdJobConversations = 0;
    let createdJobCards = 0;

    for (const job of jobs.documents) {
      try {
        if (!job.assignedFreelancer || !job.clientId) continue;

        // Проверяем существует ли беседа
        const existingConversation = await databases.listDocuments(
          DATABASE_ID,
          'conversations',
          [
            Query.equal('job_id', job.$id),
            Query.contains('participants', job.clientId),
            Query.contains('participants', job.assignedFreelancer)
          ]
        );

        let conversationId;
        
        if (existingConversation.documents.length === 0) {
          // Создаем новую беседу
          const newConversation = await databases.createDocument(
            DATABASE_ID,
            'conversations',
            ID.unique(),
            {
              participants: [job.clientId, job.assignedFreelancer],
              job_id: job.$id,
              title: `Работа: ${job.title}`,
              last_message: '',
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
          conversationId = newConversation.$id;
          createdJobConversations++;
          console.log(`  ✅ Создана беседа для job ${job.$id}`);
        } else {
          conversationId = existingConversation.documents[0].$id;
        }

        // Проверяем существует ли карточка job в сообщениях
        const existingJobCard = await databases.listDocuments(
          DATABASE_ID,
          'messages',
          [
            Query.equal('conversationId', conversationId),
            Query.equal('messageType', 'job_card')
          ]
        );

        if (existingJobCard.documents.length === 0) {
          // Получаем информацию о фрилансере
          let freelancerName = 'Фрилансер';
          try {
            const freelancer = await databases.getDocument(
              DATABASE_ID,
              process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
              job.assignedFreelancer
            );
            freelancerName = freelancer.name;
          } catch (error) {
            console.warn(`Не найден фрилансер ${job.assignedFreelancer}`);
          }

          // Создаем карточку job
          const jobCardData = {
            jobId: job.$id,
            jobTitle: job.title,
            budget: `$${job.budgetMin} - $${job.budgetMax}`,
            freelancerName: freelancerName,
            freelancerId: job.assignedFreelancer,
            clientName: job.clientName,
            clientId: job.clientId,
            status: job.status || 'active',
            category: job.category,
            skills: job.skills || [],
            description: job.description,
            deadline: job.deadline,
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
              content: `💼 Работа назначена: ${job.title}`,
              messageType: 'job_card',
              jobCardData: JSON.stringify(jobCardData),
              isRead: false,
              createdAt: job.$createdAt,
              isDeleted: false,
              attachments: JSON.stringify([])
            }
          );

          createdJobCards++;
          console.log(`  ✅ Создана карточка job для ${job.$id}`);
        }

      } catch (error) {
        console.error(`❌ Ошибка обработки job ${job.$id}:`, error.message);
      }
    }

    // 5. Создаем беседы и карточки для AI заказов
    let createdAIConversations = 0;
    let createdAICards = 0;

    for (const order of orders.documents) {
      try {
        if (!order.userId) continue;

        // Проверяем существует ли AI беседа
        const existingAIConversation = await databases.listDocuments(
          DATABASE_ID,
          'ai_conversations',
          [
            Query.equal('user_id', order.userId),
            Query.equal('order_id', order.$id)
          ]
        );

        let aiConversationId;
        
        if (existingAIConversation.documents.length === 0) {
          // Создаем новую AI беседу
          const newAIConversation = await databases.createDocument(
            DATABASE_ID,
            'ai_conversations',
            ID.unique(),
            {
              user_id: order.userId,
              specialist_id: order.specialist || 'alex-ai',
              order_id: order.$id,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          );
          aiConversationId = newAIConversation.$id;
          createdAIConversations++;
          console.log(`  ✅ Создана AI беседа для заказа ${order.$id}`);
        } else {
          aiConversationId = existingAIConversation.documents[0].$id;
        }

        // Проверяем существует ли карточка AI заказа
        const existingAICard = await databases.listDocuments(
          DATABASE_ID,
          'ai_messages',
          [
            Query.equal('conversation_id', aiConversationId),
            Query.equal('message_type', 'order_card')
          ]
        );

        if (existingAICard.documents.length === 0) {
          // Получаем информацию о пользователе
          let userName = 'Пользователь';
          try {
            const user = await databases.getDocument(
              DATABASE_ID,
              process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
              order.userId
            );
            userName = user.name;
          } catch (error) {
            console.warn(`Не найден пользователь ${order.userId}`);
          }

          // Создаем карточку AI заказа
          const aiOrderData = {
            orderId: order.$id,
            userId: order.userId,
            specialistId: order.specialist || 'alex-ai',
            specialist: {
              id: order.specialist || 'alex-ai',
              name: order.specialistName || 'Alex AI',
              title: order.specialistTitle || 'AI Specialist',
              avatar: order.specialistAvatar || '/avatars/alex-ai.jpg'
            },
            tariff: {
              name: order.tariffName || 'Стандарт',
              price: order.amount || 50,
              features: order.features || ['AI разработка', 'Техподдержка']
            },
            requirements: order.requirements || 'AI заказ',
            status: order.status || 'pending',
            amount: order.amount || 50,
            clientName: userName,
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
              content: `🤖 AI заказ: ${order.title || 'Новый заказ'}`,
              message_type: 'order_card',
              order_data: JSON.stringify(aiOrderData),
              created_at: order.createdAt || new Date().toISOString()
            }
          );

          createdAICards++;
          console.log(`  ✅ Создана карточка AI заказа ${order.$id}`);
        }

      } catch (error) {
        console.error(`❌ Ошибка обработки AI заказа ${order.$id}:`, error.message);
      }
    }

    // 6. Обновляем существующие сообщения с пустыми attachments
    console.log(`\n🔄 Исправление пустых attachments в сообщениях...`);
    
    const messagesWithNullAttachments = await databases.listDocuments(
      DATABASE_ID,
      'messages',
      [Query.isNull('attachments')]
    );

    for (const message of messagesWithNullAttachments.documents) {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          'messages',
          message.$id,
          { attachments: JSON.stringify([]) }
        );
      } catch (error) {
        console.warn(`Не удалось обновить attachments для сообщения ${message.$id}`);
      }
    }

    console.log(`  ✅ Обновлено ${messagesWithNullAttachments.documents.length} сообщений`);

    // 7. Финальная статистика
    console.log(`\n📊 РЕЗУЛЬТАТЫ ИСПРАВЛЕНИЯ:\n`);
    console.log(`✅ Создано бесед для jobs: ${createdJobConversations}`);
    console.log(`✅ Создано карточек jobs: ${createdJobCards}`);
    console.log(`✅ Создано AI бесед: ${createdAIConversations}`);
    console.log(`✅ Создано карточек AI заказов: ${createdAICards}`);

    // Итоговые данные
    const finalConversations = await databases.listDocuments(DATABASE_ID, 'conversations');
    const finalAIConversations = await databases.listDocuments(DATABASE_ID, 'ai_conversations');
    const finalMessages = await databases.listDocuments(DATABASE_ID, 'messages');
    const finalAIMessages = await databases.listDocuments(DATABASE_ID, 'ai_messages');

    const jobCards = finalMessages.documents.filter(m => m.messageType === 'job_card');
    const aiOrderCards = finalAIMessages.documents.filter(m => m.message_type === 'order_card');

    console.log(`\n📋 ИТОГОВАЯ СТАТИСТИКА:`);
    console.log(`💬 Обычные беседы: ${finalConversations.documents.length}`);
    console.log(`🤖 AI беседы: ${finalAIConversations.documents.length}`);
    console.log(`📨 Обычные сообщения: ${finalMessages.documents.length}`);
    console.log(`🤖 AI сообщения: ${finalAIMessages.documents.length}`);
    console.log(`💼 Карточки jobs: ${jobCards.length}`);
    console.log(`🤖 Карточки AI заказов: ${aiOrderCards.length}`);

    console.log(`\n🎉 Карточки заказов успешно интегрированы в сообщения!`);
    console.log(`Теперь вы должны видеть карточки активных заказов в беседах.`);

  } catch (error) {
    console.error('❌ Ошибка исправления карточек:', error.message);
  }
}

fixOrderCardsInMessages().catch(console.error); 