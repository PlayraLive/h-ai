import { databases, ID } from './appwrite';

export class DemoDataCreator {
  private readonly DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

  // Создать демо пользователей
  async createDemoUsers() {
    const demoUsers = [
      {
        name: 'Alex Chen',
        email: 'alex.chen@example.com',
        userType: 'freelancer',
        bio: 'AI/ML Engineer specializing in computer vision and natural language processing. 5+ years of experience building production AI systems.',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'NLP', 'Machine Learning'],
        languages: ['English', 'Chinese'],
        hourlyRate: 85,
        location: 'San Francisco, CA',
        verified: true,
        availability: 'available',
        rating: 4.9,
        responseTime: '2 hours',
        timezone: 'PST'
      },
      {
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@example.com',
        userType: 'freelancer',
        bio: 'Creative AI artist and prompt engineer. I help businesses create stunning AI-generated content for marketing and branding.',
        skills: ['Midjourney', 'DALL-E', 'Stable Diffusion', 'Prompt Engineering', 'Creative Direction'],
        languages: ['English', 'Spanish'],
        hourlyRate: 65,
        location: 'Barcelona, Spain',
        verified: true,
        availability: 'available',
        rating: 4.8,
        responseTime: '1 hour',
        timezone: 'CET'
      },
      {
        name: 'David Kim',
        email: 'david.kim@example.com',
        userType: 'freelancer',
        bio: 'Full-stack developer with expertise in AI integration. I build web applications that leverage cutting-edge AI technologies.',
        skills: ['React', 'Node.js', 'Python', 'OpenAI API', 'LangChain', 'Vector Databases'],
        languages: ['English', 'Korean'],
        hourlyRate: 75,
        location: 'Seoul, South Korea',
        verified: true,
        availability: 'busy',
        rating: 4.7,
        responseTime: '4 hours',
        timezone: 'KST'
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        userType: 'client',
        bio: 'Marketing Director at TechCorp. Looking for AI specialists to help automate our content creation and customer service.',
        skills: [],
        languages: ['English'],
        location: 'New York, NY',
        verified: true,
        availability: 'available',
        rating: 4.6,
        responseTime: '6 hours',
        timezone: 'EST'
      },
      {
        name: 'Emma Thompson',
        email: 'emma.thompson@example.com',
        userType: 'freelancer',
        bio: 'Data scientist and AI consultant. I help companies implement AI solutions for business intelligence and predictive analytics.',
        skills: ['Python', 'R', 'SQL', 'Tableau', 'Machine Learning', 'Data Analysis'],
        languages: ['English', 'French'],
        hourlyRate: 90,
        location: 'London, UK',
        verified: true,
        availability: 'available',
        rating: 4.9,
        responseTime: '3 hours',
        timezone: 'GMT'
      }
    ];

    const createdUsers = [];

    for (const userData of demoUsers) {
      try {
        const user = await databases.createDocument(
          this.DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
          ID.unique(),
          {
            ...userData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isOnline: Math.random() > 0.3, // 70% chance of being online
            lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            badges: userData.verified ? ['verified', 'top_rated'] : [],
            portfolioItems: userData.userType === 'freelancer' ? Math.floor(Math.random() * 10) + 3 : 0,
            completedJobs: userData.userType === 'freelancer' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 20) + 5,
            totalEarnings: userData.userType === 'freelancer' ? Math.floor(Math.random() * 50000) + 10000 : Math.floor(Math.random() * 100000) + 20000,
            successRate: Math.floor(Math.random() * 20) + 80, // 80-100%
            reviewCount: Math.floor(Math.random() * 30) + 5
          }
        );
        
        createdUsers.push(user);
        console.log(`✅ Created user: ${userData.name}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`⚠️ User ${userData.name} already exists`);
        } else {
          console.error(`❌ Error creating user ${userData.name}:`, error);
        }
      }
    }

    return createdUsers;
  }

  // Создать демо проекты
  async createDemoProjects(users: any[]) {
    const freelancers = users.filter(u => u.userType === 'freelancer');
    const clients = users.filter(u => u.userType === 'client');

    if (freelancers.length === 0 || clients.length === 0) {
      console.log('⚠️ Need both freelancers and clients to create projects');
      return [];
    }

    const demoProjects = [
      {
        title: 'AI Chatbot Development',
        description: 'Build an intelligent customer service chatbot using OpenAI GPT-4',
        budget: 3500,
        status: 'completed',
        category: 'AI Development',
        skills: ['Python', 'OpenAI API', 'LangChain'],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'AI-Generated Marketing Content',
        description: 'Create a series of AI-generated images and copy for social media campaign',
        budget: 2000,
        status: 'in_progress',
        category: 'Creative AI',
        skills: ['Midjourney', 'DALL-E', 'Prompt Engineering'],
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Machine Learning Model for Sales Prediction',
        description: 'Develop and deploy ML model to predict sales trends',
        budget: 5000,
        status: 'in_progress',
        category: 'Machine Learning',
        skills: ['Python', 'TensorFlow', 'Data Analysis'],
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const createdProjects = [];

    for (const projectData of demoProjects) {
      try {
        const randomFreelancer = freelancers[Math.floor(Math.random() * freelancers.length)];
        const randomClient = clients[Math.floor(Math.random() * clients.length)];

        const project = await databases.createDocument(
          this.DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!,
          ID.unique(),
          {
            ...projectData,
            freelancer_id: randomFreelancer.$id,
            client_id: randomClient.$id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            progress: projectData.status === 'completed' ? 100 : Math.floor(Math.random() * 80) + 10
          }
        );
        
        createdProjects.push(project);
        console.log(`✅ Created project: ${projectData.title}`);
      } catch (error: any) {
        console.error(`❌ Error creating project ${projectData.title}:`, error);
      }
    }

    return createdProjects;
  }

  // Создать демо отзывы
  async createDemoReviews(projects: any[]) {
    const demoReviews = [
      {
        rating: 5,
        comment: 'Excellent work! The AI chatbot exceeded our expectations and was delivered on time.',
        helpful: true
      },
      {
        rating: 4,
        comment: 'Great communication and quality work. Would definitely hire again.',
        helpful: true
      },
      {
        rating: 5,
        comment: 'Outstanding AI expertise. The machine learning model is performing perfectly.',
        helpful: true
      }
    ];

    const createdReviews = [];

    for (let i = 0; i < Math.min(projects.length, demoReviews.length); i++) {
      try {
        const project = projects[i];
        const reviewData = demoReviews[i];

        const review = await databases.createDocument(
          this.DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID!,
          ID.unique(),
          {
            ...reviewData,
            project_id: project.$id,
            freelancer_id: project.freelancer_id,
            client_id: project.client_id,
            created_at: new Date().toISOString()
          }
        );
        
        createdReviews.push(review);
        console.log(`✅ Created review for project: ${project.title}`);
      } catch (error: any) {
        console.error(`❌ Error creating review:`, error);
      }
    }

    return createdReviews;
  }

  // Создать демо аналитику
  async createDemoAnalytics(users: any[]) {
    const analyticsData = [];

    for (const user of users) {
      // Создаем несколько записей аналитики для каждого пользователя
      const actions = ['user_login', 'profile_view', 'project_created', 'message_sent'];
      
      for (let i = 0; i < 5; i++) {
        try {
          const analytics = await databases.createDocument(
            this.DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_USER_ANALYTICS_COLLECTION_ID!,
            ID.unique(),
            {
              user_id: user.$id,
              action: actions[Math.floor(Math.random() * actions.length)],
              page: '/dashboard',
              timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              metadata: {
                userAgent: 'Mozilla/5.0 (compatible)',
                ip: '192.168.1.1'
              }
            }
          );
          
          analyticsData.push(analytics);
        } catch (error: any) {
          console.error(`❌ Error creating analytics:`, error);
        }
      }
    }

    console.log(`✅ Created ${analyticsData.length} analytics records`);
    return analyticsData;
  }

  // Создать все демо данные
  async createAllDemoData() {
    console.log('🚀 Starting demo data creation...');
    
    try {
      const users = await this.createDemoUsers();
      const projects = await this.createDemoProjects(users);
      const reviews = await this.createDemoReviews(projects);
      const analytics = await this.createDemoAnalytics(users);

      console.log('🎉 Demo data creation completed!');
      console.log(`Created: ${users.length} users, ${projects.length} projects, ${reviews.length} reviews, ${analytics.length} analytics`);
      
      return {
        users,
        projects,
        reviews,
        analytics
      };
    } catch (error) {
      console.error('❌ Error creating demo data:', error);
      throw error;
    }
  }
}
