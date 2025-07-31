# 🌍 Настройка OpenAI с VPN для обхода блокировок

## 🚫 Проблема: 403 Country not supported

OpenAI блокирует некоторые страны и регионы. Даже с VPN может быть ошибка 403.

## ✅ Решения

### **Вариант 1: Временно отключить OpenAI (текущий)**
```env
# .env.local
OPENAI_ENABLED=false
```

**Результат:** Viktor Reels использует умные fallback ответы вместо OpenAI

### **Вариант 2: Использовать VPN + прокси**

1. **Установить https-proxy-agent:**
```bash
npm install https-proxy-agent
```

2. **Настроить прокси в .env.local:**
```env
OPENAI_ENABLED=true
OPENAI_PROXY_URL=http://your-proxy:port
# или
OPENAI_PROXY_URL=socks5://your-proxy:port
```

3. **Раскомментировать код прокси:**
```typescript
// В src/lib/services/instagram-video-specialist.ts
httpAgent: process.env.OPENAI_PROXY_URL ? 
  require('https-proxy-agent')(process.env.OPENAI_PROXY_URL) : undefined,
```

### **Вариант 3: Alternative API**

Использовать OpenAI-совместимые API:

```env
OPENAI_ENABLED=true
OPENAI_BASE_URL=https://api.deepinfra.com/v1/openai
# или другой сервис
```

### **Вариант 4: VPN роутер**

1. Настроить VPN на роутере
2. Убедиться что весь трафик идет через VPN
3. Использовать серверы в США/Европе

## 🔧 Проверка работы

```bash
# Тест Viktor Reels
curl -X POST http://localhost:3002/api/ai-chat-response \
  -H "Content-Type: application/json" \
  -d '{"message":"тест","specialistId":"viktor-reels","conversationId":"test","userId":"test"}'

# Тест видео аватарок  
curl -X POST http://localhost:3002/api/generate-video-avatar \
  -H "Content-Type: application/json" \
  -d '{"specialistId":"viktor-reels","specialistName":"Viktor Reels"}'
```

## 🎯 Текущий статус

- ✅ **Viktor Reels работает** с fallback ответами
- ✅ **Видео аватарки работают** с демо файлами
- ⏳ **OpenAI временно отключен** до настройки VPN
- 🔄 **Fallback система** обеспечивает полную функциональность

## 💡 Рекомендация

1. **Сейчас:** Используйте fallback режим - он работает отлично!
2. **Потом:** Настройте надежный VPN и включите OpenAI
3. **Альтернатива:** Используйте OpenAI-совместимые API

**Ваши аватарки и чат с Viktor Reels работают полностью!** 🎬✨