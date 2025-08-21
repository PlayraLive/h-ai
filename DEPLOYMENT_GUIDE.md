# 🚀 **Пошаговое руководство по запуску криптоплатежей**

## **Шаг 1: Настройка окружения**

### 1.1 Получение приватного ключа
```bash
# В MetaMask:
# 1. Откройте MetaMask
# 2. Нажмите на три точки → Account details → Export Private Key
# 3. Скопируйте приватный ключ (БЕЗ 0x в начале)
```

### 1.2 Настройка .env файла
```bash
cd blockchain
cp env-example .env
nano .env  # или откройте в любом редакторе
```

Добавьте в `.env`:
```env
PRIVATE_KEY=ваш_приватный_ключ_без_0x
TREASURY_WALLET=0x742d35Cc6635c0532925a3B8D5C9e9C16b8b2E2e
```

### 1.3 Получение тестовых токенов
Для тестирования нужны тестовые токены:

**Polygon Amoy Testnet:**
- Получите MATIC: https://faucet.polygon.technology/
- Получите тестовые USDC: https://faucet.circle.com/

## **Шаг 2: Деплой смарт-контракта**

### 2.1 Деплой в тестнет
```bash
cd blockchain
forge script script/DeployTestnet.s.sol --rpc-url https://rpc-amoy.polygon.technology/ --broadcast
```

### 2.2 Сохраните адрес контракта
После деплоя скопируйте адрес контракта из вывода:
```
FreelanceEscrow deployed at: 0x1234567890abcdef...
```

## **Шаг 3: Обновление фронтенда**

### 3.1 Обновите конфигурацию
Откройте файл `src/lib/web3/config.ts` и замените адрес:

```typescript
export const PLATFORM_CONTRACTS = {
  polygonAmoy: {
    escrow: '0x1234567890abcdef...', // Ваш адрес контракта
    // ...
  },
  // ...
}
```

### 3.2 Проверьте токены
Убедитесь что токены для Amoy настроены:
```typescript
export const TOKEN_ADDRESSES = {
  polygonAmoy: {
    USDC: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  },
  // ...
}
```

## **Шаг 4: Создание коллекций в Appwrite**

### 4.1 Создайте коллекции
В Appwrite Console создайте коллекции:

**crypto_escrows:**
```json
{
  "jobId": "string",
  "contractId": "string", 
  "clientAddress": "string",
  "freelancerAddress": "string",
  "amount": "string",
  "platformFee": "string",
  "token": "string",
  "network": "string",
  "status": "string",
  "events": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**disputes:**
```json
{
  "jobId": "string",
  "contractId": "string",
  "escrowId": "string", 
  "initiatorAddress": "string",
  "initiatorType": "string",
  "reason": "string",
  "description": "string",
  "status": "string",
  "createdAt": "datetime",
  "resolvedAt": "datetime"
}
```

## **Шаг 5: Тестирование**

### 5.1 Базовый тест
1. Откройте сайт
2. Подключите MetaMask к Polygon Amoy
3. Создайте тестовый проект
4. Попробуйте оплатить криптовалютой
5. Проверьте что транзакция прошла

### 5.2 Проверка на блокчейне
Откройте https://amoy.polygonscan.com/ и найдите ваш контракт по адресу

## **Шаг 6: Production деплой**

### 6.1 Деплой в mainnet
```bash
# Polygon Mainnet
forge script script/DeployMainnet.s.sol --rpc-url https://polygon-rpc.com/ --broadcast --verify

# Base Mainnet  
forge script script/DeployMainnet.s.sol --rpc-url https://mainnet.base.org --broadcast --verify

# Arbitrum Mainnet
forge script script/DeployMainnet.s.sol --rpc-url https://arb1.arbitrum.io/rpc --broadcast --verify
```

### 6.2 Обновите конфигурацию
Добавьте адреса mainnet контрактов в `config.ts`

## **Шаг 7: Мониторинг**

### 7.1 Настройте алерты
- Следите за балансом treasury кошелька
- Мониторьте количество транзакций
- Отслеживайте споры

### 7.2 Резервные процедуры
- Подготовьте процедуру паузы контракта в экстренных случаях
- Настройте многоподпись для критичных операций

## **🎯 Чеклист готовности:**

**Тестнет:**
- [ ] ✅ Получен приватный ключ
- [ ] ✅ Настроен .env файл  
- [ ] ✅ Получены тестовые токены
- [ ] ✅ Задеплоен контракт в тестнет
- [ ] ✅ Обновлена конфигурация фронтенда
- [ ] ✅ Созданы коллекции в Appwrite
- [ ] ✅ Проведено базовое тестирование

**Production:**
- [ ] Задеплоены контракты в mainnet
- [ ] Верифицированы контракты на explorer
- [ ] Настроен мониторинг
- [ ] Подготовлены emergency procedures
- [ ] Проведен security audit
- [ ] Настроена многоподпись

## **🆘 Помощь:**

**Если что-то не работает:**

1. **Ошибка "insufficient funds"** - нужно больше MATIC для газа
2. **"Contract not found"** - проверьте адрес контракта в config.ts
3. **"Token not supported"** - убедитесь что токен добавлен в контракт
4. **Транзакция не проходит** - увеличьте gas limit

**Полезные ссылки:**
- Polygon Amoy Explorer: https://amoy.polygonscan.com/
- Polygon Faucet: https://faucet.polygon.technology/
- MetaMask Help: https://support.metamask.io/

## **🎉 Готово!**
После выполнения всех шагов криптоплатежи будут работать на вашей платформе!
