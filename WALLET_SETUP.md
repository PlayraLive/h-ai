# 🏦 **НАСТРОЙКА КОШЕЛЬКОВ**

## ✅ **ЧТО УЖЕ НАСТРОЕНО:**

### **MetaMask кошелек: `0xfdCc732Be626Db71b096c36b8de7C8471B3708bE`**
- ✅ **Treasury Wallet** - получает 10% комиссию со всех escrow
- ✅ **Arbitrator** - разрешает споры между клиентами и фрилансерами
- ✅ **Admin** - управляет смарт-контрактом после деплоя

---

## **🔐 ЧТО НУЖНО СДЕЛАТЬ ВАМ:**

### **1. Создать файл `.env` в папке `blockchain/`:**

```bash
# blockchain/.env
PRIVATE_KEY=224cde687da9d6f4b16eeae96395b6f3e618462559970df5f1fca9c55fd07899
TREASURY_WALLET=0xfdCc732Be626Db71b096c36b8de7C8471B3708bE
```

### **2. Создать Tron кошельки (для TRC20 USDT):**

#### **Tron Mainnet:**
- Установить **TronLink** расширение
- Создать кошелек
- Скопировать адрес (формат: `T...`)
- Заменить в `config.ts`:
```typescript
tronMainnet: 'T...', // Ваш Tron адрес
```

#### **Tron Shasta (тестнет):**
- В TronLink переключиться на **Shasta testnet**
- Создать тестнет кошелек
- Скопировать адрес
- Заменить в `config.ts`:
```typescript
tronShasta: 'T...', // Ваш Tron тестнет адрес
```

---

## **💰 КОМИССИИ КОТОРЫЕ ПОЛУЧАЕТ ВАШ КОШЕЛЕК:**

### **Treasury Wallet (10%):**
- **С каждого escrow** - 10% от суммы
- **Пример:** $1000 проект = $100 в ваш кошелек
- **С каждой сети** - Polygon, Base, Arbitrum, Tron

### **Arbitrator Fees:**
- **За разрешение споров** - дополнительная комиссия
- **Устанавливается** в смарт-контракте

---

## **🚀 СЛЕДУЮЩИЕ ШАГИ:**

### **1. Создать .env файл:**
```bash
cd blockchain
cp env.example .env
# Отредактировать .env с вашими данными
```

### **2. Создать Tron кошельки:**
- Установить TronLink
- Создать mainnet и testnet кошельки
- Обновить адреса в `config.ts`

### **3. Задеплоить контракты:**
```bash
cd blockchain
forge script script/DeployTestnet.s.sol --rpc-url https://rpc-amoy.polygon.technology/ --broadcast
```

### **4. Получить тестнет токены:**
- **Polygon Amoy:** https://faucet.polygon.technology/
- **Base Sepolia:** https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Tron Shasta:** https://www.trongrid.io/faucet

---

## **⚠️ ВАЖНО:**

### **Безопасность:**
- **Никогда не делитесь** приватным ключом
- **Не коммитьте** .env файл в git
- **Используйте разные кошельки** для разных целей

### **Тестирование:**
- **Сначала тестируйте** на тестнетах
- **Малые суммы** для проверки
- **Верификация** контрактов на explorer

---

## **🎯 ГОТОВЫ НАЧАТЬ?**

**После создания .env и Tron кошельков, можете деплоить контракты!**

**Нужна помощь с Tron кошельками или деплоем?** 🚀
