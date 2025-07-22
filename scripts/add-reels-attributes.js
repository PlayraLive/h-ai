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

// Список атрибутов, которые нужно добавить
const missingAttributes = [
    { key: 'isPremium', type: 'boolean', required: false, default: false },
    { key: 'views', type: 'integer', required: false, default: 0 },
    { key: 'likes', type: 'integer', required: false, default: 0 },
    { key: 'rating', type: 'float', required: false, default: 0 },
    { key: 'duration', type: 'integer', required: false, default: 0 },
    { key: 'price', type: 'float', required: false, default: 0 },
    { key: 'deliveryTime', type: 'string', size: 100, required: false, default: '1-3 days' },
    { key: 'features', type: 'string', size: 2000, required: false, default: '[]' },
    { key: 'creatorAvatar', type: 'string', size: 500, required: false, default: '/images/default-avatar.png' },
    { key: 'requirements', type: 'string', size: 1000, required: false, default: '' }
];

async function addMissingAttributes() {
    try {
        console.log('🔧 Добавляем недостающие атрибуты в коллекцию reels...');

        // Сначала проверяем существующие атрибуты
        console.log('📋 Проверяем текущую структуру коллекции...');
        const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
        const existingAttributes = collection.attributes.map(attr => attr.key);

        console.log('✅ Существующие атрибуты:', existingAttributes.join(', '));

        let addedCount = 0;
        let skippedCount = 0;

        for (const attr of missingAttributes) {
            if (existingAttributes.includes(attr.key)) {
                console.log(`⏭️  Пропускаем "${attr.key}" - уже существует`);
                skippedCount++;
                continue;
            }

            try {
                console.log(`➕ Добавляем атрибут: ${attr.key} (${attr.type})`);

                if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.required,
                        attr.default
                    );
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.required,
                        undefined, // min
                        undefined, // max
                        attr.default
                    );
                } else if (attr.type === 'float') {
                    await databases.createFloatAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.required,
                        undefined, // min
                        undefined, // max
                        attr.default
                    );
                } else if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.size,
                        attr.required,
                        attr.default
                    );
                }

                console.log(`✅ Атрибут "${attr.key}" успешно добавлен`);
                addedCount++;

                // Небольшая пауза между созданием атрибутов
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                if (error.code === 409) {
                    console.log(`⚠️  Атрибут "${attr.key}" уже существует`);
                    skippedCount++;
                } else {
                    console.error(`❌ Ошибка при добавлении атрибута "${attr.key}":`, error.message);
                }
            }
        }

        console.log(`\n🎉 Процесс завершен!`);
        console.log(`✅ Добавлено: ${addedCount} атрибутов`);
        console.log(`⏭️  Пропущено: ${skippedCount} атрибутов`);

        // Проверяем финальную структуру
        console.log('\n📋 Проверяем обновленную структуру коллекции...');
        const updatedCollection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
        console.log('🔄 Обновленные атрибуты:');
        updatedCollection.attributes.forEach(attr => {
            console.log(`   • ${attr.key} (${attr.type}) - ${attr.required ? 'обязательный' : 'опциональный'}`);
        });

        console.log('\n⚠️  ВАЖНО: Подождите 1-2 минуты, пока изменения применятся в Appwrite, затем перезапустите приложение.');

    } catch (error) {
        console.error('💥 Критическая ошибка:', error.message);
        console.log('\n🔧 Возможные решения:');
        console.log('   1. Проверьте правильность API ключа');
        console.log('   2. Убедитесь, что API ключ имеет права на изменение схемы');
        console.log('   3. Проверьте существование коллекции "reels"');
        console.log('   4. Попробуйте создать атрибуты вручную в Appwrite Console');
    }
}

// Проверяем подключение и запускаем добавление атрибутов
async function main() {
    try {
        console.log('🔗 Проверяем подключение к Appwrite...');
        console.log(`📡 Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
        console.log(`🗂️  Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
        console.log(`💾 Database: ${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}`);
        console.log(`📦 Collection: ${COLLECTION_ID}`);

        // Проверяем подключение
        await databases.get(DATABASE_ID);
        console.log('✅ Подключение к базе данных успешно!\n');

        await addMissingAttributes();

    } catch (error) {
        console.error('💥 Не удалось подключиться к базе данных:', error.message);
        console.log('\n🔧 Проверьте:');
        console.log('   1. Правильность переменных окружения в .env.local');
        console.log('   2. Наличие API ключа с правами на изменение схемы');
        console.log('   3. Существование базы данных и коллекции reels');
    }
}

// Запускаем скрипт
main();
