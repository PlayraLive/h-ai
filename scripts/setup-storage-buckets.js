const { Client, Storage, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

// Storage bucket configurations
const STORAGE_BUCKETS = {
  AVATARS: {
    id: "avatars",
    name: "User Avatars",
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
    compression: "gzip",
    encryption: true,
    antivirus: true,
  },
  PORTFOLIO: {
    id: "portfolio",
    name: "Portfolio Images",
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileExtensions: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
    compression: "gzip",
    encryption: true,
    antivirus: true,
  },
  PROJECTS: {
    id: "projects",
    name: "Project Files",
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 20 * 1024 * 1024, // 20MB
    allowedFileExtensions: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "pdf",
      "doc",
      "docx",
      "txt",
      "zip",
      "rar",
    ],
    compression: "gzip",
    encryption: true,
    antivirus: true,
  },
  VIDEOS: {
    id: "videos",
    name: "Video Content",
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 100 * 1024 * 1024, // 100MB
    allowedFileExtensions: ["mp4", "webm", "mov", "avi", "mkv"],
    compression: "gzip",
    encryption: true,
    antivirus: true,
  },
  DOCUMENTS: {
    id: "documents",
    name: "Documents",
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 50 * 1024 * 1024, // 50MB
    allowedFileExtensions: [
      "pdf",
      "doc",
      "docx",
      "txt",
      "rtf",
      "odt",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
    ],
    compression: "gzip",
    encryption: true,
    antivirus: true,
  },
  THUMBNAILS: {
    id: "thumbnails",
    name: "Thumbnails",
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
    fileSecurity: false,
    enabled: true,
    maximumFileSize: 2 * 1024 * 1024, // 2MB
    allowedFileExtensions: ["jpg", "jpeg", "png", "webp"],
    compression: "gzip",
    encryption: false,
    antivirus: true,
  },
  TEMP: {
    id: "temp",
    name: "Temporary Files",
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 25 * 1024 * 1024, // 25MB
    allowedFileExtensions: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "pdf",
      "doc",
      "docx",
      "txt",
      "mp4",
      "webm",
    ],
    compression: "gzip",
    encryption: true,
    antivirus: true,
  },
};

async function createStorageBucket(bucketConfig) {
  try {
    console.log(`Creating bucket: ${bucketConfig.name} (${bucketConfig.id})`);

    const bucket = await storage.createBucket(
      bucketConfig.id,
      bucketConfig.name,
      bucketConfig.permissions,
      bucketConfig.fileSecurity,
      bucketConfig.enabled,
      bucketConfig.maximumFileSize,
      bucketConfig.allowedFileExtensions,
      bucketConfig.compression,
      bucketConfig.encryption,
      bucketConfig.antivirus,
    );

    console.log(`✅ Successfully created bucket: ${bucket.name}`);
    return bucket;
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️ Bucket ${bucketConfig.name} already exists`);

      // Try to update existing bucket
      try {
        const updatedBucket = await storage.updateBucket(
          bucketConfig.id,
          bucketConfig.name,
          bucketConfig.permissions,
          bucketConfig.fileSecurity,
          bucketConfig.enabled,
          bucketConfig.maximumFileSize,
          bucketConfig.allowedFileExtensions,
          bucketConfig.compression,
          bucketConfig.encryption,
          bucketConfig.antivirus,
        );
        console.log(`🔄 Updated existing bucket: ${updatedBucket.name}`);
        return updatedBucket;
      } catch (updateError) {
        console.error(
          `❌ Error updating bucket ${bucketConfig.name}:`,
          updateError.message,
        );
        return null;
      }
    } else {
      console.error(
        `❌ Error creating bucket ${bucketConfig.name}:`,
        error.message,
      );
      return null;
    }
  }
}

async function listExistingBuckets() {
  try {
    console.log("\n📋 Listing existing buckets...");
    const buckets = await storage.listBuckets();

    if (buckets.buckets.length === 0) {
      console.log("No buckets found.");
    } else {
      console.log(`Found ${buckets.buckets.length} existing buckets:`);
      buckets.buckets.forEach((bucket) => {
        console.log(`  - ${bucket.name} (${bucket.$id})`);
      });
    }

    return buckets.buckets;
  } catch (error) {
    console.error("❌ Error listing buckets:", error.message);
    return [];
  }
}

async function deleteBucket(bucketId) {
  try {
    await storage.deleteBucket(bucketId);
    console.log(`🗑️ Deleted bucket: ${bucketId}`);
  } catch (error) {
    console.error(`❌ Error deleting bucket ${bucketId}:`, error.message);
  }
}

async function setupAllBuckets() {
  console.log("🚀 Starting Appwrite Storage Buckets Setup...\n");

  // Check if required environment variables are set
  if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
    console.error(
      "❌ NEXT_PUBLIC_APPWRITE_ENDPOINT is not set in environment variables",
    );
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
    console.error(
      "❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set in environment variables",
    );
    process.exit(1);
  }

  if (!process.env.APPWRITE_API_KEY) {
    console.error("❌ APPWRITE_API_KEY is not set in environment variables");
    console.log("Please set your Appwrite API key in .env.local file");
    process.exit(1);
  }

  // List existing buckets first
  await listExistingBuckets();

  console.log("\n🏗️ Creating storage buckets...\n");

  const results = [];
  const bucketConfigs = Object.values(STORAGE_BUCKETS);

  for (const config of bucketConfigs) {
    const result = await createStorageBucket(config);
    results.push({ config, result });

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n📊 Setup Summary:");
  console.log("==================");

  let successCount = 0;
  let failureCount = 0;

  results.forEach(({ config, result }) => {
    if (result) {
      console.log(`✅ ${config.name}: SUCCESS`);
      successCount++;
    } else {
      console.log(`❌ ${config.name}: FAILED`);
      failureCount++;
    }
  });

  console.log(`\nTotal: ${results.length} buckets`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failureCount}`);

  if (failureCount === 0) {
    console.log("\n🎉 All storage buckets have been set up successfully!");
  } else {
    console.log(
      "\n⚠️ Some buckets failed to create. Please check the errors above.",
    );
  }

  // List buckets again to confirm
  console.log("\n📋 Final bucket list:");
  await listExistingBuckets();
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "setup":
    case "create":
      await setupAllBuckets();
      break;

    case "list":
      await listExistingBuckets();
      break;

    case "delete":
      const bucketId = args[1];
      if (!bucketId) {
        console.error("❌ Please provide a bucket ID to delete");
        console.log("Usage: node setup-storage-buckets.js delete <bucket-id>");
        process.exit(1);
      }
      await deleteBucket(bucketId);
      break;

    case "clean":
      console.log("🧹 Cleaning up all buckets...");
      const buckets = await listExistingBuckets();
      for (const bucket of buckets) {
        await deleteBucket(bucket.$id);
      }
      console.log("✅ All buckets deleted");
      break;

    default:
      console.log("Appwrite Storage Buckets Setup");
      console.log("===============================");
      console.log("");
      console.log("Usage:");
      console.log(
        "  node setup-storage-buckets.js setup     - Create all storage buckets",
      );
      console.log(
        "  node setup-storage-buckets.js list      - List existing buckets",
      );
      console.log(
        "  node setup-storage-buckets.js delete <id> - Delete a specific bucket",
      );
      console.log(
        "  node setup-storage-buckets.js clean     - Delete all buckets",
      );
      console.log("");
      console.log("Environment Variables Required:");
      console.log("  NEXT_PUBLIC_APPWRITE_ENDPOINT");
      console.log("  NEXT_PUBLIC_APPWRITE_PROJECT_ID");
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

module.exports = {
  setupAllBuckets,
  createStorageBucket,
  listExistingBuckets,
  STORAGE_BUCKETS,
};
