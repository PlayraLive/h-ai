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

console.log('👤 Creating Portfolio for Current User...');

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

async function createPortfolioForUser(user) {
    const portfolioItems = [
        {
            title: "My First AI Project",
            description: "An amazing AI-powered web application that I built using modern technologies. This project showcases my skills in React, Node.js, and AI integration. The application features real-time data processing, intelligent recommendations, and a beautiful user interface.",
            category: "Web Development",
            subcategory: "AI Integration",
            images: [
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"
            ],
            thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
            videoUrl: "",
            liveUrl: "https://my-ai-project.vercel.app",
            githubUrl: "https://github.com/user/my-ai-project",
            aiServices: ["OpenAI API", "ChatGPT", "GitHub Copilot"],
            skills: ["React", "Node.js", "TypeScript", "AI/ML", "Next.js"],
            tools: ["VS Code", "Figma", "Vercel"],
            tags: ["AI", "Web Development", "React", "Innovation"],
            userId: user.$id,
            userName: user.name,
            userAvatar: user.avatar || null,
            likesCount: 15,
            viewsCount: 89,
            commentsCount: 3,
            sharesCount: 7,
            averageRating: 4.5,
            ratingsCount: 8,
            status: "published",
            featured: false,
            createdAt: new Date().toISOString(),
            publishedAt: new Date().toISOString()
        },
        {
            title: "Creative AI Art Generator",
            description: "A stunning AI art generation tool that creates unique digital artwork based on text prompts. Built with Stable Diffusion and a custom React frontend. Users can generate, customize, and download high-quality AI-generated images.",
            category: "AI/ML Projects",
            subcategory: "Generative Art",
            images: [
                "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800",
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"
            ],
            thumbnailUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400",
            videoUrl: "",
            liveUrl: "https://ai-art-generator.com",
            githubUrl: "https://github.com/user/ai-art-gen",
            aiServices: ["Stable Diffusion", "DALL-E", "Replicate"],
            skills: ["Python", "React", "AI Art", "Machine Learning", "FastAPI"],
            tools: ["Python", "Jupyter", "Figma", "Photoshop"],
            tags: ["AI Art", "Generative AI", "Creative", "Machine Learning"],
            userId: user.$id,
            userName: user.name,
            userAvatar: user.avatar || null,
            likesCount: 28,
            viewsCount: 156,
            commentsCount: 12,
            sharesCount: 19,
            averageRating: 4.8,
            ratingsCount: 15,
            status: "published",
            featured: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            title: "Smart Dashboard Analytics",
            description: "A comprehensive analytics dashboard with AI-powered insights and predictive analytics. Features real-time data visualization, automated reporting, and intelligent alerts. Built for modern businesses to make data-driven decisions.",
            category: "Data Visualization",
            subcategory: "Business Intelligence",
            images: [
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
            ],
            thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
            videoUrl: "https://www.youtube.com/watch?v=demo123",
            liveUrl: "https://smart-dashboard.io",
            githubUrl: "https://github.com/user/smart-dashboard",
            aiServices: ["OpenAI API", "TensorFlow", "Google Analytics"],
            skills: ["Vue.js", "D3.js", "Python", "Data Analysis", "Machine Learning"],
            tools: ["VS Code", "Tableau", "Google Analytics", "Figma"],
            tags: ["Analytics", "Dashboard", "Data Viz", "Business Intelligence"],
            userId: user.$id,
            userName: user.name,
            userAvatar: user.avatar || null,
            likesCount: 22,
            viewsCount: 134,
            commentsCount: 8,
            sharesCount: 11,
            averageRating: 4.6,
            ratingsCount: 12,
            status: "published",
            featured: false,
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    console.log(`📁 Creating ${portfolioItems.length} portfolio items for ${user.name}...`);

    for (const itemData of portfolioItems) {
        try {
            const item = await makeRequest(
                `/v1/databases/${DATABASE_ID}/collections/portfolio_items/documents`,
                {
                    documentId: generateId(),
                    data: itemData,
                    permissions: [
                        'read("any")',
                        `write("user:${user.$id}")`,
                        `update("user:${user.$id}")`,
                        `delete("user:${user.$id}")`
                    ]
                }
            );
            console.log(`  ✅ Created: ${itemData.title}`);
        } catch (error) {
            console.log(`  ❌ Failed to create "${itemData.title}": ${error.message}`);
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 300));
    }
}

async function createUserPortfolio() {
    console.log('👤 Getting users...');
    
    const users = await getUsers();
    
    if (users.length === 0) {
        console.log('❌ No users found');
        return;
    }
    
    console.log(`📋 Found ${users.length} users:`);
    users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.$id}) - ${user.email}`);
    });
    
    // Create portfolio for the first user (usually Test User)
    const targetUser = users[0];
    console.log(`\n🎯 Creating portfolio for: ${targetUser.name} (${targetUser.$id})`);
    
    await createPortfolioForUser(targetUser);
    
    console.log('\n✅ Portfolio creation complete!');
    console.log(`🎉 ${targetUser.name} now has a beautiful portfolio!`);
    console.log('\n💡 Next steps:');
    console.log('   1. Login as this user in the dashboard');
    console.log('   2. Go to Portfolio tab');
    console.log('   3. See your new portfolio items!');
}

// Run the script
createUserPortfolio().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
});
