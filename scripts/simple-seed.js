const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Collections
const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  PORTFOLIO: 'portfolio',
  SKILLS: 'skills',
  CATEGORIES: 'categories',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  REELS: 'reels',
  REEL_INTERACTIONS: 'reel_interactions'
};

// Sample data
const freelancers = [
  {
    name: 'Alexandra Chen',
    email: 'alexandra.chen@example.com',
    userType: 'freelancer',
    bio: 'Senior AI/ML Engineer with 6+ years of experience in computer vision, NLP, and deep learning.',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'NLP'],
    hourlyRate: 95,
    location: 'San Francisco, CA',
    verified: true,
    rating: 4.9,
    reviewsCount: 47,
    completedJobs: 32,
    totalEarnings: 125000,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
  },
  {
    name: 'Marcus Thompson',
    email: 'marcus.thompson@example.com',
    userType: 'freelancer',
    bio: 'Full-stack developer specializing in AI-powered web applications.',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'OpenAI API'],
    hourlyRate: 78,
    location: 'Austin, TX',
    verified: true,
    rating: 4.8,
    reviewsCount: 34,
    completedJobs: 28,
    totalEarnings: 89000,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
  },
  {
    name: 'Sofia Rodriguez',
    email: 'sofia.rodriguez@example.com',
    userType: 'freelancer',
    bio: 'Creative AI specialist and prompt engineer. I help brands create stunning visual content.',
    skills: ['Midjourney', 'DALL-E', 'Stable Diffusion', 'Prompt Engineering'],
    hourlyRate: 65,
    location: 'Barcelona, Spain',
    verified: true,
    rating: 4.9,
    reviewsCount: 56,
    completedJobs: 41,
    totalEarnings: 72000,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
  }
];

const clients = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    userType: 'client',
    bio: 'CTO at TechStartup Inc. Looking for AI specialists.',
    location: 'New York, NY',
    verified: true,
    rating: 4.6,
    reviewsCount: 12,
    completedJobs: 8,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    userType: 'client',
    bio: 'Head of Product at E-commerce Solutions.',
    location: 'Seattle, WA',
    verified: true,
    rating: 4.8,
    reviewsCount: 15,
    completedJobs: 11,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
  }
];

const projects = [
  {
    title: 'AI-Powered Customer Service Chatbot',
    description: 'Develop an intelligent chatbot using GPT-4 that can handle customer inquiries, process orders, and provide 24/7 support.',
    category: 'AI Development',
    skills: ['Python', 'OpenAI API', 'LangChain', 'FastAPI'],
    budget: 4500,
    currency: 'USD',
    budgetType: 'fixed',
    duration: '6 weeks',
    urgency: 'high',
    status: 'in_progress',
    experienceLevel: 'expert',
    remote: true,
    featured: true
  },
  {
    title: 'E-commerce Product Recommendation System',
    description: 'Build a machine learning model for personalized product recommendations.',
    category: 'Machine Learning',
    skills: ['Python', 'TensorFlow', 'Collaborative Filtering', 'AWS'],
    budget: 6200,
    currency: 'USD',
    budgetType: 'fixed',
    duration: '8 weeks',
    urgency: 'medium',
    status: 'completed',
    experienceLevel: 'expert',
    remote: true,
    featured: false
  },
  {
    title: 'AI-Generated Marketing Content Campaign',
    description: 'Create a complete marketing campaign using AI tools.',
    category: 'Creative AI',
    skills: ['Midjourney', 'ChatGPT', 'Canva', 'Content Strategy'],
    budget: 2800,
    currency: 'USD',
    budgetType: 'fixed',
    duration: '4 weeks',
    urgency: 'medium',
    status: 'completed',
    experienceLevel: 'intermediate',
    remote: true,
    featured: true
  }
];

const skills = [
  { name: 'Python', category: 'Programming', popularity: 95, averageRate: 75 },
  { name: 'TensorFlow', category: 'AI/ML', popularity: 88, averageRate: 85 },
  { name: 'React', category: 'Frontend', popularity: 93, averageRate: 70 },
  { name: 'OpenAI API', category: 'AI/ML', popularity: 91, averageRate: 80 },
  { name: 'Midjourney', category: 'Creative AI', popularity: 85, averageRate: 60 }
];

const categories = [
  { name: 'AI Development', slug: 'ai-development', description: 'AI and ML development projects', icon: '🤖' },
  { name: 'Creative AI', slug: 'creative-ai', description: 'AI-powered creative projects', icon: '🎨' },
  { name: 'Machine Learning', slug: 'machine-learning', description: 'ML and data science projects', icon: '📊' }
];

async function createUsers() {
  console.log('👥 Creating users...');
  const createdUsers = [];

  const allUsers = [...freelancers, ...clients];

  for (const userData of allUsers) {
    try {
      const user = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(),
        {
          ...userData,
          online: Math.random() > 0.4,
          lastSeen: new Date().toISOString(),
          badges: userData.verified ? ['verified'] : [],
          memberSince: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          availability: 'available',
          responseTime: `${Math.floor(Math.random() * 5) + 1} hours`,
          timezone: 'UTC',
          languages: [{ name: 'English', level: 'Native' }],
          workingHours: JSON.stringify({
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true }
          }),
          socialLinks: JSON.stringify({
            linkedin: `https://linkedin.com/in/${userData.name.toLowerCase().replace(' ', '-')}`,
            github: `https://github.com/${userData.name.toLowerCase().replace(' ', '')}`
          }),
          preferences: JSON.stringify({
            emailNotifications: true,
            theme: 'dark'
          })
        }
      );

      createdUsers.push(user);
      console.log(`  ✅ Created: ${userData.name}`);
    } catch (error) {
      console.log(`  ❌ Error creating ${userData.name}: ${error.message}`);
    }
  }

  return createdUsers;
}

async function createSkillsAndCategories() {
  console.log('🛠️ Creating skills and categories...');

  // Create skills
  for (const skill of skills) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SKILLS,
        ID.unique(),
        {
          ...skill,
          isActive: true,
          subcategory: skill.category
        }
      );
      console.log(`  ✅ Created skill: ${skill.name}`);
    } catch (error) {
      console.log(`  ❌ Error creating skill ${skill.name}: ${error.message}`);
    }
  }

  // Create categories
  for (const category of categories) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CATEGORIES,
        ID.unique(),
        {
          ...category,
          isActive: true,
          parentId: null,
          projectCount: 0,
          sortOrder: 1
        }
      );
      console.log(`  ✅ Created category: ${category.name}`);
    } catch (error) {
      console.log(`  ❌ Error creating category ${category.name}: ${error.message}`);
    }
  }
}

async function createProjects(users) {
  console.log('💼 Creating projects...');
  const createdProjects = [];

  const freelancerUsers = users.filter(u => u.userType === 'freelancer');
  const clientUsers = users.filter(u => u.userType === 'client');

  for (const projectData of projects) {
    try {
      const randomClient = clientUsers[Math.floor(Math.random() * clientUsers.length)];
      const randomFreelancer = projectData.status !== 'open' ?
        freelancerUsers[Math.floor(Math.random() * freelancerUsers.length)] : null;

      const project = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PROJECTS,
        ID.unique(),
        {
          ...projectData,
          clientId: randomClient.$id,
          freelancerId: randomFreelancer?.$id || null,
          attachments: [],
          proposals: Math.floor(Math.random() * 10) + 3,
          views: Math.floor(Math.random() * 100) + 25,
          tags: projectData.skills.slice(0, 3),
          requirements: 'Detailed requirements will be provided upon selection.',
          deliverables: 'Complete source code, documentation, and support.',
          deadline: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: projectData.status !== 'open' ?
            new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          completedAt: projectData.status === 'completed' ?
            new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subcategory: projectData.category,
          location: 'Remote'
        }
      );

      createdProjects.push(project);
      console.log(`  ✅ Created: ${projectData.title}`);
    } catch (error) {
      console.log(`  ❌ Error creating project ${projectData.title}: ${error.message}`);
    }
  }

  return createdProjects;
}

async function createPortfolio(users) {
  console.log('🎨 Creating portfolio items...');

  const freelancerUsers = users.filter(u => u.userType === 'freelancer');

  const portfolioTemplates = [
    {
      title: 'AI-Powered E-commerce Chatbot',
      description: 'Developed an intelligent chatbot that increased customer satisfaction by 40%.',
      category: 'AI Development',
      skills: ['Python', 'OpenAI API', 'FastAPI'],
      clientName: 'TechMart Inc.',
      budget: 3500,
      duration: '5 weeks'
    },
    {
      title: 'Computer Vision Quality Control System',
      description: 'Built a real-time defect detection system achieving 99.2% accuracy.',
      category: 'Computer Vision',
      skills: ['Python', 'OpenCV', 'TensorFlow'],
      clientName: 'ManufacturingCorp',
      budget: 8500,
      duration: '8 weeks'
    },
    {
      title: 'Social Media Content Generator',
      description: 'Created an AI tool that generates engaging social media content.',
      category: 'Creative AI',
      skills: ['GPT-4', 'Midjourney'],
      clientName: 'Digital Agency Pro',
      budget: 2200,
      duration: '3 weeks'
    }
  ];

  for (const user of freelancerUsers) {
    for (let i = 0; i < portfolioTemplates.length; i++) {
      try {
        const template = portfolioTemplates[i];
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.PORTFOLIO,
          ID.unique(),
          {
            ...template,
            userId: user.$id,
            images: [
              'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop',
              'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
            ],
            projectUrl: `https://demo-project-${Math.random().toString(36).substr(2, 9)}.com`,
            completionDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            isPublic: true,
            featured: i === 0,
            views: Math.floor(Math.random() * 500) + 50,
            likes: Math.floor(Math.random() * 50) + 5,
            tags: template.skills
          }
        );
        console.log(`  ✅ Created portfolio for ${user.name}: ${template.title}`);
      } catch (error) {
        console.log(`  ❌ Error creating portfolio: ${error.message}`);
      }
    }
  }
}

async function createReviews(projects, users) {
  console.log('⭐ Creating reviews...');

  const completedProjects = projects.filter(p => p.status === 'completed');

  const reviewTemplates = [
    {
      rating: 5,
      comment: 'Outstanding work! The AI solution exceeded expectations and was delivered ahead of schedule.',
      communication: 5,
      quality: 5,
      timeliness: 5,
      wouldRecommend: true,
      isPublic: true
    },
    {
      rating: 4,
      comment: 'Great technical skills and delivered quality work. Minor delays but overall satisfied.',
      communication: 4,
      quality: 5,
      timeliness: 4,
      wouldRecommend: true,
      isPublic: true
    }
  ];

  for (let i = 0; i < completedProjects.length; i++) {
    try {
      const project = completedProjects[i];
      const reviewTemplate = reviewTemplates[i % reviewTemplates.length];

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.REVIEWS,
        ID.unique(),
        {
          ...reviewTemplate,
          contractId: `contract_${project.$id}`,
          projectId: project.$id,
          reviewerId: project.clientId,
          revieweeId: project.freelancerId,
          skills: project.skills.slice(0, 3),
          skillRatings: JSON.stringify(
            project.skills.slice(0, 3).reduce((acc, skill) => {
              acc[skill] = Math.floor(Math.random() * 2) + 4;
              return acc;
            }, {})
          ),
          createdAt: new Date().toISOString()
        }
      );
      console.log(`  ✅ Created review for project: ${project.title}`);
    } catch (error) {
      console.log(`  ❌ Error creating review: ${error.message}`);
    }
  }
}

async function createNotifications(users) {
  console.log('🔔 Creating notifications...');

  const notificationTemplates = [
    {
      title: 'New Project Proposal',
      message: 'You received a new proposal for your AI Chatbot Development project.',
      type: 'project',
      priority: 'high'
    },
    {
      title: 'Payment Received',
      message: 'You received a payment of $2,500 for the completed project.',
      type: 'payment',
      priority: 'normal'
    },
    {
      title: 'New Message',
      message: 'You have a new message from a potential client.',
      type: 'message',
      priority: 'normal'
    }
  ];

  for (const user of users) {
    for (const template of notificationTemplates) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.NOTIFICATIONS,
          ID.unique(),
          {
            ...template,
            userId: user.$id,
            relatedId: `related_${Math.random().toString(36).substr(2, 9)}`,
            relatedType: template.type,
            isRead: Math.random() > 0.6,
            readAt: Math.random() > 0.6 ? new Date().toISOString() : null,
            actionUrl: `/${template.type}s`,
            createdAt: new Date().toISOString()
          }
        );
      } catch (error) {
        console.log(`  ❌ Error creating notification: ${error.message}`);
      }
    }
  }
  console.log(`  ✅ Created notifications for ${users.length} users`);
}

async function createInteractions(users, projects) {
  console.log('💫 Creating interactions...');

  // Create some sample interactions
  for (const project of projects) {
    // Random views
    const viewCount = Math.floor(Math.random() * 50) + 10;
    for (let i = 0; i < viewCount; i++) {
      try {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.REEL_INTERACTIONS,
          ID.unique(),
          {
            userId: randomUser.$id,
            targetId: project.$id,
            targetType: 'project',
            type: 'view',
            isActive: true,
            metadata: JSON.stringify({ timestamp: new Date().toISOString() })
          }
        );
      } catch (error) {
        // Ignore duplicate errors
      }
    }

    // Random likes
    const likeCount = Math.floor(Math.random() * 15) + 5;
    for (let i = 0; i < likeCount; i++) {
      try {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.REEL_INTERACTIONS,
          ID.unique(),
          {
            userId: randomUser.$id,
            targetId: project.$id,
            targetType: 'project',
            type: 'like',
            isActive: true,
            metadata: JSON.stringify({ timestamp: new Date().toISOString() })
          }
        );
      } catch (error) {
        // Ignore duplicate errors
      }
    }
  }

  console.log(`  ✅ Created interactions for ${projects.length} projects`);
}

async function main() {
  console.log('🚀 Starting Simple Data Seeding...\n');

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
      !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
      !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ||
      !process.env.APPWRITE_API_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  try {
    // Create all data
    const users = await createUsers();
    await createSkillsAndCategories();
    const projects = await createProjects(users);
    await createPortfolio(users);
    await createReviews(projects, users);
    await createNotifications(users);
    await createInteractions(users, projects);

    console.log('\n🎉 Data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`  👥 Users: ${users.length}`);
    console.log(`  🛠️ Skills: ${skills.length}`);
    console.log(`  📁 Categories: ${categories.length}`);
    console.log(`  💼 Projects: ${projects.length}`);
    console.log(`  🎨 Portfolio items: ${users.filter(u => u.userType === 'freelancer').length * 3}`);
    console.log(`  ⭐ Reviews: ${projects.filter(p => p.status === 'completed').length}`);
    console.log(`  🔔 Notifications: ${users.length * 3}`);
    console.log(`  💫 Interactions: Created for all projects`);

    console.log('\n✨ Your H-AI platform is now populated with realistic data!');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
