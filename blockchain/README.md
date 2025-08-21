# 🚀 H-AI Blockchain Smart Contracts

Этот проект содержит смарт-контракты для H-AI платформы, реализованные с помощью Foundry.

## 📋 Что готово

✅ **FreelanceEscrow** - Основной escrow контракт с функциями:
- Блокировка средств до завершения работы
- Milestone платежи для крупных проектов  
- Система разрешения споров
- Поддержка множественных токенов (USDC, USDT, DAI)
- Комиссия платформы 10%
- Emergency release при таймауте

## 🛠 Установка и настройка

### 1. Установка зависимостей
```bash
# Foundry уже установлен в системе
forge install
```

### 2. Настройка окружения
```bash
# Скопируйте файл с переменными окружения
cp env-example .env

# Отредактируйте .env файл:
# - PRIVATE_KEY: приватный ключ кошелька для деплоя (без 0x)
# - TREASURY_WALLET: адрес кошелька для получения комиссий
```

### 3. Компиляция контрактов
```bash
forge build
```

## 🚀 Деплой контрактов

### Тестнеты (рекомендуется для начала):

```bash
# Polygon Amoy (новый тестнет)
forge script script/Deploy.s.sol --rpc-url https://rpc-amoy.polygon.technology/ --broadcast --verify

# Polygon Mumbai (старый тестнет, но еще работает)
forge script script/Deploy.s.sol --rpc-url https://rpc-mumbai.maticvigil.com/ --broadcast

# Base Sepolia
forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org --broadcast --verify
```

### Mainnet (только после тестирования):

```bash
# Polygon Mainnet
forge script script/Deploy.s.sol --rpc-url https://polygon-rpc.com/ --broadcast --verify

# Base Mainnet  
forge script script/Deploy.s.sol --rpc-url https://mainnet.base.org --broadcast --verify

# Arbitrum One
forge script script/Deploy.s.sol --rpc-url https://arb1.arbitrum.io/rpc --broadcast --verify
```

## 📊 После деплоя

1. **Обновите конфигурацию в основном проекте**:
   ```typescript
   // ../src/lib/web3/config.ts
   export const PLATFORM_CONTRACTS = {
     polygonAmoy: {
       escrow: '0x...', // Адрес из вывода деплоя
     }
   }
   ```

2. **Протестируйте контракт**:
   - Создайте тестовый escrow через UI
   - Проверьте поддерживаемые токены
   - Протестируйте milestone платежи

## 🔧 Полезные команды

```bash
# Компиляция
forge build

# Тесты (когда будут написаны)
forge test

# Проверка размера контрактов
forge build --sizes

# Симуляция деплоя без broadcast
forge script script/Deploy.s.sol --rpc-url <RPC_URL>

# Верификация уже задеплоенного контракта
forge verify-contract <CONTRACT_ADDRESS> FreelanceEscrow --rpc-url <RPC_URL>
```

## 🎯 Следующие шаги

### ✅ **Готово:**
1. ✅ **Интеграция с фронтендом** - реальные вызовы смарт-контрактов
2. ✅ **Token Approval система** - автоматический approve для ERC20
3. ✅ **Milestone платежи** - поэтапная оплата крупных проектов
4. ✅ **Система споров** - разрешение конфликтов через арбитров
5. ✅ **Treasury управление** - централизованный сбор комиссий
6. ✅ **API интеграция** - полная интеграция с бэкендом
7. ✅ **Tron поддержка** - TRC20 USDT интеграция
8. ✅ **Security аудит** - базовая проверка безопасности

### 🚧 **Для Production:**
1. **Comprehensive тестирование** - unit и integration тесты
2. **Внешний аудит** - профессиональная проверка безопасности
3. **Мониторинг** - настройка алертов и трекинга
4. **Multisig** - переход на многоподпись для критичных функций

## 📞 Поддержка

При возникновении проблем:
1. Проверьте что .env файл настроен правильно
2. Убедитесь что есть тестовые токены на кошельке
3. Проверьте что RPC URL доступен и работает