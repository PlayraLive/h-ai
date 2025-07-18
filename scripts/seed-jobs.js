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

console.log('🌱 Seeding Jobs Database...');

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

// Sample jobs data
const sampleJobs = [
    {
        title: "AI-Powered E-commerce Recommendation System",
        description: "We need an experienced AI/ML developer to build a sophisticated recommendation engine for our e-commerce platform. The system should analyze user behavior, purchase history, and product attributes to provide personalized recommendations.\n\nKey Requirements:\n- Experience with Python, TensorFlow/PyTorch\n- Knowledge of collaborative filtering and content-based filtering\n- Experience with large datasets and real-time processing\n- API integration skills\n\nDeliverables:\n- Complete recommendation engine\n- API documentation\n- Performance metrics and testing\n- Deployment guide",
        category: "AI & Machine Learning",
        subcategory: "Recommendation Systems",
        skills: ["Python", "TensorFlow", "Machine Learning", "API Development", "Data Science"],
        budgetType: "fixed",
        budgetMin: 3000,
        budgetMax: 5000,
        currency: "USD",
        duration: "2-3 months",
        experienceLevel: "expert",
        location: "Remote",
        status: "active",
        clientId: "client_001",
        clientName: "TechCorp Solutions",
        clientCompany: "TechCorp Inc.",
        clientAvatar: null,
        featured: true,
        urgent: false,
        applicationsCount: 12,
        viewsCount: 156,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
        attachments: [],
        tags: ["AI", "E-commerce", "Python", "Machine Learning"]
    },
    {
        title: "React Native Mobile App Development",
        description: "Looking for a skilled React Native developer to create a cross-platform mobile application for our fitness startup.\n\nApp Features:\n- User authentication and profiles\n- Workout tracking and planning\n- Social features (friends, challenges)\n- Integration with fitness wearables\n- Push notifications\n- In-app purchases\n\nRequirements:\n- 3+ years React Native experience\n- Experience with Firebase/backend integration\n- App Store and Google Play deployment experience\n- UI/UX design collaboration skills\n\nWe have designs ready and a detailed specification document.",
        category: "Mobile Development",
        subcategory: "React Native",
        skills: ["React Native", "JavaScript", "Firebase", "Mobile UI/UX", "App Store Deployment"],
        budgetType: "fixed",
        budgetMin: 8000,
        budgetMax: 12000,
        currency: "USD",
        duration: "3-4 months",
        experienceLevel: "intermediate",
        location: "Remote",
        status: "active",
        clientId: "client_002",
        clientName: "FitLife Startup",
        clientCompany: "FitLife Technologies",
        clientAvatar: null,
        featured: false,
        urgent: true,
        applicationsCount: 8,
        viewsCount: 89,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days
        attachments: [],
        tags: ["Mobile", "React Native", "Fitness", "Startup"]
    },
    {
        title: "WordPress Website Redesign & Optimization",
        description: "We need a WordPress expert to redesign our company website and optimize it for performance and SEO.\n\nScope of Work:\n- Complete website redesign with modern, responsive design\n- Performance optimization (page speed, caching)\n- SEO optimization (on-page, technical SEO)\n- Content migration from old site\n- Training for content management\n\nCurrent site gets 50K+ monthly visitors, so performance is critical.\n\nRequirements:\n- 5+ years WordPress experience\n- Strong PHP, HTML, CSS, JavaScript skills\n- Experience with page builders (Elementor preferred)\n- SEO and performance optimization expertise\n- Portfolio of similar projects",
        category: "Web Development",
        subcategory: "WordPress",
        skills: ["WordPress", "PHP", "SEO", "Performance Optimization", "Responsive Design"],
        budgetType: "fixed",
        budgetMin: 2500,
        budgetMax: 4000,
        currency: "USD",
        duration: "1-2 months",
        experienceLevel: "intermediate",
        location: "Remote",
        status: "active",
        clientId: "client_003",
        clientName: "Digital Marketing Agency",
        clientCompany: "GrowthMax Agency",
        clientAvatar: null,
        featured: false,
        urgent: false,
        applicationsCount: 15,
        viewsCount: 203,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        attachments: [],
        tags: ["WordPress", "SEO", "Web Design", "Performance"]
    },
    {
        title: "Blockchain Smart Contract Development",
        description: "Seeking an experienced blockchain developer to create smart contracts for our DeFi platform.\n\nProject Details:\n- ERC-20 token contract with advanced features\n- Staking and yield farming contracts\n- Governance token and voting mechanism\n- Security audit preparation\n\nRequirements:\n- Expert level Solidity programming\n- Experience with DeFi protocols\n- Knowledge of security best practices\n- Hardhat/Truffle framework experience\n- Previous audit experience preferred\n\nThis is a high-stakes project with significant funding, so we need top-tier talent.",
        category: "Blockchain",
        subcategory: "Smart Contracts",
        skills: ["Solidity", "Blockchain", "DeFi", "Smart Contracts", "Web3"],
        budgetType: "fixed",
        budgetMin: 15000,
        budgetMax: 25000,
        currency: "USD",
        duration: "2-3 months",
        experienceLevel: "expert",
        location: "Remote",
        status: "active",
        clientId: "client_004",
        clientName: "DeFi Innovations",
        clientCompany: "CryptoVentures Ltd",
        clientAvatar: null,
        featured: true,
        urgent: true,
        applicationsCount: 6,
        viewsCount: 78,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        attachments: [],
        tags: ["Blockchain", "DeFi", "Solidity", "Smart Contracts"]
    },
    {
        title: "Data Visualization Dashboard with D3.js",
        description: "We need a data visualization expert to create an interactive dashboard for our analytics platform.\n\nProject Requirements:\n- Interactive charts and graphs using D3.js\n- Real-time data updates\n- Responsive design for desktop and mobile\n- Export functionality (PDF, PNG, CSV)\n- Integration with our REST API\n\nData Types:\n- Time series data\n- Geographic data (maps)\n- Network/relationship data\n- Statistical distributions\n\nLooking for someone with strong design sense and technical skills.",
        category: "Data Science",
        subcategory: "Data Visualization",
        skills: ["D3.js", "JavaScript", "Data Visualization", "SVG", "API Integration"],
        budgetType: "hourly",
        budgetMin: 50,
        budgetMax: 80,
        currency: "USD",
        duration: "1-2 months",
        experienceLevel: "intermediate",
        location: "Remote",
        status: "active",
        clientId: "client_005",
        clientName: "Analytics Pro",
        clientCompany: "DataInsights Corp",
        clientAvatar: null,
        featured: false,
        urgent: false,
        applicationsCount: 9,
        viewsCount: 134,
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days
        attachments: [],
        tags: ["Data Visualization", "D3.js", "Analytics", "Dashboard"]
    },
    {
        title: "UI/UX Design for SaaS Platform",
        description: "We're looking for a talented UI/UX designer to redesign our SaaS platform interface.\n\nProject Scope:\n- User research and persona development\n- Wireframing and prototyping\n- High-fidelity UI designs\n- Design system creation\n- Usability testing\n\nCurrent platform has 10K+ active users, so user experience is crucial.\n\nRequirements:\n- 4+ years UI/UX design experience\n- Proficiency in Figma/Sketch\n- Experience with SaaS platforms\n- Understanding of user research methods\n- Portfolio showcasing similar projects",
        category: "Design",
        subcategory: "UI/UX Design",
        skills: ["UI/UX Design", "Figma", "User Research", "Prototyping", "Design Systems"],
        budgetType: "fixed",
        budgetMin: 4000,
        budgetMax: 6000,
        currency: "USD",
        duration: "1-2 months",
        experienceLevel: "intermediate",
        location: "Remote",
        status: "active",
        clientId: "client_006",
        clientName: "SaaS Startup",
        clientCompany: "CloudFlow Technologies",
        clientAvatar: null,
        featured: false,
        urgent: false,
        applicationsCount: 11,
        viewsCount: 167,
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: [],
        tags: ["UI/UX", "SaaS", "Design", "Figma"]
    },
    {
        title: "DevOps Engineer for Cloud Migration",
        description: "Seeking an experienced DevOps engineer to help migrate our infrastructure to AWS and implement CI/CD pipelines.\n\nProject Goals:\n- Migrate from on-premise to AWS cloud\n- Set up containerized applications with Docker/Kubernetes\n- Implement CI/CD with GitHub Actions\n- Infrastructure as Code with Terraform\n- Monitoring and logging setup\n\nCurrent Setup:\n- 5 microservices\n- PostgreSQL and Redis databases\n- ~100K daily active users\n\nLooking for someone who can work independently and provide best practices guidance.",
        category: "DevOps",
        subcategory: "Cloud Migration",
        skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
        budgetType: "hourly",
        budgetMin: 60,
        budgetMax: 90,
        currency: "USD",
        duration: "2-3 months",
        experienceLevel: "expert",
        location: "Remote",
        status: "active",
        clientId: "client_007",
        clientName: "Enterprise Solutions",
        clientCompany: "MegaCorp Industries",
        clientAvatar: null,
        featured: true,
        urgent: false,
        applicationsCount: 7,
        viewsCount: 92,
        deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: [],
        tags: ["DevOps", "AWS", "Cloud", "Migration"]
    },
    {
        title: "Content Writing for Tech Blog",
        description: "We need a skilled technical content writer to create engaging blog posts for our developer-focused platform.\n\nContent Requirements:\n- 8-10 blog posts per month\n- Topics: AI, Web Development, DevOps, Cybersecurity\n- 1500-2500 words per article\n- SEO optimization\n- Code examples and tutorials\n\nIdeal Candidate:\n- Technical background (CS degree or equivalent experience)\n- Excellent English writing skills\n- Experience with developer tools and technologies\n- Understanding of SEO best practices\n- Portfolio of technical writing samples\n\nThis is an ongoing project with potential for long-term collaboration.",
        category: "Writing",
        subcategory: "Technical Writing",
        skills: ["Technical Writing", "SEO", "Content Strategy", "Developer Tools", "Blogging"],
        budgetType: "hourly",
        budgetMin: 25,
        budgetMax: 40,
        currency: "USD",
        duration: "Ongoing",
        experienceLevel: "intermediate",
        location: "Remote",
        status: "active",
        clientId: "client_008",
        clientName: "DevHub Media",
        clientCompany: "TechContent Solutions",
        clientAvatar: null,
        featured: false,
        urgent: false,
        applicationsCount: 18,
        viewsCount: 245,
        deadline: null,
        attachments: [],
        tags: ["Writing", "Technical", "SEO", "Content"]
    }
];

async function createJob(jobData) {
    try {
        const job = await makeRequest(
            `/v1/databases/${DATABASE_ID}/collections/jobs/documents`,
            {
                documentId: generateId(),
                data: jobData
            }
        );
        console.log(`✅ Created job: ${jobData.title}`);
        return job;
    } catch (error) {
        console.log(`❌ Failed to create job "${jobData.title}": ${error.message}`);
        return null;
    }
}

async function seedJobs() {
    console.log('🌱 Creating sample jobs...');
    
    for (const jobData of sampleJobs) {
        await createJob(jobData);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('✅ Sample jobs created!');
    console.log('');
    console.log('🎉 You can now see real jobs at: http://localhost:3000/en/jobs');
    console.log('💡 Jobs include AI/ML, Mobile, Web, Blockchain, and Data Science projects');
}

// Run the script
seedJobs().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
});
