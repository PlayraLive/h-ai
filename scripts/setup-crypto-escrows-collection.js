const { Client, Databases, ID, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Инициализация клиента
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function setupCryptoEscrowsCollection() {
  try {
    console.log("🚀 Setting up crypto_escrows collection...");

    // Проверяем, существует ли коллекция
    try {
      await databases.getCollection(DATABASE_ID, "crypto_escrows");
      console.log("ℹ️ Crypto escrows collection already exists, updating attributes...");
    } catch (error) {
      if (error.code === 404) {
        // Создаем коллекцию crypto_escrows
        console.log("📁 Creating crypto_escrows collection...");
        const escrowsCollection = await databases.createCollection(
          DATABASE_ID,
          "crypto_escrows",
          "Crypto Escrows",
          [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ],
        );
        console.log("✅ Crypto escrows collection created");
      } else {
        throw error;
      }
    }

    // Добавляем атрибуты для crypto_escrows
    const escrowAttributes = [
      { key: "jobId", type: "string", size: 255, required: true },
      { key: "contractId", type: "string", size: 255, required: true }, // Blockchain contract ID
      { key: "txHash", type: "string", size: 255, required: true }, // Transaction hash
      { key: "network", type: "string", size: 50, required: true }, // polygon, base, arbitrum, etc.
      { key: "token", type: "string", size: 20, required: true }, // USDC, USDT, DAI, etc.
      { key: "amount", type: "double", required: true },
      { key: "platformFee", type: "double", required: true },
      { key: "milestones", type: "integer", required: false, default: 1 },
      { key: "completedMilestones", type: "integer", required: false, default: 0 },
      { key: "deadline", type: "datetime", required: false },
      { key: "clientAddress", type: "string", size: 100, required: true }, // Wallet address
      { key: "freelancerAddress", type: "string", size: 100, required: true }, // Wallet address
      { key: "status", type: "string", size: 50, required: false, default: "created" }, // created, funded, in_progress, completed, disputed, released
      { key: "disputeReason", type: "string", size: 1000, required: false },
      { key: "resolutionTxHash", type: "string", size: 255, required: false },
      { key: "events", type: "string", size: 5000, required: false }, // JSON array of blockchain events
      { key: "createdAt", type: "datetime", required: false },
      { key: "completedAt", type: "datetime", required: false },
    ];

    for (const attr of escrowAttributes) {
      try {
        if (attr.type === "integer") {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            "crypto_escrows",
            attr.key,
            attr.required,
            undefined, // min
            undefined, // max
            attr.default,
          );
        } else if (attr.type === "double") {
          await databases.createFloatAttribute(
            DATABASE_ID,
            "crypto_escrows",
            attr.key,
            attr.required,
          );
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            "crypto_escrows",
            attr.key,
            attr.required,
          );
        } else {
          await databases.createStringAttribute(
            DATABASE_ID,
            "crypto_escrows",
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
      { key: "contractId_index", type: "key", attributes: ["contractId"] },
      { key: "clientAddress_index", type: "key", attributes: ["clientAddress"] },
      { key: "freelancerAddress_index", type: "key", attributes: ["freelancerAddress"] },
      { key: "network_index", type: "key", attributes: ["network"] },
      { key: "status_index", type: "key", attributes: ["status"] },
      { key: "createdAt_index", type: "key", attributes: ["createdAt"], orders: ["DESC"] }
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          "crypto_escrows",
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

    // Также обновляем коллекцию jobs для поддержки крипто-платежей
    console.log("\n🔄 Updating jobs collection for crypto support...");
    
    const cryptoJobAttributes = [
      { key: "paymentMethod", type: "string", size: 20, required: false }, // fiat, crypto
      { key: "escrowContractId", type: "string", size: 255, required: false },
      { key: "escrowTxHash", type: "string", size: 255, required: false },
      { key: "cryptoNetwork", type: "string", size: 50, required: false },
      { key: "cryptoToken", type: "string", size: 20, required: false },
      { key: "cryptoAmount", type: "double", required: false },
    ];

    for (const attr of cryptoJobAttributes) {
      try {
        if (attr.type === "double") {
          await databases.createFloatAttribute(
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
        console.log(`✅ Added jobs attribute: ${attr.key}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ Jobs attribute ${attr.key} already exists`);
        } else {
          console.error(`❌ Error adding jobs attribute ${attr.key}:`, error.message);
        }
      }
    }

    console.log("🎉 Crypto escrows collection setup completed!");
  } catch (error) {
    console.error("❌ Error setting up crypto escrows collection:", error);
  }
}

// Запуск скрипта
setupCryptoEscrowsCollection();
