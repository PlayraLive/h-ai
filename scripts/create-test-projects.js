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

console.log('🚀 Creating Test Projects...');

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

async function getUsers() {
    try {
        const response = await makeRequest('/v1/users', null, 'GET');
        return response.users;
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}

async function createTestProjects() {
    console.log('👤 Getting users...');
    
    const users = await getUsers();
    
    if (users.length < 2) {
        console.log('❌ Need at least 2 users to create test projects');
        return;
    }
    
    console.log(`📋 Found ${users.length} users`);
    
    // Use first user as client, others as potential freelancers
    const client = users[0];
    console.log(`🏢 Client: ${client.name} (${client.$id})`);

    const testProjects = [
        {
            title: "AI-Powered E-commerce Chatbot",
            description: "Looking for an experienced developer to create an intelligent chatbot for our e-commerce platform. The bot should handle customer inquiries, product recommendations, and order tracking using OpenAI's GPT-4 API. Must integrate with our existing React/Node.js stack and provide seamless user experience.",
            category: "AI/ML Projects",
            budget: 2500,
            budgetType: "fixed",
            duration: "2-3 weeks",
            experienceLevel: "intermediate",
            status: "posted",
            clientId: client.$id,
            clientName: client.name,
            applicationsCount: 0,
            viewsCount: 0,
            isUrgent: false,
            isFeatured: true,
            isRemote: true,
            paymentVerified: true,
            platformFee: 0.1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            title: "Smart Home IoT Dashboard",
            description: "Need a full-stack developer to build a comprehensive IoT dashboard for smart home management. The project involves creating a React Native mobile app and web dashboard that can control various IoT devices, display real-time sensor data, and provide automation features.",
            category: "Web Development",
            budget: 3500,
            budgetType: "fixed",
            duration: "4-6 weeks",
            experienceLevel: "expert",
            status: "posted",
            clientId: client.$id,
            clientName: client.name,
            applicationsCount: 0,
            viewsCount: 0,
            isUrgent: true,
            isFeatured: false,
            isRemote: true,
            paymentVerified: true,
            platformFee: 0.1,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            title: "AI Art Generation Platform",
            description: "Seeking a creative developer to build a platform for AI-generated art. Users should be able to input text prompts and generate unique artwork using Stable Diffusion and DALL-E APIs. The platform needs user authentication, gallery features, and social sharing.",
            category: "AI/ML Projects",
            budget: 4000,
            budgetType: "fixed",
            duration: "3-4 weeks",
            experienceLevel: "intermediate",
            status: "posted",
            clientId: client.$id,
            clientName: client.name,
            applicationsCount: 0,
            viewsCount: 0,
            isUrgent: false,
            isFeatured: true,
            isRemote: true,
            paymentVerified: true,
            platformFee: 0.1,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            title: "Content Creation Automation Tool",
            description: "Looking for a developer to create an automation tool that generates social media content using AI. The tool should create posts, captions, hashtags, and even simple graphics for multiple platforms (Instagram, Twitter, LinkedIn).",
            category: "Content Creation",
            budget: 1800,
            budgetType: "fixed",
            duration: "2-3 weeks",
            experienceLevel: "entry",
            status: "posted",
            clientId: client.$id,
            clientName: client.name,
            applicationsCount: 0,
            viewsCount: 0,
            isUrgent: false,
            isFeatured: false,
            isRemote: true,
            paymentVerified: true,
            platformFee: 0.1,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            title: "Blockchain Analytics Dashboard",
            description: "Need an experienced blockchain developer to create a comprehensive analytics dashboard for DeFi protocols. The dashboard should track token prices, liquidity pools, yield farming opportunities, and provide AI-powered investment insights.",
            category: "Blockchain",
            budget: 5500,
            budgetType: "fixed",
            duration: "6-8 weeks",
            experienceLevel: "expert",
            status: "posted",
            clientId: client.$id,
            clientName: client.name,
            applicationsCount: 0,
            viewsCount: 0,
            isUrgent: true,
            isFeatured: true,
            isRemote: true,
            paymentVerified: true,
            platformFee: 0.1,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    console.log(`📁 Creating ${testProjects.length} test projects...`);

    for (const projectData of testProjects) {
        try {
            const project = await makeRequest(
                `/v1/databases/${DATABASE_ID}/collections/projects/documents`,
                {
                    documentId: generateId(),
                    data: projectData,
                    permissions: [
                        'read("any")',
                        `write("user:${client.$id}")`,
                        `update("user:${client.$id}")`,
                        `delete("user:${client.$id}")`
                    ]
                }
            );
            console.log(`  ✅ Created: ${projectData.title}`);
        } catch (error) {
            console.log(`  ❌ Failed to create "${projectData.title}": ${error.message}`);
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('');
    console.log('✅ Test projects creation complete!');
    console.log('');
    console.log('📝 Projects created:');
    console.log('   - AI-Powered E-commerce Chatbot ($2,500)');
    console.log('   - Smart Home IoT Dashboard ($3,500)');
    console.log('   - AI Art Generation Platform ($4,000)');
    console.log('   - Content Creation Automation Tool ($1,800)');
    console.log('   - Blockchain Analytics Dashboard ($5,500)');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('   1. Visit /en/jobs to see the projects');
    console.log('   2. Apply to projects as a freelancer');
    console.log('   3. Test the complete workflow');
    console.log('   4. Check admin dashboard for analytics');
}

// Run the script
createTestProjects().catch(error => {
    console.error('❌ Test projects creation failed:', error.message);
    process.exit(1);
});
