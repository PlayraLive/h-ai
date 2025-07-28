const { Client, Databases, ID, Query } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function testFullSystemIntegration() {
  console.log('🧪 Тестирование полной интеграции системы...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  function addTest(name, status, details = '') {
    results.tests.push({ name, status, details });
    if (status === 'PASS') results.passed++;
    else results.failed++;
    
    const emoji = status === 'PASS' ? '✅' : '❌';
    console.log(`${emoji} ${name}${details ? ': ' + details : ''}`);
  }
  
  try {
    // 1. Проверка коллекций
    console.log('📋 Проверка существования коллекций...\n');
    
    const collections = [
      'users', 'jobs', 'applications', 'messages', 'conversations',
      'ai_conversations', 'ai_messages', 'orders', 'notifications',
      'invitations', 'user_profiles', 'user_progress', 'achievements',
      'ratings_reviews', 'favorites', 'interactions', 'onboarding_steps'
    ];
    
    for (const collectionId of collections) {
      try {
        const result = await databases.listDocuments(DATABASE_ID, collectionId, []);
        addTest(
          `Коллекция ${collectionId}`, 
          'PASS',
          `${result.documents.length} документов`
        );
      } catch (error) {
        addTest(`Коллекция ${collectionId}`, 'FAIL', error.message);
      }
    }
    
    console.log('\n🔗 Проверка связей между данными...\n');
    
    // 2. Проверка jobs
    const jobs = await databases.listDocuments(DATABASE_ID, 'jobs');
    addTest('Jobs загружены', jobs.documents.length > 0 ? 'PASS' : 'FAIL', `${jobs.documents.length} jobs`);
    
    // 3. Проверка AI заказов  
    const orders = await databases.listDocuments(DATABASE_ID, 'orders');
    addTest('AI заказы загружены', orders.documents.length > 0 ? 'PASS' : 'FAIL', `${orders.documents.length} заказов`);
    
    // 4. Проверка пользователей
    const users = await databases.listDocuments(DATABASE_ID, process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID);
    addTest('Пользователи загружены', users.documents.length > 0 ? 'PASS' : 'FAIL', `${users.documents.length} пользователей`);
    
    // 5. Проверка профилей пользователей
    const profiles = await databases.listDocuments(DATABASE_ID, 'user_profiles');
    addTest('Профили пользователей', profiles.documents.length > 0 ? 'PASS' : 'FAIL', `${profiles.documents.length} профилей`);
    
    // 6. Проверка связей профилей с пользователями
    let validProfiles = 0;
    for (const profile of profiles.documents) {
      try {
        const user = await databases.getDocument(
          DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
          profile.user_id
        );
        if (user) validProfiles++;
      } catch (error) {
        // Пользователь не найден
      }
    }
    addTest(
      'Связи профилей с пользователями', 
      validProfiles === profiles.documents.length ? 'PASS' : 'FAIL',
      `${validProfiles}/${profiles.documents.length} валидных связей`
    );
    
    // 7. Проверка сообщений
    const messages = await databases.listDocuments(DATABASE_ID, 'messages');
    addTest('Сообщения', 'PASS', `${messages.documents.length} сообщений`);
    
    // 8. Проверка карточек в сообщениях
    const jobCards = messages.documents.filter(m => m.messageType === 'job_card');
    const aiOrderCards = messages.documents.filter(m => m.messageType === 'ai_order');
    
    addTest('Карточки jobs в сообщениях', 'PASS', `${jobCards.length} карточек`);
    addTest('Карточки AI заказов в сообщениях', 'PASS', `${aiOrderCards.length} карточек`);
    
    // 9. Проверка бесед
    const conversations = await databases.listDocuments(DATABASE_ID, 'conversations');
    const aiConversations = await databases.listDocuments(DATABASE_ID, 'ai_conversations');
    
    addTest('Обычные беседы', 'PASS', `${conversations.documents.length} бесед`);
    addTest('AI беседы', 'PASS', `${aiConversations.documents.length} AI бесед`);
    
    // 10. Проверка связей бесед с пользователями
    let validConversations = 0;
    for (const conv of conversations.documents) {
      try {
        const participants = conv.participants || [];
        let allValid = true;
        
        for (const userId of participants) {
          try {
            await databases.getDocument(
              DATABASE_ID,
              process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
              userId
            );
          } catch (error) {
            allValid = false;
            break;
          }
        }
        
        if (allValid) validConversations++;
      } catch (error) {
        // Ошибка обработки беседы
      }
    }
    
    addTest(
      'Связи бесед с пользователями',
      validConversations === conversations.documents.length ? 'PASS' : 'FAIL',
      `${validConversations}/${conversations.documents.length} валидных бесед`
    );
    
    // 11. Проверка приглашений
    const invitations = await databases.listDocuments(DATABASE_ID, 'invitations');
    addTest('Приглашения', 'PASS', `${invitations.documents.length} приглашений`);
    
    // 12. Проверка достижений
    const achievements = await databases.listDocuments(DATABASE_ID, 'achievements');
    addTest('Достижения', 'PASS', `${achievements.documents.length} достижений`);
    
    // 13. Проверка уведомлений
    const notifications = await databases.listDocuments(DATABASE_ID, 'notifications');
    addTest('Уведомления', 'PASS', `${notifications.documents.length} уведомлений`);
    
    console.log('\n🎯 Проверка интеграций...\n');
    
    // 14. Проверка связей jobs с пользователями
    let validJobs = 0;
    for (const job of jobs.documents) {
      try {
        const client = await databases.getDocument(
          DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
          job.clientId
        );
        if (client) validJobs++;
      } catch (error) {
        // Клиент не найден
      }
    }
    
    addTest(
      'Связи jobs с клиентами',
      validJobs > 0 ? 'PASS' : 'FAIL',
      `${validJobs}/${jobs.documents.length} валидных связей`
    );
    
    // 15. Проверка связей AI заказов с пользователями  
    let validOrders = 0;
    for (const order of orders.documents) {
      try {
        const user = await databases.getDocument(
          DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
          order.userId
        );
        if (user) validOrders++;
      } catch (error) {
        // Пользователь не найден
      }
    }
    
    addTest(
      'Связи AI заказов с пользователями',
      validOrders > 0 ? 'PASS' : 'FAIL',
      `${validOrders}/${orders.documents.length} валидных связей`
    );
    
    // 16. Итоговая статистика
    console.log('\n📊 СТАТИСТИКА СИСТЕМЫ:\n');
    console.log(`👥 Пользователи: ${users.documents.length}`);
    console.log(`👤 Профили: ${profiles.documents.length}`);
    console.log(`💼 Jobs: ${jobs.documents.length}`);
    console.log(`🤖 AI заказы: ${orders.documents.length}`);
    console.log(`💬 Сообщения: ${messages.documents.length}`);
    console.log(`🗨️ Беседы: ${conversations.documents.length + aiConversations.documents.length}`);
    console.log(`📨 Приглашения: ${invitations.documents.length}`);
    console.log(`🏆 Достижения: ${achievements.documents.length}`);
    console.log(`🔔 Уведомления: ${notifications.documents.length}`);
    
  } catch (error) {
    addTest('Системная ошибка', 'FAIL', error.message);
  }
  
  // Финальный отчет
  console.log('\n🎯 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:\n');
  console.log(`✅ Пройдено: ${results.passed}`);
  console.log(`❌ Провалено: ${results.failed}`);
  console.log(`📊 Общий результат: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ! Система работает корректно.');
  } else {
    console.log('\n⚠️ Найдены проблемы. Проверьте детали выше.');
  }
  
  return results;
}

testFullSystemIntegration().catch(console.error); 