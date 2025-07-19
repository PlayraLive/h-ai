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

console.log('💰 Adding missing currency field...');

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

async function addCurrencyField() {
    try {
        console.log('💰 Adding currency field to revenue_tracking...');
        
        const result = await makeRequest(
            `/v1/databases/${DATABASE_ID}/collections/revenue_tracking/attributes/string`,
            {
                key: 'currency',
                size: 3,
                required: false,
                default: 'USD'
            }
        );

        console.log('✅ Currency field added successfully!');
        return result;
        
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('ℹ️ Currency field already exists');
            return true;
        } else {
            console.log(`❌ Failed to add currency field: ${error.message}`);
            throw error;
        }
    }
}

async function fixCurrencyField() {
    console.log('🔧 Fixing currency field in revenue_tracking...\n');

    try {
        await addCurrencyField();
        
        console.log('\n🎉 Currency field fix completed!');
        console.log('\n📋 Updated:');
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log('│                   CURRENCY FIELD ADDED                      │');
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log('│ • revenue_tracking.currency (string, 3 chars, default USD) │');
        console.log('└─────────────────────────────────────────────────────────────┘');
        console.log('\n🔗 Now try: http://localhost:3001/en/admin/login');
        
    } catch (error) {
        console.error('❌ Fix failed:', error.message);
        process.exit(1);
    }
}

// Run the fix
fixCurrencyField();
