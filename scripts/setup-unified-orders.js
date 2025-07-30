const { Client, Databases, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Инициализация клиента
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function setupUnifiedOrdersCollections() {
  try {
    console.log("🚀 Setting up unified orders collections...");

    // Create Unified Orders Collection
    console.log("📁 Creating unified_orders collection...");
    
    try {
      const ordersCollection = await databases.createCollection(
        DATABASE_ID,
        "unified_orders",
        "Unified Orders",
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log("✅ Unified orders collection created");

      // Add attributes to unified_orders
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "orderId", 50, true);
      
      await databases.createEnumAttribute(
        DATABASE_ID, "unified_orders", "type",
        ["ai_order", "job", "project", "solution"], true
      );
      
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "title", 255, true);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "description", 2000, false);
      
      await databases.createEnumAttribute(
        DATABASE_ID, "unified_orders", "status",
        ["pending", "in_progress", "review", "revision", "completed", "cancelled", "paused"], 
        true
      );
      
      await databases.createFloatAttribute(DATABASE_ID, "unified_orders", "totalAmount", true);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "currency", 10, false, "USD");
      await databases.createIntegerAttribute(DATABASE_ID, "unified_orders", "progress", false, 0);
      
      // Participants
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "clientId", 50, true);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "clientName", 255, true);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "clientAvatar", 500, false);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "workerId", 50, false);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "workerName", 255, false);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "workerAvatar", 500, false);
      
      await databases.createEnumAttribute(
        DATABASE_ID, "unified_orders", "workerType",
        ["ai_specialist", "freelancer"], true
      );
      
      // Timeline
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "createdAt", 50, true);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "updatedAt", 50, true);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "startedAt", 50, false);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "deadline", 50, false);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "completedAt", 50, false);
      
      // Project Details
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "category", 100, true);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "skills", 2000, false, "[]");
      
      await databases.createEnumAttribute(
        DATABASE_ID, "unified_orders", "priority",
        ["low", "medium", "high", "urgent"], false
      );
      
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "requirements", 2000, false, "[]");
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "deliverables", 2000, false, "[]");
      
      // Progress Tracking (JSON fields)
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "milestones", 10000, false, "[]");
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "payments", 5000, false, "[]");
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "timeline", 10000, false, "[]");
      
      // Communication
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "conversationId", 50, true);
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "lastActivity", 50, true);
      
      // Metadata
      await databases.createStringAttribute(DATABASE_ID, "unified_orders", "metadata", 5000, false, "{}");

      console.log("✅ Unified orders attributes added");

      // Create indexes for unified_orders
      await databases.createIndex(DATABASE_ID, "unified_orders", "orderId_index", "key", ["orderId"]);
      await databases.createIndex(DATABASE_ID, "unified_orders", "client_index", "key", ["clientId"]);
      await databases.createIndex(DATABASE_ID, "unified_orders", "worker_index", "key", ["workerId"]);
      await databases.createIndex(DATABASE_ID, "unified_orders", "status_index", "key", ["status"]);
      await databases.createIndex(DATABASE_ID, "unified_orders", "type_index", "key", ["type"]);
      await databases.createIndex(DATABASE_ID, "unified_orders", "updated_index", "key", ["updatedAt"]);
      await databases.createIndex(DATABASE_ID, "unified_orders", "conversation_index", "key", ["conversationId"]);

      console.log("✅ Unified orders indexes created");

    } catch (error) {
      if (error.code === 409) {
        console.log("📝 Unified orders collection already exists");
      } else {
        throw error;
      }
    }

    console.log("🎉 Unified orders collections setup completed successfully!");
    
    // Create demo unified order
    console.log("📊 Creating demo unified order...");
    
    try {
      const demoOrder = await databases.createDocument(
        DATABASE_ID,
        "unified_orders",
        "demo-order-1",
        {
          orderId: "AI-2025-001",
          type: "ai_order",
          title: "🎨 AI Дизайн логотипа для стартапа",
          description: "Создание современного логотипа для IT стартапа с использованием нейросетей и современных дизайн-принципов.",
          status: "in_progress",
          totalAmount: 15000,
          currency: "RUB",
          progress: 65,
          
          clientId: "demo-user",
          clientName: "Александр К.",
          clientAvatar: "/images/default-avatar.jpg",
          workerId: "alex-ai",
          workerName: "Алекс AI",
          workerAvatar: "/images/specialists/alex-ai.jpg",
          workerType: "ai_specialist",
          
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          
          category: "design",
          skills: JSON.stringify(["AI Design", "Branding", "Logo", "Figma"]),
          priority: "high",
          
          milestones: JSON.stringify([
            {
              id: "milestone-1",
              title: "Initial Concepts",
              description: "Create 3-5 initial logo concepts",
              status: "completed",
              percentage: 40,
              amount: 6000,
              completedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              deliverables: [
                {
                  id: "deliverable-1",
                  name: "Logo Concepts v1.pdf",
                  url: "/demo/logo-concepts.pdf",
                  type: "file",
                  uploadedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                  uploadedBy: "alex-ai"
                }
              ]
            },
            {
              id: "milestone-2", 
              title: "Refinement & Variations",
              description: "Refine selected concept and create variations",
              status: "in_progress",
              percentage: 35,
              amount: 5250,
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "milestone-3",
              title: "Final Delivery",
              description: "Final logo files in all formats",
              status: "pending", 
              percentage: 25,
              amount: 3750,
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]),
          
          payments: JSON.stringify([
            {
              id: "payment-1",
              milestoneId: "milestone-1",
              amount: 6000,
              currency: "RUB",
              status: "completed",
              description: "Payment for initial concepts",
              processedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              releasedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            },
            {
              id: "payment-2",
              milestoneId: "milestone-2",
              amount: 5250,
              currency: "RUB", 
              status: "pending",
              description: "Payment for refinement phase"
            },
            {
              id: "payment-3",
              milestoneId: "milestone-3",
              amount: 3750,
              currency: "RUB",
              status: "pending",
              description: "Final delivery payment"
            }
          ]),
          
          timeline: JSON.stringify([
            {
              id: "event-1",
              type: "created",
              title: "Order Created",
              description: "AI Design order created",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              userId: "demo-user",
              userType: "client"
            },
            {
              id: "event-2", 
              type: "started",
              title: "Work Started",
              description: "AI specialist started working on the project",
              timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
              userId: "alex-ai",
              userType: "worker"
            },
            {
              id: "event-3",
              type: "milestone_completed",
              title: "Initial Concepts Completed",
              description: "First milestone completed with 5 logo concepts",
              timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              userId: "alex-ai",
              userType: "worker"
            }
          ]),
          
          conversationId: "demo-conv-1",
          lastActivity: new Date().toISOString(),
          
          metadata: JSON.stringify({
            specialistType: "design",
            aiModel: "advanced-design-v2",
            clientIndustry: "technology",
            brandGuidelines: "modern, minimalist, tech-focused"
          })
        }
      );
      console.log("✅ Demo unified order created");

    } catch (error) {
      console.log("📝 Demo unified order already exists or failed to create:", error.message);
    }

    console.log("🎉 Unified orders system setup completed!");

  } catch (error) {
    console.error("❌ Error setting up unified orders collections:", error);
    process.exit(1);
  }
}

setupUnifiedOrdersCollections(); 