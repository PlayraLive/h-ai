# Google OAuth Setup для AI Freelance Platform

## 1. Настройка Google Cloud Console

### Шаг 1: Создание проекта
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API (если требуется)

### Шаг 2: Настройка OAuth 2.0
1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **Create Credentials** → **OAuth 2.0 Client IDs**
3. Выберите **Web application**
4. Добавьте **Authorized redirect URIs**:
   - `http://localhost:3000/en/auth/success` (для разработки)
   - `https://yourdomain.com/en/auth/success` (для продакшена)
   - `https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/687759fb003c8bd76b93` (Appwrite callback)

### Шаг 3: Получение учетных данных
1. Скопируйте **Client ID** и **Client Secret**
2. Сохраните их для настройки Appwrite

## 2. Настройка Appwrite Console

### Шаг 1: Открытие настроек Auth
1. Перейдите в [Appwrite Console](https://cloud.appwrite.io/)
2. Выберите ваш проект: `687759fb003c8bd76b93`
3. Перейдите в **Auth** → **Settings**

### Шаг 2: Настройка Google OAuth
1. Найдите секцию **OAuth2 Providers**
2. Включите **Google**
3. Введите:
   - **App ID**: ваш Google Client ID
   - **App Secret**: ваш Google Client Secret

### Шаг 3: Настройка Success/Failure URLs
1. В разделе **Security** найдите **OAuth2 Success URL**
2. Добавьте:
   - `http://localhost:3000/en/auth/success`
   - `https://yourdomain.com/en/auth/success`
3. В **OAuth2 Failure URL** добавьте:
   - `http://localhost:3000/en/auth/error`
   - `https://yourdomain.com/en/auth/error`

## 3. Настройка домена в Appwrite

### Добавление платформ
1. В Appwrite Console перейдите в **Settings** → **Platforms**
2. Добавьте **Web Platform**:
   - **Name**: `localhost`
   - **Hostname**: `localhost:3000`
3. Добавьте еще одну **Web Platform** для продакшена:
   - **Name**: `production`
   - **Hostname**: `yourdomain.com`

## 4. Тестирование

### Локальная разработка
1. Запустите приложение: `npm run dev`
2. Перейдите на `http://localhost:3000`
3. Нажмите **"Login with Google"** в навбаре
4. Или перейдите на `/en/login` и нажмите **"Continue with Google"**

### Ожидаемый поток
1. Клик на кнопку Google → перенаправление на Google
2. Авторизация в Google → перенаправление на Appwrite
3. Appwrite обрабатывает OAuth → перенаправление на `/en/auth/success`
4. Страница success получает пользователя → перенаправление на dashboard

## 5. Отладка

### Проверка в консоли браузера
- Откройте F12 → Console
- Ищите сообщения от `AuthService`, `OAuth`, `AuthCallback`

### Проверка в Appwrite Console
- Перейдите в **Auth** → **Users**
- Проверьте, создался ли пользователь после OAuth

### Типичные ошибки
1. **"redirect_uri_mismatch"** - неправильный redirect URI в Google Console
2. **"unauthorized_client"** - неправильный Client ID/Secret
3. **"access_denied"** - пользователь отменил авторизацию

## 6. Переменные окружения

Убедитесь, что в `.env.local` правильно настроены:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=687759fb003c8bd76b93
NEXT_PUBLIC_APPWRITE_DATABASE_ID=687796e3001241f7de17
```

## 7. Готовые URL для копирования

### Google Cloud Console Redirect URIs:
```
http://localhost:3000/en/auth/success
https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/687759fb003c8bd76b93
```

### Appwrite Success/Failure URLs:
```
Success: http://localhost:3000/en/auth/success
Failure: http://localhost:3000/en/auth/error
```
