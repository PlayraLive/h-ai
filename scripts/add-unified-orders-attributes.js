const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Initialize client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function addMissingAttributes() {
  try {
    console.log("🚀 Adding missing attributes to unified_orders collection...");

    // Check collection info
    try {
      const collection = await databases.getCollection(DATABASE_ID, "unified_orders");
      console.log("📋 Current attributes:", collection.attributes.map(attr => attr.key));
    } catch (error) {
      console.log("❌ Error getting collection info:", error.message);
    }

    // Add missing attributes one by one
    const attributesToAdd = [
      // Basic attributes
      { key: "orderId", type: "string", size: 50, required: true },
      { key: "type", type: "enum", elements: ["ai_order", "job", "project", "solution"], required: true },
      { key: "title", type: "string", size: 255, required: true },
      { key: "description", type: "string", size: 2000, required: false },
      { key: "status", type: "enum", elements: ["pending", "in_progress", "review", "revision", "completed", "cancelled", "paused"], required: true },
      { key: "totalAmount", type: "float", required: true },
      { key: "currency", type: "string", size: 10, required: false, default: "USD" },
      { key: "progress", type: "integer", required: false, default: 0 },
      
      // Participants
      { key: "clientId", type: "string", size: 50, required: true },
      { key: "clientName", type: "string", size: 255, required: true },
      { key: "clientAvatar", type: "string", size: 500, required: false },
      { key: "workerId", type: "string", size: 50, required: false },
      { key: "workerName", type: "string", size: 255, required: false },
      { key: "workerAvatar", type: "string", size: 500, required: false },
      { key: "workerType", type: "enum", elements: ["ai_specialist", "freelancer"], required: true },
      
      // Timeline
      { key: "createdAt", type: "string", size: 50, required: true },
      { key: "updatedAt", type: "string", size: 50, required: true },
      { key: "startedAt", type: "string", size: 50, required: false },
      { key: "deadline", type: "string", size: 50, required: false },
      { key: "completedAt", type: "string", size: 50, required: false },
      
      // Project Details
      { key: "category", type: "string", size: 100, required: true },
      { key: "skills", type: "string", size: 2000, required: false, default: "[]" },
      { key: "priority", type: "enum", elements: ["low", "medium", "high", "urgent"], required: false },
      { key: "requirements", type: "string", size: 2000, required: false, default: "[]" },
      { key: "deliverables", type: "string", size: 2000, required: false, default: "[]" },
      
      // Progress Tracking (JSON fields)
      { key: "milestones", type: "string", size: 10000, required: false, default: "[]" },
      { key: "payments", type: "string", size: 5000, required: false, default: "[]" },
      { key: "timeline", type: "string", size: 10000, required: false, default: "[]" },
      
      // Communication
      { key: "conversationId", type: "string", size: 50, required: true },
      { key: "lastActivity", type: "string", size: 50, required: true },
      
      // Metadata
      { key: "metadata", type: "string", size: 5000, required: false, default: "{}" }
    ];

    for (const attr of attributesToAdd) {
      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(
            DATABASE_ID, 
            "unified_orders", 
            attr.key, 
            attr.size, 
            attr.required,
            attr.default
          );
        } else if (attr.type === "enum") {
          await databases.createEnumAttribute(
            DATABASE_ID, 
            "unified_orders", 
            attr.key, 
            attr.elements, 
            attr.required
          );
        } else if (attr.type === "float") {
          await databases.createFloatAttribute(
            DATABASE_ID, 
            "unified_orders", 
            attr.key, 
            attr.required
          );
        } else if (attr.type === "integer") {
          await databases.createIntegerAttribute(
            DATABASE_ID, 
            "unified_orders", 
            attr.key, 
            attr.required,
            null, // min
            null, // max
            attr.default
          );
        }
        
        console.log(`✅ Added attribute: ${attr.key}`);
        
        // Wait a bit between attribute creations to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        if (error.code === 409) {
          console.log(`📝 Attribute ${attr.key} already exists`);
        } else {
          console.log(`❌ Error adding attribute ${attr.key}:`, error.message);
        }
      }
    }

    console.log("🎉 Finished adding missing attributes!");

    // Create indexes
    const indexes = [
      { key: "orderId_index", attributes: ["orderId"] },
      { key: "client_index", attributes: ["clientId"] },
      { key: "worker_index", attributes: ["workerId"] },
      { key: "status_index", attributes: ["status"] },
      { key: "type_index", attributes: ["type"] },
      { key: "updated_index", attributes: ["updatedAt"] },
      { key: "conversation_index", attributes: ["conversationId"] }
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(DATABASE_ID, "unified_orders", index.key, "key", index.attributes);
        console.log(`✅ Created index: ${index.key}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`📝 Index ${index.key} already exists`);
        } else {
          console.log(`❌ Error creating index ${index.key}:`, error.message);
        }
      }
    }

  } catch (error) {
    console.error("❌ Error adding missing attributes:", error);
    process.exit(1);
  }
}

addMissingAttributes();