# 🚀 Vercel Environment Variables Setup

## ⚡ ОБНОВЛЕНО: Все коллекции добавлены в .env

### 1. Add Multiple Platforms in Appwrite Console:
https://cloud.appwrite.io/console/project-687759fb003c8bd76b93/settings/platforms

**Add these platforms:**

1. **Main Domain**:
   - Name: `Vercel Production`
   - Hostname: `h-ai-lime.vercel.app`

2. **Wildcard Support**:
   - Name: `Vercel Wildcard`
   - Hostname: `*.vercel.app`

3. **Local Development**:
   - Name: `Local Development`
   - Hostname: `localhost`

### 2. Vercel Environment Variables:
📋 **Используйте файл VERCEL_ENV_VARIABLES.md** для полного списка переменных!

**Основные переменные:**
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=687759fb003c8bd76b93
NEXT_PUBLIC_APPWRITE_DATABASE_ID=687796e3001241f7de17
NEXT_PUBLIC_APPWRITE_BUCKET_ID=687796f2002638a8a945
APPWRITE_API_KEY=standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4
```

**Все 12 коллекций:**
```
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID=projects
NEXT_PUBLIC_APPWRITE_PROPOSALS_COLLECTION_ID=proposals
NEXT_PUBLIC_APPWRITE_CONTRACTS_COLLECTION_ID=contracts
NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID=reviews
NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=messages
NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION_ID=conversations
NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID=payments
NEXT_PUBLIC_APPWRITE_PORTFOLIO_COLLECTION_ID=portfolio
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=notifications
NEXT_PUBLIC_APPWRITE_SKILLS_COLLECTION_ID=skills
NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID=categories
```

### 3. Force Redeploy:
После добавления всех переменных запустите новый деплой в Vercel.

### 4. Test URLs:
- https://h-ai-lime.vercel.app/en/signup
- https://h-ai-lime.vercel.app/en/login
- https://h-ai-lime.vercel.app/en/dashboard
- https://h-ai-lime.vercel.app/en/chat 🆕

## 🔍 Troubleshooting:

If still getting Error 400:
1. Wait 5-10 minutes for Appwrite cache to clear
2. Try incognito/private browser window
3. Check Appwrite Console → Auth → Users for new registrations
4. Verify all platforms are added correctly

## ✅ Success Indicators:
- No Error 400 on page load
- Registration creates user in Appwrite
- Login redirects to dashboard
- Console shows successful auth logs
- Мессенджер доступен по ссылке /chat 🆕

## 📋 Файлы для справки:
- `.env.example` - пример всех переменных
- `VERCEL_ENV_VARIABLES.md` - полный список для Vercel
- `DATABASE_SCHEMA.md` - схема базы данных
- `MESSAGING_SYSTEM.md` - документация мессенджера
