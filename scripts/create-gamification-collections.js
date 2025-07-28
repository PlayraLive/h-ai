const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Новые коллекции для геймификации
const gamificationCollections = {
  user_profiles: {
    name: 'User Profiles',
    description: 'Расширенные профили пользователей',
    attributes: [
      { key: 'user_id', type: 'string', size: 50, required: true },
      { key: 'avatar_url', type: 'string', size: 500, required: false },
      { key: 'cover_image', type: 'string', size: 500, required: false },
      { key: 'bio', type: 'string', size: 1000, required: false },
      { key: 'company_name', type: 'string', size: 255, required: false },
      { key: 'company_size', type: 'string', size: 50, required: false },
      { key: 'industry', type: 'string', size: 100, required: false },
      { key: 'interests', type: 'string', size: 100, required: false, array: true },
      { key: 'specializations', type: 'string', size: 100, required: false, array: true },
      { key: 'experience_years', type: 'integer', required: false },
      { key: 'hourly_rate_min', type: 'integer', required: false },
      { key: 'hourly_rate_max', type: 'integer', required: false },
      { key: 'portfolio_items', type: 'string', size: 50, required: false, array: true },
      { key: 'social_links', type: 'string', size: 2000, required: false },
      { key: 'onboarding_completed', type: 'boolean', required: true, default: false },
      { key: 'profile_completion', type: 'integer', required: false, default: 0 }
    ]
  },
  
  user_progress: {
    name: 'User Progress',
    description: 'Прогресс и уровни пользователей',
    attributes: [
      { key: 'user_id', type: 'string', size: 50, required: true },
      { key: 'current_level', type: 'integer', required: true, default: 1 },
      { key: 'current_xp', type: 'integer', required: true, default: 0 },
      { key: 'total_xp', type: 'integer', required: true, default: 0 },
      { key: 'next_level_xp', type: 'integer', required: true, default: 100 },
      { key: 'rank_title', type: 'string', size: 100, required: false },
      { key: 'completed_jobs', type: 'integer', required: false, default: 0 },
      { key: 'success_rate', type: 'double', required: false, default: 0 },
      { key: 'average_rating', type: 'double', required: false, default: 0 },
      { key: 'total_earnings', type: 'double', required: false, default: 0 },
      { key: 'streak_days', type: 'integer', required: false, default: 0 },
      { key: 'achievements_count', type: 'integer', required: false, default: 0 }
    ]
  },
  
  achievements: {
    name: 'Achievements',
    description: 'Система достижений',
    attributes: [
      { key: 'user_id', type: 'string', size: 50, required: true },
      { key: 'achievement_id', type: 'string', size: 100, required: true },
      { key: 'achievement_name', type: 'string', size: 255, required: true },
      { key: 'achievement_description', type: 'string', size: 500, required: true },
      { key: 'achievement_icon', type: 'string', size: 100, required: false },
      { key: 'achievement_category', type: 'string', size: 100, required: true },
      { key: 'xp_reward', type: 'integer', required: false, default: 0 },
      { key: 'rarity', type: 'string', size: 50, required: false },
      { key: 'unlocked_at', type: 'datetime', required: true },
      { key: 'progress_current', type: 'integer', required: false, default: 0 },
      { key: 'progress_required', type: 'integer', required: false, default: 1 }
    ]
  },
  
  ratings_reviews: {
    name: 'Ratings Reviews',
    description: 'Рейтинги и отзывы',
    attributes: [
      { key: 'reviewer_id', type: 'string', size: 50, required: true },
      { key: 'reviewed_id', type: 'string', size: 50, required: true },
      { key: 'job_id', type: 'string', size: 50, required: false },
      { key: 'order_id', type: 'string', size: 50, required: false },
      { key: 'solution_id', type: 'string', size: 50, required: false },
      { key: 'review_type', type: 'string', size: 50, required: true },
      { key: 'overall_rating', type: 'double', required: true },
      { key: 'communication_rating', type: 'double', required: false },
      { key: 'quality_rating', type: 'double', required: false },
      { key: 'timeliness_rating', type: 'double', required: false },
      { key: 'review_text', type: 'string', size: 2000, required: false },
      { key: 'pros', type: 'string', size: 100, required: false, array: true },
      { key: 'cons', type: 'string', size: 100, required: false, array: true },
      { key: 'would_recommend', type: 'boolean', required: false },
      { key: 'is_public', type: 'boolean', required: true, default: true },
      { key: 'helpful_votes', type: 'integer', required: false, default: 0 }
    ]
  },
  
  favorites: {
    name: 'Favorites',
    description: 'Избранное пользователей',
    attributes: [
      { key: 'user_id', type: 'string', size: 50, required: true },
      { key: 'item_id', type: 'string', size: 50, required: true },
      { key: 'item_type', type: 'string', size: 50, required: true },
      { key: 'added_at', type: 'datetime', required: true },
      { key: 'category', type: 'string', size: 100, required: false },
      { key: 'notes', type: 'string', size: 500, required: false }
    ]
  },
  
  interactions: {
    name: 'Interactions',
    description: 'Лайки, просмотры, шары',
    attributes: [
      { key: 'user_id', type: 'string', size: 50, required: true },
      { key: 'target_id', type: 'string', size: 50, required: true },
      { key: 'target_type', type: 'string', size: 50, required: true },
      { key: 'interaction_type', type: 'string', size: 50, required: true },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'metadata', type: 'string', size: 1000, required: false }
    ]
  },
  
  onboarding_steps: {
    name: 'Onboarding Steps',
    description: 'Шаги онбординга пользователей',
    attributes: [
      { key: 'user_id', type: 'string', size: 50, required: true },
      { key: 'user_type', type: 'string', size: 50, required: true },
      { key: 'current_step', type: 'integer', required: true, default: 1 },
      { key: 'total_steps', type: 'integer', required: true, default: 4 },
      { key: 'completed_steps', type: 'string', size: 100, required: false, array: true },
      { key: 'step_data', type: 'string', size: 2000, required: false },
      { key: 'started_at', type: 'datetime', required: true },
      { key: 'completed_at', type: 'datetime', required: false },
      { key: 'trigger_type', type: 'string', size: 50, required: true }
    ]
  }
};

async function createGamificationCollections() {
  console.log('🏆 Создание коллекций системы геймификации...\n');
  
  for (const [collectionId, config] of Object.entries(gamificationCollections)) {
    try {
      // Создаем коллекцию
      const collection = await databases.createCollection(
        DATABASE_ID,
        collectionId,
        config.name,
        undefined,
        true // enabled
      );
      
      console.log(`✅ Создана коллекция: ${config.name}`);
      
      // Добавляем атрибуты
      for (const attr of config.attributes) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Задержка между атрибутами
          
          if (attr.type === 'string') {
            await databases.createStringAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.size,
              attr.required,
              attr.default,
              attr.array || false
            );
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.required,
              attr.min,
              attr.max,
              attr.default
            );
          } else if (attr.type === 'double') {
            await databases.createFloatAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.required,
              attr.min,
              attr.max,
              attr.default
            );
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.required,
              attr.default
            );
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.required,
              attr.default
            );
          }
          
          console.log(`  ➕ Добавлен атрибут: ${attr.key}`);
        } catch (attrError) {
          console.log(`  ⚠️  Атрибут ${attr.key}: ${attrError.message}`);
        }
      }
      
      console.log(`📋 Коллекция ${config.name} готова\n`);
      
    } catch (error) {
      if (error.code === 409) {
        console.log(`⚠️  Коллекция ${config.name} уже существует\n`);
      } else {
        console.error(`❌ Ошибка создания ${config.name}:`, error.message);
      }
    }
  }
  
  console.log('🎉 Создание коллекций геймификации завершено!');
}

createGamificationCollections().catch(console.error); 