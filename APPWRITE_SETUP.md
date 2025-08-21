# 🗄️ **Настройка коллекций Appwrite для криптоплатежей**

## **❗ ВАЖНО: Нужно создать 2 новые коллекции**

Для работы криптоплатежей необходимо создать 2 коллекции в Appwrite:
1. **`crypto_escrows`** - информация о escrow контрактах
2. **`disputes`** - система споров

## **🚀 Быстрый способ (автоматически)**

### 1. Получите API ключ Appwrite
1. Откройте [Appwrite Console](https://cloud.appwrite.io/)
2. Выберите ваш проект H-Ai
3. Перейдите в **Settings** → **API Keys**
4. Нажмите **Create API Key**
5. Выберите **Server SDK** и все разрешения
6. Скопируйте ключ

### 2. Добавьте API ключ в .env
```bash
# В корневой папке проекта добавьте в .env.local:
APPWRITE_API_KEY=ваш_api_ключ_здесь
```

### 3. Запустите скрипт создания коллекций
```bash
node scripts/setup-crypto-collections.js
```

**Готово!** Коллекции созданы автоматически.

---

## **🔧 Ручной способ (если автоматический не работает)**

### Создание коллекции `crypto_escrows`

1. **Создать коллекцию:**
   - Name: `crypto_escrows`
   - Collection ID: `crypto_escrows`
   - Permissions: 
     - Create: `users`
     - Read: `users` 
     - Update: `users`
     - Delete: `users`

2. **Добавить атрибуты:**

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| jobId | String | 255 | ✅ | - |
| contractId | String | 255 | ✅ | - |
| txHash | String | 255 | ✅ | - |
| network | String | 50 | ✅ | - |
| token | String | 20 | ✅ | - |
| amount | Float | - | ✅ | - |
| platformFee | Float | - | ✅ | - |
| milestones | Integer | - | ❌ | - |
| completedMilestones | Integer | - | ❌ | 0 |
| deadline | String | 255 | ❌ | - |
| clientAddress | String | 255 | ✅ | - |
| freelancerAddress | String | 255 | ✅ | - |
| status | String | 50 | ✅ | - |
| events | String | 10000 | ❌ | - |
| releasedAt | String | 255 | ❌ | - |
| releaseTxHash | String | 255 | ❌ | - |
| releaseType | String | 50 | ❌ | - |
| createdAt | String | 255 | ✅ | - |
| updatedAt | String | 255 | ✅ | - |

3. **Создать индексы:**
   - `jobId_index` (key): jobId
   - `contractId_index` (key): contractId
   - `status_index` (key): status

### Создание коллекции `disputes`

1. **Создать коллекцию:**
   - Name: `disputes`
   - Collection ID: `disputes`
   - Permissions: те же что и выше

2. **Добавить атрибуты:**

| Attribute | Type | Size | Required |
|-----------|------|------|----------|
| jobId | String | 255 | ✅ |
| contractId | String | 255 | ✅ |
| escrowId | String | 255 | ✅ |
| initiatorAddress | String | 255 | ✅ |
| initiatorType | String | 20 | ✅ |
| reason | String | 255 | ✅ |
| description | String | 2000 | ❌ |
| evidence | String | 5000 | ❌ |
| status | String | 50 | ✅ |
| resolution | String | 50 | ❌ |
| clientPercentage | Integer | - | ❌ |
| freelancerPercentage | Integer | - | ❌ |
| arbitratorAddress | String | 255 | ❌ |
| resolutionReason | String | 1000 | ❌ |
| resolutionTxHash | String | 255 | ❌ |
| txHash | String | 255 | ❌ |
| createdAt | String | 255 | ✅ |
| resolvedAt | String | 255 | ❌ |
| updatedAt | String | 255 | ✅ |

3. **Создать индексы:**
   - `jobId_index` (key): jobId
   - `status_index` (key): status

---

## **🔍 Проверка создания**

После создания коллекций проверьте:

1. **В Appwrite Console:**
   - Перейдите в **Databases** → ваша база данных
   - Должны появиться коллекции `crypto_escrows` и `disputes`
   - Проверьте что все атрибуты созданы

2. **Тестовый запрос:**
```javascript
// В браузерной консоли на вашем сайте:
const { databases } = await import('/src/lib/appwrite/database.js');
const result = await databases.listDocuments('your_db_id', 'crypto_escrows');
console.log('Коллекция crypto_escrows работает:', result);
```

---

## **🚨 Troubleshooting**

**"Collection with ID crypto_escrows already exists"**
- ✅ Коллекция уже создана, можно пропустить

**"Invalid API key"**
- Проверьте что API ключ правильный
- Убедитесь что у ключа есть права на databases

**"Attribute creation failed"**
- Подождите несколько секунд между созданием атрибутов
- Appwrite имеет лимиты на скорость создания

**"Permission denied"**
- Проверьте что у API ключа есть права `databases.write`

---

## **✅ Готово!**

После создания коллекций можно:
1. Деплоить смарт-контракты
2. Тестировать криптоплатежи
3. Использовать milestone систему
4. Открывать споры

**Коллекции созданы → можно запускать криптоплатежи! 🚀**