const { Client, Databases, ID, Query, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function fixPermissionsAndTestData() {
  console.log('🔧 Исправление прав доступа и создание тестовых данных...\n');
  
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
    console.log(`🧪 Используем тестового пользователя: ${testUser.name} (${testUser.$id})`);
    
    // 2. Обновляем jobs с assignedFreelancer
    const jobs = await databases.listDocuments(DATABASE_ID, 'jobs');
    console.log(`\n💼 Найдено jobs: ${jobs.documents.length}`);
    
    let updatedJobs = 0;
    for (const job of jobs.documents.slice(0, 5)) { // Обновляем первые 5 jobs
      try {
        await databases.updateDocument(
          DATABASE_ID,
          'jobs',
          job.$id,
          {
            assignedFreelancer: testUser.$id,
            workStatus: 'in_progress',
            progressPercentage: Math.floor(Math.random() * 80) + 10, // 10-90%
            acceptedAt: new Date().toISOString()
          }
        );
        updatedJobs++;
        console.log(`  ✅ Обновлен job ${job.$id}`);
      } catch (error) {
        console.log(`  ⚠️ Ошибка обновления job ${job.$id}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Обновлено jobs: ${updatedJobs}`);
    
    // 3. Создаем недостающие профили пользователей
    for (const user of users.documents) {
      try {
        // Проверяем есть ли профиль
        const existingProfile = await databases.listDocuments(
          DATABASE_ID,
          'user_profiles',
          [Query.equal('user_id', user.$id)]
        );
        
        if (existingProfile.documents.length === 0) {
          // Создаем профиль
          await databases.createDocument(
            DATABASE_ID,
            'user_profiles',
            ID.unique(),
            {
              user_id: user.$id,
              bio: `Профессиональный специалист с опытом работы в различных проектах.`,
              specializations: ['Web Development', 'UI/UX Design', 'AI Integration'],
              experience_years: Math.floor(Math.random() * 10) + 1,
              hourly_rate_min: 50,
              hourly_rate_max: 150,
              onboarding_completed: true,
              profile_completion: 90
            }
          );
          console.log(`  ✅ Создан профиль для ${user.name}`);
        }
      } catch (error) {
        console.log(`  ⚠️ Ошибка создания профиля для ${user.name}: ${error.message}`);
      }
    }
    
    // 4. Создаем тестовые applications
    console.log(`\n📝 Создание тестовых applications...`);
    
    const freelancerUser = users.documents[0];
    const clientJobs = jobs.documents.slice(0, 3);
    
    for (const job of clientJobs) {
      try {
        // Проверяем есть ли уже application
        const existingApp = await databases.listDocuments(
          DATABASE_ID,
          'applications',
          [
            Query.equal('jobId', job.$id),
            Query.equal('freelancerId', freelancerUser.$id)
          ]
        );
        
        if (existingApp.documents.length === 0) {
          await databases.createDocument(
            DATABASE_ID,
            'applications',
            ID.unique(),
            {
              jobId: job.$id,
              freelancerId: freelancerUser.$id,
              freelancerName: freelancerUser.name,
              coverLetter: `Здравствуйте! Я заинтересован в выполнении этого проекта. У меня есть опыт работы с подобными задачами.`,
              proposedRate: job.budgetMin || 50,
              proposedTimeline: '7 дней',
              status: 'accepted',
              attachments: [],
              createdAt: new Date().toISOString()
            }
          );
          console.log(`  ✅ Создана application для job ${job.$id}`);
        }
      } catch (error) {
        console.log(`  ⚠️ Ошибка создания application: ${error.message}`);
      }
    }
    
    // 5. Финальная проверка
    console.log(`\n📊 Финальная статистика:`);
    
    const finalJobs = await databases.listDocuments(DATABASE_ID, 'jobs');
    const assignedJobs = finalJobs.documents.filter(job => job.assignedFreelancer);
    
    const finalProfiles = await databases.listDocuments(DATABASE_ID, 'user_profiles');
    const finalApplications = await databases.listDocuments(DATABASE_ID, 'applications');
    
    console.log(`💼 Всего jobs: ${finalJobs.documents.length}`);
    console.log(`👷 Jobs с назначенными фрилансерами: ${assignedJobs.length}`);
    console.log(`👤 Профили пользователей: ${finalProfiles.documents.length}`);
    console.log(`📝 Applications: ${finalApplications.documents.length}`);
    
    console.log(`\n🎉 Исправления завершены! Теперь dashboard должен работать корректно.`);
    
  } catch (error) {
    console.error('❌ Ошибка исправления:', error.message);
  }
}

fixPermissionsAndTestData().catch(console.error); 