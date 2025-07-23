const { RealDataSeeder } = require('../src/lib/seed-real-data');
require('dotenv').config();

// Progress tracking
let currentProgress = null;

function updateProgress(progress) {
  currentProgress = progress;
  const { stage, progress: percentage, message } = progress;

  // Clear current line and show progress
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);

  if (percentage >= 0) {
    const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    process.stdout.write(`[${progressBar}] ${percentage}% - ${stage}: ${message}`);
  } else {
    process.stdout.write(`❌ ${stage}: ${message}`);
  }
}

async function seedData(options = {}) {
  console.log('🚀 Starting Real Data Seeding Process...\n');

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
    console.error('❌ NEXT_PUBLIC_APPWRITE_ENDPOINT is not set');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
    console.error('❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
    console.error('❌ NEXT_PUBLIC_APPWRITE_DATABASE_ID is not set');
    process.exit(1);
  }

  try {
    const seeder = new RealDataSeeder(updateProgress);

    let result;

    if (options.cleanFirst) {
      console.log('🧹 Cleaning existing data first...\n');
      await seeder.cleanAllData();
      console.log('\n✅ Data cleaning completed\n');
    }

    console.log('📦 Starting data seeding...\n');
    result = await seeder.seedAllData();

    console.log('\n\n🎉 Data Seeding Completed Successfully!\n');
    console.log('📊 Summary:');
    console.log('===========');
    console.log(`👥 Users: ${result.summary.users}`);
    console.log(`🛠️ Skills: ${result.summary.skills}`);
    console.log(`📁 Categories: ${result.summary.categories}`);
    console.log(`💼 Projects: ${result.summary.projects}`);
    console.log(`🎨 Portfolio Items: ${result.summary.portfolio}`);
    console.log(`⭐ Reviews: ${result.summary.reviews}`);
    console.log(`🔔 Notifications: ${result.summary.notifications}`);
    console.log(`💬 Conversations: ${result.summary.conversations}`);
    console.log(`📧 Messages: ${result.summary.messages}`);
    console.log(`\n📊 Total Records: ${Object.values(result.summary).reduce((sum, count) => sum + count, 0)}`);

    console.log('\n✨ Your H-AI platform is now populated with realistic data!');
    console.log('🌐 You can now test all features with real interactions.');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

async function cleanData() {
  console.log('🧹 Starting Data Cleanup...\n');

  try {
    const seeder = new RealDataSeeder(updateProgress);
    await seeder.cleanAllData();

    console.log('\n✅ All data has been cleaned from the database');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

async function quickSeed() {
  console.log('⚡ Quick Seed: Essential data only...\n');

  try {
    const seeder = new RealDataSeeder(updateProgress);

    // Only seed users and basic categories
    console.log('👥 Creating users...');
    const users = await seeder.seedUsers();

    console.log('\n🛠️ Creating skills and categories...');
    const { skills, categories } = await seeder.seedSkillsAndCategories();

    console.log('\n✅ Quick seed completed!');
    console.log(`Created: ${users.length} users, ${skills.length} skills, ${categories.length} categories`);

  } catch (error) {
    console.error('\n❌ Quick seed failed:', error.message);
    process.exit(1);
  }
}

async function testConnection() {
  console.log('🔍 Testing Appwrite connection...\n');

  try {
    const { databases } = require('../src/lib/appwrite');
    const { DATABASE_ID, COLLECTIONS } = require('../src/lib/appwrite/database');

    // Test database connection
    console.log('📡 Connecting to Appwrite...');
    const database = await databases.get(DATABASE_ID);
    console.log(`✅ Connected to database: ${database.name}`);

    // Test collections
    console.log('\n📋 Checking collections...');
    const collectionNames = Object.keys(COLLECTIONS);
    let existingCollections = 0;

    for (const collectionName of collectionNames) {
      try {
        const collectionId = COLLECTIONS[collectionName];
        await databases.getCollection(DATABASE_ID, collectionId);
        console.log(`  ✅ ${collectionName}: exists`);
        existingCollections++;
      } catch (error) {
        console.log(`  ❌ ${collectionName}: missing`);
      }
    }

    console.log(`\n📊 Collections: ${existingCollections}/${collectionNames.length} exist`);

    if (existingCollections === collectionNames.length) {
      console.log('🎉 All collections are ready for seeding!');
    } else {
      console.log('⚠️ Some collections are missing. Run database setup first.');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'seed':
    case 'full':
      await seedData();
      break;

    case 'clean-seed':
    case 'reset':
      await seedData({ cleanFirst: true });
      break;

    case 'clean':
      await cleanData();
      break;

    case 'quick':
      await quickSeed();
      break;

    case 'test':
      await testConnection();
      break;

    default:
      console.log('H-AI Platform Data Seeder');
      console.log('=========================');
      console.log('');
      console.log('Usage:');
      console.log('  node scripts/seed-real-data.js <command>');
      console.log('');
      console.log('Commands:');
      console.log('  seed       - Seed all data (preserve existing)');
      console.log('  clean-seed - Clean all data then seed fresh');
      console.log('  clean      - Clean all data only');
      console.log('  quick      - Quick seed (users, skills, categories only)');
      console.log('  test       - Test Appwrite connection and collections');
      console.log('');
      console.log('Examples:');
      console.log('  npm run setup:seed');
      console.log('  node scripts/seed-real-data.js clean-seed');
      console.log('  node scripts/seed-real-data.js test');
      console.log('');
      console.log('Environment Variables Required:');
      console.log('  NEXT_PUBLIC_APPWRITE_ENDPOINT');
      console.log('  NEXT_PUBLIC_APPWRITE_PROJECT_ID');
      console.log('  NEXT_PUBLIC_APPWRITE_DATABASE_ID');
      console.log('');
      console.log('Make sure to run database and storage setup first:');
      console.log('  npm run setup:database');
      console.log('  npm run setup:storage');
      break;
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\n⏹️ Process interrupted by user');
  if (currentProgress) {
    console.log(`Last progress: ${currentProgress.stage} - ${currentProgress.message}`);
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️ Process terminated');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  seedData,
  cleanData,
  quickSeed,
  testConnection
};
