const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Инициализация клиента Appwrite
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey('standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkAndUpdateCryptoEscrows() {
  try {
    console.log('🔍 Проверка коллекции crypto_escrows...');

    // Получаем информацию о коллекции
    const collection = await databases.getCollection(DATABASE_ID, 'crypto_escrows');
    console.log('✅ Коллекция crypto_escrows найдена');

    // Получаем существующие атрибуты
    const attributes = await databases.listAttributes(DATABASE_ID, 'crypto_escrows');
    const existingAttrNames = attributes.attributes.map(attr => attr.key);
    
    console.log(`📊 Найдено атрибутов: ${existingAttrNames.length}`);

    // Список необходимых атрибутов
    const requiredAttributes = [
      { name: 'jobId', type: 'string', size: 255, required: true },
      { name: 'contractId', type: 'string', size: 255, required: true },
      { name: 'txHash', type: 'string', size: 255, required: true },
      { name: 'network', type: 'string', size: 50, required: true },
      { name: 'token', type: 'string', size: 20, required: true },
      { name: 'amount', type: 'double', required: true },
      { name: 'platformFee', type: 'double', required: true },
      { name: 'milestones', type: 'integer', required: false },
      { name: 'completedMilestones', type: 'integer', required: false },
      { name: 'deadline', type: 'string', size: 255, required: false },
      { name: 'clientAddress', type: 'string', size: 255, required: true },
      { name: 'freelancerAddress', type: 'string', size: 255, required: true },
      { name: 'status', type: 'string', size: 50, required: true },
      { name: 'events', type: 'string', size: 10000, required: false },
      { name: 'releasedAt', type: 'string', size: 255, required: false },
      { name: 'releaseTxHash', type: 'string', size: 255, required: false },
      { name: 'releaseType', type: 'string', size: 50, required: false },
      { name: 'createdAt', type: 'string', size: 255, required: true },
      { name: 'updatedAt', type: 'string', size: 255, required: true }
    ];

    // Проверяем какие атрибуты отсутствуют
    const missingAttributes = requiredAttributes.filter(attr => 
      !existingAttrNames.includes(attr.name)
    );

    if (missingAttributes.length === 0) {
      console.log('✅ Все необходимые атрибуты уже существуют');
      return true;
    }

    console.log(`➕ Добавляем ${missingAttributes.length} недостающих атрибутов:`);

    for (const attr of missingAttributes) {
      console.log(`  ➕ Добавление: ${attr.name} (${attr.type})`);
      
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'crypto_escrows',
            attr.name,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'double') {
          await databases.createFloatAttribute(
            DATABASE_ID,
            'crypto_escrows',
            attr.name,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'crypto_escrows',
            attr.name,
            attr.required
          );
        }
        
        console.log(`    ✅ ${attr.name} добавлен`);
        await sleep(1000);
      } catch (error) {
        if (error.code === 409) {
          console.log(`    ⚠️ ${attr.name} уже существует`);
        } else {
          console.log(`    ❌ Ошибка добавления ${attr.name}:`, error.message);
        }
      }
    }

    // Проверяем индексы
    console.log('📊 Проверка индексов...');
    const indexes = await databases.listIndexes(DATABASE_ID, 'crypto_escrows');
    const existingIndexNames = indexes.indexes.map(idx => idx.key);
    
    const requiredIndexes = ['jobId_index', 'contractId_index', 'status_index'];
    const missingIndexes = requiredIndexes.filter(idx => !existingIndexNames.includes(idx));

    if (missingIndexes.length > 0) {
      console.log(`➕ Создаем ${missingIndexes.length} недостающих индексов:`);
      
      for (const idx of missingIndexes) {
        try {
          if (idx === 'jobId_index') {
            await databases.createIndex(DATABASE_ID, 'crypto_escrows', idx, 'key', ['jobId']);
          } else if (idx === 'contractId_index') {
            await databases.createIndex(DATABASE_ID, 'crypto_escrows', idx, 'key', ['contractId']);
          } else if (idx === 'status_index') {
            await databases.createIndex(DATABASE_ID, 'crypto_escrows', idx, 'key', ['status']);
          }
          console.log(`    ✅ ${idx} создан`);
          await sleep(1000);
        } catch (error) {
          console.log(`    ❌ Ошибка создания ${idx}:`, error.message);
        }
      }
    } else {
      console.log('✅ Все необходимые индексы уже существуют');
    }

    console.log('✅ crypto_escrows коллекция полностью настроена');
    return true;
  } catch (error) {
    console.error('❌ Ошибка проверки crypto_escrows:', error.message);
    return false;
  }
}

async function checkAndUpdateDisputes() {
  try {
    console.log('🔍 Проверка коллекции disputes...');

    const collection = await databases.getCollection(DATABASE_ID, 'disputes');
    console.log('✅ Коллекция disputes найдена');

    const attributes = await databases.listAttributes(DATABASE_ID, 'disputes');
    const existingAttrNames = attributes.attributes.map(attr => attr.key);
    
    console.log(`📊 Найдено атрибутов: ${existingAttrNames.length}`);

    const requiredAttributes = [
      { name: 'jobId', type: 'string', size: 255, required: true },
      { name: 'contractId', type: 'string', size: 255, required: true },
      { name: 'escrowId', type: 'string', size: 255, required: true },
      { name: 'initiatorAddress', type: 'string', size: 255, required: true },
      { name: 'initiatorType', type: 'string', size: 20, required: true },
      { name: 'reason', type: 'string', size: 255, required: true },
      { name: 'description', type: 'string', size: 2000, required: false },
      { name: 'evidence', type: 'string', size: 5000, required: false },
      { name: 'status', type: 'string', size: 50, required: true },
      { name: 'resolution', type: 'string', size: 50, required: false },
      { name: 'clientPercentage', type: 'integer', required: false },
      { name: 'freelancerPercentage', type: 'integer', required: false },
      { name: 'arbitratorAddress', type: 'string', size: 255, required: false },
      { name: 'resolutionReason', type: 'string', size: 1000, required: false },
      { name: 'resolutionTxHash', type: 'string', size: 255, required: false },
      { name: 'txHash', type: 'string', size: 255, required: false },
      { name: 'createdAt', type: 'string', size: 255, required: true },
      { name: 'resolvedAt', type: 'string', size: 255, required: false },
      { name: 'updatedAt', type: 'string', size: 255, required: true }
    ];

    const missingAttributes = requiredAttributes.filter(attr => 
      !existingAttrNames.includes(attr.name)
    );

    if (missingAttributes.length === 0) {
      console.log('✅ Все необходимые атрибуты уже существуют');
      return true;
    }

    console.log(`➕ Добавляем ${missingAttributes.length} недостающих атрибутов:`);

    for (const attr of missingAttributes) {
      console.log(`  ➕ Добавление: ${attr.name} (${attr.type})`);
      
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'disputes',
            attr.name,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'disputes',
            attr.name,
            attr.required
          );
        }
        
        console.log(`    ✅ ${attr.name} добавлен`);
        await sleep(1000);
      } catch (error) {
        if (error.code === 409) {
          console.log(`    ⚠️ ${attr.name} уже существует`);
        } else {
          console.log(`    ❌ Ошибка добавления ${attr.name}:`, error.message);
        }
      }
    }

    // Проверяем индексы
    console.log('📊 Проверка индексов...');
    const indexes = await databases.listIndexes(DATABASE_ID, 'disputes');
    const existingIndexNames = indexes.indexes.map(idx => idx.key);
    
    const requiredIndexes = ['jobId_index', 'status_index'];
    const missingIndexes = requiredIndexes.filter(idx => !existingIndexNames.includes(idx));

    if (missingIndexes.length > 0) {
      console.log(`➕ Создаем ${missingIndexes.length} недостающих индексов:`);
      
      for (const idx of missingIndexes) {
        try {
          if (idx === 'jobId_index') {
            await databases.createIndex(DATABASE_ID, 'disputes', idx, 'key', ['jobId']);
          } else if (idx === 'status_index') {
            await databases.createIndex(DATABASE_ID, 'disputes', idx, 'key', ['status']);
          }
          console.log(`    ✅ ${idx} создан`);
          await sleep(1000);
        } catch (error) {
          console.log(`    ❌ Ошибка создания ${idx}:`, error.message);
        }
      }
    } else {
      console.log('✅ Все необходимые индексы уже существуют');
    }

    console.log('✅ disputes коллекция полностью настроена');
    return true;
  } catch (error) {
    console.error('❌ Ошибка проверки disputes:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Проверка и обновление коллекций для криптоплатежей...\n');

  console.log('📡 Подключение к Appwrite...');
  console.log(`   Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
  console.log(`   Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
  console.log(`   Database: ${DATABASE_ID}\n`);

  const escrowResult = await checkAndUpdateCryptoEscrows();
  console.log(''); // Пустая строка для разделения
  
  const disputeResult = await checkAndUpdateDisputes();
  
  console.log('\n🎯 Результаты:');
  console.log(`   crypto_escrows: ${escrowResult ? '✅ Готово' : '❌ Ошибка'}`);
  console.log(`   disputes: ${disputeResult ? '✅ Готово' : '❌ Ошибка'}`);
  
  if (escrowResult && disputeResult) {
    console.log('\n🎉 Все коллекции готовы к работе!');
    console.log('\n📝 Следующие шаги:');
    console.log('1. Задеплойте смарт-контракты: cd blockchain && forge script script/DeployTestnet.s.sol --broadcast');
    console.log('2. Обновите адреса контрактов в src/lib/web3/config.ts');
    console.log('3. Протестируйте криптоплатежи на сайте');
  } else {
    console.log('\n❌ Некоторые коллекции не удалось настроить');
    process.exit(1);
  }
}

main().catch(console.error);
