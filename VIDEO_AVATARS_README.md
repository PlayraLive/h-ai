# 🎬 Видео Аватарки Фрилансеров - Руководство по интеграции

## 🎯 Что реализовано

Система стильных видео аватарок высокого разрешения для фрилансеров и AI специалистов, которые заполняют всю площадь карточек.

### ✅ Готовые компоненты:

1. **API для генерации видео аватарок** (`/api/generate-video-avatar`)
2. **Компонент FullScreenVideoAvatar** - полноэкранные видео аватарки
3. **Компонент VideoAvatar** - обычные круглые видео аватарки  
4. **Обновленные карточки AI специалистов** с полноэкранным видео
5. **Обновленные карточки фрилансеров** с видео фоном
6. **Система генерации аватарок** через скрипт

## 🎨 Особенности реализации

### 🎬 Полноэкранные видео аватарки
- **Автовоспроизведение** при наведении мыши
- **Fallback градиенты** с анимацией при ошибках загрузки
- **Высокое качество** 1080p с поддержкой 4K
- **Адаптивный дизайн** для всех размеров экранов
- **Оптимизация производительности** с preload="metadata"

### 🎭 Персонализированные стили
- **Алекс AI**: Фиолетово-розовые градиенты, футуристический стиль
- **Viktor Reels**: Оранжево-красные тона, креативная студия  
- **Max Powerful**: Сине-голубые цвета, высокотехнологичная среда

### 🎪 Интерактивные элементы
- **Плавные переходы** между состояниями
- **Элементы наложения** с полупрозрачностью
- **Анимированные частицы** в fallback режиме
- **Hover эффекты** для лучшего UX

## 🔧 Интеграция с реальными AI видео API

### 🚀 Runway ML Integration

```typescript
// В файле src/app/api/generate-video-avatar/route.ts
// Замените функцию generateMockVideoAvatar на:

async function generateRunwayVideo(prompt: string, duration: number) {
  const response = await fetch('https://api.runwayml.com/v1/video/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      duration,
      aspect_ratio: '1:1', // Квадратное видео для аватарок
      motion_preset: 'smooth',
      quality: 'high'
    })
  });

  const data = await response.json();
  return data.video_url;
}
```

### 🎥 Stable Video Diffusion

```typescript
async function generateStableVideo(imagePrompt: string) {
  // 1. Сначала генерируем изображение
  const imageResponse = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [{ text: imagePrompt }],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      steps: 30,
    })
  });

  const imageData = await imageResponse.json();
  const baseImage = imageData.artifacts[0].base64;

  // 2. Затем создаем видео из изображения
  const videoResponse = await fetch('https://api.stability.ai/v2alpha/generation/image-to-video', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
    },
    body: JSON.stringify({
      image: baseImage,
      seed: 42,
      cfg_scale: 1.8,
      motion_bucket_id: 127
    })
  });

  return await videoResponse.json();
}
```

### 🎪 Pika Labs Integration

```typescript
async function generatePikaVideo(prompt: string) {
  const response = await fetch('https://api.pika.art/v1/videos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PIKA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: '1:1',
      duration: 5,
      style: 'realistic',
      motion: 'medium'
    })
  });

  return await response.json();
}
```

## 🎯 Промпты для генерации

### 🎨 Алекс AI - Дизайнер
```
"Professional AI designer working in a futuristic office environment. 
Holographic interfaces floating around, purple and pink neon lighting. 
Modern tech atmosphere, high-tech style. 4K quality, professional lighting, 
cinematic style. Person focused on creative work with digital tools."
```

### 🎬 Viktor Reels - Видеограф  
```
"Creative videographer and director in a modern studio setting. 
Professional cameras, studio lighting, dynamic movements. 
Orange and red accent lighting, creative atmosphere. 
4K quality, dynamic lighting, energetic style. Person operating video equipment."
```

### 💻 Max Powerful - AI Инженер
```
"Powerful AI engineer with multiple screens and high-tech equipment. 
Code displays, matrix effects, blue and cyan neon lighting. 
High-tech environment, futuristic interface. 
4K quality, tech style, professional setup. Person coding with advanced AI tools."
```

## 📁 Структура файлов

```
src/
├── components/
│   ├── VideoAvatar.tsx              # Круглые видео аватарки
│   ├── FullScreenVideoAvatar.tsx    # Полноэкранные видео аватарки
│   ├── AISpecialistsGrid.tsx        # Обновленные карточки AI специалистов
│   └── home/
│       └── FeaturedFreelancersSection.tsx
├── app/
│   ├── api/
│   │   └── generate-video-avatar/
│   │       └── route.ts             # API для генерации видео
│   └── [locale]/
│       ├── messages/page.tsx        # Обновленная страница сообщений
│       └── freelancers/page.tsx     # Обновленная страница фрилансеров
public/
├── videos/
│   └── avatars/
│       ├── alex-ai-professional.mp4
│       ├── viktor-reels-creative.mp4
│       ├── max-powerful-tech.mp4
│       └── manifest.json            # Манифест всех аватарок
└── images/
    └── avatars/                     # Миниатюры для видео
scripts/
└── generate-avatar-videos.js        # Скрипт для генерации аватарок
```

## 🔑 Переменные окружения

Добавьте в `.env.local`:

```env
# AI Video Generation APIs
RUNWAY_API_KEY=your_runway_api_key
STABILITY_API_KEY=your_stability_api_key  
PIKA_API_KEY=your_pika_api_key
LEONARDO_API_KEY=your_leonardo_api_key

# Optional: Video processing
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 🎪 Использование компонентов

### FullScreenVideoAvatar - для карточек
```tsx
<FullScreenVideoAvatar
  specialistId="alex-ai"
  specialistName="Алекс AI"
  specialistType="ai_specialist"
  className="w-full h-full"
  autoPlay={true}
  isHovered={isHovered}
  showControls={false}
/>
```

### VideoAvatar - для аватарок в чатах
```tsx
<VideoAvatar
  specialistId="viktor-reels"
  specialistName="Viktor Reels"
  specialistType="ai_specialist"
  size="lg"
  autoPlay={true}
  showControls={false}
/>
```

## 🎯 Запуск генерации

```bash
# Генерация аватарок всех специалистов
node scripts/generate-avatar-videos.js

# Запуск API для тестирования
npm run dev

# Тест API генерации
curl -X POST http://localhost:3000/api/generate-video-avatar \
  -H "Content-Type: application/json" \
  -d '{"specialistId":"alex-ai","specialistName":"Алекс AI","specialistType":"ai_specialist"}'
```

## 🎨 Кастомизация стилей

### Добавление нового специалиста
```typescript
// В FullScreenVideoAvatar.tsx
const specialistGradients = {
  'alex-ai': 'from-purple-600 via-purple-500 to-pink-500',
  'viktor-reels': 'from-orange-600 via-orange-500 to-red-500', 
  'max-powerful': 'from-indigo-600 via-indigo-500 to-cyan-500',
  'new-specialist': 'from-emerald-600 via-emerald-500 to-teal-500', // Новый
  default: 'from-gray-600 via-gray-500 to-gray-700'
};
```

### Изменение анимации
```css
/* В компоненте FullScreenVideoAvatar */
.particles {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
```

## 🚀 Производительность

- **Lazy loading** видео с preload="metadata"
- **Fallback изображения** для быстрой загрузки
- **Адаптивное качество** в зависимости от размера экрана
- **Кэширование** сгенерированных видео
- **Оптимизация** для мобильных устройств

## 🎪 Будущие улучшения

1. **Real-time генерация** через WebRTC
2. **Интерактивные аватарки** с распознаванием речи
3. **3D эффекты** с Three.js
4. **Персонализация** на основе поведения пользователя
5. **A/B тестирование** разных стилей аватарок

---

🎬 **Результат**: Уникальные стильные видео аватарки высокого разрешения, которые заполняют всю площадь карточек фрилансеров и создают незабываемый пользовательский опыт!