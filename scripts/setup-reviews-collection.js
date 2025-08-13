const { Client, Databases, ID, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Инициализация клиента
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function setupReviewsCollection() {
  try {
    console.log("🚀 Setting up reviews collection...");

    // Проверяем, существует ли коллекция
    try {
      await databases.getCollection(DATABASE_ID, "reviews");
      console.log("ℹ️ Reviews collection already exists, updating attributes...");
    } catch (error) {
      if (error.code === 404) {
        // Создаем коллекцию reviews
        console.log("📁 Creating reviews collection...");
        const reviewsCollection = await databases.createCollection(
          DATABASE_ID,
          "reviews",
          "Reviews",
          [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ],
        );
        console.log("✅ Reviews collection created");
      } else {
        throw error;
      }
    }

    // Добавляем атрибуты для reviews
    const reviewAttributes = [
      { key: "jobId", type: "string", size: 255, required: true },
      { key: "projectId", type: "string", size: 255, required: true },
      { key: "reviewerId", type: "string", size: 255, required: true },
      { key: "revieweeId", type: "string", size: 255, required: true },
      { key: "reviewerType", type: "string", size: 50, required: true }, // 'client' or 'freelancer'
      { key: "rating", type: "integer", required: true, min: 1, max: 5 },
      { key: "title", type: "string", size: 255, required: true },
      { key: "comment", type: "string", size: 2000, required: true },
      { key: "tags", type: "string", size: 1000, required: false }, // JSON array of tags
      { key: "skillRatings", type: "string", size: 500, required: false }, // JSON object of skill ratings
      { key: "isPublic", type: "boolean", required: false, default: true },
      { key: "helpful", type: "integer", required: false, default: 0 },
      { key: "notHelpful", type: "integer", required: false, default: 0 },
      { key: "response", type: "string", size: 1000, required: false }, // JSON response from reviewee
      { key: "createdAt", type: "datetime", required: false },
    ];

    for (const attr of reviewAttributes) {
      try {
        if (attr.type === "integer") {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            "reviews",
            attr.key,
            attr.required,
            attr.min,
            attr.max,
            attr.default,
          );
        } else if (attr.type === "boolean") {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            "reviews",
            attr.key,
            attr.required,
            attr.default,
          );
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            "reviews",
            attr.key,
            attr.required,
          );
        } else {
          await databases.createStringAttribute(
            DATABASE_ID,
            "reviews",
            attr.key,
            attr.size,
            attr.required,
            attr.default,
          );
        }
        console.log(`✅ Added attribute: ${attr.key}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ Attribute ${attr.key} already exists`);
        } else {
          console.error(`❌ Error adding attribute ${attr.key}:`, error.message);
        }
      }
    }

    // Создаем индексы для быстрого поиска
    const indexes = [
      { key: "jobId_index", type: "key", attributes: ["jobId"] },
      { key: "reviewerId_index", type: "key", attributes: ["reviewerId"] },
      { key: "revieweeId_index", type: "key", attributes: ["revieweeId"] },
      { key: "rating_index", type: "key", attributes: ["rating"] },
      { key: "createdAt_index", type: "key", attributes: ["createdAt"], orders: ["DESC"] }
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          "reviews",
          index.key,
          index.type,
          index.attributes,
          index.orders,
        );
        console.log(`✅ Added index: ${index.key}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ Index ${index.key} already exists`);
        } else {
          console.error(`❌ Error adding index ${index.key}:`, error.message);
        }
      }
    }

    console.log("🎉 Reviews collection setup completed!");
  } catch (error) {
    console.error("❌ Error setting up reviews collection:", error);
  }
}

// Запуск скрипта
setupReviewsCollection();
