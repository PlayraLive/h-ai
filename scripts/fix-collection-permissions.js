#!/usr/bin/env node

const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Configuration
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

console.log('🔧 Fixing Collection Permissions...');

// Helper function to make HTTP requests
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
                        reject(new Error(parsed.message || `HTTP ${res.statusCode}`));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${responseData}`));
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

async function updateCollectionPermissions(collectionId, collectionName) {
    try {
        console.log(`🔧 Updating permissions for: ${collectionName}...`);
        
        const result = await makeRequest(
            `/v1/databases/${DATABASE_ID}/collections/${collectionId}`, 
            {
                name: collectionName,
                permissions: [
                    'read("any")',
                    'create("any")',
                    'update("any")',
                    'delete("any")'
                ]
            },
            'PUT'
        );

        console.log(`✅ Updated permissions for: ${collectionName}`);
        return result;
        
    } catch (error) {
        console.log(`❌ Failed to update permissions for ${collectionName}: ${error.message}`);
        return null;
    }
}

async function fixPermissions() {
    console.log('🔧 Fixing admin collection permissions...\n');

    const collections = [
        { id: 'admin_stats', name: 'Admin Statistics' },
        { id: 'user_analytics', name: 'User Analytics' },
        { id: 'platform_metrics', name: 'Platform Metrics' },
        { id: 'revenue_tracking', name: 'Revenue Tracking' }
    ];

    for (const collection of collections) {
        await updateCollectionPermissions(collection.id, collection.name);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 Permission fixes completed!');
    console.log('\n📋 Updated Collections:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                   PERMISSIONS UPDATED                       │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ • admin_stats - read/create/update/delete("any")            │');
    console.log('│ • user_analytics - read/create/update/delete("any")         │');
    console.log('│ • platform_metrics - read/create/update/delete("any")       │');
    console.log('│ • revenue_tracking - read/create/update/delete("any")       │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log('\n🔗 Now try: http://localhost:3001/en/admin/login');
}

// Run the fix
fixPermissions().catch(error => {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
});
