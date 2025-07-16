// Получение списка баз данных в Appwrite
const https = require('https');

const PROJECT_ID = '687759fb003c8bd76b93';
const API_KEY = 'standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4';
const ENDPOINT = 'fra.cloud.appwrite.io';

function makeRequest(path, method = 'GET') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: ENDPOINT,
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
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

        req.end();
    });
}

async function listDatabases() {
    console.log('📋 Getting list of databases...');
    console.log('Project ID:', PROJECT_ID);
    console.log('');
    
    try {
        const response = await makeRequest('/v1/databases');
        
        console.log('✅ Found databases:');
        console.log('Total:', response.total);
        console.log('');
        
        if (response.databases && response.databases.length > 0) {
            response.databases.forEach((db, index) => {
                console.log(`${index + 1}. Database:`);
                console.log(`   ID: ${db.$id}`);
                console.log(`   Name: ${db.name}`);
                console.log(`   Created: ${db.$createdAt}`);
                console.log('');
            });
            
            // Используем первую найденную базу данных
            const firstDb = response.databases[0];
            console.log('🎯 Using database:', firstDb.$id);
            console.log('');
            console.log('📝 Update your .env.local:');
            console.log(`NEXT_PUBLIC_APPWRITE_DATABASE_ID=${firstDb.$id}`);
            
            return firstDb.$id;
        } else {
            console.log('❌ No databases found');
            console.log('');
            console.log('📋 Manual steps:');
            console.log('1. Go to Appwrite Console → Databases');
            console.log('2. Click "Create Database"');
            console.log('3. Name: AI Freelance Platform');
            console.log('4. Copy the Database ID to .env.local');
            return null;
        }
    } catch (error) {
        console.error('❌ Error listing databases:', error.message);
        return null;
    }
}

// Запуск
listDatabases().catch(console.error);
