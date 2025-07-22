const { Client, Databases, ID } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Инициализация клиента Appwrite
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Тестовые данные для наполнения коллекции reels (упрощенная структура)
const sampleReels = [
  {
    title: "AI Website Builder Pro",
    description:
      "Создайте профессиональный веб-сайт с помощью искусственного интеллекта за считанные минуты. Наш ИИ анализирует ваши требования и создает уникальный дизайн, оптимизированный для конверсии.",
    videoUrl: "/videos/website-demo.mp4",
    thumbnailUrl: "/images/website-thumb.svg",
    category: "website",
    tags: JSON.stringify(["React", "Next.js", "AI", "Tailwind", "TypeScript"]),
    creatorId: "creator_001",
    creatorName: "Александр Иванов",
  },
  {
    title: "TikTok Video Creator Bot",
    description:
      "Автоматизированный бот для создания вирусного контента TikTok. Генерирует сценарии, подбирает музыку и создает видео с использованием ИИ.",
    videoUrl: "/videos/tiktok-demo.mp4",
    thumbnailUrl: "/images/tiktok-thumb.svg",
    category: "video",
    tags: JSON.stringify([
      "Python",
      "OpenAI",
      "FFmpeg",
      "TikTok API",
      "Computer Vision",
    ]),
    creatorId: "creator_002",
    creatorName: "Мария Петрова",
  },
  {
    title: "Smart Customer Support Bot",
    description:
      "Интеллектуальный чат-бот для автоматизации клиентской поддержки. Понимает естественную речь и решает 80% запросов пользователей без участия человека.",
    videoUrl: "/videos/chatbot-demo.mp4",
    thumbnailUrl: "/images/chatbot-thumb.svg",
    category: "bot",
    tags: JSON.stringify([
      "Node.js",
      "NLP",
      "Dialogflow",
      "Telegram",
      "WhatsApp",
    ]),
    creatorId: "creator_003",
    creatorName: "Дмитрий Смирнов",
  },
  {
    title: "AI Logo & Brand Identity",
    description:
      "Создание профессионального логотипа и фирменного стиля с помощью искусственного интеллекта. Получите варианты логотипов за минуты, не за дни.",
    videoUrl: "/videos/logo-demo.mp4",
    thumbnailUrl: "/images/logo-thumb.svg",
    category: "design",
    tags: JSON.stringify([
      "Adobe Illustrator",
      "Figma",
      "AI",
      "Branding",
      "Vector",
    ]),
    creatorId: "creator_004",
    creatorName: "Анна Козлова",
  },
  {
    title: "E-commerce Store Builder",
    description:
      "Полнофункциональный интернет-магазин с интеграцией платежных систем, управлением товарами и аналитикой продаж. Готов к запуску за один день.",
    videoUrl: "/videos/ecommerce-demo.mp4",
    thumbnailUrl: "/images/ecommerce-thumb.svg",
    category: "website",
    tags: JSON.stringify(["React", "Stripe", "PayPal", "Next.js", "MongoDB"]),
    creatorId: "creator_005",
    creatorName: "Сергей Волков",
  },
  {
    title: "Instagram Content Generator",
    description:
      "ИИ-генератор контента для Instagram: создает посты, сторис, рилс и подписи к ним. Адаптируется под ваш стиль и аудиторию.",
    videoUrl: "/videos/instagram-demo.mp4",
    thumbnailUrl: "/images/instagram-thumb.svg",
    category: "video",
    tags: JSON.stringify([
      "Python",
      "Instagram API",
      "DALL-E",
      "GPT-4",
      "Canva",
    ]),
    creatorId: "creator_006",
    creatorName: "Елена Морозова",
  },
  {
    title: "Voice AI Assistant",
    description:
      "Голосовой ИИ-ассистент для автоматизации звонков и голосового взаимодействия с клиентами. Понимает и отвечает как живой оператор.",
    videoUrl: "/videos/voice-demo.mp4",
    thumbnailUrl: "/images/voice-thumb.svg",
    category: "bot",
    tags: JSON.stringify([
      "Python",
      "Speech Recognition",
      "TTS",
      "Twilio",
      "OpenAI",
    ]),
    creatorId: "creator_007",
    creatorName: "Игорь Лебедев",
  },
  {
    title: "Mobile App UI/UX Design",
    description:
      "Современный дизайн мобильного приложения с учетом последних трендов UX/UI. Полный набор экранов и интерактивный прототип.",
    videoUrl: "/videos/mobile-demo.mp4",
    thumbnailUrl: "/images/mobile-thumb.svg",
    category: "design",
    tags: JSON.stringify([
      "Figma",
      "Adobe XD",
      "Prototyping",
      "iOS",
      "Android",
    ]),
    creatorId: "creator_008",
    creatorName: "Ольга Романова",
  },
];

async function populateReelsData() {
  try {
    console.log("🚀 Начинаем наполнение коллекции reels данными...");

    // Очищаем существующие тестовые данные (опционально)
    console.log("🧹 Проверяем существующие данные...");
    const existing = await databases.listDocuments(DATABASE_ID, "reels");
    console.log(
      `📊 Найдено существующих документов: ${existing.documents.length}`,
    );

    // Добавляем новые данные
    console.log("📝 Добавляем тестовые данные...");
    let successCount = 0;

    for (const reel of sampleReels) {
      try {
        await databases.createDocument(DATABASE_ID, "reels", ID.unique(), reel);
        successCount++;
        console.log(`✅ Добавлен рилс: "${reel.title}"`);
      } catch (error) {
        console.error(
          `❌ Ошибка при добавлении "${reel.title}":`,
          error.message,
        );
      }
    }

    console.log(
      `\n🎉 Успешно добавлено ${successCount} из ${sampleReels.length} рилсов!`,
    );

    // Проверяем результат
    const result = await databases.listDocuments(DATABASE_ID, "reels");
    console.log(`📈 Всего документов в коллекции: ${result.documents.length}`);

    if (result.documents.length > 0) {
      console.log("\n📋 Первые 3 добавленных рилса:");
      result.documents.slice(0, 3).forEach((doc, index) => {
        console.log(
          `${index + 1}. ${doc.title} (${doc.category}) - ${doc.views} просмотров`,
        );
      });
    }
  } catch (error) {
    console.error("❌ Критическая ошибка:", error);
  }
}

// Проверяем подключение и запускаем наполнение
async function main() {
  try {
    console.log("🔗 Проверяем подключение к Appwrite...");
    console.log(`📡 Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    console.log(`🗂️  Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
    console.log(`💾 Database: ${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}`);

    // Проверяем подключение
    await databases.get(DATABASE_ID);
    console.log("✅ Подключение к базе данных успешно!\n");

    await populateReelsData();
  } catch (error) {
    console.error("💥 Не удалось подключиться к базе данных:", error.message);
    console.log("\n🔧 Проверьте:");
    console.log("   1. Правильность переменных окружения в .env.local");
    console.log("   2. Наличие API ключа с правами на запись");
    console.log("   3. Существование базы данных и коллекции reels");
  }
}

// Запускаем скрипт
main();
