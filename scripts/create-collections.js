// Simple script to create basic collections via REST API
const https = require('https');

const PROJECT_ID = '687759fb003c8bd76b93';
const DATABASE_ID = 'y687796e3001241f7de17';
const API_KEY = 'standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4';
const ENDPOINT = 'fra.cloud.appwrite.io';

function makeRequest(path, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: ENDPOINT,
            port: 443,
            path: path,
            method: 'POST',
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

async function createCollections() {
    console.log('🚀 Creating Appwrite collections...');

    try {
        // Create Users collection
        const usersCollection = await makeRequest(`/v1/databases/${DATABASE_ID}/collections`, {
            collectionId: 'users',
            name: 'Users',
            permissions: ['read("any")', 'write("users")'],
            documentSecurity: true
        });
        console.log('✅ Users collection created:', usersCollection.$id);

        // Create Projects collection
        const projectsCollection = await makeRequest(`/v1/databases/${DATABASE_ID}/collections`, {
            collectionId: 'projects',
            name: 'Projects',
            permissions: ['read("any")', 'write("users")'],
            documentSecurity: true
        });
        console.log('✅ Projects collection created:', projectsCollection.$id);

        // Create Notifications collection
        const notificationsCollection = await makeRequest(`/v1/databases/${DATABASE_ID}/collections`, {
            collectionId: 'notifications',
            name: 'Notifications',
            permissions: ['read("any")', 'write("users")'],
            documentSecurity: true
        });
        console.log('✅ Notifications collection created:', notificationsCollection.$id);

        console.log('🎉 Basic collections created successfully!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Add attributes to collections in Appwrite Console');
        console.log('2. Set up Google OAuth');
        console.log('3. Create storage buckets');
        console.log('4. Test authentication');

    } catch (error) {
        console.error('❌ Error creating collections:', error.message);
        
        if (error.message.includes('409')) {
            console.log('ℹ️  Collections might already exist. This is normal.');
        }
        
        if (error.message.includes('401')) {
            console.log('ℹ️  API key needs more permissions. Please check Appwrite Console.');
        }
    }
}

// Run setup
createCollections();
