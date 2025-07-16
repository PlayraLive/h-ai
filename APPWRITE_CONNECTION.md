# 🔗 Подключение к Appwrite

## 📋 Текущая конфигурация

Из вашего скриншота видно:
- **Project ID**: `687759fb003c8bd76b93`
- **Endpoint**: `https://fra.cloud.appwrite.io/v1`

## ⚡ Быстрая настройка

### 1. Добавьте веб-платформу
В Appwrite Console добавьте:
- **Name**: `AI Freelance Platform`
- **Hostname**: `localhost` (для разработки)
- **Hostname**: `h-ai-lime.vercel.app` (для продакшена)

### 2. Создайте API ключ
1. Перейдите в **Settings** → **API Keys**
2. Нажмите **Create API Key**
3. **Name**: `Server Key`
4. **Scopes**: Выберите все необходимые права:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `documents.read`
   - `documents.write`
   - `files.read`
   - `files.write`
   - `users.read`
   - `users.write`

### 3. Настройте базу данных
1. Перейдите в **Databases**
2. Создайте базу данных с ID: `y687796e3001241f7de17`
3. Или используйте существующую

### 4. Создайте коллекции

#### Users Collection
```json
{
  "collectionId": "users",
  "name": "Users",
  "attributes": [
    {"key": "name", "type": "string", "size": 255, "required": true},
    {"key": "email", "type": "string", "size": 255, "required": true},
    {"key": "avatar", "type": "string", "size": 500, "required": false},
    {"key": "role", "type": "string", "size": 50, "required": true},
    {"key": "skills", "type": "string", "size": 1000, "required": false},
    {"key": "bio", "type": "string", "size": 2000, "required": false},
    {"key": "hourlyRate", "type": "integer", "required": false},
    {"key": "rating", "type": "double", "required": false},
    {"key": "totalEarnings", "type": "double", "required": false},
    {"key": "completedProjects", "type": "integer", "required": false},
    {"key": "isVerified", "type": "boolean", "required": false},
    {"key": "createdAt", "type": "datetime", "required": true}
  ]
}
```

#### Projects Collection
```json
{
  "collectionId": "projects",
  "name": "Projects",
  "attributes": [
    {"key": "title", "type": "string", "size": 255, "required": true},
    {"key": "description", "type": "string", "size": 5000, "required": true},
    {"key": "category", "type": "string", "size": 100, "required": true},
    {"key": "budget", "type": "double", "required": true},
    {"key": "deadline", "type": "datetime", "required": false},
    {"key": "status", "type": "string", "size": 50, "required": true},
    {"key": "clientId", "type": "string", "size": 255, "required": true},
    {"key": "freelancerId", "type": "string", "size": 255, "required": false},
    {"key": "skills", "type": "string", "size": 1000, "required": false},
    {"key": "attachments", "type": "string", "size": 2000, "required": false},
    {"key": "createdAt", "type": "datetime", "required": true},
    {"key": "updatedAt", "type": "datetime", "required": true}
  ]
}
```

### 5. Настройте Storage
Создайте buckets:
- **profile_images** - для аватаров пользователей
- **portfolio_images** - для портфолио
- **job_attachments** - для файлов проектов

### 6. Настройте Auth
1. Перейдите в **Auth** → **Settings**
2. Включите **Email/Password**
3. Настройте **Google OAuth**:
   - Client ID и Secret из Google Console
   - Redirect URL: `https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/687759fb003c8bd76b93`

## 🔧 Environment Variables

Обновите `.env.local`:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=687759fb003c8bd76b93
NEXT_PUBLIC_APPWRITE_DATABASE_ID=y687796e3001241f7de17
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID=projects
NEXT_PUBLIC_APPWRITE_PROPOSALS_COLLECTION_ID=proposals
NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=messages
NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION_ID=conversations
NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID=reviews
NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID=payments
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=notifications
```

## ✅ Проверка подключения

После настройки:
1. Запустите `npm run dev`
2. Откройте http://localhost:3000
3. Попробуйте зарегистрироваться
4. Проверьте, что данные сохраняются в Appwrite

## 🆘 Если что-то не работает

1. Проверьте правильность Project ID
2. Убедитесь, что домен добавлен в Platforms
3. Проверьте права доступа к коллекциям
4. Убедитесь, что Google OAuth настроен правильно

---

**После настройки все функции платформы будут работать!** 🚀
