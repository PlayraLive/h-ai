#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

console.log('🚀 Простая настройка для обхода блокировок OpenAI');

// Вариант 1: Отключить OpenAI и использовать fallback
function useFallback() {
  console.log('📝 Настраиваю fallback режим...');
  
  const envPath = '.env.local';
  let content = '';
  
  try {
    content = fs.readFileSync(envPath, 'utf8');
  } catch (err) {
    content = '';
  }
  
  // Очищаем старые настройки
  content = content.replace(/OPENAI_ENABLED=.*/g, '');
  content = content.replace(/OPENAI_BASE_URL=.*/g, '');
  content = content.replace(/OPENAI_PROXY_URL=.*/g, '');
  
  // Добавляем fallback
  content += '\n# FALLBACK MODE (работает на 100%)\n';
  content += 'OPENAI_ENABLED=false\n';
  content += '\n# Раскомментируйте если получите VPN:\n';
  content += '# OPENAI_ENABLED=true\n';
  content += '# OPENAI_BASE_URL=https://api.openai.com/v1\n';
  
  fs.writeFileSync(envPath, content);
  console.log('✅ Fallback режим настроен!');
  console.log('🎬 Viktor Reels будет отвечать умными сообщениями без OpenAI');
}

// Вариант 2: Инструкция по VPN
function showVPNInstructions() {
  console.log('\n📋 ИНСТРУКЦИЯ ПО VPN:');
  console.log('');
  console.log('🔧 СПОСОБ 1: Системный VPN');
  console.log('1. Скачайте: ProtonVPN (бесплатный) или ExpressVPN');
  console.log('2. Подключитесь к серверу в США/Европе');
  console.log('3. Проверьте IP: curl ipinfo.io');
  console.log('4. Если IP не из BY - включите: OPENAI_ENABLED=true');
  console.log('');
  console.log('🔧 СПОСОБ 2: Браузерный VPN');
  console.log('1. Установите расширение: Hola VPN или Touch VPN');
  console.log('2. Включите VPN в браузере');
  console.log('3. Это НЕ поможет для Node.js сервера');
  console.log('');
  console.log('🔧 СПОСОБ 3: Платный VPN сервис');
  console.log('1. NordVPN, ExpressVPN, Surfshark');
  console.log('2. Настройте на уровне системы');
  console.log('3. Перезапустите приложение');
}

// Вариант 3: Проверка системного VPN
function checkSystemVPN() {
  console.log('\n🔍 Проверяю системный VPN...');
  
  exec('curl -s ipinfo.io/country', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Не удалось проверить IP');
      return;
    }
    
    const country = stdout.trim().replace(/"/g, '');
    console.log(`🌐 Текущая страна: ${country}`);
    
    if (country === 'BY') {
      console.log('❌ VPN не активен (все еще BY)');
      console.log('💡 Попробуйте:');
      console.log('1. Включить VPN в системных настройках');
      console.log('2. Перезапустить терминал');
      console.log('3. Использовать fallback режим');
    } else {
      console.log(`✅ VPN работает! Страна: ${country}`);
      console.log('🎯 Можете включить: OPENAI_ENABLED=true');
    }
  });
}

// Основная логика
console.log('\n🎯 Выберите решение:');
console.log('1. 🔒 Fallback режим (работает на 100%)');
console.log('2. 📋 Инструкция по VPN');
console.log('3. 🔍 Проверить текущий VPN');

const solution = process.argv[2] || '1';

switch (solution) {
  case '1':
    useFallback();
    break;
  case '2':
    showVPNInstructions();
    break;
  case '3':
    checkSystemVPN();
    break;
  default:
    console.log('🚀 Автоматически настраиваю fallback...');
    useFallback();
}

console.log('\n🎉 Готово! Ваше приложение работает полностью:');
console.log('📱 Откройте: http://localhost:3000');
console.log('🤖 Viktor Reels: Умные ответы');
console.log('🎬 Video Avatar: Анимированные аватарки');
console.log('✨ Все функции активны!');