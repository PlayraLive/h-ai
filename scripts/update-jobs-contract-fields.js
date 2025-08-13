const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Инициализация клиента
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function updateJobsCollection() {
  try {
    console.log("🔄 Updating jobs collection with contract fields...");

    // Добавляем новые атрибуты для контрактов
    const newAttributes = [
      { key: "freelancerId", type: "string", size: 255, required: false },
      { key: "freelancerName", type: "string", size: 255, required: false },
      { key: "selectedBudget", type: "double", required: false },
      { key: "selectedDuration", type: "string", size: 100, required: false },
      { key: "contractStartDate", type: "datetime", required: false },
    ];

    for (const attr of newAttributes) {
      try {
        if (attr.type === "double") {
          await databases.createFloatAttribute(
            DATABASE_ID,
            "jobs",
            attr.key,
            attr.required,
          );
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            "jobs",
            attr.key,
            attr.required,
          );
        } else {
          await databases.createStringAttribute(
            DATABASE_ID,
            "jobs",
            attr.key,
            attr.size,
            attr.required,
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

    console.log("🎉 Jobs collection updated successfully!");
  } catch (error) {
    console.error("❌ Error updating jobs collection:", error);
  }
}

// Запуск скрипта
updateJobsCollection();
