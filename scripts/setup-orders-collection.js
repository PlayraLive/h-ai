#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { OrdersCollectionSetup } = require('../src/lib/setup-orders-collection.ts');

async function setupOrdersCollection() {
  try {
    console.log('🚀 Starting orders collection setup...');
    
    const setup = new OrdersCollectionSetup();
    
    // Попытаемся добавить недостающие атрибуты к существующей коллекции
    await setup.ensureAllAttributes();
    
    console.log('🎉 Orders collection setup completed successfully!');
  } catch (error) {
    console.error('❌ Orders collection setup failed:', error.message);
    process.exit(1);
  }
}

// Запускаем настройку
setupOrdersCollection();