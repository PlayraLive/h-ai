const { Client, Databases, ID, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Инициализация клиента
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function setupProjectsCollection() {
  try {
    console.log("🚀 Setting up projects collection...");

    // Проверяем, существует ли коллекция
    try {
      await databases.getCollection(DATABASE_ID, "projects");
      console.log("ℹ️ Projects collection already exists, updating attributes...");
    } catch (error) {
      if (error.code === 404) {
        // Создаем коллекцию projects
        console.log("📁 Creating projects collection...");
        const projectsCollection = await databases.createCollection(
          DATABASE_ID,
          "projects",
          "Projects",
          [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ],
        );
        console.log("✅ Projects collection created");
      } else {
        throw error;
      }
    }

    // Добавляем атрибуты для projects (portfolio items)
    const projectAttributes = [
      { key: "freelancerId", type: "string", size: 255, required: true },
      { key: "clientId", type: "string", size: 255, required: true },
      { key: "jobId", type: "string", size: 255, required: true },
      { key: "title", type: "string", size: 255, required: true },
      { key: "description", type: "string", size: 2000, required: true },
      { key: "category", type: "string", size: 100, required: true },
      { key: "skills", type: "string", size: 1000, required: false }, // JSON array
      { key: "tags", type: "string", size: 1000, required: false }, // JSON array
      { key: "budget", type: "double", required: true },
      { key: "rating", type: "integer", required: true, min: 1, max: 5 },
      { key: "clientComment", type: "string", size: 1000, required: false },
      { key: "clientName", type: "string", size: 255, required: false },
      { key: "completedAt", type: "datetime", required: true },
      { key: "status", type: "string", size: 50, required: false, default: "completed" },
      { key: "image", type: "string", size: 500, required: false }, // Project image URL
      { key: "attachments", type: "string", size: 2000, required: false }, // JSON array of file URLs
      { key: "views", type: "integer", required: false, default: 0 },
      { key: "likes", type: "integer", required: false, default: 0 },
      { key: "featured", type: "boolean", required: false, default: false },
      { key: "isPublic", type: "boolean", required: false, default: true },
    ];

    for (const attr of projectAttributes) {
      try {
        if (attr.type === "integer") {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            "projects",
            attr.key,
            attr.required,
            attr.min,
            attr.max,
            attr.default,
          );
        } else if (attr.type === "boolean") {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            "projects",
            attr.key,
            attr.required,
            attr.default,
          );
        } else if (attr.type === "double") {
          await databases.createFloatAttribute(
            DATABASE_ID,
            "projects",
            attr.key,
            attr.required,
          );
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            "projects",
            attr.key,
            attr.required,
          );
        } else {
          await databases.createStringAttribute(
            DATABASE_ID,
            "projects",
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
      { key: "freelancerId_index", type: "key", attributes: ["freelancerId"] },
      { key: "clientId_index", type: "key", attributes: ["clientId"] },
      { key: "jobId_index", type: "key", attributes: ["jobId"] },
      { key: "category_index", type: "key", attributes: ["category"] },
      { key: "rating_index", type: "key", attributes: ["rating"] },
      { key: "completedAt_index", type: "key", attributes: ["completedAt"], orders: ["DESC"] },
      { key: "status_index", type: "key", attributes: ["status"] },
      { key: "featured_index", type: "key", attributes: ["featured"] },
      { key: "isPublic_index", type: "key", attributes: ["isPublic"] }
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          "projects",
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

    console.log("🎉 Projects collection setup completed!");
  } catch (error) {
    console.error("❌ Error setting up projects collection:", error);
  }
}

// Запуск скрипта
setupProjectsCollection();
