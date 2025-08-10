const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6872a2e20006222a3ad1')
  .setKey('your_api_key_here'); // Замените на ваш API ключ

const databases = new Databases(client);
const DATABASE_ID = 'your_database_id'; // Замените на ваш ID базы данных
const JOBS_COLLECTION = 'jobs';

// Real job data
const realJobs = [
  {
    title: "AI-Powered Logo Design for Tech Startup",
    description: "We need a creative AI designer to create a modern, minimalist logo for our AI startup. The logo should convey innovation, trust, and cutting-edge technology. Requirements: - Modern, minimalist design - AI/tech theme - Scalable vector format - Brand guidelines document - 3-5 concept variations",
    category: "ai_design",
    subcategory: "logo_design",
    skills: ["AI Design", "Logo Design", "Branding", "Figma", "Adobe Illustrator"],
    budgetType: "fixed",
    budgetMin: 500,
    budgetMax: 1500,
    currency: "USD",
    duration: "2-3 weeks",
    experienceLevel: "intermediate",
    location: "Remote",
    status: "active",
    clientId: "client_001",
    clientName: "TechFlow AI",
    clientCompany: "TechFlow AI Inc.",
    clientAvatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40",
    featured: true,
    urgent: false,
    deadline: "2024-02-15T00:00:00.000Z",
    attachments: [],
    applicationsCount: 12,
    viewsCount: 45,
    tags: ["AI", "Logo", "Branding", "Startup"]
  },
  {
    title: "Machine Learning Model Development",
    description: "Looking for an experienced ML engineer to develop a recommendation system for our e-commerce platform. Must have experience with Python, TensorFlow, and large datasets. Project scope: - Data preprocessing and feature engineering - Model development and training - API integration - Performance optimization - Documentation and testing",
    category: "ai_development",
    subcategory: "machine_learning",
    skills: ["Machine Learning", "Python", "TensorFlow", "Data Science", "API Development"],
    budgetType: "fixed",
    budgetMin: 5000,
    budgetMax: 15000,
    currency: "USD",
    duration: "6-8 weeks",
    experienceLevel: "expert",
    location: "Remote",
    status: "active",
    clientId: "client_002",
    clientName: "ShopSmart Inc",
    clientCompany: "ShopSmart E-commerce",
    clientAvatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40",
    featured: false,
    urgent: true,
    deadline: "2024-03-15T00:00:00.000Z",
    attachments: [],
    applicationsCount: 8,
    viewsCount: 32,
    tags: ["ML", "Python", "E-commerce", "Recommendation System"]
  },
  {
    title: "AI Video Editing for YouTube Channel",
    description: "Need an AI video editor to create engaging content for our tech YouTube channel. Experience with AI-powered editing tools required. Responsibilities: - Video editing and post-production - AI-powered effects and transitions - Thumbnail design - SEO optimization - Content strategy consultation",
    category: "ai_content",
    subcategory: "video_editing",
    skills: ["AI Video Editing", "Adobe Premiere", "After Effects", "YouTube SEO", "Content Strategy"],
    budgetType: "hourly",
    budgetMin: 25,
    budgetMax: 40,
    currency: "USD",
    duration: "Ongoing",
    experienceLevel: "intermediate",
    location: "Remote",
    status: "active",
    clientId: "client_003",
    clientName: "TechTube Media",
    clientCompany: "TechTube Media Group",
    clientAvatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40",
    featured: true,
    urgent: false,
    deadline: "2024-04-01T00:00:00.000Z",
    attachments: [],
    applicationsCount: 15,
    viewsCount: 67,
    tags: ["Video Editing", "AI", "YouTube", "Content Creation"]
  },
  {
    title: "AI Chatbot Development for Customer Support",
    description: "Develop an intelligent chatbot for our customer support system using natural language processing. The chatbot should handle common inquiries and escalate complex issues to human agents. Features needed: - Natural language understanding - Integration with existing CRM - Analytics dashboard - Multi-language support - Learning capabilities",
    category: "ai_development",
    subcategory: "chatbot",
    skills: ["NLP", "Python", "Dialogflow", "API Integration", "Machine Learning"],
    budgetType: "fixed",
    budgetMin: 3000,
    budgetMax: 8000,
    currency: "USD",
    duration: "4-6 weeks",
    experienceLevel: "intermediate",
    location: "Remote",
    status: "active",
    clientId: "client_004",
    clientName: "SupportPro Solutions",
    clientCompany: "SupportPro Customer Solutions",
    clientAvatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40",
    featured: false,
    urgent: true,
    deadline: "2024-02-28T00:00:00.000Z",
    attachments: [],
    applicationsCount: 6,
    viewsCount: 28,
    tags: ["Chatbot", "NLP", "Customer Support", "AI"]
  },
  {
    title: "AI-Powered Content Writing for Tech Blog",
    description: "We need a skilled technical content writer to create engaging blog posts for our developer-focused platform. Content Requirements: - 8-10 blog posts per month - Topics: AI, Web Development, DevOps, Cybersecurity - 1500-2500 words per article - SEO optimization - Code examples and tutorials Ideal Candidate: - Technical writing experience - Knowledge of AI and development topics - SEO expertise - Portfolio of published work",
    category: "ai_content",
    subcategory: "content_writing",
    skills: ["Technical Writing", "SEO", "Content Strategy", "Developer Tools", "AI Knowledge"],
    budgetType: "hourly",
    budgetMin: 25,
    budgetMax: 40,
    currency: "USD",
    duration: "Ongoing",
    experienceLevel: "intermediate",
    location: "Remote",
    status: "active",
    clientId: "client_005",
    clientName: "DevHub Media",
    clientCompany: "DevHub Media Group",
    clientAvatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40",
    featured: true,
    urgent: false,
    deadline: "2024-03-30T00:00:00.000Z",
    attachments: [],
    applicationsCount: 18,
    viewsCount: 89,
    tags: ["Content Writing", "Tech Blog", "SEO", "AI"]
  }
];

async function createJobsCollection() {
  try {
    console.log('🔍 Checking if jobs collection exists...');
    
    try {
      await databases.getCollection(DATABASE_ID, JOBS_COLLECTION);
      console.log('✅ Jobs collection already exists');
    } catch (error) {
      console.log('📝 Creating jobs collection...');
      
      const collection = await databases.createCollection(
        DATABASE_ID,
        JOBS_COLLECTION,
        'Jobs Collection'
      );

      // Create attributes
      const attributes = [
        { key: 'title', type: 'string', required: true, size: 255 },
        { key: 'description', type: 'string', required: true, size: 1000 },
        { key: 'category', type: 'string', required: true, size: 100 },
        { key: 'subcategory', type: 'string', required: false, size: 100 },
        { key: 'skills', type: 'string[]', required: true, elements: [] },
        { key: 'budgetType', type: 'string', required: true, size: 50 },
        { key: 'budgetMin', type: 'integer', required: true, min: 0 },
        { key: 'budgetMax', type: 'integer', required: true, min: 0 },
        { key: 'currency', type: 'string', required: true, size: 10 },
        { key: 'duration', type: 'string', required: true, size: 100 },
        { key: 'experienceLevel', type: 'string', required: true, size: 50 },
        { key: 'location', type: 'string', required: true, size: 100 },
        { key: 'status', type: 'string', required: true, size: 50 },
        { key: 'clientId', type: 'string', required: true, size: 255 },
        { key: 'clientName', type: 'string', required: true, size: 255 },
        { key: 'clientCompany', type: 'string', required: false, size: 255 },
        { key: 'clientAvatar', type: 'string', required: false, size: 500 },
        { key: 'featured', type: 'boolean', required: true, default: false },
        { key: 'urgent', type: 'boolean', required: true, default: false },
        { key: 'deadline', type: 'string', required: false, size: 100 },
        { key: 'attachments', type: 'string[]', required: false, elements: [] },
        { key: 'applicationsCount', type: 'integer', required: true, min: 0, default: 0 },
        { key: 'viewsCount', type: 'integer', required: true, min: 0, default: 0 },
        { key: 'tags', type: 'string[]', required: false, elements: [] }
      ];

      for (const attr of attributes) {
        try {
          if (attr.type === 'string[]') {
            await databases.createStringAttribute(
              DATABASE_ID,
              JOBS_COLLECTION,
              attr.key,
              attr.size || 255,
              attr.required || false,
              attr.default,
              attr.elements || []
            );
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(
              DATABASE_ID,
              JOBS_COLLECTION,
              attr.key,
              attr.required || false,
              attr.min || 0,
              attr.max || 999999,
              attr.default || 0
            );
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(
              DATABASE_ID,
              JOBS_COLLECTION,
              attr.key,
              attr.required || false,
              attr.default || false
            );
          } else {
            await databases.createStringAttribute(
              DATABASE_ID,
              JOBS_COLLECTION,
              attr.key,
              attr.size || 255,
              attr.required || false,
              attr.default
            );
          }
          console.log(`✅ Created attribute: ${attr.key}`);
        } catch (error) {
          console.log(`⚠️ Attribute ${attr.key} already exists or error:`, error.message);
        }
      }

      // Create indexes
      try {
        await databases.createIndex(
          DATABASE_ID,
          JOBS_COLLECTION,
          'status_index',
          'key',
          ['status']
        );
        console.log('✅ Created status index');
      } catch (error) {
        console.log('⚠️ Status index already exists');
      }

      try {
        await databases.createIndex(
          DATABASE_ID,
          JOBS_COLLECTION,
          'category_index',
          'key',
          ['category']
        );
        console.log('✅ Created category index');
      } catch (error) {
        console.log('⚠️ Category index already exists');
      }

      try {
        await databases.createIndex(
          DATABASE_ID,
          JOBS_COLLECTION,
          'location_index',
          'key',
          ['location']
        );
        console.log('✅ Created location index');
      } catch (error) {
        console.log('⚠️ Location index already exists');
      }

      console.log('✅ Jobs collection created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating jobs collection:', error);
    throw error;
  }
}

async function createRealJobs() {
  try {
    console.log('🚀 Starting to create real jobs...');
    
    // First ensure collection exists
    await createJobsCollection();
    
    // Wait a bit for collection to be ready
    console.log('⏳ Waiting for collection to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const jobData of realJobs) {
      try {
        // Check if job already exists by title
        const existingJobs = await databases.listDocuments(
          DATABASE_ID,
          JOBS_COLLECTION,
          [/* Query.search('title', jobData.title) */]
        );
        
        const exists = existingJobs.documents.some(doc => 
          doc.title.toLowerCase() === jobData.title.toLowerCase()
        );
        
        if (exists) {
          console.log(`⏭️ Job "${jobData.title}" already exists, skipping...`);
          skippedCount++;
          continue;
        }
        
        console.log(`📝 Creating job: ${jobData.title}`);
        
        const job = await databases.createDocument(
          DATABASE_ID,
          JOBS_COLLECTION,
          ID.unique(),
          {
            ...jobData,
            applicationsCount: jobData.applicationsCount || 0,
            viewsCount: jobData.viewsCount || 0,
            status: 'active'
          }
        );
        
        console.log(`✅ Created job: ${job.title} (ID: ${job.$id})`);
        createdCount++;
        
        // Small delay between creations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error creating job "${jobData.title}":`, error);
      }
    }
    
    console.log(`\n🎉 Jobs creation completed!`);
    console.log(`✅ Created: ${createdCount} jobs`);
    console.log(`⏭️ Skipped: ${skippedCount} jobs (already existed)`);
    console.log(`📊 Total jobs in database: ${createdCount + skippedCount}`);
    
  } catch (error) {
    console.error('❌ Error in createRealJobs:', error);
  }
}

async function checkExistingJobs() {
  try {
    console.log('🔍 Checking existing jobs...');
    
    const jobs = await databases.listDocuments(
      DATABASE_ID,
      JOBS_COLLECTION,
      []
    );
    
    console.log(`📊 Found ${jobs.total} existing jobs:`);
    
    jobs.documents.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   - Budget: $${job.budgetMin} - $${job.budgetMax} ${job.currency}`);
      console.log(`   - Location: ${job.location}`);
      console.log(`   - Type: ${job.budgetType}`);
      console.log(`   - Applications: ${job.applicationsCount}`);
      console.log(`   - Posted: ${new Date(job.$createdAt).toLocaleDateString()}`);
      console.log(`   - Status: ${job.status}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error checking existing jobs:', error);
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting jobs setup...\n');
    
    // Check existing jobs first
    await checkExistingJobs();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Create new jobs
    await createRealJobs();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Check final state
    await checkExistingJobs();
    
    console.log('\n🎉 Jobs setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Main execution error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createRealJobs, checkExistingJobs, createJobsCollection };
