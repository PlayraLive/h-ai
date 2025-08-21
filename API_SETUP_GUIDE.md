# 🔧 Гайд по настройке API для криптоплатежей

## 🚨 **КРИТИЧЕСКИ ВАЖНЫЕ API (без них не работает)**

### 1. **WalletConnect Project ID** ⭐️ ОБЯЗАТЕЛЬНО
```bash
# Текущий статус: demo-project-id (не работает в production)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo-project-id
```

**Как получить:**
1. Перейти на https://cloud.walletconnect.com
2. Зарегистрироваться/войти
3. Создать новый проект
4. Скопировать Project ID
5. Обновить `.env.local`:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=вашproject_id_здесь
```

**Зачем нужен:** Подключение кошельков WalletConnect, Trust Wallet, Rainbow и других

---

## 🔗 **RPC ENDPOINTS для блокчейнов**

### 2. **Alchemy/Infura API Keys** (рекомендуется)
```bash
# Добавить в .env.local
NEXT_PUBLIC_ALCHEMY_API_KEY=ваш_alchemy_ключ
NEXT_PUBLIC_INFURA_PROJECT_ID=ваш_infura_ключ
```

**Как получить Alchemy:**
1. https://www.alchemy.com → Sign Up
2. Create App → выбрать Polygon
3. Скопировать API Key

**Как получить Infura:**
1. https://infura.io → Sign Up  
2. Create New Key → Web3 API
3. Скопировать Project ID

**Зачем нужен:** Быстрые и надежные RPC подключения к блокчейнам

---

## 💳 **ПЛАТЕЖНЫЕ СИСТЕМЫ (опционально)**

### 3. **Coinbase Commerce API** (для фиат→крипто)
```bash
COINBASE_COMMERCE_API_KEY=ваш_ключ
COINBASE_COMMERCE_WEBHOOK_SECRET=ваш_webhook_секрет
```

**Как получить:**
1. https://commerce.coinbase.com → Sign up
2. Settings → API Keys
3. Create API Key

**Зачем нужен:** Прием платежей картой с автоконвертацией в крипто

### 4. **Plisio API** (крипто платежи)
```bash
PLISIO_SECRET_KEY=ваш_plisio_ключ
```

**Как получить:**
1. https://plisio.net → Register
2. API → Create new API key

**Зачем нужен:** Альтернативный провайдер криптоплатежей

---

## ⛓️ **БЛОКЧЕЙН INFRASTRUCTURE**

### 5. **Polygon Gas Station API** (опционально)
```bash
NEXT_PUBLIC_POLYGON_GAS_API=https://gasstation.polygon.technology/v2
```

**Зачем нужен:** Оптимизация gas fees

### 6. **Etherscan/Polygonscan API** (опционально)
```bash
ETHERSCAN_API_KEY=ваш_etherscan_ключ
POLYGONSCAN_API_KEY=ваш_polygonscan_ключ
```

**Как получить:**
1. https://etherscan.io/apis → Create Free Account
2. https://polygonscan.com/apis → Create Account

**Зачем нужен:** Верификация транзакций, получение ABI контрактов

---

## 🏦 **ТОКЕН АДРЕСА (уже настроены в testnet)**

Текущие адреса в `src/lib/web3/config.ts`:

### Polygon Mumbai (testnet):
```typescript
polygonMumbai: {
  USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 
  DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
}
```

---

## 📝 **ПОШАГОВАЯ НАСТРОЙКА**

### Шаг 1: Обновить .env.local
```bash
# Обязательные
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=ваш_project_id

# Рекомендуемые для production
NEXT_PUBLIC_ALCHEMY_API_KEY=ваш_alchemy_ключ
NEXT_PUBLIC_INFURA_PROJECT_ID=ваш_infura_ключ

# Опциональные
COINBASE_COMMERCE_API_KEY=ваш_coinbase_ключ
PLISIO_SECRET_KEY=ваш_plisio_ключ
ETHERSCAN_API_KEY=ваш_etherscan_ключ
POLYGONSCAN_API_KEY=ваш_polygonscan_ключ
```

### Шаг 2: Обновить Web3Provider.tsx
```typescript
// Заменить demo-project-id на реальный
walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'
```

### Шаг 3: Тестирование
1. Перезапустить сервер: `npm run dev`
2. Открыть любой джоб → Messages
3. Нажать "⚡ Крипта"
4. Попробовать подключить кошелек

---

## 🧪 **ЧТО РАБОТАЕТ ПРЯМО СЕЙЧАС (без настройки)**

### ✅ С demo Project ID:
- Открытие модального окна
- Выбор сети и токена
- Расчет комиссий
- UI/UX полностью

### ❌ НЕ работает без настройки:
- Подключение кошельков WalletConnect
- Trust Wallet, Rainbow, Coinbase Wallet
- Реальные транзакции

### ✅ Работает с MetaMask (локально):
- Подключение кошелька
- Проверка баланса
- Переключение сетей

---

## 🚀 **МИНИМАЛЬНАЯ НАСТРОЙКА ДЛЯ ТЕСТОВ**

Для базового тестирования нужен ТОЛЬКО:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=реальный_project_id
```

Это займет 5 минут и даст возможность:
- Подключать любые кошельки  
- Тестировать весь UI флоу
- Проверять balance и сети

---

## 🏭 **PRODUCTION SETUP**

Для production дополнительно нужно:
1. **Деплой смарт-контракта** в mainnet
2. **Верификация контракта** на Polygonscan  
3. **Security аудит** контракта
4. **Мониторинг** транзакций
5. **Legal compliance** для криптоплатежей

---

## 💡 **БЫСТРЫЙ СТАРТ**

**Прямо сейчас можно:**
1. Получить WalletConnect Project ID (5 мин)
2. Обновить .env.local
3. Перезапустить `npm run dev` 
4. Тестировать с реальными кошельками!

**Результат:** Полнофункциональные криптоплатежи готовы к использованию! 🎉
