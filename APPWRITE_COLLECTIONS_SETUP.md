# 🗄️ Настройка коллекций Appwrite

## Пошаговая инструкция создания всех коллекций

### 1. Создание базы данных

1. Войдите в [Appwrite Console](https://cloud.appwrite.io)
2. Выберите ваш проект
3. Перейдите в раздел **Databases**
4. Нажмите **Create Database**
5. Название: `ai-freelance-platform`
6. Скопируйте **Database ID** в `.env.local`

### 2. Коллекция "jobs" (Вакансии)

**Создание коллекции:**
1. Нажмите **Create Collection**
2. Collection ID: `jobs`
3. Name: `Jobs`

**Атрибуты:**
```
title - String, Size: 255, Required: Yes
description - String, Size: 10000, Required: Yes
category - String, Size: 100, Required: Yes
subcategory - String, Size: 100, Required: No
skills - String, Size: 1000, Array: Yes, Required: Yes
budgetType - String, Size: 20, Required: Yes
budgetMin - Integer, Required: Yes
budgetMax - Integer, Required: Yes
currency - String, Size: 10, Required: Yes, Default: USD
duration - String, Size: 100, Required: Yes
experienceLevel - String, Size: 20, Required: Yes
location - String, Size: 100, Required: Yes
status - String, Size: 20, Required: Yes, Default: active
clientId - String, Size: 50, Required: Yes
clientName - String, Size: 255, Required: Yes
clientCompany - String, Size: 255, Required: No
clientAvatar - String, Size: 500, Required: No
featured - Boolean, Required: Yes, Default: false
urgent - Boolean, Required: Yes, Default: false
deadline - String, Size: 50, Required: No
attachments - String, Size: 500, Array: Yes, Required: No
applicationsCount - Integer, Required: Yes, Default: 0
viewsCount - Integer, Required: Yes, Default: 0
tags - String, Size: 100, Array: Yes, Required: No
```

**Разрешения:**
- Read: Any
- Create: Users
- Update: Users
- Delete: Users

**Индексы:**
- status (ASC)
- category (ASC)
- featured (DESC)
- $createdAt (DESC)

### 3. Коллекция "users" (Пользователи)

**Создание коллекции:**
1. Collection ID: `users`
2. Name: `Users`

**Атрибуты:**
```
email - String, Size: 255, Required: Yes
name - String, Size: 255, Required: Yes
avatar - String, Size: 500, Required: No
userType - String, Size: 20, Required: Yes
bio - String, Size: 2000, Required: No
location - String, Size: 100, Required: No
website - String, Size: 255, Required: No
phone - String, Size: 50, Required: No
skills - String, Size: 100, Array: Yes, Required: No
hourlyRate - Integer, Required: No
totalEarned - Integer, Required: No, Default: 0
jobsCompleted - Integer, Required: No, Default: 0
rating - Float, Required: No, Default: 0
reviewsCount - Integer, Required: No, Default: 0
verified - Boolean, Required: Yes, Default: false
topRated - Boolean, Required: Yes, Default: false
availability - String, Size: 20, Required: Yes, Default: available
```

**Разрешения:**
- Read: Any
- Create: Users
- Update: Users
- Delete: Users

**Индексы:**
- userType (ASC)
- rating (DESC)
- availability (ASC)

### 4. Коллекция "applications" (Заявки)

**Создание коллекции:**
1. Collection ID: `applications`
2. Name: `Applications`

**Атрибуты:**
```
jobId - String, Size: 50, Required: Yes
freelancerId - String, Size: 50, Required: Yes
freelancerName - String, Size: 255, Required: Yes
freelancerAvatar - String, Size: 500, Required: No
freelancerRating - Float, Required: No
coverLetter - String, Size: 5000, Required: Yes
proposedBudget - Integer, Required: Yes
proposedDuration - String, Size: 100, Required: Yes
status - String, Size: 20, Required: Yes, Default: pending
clientResponse - String, Size: 2000, Required: No
attachments - String, Size: 500, Array: Yes, Required: No
```

**Разрешения:**
- Read: Any
- Create: Users
- Update: Users
- Delete: Users

**Индексы:**
- jobId (ASC)
- freelancerId (ASC)
- status (ASC)
- $createdAt (DESC)

### 5. Коллекция "projects" (Проекты)

**Создание коллекции:**
1. Collection ID: `projects`
2. Name: `Projects`

**Атрибуты:**
```
jobId - String, Size: 50, Required: Yes
clientId - String, Size: 50, Required: Yes
freelancerId - String, Size: 50, Required: Yes
title - String, Size: 255, Required: Yes
description - String, Size: 5000, Required: Yes
budget - Integer, Required: Yes
status - String, Size: 20, Required: Yes, Default: active
progress - Integer, Required: Yes, Default: 0
startDate - String, Size: 50, Required: Yes
endDate - String, Size: 50, Required: No
```

**Разрешения:**
- Read: Any
- Create: Users
- Update: Users
- Delete: Users

### 6. Коллекция "reviews" (Отзывы)

**Создание коллекции:**
1. Collection ID: `reviews`
2. Name: `Reviews`

**Атрибуты:**
```
projectId - String, Size: 50, Required: Yes
jobId - String, Size: 50, Required: Yes
clientId - String, Size: 50, Required: Yes
freelancerId - String, Size: 50, Required: Yes
rating - Integer, Required: Yes
title - String, Size: 255, Required: Yes
comment - String, Size: 2000, Required: Yes
isPublic - Boolean, Required: Yes, Default: true
helpful - Integer, Required: Yes, Default: 0
notHelpful - Integer, Required: Yes, Default: 0
tags - String, Size: 50, Array: Yes, Required: Yes
```

**Разрешения:**
- Read: Any
- Create: Users
- Update: Users
- Delete: Users

### 7. Коллекция "messages" (Сообщения)

**Создание коллекции:**
1. Collection ID: `messages`
2. Name: `Messages`

**Атрибуты:**
```
senderId - String, Size: 50, Required: Yes
receiverId - String, Size: 50, Required: Yes
jobId - String, Size: 50, Required: No
projectId - String, Size: 50, Required: No
content - String, Size: 5000, Required: Yes
attachments - String, Size: 500, Array: Yes, Required: No
read - Boolean, Required: Yes, Default: false
type - String, Size: 20, Required: Yes, Default: text
```

**Разрешения:**
- Read: Any
- Create: Users
- Update: Users
- Delete: Users

**Индексы:**
- senderId (ASC)
- receiverId (ASC)
- read (ASC)
- $createdAt (DESC)

## 🔧 Настройка аутентификации

1. Перейдите в раздел **Auth**
2. Включите **Email/Password**
3. Настройте **OAuth** провайдеры (опционально):
   - Google
   - GitHub
4. В разделе **Platforms** добавьте:
   - **Web**: `http://localhost:3000`
   - **Web**: ваш production домен

## ✅ Проверка настройки

После создания всех коллекций:

1. Убедитесь, что все коллекции созданы
2. Проверьте разрешения для каждой коллекции
3. Добавьте переменные окружения в `.env.local`
4. Запустите приложение: `npm run dev`
5. Попробуйте зарегистрироваться и создать джоб

## 🚀 Готово!

Теперь ваша Appwrite база данных полностью настроена и готова к работе!
