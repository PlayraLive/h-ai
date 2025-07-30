const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Инициализация клиента
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function addMissingAttributes() {
  try {
    console.log("🚀 Adding missing attributes to applications collection...");

    // Добавляем атрибут attachments в коллекцию applications
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        "applications",
        "attachments",
        2000, // размер
        false, // не обязательное поле
        null // значение по умолчанию
      );
      console.log("✅ Added attachments attribute to applications collection");
    } catch (error) {
      if (error.code === 409) {
        console.log("ℹ️ Attachments attribute already exists in applications collection");
      } else {
        console.error("❌ Error adding attachments attribute:", error);
      }
    }

    // Добавляем атрибут clientResponse в коллекцию applications
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        "applications",
        "clientResponse",
        2000, // размер
        false, // не обязательное поле
        null // значение по умолчанию
      );
      console.log("✅ Added clientResponse attribute to applications collection");
    } catch (error) {
      if (error.code === 409) {
        console.log("ℹ️ ClientResponse attribute already exists in applications collection");
      } else {
        console.error("❌ Error adding clientResponse attribute:", error);
      }
    }

    console.log("🎉 Missing attributes check completed!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Запуск скрипта
addMissingAttributes(); 