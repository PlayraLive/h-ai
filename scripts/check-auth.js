#!/usr/bin/env node

const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Configuration
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

console.log('🔐 Checking Authentication System...');

// Helper function to make API requests
function makeRequest(path, data = null, method = 'GET') {
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

async function checkUsers() {
    try {
        console.log('👥 Checking users...');
        
        const response = await makeRequest('/v1/users');
        
        console.log('✅ Users found:', response.total);
        
        if (response.users.length > 0) {
            console.log('📄 User list:');
            response.users.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.name} (${user.$id}) - ${user.email}`);
                console.log(`      Status: ${user.status ? 'Active' : 'Inactive'}`);
                console.log(`      Created: ${user.$createdAt}`);
            });
        }
        
        return response.users;
        
    } catch (error) {
        console.error('❌ Failed to check users:', error.message);
        return [];
    }
}

async function createTestUser() {
    try {
        console.log('👤 Creating test user...');
        
        const testUser = await makeRequest('/v1/users', {
            userId: 'test-user-123',
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User'
        }, 'POST');
        
        console.log('✅ Test user created:', testUser.name, testUser.$id);
        return testUser;
        
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('ℹ️ Test user already exists');
            return null;
        } else {
            console.error('❌ Failed to create test user:', error.message);
            return null;
        }
    }
}

async function checkAuth() {
    console.log('🔐 Running authentication checks...\n');
    
    const users = await checkUsers();
    console.log('');
    
    if (users.length === 0) {
        console.log('👤 No users found, creating test user...');
        await createTestUser();
        console.log('');
    }
    
    console.log('✅ Authentication system check complete!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Make sure you are logged in as a valid user');
    console.log('   2. Check browser console for authentication errors');
    console.log('   3. Try the Test tab in the dashboard');
}

// Run the check
checkAuth().catch(error => {
    console.error('❌ Auth check failed:', error.message);
    process.exit(1);
});
