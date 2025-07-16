// Финальные коллекции для AI фриланс платформы
const https = require('https');

const PROJECT_ID = '687759fb003c8bd76b93';
const DATABASE_ID = '687796e3001241f7de17';
const API_KEY = 'standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4';
const ENDPOINT = 'fra.cloud.appwrite.io';

function makeRequest(path, data, method = 'POST') {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: ENDPOINT,
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'X-Appwrite-Project': PROJECT_ID,
                'X-Appwrite-Key': API_KEY
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseData));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function createAttribute(collectionId, attribute) {
    try {
        let endpoint = '';
        let payload = {
            key: attribute.key,
            required: attribute.required || false
        };

        if (attribute.type === 'string') {
            endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/string`;
            payload.size = attribute.size || 255;
            payload.default = attribute.default || null;
            payload.array = attribute.array || false;
        } else if (attribute.type === 'boolean') {
            endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/boolean`;
            if (!attribute.required) payload.default = attribute.default;
        } else if (attribute.type === 'integer') {
            endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/integer`;
            if (!attribute.required) payload.default = attribute.default;
            payload.min = attribute.min;
            payload.max = attribute.max;
        } else if (attribute.type === 'double') {
            endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/float`;
            if (!attribute.required) payload.default = attribute.default;
            payload.min = attribute.min;
            payload.max = attribute.max;
        } else if (attribute.type === 'datetime') {
            endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/datetime`;
            if (!attribute.required) payload.default = attribute.default;
        } else if (attribute.type === 'email') {
            endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/email`;
            if (!attribute.required) payload.default = attribute.default;
        } else if (attribute.type === 'url') {
            endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/url`;
            if (!attribute.required) payload.default = attribute.default;
        }

        await makeRequest(endpoint, payload);
        console.log(`  ✅ Added attribute: ${attribute.key} (${attribute.type})`);
        return true;
    } catch (error) {
        if (error.message.includes('409')) {
            console.log(`  ℹ️  Attribute ${attribute.key} already exists`);
            return true;
        }
        console.log(`  ❌ Failed to add ${attribute.key}: ${error.message}`);
        return false;
    }
}

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
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return true;
}

async function setupFinalCollections() {
    console.log('🚀 Setting up final collections...');
    console.log('');
    
    const collections = [
        {
            id: 'payments',
            name: 'Payments',
            attributes: [
                { key: 'contractId', type: 'string', size: 255, required: true },
                { key: 'payerId', type: 'string', size: 255, required: true },
                { key: 'payeeId', type: 'string', size: 255, required: true },
                { key: 'amount', type: 'double', required: true, min: 0 },
                { key: 'currency', type: 'string', size: 10, required: false },
                { key: 'paymentMethod', type: 'string', size: 50, required: false }, // card, paypal, bank, crypto
                { key: 'status', type: 'string', size: 50, required: false }, // pending, processing, completed, failed, refunded
                { key: 'transactionId', type: 'string', size: 255, required: false },
                { key: 'gatewayResponse', type: 'string', size: 1000, required: false }, // JSON response
                { key: 'description', type: 'string', size: 500, required: false },
                { key: 'milestoneId', type: 'string', size: 255, required: false },
                { key: 'platformFee', type: 'double', required: false, min: 0 },
                { key: 'netAmount', type: 'double', required: false, min: 0 },
                { key: 'createdAt', type: 'datetime', required: true },
                { key: 'processedAt', type: 'datetime', required: false },
                { key: 'refundedAt', type: 'datetime', required: false }
            ]
        },
        {
            id: 'portfolio',
            name: 'Portfolio',
            attributes: [
                { key: 'userId', type: 'string', size: 255, required: true },
                { key: 'title', type: 'string', size: 255, required: true },
                { key: 'description', type: 'string', size: 2000, required: true },
                { key: 'category', type: 'string', size: 100, required: false },
                { key: 'skills', type: 'string', size: 100, required: false, array: true },
                { key: 'images', type: 'string', size: 500, required: false, array: true },
                { key: 'files', type: 'string', size: 500, required: false, array: true },
                { key: 'projectUrl', type: 'url', required: false },
                { key: 'clientName', type: 'string', size: 255, required: false },
                { key: 'completionDate', type: 'datetime', required: false },
                { key: 'duration', type: 'string', size: 100, required: false },
                { key: 'budget', type: 'double', required: false, min: 0 },
                { key: 'currency', type: 'string', size: 10, required: false },
                { key: 'featured', type: 'boolean', required: false },
                { key: 'isPublic', type: 'boolean', required: false },
                { key: 'views', type: 'integer', required: false, min: 0 },
                { key: 'likes', type: 'integer', required: false, min: 0 },
                { key: 'tags', type: 'string', size: 100, required: false, array: true },
                { key: 'createdAt', type: 'datetime', required: true },
                { key: 'updatedAt', type: 'datetime', required: true }
            ]
        },
        {
            id: 'conversations',
            name: 'Conversations',
            attributes: [
                { key: 'participants', type: 'string', size: 255, required: true, array: true },
                { key: 'projectId', type: 'string', size: 255, required: false },
                { key: 'contractId', type: 'string', size: 255, required: false },
                { key: 'title', type: 'string', size: 255, required: false },
                { key: 'lastMessage', type: 'string', size: 500, required: false },
                { key: 'lastMessageAt', type: 'datetime', required: false },
                { key: 'lastMessageBy', type: 'string', size: 255, required: false },
                { key: 'unreadCount', type: 'string', size: 1000, required: false }, // JSON: {userId: count}
                { key: 'isArchived', type: 'boolean', required: false },
                { key: 'createdAt', type: 'datetime', required: true },
                { key: 'updatedAt', type: 'datetime', required: true }
            ]
        },
        {
            id: 'skills',
            name: 'Skills',
            attributes: [
                { key: 'name', type: 'string', size: 100, required: true },
                { key: 'category', type: 'string', size: 100, required: true },
                { key: 'subcategory', type: 'string', size: 100, required: false },
                { key: 'description', type: 'string', size: 500, required: false },
                { key: 'isActive', type: 'boolean', required: false },
                { key: 'popularity', type: 'integer', required: false, min: 0 },
                { key: 'averageRate', type: 'double', required: false, min: 0 },
                { key: 'createdAt', type: 'datetime', required: true }
            ]
        },
        {
            id: 'categories',
            name: 'Categories',
            attributes: [
                { key: 'name', type: 'string', size: 100, required: true },
                { key: 'slug', type: 'string', size: 100, required: true },
                { key: 'description', type: 'string', size: 500, required: false },
                { key: 'icon', type: 'string', size: 255, required: false },
                { key: 'parentId', type: 'string', size: 255, required: false },
                { key: 'isActive', type: 'boolean', required: false },
                { key: 'sortOrder', type: 'integer', required: false, min: 0 },
                { key: 'projectCount', type: 'integer', required: false, min: 0 },
                { key: 'createdAt', type: 'datetime', required: true }
            ]
        }
    ];
    
    const results = [];
    for (const collection of collections) {
        const result = await createCollection(collection.id, collection.name, collection.attributes);
        results.push(result);
        console.log('');
    }
    
    const successCount = results.filter(r => r).length;
    
    console.log('📊 Final Collections Results:');
    console.log(`✅ ${successCount}/${collections.length} collections processed successfully`);
    
    if (successCount === collections.length) {
        console.log('🎉 ALL DATABASE COLLECTIONS SETUP COMPLETED!');
        console.log('');
        console.log('📋 Total Collections Created:');
        console.log('✅ Users - User profiles and authentication');
        console.log('✅ Projects - Job postings and project details');
        console.log('✅ Proposals - Freelancer bids on projects');
        console.log('✅ Contracts - Active work agreements');
        console.log('✅ Reviews - Ratings and feedback');
        console.log('✅ Messages - Direct messaging system');
        console.log('✅ Notifications - User notifications');
        console.log('✅ Payments - Payment processing and history');
        console.log('✅ Portfolio - Freelancer work showcase');
        console.log('✅ Conversations - Chat conversations');
        console.log('✅ Skills - Available skills database');
        console.log('✅ Categories - Project categories');
        console.log('');
        console.log('🚀 Your AI Freelance Platform database is ready!');
    }
}

setupFinalCollections().catch(console.error);
