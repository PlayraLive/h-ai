# 🔧 Appwrite Setup Guide

## Проблема с Vercel деплоем

Если вы получаете ошибку:
```
Error 400
Invalid `success` param: Invalid URI. Register your new client (h-ai-lime.vercel.app) as a new Web platform on your project console dashboard
general_argument_invalid
```

Это означает, что нужно добавить домен Vercel в настройки Appwrite.

## 🚀 Пошаговое решение

### 1. Откройте Appwrite Console
- Перейдите на [cloud.appwrite.io](https://cloud.appwrite.io)
- Войдите в свой аккаунт
- Выберите проект с ID: `687759fb003c8bd76b93`

### 2. Добавьте Web Platform
1. В левом меню выберите **Settings**
2. Перейдите на вкладку **Platforms**
3. Нажмите **Add Platform**
4. Выберите **Web App**

### 3. Настройте платформу
Заполните поля:
- **Name**: `Vercel Production`
- **Hostname**: `h-ai-lime.vercel.app` (или ваш домен Vercel)

### 4. Сохраните изменения
- Нажмите **Next**
- Нажмите **Create**

## 🌐 Дополнительные домены

Если у вас есть кастомный домен, добавьте его тоже:
- **Name**: `Custom Domain`
- **Hostname**: `yourdomain.com`

## 🔄 Для разработки

Убедитесь, что также добавлен localhost:
- **Name**: `Local Development`
- **Hostname**: `localhost`

## ✅ Проверка

После добавления доменов:
1. Подождите 1-2 минуты
2. Обновите страницу Vercel
3. Попробуйте войти в систему

## 🔑 Environment Variables для Vercel

Убедитесь, что в Vercel добавлены все переменные:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=687759fb003c8bd76b93
NEXT_PUBLIC_APPWRITE_DATABASE_ID=y687796e3001241f7de17
NEXT_PUBLIC_APPWRITE_BUCKET_ID=687796f2002638a8a945
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=6877a2f3002047dcde9e
NEXT_PUBLIC_SERVICE_FEE_PERCENTAGE=10
```

## 🎯 Результат

После правильной настройки:
- ✅ Авторизация через Google работает
- ✅ Регистрация пользователей работает
- ✅ Все API запросы проходят успешно
- ✅ Нет ошибок 400

## 🆘 Если проблема остается

1. Проверьте правильность домена в Appwrite
2. Убедитесь, что домен точно совпадает с Vercel URL
3. Попробуйте добавить домен с `www.` и без
4. Очистите кеш браузера
5. Подождите 5-10 минут для применения изменений

---

**После настройки Appwrite ваш проект будет работать на Vercel!** 🚀
