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

console.log('🗄️ Setting up Appwrite Storage...');

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

// Storage buckets to create
const buckets = [
    {
        bucketId: 'portfolio-images',
        name: 'Portfolio Images',
        permissions: [
            'read("any")',
            'create("users")',
            'update("users")',
            'delete("users")'
        ],
        fileSecurity: true,
        enabled: true,
        maximumFileSize: 10485760, // 10MB
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        compression: 'gzip',
        encryption: true,
        antivirus: true
    },
    {
        bucketId: 'profile-images',
        name: 'Profile Images',
        permissions: [
            'read("any")',
            'create("users")',
            'update("users")',
            'delete("users")'
        ],
        fileSecurity: true,
        enabled: true,
        maximumFileSize: 5242880, // 5MB
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
        compression: 'gzip',
        encryption: true,
        antivirus: true
    },
    {
        bucketId: 'job-attachments',
        name: 'Job Attachments',
        permissions: [
            'read("users")',
            'create("users")',
            'update("users")',
            'delete("users")'
        ],
        fileSecurity: true,
        enabled: true,
        maximumFileSize: 20971520, // 20MB
        allowedFileExtensions: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'zip'],
        compression: 'gzip',
        encryption: true,
        antivirus: true
    }
];

async function createBucket(bucketData) {
    try {
        const bucket = await makeRequest(
            '/v1/storage/buckets',
            bucketData
        );
        console.log(`✅ Created storage bucket: ${bucketData.name} (${bucketData.bucketId})`);
        return bucket;
    } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('409')) {
            console.log(`ℹ️ Storage bucket already exists: ${bucketData.name} (${bucketData.bucketId})`);
            return null;
        } else {
            console.log(`❌ Failed to create storage bucket "${bucketData.name}": ${error.message}`);
            return null;
        }
    }
}

async function listBuckets() {
    try {
        const response = await makeRequest('/v1/storage/buckets', null, 'GET');
        console.log('📋 Existing storage buckets:');
        response.buckets.forEach(bucket => {
            console.log(`   - ${bucket.name} (${bucket.$id})`);
        });
        return response.buckets;
    } catch (error) {
        console.log(`❌ Failed to list storage buckets: ${error.message}`);
        return [];
    }
}

async function setupStorage() {
    console.log('🗄️ Setting up storage buckets...');
    
    // List existing buckets
    await listBuckets();
    console.log('');
    
    // Create new buckets
    for (const bucketData of buckets) {
        await createBucket(bucketData);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('');
    console.log('✅ Storage setup complete!');
    console.log('');
    console.log('📝 Storage buckets created:');
    console.log('   - portfolio-images: For portfolio project images');
    console.log('   - profile-images: For user profile pictures');
    console.log('   - job-attachments: For job-related files');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('   1. Test image upload in portfolio creation');
    console.log('   2. Verify file permissions are working');
    console.log('   3. Check file compression and optimization');
}

// Run the script
setupStorage().catch(error => {
    console.error('❌ Storage setup failed:', error.message);
    process.exit(1);
});
