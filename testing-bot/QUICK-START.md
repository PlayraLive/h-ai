# 🚀 Быстрый старт H-AI Testing Bot

## ⚡ Установка за 2 минуты

### 1. Перейти в директорию бота
```bash
cd testing-bot
```

### 2. Запустить автоматическую установку
```bash
npm run setup
```

Это выполнит:
- ✅ Установку всех зависимостей
- ✅ Установку браузеров Playwright
- ✅ Интерактивную настройку конфигурации
- ✅ Создание необходимых директорий
- ✅ Тестовый запуск

### 3. Запустить бота
```bash
npm start
```

---

## 🎯 Основные команды

### 🔍 Быстрая диагностика логина/регистрации
```bash
npm run test:auth
```

### 🧪 Полное тестирование платформы
```bash
npm run test:full
```

### 👀 Мониторинг в реальном времени
```bash
npm run monitor
```

### 📊 Генерация отчета
```bash
npm run report
```

---

## ⚙️ Ручная настройка (если нужно)

### 1. Установить зависимости
```bash
npm install
```

### 2. Установить браузеры
```bash
npx playwright install
```

### 3. Создать файл конфигурации
```bash
cp .env.example .env
```

### 4. Отредактировать .env
```env
TEST_BASE_URL=http://localhost:3001
TEST_USER_EMAIL=admin@h-ai.com
TEST_USER_PASSWORD=AdminH-AI2024!
HEADLESS=true
SCREENSHOTS=true
```

---

## 🚨 Решение проблем

### Проблема: "Браузер не запускается"
```bash
npx playwright install
```

### Проблема: "Платформа недоступна"
Убедитесь что H-AI Platform запущена:
```bash
cd ../
npm run dev
```

### Проблема: "Тесты падают с таймаутом"
Увеличьте таймауты в .env:
```env
TIMEOUT_PAGE_LOAD=60000
```

---

## 📞 Помощь

- 📚 **Полная документация**: README.md
- 🐛 **Баги и предложения**: GitHub Issues
- 📧 **Email**: sacralprojects8@gmail.com

---

**🎉 Готово! Теперь у вас есть супер-крутой AI-тестировщик для H-AI Platform!** 🤖✨
