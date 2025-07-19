#!/usr/bin/env node

const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Configuration
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
    console.error('❌ Missing required environment variables');
    console.error('Make sure you have NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, and APPWRITE_API_KEY in your .env.local');
    process.exit(1);
}

console.log('👑 Creating Admin User for H-AI Platform...');

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

// Generate unique ID
function generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

async function createAdminUser() {
    const adminUsers = [
        {
            email: 'admin@h-ai.com',
            password: 'AdminH-AI2024!',
            name: 'H-AI Admin'
        },
        {
            email: 'sacralprojects8@gmail.com',
            password: 'SacralAdmin2024!',
            name: 'Sacral Admin'
        }
    ];

    console.log('👤 Creating admin users...');

    for (const adminData of adminUsers) {
        try {
            // Check if user already exists
            console.log(`\n🔍 Checking if ${adminData.email} already exists...`);
            
            try {
                const existingUsers = await makeRequest('/v1/users', null, 'GET');
                const userExists = existingUsers.users.some(user => user.email === adminData.email);
                
                if (userExists) {
                    console.log(`✅ User ${adminData.email} already exists - skipping creation`);
                    continue;
                }
            } catch (error) {
                console.log(`ℹ️ Could not check existing users, proceeding with creation...`);
            }

            // Create admin user
            console.log(`👑 Creating admin user: ${adminData.email}...`);
            
            const user = await makeRequest('/v1/users', {
                userId: generateId(),
                email: adminData.email,
                password: adminData.password,
                name: adminData.name
            });

            console.log(`✅ Successfully created admin user: ${adminData.name}`);
            console.log(`   📧 Email: ${adminData.email}`);
            console.log(`   🔑 Password: ${adminData.password}`);
            console.log(`   🆔 User ID: ${user.$id}`);

        } catch (error) {
            if (error.message.includes('already exists') || error.message.includes('409')) {
                console.log(`✅ User ${adminData.email} already exists`);
            } else {
                console.log(`❌ Failed to create user ${adminData.email}: ${error.message}`);
            }
        }
    }

    console.log('\n🎉 Admin user creation process completed!');
    console.log('\n📋 Admin Access Information:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                     ADMIN CREDENTIALS                       │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ Email: admin@h-ai.com                                      │');
    console.log('│ Password: AdminH-AI2024!                                   │');
    console.log('│                                                             │');
    console.log('│ Email: sacralprojects8@gmail.com                           │');
    console.log('│ Password: SacralAdmin2024!                                 │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log('\n🔗 Next Steps:');
    console.log('   1. Go to: http://localhost:3001/en/auth/login');
    console.log('   2. Login with admin@h-ai.com / AdminH-AI2024!');
    console.log('   3. Navigate to: http://localhost:3001/en/admin');
    console.log('   4. Enjoy full admin access! 🚀');
    console.log('\n⚠️  Security Note:');
    console.log('   - Change these passwords in production');
    console.log('   - Use strong, unique passwords');
    console.log('   - Enable 2FA if available');
}

// Run the script
createAdminUser().catch(error => {
    console.error('❌ Admin user creation failed:', error.message);
    process.exit(1);
});
