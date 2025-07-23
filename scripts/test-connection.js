const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Database and Collection IDs
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTIONS = {
  USERS: "users",
  PROJECTS: "projects",
  APPLICATIONS: "applications",
  REVIEWS: "reviews",
  MESSAGES: "messages",
  NOTIFICATIONS: "notifications",
  PORTFOLIO: "portfolio",
  SKILLS: "skills",
  CATEGORIES: "categories",
  REELS: "reels",
  REEL_INTERACTIONS: "reel_interactions",
  CONVERSATIONS: "conversations",
};

async function testConnection() {
  console.log("🔍 Testing Appwrite Connection...\n");

  // Check environment variables
  console.log("📋 Checking Environment Variables:");
  console.log("==================================");

  const requiredEnvVars = [
    "NEXT_PUBLIC_APPWRITE_ENDPOINT",
    "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
    "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
    "APPWRITE_API_KEY",
  ];

  let envComplete = true;
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: ${envVar.includes("KEY") ? "***" : value}`);
    } else {
      console.log(`❌ ${envVar}: MISSING`);
      envComplete = false;
    }
  }

  if (!envComplete) {
    console.log(
      "\n❌ Missing required environment variables. Please check your .env.local file.",
    );
    process.exit(1);
  }

  try {
    // Test database connection
    console.log("\n📡 Testing Database Connection:");
    console.log("===============================");

    const database = await databases.get(DATABASE_ID);
    console.log(`✅ Connected to database: ${database.name}`);
    console.log(`📊 Database ID: ${database.$id}`);
    console.log(
      `📅 Created: ${new Date(database.$createdAt).toLocaleString()}`,
    );

    // Test collections
    console.log("\n📋 Checking Collections:");
    console.log("========================");

    const collectionNames = Object.keys(COLLECTIONS);
    let existingCollections = 0;
    const collectionStatus = [];

    for (const collectionName of collectionNames) {
      try {
        const collectionId = COLLECTIONS[collectionName];
        const collection = await databases.getCollection(
          DATABASE_ID,
          collectionId,
        );
        console.log(
          `✅ ${collectionName}: ${collection.name} (${collection.total} documents)`,
        );
        existingCollections++;
        collectionStatus.push({
          name: collectionName,
          id: collectionId,
          exists: true,
          documents: collection.total,
        });
      } catch (error) {
        console.log(`❌ ${collectionName}: NOT FOUND`);
        collectionStatus.push({
          name: collectionName,
          id: COLLECTIONS[collectionName],
          exists: false,
          documents: 0,
        });
      }
    }

    // Summary
    console.log("\n📊 Summary:");
    console.log("===========");
    console.log(
      `Collections: ${existingCollections}/${collectionNames.length} exist`,
    );

    const totalDocuments = collectionStatus
      .filter((c) => c.exists)
      .reduce((sum, c) => sum + c.documents, 0);

    console.log(`Total Documents: ${totalDocuments}`);

    if (existingCollections === collectionNames.length) {
      console.log("\n🎉 All collections are ready!");
      if (totalDocuments > 0) {
        console.log("✅ Database contains data - ready to use!");
      } else {
        console.log(
          "⚠️ Database is empty - run seeding scripts to populate data.",
        );
      }
    } else {
      console.log("\n⚠️ Some collections are missing.");
      console.log("Run: npm run setup:database");
    }

    // Test a simple query if users collection exists
    const usersCollection = collectionStatus.find((c) => c.name === "USERS");
    if (
      usersCollection &&
      usersCollection.exists &&
      usersCollection.documents > 0
    ) {
      console.log("\n🧪 Testing Query Functionality:");
      console.log("===============================");

      try {
        const users = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USERS,
          [],
          3,
        );
        console.log(
          `✅ Successfully queried users: ${users.documents.length} found`,
        );

        if (users.documents.length > 0) {
          const user = users.documents[0];
          console.log(
            `📱 Sample user: ${user.name || "Unknown"} (${user.userType || "Unknown type"})`,
          );
        }
      } catch (queryError) {
        console.log(`❌ Query test failed: ${queryError.message}`);
      }
    }

    console.log("\n✅ Connection test completed successfully!");
  } catch (error) {
    console.error("\n❌ Connection test failed:", error.message);

    if (error.code === 401) {
      console.log("🔑 Authentication failed. Check your APPWRITE_API_KEY.");
    } else if (error.code === 404) {
      console.log(
        "🗄️ Database not found. Check your NEXT_PUBLIC_APPWRITE_DATABASE_ID.",
      );
    } else if (error.message.includes("ENOTFOUND")) {
      console.log(
        "🌐 Network error. Check your NEXT_PUBLIC_APPWRITE_ENDPOINT.",
      );
    }

    process.exit(1);
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "test":
    case undefined:
      await testConnection();
      break;

    default:
      console.log("Appwrite Connection Test");
      console.log("=======================");
      console.log("");
      console.log("Usage:");
      console.log("  node scripts/test-connection.js [test]");
      console.log("");
      console.log("Environment Variables Required:");
      console.log("  NEXT_PUBLIC_APPWRITE_ENDPOINT");
      console.log("  NEXT_PUBLIC_APPWRITE_PROJECT_ID");
      console.log("  NEXT_PUBLIC_APPWRITE_DATABASE_ID");
      console.log("  APPWRITE_API_KEY");
      break;
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
}

module.exports = { testConnection };
