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

console.log('📊 Setting up Admin Statistics Collections...');

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

// Generate unique ID
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function createCollection(collectionData) {
    try {
        console.log(`📋 Creating collection: ${collectionData.name}...`);
        
        const collection = await makeRequest('/v1/databases/' + DATABASE_ID + '/collections', {
            collectionId: collectionData.collectionId,
            name: collectionData.name,
            permissions: [
                'read("any")',
                'create("any")',
                'update("any")',
                'delete("any")'
            ]
        });

        console.log(`✅ Collection "${collectionData.name}" created with ID: ${collection.$id}`);

        // Create attributes
        for (const attribute of collectionData.attributes) {
            try {
                console.log(`  📝 Adding attribute: ${attribute.key}...`);
                
                let attributeData = {
                    key: attribute.key,
                    required: attribute.required || false,
                    default: attribute.default
                };

                let endpoint = '';
                if (attribute.type === 'string') {
                    endpoint = `/v1/databases/${DATABASE_ID}/collections/${collection.$id}/attributes/string`;
                    attributeData.size = attribute.size || 255;
                } else if (attribute.type === 'integer') {
                    endpoint = `/v1/databases/${DATABASE_ID}/collections/${collection.$id}/attributes/integer`;
                    attributeData.min = attribute.min;
                    attributeData.max = attribute.max;
                } else if (attribute.type === 'float') {
                    endpoint = `/v1/databases/${DATABASE_ID}/collections/${collection.$id}/attributes/float`;
                    attributeData.min = attribute.min;
                    attributeData.max = attribute.max;
                } else if (attribute.type === 'boolean') {
                    endpoint = `/v1/databases/${DATABASE_ID}/collections/${collection.$id}/attributes/boolean`;
                } else if (attribute.type === 'datetime') {
                    endpoint = `/v1/databases/${DATABASE_ID}/collections/${collection.$id}/attributes/datetime`;
                }

                await makeRequest(endpoint, attributeData);
                console.log(`    ✅ Attribute "${attribute.key}" added`);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`    ℹ️ Attribute "${attribute.key}" already exists`);
                } else {
                    console.log(`    ❌ Failed to add attribute "${attribute.key}": ${error.message}`);
                }
            }
        }

        return collection;
        
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log(`✅ Collection "${collectionData.name}" already exists`);
            return { $id: collectionData.collectionId };
        } else {
            console.log(`❌ Failed to create collection "${collectionData.name}": ${error.message}`);
            throw error;
        }
    }
}

async function setupAdminCollections() {
    console.log('📊 Creating admin statistics collections...\n');

    const collections = [
        {
            collectionId: 'admin_stats',
            name: 'Admin Statistics',
            attributes: [
                { key: 'metric_name', type: 'string', size: 100, required: true },
                { key: 'metric_value', type: 'integer', required: true },
                { key: 'metric_type', type: 'string', size: 50, required: true }, // 'count', 'revenue', 'percentage'
                { key: 'period', type: 'string', size: 20, required: true }, // 'daily', 'weekly', 'monthly', 'total'
                { key: 'date', type: 'datetime', required: true },
                { key: 'metadata', type: 'string', size: 1000, required: false }
            ]
        },
        {
            collectionId: 'user_analytics',
            name: 'User Analytics',
            attributes: [
                { key: 'user_id', type: 'string', size: 50, required: true },
                { key: 'action', type: 'string', size: 100, required: true },
                { key: 'page', type: 'string', size: 200, required: false },
                { key: 'timestamp', type: 'datetime', required: true },
                { key: 'session_id', type: 'string', size: 100, required: false },
                { key: 'ip_address', type: 'string', size: 45, required: false },
                { key: 'user_agent', type: 'string', size: 500, required: false }
            ]
        },
        {
            collectionId: 'platform_metrics',
            name: 'Platform Metrics',
            attributes: [
                { key: 'metric_name', type: 'string', size: 100, required: true },
                { key: 'value', type: 'float', required: true },
                { key: 'unit', type: 'string', size: 20, required: false },
                { key: 'category', type: 'string', size: 50, required: true },
                { key: 'timestamp', type: 'datetime', required: true },
                { key: 'tags', type: 'string', size: 500, required: false }
            ]
        },
        {
            collectionId: 'revenue_tracking',
            name: 'Revenue Tracking',
            attributes: [
                { key: 'transaction_id', type: 'string', size: 100, required: true },
                { key: 'user_id', type: 'string', size: 50, required: true },
                { key: 'amount', type: 'float', required: true },
                { key: 'currency', type: 'string', size: 3, required: true, default: 'USD' },
                { key: 'type', type: 'string', size: 50, required: true }, // 'subscription', 'commission', 'fee'
                { key: 'status', type: 'string', size: 20, required: true }, // 'pending', 'completed', 'failed'
                { key: 'timestamp', type: 'datetime', required: true },
                { key: 'metadata', type: 'string', size: 1000, required: false }
            ]
        }
    ];

    for (const collectionData of collections) {
        await createCollection(collectionData);
        console.log(''); // Empty line for readability
    }

    console.log('🎉 Admin collections setup completed!');
    console.log('\n📋 Created Collections:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                     ADMIN COLLECTIONS                       │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ • admin_stats - General platform statistics                │');
    console.log('│ • user_analytics - User behavior tracking                  │');
    console.log('│ • platform_metrics - Performance metrics                   │');
    console.log('│ • revenue_tracking - Financial data                        │');
    console.log('└─────────────────────────────────────────────────────────────┘');
}

// Run the setup
setupAdminCollections().catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
});
