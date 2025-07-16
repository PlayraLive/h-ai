# 🚀 Vercel Environment Variables Setup

## 📋 Переменные для Vercel Dashboard

Скопируйте эти переменные в **Vercel Dashboard** → **Settings** → **Environment Variables**:

### 🔧 **Appwrite Configuration**
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=687759fb003c8bd76b93
NEXT_PUBLIC_APPWRITE_DATABASE_ID=687796e3001241f7de17
NEXT_PUBLIC_APPWRITE_BUCKET_ID=687796f2002638a8a945
APPWRITE_API_KEY=standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4
```

### 📊 **Collection IDs - Core Collections**
```
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID=projects
NEXT_PUBLIC_APPWRITE_PROPOSALS_COLLECTION_ID=proposals
NEXT_PUBLIC_APPWRITE_CONTRACTS_COLLECTION_ID=contracts
NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID=reviews
```

### 💬 **Collection IDs - Messaging Collections**
```
NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=messages
NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION_ID=conversations
```

### 💼 **Collection IDs - Business Collections**
```
NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID=payments
NEXT_PUBLIC_APPWRITE_PORTFOLIO_COLLECTION_ID=portfolio
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=notifications
```

### 📚 **Collection IDs - Reference Collections**
```
NEXT_PUBLIC_APPWRITE_SKILLS_COLLECTION_ID=skills
NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID=categories
```

### 🔄 **Collection IDs - Legacy/Future Collections**
```
NEXT_PUBLIC_APPWRITE_MILESTONES_COLLECTION_ID=milestones
NEXT_PUBLIC_APPWRITE_DISPUTES_COLLECTION_ID=disputes
```

---

## 🎯 **Быстрая настройка в Vercel**

### 1. **Откройте Vercel Dashboard**
https://vercel.com/dashboard

### 2. **Выберите проект H-Ai**
Перейдите в Settings → Environment Variables

### 3. **Добавьте переменные**
Скопируйте все переменные выше и добавьте их одну за одной.

### 4. **Выберите окружения**
Для каждой переменной выберите:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### 5. **Сохраните и разверните**
После добавления всех переменных нажмите **Redeploy** для применения изменений.

---

## 🔧 **Appwrite Console Setup**

### **Добавьте платформы в Appwrite Console:**
https://cloud.appwrite.io/console/project-687759fb003c8bd76b93/settings/platforms

**Добавьте эти платформы:**

1. **Production Domain**:
   - Name: `Vercel Production`
   - Hostname: `h-ai-lime.vercel.app`

2. **Preview Deployments**:
   - Name: `Vercel Preview`
   - Hostname: `*.vercel.app`

3. **Local Development**:
   - Name: `Local Development`
   - Hostname: `localhost`

---

## ✅ **Проверка настройки**

После настройки переменных и платформ:

1. **Откройте**: https://h-ai-lime.vercel.app
2. **Проверьте консоль** браузера на ошибки
3. **Попробуйте регистрацию** нового пользователя
4. **Проверьте дашборд** и мессенджер

### **Ожидаемый результат:**
- ✅ Нет ошибок 400/401 в консоли
- ✅ Регистрация создает пользователя в Appwrite
- ✅ Логин работает корректно
- ✅ Дашборд отображается
- ✅ Мессенджер доступен по ссылке `/chat`

---

## 🎉 **Готово!**

После выполнения всех шагов ваша AI Freelance Platform будет полностью настроена и готова к использованию на продакшене!

**Основные ссылки:**
- **Главная**: https://h-ai-lime.vercel.app
- **Регистрация**: https://h-ai-lime.vercel.app/en/signup
- **Логин**: https://h-ai-lime.vercel.app/en/login
- **Дашборд**: https://h-ai-lime.vercel.app/en/dashboard
- **Мессенджер**: https://h-ai-lime.vercel.app/en/chat

🚀 **Все готово к запуску!**
