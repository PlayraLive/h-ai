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
    process.exit(1);
}

console.log('🧪 Testing Portfolio Creation...');

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

// Test portfolio item data
const testPortfolioItem = {
    title: 'Test AI Portfolio Item',
    description: 'This is a test portfolio item created via API to verify the system is working correctly.',
    category: 'Web Development',
    subcategory: 'AI Tools',
    images: ['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
    videoUrl: '',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com/test/repo',
    aiServices: ['ChatGPT', 'GitHub Copilot'],
    skills: ['React', 'TypeScript', 'Next.js'],
    tools: ['VS Code', 'Figma'],
    tags: ['AI', 'Web', 'Test'],
    userId: 'test-user-id',
    userName: 'Test User',
    userAvatar: null,
    likesCount: 0,
    viewsCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    averageRating: 0,
    ratingsCount: 0,
    status: 'published',
    featured: false,
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString()
};

async function testPortfolioCreation() {
    try {
        console.log('📝 Testing portfolio item creation...');
        
        // Test creating a portfolio item
        const portfolioItem = await makeRequest(
            `/v1/databases/${DATABASE_ID}/collections/portfolio_items/documents`,
            {
                documentId: generateId(),
                data: testPortfolioItem,
                permissions: [
                    'read("any")',
                    `write("user:${testPortfolioItem.userId}")`,
                    `update("user:${testPortfolioItem.userId}")`,
                    `delete("user:${testPortfolioItem.userId}")`
                ]
            }
        );
        
        console.log('✅ Portfolio item created successfully!');
        console.log('📄 Item details:', {
            id: portfolioItem.$id,
            title: portfolioItem.title,
            category: portfolioItem.category,
            createdAt: portfolioItem.$createdAt
        });
        
        // Test reading the item back
        console.log('📖 Testing portfolio item retrieval...');
        const retrievedItem = await makeRequest(
            `/v1/databases/${DATABASE_ID}/collections/portfolio_items/documents/${portfolioItem.$id}`,
            null,
            'GET'
        );
        
        console.log('✅ Portfolio item retrieved successfully!');
        console.log('📄 Retrieved item:', {
            id: retrievedItem.$id,
            title: retrievedItem.title,
            skills: retrievedItem.skills,
            aiServices: retrievedItem.aiServices
        });
        
        // Clean up - delete the test item
        console.log('🧹 Cleaning up test data...');
        await makeRequest(
            `/v1/databases/${DATABASE_ID}/collections/portfolio_items/documents/${portfolioItem.$id}`,
            null,
            'DELETE'
        );
        
        console.log('✅ Test data cleaned up successfully!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Portfolio creation test failed:', error.message);
        console.error('Error details:', error);
        return false;
    }
}

async function testCollectionAccess() {
    try {
        console.log('📋 Testing collection access...');
        
        // List existing portfolio items
        const response = await makeRequest(
            `/v1/databases/${DATABASE_ID}/collections/portfolio_items/documents`,
            null,
            'GET'
        );
        
        console.log('✅ Collection access successful!');
        console.log(`📊 Found ${response.total} existing portfolio items`);
        
        if (response.documents.length > 0) {
            console.log('📄 Sample items:');
            response.documents.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.title} (${item.category})`);
            });
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Collection access test failed:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🧪 Running portfolio system tests...\n');
    
    const collectionTest = await testCollectionAccess();
    console.log('');
    
    const creationTest = await testPortfolioCreation();
    console.log('');
    
    if (collectionTest && creationTest) {
        console.log('🎉 All tests passed! Portfolio system is working correctly.');
        console.log('');
        console.log('✅ You can now:');
        console.log('   1. Create portfolio items through the UI');
        console.log('   2. Upload images to storage');
        console.log('   3. View and share portfolio items');
    } else {
        console.log('❌ Some tests failed. Please check the errors above.');
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
});
