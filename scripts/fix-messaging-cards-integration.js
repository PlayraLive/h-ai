const { Client, Databases, ID, Query } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function fixMessagingCardsIntegration() {
  console.log('🔧 Исправление интеграции карточек в сообщениях...\n');
  
  try {
    // 1. Проверяем существующие jobs без карточек в сообщениях
    console.log('📋 Проверяем jobs без карточек в сообщениях...');
    
    const jobs = await databases.listDocuments(DATABASE_ID, 'jobs');
    const conversations = await databases.listDocuments(DATABASE_ID, 'conversations');
    const messages = await databases.listDocuments(DATABASE_ID, 'messages');
    
    console.log(`Найдено jobs: ${jobs.documents.length}`);
    console.log(`Найдено бесед: ${conversations.documents.length}`);
    console.log(`Найдено сообщений: ${messages.documents.length}`);
    
    // 2. Создаем карточки jobs в сообщениях для существующих приглашений
    const invitations = await databases.listDocuments(DATABASE_ID, 'invitations');
    console.log(`\n📨 Найдено приглашений: ${invitations.documents.length}`);
    
    for (const invitation of invitations.documents) {
      try {
        // Проверяем есть ли уже карточка job в сообщениях для этого приглашения
        const existingJobCard = await databases.listDocuments(
          DATABASE_ID,
          'messages',
          [
            Query.equal('messageType', 'job_card'),
            Query.contains('content', invitation.job_id)
          ]
        );
        
        if (existingJobCard.documents.length === 0) {
          // Создаем беседу если её нет
          let conversation = await databases.listDocuments(
            DATABASE_ID,
            'conversations',
            [
              Query.contains('participants', invitation.client_id),
              Query.contains('participants', invitation.freelancer_id),
              Query.equal('job_id', invitation.job_id)
            ]
          );
          
          if (conversation.documents.length === 0) {
            // Создаем новую беседу
            conversation = await databases.createDocument(
              DATABASE_ID,
              'conversations',
              ID.unique(),
              {
                participants: [invitation.client_id, invitation.freelancer_id],
                job_id: invitation.job_id,
                last_message: '',
                last_message_time: new Date().toISOString(),
                unread_count: JSON.stringify({ 
                  [invitation.client_id]: 0, 
                  [invitation.freelancer_id]: 1 
                }),
                is_archived: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            );
            console.log(`✅ Создана беседа для job ${invitation.job_id}`);
          } else {
            conversation = conversation.documents[0];
          }
          
          // Создаем карточку job в сообщениях
          const jobCardData = {
            jobId: invitation.job_id,
            jobTitle: invitation.job_title,
            budget: invitation.job_budget,
            freelancerName: invitation.freelancer_name,
            freelancerAvatar: invitation.freelancer_avatar,
            freelancerRating: invitation.freelancer_rating,
            freelancerSkills: invitation.freelancer_skills,
            invitationMessage: invitation.message,
            status: invitation.status,
            invitedAt: invitation.invited_at
          };
          
          await databases.createDocument(
            DATABASE_ID,
            'messages',
            ID.unique(),
            {
              senderId: invitation.client_id,
              receiverId: invitation.freelancer_id,
              conversationId: conversation.$id,
              content: `Приглашение на работу: ${invitation.job_title}`,
              messageType: 'job_card',
              jobCardData: JSON.stringify(jobCardData),
              isRead: false,
              createdAt: invitation.invited_at,
              isDeleted: false,
              attachments: JSON.stringify([])
            }
          );
          
          console.log(`✅ Создана карточка job для приглашения ${invitation.$id}`);
        } else {
          console.log(`⚠️ Карточка job уже существует для приглашения ${invitation.$id}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка создания карточки для приглашения ${invitation.$id}:`, error.message);
      }
    }
    
    // 3. Проверяем AI заказы
    console.log(`\n🤖 Проверяем AI заказы...`);
    
    const orders = await databases.listDocuments(DATABASE_ID, 'orders');
    console.log(`Найдено AI заказов: ${orders.documents.length}`);
    
    for (const order of orders.documents) {
      try {
        // Проверяем есть ли карточка AI заказа в сообщениях
        const existingOrderCard = await databases.listDocuments(
          DATABASE_ID,
          'messages',
          [
            Query.equal('messageType', 'ai_order'),
            Query.contains('content', order.$id)
          ]
        );
        
        if (existingOrderCard.documents.length === 0) {
          // Создаем беседу для AI заказа если её нет
          let aiConversation = await databases.listDocuments(
            DATABASE_ID,
            'ai_conversations',
            [
              Query.equal('user_id', order.userId),
              Query.equal('order_id', order.$id)
            ]
          );
          
          if (aiConversation.documents.length === 0) {
            // Создаем AI беседу
            aiConversation = await databases.createDocument(
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
            console.log(`✅ Создана AI беседа для заказа ${order.$id}`);
          } else {
            aiConversation = aiConversation.documents[0];
          }
          
          // Создаем карточку AI заказа в сообщениях AI беседы
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
            requirements: order.requirements || 'Детали заказа',
            status: order.status || 'pending',
            amount: order.amount || 50,
            conversationId: aiConversation.$id,
            createdAt: order.createdAt || new Date().toISOString()
          };
          
          await databases.createDocument(
            DATABASE_ID,
            'ai_messages',
            ID.unique(),
            {
              conversation_id: aiConversation.$id,
              sender_type: 'user',
              content: `AI заказ: ${order.title || 'Новый заказ'}`,
              message_type: 'order_card',
              order_data: JSON.stringify(aiOrderData),
              created_at: order.createdAt || new Date().toISOString()
            }
          );
          
          console.log(`✅ Создана карточка AI заказа ${order.$id}`);
        } else {
          console.log(`⚠️ Карточка AI заказа уже существует для ${order.$id}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка создания карточки для AI заказа ${order.$id}:`, error.message);
      }
    }
    
    // 4. Проверяем связи пользователей с беседами
    console.log(`\n👥 Проверяем связи пользователей с беседами...`);
    
    let orphanedConversations = 0;
    let fixedConversations = 0;
    
    for (const conversation of conversations.documents) {
      try {
        const participants = conversation.participants || [];
        let hasValidUsers = true;
        
        for (const userId of participants) {
          try {
            await databases.getDocument(
              DATABASE_ID,
              process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
              userId
            );
          } catch (error) {
            console.warn(`⚠️ Пользователь ${userId} не найден в беседе ${conversation.$id}`);
            hasValidUsers = false;
          }
        }
        
        if (!hasValidUsers) {
          orphanedConversations++;
          // Можно добавить логику удаления или исправления
        } else {
          fixedConversations++;
        }
      } catch (error) {
        console.error(`❌ Ошибка проверки беседы ${conversation.$id}:`, error.message);
      }
    }
    
    console.log(`✅ Правильных бесед: ${fixedConversations}`);
    console.log(`⚠️ Проблемных бесед: ${orphanedConversations}`);
    
    // 5. Статистика
    console.log(`\n📊 Финальная статистика:`);
    
    const finalMessages = await databases.listDocuments(DATABASE_ID, 'messages');
    const jobCards = finalMessages.documents.filter(m => m.messageType === 'job_card');
    const aiOrderCards = finalMessages.documents.filter(m => m.messageType === 'ai_order');
    
    console.log(`📧 Всего сообщений: ${finalMessages.documents.length}`);
    console.log(`💼 Карточек jobs: ${jobCards.length}`);
    console.log(`🤖 Карточек AI заказов: ${aiOrderCards.length}`);
    
    console.log(`\n🎉 Исправление интеграции карточек завершено!`);
    
  } catch (error) {
    console.error('❌ Ошибка исправления интеграции:', error.message);
  }
}

fixMessagingCardsIntegration().catch(console.error); 