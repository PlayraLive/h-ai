#!/usr/bin/env node

// Скрипт проверки готовности криптоплатежей
const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка готовности криптоплатежей...\n');

// Проверяем .env.local
const envPath = path.join(process.cwd(), '.env.local');
let envExists = false;
let walletConnectConfigured = false;

try {
  if (fs.existsSync(envPath)) {
    envExists = true;
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID')) {
      const match = envContent.match(/NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=(.+)/);
      if (match && match[1] && match[1] !== 'demo-project-id') {
        walletConnectConfigured = true;
      }
    }
  }
} catch (error) {
  console.error('❌ Ошибка чтения .env.local:', error.message);
}

// Проверяем обязательные файлы
const requiredFiles = [
  'src/providers/Web3Provider.tsx',
  'src/components/web3/CryptoPaymentModal.tsx',
  'src/lib/web3/config.ts',
  'src/lib/web3/escrow-contract.sol',
  'src/app/api/web3/create-escrow/route.ts'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`❌ Отсутствует файл: ${file}`);
    allFilesExist = false;
  }
});

// Проверяем package.json зависимости
const packagePath = path.join(process.cwd(), 'package.json');
let requiredDepsInstalled = false;

try {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = ['wagmi', 'viem', '@tanstack/react-query', '@reown/appkit'];
  const missingDeps = requiredDeps.filter(dep => !deps[dep]);
  
  if (missingDeps.length === 0) {
    requiredDepsInstalled = true;
  } else {
    console.log(`❌ Отсутствуют зависимости: ${missingDeps.join(', ')}`);
  }
} catch (error) {
  console.error('❌ Ошибка чтения package.json:', error.message);
}

// Результаты проверки
console.log('📋 РЕЗУЛЬТАТЫ ПРОВЕРКИ:\n');

console.log('1. Файлы компонентов:');
console.log(allFilesExist ? '   ✅ Все файлы на месте' : '   ❌ Отсутствуют файлы');

console.log('2. Зависимости Web3:');
console.log(requiredDepsInstalled ? '   ✅ Все зависимости установлены' : '   ❌ Отсутствуют зависимости');

console.log('3. Файл конфигурации:');
console.log(envExists ? '   ✅ .env.local существует' : '   ❌ .env.local отсутствует');

console.log('4. WalletConnect Project ID:');
console.log(walletConnectConfigured ? '   ✅ Настроен' : '   ❌ Не настроен (demo-project-id)');

// Итоговый статус
const allReady = allFilesExist && requiredDepsInstalled && envExists;
const productionReady = allReady && walletConnectConfigured;

console.log('\n🎯 СТАТУС ГОТОВНОСТИ:\n');

if (productionReady) {
  console.log('🟢 ПОЛНОСТЬЮ ГОТОВО! Можно тестировать с реальными кошельками');
} else if (allReady) {
  console.log('🟡 ЧАСТИЧНО ГОТОВО. Нужен только WalletConnect Project ID для полной функциональности');
} else {
  console.log('🔴 НЕ ГОТОВО. Нужны дополнительные настройки');
}

console.log('\n📝 ЧТО ДЕЛАТЬ ДАЛЬШЕ:\n');

if (!allFilesExist) {
  console.log('❗ Восстановить отсутствующие файлы компонентов');
}

if (!requiredDepsInstalled) {
  console.log('❗ Установить зависимости: npm install wagmi viem @tanstack/react-query @reown/appkit --legacy-peer-deps');
}

if (!envExists) {
  console.log('❗ Создать файл .env.local в корне проекта');
}

if (!walletConnectConfigured) {
  console.log('❗ Получить WalletConnect Project ID:');
  console.log('   1. Перейти на https://cloud.walletconnect.com');
  console.log('   2. Создать аккаунт и проект');
  console.log('   3. Скопировать Project ID');
  console.log('   4. Добавить в .env.local: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=ваш_id');
}

console.log('\n🚀 После настройки:');
console.log('1. npm run dev');
console.log('2. Открыть любой джоб → Messages');
console.log('3. Нажать кнопку "⚡ Крипта"');
console.log('4. Тестировать подключение кошелька');

console.log('\n💡 Справка: см. файл API_SETUP_GUIDE.md');
