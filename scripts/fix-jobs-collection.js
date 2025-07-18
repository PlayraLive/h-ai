#!/usr/bin/env node

const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Configuration
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !DATABASE_ID || !API_KEY) {
    console.error('❌ Missing required environment variables');
    console.log('Required: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, NEXT_PUBLIC_APPWRITE_DATABASE_ID, APPWRITE_API_KEY');
    process.exit(1);
}

console.log('🔧 Fixing Jobs Collection Attributes...');
console.log(`📍 Endpoint: ${ENDPOINT}`);
console.log(`📍 Project: ${PROJECT_ID}`);
console.log(`📍 Database: ${DATABASE_ID}`);

// Helper function to make API requests
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
                        reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || responseData}`));
                    }
                } catch (e) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(responseData);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                    }
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

// Function to create an attribute
async function createAttribute(collectionId, attribute) {
    const { key, type, size, required, array, default: defaultValue } = attribute;
    
    try {
        let endpoint;
        let payload = {
            key,
            required: required || false,
            array: array || false
        };

        if (defaultValue !== undefined) {
            payload.default = defaultValue;
        }

        switch (type) {
            case 'string':
                endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/string`;
                payload.size = size || 255;
                break;
            case 'integer':
                endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/integer`;
                break;
            case 'float':
                endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/float`;
                break;
            case 'boolean':
                endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/boolean`;
                break;
            case 'datetime':
                endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/datetime`;
                break;
            case 'enum':
                endpoint = `/v1/databases/${DATABASE_ID}/collections/${collectionId}/attributes/enum`;
                payload.elements = attribute.elements;
                break;
            default:
                throw new Error(`Unknown attribute type: ${type}`);
        }

        await makeRequest(endpoint, payload);
        console.log(`✅ Created attribute: ${key} (${type})`);
        
    } catch (error) {
        if (error.message.includes('409')) {
            console.log(`ℹ️  Attribute ${key} already exists`);
        } else {
            console.log(`❌ Error creating attribute ${key}: ${error.message}`);
        }
    }
}

// Only the missing critical attributes
const jobsAttributes = [
    // Essential missing attributes only
    { key: 'currency', type: 'string', size: 10, required: false },
    { key: 'location', type: 'string', size: 255, required: false },
    { key: 'applicationsCount', type: 'integer', required: false },
    { key: 'viewsCount', type: 'integer', required: false },
    { key: 'featured', type: 'boolean', required: false },
    { key: 'urgent', type: 'boolean', required: false }
];

async function fixJobsCollection() {
    console.log('🔧 Adding missing attributes to jobs collection...');
    
    for (const attribute of jobsAttributes) {
        await createAttribute('jobs', attribute);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('✅ Jobs collection attributes updated!');
    console.log('');
    console.log('🎉 You can now create jobs successfully!');
    console.log('💡 Try creating a job at: http://localhost:3000/en/jobs/create');
}

// Run the script
fixJobsCollection().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
});
