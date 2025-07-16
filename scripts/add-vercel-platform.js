// Simple HTTP request to add platform via Appwrite REST API
const https = require('https');

const PROJECT_ID = '687759fb003c8bd76b93';
const API_KEY = 'standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4';
const ENDPOINT = 'fra.cloud.appwrite.io';

function makeRequest(hostname, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);

        const options = {
            hostname: ENDPOINT,
            port: 443,
            path: `/v1/projects/${PROJECT_ID}/platforms`,
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

async function addVercelPlatform() {
    console.log('🚀 Adding Vercel platform to Appwrite...');

    try {
        // Add Vercel platform
        const vercelData = {
            type: 'web',
            name: 'Vercel Production',
            hostname: 'h-ai-lime.vercel.app'
        };

        const platform = await makeRequest('h-ai-lime.vercel.app', vercelData);
        console.log('✅ Vercel platform added successfully!');
        console.log('Platform ID:', platform.$id);

        // Also add localhost for development
        const localData = {
            type: 'web',
            name: 'Local Development',
            hostname: 'localhost'
        };

        const localPlatform = await makeRequest('localhost', localData);
        console.log('✅ Localhost platform added successfully!');
        console.log('Platform ID:', localPlatform.$id);

        console.log('🎉 All platforms configured! You can now deploy to Vercel.');

    } catch (error) {
        console.error('❌ Error adding platform:', error.message);

        if (error.message.includes('409')) {
            console.log('ℹ️  Platform might already exist. This is normal.');
        }
    }
}

// Run setup
addVercelPlatform();
