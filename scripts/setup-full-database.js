// Полная настройка базы данных для AI фриланс платформы
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
        // Создаем коллекцию
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
    
    // Добавляем атрибуты
    for (const attr of attributes) {
        await createAttribute(collectionId, attr);
        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return true;
}

async function setupFullDatabase() {
    console.log('🚀 Setting up FULL AI Freelance Platform database...');
    console.log('Project ID:', PROJECT_ID);
    console.log('Database ID:', DATABASE_ID);
    console.log('');
    
    const collections = [
        {
            id: 'users',
            name: 'Users',
            attributes: [
                { key: 'userId', type: 'string', size: 255, required: true },
                { key: 'name', type: 'string', size: 255, required: true },
                { key: 'email', type: 'email', required: true },
                { key: 'userType', type: 'string', size: 50, required: true }, // freelancer, client
                { key: 'avatar', type: 'url', required: false },
                { key: 'bio', type: 'string', size: 1000, required: false },
                { key: 'location', type: 'string', size: 255, required: false },
                { key: 'timezone', type: 'string', size: 100, required: false },
                { key: 'verified', type: 'boolean', required: true, default: false },
                { key: 'online', type: 'boolean', required: true, default: false },
                { key: 'lastSeen', type: 'datetime', required: false },
                { key: 'rating', type: 'double', required: true, default: 0, min: 0, max: 5 },
                { key: 'reviewCount', type: 'integer', required: true, default: 0, min: 0 },
                { key: 'completedJobs', type: 'integer', required: true, default: 0, min: 0 },
                { key: 'totalEarnings', type: 'double', required: true, default: 0, min: 0 },
                { key: 'successRate', type: 'double', required: true, default: 0, min: 0, max: 100 },
                { key: 'responseTime', type: 'string', size: 100, required: true, default: '24 hours' },
                { key: 'memberSince', type: 'datetime', required: true },
                { key: 'skills', type: 'string', size: 100, required: false, array: true },
                { key: 'languages', type: 'string', size: 100, required: false, array: true },
                { key: 'badges', type: 'string', size: 100, required: false, array: true },
                { key: 'portfolioItems', type: 'string', size: 500, required: false, array: true },
                { key: 'hourlyRate', type: 'double', required: false, min: 0 },
                { key: 'currency', type: 'string', size: 10, required: false, default: 'USD' },
                { key: 'availability', type: 'string', size: 50, required: false }, // available, busy, unavailable
                { key: 'workingHours', type: 'string', size: 500, required: false }, // JSON string
                { key: 'socialLinks', type: 'string', size: 1000, required: false }, // JSON string
                { key: 'preferences', type: 'string', size: 1000, required: false }, // JSON string
                { key: 'isActive', type: 'boolean', required: true, default: true }
            ]
        },
        {
            id: 'projects',
            name: 'Projects',
            attributes: [
                { key: 'title', type: 'string', size: 255, required: true },
                { key: 'description', type: 'string', size: 5000, required: true },
                { key: 'clientId', type: 'string', size: 255, required: true },
                { key: 'freelancerId', type: 'string', size: 255, required: false },
                { key: 'category', type: 'string', size: 100, required: true },
                { key: 'subcategory', type: 'string', size: 100, required: false },
                { key: 'skills', type: 'string', size: 100, required: false, array: true },
                { key: 'budget', type: 'double', required: true, min: 0 },
                { key: 'currency', type: 'string', size: 10, required: true, default: 'USD' },
                { key: 'budgetType', type: 'string', size: 50, required: true }, // fixed, hourly
                { key: 'duration', type: 'string', size: 100, required: false },
                { key: 'urgency', type: 'string', size: 50, required: false }, // low, medium, high, urgent
                { key: 'status', type: 'string', size: 50, required: true, default: 'open' }, // open, in_progress, completed, cancelled
                { key: 'attachments', type: 'string', size: 500, required: false, array: true },
                { key: 'proposals', type: 'integer', required: true, default: 0, min: 0 },
                { key: 'views', type: 'integer', required: true, default: 0, min: 0 },
                { key: 'featured', type: 'boolean', required: true, default: false },
                { key: 'remote', type: 'boolean', required: true, default: true },
                { key: 'location', type: 'string', size: 255, required: false },
                { key: 'experienceLevel', type: 'string', size: 50, required: false }, // entry, intermediate, expert
                { key: 'createdAt', type: 'datetime', required: true },
                { key: 'updatedAt', type: 'datetime', required: true },
                { key: 'deadline', type: 'datetime', required: false },
                { key: 'startDate', type: 'datetime', required: false },
                { key: 'completedAt', type: 'datetime', required: false },
                { key: 'tags', type: 'string', size: 100, required: false, array: true },
                { key: 'requirements', type: 'string', size: 2000, required: false },
                { key: 'deliverables', type: 'string', size: 2000, required: false },
                { key: 'isActive', type: 'boolean', required: true, default: true }
            ]
        }
    ];
    
    const results = [];
    for (const collection of collections) {
        const result = await createCollection(collection.id, collection.name, collection.attributes);
        results.push(result);
        console.log(''); // Пустая строка между коллекциями
    }
    
    const successCount = results.filter(r => r).length;
    
    console.log('📊 Setup Results:');
    console.log(`✅ ${successCount}/${collections.length} collections processed successfully`);
    
    if (successCount === collections.length) {
        console.log('🎉 Full database setup completed successfully!');
    } else {
        console.log('⚠️  Some collections failed. Check API key permissions.');
    }
}

// Запуск полной настройки
setupFullDatabase().catch(console.error);
