const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function checkExistingFreelancers() {
  console.log('🔍 Проверка существующих фрилансеров в базе данных...\n');
  
  try {
    // Получаем всех пользователей
    const allUsers = await databases.listDocuments(DATABASE_ID, 'users');
    console.log(`📊 Всего пользователей в базе: ${allUsers.documents.length}`);
    
    // Фильтруем фрилансеров
    const freelancers = allUsers.documents.filter(user => user.userType === 'freelancer');
    console.log(`👨‍💻 Найдено фрилансеров: ${freelancers.length}`);
    
    if (freelancers.length > 0) {
      console.log('\n📋 Список фрилансеров:');
      freelancers.forEach((freelancer, index) => {
        console.log(`  ${index + 1}. ${freelancer.name || freelancer.email} (ID: ${freelancer.$id})`);
        console.log(`     userType: ${freelancer.userType}`);
        console.log(`     location: ${freelancer.location || 'N/A'}`);
        console.log(`     rating: ${freelancer.rating || 'N/A'}`);
        console.log(`     hourlyRate: ${freelancer.hourlyRate || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('\n❌ Фрилансеры не найдены в базе данных');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке фрилансеров:', error.message);
  }
}

checkExistingFreelancers().catch(console.error);
