// Автоматическое создание базы данных и коллекций в Appwrite
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

async function createUsersCollection() {
    console.log('📝 Creating Users collection...');
    
    try {
        // Создаем коллекцию Users
        const collection = await makeRequest(`/v1/databases/${DATABASE_ID}/collections`, {
            collectionId: 'users',
            name: 'Users',
            permissions: ['read("any")', 'write("users")'],
            documentSecurity: true
        });
        
        console.log('✅ Users collection created:', collection.$id);
        
        // Добавляем атрибуты
        const attributes = [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'email', type: 'string', size: 255, required: true },
            { key: 'userType', type: 'string', size: 50, required: true },
            { key: 'verified', type: 'boolean', required: true, default: false },
            { key: 'online', type: 'boolean', required: true, default: false },
            { key: 'rating', type: 'double', required: true, default: 0 },
            { key: 'reviewCount', type: 'integer', required: true, default: 0 },
            { key: 'completedJobs', type: 'integer', required: true, default: 0 },
            { key: 'totalEarnings', type: 'double', required: true, default: 0 },
            { key: 'successRate', type: 'double', required: true, default: 0 },
            { key: 'responseTime', type: 'string', size: 100, required: true, default: '24 hours' },
            { key: 'memberSince', type: 'string', size: 100, required: true },
            { key: 'skills', type: 'string', size: 1000, required: false, array: true },
            { key: 'languages', type: 'string', size: 1000, required: false, array: true },
            { key: 'badges', type: 'string', size: 1000, required: false, array: true },
            { key: 'portfolioItems', type: 'string', size: 1000, required: false, array: true }
        ];
        
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await makeRequest(`/v1/databases/${DATABASE_ID}/collections/users/attributes/string`, {
                        key: attr.key,
                        size: attr.size,
                        required: attr.required,
                        default: attr.default || null,
                        array: attr.array || false
                    });
                } else if (attr.type === 'boolean') {
                    await makeRequest(`/v1/databases/${DATABASE_ID}/collections/users/attributes/boolean`, {
                        key: attr.key,
                        required: attr.required,
                        default: attr.default
                    });
                } else if (attr.type === 'integer') {
                    await makeRequest(`/v1/databases/${DATABASE_ID}/collections/users/attributes/integer`, {
                        key: attr.key,
                        required: attr.required,
                        default: attr.default
                    });
                } else if (attr.type === 'double') {
                    await makeRequest(`/v1/databases/${DATABASE_ID}/collections/users/attributes/float`, {
                        key: attr.key,
                        required: attr.required,
                        default: attr.default
                    });
                }
                console.log(`  ✅ Added attribute: ${attr.key}`);
            } catch (error) {
                console.log(`  ⚠️  Attribute ${attr.key} might already exist`);
            }
        }
        
        return true;
    } catch (error) {
        if (error.message.includes('409')) {
            console.log('ℹ️  Users collection already exists');
            return true;
        }
        console.error('❌ Error creating Users collection:', error.message);
        return false;
    }
}

async function createProjectsCollection() {
    console.log('📝 Creating Projects collection...');
    
    try {
        const collection = await makeRequest(`/v1/databases/${DATABASE_ID}/collections`, {
            collectionId: 'projects',
            name: 'Projects',
            permissions: ['read("any")', 'write("users")'],
            documentSecurity: true
        });
        
        console.log('✅ Projects collection created:', collection.$id);
        return true;
    } catch (error) {
        if (error.message.includes('409')) {
            console.log('ℹ️  Projects collection already exists');
            return true;
        }
        console.error('❌ Error creating Projects collection:', error.message);
        return false;
    }
}

async function createNotificationsCollection() {
    console.log('📝 Creating Notifications collection...');
    
    try {
        const collection = await makeRequest(`/v1/databases/${DATABASE_ID}/collections`, {
            collectionId: 'notifications',
            name: 'Notifications',
            permissions: ['read("any")', 'write("users")'],
            documentSecurity: true
        });
        
        console.log('✅ Notifications collection created:', collection.$id);
        return true;
    } catch (error) {
        if (error.message.includes('409')) {
            console.log('ℹ️  Notifications collection already exists');
            return true;
        }
        console.error('❌ Error creating Notifications collection:', error.message);
        return false;
    }
}

async function setupDatabase() {
    console.log('🚀 Setting up Appwrite database...');
    console.log('Project ID:', PROJECT_ID);
    console.log('Database ID:', DATABASE_ID);
    console.log('');
    
    const results = await Promise.all([
        createUsersCollection(),
        createProjectsCollection(),
        createNotificationsCollection()
    ]);
    
    const successCount = results.filter(r => r).length;
    
    console.log('');
    console.log('📊 Setup Results:');
    console.log(`✅ ${successCount}/3 collections created successfully`);
    
    if (successCount === 3) {
        console.log('🎉 Database setup completed successfully!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Test user registration');
        console.log('2. Check Appwrite Console for collections');
        console.log('3. Verify authentication flow');
    } else {
        console.log('⚠️  Some collections failed to create. Check API key permissions.');
    }
}

// Запуск настройки
setupDatabase().catch(console.error);
