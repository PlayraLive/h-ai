#!/usr/bin/env node

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function checkCollections() {
  try {
    console.log('🔍 Проверяю существующие коллекции...\n');

    const collections = await databases.listCollections(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
    
    console.log('📋 Существующие коллекции:');
    collections.collections.forEach(c => {
      console.log(`  - ${c.name} (${c.$id})`);
    });

    console.log(`\n✅ Всего коллекций: ${collections.collections.length}`);

    // Проверяем ключевые коллекции для рейтингов
    const requiredCollections = ['Users', 'Jobs', 'Reviews', 'Projects', 'Notifications'];
    const existingNames = collections.collections.map(c => c.name);
    
    console.log('\n🎯 Проверка ключевых коллекций для рейтингов:');
    requiredCollections.forEach(name => {
      const exists = existingNames.includes(name);
      console.log(`  ${exists ? '✅' : '❌'} ${name}`);
    });

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkCollections();
