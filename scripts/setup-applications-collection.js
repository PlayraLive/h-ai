const { Client, Databases, ID, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Инициализация клиента
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function setupApplicationsCollection() {
  try {
    console.log("🚀 Setting up applications collection...");

    // Создаем коллекцию applications
    console.log("📁 Creating applications collection...");
    const applicationsCollection = await databases.createCollection(
      DATABASE_ID,
      "applications",
      "Applications",
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
    );

    // Добавляем атрибуты для applications
    const applicationAttributes = [
      { key: "jobId", type: "string", size: 255, required: true },
      { key: "freelancerId", type: "string", size: 255, required: true },
      { key: "freelancerName", type: "string", size: 255, required: true },
      { key: "freelancerAvatar", type: "string", size: 500, required: false },
      { key: "freelancerRating", type: "double", required: false },
      { key: "coverLetter", type: "string", size: 5000, required: true },
      { key: "proposedBudget", type: "double", required: true },
      { key: "proposedDuration", type: "string", size: 100, required: true },
      {
        key: "status",
        type: "string",
        size: 50,
        required: false,
        default: "pending",
      },
      { key: "clientResponse", type: "string", size: 2000, required: false },
      { key: "attachments", type: "string", size: 2000, required: false },
    ];

    for (const attr of applicationAttributes) {
      if (attr.type === "double") {
        await databases.createFloatAttribute(
          DATABASE_ID,
          "applications",
          attr.key,
          attr.required,
        );
      } else {
        await databases.createStringAttribute(
          DATABASE_ID,
          "applications",
          attr.key,
          attr.size,
          attr.required,
          attr.default,
        );
      }
      console.log(`✅ Added attribute: ${attr.key}`);
    }

    console.log("🎉 Applications collection created successfully!");
  } catch (error) {
    if (error.code === 409) {
      console.log("ℹ️ Applications collection already exists");
    } else {
      console.error("❌ Error setting up applications collection:", error);
    }
  }
}

// Запуск скрипта
setupApplicationsCollection();
