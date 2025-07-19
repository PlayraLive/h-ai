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

console.log('📊 Populating Demo Statistics Data...');

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

async function createDocument(collectionId, data) {
    try {
        const result = await makeRequest(`/v1/databases/${DATABASE_ID}/collections/${collectionId}/documents`, {
            documentId: 'unique()',
            data
        });
        return result;
    } catch (error) {
        console.error(`Error creating document in ${collectionId}:`, error.message);
        return null;
    }
}

async function populateUserAnalytics() {
    console.log('👥 Populating user analytics...');
    
    const actions = ['user_login', 'page_view', 'purchase', 'support_ticket', 'api_call'];
    const pages = ['/dashboard', '/profile', '/settings', '/billing', '/support'];
    const userIds = ['user1', 'user2', 'user3', 'admin', 'test_user'];
    
    for (let i = 0; i < 50; i++) {
        const randomDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        
        await createDocument('user_analytics', {
            user_id: userIds[Math.floor(Math.random() * userIds.length)],
            action: actions[Math.floor(Math.random() * actions.length)],
            page: pages[Math.floor(Math.random() * pages.length)],
            timestamp: randomDate.toISOString(),
            session_id: `session_${Date.now()}_${i}`,
            ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
            user_agent: 'Mozilla/5.0 (compatible; H-AI Bot)'
        });
        
        if (i % 10 === 0) {
            console.log(`  ✅ Created ${i + 1}/50 user analytics records`);
        }
    }
}

async function populateRevenueTracking() {
    console.log('💰 Populating revenue tracking...');
    
    const types = ['subscription', 'commission', 'fee', 'other'];
    const statuses = ['completed', 'pending', 'failed'];
    const userIds = ['user1', 'user2', 'user3', 'admin'];
    
    for (let i = 0; i < 30; i++) {
        const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const amount = Math.random() * 1000 + 10; // $10 - $1010
        
        await createDocument('revenue_tracking', {
            transaction_id: `txn_${Date.now()}_${i}`,
            user_id: userIds[Math.floor(Math.random() * userIds.length)],
            amount: Math.round(amount * 100) / 100,
            type: types[Math.floor(Math.random() * types.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            timestamp: randomDate.toISOString(),
            metadata: JSON.stringify({ source: 'demo_data', batch: i })
        });
        
        if (i % 10 === 0) {
            console.log(`  ✅ Created ${i + 1}/30 revenue records`);
        }
    }
}

async function populatePlatformMetrics() {
    console.log('📈 Populating platform metrics...');
    
    const metrics = [
        { name: 'conversion_rate', category: 'conversion', value: 4.2, unit: 'percent' },
        { name: 'bounce_rate', category: 'engagement', value: 32.5, unit: 'percent' },
        { name: 'avg_session_duration', category: 'engagement', value: 245, unit: 'seconds' },
        { name: 'page_load_time', category: 'performance', value: 1.8, unit: 'seconds' },
        { name: 'error_rate', category: 'performance', value: 0.5, unit: 'percent' },
        { name: 'api_response_time', category: 'performance', value: 120, unit: 'milliseconds' }
    ];
    
    for (const metric of metrics) {
        // Create multiple data points over time
        for (let i = 0; i < 7; i++) {
            const randomDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
            const value = metric.value * (1 + variance);
            
            await createDocument('platform_metrics', {
                metric_name: metric.name,
                value: Math.round(value * 100) / 100,
                unit: metric.unit,
                category: metric.category,
                timestamp: randomDate.toISOString(),
                tags: JSON.stringify(['demo', 'daily'])
            });
        }
        
        console.log(`  ✅ Created metric: ${metric.name}`);
    }
}

async function populateAdminStats() {
    console.log('📊 Populating admin statistics...');
    
    const stats = [
        { name: 'total_users', value: 156, type: 'count', period: 'total' },
        { name: 'new_users_today', value: 12, type: 'count', period: 'daily' },
        { name: 'active_sessions', value: 89, type: 'count', period: 'current' },
        { name: 'total_revenue', value: 45280, type: 'revenue', period: 'total' },
        { name: 'monthly_revenue', value: 12500, type: 'revenue', period: 'monthly' },
        { name: 'conversion_rate', value: 4.2, type: 'percentage', period: 'current' }
    ];
    
    for (const stat of stats) {
        await createDocument('admin_stats', {
            metric_name: stat.name,
            metric_value: stat.value,
            metric_type: stat.type,
            period: stat.period,
            date: new Date().toISOString(),
            metadata: JSON.stringify({ source: 'demo_data', generated: true })
        });
        
        console.log(`  ✅ Created stat: ${stat.name} = ${stat.value}`);
    }
}

async function populateDemoData() {
    console.log('🚀 Starting demo data population...\n');
    
    try {
        await populateUserAnalytics();
        console.log('');
        
        await populateRevenueTracking();
        console.log('');
        
        await populatePlatformMetrics();
        console.log('');
        
        await populateAdminStats();
        console.log('');
        
        console.log('🎉 Demo data population completed!');
        console.log('\n📋 Summary:');
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log('│                     DEMO DATA CREATED                       │');
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log('│ • 50 user analytics records                                │');
        console.log('│ • 30 revenue tracking records                              │');
        console.log('│ • 42 platform metrics (6 metrics × 7 days)                │');
        console.log('│ • 6 admin statistics records                               │');
        console.log('└─────────────────────────────────────────────────────────────┘');
        console.log('\n🔗 Next: Visit http://localhost:3001/en/admin/login');
        console.log('   Login: admin@h-ai.com / AdminH-AI2024!');
        
    } catch (error) {
        console.error('❌ Error populating demo data:', error.message);
        process.exit(1);
    }
}

// Run the population
populateDemoData();
