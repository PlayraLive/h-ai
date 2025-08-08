import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

export async function setupUsersCollection() {
  try {
    console.log('Setting up USERS collection attributes...');
    
    // Список атрибутов, которые должны быть в коллекции USERS
    const attributes = [
      // Основные атрибуты пользователя
      { name: 'name', type: 'string', required: false, array: false },
      { name: 'email', type: 'string', required: true, array: false },
      { name: 'userType', type: 'string', required: true, array: false },
      { name: 'avatar', type: 'string', required: false, array: false },
      { name: 'bio', type: 'string', required: false, array: false },
      { name: 'location', type: 'string', required: false, array: false },
      { name: 'skills', type: 'string', required: false, array: true },
      { name: 'languages', type: 'string', required: false, array: true },
      { name: 'hourlyRate', type: 'integer', required: false, array: false },
      
      // Статистика и рейтинги
      { name: 'rating', type: 'double', required: false, array: false },
      { name: 'reviewCount', type: 'integer', required: false, array: false },
      { name: 'totalEarnings', type: 'double', required: false, array: false },
      { name: 'completedProjects', type: 'integer', required: false, array: false },
      
      // Статус и верификация
      { name: 'verified', type: 'boolean', required: false, array: false },
      { name: 'topRated', type: 'boolean', required: false, array: false },
      { name: 'availability', type: 'string', required: false, array: false },
      
      // Социальные сети
      { name: 'linkedin', type: 'string', required: false, array: false },
      { name: 'twitter', type: 'string', required: false, array: false },
      { name: 'website', type: 'string', required: false, array: false },
      
      // Дополнительные поля
      { name: 'phone', type: 'string', required: false, array: false },
      { name: 'timezone', type: 'string', required: false, array: false },
      { name: 'preferences', type: 'string', required: false, array: false },
    ];

    const results = [];

    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          if (attr.array) {
            await databases.createStringAttribute(
              DATABASE_ID,
              COLLECTIONS.USERS,
              attr.name,
              255,
              attr.required ? 'required' : 'optional'
            );
          } else {
            await databases.createStringAttribute(
              DATABASE_ID,
              COLLECTIONS.USERS,
              attr.name,
              255,
              attr.required ? 'required' : 'optional'
            );
          }
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            COLLECTIONS.USERS,
            attr.name,
            attr.required ? 'required' : 'optional'
          );
        } else if (attr.type === 'double') {
          await databases.createFloatAttribute(
            DATABASE_ID,
            COLLECTIONS.USERS,
            attr.name,
            attr.required ? 'required' : 'optional'
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            COLLECTIONS.USERS,
            attr.name,
            attr.required ? 'required' : 'optional'
          );
        }

        results.push({
          attribute: attr.name,
          status: 'created'
        });
        console.log(`✅ Created attribute: ${attr.name}`);
      } catch (error: any) {
        if (error.code === 409) {
          // Атрибут уже существует
          results.push({
            attribute: attr.name,
            status: 'already_exists'
          });
          console.log(`⚠️ Attribute already exists: ${attr.name}`);
        } else {
          results.push({
            attribute: attr.name,
            status: 'error',
            error: error.message
          });
          console.log(`❌ Error creating attribute ${attr.name}:`, error.message);
        }
      }
    }

    return results;
  } catch (error: any) {
    console.error('Error setting up USERS collection:', error);
    throw error;
  }
}
