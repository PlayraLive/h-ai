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

console.log('🎨 Creating Beautiful Portfolio Items...');

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

// Get random number between min and max
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get random date in the past
function randomPastDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - randomBetween(1, daysAgo));
    return date.toISOString();
}

// Beautiful portfolio items with real data
const portfolioItems = [
    {
        title: "AI-Powered E-commerce Platform",
        description: "A revolutionary e-commerce platform built with Next.js and enhanced with AI-powered product recommendations, automated customer service chatbot, and intelligent inventory management. The platform uses machine learning to predict customer behavior and optimize the shopping experience. Features include real-time analytics, personalized product suggestions, and automated marketing campaigns.",
        category: "Web Development",
        subcategory: "E-commerce",
        images: [
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
            "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
        ],
        thumbnailUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        liveUrl: "https://ai-ecommerce-demo.vercel.app",
        githubUrl: "https://github.com/user/ai-ecommerce",
        aiServices: ["OpenAI API", "ChatGPT", "GitHub Copilot", "Figma AI"],
        skills: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Stripe", "TensorFlow", "Python"],
        tools: ["VS Code", "Figma", "Postman", "Docker", "Vercel"],
        tags: ["AI", "E-commerce", "Machine Learning", "Full Stack", "SaaS"],
        userId: "freelancer-alex-001",
        userName: "Alex Rodriguez",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        likesCount: randomBetween(45, 120),
        viewsCount: randomBetween(800, 2500),
        commentsCount: randomBetween(8, 25),
        sharesCount: randomBetween(12, 40),
        averageRating: 4.8,
        ratingsCount: randomBetween(15, 35),
        status: "published",
        featured: true,
        createdAt: randomPastDate(30),
        publishedAt: randomPastDate(30)
    },
    {
        title: "Neural Network Art Generator",
        description: "An innovative web application that uses advanced neural networks to generate unique digital artwork. Users can input text prompts, adjust style parameters, and create stunning AI-generated art pieces. The platform features a gallery system, social sharing capabilities, and NFT minting functionality. Built with cutting-edge AI models and modern web technologies.",
        category: "AI/ML Projects",
        subcategory: "Generative Art",
        images: [
            "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800",
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
            "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800"
        ],
        thumbnailUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400",
        videoUrl: "",
        liveUrl: "https://neural-art-generator.com",
        githubUrl: "https://github.com/user/neural-art-gen",
        aiServices: ["Stable Diffusion", "DALL-E", "Midjourney", "RunwayML", "Replicate"],
        skills: ["Python", "TensorFlow", "PyTorch", "React", "FastAPI", "Docker", "AWS"],
        tools: ["Jupyter Notebook", "Google Colab", "Figma", "Photoshop"],
        tags: ["AI Art", "Neural Networks", "Generative AI", "NFT", "Creative Tech"],
        userId: "freelancer-sarah-002",
        userName: "Sarah Chen",
        userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        likesCount: randomBetween(65, 180),
        viewsCount: randomBetween(1200, 3500),
        commentsCount: randomBetween(15, 45),
        sharesCount: randomBetween(25, 70),
        averageRating: 4.9,
        ratingsCount: randomBetween(20, 50),
        status: "published",
        featured: true,
        createdAt: randomPastDate(45),
        publishedAt: randomPastDate(45)
    },
    {
        title: "Smart Home IoT Dashboard",
        description: "A comprehensive IoT dashboard for smart home management with AI-powered automation and energy optimization. The system integrates with various smart devices, provides real-time monitoring, predictive maintenance alerts, and intelligent scheduling. Features include voice control integration, mobile app, and advanced analytics for energy consumption optimization.",
        category: "IoT & Hardware",
        subcategory: "Smart Home",
        images: [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
            "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800",
            "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800"
        ],
        thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        videoUrl: "https://www.youtube.com/watch?v=demo123",
        liveUrl: "https://smart-home-dashboard.io",
        githubUrl: "https://github.com/user/iot-dashboard",
        aiServices: ["Google Assistant API", "Amazon Alexa", "OpenAI API", "TensorFlow Lite"],
        skills: ["React Native", "Node.js", "MongoDB", "MQTT", "Arduino", "Raspberry Pi", "Machine Learning"],
        tools: ["VS Code", "Arduino IDE", "Figma", "Postman", "MongoDB Compass"],
        tags: ["IoT", "Smart Home", "Automation", "Mobile App", "Hardware"],
        userId: "freelancer-mike-003",
        userName: "Mike Johnson",
        userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        likesCount: randomBetween(35, 95),
        viewsCount: randomBetween(600, 1800),
        commentsCount: randomBetween(5, 20),
        sharesCount: randomBetween(8, 30),
        averageRating: 4.7,
        ratingsCount: randomBetween(12, 28),
        status: "published",
        featured: false,
        createdAt: randomPastDate(60),
        publishedAt: randomPastDate(60)
    },
    {
        title: "AI Content Creation Suite",
        description: "A comprehensive content creation platform powered by multiple AI models for generating blog posts, social media content, marketing copy, and visual assets. The suite includes SEO optimization, brand voice customization, content scheduling, and performance analytics. Perfect for marketers, content creators, and businesses looking to scale their content production.",
        category: "Content Creation",
        subcategory: "AI Writing",
        images: [
            "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
            "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"
        ],
        thumbnailUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
        videoUrl: "",
        liveUrl: "https://ai-content-suite.com",
        githubUrl: "https://github.com/user/ai-content-suite",
        aiServices: ["GPT-4", "Claude", "Jasper", "Copy.ai", "Canva AI", "Adobe Firefly"],
        skills: ["Vue.js", "Nuxt.js", "Python", "FastAPI", "Redis", "Elasticsearch", "SEO"],
        tools: ["VS Code", "Figma", "Notion", "Google Analytics", "Semrush"],
        tags: ["AI Writing", "Content Marketing", "SEO", "Automation", "SaaS"],
        userId: "freelancer-emma-004",
        userName: "Emma Wilson",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        likesCount: randomBetween(55, 140),
        viewsCount: randomBetween(900, 2800),
        commentsCount: randomBetween(12, 35),
        sharesCount: randomBetween(18, 55),
        averageRating: 4.6,
        ratingsCount: randomBetween(18, 40),
        status: "published",
        featured: true,
        createdAt: randomPastDate(20),
        publishedAt: randomPastDate(20)
    },
    {
        title: "Blockchain-Based Voting System",
        description: "A secure, transparent, and decentralized voting platform built on blockchain technology with AI-powered fraud detection. The system ensures vote integrity, provides real-time results, and maintains complete transparency while preserving voter anonymity. Features include multi-factor authentication, smart contract validation, and comprehensive audit trails.",
        category: "Blockchain",
        subcategory: "DeFi & Governance",
        images: [
            "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
            "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800",
            "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800"
        ],
        thumbnailUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
        videoUrl: "https://www.youtube.com/watch?v=blockchain123",
        liveUrl: "https://secure-vote-blockchain.com",
        githubUrl: "https://github.com/user/blockchain-voting",
        aiServices: ["OpenAI API", "Chainlink", "The Graph"],
        skills: ["Solidity", "Web3.js", "React", "Node.js", "Ethereum", "IPFS", "Cryptography"],
        tools: ["Remix IDE", "Hardhat", "MetaMask", "Ganache", "VS Code"],
        tags: ["Blockchain", "Voting", "Smart Contracts", "Security", "DeFi"],
        userId: "freelancer-david-005",
        userName: "David Kim",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        likesCount: randomBetween(40, 110),
        viewsCount: randomBetween(700, 2200),
        commentsCount: randomBetween(8, 25),
        sharesCount: randomBetween(15, 45),
        averageRating: 4.8,
        ratingsCount: randomBetween(15, 32),
        status: "published",
        featured: false,
        createdAt: randomPastDate(35),
        publishedAt: randomPastDate(35)
    }
];

async function createPortfolioItem(itemData) {
    try {
        const item = await makeRequest(
            `/v1/databases/${DATABASE_ID}/collections/portfolio_items/documents`,
            {
                documentId: generateId(),
                data: itemData,
                permissions: [
                    'read("any")',
                    `write("user:${itemData.userId}")`,
                    `update("user:${itemData.userId}")`,
                    `delete("user:${itemData.userId}")`
                ]
            }
        );
        console.log(`✅ Created portfolio: ${itemData.title} by ${itemData.userName}`);
        return item;
    } catch (error) {
        console.log(`❌ Failed to create portfolio "${itemData.title}": ${error.message}`);
        return null;
    }
}

async function seedBeautifulPortfolio() {
    console.log('🎨 Creating beautiful portfolio items...');
    
    for (const itemData of portfolioItems) {
        await createPortfolioItem(itemData);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('');
    console.log('✅ Beautiful portfolio items created!');
    console.log('');
    console.log('🎉 Portfolio showcase is ready!');
    console.log('💡 Features:');
    console.log('   - 5 diverse, high-quality portfolio items');
    console.log('   - Real images from Unsplash');
    console.log('   - Comprehensive AI services and skills');
    console.log('   - Realistic engagement metrics');
    console.log('   - Different freelancer profiles');
    console.log('');
    console.log('🔗 Check them out at: http://localhost:3001/en/portfolio');
}

// Run the script
seedBeautifulPortfolio().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
});
