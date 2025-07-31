require('dotenv').config({ path: '.env.local' });

const specialistsToGenerate = [
  {
    id: 'alex-ai',
    name: 'Alex AI',
    type: 'ai_specialist',
    style: 'professional'
  },
  {
    id: 'viktor-reels',
    name: 'Viktor Reels', 
    type: 'ai_specialist',
    style: 'creative'
  },
  {
    id: 'luna-design',
    name: 'Luna Design',
    type: 'ai_specialist', 
    style: 'modern'
  },
  {
    id: 'max-bot',
    name: 'Max Bot',
    type: 'ai_specialist',
    style: 'tech'
  }
];

async function generateVideoAvatars() {
  console.log('🎬 Запуск генерации стильных видео аватарок...\n');

  for (const specialist of specialistsToGenerate) {
    try {
      console.log(`📹 Генерирую видео аватарку для ${specialist.name}...`);
      
      const response = await fetch('http://localhost:3000/api/generate-video-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          specialistId: specialist.id,
          specialistName: specialist.name,
          specialistType: specialist.type,
          style: specialist.style,
          duration: 5,
          resolution: '1080p'
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ ${specialist.name}:`);
        console.log(`   📹 Видео: ${result.data.videoUrl}`);
        console.log(`   🖼️  Превью: ${result.data.thumbnailUrl}`);
        console.log(`   🎨 Стиль: ${result.data.style}`);
        console.log(`   ⏱️  Длительность: ${result.data.duration}с`);
        if (result.data.metadata) {
          console.log(`   🎭 Личность: ${result.data.metadata.personality}`);
          console.log(`   💼 Специализация: ${result.data.metadata.expertise}`);
        }
        console.log('');
      } else {
        console.error(`❌ Ошибка для ${specialist.name}:`, result.error);
      }

      // Пауза между генерациями
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ Ошибка генерации для ${specialist.name}:`, error.message);
    }
  }

  console.log('🎉 Генерация видео аватарок завершена!');
}

async function testSingleAvatar() {
  console.log('🧪 Тестирование генерации одной аватарки...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/generate-video-avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        specialistId: 'viktor-reels',
        specialistName: 'Viktor Reels',
        specialistType: 'ai_specialist',
        style: 'creative',
        duration: 5,
        resolution: '1080p'
      })
    });

    const result = await response.json();
    console.log('📊 Результат:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
}

// Проверяем аргументы командной строки
const args = process.argv.slice(2);

if (args.includes('--test')) {
  testSingleAvatar();
} else if (args.includes('--all')) {
  generateVideoAvatars();
} else {
  console.log('🎬 Генератор видео аватарок для AI специалистов\n');
  console.log('Использование:');
  console.log('  node scripts/generate-video-avatars.js --test   # Тест одной аватарки');
  console.log('  node scripts/generate-video-avatars.js --all    # Генерация всех аватарок');
  console.log('');
  console.log('💡 Сначала запустите development сервер: npm run dev');
}