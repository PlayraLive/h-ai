const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Инициализация клиента Appwrite
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = 'reels';

// Функция для генерации случайных данных
function generateRandomData(category, title) {
    const baseData = {
        isPremium: Math.random() > 0.7, // 30% премиум
        views: Math.floor(Math.random() * 50000) + 1000, // 1K - 51K просмотров
        likes: Math.floor(Math.random() * 2000) + 50, // 50 - 2050 лайков
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0 рейтинг
        duration: Math.floor(Math.random() * 90) + 15, // 15 - 105 секунд
        creatorAvatar: `/avatars/creator${Math.floor(Math.random() * 10) + 1}.jpg`,
    };

    // Специфичные данные по категориям
    switch (category) {
        case 'website':
            return {
                ...baseData,
                price: Math.floor(Math.random() * 800) + 200, // $200 - $1000
                deliveryTime: ['3-5 дней', '5-7 дней', '1-2 недели'][Math.floor(Math.random() * 3)],
                features: JSON.stringify([
                    'Адаптивный дизайн',
                    'SEO оптимизация',
                    'Админ панель',
                    'Интеграция с API',
                    'Мобильная версия'
                ]),
                requirements: 'Предоставьте логотип, контент для сайта и примеры понравившихся дизайнов'
            };

        case 'video':
            return {
                ...baseData,
                price: Math.floor(Math.random() * 400) + 100, // $100 - $500
                deliveryTime: ['1-3 дня', '3-5 дней', '5-7 дней'][Math.floor(Math.random() * 3)],
                features: JSON.stringify([
                    'HD качество',
                    'Автогенерация контента',
                    'Музыкальное сопровождение',
                    'Субтитры',
                    'Брендинг'
                ]),
                requirements: 'Опишите тематику контента, целевую аудиторию и предпочтения по стилю'
            };

        case 'bot':
            return {
                ...baseData,
                price: Math.floor(Math.random() * 600) + 300, // $300 - $900
                deliveryTime: ['5-7 дней', '1-2 недели', '2-3 недели'][Math.floor(Math.random() * 3)],
                features: JSON.stringify([
                    'Многоязычная поддержка',
                    'Интеграция с API',
                    'Обучение на ваших данных',
                    'Аналитика диалогов',
                    'Техподдержка'
                ]),
                requirements: 'Предоставьте FAQ, примеры диалогов и техническое задание для интеграции'
            };

        case 'design':
            return {
                ...baseData,
                price: Math.floor(Math.random() * 300) + 100, // $100 - $400
                deliveryTime: ['2-3 дня', '3-5 дней', '5-7 дней'][Math.floor(Math.random() * 3)],
                features: JSON.stringify([
                    'Векторные файлы',
                    'Исходники в PSD/Figma',
                    'Руководство по стилю',
                    'Множество вариантов',
                    'Коммерческие права'
                ]),
                requirements: 'Опишите стиль, предпочитаемые цвета, целевую аудиторию и сферу применения'
            };

        default:
            return {
                ...baseData,
                price: Math.floor(Math.random() * 500) + 150,
                deliveryTime: '3-7 дней',
                features: JSON.stringify(['Профессиональное качество', 'Техническая поддержка', 'Гарантия результата']),
                requirements: 'Свяжитесь для обсуждения деталей проекта'
            };
    }
}

async function updateReelsData() {
    try {
        console.log('🔄 Обновляем существующие данные в коллекции reels...');

        // Получаем все существующие документы
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        console.log(`📊 Найдено документов для обновления: ${response.documents.length}`);

        if (response.documents.length === 0) {
            console.log('⚠️  Нет данных для обновления');
            return;
        }

        let updatedCount = 0;

        for (const doc of response.documents) {
            try {
                console.log(`🔧 Обновляем: "${doc.title}"`);

                // Генерируем новые данные
                const newData = generateRandomData(doc.category, doc.title);

                // Обновляем документ
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    doc.$id,
                    newData
                );

                console.log(`✅ Обновлен: "${doc.title}" - ${newData.views} просмотров, рейтинг ${newData.rating}`);
                updatedCount++;

                // Небольшая пауза между обновлениями
                await new Promise(resolve => setTimeout(resolve, 300));

            } catch (error) {
                console.error(`❌ Ошибка при обновлении "${doc.title}":`, error.message);
            }
        }

        console.log(`\n🎉 Обновление завершено!`);
        console.log(`✅ Успешно обновлено: ${updatedCount} из ${response.documents.length} документов`);

        // Проверяем результат
        console.log('\n📊 Проверяем обновленные данные...');
        const updatedResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);

        console.log('\n📋 Топ 3 рилса по просмотрам:');
        const sortedByViews = updatedResponse.documents
            .sort((a, b) => b.views - a.views)
            .slice(0, 3);

        sortedByViews.forEach((doc, index) => {
            console.log(`${index + 1}. "${doc.title}" - ${doc.views} просмотров, рейтинг ${doc.rating}, цена $${doc.price}`);
        });

        console.log('\n📋 Премиум рилсы:');
        const premiumReels = updatedResponse.documents.filter(doc => doc.isPremium);
        premiumReels.forEach(doc => {
            console.log(`   💎 "${doc.title}" - $${doc.price} (${doc.deliveryTime})`);
        });

    } catch (error) {
        console.error('💥 Критическая ошибка при обновлении данных:', error.message);
    }
}

// Главная функция
async function main() {
    try {
        console.log('🔗 Подключаемся к Appwrite...');
        console.log(`📡 Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
        console.log(`🗂️  Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
        console.log(`💾 Database: ${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}`);

        // Проверяем подключение
        await databases.get(DATABASE_ID);
        console.log('✅ Подключение успешно!\n');

        await updateReelsData();

        console.log('\n🚀 Теперь можно перезапустить приложение - данные готовы!');

    } catch (error) {
        console.error('💥 Ошибка подключения:', error.message);
        console.log('\n🔧 Проверьте:');
        console.log('   1. Переменные окружения в .env.local');
        console.log('   2. API ключ с правами на запись');
        console.log('   3. Существование базы данных и коллекции');
    }
}

// Запуск скрипта
main();
