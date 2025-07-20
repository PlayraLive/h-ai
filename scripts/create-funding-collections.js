#!/usr/bin/env node

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

async function createFundingCollections() {
  console.log('💰 Creating Funding Collections for Investors/Funders...\n');

  // Initialize Appwrite client
  const client = new Client();
  const databases = new Databases(client);

  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  // Funding Collections Schema
  const fundingCollections = [
    {
      id: 'funders',
      name: 'Funders',
      attributes: [
        { key: 'userId', type: 'string', size: 255, required: true },
        { key: 'companyName', type: 'string', size: 255, required: false },
        { key: 'funderType', type: 'string', size: 50, required: true }, // individual, company, vc, angel
        { key: 'investmentRange', type: 'string', size: 100, required: false }, // 1k-10k, 10k-100k, 100k+
        { key: 'preferredSectors', type: 'string', size: 1000, required: false, array: true },
        { key: 'totalInvested', type: 'double', required: false, default: 0 },
        { key: 'activeInvestments', type: 'integer', required: false, default: 0 },
        { key: 'successfulExits', type: 'integer', required: false, default: 0 },
        { key: 'verified', type: 'boolean', required: false, default: false },
        { key: 'accredited', type: 'boolean', required: false, default: false },
        { key: 'bio', type: 'string', size: 2000, required: false },
        { key: 'website', type: 'string', size: 255, required: false },
        { key: 'linkedin', type: 'string', size: 255, required: false },
        { key: 'location', type: 'string', size: 255, required: false },
        { key: 'avatar', type: 'string', size: 255, required: false },
        { key: 'status', type: 'string', size: 50, required: false, default: 'active' }
      ]
    },
    {
      id: 'funding_campaigns',
      name: 'Funding Campaigns',
      attributes: [
        { key: 'creatorId', type: 'string', size: 255, required: true },
        { key: 'title', type: 'string', size: 255, required: true },
        { key: 'description', type: 'string', size: 5000, required: true },
        { key: 'category', type: 'string', size: 100, required: true },
        { key: 'subcategory', type: 'string', size: 100, required: false },
        { key: 'fundingGoal', type: 'double', required: true },
        { key: 'currentFunding', type: 'double', required: false, default: 0 },
        { key: 'currency', type: 'string', size: 10, required: false, default: 'USD' },
        { key: 'campaignType', type: 'string', size: 50, required: true }, // equity, reward, donation, loan
        { key: 'equityOffered', type: 'double', required: false }, // percentage for equity campaigns
        { key: 'valuation', type: 'double', required: false },
        { key: 'minInvestment', type: 'double', required: false, default: 100 },
        { key: 'maxInvestment', type: 'double', required: false },
        { key: 'deadline', type: 'datetime', required: true },
        { key: 'status', type: 'string', size: 50, required: false, default: 'draft' }, // draft, active, funded, failed, cancelled
        { key: 'featured', type: 'boolean', required: false, default: false },
        { key: 'images', type: 'string', size: 255, required: false, array: true },
        { key: 'documents', type: 'string', size: 255, required: false, array: true },
        { key: 'tags', type: 'string', size: 100, required: false, array: true },
        { key: 'investorsCount', type: 'integer', required: false, default: 0 },
        { key: 'viewsCount', type: 'integer', required: false, default: 0 },
        { key: 'likesCount', type: 'integer', required: false, default: 0 }
      ]
    },
    {
      id: 'investments',
      name: 'Investments',
      attributes: [
        { key: 'campaignId', type: 'string', size: 255, required: true },
        { key: 'funderId', type: 'string', size: 255, required: true },
        { key: 'amount', type: 'double', required: true },
        { key: 'currency', type: 'string', size: 10, required: false, default: 'USD' },
        { key: 'investmentType', type: 'string', size: 50, required: true }, // equity, reward, donation, loan
        { key: 'equityPercentage', type: 'double', required: false },
        { key: 'expectedReturn', type: 'double', required: false },
        { key: 'status', type: 'string', size: 50, required: false, default: 'pending' }, // pending, confirmed, completed, refunded
        { key: 'paymentMethod', type: 'string', size: 50, required: false },
        { key: 'transactionId', type: 'string', size: 255, required: false },
        { key: 'notes', type: 'string', size: 1000, required: false },
        { key: 'dueDate', type: 'datetime', required: false }, // for loans
        { key: 'interestRate', type: 'double', required: false }, // for loans
        { key: 'rewardTier', type: 'string', size: 255, required: false }, // for reward campaigns
        { key: 'anonymous', type: 'boolean', required: false, default: false }
      ]
    },
    {
      id: 'funding_updates',
      name: 'Funding Updates',
      attributes: [
        { key: 'campaignId', type: 'string', size: 255, required: true },
        { key: 'creatorId', type: 'string', size: 255, required: true },
        { key: 'title', type: 'string', size: 255, required: true },
        { key: 'content', type: 'string', size: 5000, required: true },
        { key: 'updateType', type: 'string', size: 50, required: false, default: 'general' }, // milestone, financial, product, general
        { key: 'images', type: 'string', size: 255, required: false, array: true },
        { key: 'documents', type: 'string', size: 255, required: false, array: true },
        { key: 'visibility', type: 'string', size: 50, required: false, default: 'investors' }, // public, investors, backers
        { key: 'important', type: 'boolean', required: false, default: false }
      ]
    },
    {
      id: 'funding_milestones',
      name: 'Funding Milestones',
      attributes: [
        { key: 'campaignId', type: 'string', size: 255, required: true },
        { key: 'title', type: 'string', size: 255, required: true },
        { key: 'description', type: 'string', size: 1000, required: false },
        { key: 'targetAmount', type: 'double', required: true },
        { key: 'targetDate', type: 'datetime', required: false },
        { key: 'achieved', type: 'boolean', required: false, default: false },
        { key: 'achievedDate', type: 'datetime', required: false },
        { key: 'order', type: 'integer', required: false, default: 0 },
        { key: 'reward', type: 'string', size: 500, required: false } // what backers get when milestone is reached
      ]
    },
    {
      id: 'investor_profiles',
      name: 'Investor Profiles',
      attributes: [
        { key: 'userId', type: 'string', size: 255, required: true },
        { key: 'investorType', type: 'string', size: 50, required: true }, // angel, vc, institutional, retail
        { key: 'riskTolerance', type: 'string', size: 50, required: false }, // low, medium, high
        { key: 'investmentHorizon', type: 'string', size: 50, required: false }, // short, medium, long
        { key: 'preferredStages', type: 'string', size: 50, required: false, array: true }, // seed, series_a, series_b, etc
        { key: 'portfolioSize', type: 'integer', required: false, default: 0 },
        { key: 'totalInvested', type: 'double', required: false, default: 0 },
        { key: 'averageInvestment', type: 'double', required: false, default: 0 },
        { key: 'successRate', type: 'double', required: false, default: 0 },
        { key: 'followedCampaigns', type: 'string', size: 255, required: false, array: true },
        { key: 'watchlist', type: 'string', size: 255, required: false, array: true },
        { key: 'notifications', type: 'boolean', required: false, default: true },
        { key: 'publicProfile', type: 'boolean', required: false, default: false }
      ]
    }
  ];

  try {
    for (const collection of fundingCollections) {
      console.log(`📁 Creating collection: ${collection.name} (${collection.id})`);
      
      try {
        // Create collection
        const createdCollection = await databases.createCollection(
          DATABASE_ID,
          collection.id,
          collection.name,
          [], // permissions will be set later
          false, // documentSecurity
          true   // enabled
        );

        console.log(`✅ Collection created: ${createdCollection.name}`);

        // Add attributes
        for (const attr of collection.attributes) {
          try {
            let attribute;
            
            if (attr.type === 'string') {
              attribute = await databases.createStringAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.size,
                attr.required,
                attr.default || null,
                attr.array || false
              );
            } else if (attr.type === 'integer') {
              attribute = await databases.createIntegerAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required,
                attr.min || null,
                attr.max || null,
                attr.default || null,
                attr.array || false
              );
            } else if (attr.type === 'double') {
              attribute = await databases.createFloatAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required,
                attr.min || null,
                attr.max || null,
                attr.default || null,
                attr.array || false
              );
            } else if (attr.type === 'boolean') {
              attribute = await databases.createBooleanAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required,
                attr.default || null,
                attr.array || false
              );
            } else if (attr.type === 'datetime') {
              attribute = await databases.createDatetimeAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required,
                attr.default || null,
                attr.array || false
              );
            }

            console.log(`   ✅ Added attribute: ${attr.key} (${attr.type})`);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (attrError) {
            console.log(`   ❌ Error adding attribute ${attr.key}:`, attrError.message);
          }
        }

        console.log('');
        
      } catch (collectionError) {
        if (collectionError.code === 409) {
          console.log(`⚠️  Collection ${collection.name} already exists`);
        } else {
          console.log(`❌ Error creating collection ${collection.name}:`, collectionError.message);
        }
      }
    }

    console.log('🎉 Funding collections setup completed!');
    console.log('\n📋 Created collections:');
    console.log('- funders (Funder profiles)');
    console.log('- funding_campaigns (Investment campaigns)');
    console.log('- investments (Individual investments)');
    console.log('- funding_updates (Campaign updates)');
    console.log('- funding_milestones (Campaign milestones)');
    console.log('- investor_profiles (Investor preferences)');

  } catch (error) {
    console.error('❌ Error setting up funding collections:', error.message);
  }
}

// Run the script
createFundingCollections();
