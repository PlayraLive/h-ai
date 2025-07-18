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

console.log('🎨 Seeding Portfolio Database...');

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

// Sample portfolio items
const portfolioItems = [
    {
        title: "AI-Generated Logo Collection",
        description: "A stunning collection of logos created using Midjourney and refined with Adobe Illustrator. Each logo represents a unique brand identity crafted through careful prompt engineering and iterative design processes.",
        category: "Design",
        subcategory: "Logo Design",
        images: ["https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800", "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800"],
        thumbnailUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
        aiServices: ["Midjourney", "Adobe Firefly", "ChatGPT"],
        skills: ["Logo Design", "Brand Identity", "Adobe Illustrator", "Prompt Engineering"],
        tools: ["Adobe Illustrator", "Figma", "Photoshop"],
        userId: "test-user-id",
        userName: "Test User",
        userAvatar: null,
        likesCount: 24,
        viewsCount: 156,
        commentsCount: 8,
        sharesCount: 12,
        averageRating: 4.8,
        ratingsCount: 15,
        status: "published",
        featured: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["AI Art", "Branding", "Creative", "Professional"]
    },
    {
        title: "Interactive Data Dashboard",
        description: "A modern, responsive dashboard built with React and D3.js, featuring real-time data visualization and AI-powered insights. The project includes predictive analytics and automated report generation.",
        category: "Web Development",
        subcategory: "Data Visualization",
        images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"],
        thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
        liveUrl: "https://dashboard-demo.vercel.app",
        githubUrl: "https://github.com/user/dashboard-project",
        aiServices: ["GitHub Copilot", "ChatGPT", "Claude"],
        skills: ["React", "D3.js", "TypeScript", "Node.js", "Data Analysis"],
        tools: ["VS Code", "Figma", "Git"],
        userId: "test-user-id",
        userName: "Test User",
        userAvatar: null,
        likesCount: 18,
        viewsCount: 89,
        commentsCount: 5,
        sharesCount: 7,
        averageRating: 4.6,
        ratingsCount: 12,
        status: "published",
        featured: false,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Dashboard", "Analytics", "React", "Data Viz"]
    },
    {
        title: "AI-Powered Mobile App UI",
        description: "Complete UI/UX design for a fitness tracking mobile app with AI-powered workout recommendations. Created using Figma with AI assistance for generating icons and illustrations.",
        category: "UI/UX Design",
        subcategory: "Mobile Design",
        images: ["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800", "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800"],
        thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
        aiServices: ["Figma AI", "Midjourney", "Adobe Firefly"],
        skills: ["UI/UX Design", "Mobile Design", "Prototyping", "User Research"],
        tools: ["Figma", "Adobe XD", "Principle"],
        userId: "test-user-id",
        userName: "Test User",
        userAvatar: null,
        likesCount: 31,
        viewsCount: 203,
        commentsCount: 12,
        sharesCount: 15,
        averageRating: 4.9,
        ratingsCount: 18,
        status: "published",
        featured: true,
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Mobile UI", "Fitness", "AI Design", "Prototyping"]
    },
    {
        title: "AI Content Generation Tool",
        description: "A web application that helps content creators generate blog posts, social media content, and marketing copy using multiple AI models. Built with Next.js and integrated with OpenAI and Anthropic APIs.",
        category: "Web Development",
        subcategory: "AI Tools",
        images: ["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800", "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800"],
        thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
        liveUrl: "https://ai-content-tool.vercel.app",
        githubUrl: "https://github.com/user/ai-content-tool",
        aiServices: ["OpenAI API", "Anthropic API", "GitHub Copilot"],
        skills: ["Next.js", "React", "API Integration", "AI/ML", "TypeScript"],
        tools: ["VS Code", "Vercel", "Postman"],
        userId: "test-user-id",
        userName: "Test User",
        userAvatar: null,
        likesCount: 42,
        viewsCount: 287,
        commentsCount: 16,
        sharesCount: 23,
        averageRating: 4.7,
        ratingsCount: 25,
        status: "published",
        featured: true,
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["AI Tools", "Content Creation", "SaaS", "Next.js"]
    },
    {
        title: "3D Product Visualization",
        description: "Interactive 3D product showcase created with Three.js and enhanced with AI-generated textures and materials. Features realistic lighting and physics simulations.",
        category: "3D Design",
        subcategory: "Product Visualization",
        images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800"],
        thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        liveUrl: "https://3d-product-demo.vercel.app",
        aiServices: ["Stable Diffusion", "RunwayML", "ChatGPT"],
        skills: ["Three.js", "3D Modeling", "WebGL", "JavaScript", "Blender"],
        tools: ["Blender", "Three.js", "VS Code"],
        userId: "test-user-id",
        userName: "Test User",
        userAvatar: null,
        likesCount: 27,
        viewsCount: 134,
        commentsCount: 9,
        sharesCount: 11,
        averageRating: 4.5,
        ratingsCount: 14,
        status: "published",
        featured: false,
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["3D", "WebGL", "Product Design", "Interactive"]
    }
];

async function createPortfolioItem(itemData) {
    try {
        const item = await makeRequest(
            `/v1/databases/${DATABASE_ID}/collections/portfolio_items/documents`,
            {
                documentId: generateId(),
                data: itemData
            }
        );
        console.log(`✅ Created portfolio item: ${itemData.title}`);
        return item;
    } catch (error) {
        console.log(`❌ Failed to create portfolio item "${itemData.title}": ${error.message}`);
        return null;
    }
}

async function seedPortfolio() {
    console.log('🎨 Creating portfolio items...');
    
    for (const itemData of portfolioItems) {
        await createPortfolioItem(itemData);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('✅ Portfolio items created!');
    console.log('');
    console.log('🎉 Portfolio system is fully ready!');
    console.log('💡 Check the dashboard at: http://localhost:3000/en/dashboard');
}

// Run the script
seedPortfolio().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
});
