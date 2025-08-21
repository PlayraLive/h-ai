#!/usr/bin/env node

/**
 * Скрипт для создания коллекций Appwrite для криптоплатежей
 * 
 * Использование:
 * node scripts/setup-crypto-collections.js
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createCryptoEscrowsCollection() {
  try {
    console.log('📦 Создание коллекции crypto_escrows...');

    // Создаем коллекцию
    await databases.createCollection(
      DATABASE_ID,
      'crypto_escrows',
      'Crypto Escrows',
      [
        'create("users")',
        'read("users")',
        'update("users")',
        'delete("users")'
      ]
    );

    console.log('✅ Коллекция crypto_escrows создана');

    // Добавляем атрибуты по одному с задержкой
    const attributes = [
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

    for (const attr of attributes) {
      console.log(`  ➕ Добавление атрибута: ${attr.name}`);
      
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
      
      await sleep(1000); // Ждем 1 секунду между атрибутами
    }

    // Создаем индексы
    console.log('  📊 Создание индексов...');
    await sleep(2000);
    
    await databases.createIndex(
      DATABASE_ID,
      'crypto_escrows',
      'jobId_index',
      'key',
      ['jobId']
    );

    await sleep(1000);
    
    await databases.createIndex(
      DATABASE_ID,
      'crypto_escrows',
      'contractId_index',
      'key',
      ['contractId']
    );

    console.log('✅ crypto_escrows коллекция настроена полностью');
    return true;
  } catch (error) {
    console.error('❌ Ошибка создания crypto_escrows:', error.message);
    return false;
  }
}

async function createDisputesCollection() {
  try {
    console.log('📦 Создание коллекции disputes...');

    await databases.createCollection(
      DATABASE_ID,
      'disputes',
      'Disputes',
      [
        'create("users")',
        'read("users")',
        'update("users")',
        'delete("users")'
      ]
    );

    console.log('✅ Коллекция disputes создана');

    const attributes = [
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

    for (const attr of attributes) {
      console.log(`  ➕ Добавление атрибута: ${attr.name}`);
      
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
      
      await sleep(1000);
    }

    // Создаем индексы
    console.log('  📊 Создание индексов...');
    await sleep(2000);
    
    await databases.createIndex(
      DATABASE_ID,
      'disputes',
      'jobId_index',
      'key',
      ['jobId']
    );

    await sleep(1000);
    
    await databases.createIndex(
      DATABASE_ID,
      'disputes',
      'status_index',
      'key',
      ['status']
    );

    console.log('✅ disputes коллекция настроена полностью');
    return true;
  } catch (error) {
    console.error('❌ Ошибка создания disputes:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Настройка коллекций для криптоплатежей...\n');

  // Проверяем переменные окружения
  if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
    console.error('❌ NEXT_PUBLIC_APPWRITE_ENDPOINT не найден в .env');
    process.exit(1);
  }
  
  if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY не найден в .env');
    console.log('💡 Получите API ключ в Appwrite Console → Settings → API Keys');
    process.exit(1);
  }

  console.log('📡 Подключение к Appwrite...');
  console.log(`   Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
  console.log(`   Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
  console.log(`   Database: ${DATABASE_ID}\n`);

  const escrowResult = await createCryptoEscrowsCollection();
  console.log(''); // Пустая строка для разделения
  
  const disputeResult = await createDisputesCollection();
  
  console.log('\n🎯 Результаты:');
  console.log(`   crypto_escrows: ${escrowResult ? '✅ Готово' : '❌ Ошибка'}`);
  console.log(`   disputes: ${disputeResult ? '✅ Готово' : '❌ Ошибка'}`);
  
  if (escrowResult && disputeResult) {
    console.log('\n🎉 Все коллекции созданы успешно!');
    console.log('\n📝 Следующие шаги:');
    console.log('1. Задеплойте смарт-контракты: cd blockchain && forge script script/DeployTestnet.s.sol --broadcast');
    console.log('2. Обновите адреса контрактов в src/lib/web3/config.ts');
    console.log('3. Протестируйте криптоплатежи на сайте');
  } else {
    console.log('\n❌ Некоторые коллекции не удалось создать');
    process.exit(1);
  }
}

main().catch(console.error);
