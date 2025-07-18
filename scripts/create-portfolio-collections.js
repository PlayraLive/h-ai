#!/usr/bin/env node

const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Configuration
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !DATABASE_ID || !API_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

console.log('🎨 Creating Portfolio Collections...');

// Helper function to make API requests
function makeRequest(path, data = null, method = 'POST') {
    return new Promise((resolve, reject) => {
        const url = new URL(path, ENDPOINT);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': PROJECT_ID,
                'X-Appwrite-Key': API_KEY
            }
        };

        if (data) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || responseData}`));
                    }
                } catch (e) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(responseData);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                    }
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Function to create an attribute
async function createAttribute(collectionId, attribute) {
    const { key, type, size, required, array, default: defaultValue, elements } = attribute;
    
    try {
        let endpoint;
        let payload = {
            key,
            required: required || false,
            array: array || false
        };

        if (defaultValue !== undefined && !required) {
            payload.default = defaultValue;
        }

        switch (type) {
            case 'string':
                endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/string`;
                payload.size = size || 255;
                break;
            case 'integer':
                endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/integer`;
                break;
            case 'float':
                endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/float`;
                break;
            case 'boolean':
                endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/boolean`;
                break;
            case 'datetime':
                endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/datetime`;
                break;
            case 'enum':
                endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/enum`;
                payload.elements = elements;
                break;
            default:
                throw new Error(`Unknown attribute type: ${type}`);
        }

        await makeRequest(endpoint, payload);
        console.log(`✅ Created attribute: ${key} (${type})`);
        
    } catch (error) {
        if (error.message.includes('409')) {
            console.log(`ℹ️  Attribute ${key} already exists`);
        } else {
            console.log(`❌ Error creating attribute ${key}: ${error.message}`);
        }
    }
}

// Function to create a collection
async function createCollection(collectionId, name, attributes) {
    console.log(`📝 Creating ${name} collection...`);
    
    try {
        await makeRequest(`/v1/databases/${DATABASE_ID}/collections`, {
            collectionId: collectionId,
            name: name,
            permissions: ['read("any")', 'write("users")'],
            documentSecurity: true
        });
        console.log(`✅ ${name} collection created`);
    } catch (error) {
        if (error.message.includes('409')) {
            console.log(`ℹ️  ${name} collection already exists`);
        } else {
            console.log(`❌ Error creating ${name} collection: ${error.message}`);
            return false;
        }
    }
    
    for (const attr of attributes) {
        await createAttribute(collectionId, attr);
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return true;
}

// Portfolio Items Collection
const portfolioItemsAttributes = [
    // Basic Info
    { key: 'title', type: 'string', size: 255, required: true },
    { key: 'description', type: 'string', size: 5000, required: true },
    { key: 'category', type: 'string', size: 100, required: true },
    { key: 'subcategory', type: 'string', size: 100, required: false },
    
    // Media
    { key: 'images', type: 'string', size: 500, required: true, array: true },
    { key: 'thumbnailUrl', type: 'string', size: 500, required: true },
    { key: 'videoUrl', type: 'string', size: 500, required: false },
    { key: 'liveUrl', type: 'string', size: 500, required: false },
    { key: 'githubUrl', type: 'string', size: 500, required: false },
    
    // AI & Tech
    { key: 'aiServices', type: 'string', size: 100, required: false, array: true },
    { key: 'skills', type: 'string', size: 50, required: true, array: true },
    { key: 'tools', type: 'string', size: 50, required: false, array: true },
    
    // User Info
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'userName', type: 'string', size: 255, required: true },
    { key: 'userAvatar', type: 'string', size: 500, required: false },
    
    // Engagement
    { key: 'likesCount', type: 'integer', required: false },
    { key: 'viewsCount', type: 'integer', required: false },
    { key: 'commentsCount', type: 'integer', required: false },
    { key: 'sharesCount', type: 'integer', required: false },
    
    // Rating
    { key: 'averageRating', type: 'float', required: false },
    { key: 'ratingsCount', type: 'integer', required: false },
    
    // Status
    { key: 'status', type: 'enum', elements: ['draft', 'published', 'featured', 'archived'], required: false },
    { key: 'featured', type: 'boolean', required: false },
    
    // Timestamps
    { key: 'createdAt', type: 'datetime', required: false },
    { key: 'publishedAt', type: 'datetime', required: false },
    
    // Tags
    { key: 'tags', type: 'string', size: 50, required: false, array: true }
];

// Portfolio Ratings Collection
const portfolioRatingsAttributes = [
    { key: 'portfolioItemId', type: 'string', size: 255, required: true },
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'userName', type: 'string', size: 255, required: true },
    { key: 'userAvatar', type: 'string', size: 500, required: false },
    { key: 'rating', type: 'integer', required: true },
    { key: 'comment', type: 'string', size: 2000, required: false },
    { key: 'helpful', type: 'integer', required: false },
    { key: 'notHelpful', type: 'integer', required: false }
];

// Portfolio Comments Collection
const portfolioCommentsAttributes = [
    { key: 'portfolioItemId', type: 'string', size: 255, required: true },
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'userName', type: 'string', size: 255, required: true },
    { key: 'userAvatar', type: 'string', size: 500, required: false },
    { key: 'comment', type: 'string', size: 2000, required: true },
    { key: 'parentCommentId', type: 'string', size: 255, required: false },
    { key: 'likesCount', type: 'integer', required: false },
    { key: 'repliesCount', type: 'integer', required: false }
];

// User Achievements Collection
const userAchievementsAttributes = [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'achievementType', type: 'enum', elements: ['portfolio', 'rating', 'views', 'likes', 'featured', 'nft', 'streak'], required: true },
    { key: 'achievementId', type: 'string', size: 255, required: true },
    { key: 'title', type: 'string', size: 255, required: true },
    { key: 'description', type: 'string', size: 500, required: true },
    { key: 'icon', type: 'string', size: 255, required: true },
    { key: 'rarity', type: 'enum', elements: ['common', 'rare', 'epic', 'legendary'], required: true },
    { key: 'points', type: 'integer', required: true },
    { key: 'unlockedAt', type: 'datetime', required: true }
];

// AI Services Collection
const aiServicesAttributes = [
    { key: 'name', type: 'string', size: 255, required: true },
    { key: 'category', type: 'enum', elements: ['image', 'text', 'code', 'audio', 'video', 'design', 'other'], required: true },
    { key: 'description', type: 'string', size: 1000, required: false },
    { key: 'website', type: 'string', size: 500, required: false },
    { key: 'icon', type: 'string', size: 500, required: false },
    { key: 'popular', type: 'boolean', required: false }
];

async function createPortfolioCollections() {
    console.log('🎨 Creating portfolio collections...');
    
    const collections = [
        { id: 'portfolio_items', name: 'Portfolio Items', attributes: portfolioItemsAttributes },
        { id: 'portfolio_ratings', name: 'Portfolio Ratings', attributes: portfolioRatingsAttributes },
        { id: 'portfolio_comments', name: 'Portfolio Comments', attributes: portfolioCommentsAttributes },
        { id: 'user_achievements', name: 'User Achievements', attributes: userAchievementsAttributes },
        { id: 'ai_services', name: 'AI Services', attributes: aiServicesAttributes }
    ];
    
    for (const collection of collections) {
        await createCollection(collection.id, collection.name, collection.attributes);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ Portfolio collections created!');
    console.log('🎉 Ready to build the portfolio system!');
}

// Run the script
createPortfolioCollections().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
});
