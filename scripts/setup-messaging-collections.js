const { Client, Databases, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Инициализация клиента
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function setupMessagingCollections() {
  try {
    console.log("🚀 Setting up messaging collections...");

    // Create Conversations Collection
    console.log("📁 Creating conversations collection...");
    
    try {
      const conversationsCollection = await databases.createCollection(
        DATABASE_ID,
        "conversations",
        "Conversations",
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log("✅ Conversations collection created");

      // Add attributes to conversations
      await databases.createStringAttribute(
        DATABASE_ID,
        "conversations",
        "title",
        255,
        true
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "conversations",
        "participants",
        2000,
        true,
        null,
        true // array
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "conversations",
        "lastMessage",
        500,
        false
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "conversations",
        "lastMessageTime",
        50,
        true
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "conversations",
        "unreadCount",
        2000,
        false,
        "{}"
      );

      await databases.createEnumAttribute(
        DATABASE_ID,
        "conversations",
        "type",
        ["direct", "group", "ai_specialist", "project"],
        true,
        "direct"
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "conversations",
        "avatar",
        500,
        false
      );

      await databases.createEnumAttribute(
        DATABASE_ID,
        "conversations",
        "status",
        ["active", "archived", "muted"],
        true,
        "active"
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "conversations",
        "createdAt",
        50,
        true
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "conversations",
        "updatedAt",
        50,
        true
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "conversations",
        "metadata",
        2000,
        false,
        "{}"
      );

      console.log("✅ Conversations attributes added");

      // Create indexes
      await databases.createIndex(
        DATABASE_ID,
        "conversations",
        "participants_index",
        "key",
        ["participants"]
      );

      await databases.createIndex(
        DATABASE_ID,
        "conversations",
        "updated_index",
        "key",
        ["updatedAt"]
      );

      console.log("✅ Conversations indexes created");

    } catch (error) {
      if (error.code === 409) {
        console.log("📝 Conversations collection already exists");
      } else {
        throw error;
      }
    }

    // Create Messages Collection
    console.log("📁 Creating messages collection...");
    
    try {
      const messagesCollection = await databases.createCollection(
        DATABASE_ID,
        "messages",
        "Messages",
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log("✅ Messages collection created");

      // Add attributes to messages
      await databases.createStringAttribute(
        DATABASE_ID,
        "messages",
        "conversationId",
        50,
        true
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "messages",
        "senderId",
        50,
        true
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "messages",
        "receiverId",
        50,
        true
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "messages",
        "content",
        5000,
        true
      );

      await databases.createEnumAttribute(
        DATABASE_ID,
        "messages",
        "messageType",
        ["text", "image", "file", "system", "order_card", "video", "voice", "job_card", "ai_response"],
        true,
        "text"
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "messages",
        "timestamp",
        50,
        true
      );

      await databases.createBooleanAttribute(
        DATABASE_ID,
        "messages",
        "read",
        true,
        false
      );

      await databases.createBooleanAttribute(
        DATABASE_ID,
        "messages",
        "edited",
        false,
        false
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "messages",
        "editedAt",
        50,
        false
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "messages",
        "replyTo",
        50,
        false
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "messages",
        "attachments",
        2000,
        false,
        "[]"
      );

      await databases.createEnumAttribute(
        DATABASE_ID,
        "messages",
        "status",
        ["sending", "sent", "delivered", "read", "failed"],
        true,
        "sent"
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "messages",
        "senderName",
        255,
        false
      );

      await databases.createStringAttribute(
        DATABASE_ID,
        "messages",
        "senderAvatar",
        500,
        false
      );

      console.log("✅ Messages attributes added");

      // Create indexes
      await databases.createIndex(
        DATABASE_ID,
        "messages",
        "conversation_index",
        "key",
        ["conversationId"]
      );

      await databases.createIndex(
        DATABASE_ID,
        "messages",
        "timestamp_index",
        "key",
        ["timestamp"]
      );

      await databases.createIndex(
        DATABASE_ID,
        "messages",
        "sender_index",
        "key",
        ["senderId"]
      );

      await databases.createIndex(
        DATABASE_ID,
        "messages",
        "receiver_index",
        "key",
        ["receiverId"]
      );

      await databases.createIndex(
        DATABASE_ID,
        "messages",
        "unread_index",
        "key",
        ["read", "receiverId"]
      );

      console.log("✅ Messages indexes created");

    } catch (error) {
      if (error.code === 409) {
        console.log("📝 Messages collection already exists");
      } else {
        throw error;
      }
    }

    console.log("🎉 Messaging collections setup completed successfully!");
    
    // Create some demo data
    console.log("📊 Creating demo conversations...");
    
    try {
      const demoConversation = await databases.createDocument(
        DATABASE_ID,
        "conversations",
        "demo-conv-1",
        {
          title: "Алекс AI - Дизайн логотипа",
          participants: ["demo-user", "alex-ai"],
          lastMessage: "Привет! Как дела с проектом?",
          lastMessageTime: new Date().toISOString(),
          unreadCount: JSON.stringify({"demo-user": 0, "alex-ai": 1}),
          type: "ai_specialist",
          avatar: "/images/specialists/alex-ai.jpg",
          status: "active",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: JSON.stringify({
            orderId: "AI-2025-001",
            specialistType: "design"
          })
        }
      );
      console.log("✅ Demo conversation created");

      // Create demo messages
      const demoMessages = [
        {
          conversationId: "demo-conv-1",
          senderId: "demo-user",
          receiverId: "alex-ai",
          content: "Привет! Как дела с проектом дизайна логотипа?",
          messageType: "text",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true,
          status: "read",
          senderName: "Demo User",
          senderAvatar: "/images/default-avatar.jpg"
        },
        {
          conversationId: "demo-conv-1",
          senderId: "alex-ai",
          receiverId: "demo-user",
          content: "Привет! Отлично работаю над концепцией. Уже готов первый вариант дизайна 🎨",
          messageType: "text",
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          read: false,
          status: "delivered",
          senderName: "Алекс AI",
          senderAvatar: "/images/specialists/alex-ai.jpg"
        }
      ];

      for (const message of demoMessages) {
        await databases.createDocument(
          DATABASE_ID,
          "messages",
          `demo-msg-${Date.now()}-${Math.random()}`,
          message
        );
      }
      
      console.log("✅ Demo messages created");

    } catch (error) {
      console.log("📝 Demo data already exists or failed to create:", error.message);
    }

    console.log("🎉 Messaging system setup completed!");

  } catch (error) {
    console.error("❌ Error setting up messaging collections:", error);
    process.exit(1);
  }
}

setupMessagingCollections(); 