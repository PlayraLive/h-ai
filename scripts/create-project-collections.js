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

console.log('🚀 Creating Project Management Collections...');

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

// Project management collections
const collections = [
    {
        collectionId: 'projects',
        name: 'Projects',
        permissions: [
            'read("any")',
            'create("users")',
            'update("users")',
            'delete("users")'
        ],
        documentSecurity: true,
        enabled: true,
        attributes: [
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 5000, required: true },
            { key: 'category', type: 'string', size: 100, required: true },
            { key: 'subcategory', type: 'string', size: 100, required: false },
            { key: 'budget', type: 'double', required: true },
            { key: 'budgetType', type: 'string', size: 20, required: true },
            { key: 'duration', type: 'string', size: 100, required: true },
            { key: 'skillsRequired', type: 'string', size: 100, required: false, array: true },
            { key: 'aiToolsRequired', type: 'string', size: 100, required: false, array: true },
            { key: 'experienceLevel', type: 'string', size: 20, required: true },
            { key: 'status', type: 'string', size: 20, required: true },
            { key: 'clientId', type: 'string', size: 50, required: true },
            { key: 'clientName', type: 'string', size: 100, required: true },
            { key: 'clientAvatar', type: 'string', size: 500, required: false },
            { key: 'assignedFreelancerId', type: 'string', size: 50, required: false },
            { key: 'assignedFreelancerName', type: 'string', size: 100, required: false },
            { key: 'applicationsCount', type: 'integer', required: true, default: 0 },
            { key: 'viewsCount', type: 'integer', required: true, default: 0 },
            { key: 'isUrgent', type: 'boolean', required: true, default: false },
            { key: 'isFeatured', type: 'boolean', required: true, default: false },
            { key: 'attachments', type: 'string', size: 500, required: false, array: true },
            { key: 'tags', type: 'string', size: 50, required: false, array: true },
            { key: 'location', type: 'string', size: 100, required: false },
            { key: 'isRemote', type: 'boolean', required: true, default: true },
            { key: 'paymentVerified', type: 'boolean', required: true, default: false },
            { key: 'escrowAmount', type: 'double', required: false },
            { key: 'platformFee', type: 'double', required: true, default: 0.1 },
            { key: 'freelancerEarnings', type: 'double', required: false },
            { key: 'completedAt', type: 'datetime', required: false },
            { key: 'paidAt', type: 'datetime', required: false },
            { key: 'deadlineAt', type: 'datetime', required: false },
            { key: 'createdAt', type: 'datetime', required: true },
            { key: 'updatedAt', type: 'datetime', required: true }
        ]
    },
    {
        collectionId: 'project_applications',
        name: 'Project Applications',
        permissions: [
            'read("users")',
            'create("users")',
            'update("users")',
            'delete("users")'
        ],
        documentSecurity: true,
        enabled: true,
        attributes: [
            { key: 'projectId', type: 'string', size: 50, required: true },
            { key: 'projectTitle', type: 'string', size: 255, required: true },
            { key: 'freelancerId', type: 'string', size: 50, required: true },
            { key: 'freelancerName', type: 'string', size: 100, required: true },
            { key: 'freelancerAvatar', type: 'string', size: 500, required: false },
            { key: 'freelancerRating', type: 'double', required: true, default: 0 },
            { key: 'coverLetter', type: 'string', size: 2000, required: true },
            { key: 'proposedBudget', type: 'double', required: true },
            { key: 'proposedDuration', type: 'string', size: 100, required: true },
            { key: 'portfolioItems', type: 'string', size: 50, required: false, array: true },
            { key: 'status', type: 'string', size: 20, required: true },
            { key: 'appliedAt', type: 'datetime', required: true },
            { key: 'respondedAt', type: 'datetime', required: false },
            { key: 'clientResponse', type: 'string', size: 1000, required: false }
        ]
    },
    {
        collectionId: 'project_payments',
        name: 'Project Payments',
        permissions: [
            'read("users")',
            'create("users")',
            'update("users")',
            'delete("users")'
        ],
        documentSecurity: true,
        enabled: true,
        attributes: [
            { key: 'projectId', type: 'string', size: 50, required: true },
            { key: 'milestoneId', type: 'string', size: 50, required: false },
            { key: 'clientId', type: 'string', size: 50, required: true },
            { key: 'freelancerId', type: 'string', size: 50, required: true },
            { key: 'amount', type: 'double', required: true },
            { key: 'platformFee', type: 'double', required: true },
            { key: 'freelancerEarnings', type: 'double', required: true },
            { key: 'stripePaymentIntentId', type: 'string', size: 100, required: true },
            { key: 'stripeTransferId', type: 'string', size: 100, required: false },
            { key: 'status', type: 'string', size: 20, required: true },
            { key: 'paidAt', type: 'datetime', required: false },
            { key: 'refundedAt', type: 'datetime', required: false },
            { key: 'failureReason', type: 'string', size: 500, required: false }
        ]
    },
    {
        collectionId: 'platform_analytics',
        name: 'Platform Analytics',
        permissions: [
            'read("role:admin")',
            'create("role:admin")',
            'update("role:admin")',
            'delete("role:admin")'
        ],
        documentSecurity: false,
        enabled: true,
        attributes: [
            { key: 'date', type: 'datetime', required: true },
            { key: 'totalUsers', type: 'integer', required: true, default: 0 },
            { key: 'freelancers', type: 'integer', required: true, default: 0 },
            { key: 'clients', type: 'integer', required: true, default: 0 },
            { key: 'newRegistrations', type: 'integer', required: true, default: 0 },
            { key: 'activeProjects', type: 'integer', required: true, default: 0 },
            { key: 'completedProjects', type: 'integer', required: true, default: 0 },
            { key: 'totalRevenue', type: 'double', required: true, default: 0 },
            { key: 'platformRevenue', type: 'double', required: true, default: 0 },
            { key: 'freelancerEarnings', type: 'double', required: true, default: 0 },
            { key: 'averageProjectValue', type: 'double', required: true, default: 0 },
            { key: 'conversionRate', type: 'double', required: true, default: 0 }
        ]
    }
];

async function createCollection(collectionData) {
    try {
        // Create collection
        const collection = await makeRequest(
            `/v1/databases/${DATABASE_ID}/collections`,
            {
                collectionId: collectionData.collectionId,
                name: collectionData.name,
                permissions: collectionData.permissions,
                documentSecurity: collectionData.documentSecurity,
                enabled: collectionData.enabled
            }
        );
        
        console.log(`✅ Created collection: ${collectionData.name}`);
        
        // Create attributes
        for (const attr of collectionData.attributes) {
            try {
                let attributeData = {
                    key: attr.key,
                    required: attr.required
                };
                
                if (attr.default !== undefined) {
                    attributeData.default = attr.default;
                }
                
                if (attr.array) {
                    attributeData.array = true;
                }
                
                let endpoint = '';
                
                switch (attr.type) {
                    case 'string':
                        endpoint = 'string';
                        attributeData.size = attr.size;
                        break;
                    case 'integer':
                        endpoint = 'integer';
                        break;
                    case 'double':
                        endpoint = 'float';
                        break;
                    case 'boolean':
                        endpoint = 'boolean';
                        break;
                    case 'datetime':
                        endpoint = 'datetime';
                        break;
                }
                
                await makeRequest(
                    `/v1/databases/${DATABASE_ID}/collections/${collectionData.collectionId}/attributes/${endpoint}`,
                    attributeData
                );
                
                console.log(`  ✓ Added attribute: ${attr.key} (${attr.type})`);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                console.log(`  ❌ Failed to create attribute ${attr.key}: ${error.message}`);
            }
        }
        
        return collection;
    } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('409')) {
            console.log(`ℹ️ Collection already exists: ${collectionData.name}`);
            return null;
        } else {
            console.log(`❌ Failed to create collection "${collectionData.name}": ${error.message}`);
            return null;
        }
    }
}

async function createProjectCollections() {
    console.log('🚀 Creating project management collections...');
    
    for (const collectionData of collections) {
        await createCollection(collectionData);
        // Delay between collections
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('');
    console.log('✅ Project management collections setup complete!');
    console.log('');
    console.log('📝 Collections created:');
    console.log('   - projects: Main project listings');
    console.log('   - project_applications: Freelancer applications');
    console.log('   - project_payments: Payment tracking with Stripe');
    console.log('   - platform_analytics: Admin analytics data');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('   1. Set up Stripe integration');
    console.log('   2. Create admin dashboard');
    console.log('   3. Test project application flow');
}

// Run the script
createProjectCollections().catch(error => {
    console.error('❌ Project collections setup failed:', error.message);
    process.exit(1);
});
