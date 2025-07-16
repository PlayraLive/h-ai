// Создание базы данных в Appwrite
const https = require('https');

const PROJECT_ID = '687759fb003c8bd76b93';
const DATABASE_ID = 'y687796e3001241f7de17';
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

async function createDatabase() {
    console.log('🗄️  Creating Appwrite database...');
    console.log('Project ID:', PROJECT_ID);
    console.log('Database ID:', DATABASE_ID);
    console.log('');
    
    try {
        const database = await makeRequest('/v1/databases', {
            databaseId: DATABASE_ID,
            name: 'AI Freelance Platform'
        });
        
        console.log('✅ Database created successfully!');
        console.log('Database ID:', database.$id);
        console.log('Database Name:', database.name);
        console.log('');
        console.log('🎉 Now you can run: node scripts/setup-database.js');
        
        return true;
    } catch (error) {
        if (error.message.includes('409')) {
            console.log('ℹ️  Database already exists');
            console.log('✅ You can proceed with: node scripts/setup-database.js');
            return true;
        } else if (error.message.includes('401')) {
            console.log('❌ API key does not have permission to create databases');
            console.log('');
            console.log('📋 Manual steps:');
            console.log('1. Go to Appwrite Console → Databases');
            console.log('2. Click "Create Database"');
            console.log('3. Database ID: y687796e3001241f7de17');
            console.log('4. Name: AI Freelance Platform');
            console.log('5. Then run: node scripts/setup-database.js');
            return false;
        } else {
            console.error('❌ Error creating database:', error.message);
            return false;
        }
    }
}

// Запуск создания базы данных
createDatabase().catch(console.error);
