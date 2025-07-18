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

console.log('🤖 Seeding AI Services Database...');

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

// Popular AI Services
const aiServices = [
    // Text/Language AI
    { name: 'ChatGPT', category: 'text', description: 'Conversational AI by OpenAI', website: 'https://chat.openai.com', popular: true },
    { name: 'GPT-4', category: 'text', description: 'Advanced language model by OpenAI', website: 'https://openai.com/gpt-4', popular: true },
    { name: 'Claude', category: 'text', description: 'AI assistant by Anthropic', website: 'https://claude.ai', popular: true },
    { name: 'Jasper', category: 'text', description: 'AI writing assistant', website: 'https://jasper.ai', popular: true },
    { name: 'Copy.ai', category: 'text', description: 'AI copywriting tool', website: 'https://copy.ai', popular: false },
    { name: 'Notion AI', category: 'text', description: 'AI writing in Notion', website: 'https://notion.so', popular: true },
    
    // Image Generation
    { name: 'Midjourney', category: 'image', description: 'AI image generation', website: 'https://midjourney.com', popular: true },
    { name: 'DALL-E', category: 'image', description: 'AI image generator by OpenAI', website: 'https://openai.com/dall-e-2', popular: true },
    { name: 'Stable Diffusion', category: 'image', description: 'Open-source image generation', website: 'https://stability.ai', popular: true },
    { name: 'Adobe Firefly', category: 'image', description: 'AI image generation by Adobe', website: 'https://firefly.adobe.com', popular: true },
    { name: 'Canva AI', category: 'image', description: 'AI design tools in Canva', website: 'https://canva.com', popular: false },
    { name: 'Leonardo AI', category: 'image', description: 'AI art generation platform', website: 'https://leonardo.ai', popular: false },
    
    // Code Generation
    { name: 'GitHub Copilot', category: 'code', description: 'AI pair programmer', website: 'https://github.com/features/copilot', popular: true },
    { name: 'Cursor', category: 'code', description: 'AI-powered code editor', website: 'https://cursor.sh', popular: true },
    { name: 'Replit AI', category: 'code', description: 'AI coding assistant', website: 'https://replit.com', popular: false },
    { name: 'Tabnine', category: 'code', description: 'AI code completion', website: 'https://tabnine.com', popular: false },
    { name: 'CodeT5', category: 'code', description: 'Code generation model', website: 'https://huggingface.co', popular: false },
    
    // Video Generation
    { name: 'RunwayML', category: 'video', description: 'AI video generation and editing', website: 'https://runwayml.com', popular: true },
    { name: 'Luma AI', category: 'video', description: '3D capture and video AI', website: 'https://lumalabs.ai', popular: true },
    { name: 'Synthesia', category: 'video', description: 'AI video generation with avatars', website: 'https://synthesia.io', popular: true },
    { name: 'Descript', category: 'video', description: 'AI video and audio editing', website: 'https://descript.com', popular: false },
    { name: 'Pictory', category: 'video', description: 'AI video creation', website: 'https://pictory.ai', popular: false },
    
    // Audio Generation
    { name: 'ElevenLabs', category: 'audio', description: 'AI voice generation', website: 'https://elevenlabs.io', popular: true },
    { name: 'Suno AI', category: 'audio', description: 'AI music generation', website: 'https://suno.ai', popular: true },
    { name: 'Mubert', category: 'audio', description: 'AI music generation', website: 'https://mubert.com', popular: false },
    { name: 'Speechify', category: 'audio', description: 'Text-to-speech AI', website: 'https://speechify.com', popular: false },
    { name: 'Resemble AI', category: 'audio', description: 'Voice cloning AI', website: 'https://resemble.ai', popular: false },
    
    // Design Tools
    { name: 'Figma AI', category: 'design', description: 'AI features in Figma', website: 'https://figma.com', popular: true },
    { name: 'Framer AI', category: 'design', description: 'AI website builder', website: 'https://framer.com', popular: true },
    { name: 'Uizard', category: 'design', description: 'AI UI design tool', website: 'https://uizard.io', popular: false },
    { name: 'Galileo AI', category: 'design', description: 'AI interface design', website: 'https://usegalileo.ai', popular: false },
    { name: 'Looka', category: 'design', description: 'AI logo maker', website: 'https://looka.com', popular: false },
    
    // Other/Platform
    { name: 'Replicate', category: 'other', description: 'Run AI models in the cloud', website: 'https://replicate.com', popular: true },
    { name: 'Hugging Face', category: 'other', description: 'AI model hub and platform', website: 'https://huggingface.co', popular: true },
    { name: 'OpenAI API', category: 'other', description: 'OpenAI API access', website: 'https://openai.com/api', popular: true },
    { name: 'Anthropic API', category: 'other', description: 'Claude API access', website: 'https://anthropic.com', popular: false },
    { name: 'Cohere', category: 'other', description: 'Language AI platform', website: 'https://cohere.ai', popular: false }
];

async function createAIService(serviceData) {
    try {
        const service = await makeRequest(
            `/v1/databases/${DATABASE_ID}/collections/ai_services/documents`,
            {
                documentId: generateId(),
                data: serviceData
            }
        );
        console.log(`✅ Created AI service: ${serviceData.name}`);
        return service;
    } catch (error) {
        console.log(`❌ Failed to create AI service "${serviceData.name}": ${error.message}`);
        return null;
    }
}

async function seedAIServices() {
    console.log('🤖 Creating AI services...');
    
    for (const serviceData of aiServices) {
        await createAIService(serviceData);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('✅ AI services created!');
    console.log('');
    console.log('🎉 Portfolio system is ready!');
    console.log('💡 You can now add AI-powered projects to your portfolio');
}

// Run the script
seedAIServices().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
});
