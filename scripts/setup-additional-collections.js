// Дополнительные коллекции для AI фриланс платформы
const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '687759fb003c8bd76b93';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '687796e3001241f7de17';
const API_KEY = process.env.APPWRITE_API_KEY || 'standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4';
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
            payload.default = attribute.default;
        } else if (attribute.type === 'integer') {
            endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/integer`;
            payload.default = attribute.default;
            payload.min = attribute.min;
            payload.max = attribute.max;
        } else if (attribute.type === 'double') {
            endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/float`;
            payload.default = attribute.default;
            payload.min = attribute.min;
            payload.max = attribute.max;
        } else if (attribute.type === 'datetime') {
            endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/datetime`;
            payload.default = attribute.default;
        } else if (attribute.type === 'email') {
            endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/email`;
            payload.default = attribute.default;
        } else if (attribute.type === 'url') {
            endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/url`;
            payload.default = attribute.default;
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

async function setupAdditionalCollections() {
    console.log('🚀 Setting up additional collections...');
    console.log('');
    
    const collections = [
        {
            id: 'proposals',
            name: 'Proposals',
            attributes: [
                { key: 'projectId', type: 'string', size: 255, required: true },
                { key: 'freelancerId', type: 'string', size: 255, required: true },
                { key: 'coverLetter', type: 'string', size: 2000, required: true },
                { key: 'bidAmount', type: 'double', required: true, min: 0 },
                { key: 'currency', type: 'string', size: 10, required: true, default: 'USD' },
                { key: 'deliveryTime', type: 'string', size: 100, required: true },
                { key: 'status', type: 'string', size: 50, required: true, default: 'pending' }, // pending, accepted, rejected, withdrawn
                { key: 'attachments', type: 'string', size: 500, required: false, array: true },
                { key: 'milestones', type: 'string', size: 2000, required: false }, // JSON string
                { key: 'createdAt', type: 'datetime', required: true },
                { key: 'updatedAt', type: 'datetime', required: true },
                { key: 'isActive', type: 'boolean', required: true, default: true }
            ]
        },
        {
            id: 'contracts',
            name: 'Contracts',
            attributes: [
                { key: 'projectId', type: 'string', size: 255, required: true },
                { key: 'clientId', type: 'string', size: 255, required: true },
                { key: 'freelancerId', type: 'string', size: 255, required: true },
                { key: 'proposalId', type: 'string', size: 255, required: true },
                { key: 'title', type: 'string', size: 255, required: true },
                { key: 'description', type: 'string', size: 2000, required: true },
                { key: 'amount', type: 'double', required: true, min: 0 },
                { key: 'currency', type: 'string', size: 10, required: true, default: 'USD' },
                { key: 'paymentType', type: 'string', size: 50, required: true }, // fixed, hourly, milestone
                { key: 'status', type: 'string', size: 50, required: true, default: 'active' }, // active, completed, cancelled, disputed
                { key: 'startDate', type: 'datetime', required: true },
                { key: 'endDate', type: 'datetime', required: false },
                { key: 'deadline', type: 'datetime', required: false },
                { key: 'milestones', type: 'string', size: 3000, required: false }, // JSON string
                { key: 'terms', type: 'string', size: 2000, required: false },
                { key: 'createdAt', type: 'datetime', required: true },
                { key: 'updatedAt', type: 'datetime', required: true },
                { key: 'completedAt', type: 'datetime', required: false },
                { key: 'isActive', type: 'boolean', required: true, default: true }
            ]
        },
        {
            id: 'reviews',
            name: 'Reviews',
            attributes: [
                { key: 'contractId', type: 'string', size: 255, required: true },
                { key: 'projectId', type: 'string', size: 255, required: true },
                { key: 'reviewerId', type: 'string', size: 255, required: true }, // кто оставляет отзыв
                { key: 'revieweeId', type: 'string', size: 255, required: true }, // кому оставляют отзыв
                { key: 'rating', type: 'double', required: true, min: 1, max: 5 },
                { key: 'comment', type: 'string', size: 1000, required: false },
                { key: 'skills', type: 'string', size: 100, required: false, array: true }, // оцененные навыки
                { key: 'skillRatings', type: 'string', size: 500, required: false }, // JSON: {skill: rating}
                { key: 'communication', type: 'double', required: false, min: 1, max: 5 },
                { key: 'quality', type: 'double', required: false, min: 1, max: 5 },
                { key: 'timeliness', type: 'double', required: false, min: 1, max: 5 },
                { key: 'wouldRecommend', type: 'boolean', required: false },
                { key: 'isPublic', type: 'boolean', required: true, default: true },
                { key: 'createdAt', type: 'datetime', required: true },
                { key: 'isActive', type: 'boolean', required: true, default: true }
            ]
        },
        {
            id: 'messages',
            name: 'Messages',
            attributes: [
                { key: 'senderId', type: 'string', size: 255, required: true },
                { key: 'receiverId', type: 'string', size: 255, required: true },
                { key: 'conversationId', type: 'string', size: 255, required: true },
                { key: 'content', type: 'string', size: 2000, required: true },
                { key: 'messageType', type: 'string', size: 50, required: true, default: 'text' }, // text, file, image, system
                { key: 'attachments', type: 'string', size: 500, required: false, array: true },
                { key: 'isRead', type: 'boolean', required: true, default: false },
                { key: 'readAt', type: 'datetime', required: false },
                { key: 'createdAt', type: 'datetime', required: true },
                { key: 'editedAt', type: 'datetime', required: false },
                { key: 'isDeleted', type: 'boolean', required: true, default: false },
                { key: 'isActive', type: 'boolean', required: true, default: true }
            ]
        },
        {
            id: 'notifications',
            name: 'Notifications',
            attributes: [
                { key: 'userId', type: 'string', size: 255, required: true },
                { key: 'title', type: 'string', size: 255, required: true },
                { key: 'message', type: 'string', size: 1000, required: true },
                { key: 'type', type: 'string', size: 50, required: true }, // project, proposal, contract, payment, system
                { key: 'relatedId', type: 'string', size: 255, required: false }, // ID связанного объекта
                { key: 'relatedType', type: 'string', size: 50, required: false }, // project, proposal, contract, etc.
                { key: 'isRead', type: 'boolean', required: true, default: false },
                { key: 'readAt', type: 'datetime', required: false },
                { key: 'actionUrl', type: 'string', size: 500, required: false },
                { key: 'priority', type: 'string', size: 20, required: true, default: 'normal' }, // low, normal, high, urgent
                { key: 'createdAt', type: 'datetime', required: true },
                { key: 'isActive', type: 'boolean', required: true, default: true }
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
    
    console.log('📊 Additional Collections Results:');
    console.log(`✅ ${successCount}/${collections.length} collections processed successfully`);
    
    if (successCount === collections.length) {
        console.log('🎉 All additional collections setup completed!');
    }
}

setupAdditionalCollections().catch(console.error);
