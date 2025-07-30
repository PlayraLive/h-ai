const { Client, Databases, Account } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Инициализация клиента
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function testApplicationCreation() {
  try {
    console.log("🚀 Testing application creation...");

    // Получаем коллекцию applications
    try {
      const collection = await databases.getCollection(DATABASE_ID, "applications");
      console.log("✅ Applications collection exists");
      console.log("📋 Collection permissions:", collection.$permissions);
      console.log("📄 Collection attributes:", collection.attributes.map(attr => attr.key));
    } catch (error) {
      console.error("❌ Error getting applications collection:", error);
      return;
    }

    // Пытаемся создать тестовую заявку
    try {
      const testApplication = {
        jobId: "test-job-id",
        freelancerId: "test-freelancer-id", 
        freelancerName: "Test Freelancer",
        freelancerAvatar: "",
        freelancerRating: 4.5,
        coverLetter: "This is a test cover letter with more than 50 characters to meet the validation requirements.",
        proposedBudget: 1000,
        proposedDuration: "1-2-weeks",
        status: "pending",
        clientResponse: "",
        attachments: JSON.stringify([])
      };

      const result = await databases.createDocument(
        DATABASE_ID,
        "applications",
        "test-application-" + Date.now(),
        testApplication
      );

      console.log("✅ Test application created successfully:", result.$id);

      // Удаляем тестовую заявку
      await databases.deleteDocument(DATABASE_ID, "applications", result.$id);
      console.log("🗑️ Test application deleted");

    } catch (error) {
      console.error("❌ Error creating test application:", error);
      console.error("Error details:", {
        code: error.code,
        type: error.type,
        message: error.message
      });
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Запуск скрипта
testApplicationCreation(); 