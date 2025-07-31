import { databases, ID } from "./appwrite";
import { DATABASE_ID, COLLECTIONS } from "./appwrite/database";
import { StorageService, STORAGE_BUCKETS } from "./appwrite/storage";

export interface SeedProgress {
  stage: string;
  progress: number;
  message: string;
}

export class RealDataSeeder {
  private progressCallback?: (progress: SeedProgress) => void;

  constructor(progressCallback?: (progress: SeedProgress) => void) {
    this.progressCallback = progressCallback;
  }

  private updateProgress(stage: string, progress: number, message: string) {
    if (this.progressCallback) {
      this.progressCallback({ stage, progress, message });
    }
    console.log(`[${stage}] ${progress}% - ${message}`);
  }

  // Real freelancer profiles
  private getFreelancerProfiles() {
    return [
      {
        name: "Alexandra Chen",
        email: "alexandra.chen@techmail.com",
        userType: "freelancer",
        bio: "Senior AI/ML Engineer with 6+ years of experience in computer vision, NLP, and deep learning. Specialized in building production-ready AI systems for startups and enterprises.",
        skills: [
          "Python",
          "TensorFlow",
          "PyTorch",
          "Computer Vision",
          "NLP",
          "OpenAI API",
          "LangChain",
          "AWS",
          "Docker",
        ],
        languages: [
          { name: "English", level: "Native" },
          { name: "Mandarin", level: "Native" },
          { name: "Spanish", level: "Intermediate" },
        ],
        hourlyRate: 95,
        location: "San Francisco, CA",
        verified: true,
        availability: "available",
        rating: 4.9,
        reviewsCount: 47,
        completedJobs: 32,
        totalEarnings: 125000,
        successRate: 96,
        responseTime: "1 hour",
        timezone: "PST",
        memberSince: "2021-03-15",
        avatar: null, // Will be set after uploading to storage
      },
      {
        name: "Marcus Thompson",
        email: "marcus.thompson@aidev.com",
        userType: "freelancer",
        bio: "Full-stack developer specializing in AI-powered web applications. Expert in React, Node.js, and integrating AI APIs to create intelligent user experiences.",
        skills: [
          "React",
          "Node.js",
          "TypeScript",
          "Python",
          "OpenAI API",
          "Stripe",
          "PostgreSQL",
          "Redis",
          "Next.js",
        ],
        languages: [
          { name: "English", level: "Native" },
          { name: "German", level: "Intermediate" },
        ],
        hourlyRate: 78,
        location: "Austin, TX",
        verified: true,
        availability: "available",
        rating: 4.8,
        reviewsCount: 34,
        completedJobs: 28,
        totalEarnings: 89000,
        successRate: 94,
        responseTime: "2 hours",
        timezone: "CST",
        memberSince: "2022-01-10",
        avatar: null, // Will be set after uploading to storage
      },
      {
        name: "Sofia Rodriguez",
        email: "sofia.rodriguez@creativai.es",
        userType: "freelancer",
        bio: "Creative AI specialist and prompt engineer. I help brands create stunning visual content using Midjourney, DALL-E, and other generative AI tools.",
        skills: [
          "Midjourney",
          "DALL-E",
          "Stable Diffusion",
          "Prompt Engineering",
          "Adobe Creative Suite",
          "Figma",
          "Canva",
        ],
        languages: [
          { name: "Spanish", level: "Native" },
          { name: "English", level: "Fluent" },
          { name: "French", level: "Intermediate" },
        ],
        hourlyRate: 65,
        location: "Barcelona, Spain",
        verified: true,
        availability: "busy",
        rating: 4.9,
        reviewsCount: 56,
        completedJobs: 41,
        totalEarnings: 72000,
        successRate: 98,
        responseTime: "1 hour",
        timezone: "CET",
        memberSince: "2021-08-22",
        avatar: null, // Will be set after uploading to storage
      },
      {
        name: "David Kim",
        email: "david.kim@mlconsult.kr",
        userType: "freelancer",
        bio: "Data scientist and machine learning consultant. Specialized in predictive analytics, recommendation systems, and MLOps for e-commerce and fintech.",
        skills: [
          "Python",
          "R",
          "TensorFlow",
          "Scikit-learn",
          "SQL",
          "Tableau",
          "AWS SageMaker",
          "Apache Spark",
          "MLflow",
        ],
        languages: [
          { name: "Korean", level: "Native" },
          { name: "English", level: "Fluent" },
          { name: "Japanese", level: "Basic" },
        ],
        hourlyRate: 88,
        location: "Seoul, South Korea",
        verified: true,
        availability: "available",
        rating: 4.7,
        reviewsCount: 29,
        completedJobs: 23,
        totalEarnings: 67000,
        successRate: 92,
        responseTime: "3 hours",
        timezone: "KST",
        memberSince: "2022-05-18",
        avatar: null, // Will be set after uploading to storage
      },
      {
        name: "Emma Watson",
        email: "emma.watson@aibranding.uk",
        userType: "freelancer",
        bio: "AI-powered branding and marketing specialist. I create comprehensive brand strategies using AI tools for content creation, market analysis, and customer insights.",
        skills: [
          "Brand Strategy",
          "Marketing Automation",
          "ChatGPT",
          "Jasper AI",
          "HubSpot",
          "Google Analytics",
          "Social Media",
        ],
        languages: [
          { name: "English", level: "Native" },
          { name: "French", level: "Fluent" },
        ],
        hourlyRate: 72,
        location: "London, UK",
        verified: true,
        availability: "available",
        rating: 4.8,
        reviewsCount: 38,
        completedJobs: 31,
        totalEarnings: 58000,
        successRate: 95,
        responseTime: "2 hours",
        timezone: "GMT",
        memberSince: "2021-11-05",
        avatar: null, // Will be set after uploading to storage
      },
    ];
  }

  // Real client profiles
  private getClientProfiles() {
    return [
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@techstartup.com",
        userType: "client",
        bio: "CTO at TechStartup Inc. Looking for AI specialists to help build our next-generation customer service platform.",
        location: "New York, NY",
        verified: true,
        rating: 4.6,
        reviewsCount: 12,
        completedJobs: 8,
        memberSince: "2023-01-12",
        avatar: null, // Will be set after uploading to storage
      },
      {
        name: "Michael Chen",
        email: "michael.chen@ecommerce.co",
        userType: "client",
        bio: "Head of Product at E-commerce Solutions. We need AI integration for personalized shopping experiences.",
        location: "Seattle, WA",
        verified: true,
        rating: 4.8,
        reviewsCount: 15,
        completedJobs: 11,
        memberSince: "2022-09-08",
        avatar: null, // Will be set after uploading to storage
      },
      {
        name: "Lisa Rodriguez",
        email: "lisa.rodriguez@digitalagency.com",
        userType: "client",
        bio: "Creative Director at Digital Agency. Seeking AI artists for our clients marketing campaigns.",
        location: "Miami, FL",
        verified: true,
        rating: 4.7,
        reviewsCount: 9,
        completedJobs: 7,
        memberSince: "2023-03-20",
        avatar: null, // Will be set after uploading to storage
      },
    ];
  }

  // Real project data
  private getProjectData() {
    return [
      {
        title: "AI-Powered Customer Service Chatbot",
        description:
          "Develop an intelligent chatbot using GPT-4 that can handle customer inquiries, process orders, and provide 24/7 support. Must integrate with our existing CRM system.",
        category: "AI Development",
        subcategory: "Chatbots",
        skills: ["Python", "OpenAI API", "LangChain", "FastAPI", "PostgreSQL"],
        budget: 4500,
        currency: "USD",
        budgetType: "fixed",
        duration: "6 weeks",
        urgency: "high",
        status: "in_progress",
        experienceLevel: "expert",
        remote: true,
        featured: true,
      },
      {
        title: "E-commerce Product Recommendation System",
        description:
          "Build a machine learning model for personalized product recommendations. Need to analyze user behavior, purchase history, and implement real-time recommendations.",
        category: "Machine Learning",
        subcategory: "Recommendation Systems",
        skills: [
          "Python",
          "TensorFlow",
          "Collaborative Filtering",
          "AWS",
          "Docker",
        ],
        budget: 6200,
        currency: "USD",
        budgetType: "fixed",
        duration: "8 weeks",
        urgency: "medium",
        status: "completed",
        experienceLevel: "expert",
        remote: true,
        featured: false,
      },
      {
        title: "AI-Generated Marketing Content Campaign",
        description:
          "Create a complete marketing campaign using AI tools. Need 50+ social media posts, blog articles, and promotional materials for our fintech startup.",
        category: "Creative AI",
        subcategory: "Content Creation",
        skills: ["Midjourney", "ChatGPT", "Canva", "Content Strategy"],
        budget: 2800,
        currency: "USD",
        budgetType: "fixed",
        duration: "4 weeks",
        urgency: "medium",
        status: "completed",
        experienceLevel: "intermediate",
        remote: true,
        featured: true,
      },
      {
        title: "Computer Vision for Quality Control",
        description:
          "Develop a computer vision system to detect defects in manufacturing products. Need real-time processing and integration with existing production line.",
        category: "Computer Vision",
        subcategory: "Quality Control",
        skills: [
          "Python",
          "OpenCV",
          "TensorFlow",
          "Edge Computing",
          "Industrial IoT",
        ],
        budget: 8900,
        currency: "USD",
        budgetType: "fixed",
        duration: "10 weeks",
        urgency: "low",
        status: "open",
        experienceLevel: "expert",
        remote: false,
        featured: false,
      },
      {
        title: "Natural Language Processing for Legal Documents",
        description:
          "Build an NLP system to extract key information from legal contracts and automate document classification and summarization.",
        category: "NLP",
        subcategory: "Document Processing",
        skills: ["Python", "spaCy", "BERT", "Legal Tech", "Document AI"],
        budget: 7500,
        currency: "USD",
        budgetType: "fixed",
        duration: "12 weeks",
        urgency: "medium",
        status: "open",
        experienceLevel: "expert",
        remote: true,
        featured: true,
      },
    ];
  }

  // Skills and categories
  private getSkillsData() {
    return [
      {
        name: "Python",
        category: "Programming",
        subcategory: "Backend",
        popularity: 95,
        averageRate: 75,
      },
      {
        name: "TensorFlow",
        category: "AI/ML",
        subcategory: "Deep Learning",
        popularity: 88,
        averageRate: 85,
      },
      {
        name: "PyTorch",
        category: "AI/ML",
        subcategory: "Deep Learning",
        popularity: 82,
        averageRate: 85,
      },
      {
        name: "OpenAI API",
        category: "AI/ML",
        subcategory: "LLM",
        popularity: 91,
        averageRate: 80,
      },
      {
        name: "React",
        category: "Frontend",
        subcategory: "JavaScript",
        popularity: 93,
        averageRate: 70,
      },
      {
        name: "Node.js",
        category: "Backend",
        subcategory: "JavaScript",
        popularity: 89,
        averageRate: 68,
      },
      {
        name: "Computer Vision",
        category: "AI/ML",
        subcategory: "Vision",
        popularity: 76,
        averageRate: 90,
      },
      {
        name: "NLP",
        category: "AI/ML",
        subcategory: "Language",
        popularity: 78,
        averageRate: 88,
      },
      {
        name: "Midjourney",
        category: "Creative AI",
        subcategory: "Image Generation",
        popularity: 85,
        averageRate: 60,
      },
      {
        name: "DALL-E",
        category: "Creative AI",
        subcategory: "Image Generation",
        popularity: 79,
        averageRate: 58,
      },
    ];
  }

  private getCategoriesData() {
    return [
      {
        name: "AI Development",
        slug: "ai-development",
        description: "AI and ML development projects",
        icon: "🤖",
        parentId: null,
        projectCount: 0,
      },
      {
        name: "Creative AI",
        slug: "creative-ai",
        description: "AI-powered creative projects",
        icon: "🎨",
        parentId: null,
        projectCount: 0,
      },
      {
        name: "Data Science",
        slug: "data-science",
        description: "Data analysis and ML projects",
        icon: "📊",
        parentId: null,
        projectCount: 0,
      },
      {
        name: "Web Development",
        slug: "web-development",
        description: "Web development with AI integration",
        icon: "💻",
        parentId: null,
        projectCount: 0,
      },
      {
        name: "Chatbots",
        slug: "chatbots",
        description: "Conversational AI and chatbots",
        icon: "💬",
        parentId: "ai-development",
        projectCount: 0,
      },
    ];
  }

  // Portfolio items
  private getPortfolioData(userId: string) {
    const portfolioTemplates = [
      {
        title: "AI-Powered E-commerce Chatbot",
        description:
          "Developed an intelligent chatbot that increased customer satisfaction by 40% and reduced support tickets by 60%.",
        category: "AI Development",
        skills: ["Python", "OpenAI API", "FastAPI", "PostgreSQL"],
        clientName: "TechMart Inc.",
        budget: 3500,
        duration: "5 weeks",
        featured: true,
        tags: ["chatbot", "e-commerce", "customer-service"],
      },
      {
        title: "Computer Vision Quality Control System",
        description:
          "Built a real-time defect detection system for manufacturing, achieving 99.2% accuracy in quality control.",
        category: "Computer Vision",
        skills: ["Python", "OpenCV", "TensorFlow", "Edge Computing"],
        clientName: "ManufacturingCorp",
        budget: 8500,
        duration: "8 weeks",
        featured: true,
        tags: ["computer-vision", "manufacturing", "quality-control"],
      },
      {
        title: "Social Media Content Generator",
        description:
          "Created an AI tool that generates engaging social media content, increasing engagement rates by 75%.",
        category: "Creative AI",
        skills: ["GPT-4", "Midjourney", "Social Media APIs"],
        clientName: "Digital Agency Pro",
        budget: 2200,
        duration: "3 weeks",
        featured: false,
        tags: ["content-generation", "social-media", "marketing"],
      },
    ];

    return portfolioTemplates.map((template) => ({
      ...template,
      userId,
      images: [], // Will be populated from storage
      projectUrl: `https://demo-project-${Math.random().toString(36).substr(2, 9)}.com`,
      completionDate: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      isPublic: true,
      views: Math.floor(Math.random() * 500) + 50,
      likes: Math.floor(Math.random() * 50) + 5,
      files: [], // Will store file IDs from storage
    }));
  }

  // Upload default avatars to storage
  async uploadDefaultAvatars() {
    this.updateProgress("avatars", 0, "Uploading default avatars...");

    const avatarUrls = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face", // Позитивный мужчина, улыбается
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face", // Счастливая девушка с улыбкой
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face", // Дружелюбный мужчина
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face", // Позитивная девушка
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face", // Улыбающийся мужчина
      "https://images.unsplash.com/photo-1598966739654-5e9a252d8c32?w=400&h=400&fit=crop&crop=face", // Радостная девушка
      "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop&crop=face", // Счастливый человек
      "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face", // Позитивная девушка с улыбкой
    ];

    const uploadedAvatars = [];

    for (let i = 0; i < avatarUrls.length; i++) {
      try {
        // Download image and convert to File object
        const response = await fetch(avatarUrls[i]);
        const blob = await response.blob();
        const file = new File([blob], `avatar_${i + 1}.jpg`, {
          type: "image/jpeg",
        });

        // Upload to Appwrite Storage
        const uploadResult = await StorageService.uploadFile(
          STORAGE_BUCKETS.AVATARS,
          file,
          `default_avatar_${i + 1}`,
        );

        uploadedAvatars.push(uploadResult.url);
        this.updateProgress(
          "avatars",
          Math.round(((i + 1) / avatarUrls.length) * 100),
          `Uploaded avatar ${i + 1}`,
        );
      } catch (error) {
        console.error(`Error uploading avatar ${i + 1}:`, error);
        // Fallback to original URL
        uploadedAvatars.push(avatarUrls[i]);
      }
    }

    return uploadedAvatars;
  }

  // Seed users with real storage avatars
  async seedUsers() {
    this.updateProgress("users", 0, "Starting user creation...");

    // First upload avatars to storage
    const avatarUrls = await this.uploadDefaultAvatars();

    const freelancers = this.getFreelancerProfiles();
    const clients = this.getClientProfiles();
    const allUsers = [...freelancers, ...clients];

    const createdUsers = [];

    for (let i = 0; i < allUsers.length; i++) {
      const userData = allUsers[i];

      try {
        const user = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          ID.unique(),
          {
            ...userData,
            avatar: avatarUrls[i % avatarUrls.length], // Assign avatar from storage
            online: Math.random() > 0.4,
            lastSeen: new Date(
              Date.now() - Math.random() * 24 * 60 * 60 * 1000,
            ).toISOString(),
            badges: userData.verified ? ["verified", "top_rated"] : [],
            workingHours: JSON.stringify({
              monday: { start: "09:00", end: "17:00", available: true },
              tuesday: { start: "09:00", end: "17:00", available: true },
              wednesday: { start: "09:00", end: "17:00", available: true },
              thursday: { start: "09:00", end: "17:00", available: true },
              friday: { start: "09:00", end: "17:00", available: true },
              saturday: { start: "10:00", end: "14:00", available: false },
              sunday: { start: "10:00", end: "14:00", available: false },
            }),
            socialLinks: JSON.stringify({
              linkedin: `https://linkedin.com/in/${userData.name.toLowerCase().replace(" ", "-")}`,
              github: `https://github.com/${userData.name.toLowerCase().replace(" ", "")}`,
              portfolio: `https://${userData.name.toLowerCase().replace(" ", "")}.dev`,
            }),
            preferences: JSON.stringify({
              emailNotifications: true,
              pushNotifications: true,
              marketingEmails: false,
              theme: "dark",
              language: "en",
            }),
          },
        );

        createdUsers.push(user);
        this.updateProgress(
          "users",
          Math.round(((i + 1) / allUsers.length) * 100),
          `Created user: ${userData.name}`,
        );
      } catch (error: any) {
        console.error(`Error creating user ${userData.name}:`, error);
      }
    }

    return createdUsers;
  }

  // Seed skills and categories
  async seedSkillsAndCategories() {
    this.updateProgress("skills", 0, "Creating skills...");

    const skills = this.getSkillsData();
    const categories = this.getCategoriesData();

    // Create skills
    const createdSkills = [];
    for (let i = 0; i < skills.length; i++) {
      try {
        const skill = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.SKILLS,
          ID.unique(),
          {
            ...skills[i],
            isActive: true,
          },
        );
        createdSkills.push(skill);
        this.updateProgress(
          "skills",
          Math.round(((i + 1) / skills.length) * 50),
          `Created skill: ${skills[i].name}`,
        );
      } catch (error) {
        console.error(`Error creating skill ${skills[i].name}:`, error);
      }
    }

    // Create categories
    const createdCategories = [];
    for (let i = 0; i < categories.length; i++) {
      try {
        const category = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.CATEGORIES,
          ID.unique(),
          {
            ...categories[i],
            isActive: true,
            sortOrder: i + 1,
          },
        );
        createdCategories.push(category);
        this.updateProgress(
          "skills",
          Math.round(50 + ((i + 1) / categories.length) * 50),
          `Created category: ${categories[i].name}`,
        );
      } catch (error) {
        console.error(`Error creating category ${categories[i].name}:`, error);
      }
    }

    return { skills: createdSkills, categories: createdCategories };
  }

  // Seed projects
  async seedProjects(users: any[]) {
    this.updateProgress("projects", 0, "Creating projects...");

    const projects = this.getProjectData();
    const clients = users.filter((u) => u.userType === "client");
    const freelancers = users.filter((u) => u.userType === "freelancer");

    const createdProjects = [];

    for (let i = 0; i < projects.length; i++) {
      const projectData = projects[i];

      try {
        const randomClient =
          clients[Math.floor(Math.random() * clients.length)];
        const randomFreelancer =
          projectData.status !== "open"
            ? freelancers[Math.floor(Math.random() * freelancers.length)]
            : null;

        const project = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.PROJECTS,
          ID.unique(),
          {
            ...projectData,
            clientId: randomClient.$id,
            freelancerId: randomFreelancer?.$id || null,
            attachments: [],
            proposals: Math.floor(Math.random() * 15) + 3,
            views: Math.floor(Math.random() * 200) + 25,
            tags: projectData.skills.slice(0, 3),
            requirements:
              "Detailed project requirements will be provided upon selection. Must have relevant portfolio examples.",
            deliverables:
              "Complete source code, documentation, deployment guide, and 3 months of support.",
            deadline: new Date(
              Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            startDate:
              projectData.status !== "open"
                ? new Date(
                    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
                  ).toISOString()
                : null,
            completedAt:
              projectData.status === "completed"
                ? new Date(
                    Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
                  ).toISOString()
                : null,
          },
        );

        createdProjects.push(project);
        this.updateProgress(
          "projects",
          Math.round(((i + 1) / projects.length) * 100),
          `Created project: ${projectData.title}`,
        );
      } catch (error) {
        console.error(`Error creating project ${projectData.title}:`, error);
      }
    }

    return createdProjects;
  }

  // Upload portfolio images to storage
  async uploadPortfolioImages() {
    this.updateProgress("portfolio-images", 0, "Uploading portfolio images...");

    const imageUrls = [
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
    ];

    const uploadedImages = [];

    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const response = await fetch(imageUrls[i]);
        const blob = await response.blob();
        const file = new File([blob], `portfolio_${i + 1}.jpg`, {
          type: "image/jpeg",
        });

        const uploadResult = await StorageService.uploadFile(
          STORAGE_BUCKETS.PORTFOLIO,
          file,
          `portfolio_image_${i + 1}`,
        );

        uploadedImages.push(uploadResult.url);
        this.updateProgress(
          "portfolio-images",
          Math.round(((i + 1) / imageUrls.length) * 100),
          `Uploaded image ${i + 1}`,
        );
      } catch (error) {
        console.error(`Error uploading portfolio image ${i + 1}:`, error);
        uploadedImages.push(imageUrls[i]);
      }
    }

    return uploadedImages;
  }

  // Seed portfolio items with real storage images
  async seedPortfolio(users: any[]) {
    this.updateProgress("portfolio", 0, "Creating portfolio items...");

    // First upload portfolio images to storage
    const portfolioImages = await this.uploadPortfolioImages();

    const freelancers = users.filter((u) => u.userType === "freelancer");
    const createdPortfolio = [];

    let totalItems = 0;
    for (const freelancer of freelancers) {
      const portfolioItems = this.getPortfolioData(freelancer.$id);

      for (let i = 0; i < portfolioItems.length; i++) {
        try {
          // Assign real images from storage
          const portfolioItemWithImages = {
            ...portfolioItems[i],
            images: [
              portfolioImages[i % portfolioImages.length],
              portfolioImages[(i + 1) % portfolioImages.length],
            ],
          };

          const portfolioItem = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PORTFOLIO,
            ID.unique(),
            portfolioItemWithImages,
          );

          createdPortfolio.push(portfolioItem);
          totalItems++;
          this.updateProgress(
            "portfolio",
            Math.round((totalItems / (freelancers.length * 3)) * 100),
            `Created portfolio item: ${portfolioItems[i].title}`,
          );
        } catch (error) {
          console.error(`Error creating portfolio item:`, error);
        }
      }
    }

    return createdPortfolio;
  }

  // Seed reviews
  async seedReviews(projects: any[], users: any[]) {
    this.updateProgress("reviews", 0, "Creating reviews...");

    const completedProjects = projects.filter((p) => p.status === "completed");
    const createdReviews = [];

    const reviewTemplates = [
      {
        rating: 5,
        comment:
          "Outstanding work! The AI solution exceeded our expectations and was delivered ahead of schedule. Excellent communication throughout the project.",
        communication: 5,
        quality: 5,
        timeliness: 5,
        wouldRecommend: true,
        isPublic: true,
      },
      {
        rating: 4,
        comment:
          "Great technical skills and delivered quality work. Minor delays in communication but overall very satisfied with the results.",
        communication: 4,
        quality: 5,
        timeliness: 4,
        wouldRecommend: true,
        isPublic: true,
      },
      {
        rating: 5,
        comment:
          "Incredible AI expertise! The machine learning model performs perfectly and the documentation is comprehensive. Will definitely hire again.",
        communication: 5,
        quality: 5,
        timeliness: 5,
        wouldRecommend: true,
        isPublic: true,
      },
    ];

    for (let i = 0; i < completedProjects.length; i++) {
      const project = completedProjects[i];
      const reviewTemplate = reviewTemplates[i % reviewTemplates.length];

      try {
        const review = await databases.createDocument(
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
              project.skills.slice(0, 3).reduce((acc: any, skill: string) => {
                acc[skill] = Math.floor(Math.random() * 2) + 4; // 4-5 rating
                return acc;
              }, {}),
            ),
          },
        );

        createdReviews.push(review);
        this.updateProgress(
          "reviews",
          Math.round(((i + 1) / completedProjects.length) * 100),
          `Created review for project: ${project.title}`,
        );
      } catch (error) {
        console.error(`Error creating review:`, error);
      }
    }

    return createdReviews;
  }

  // Seed notifications
  async seedNotifications(users: any[]) {
    this.updateProgress("notifications", 0, "Creating notifications...");

    const notificationTemplates = [
      {
        title: "New Project Proposal",
        message:
          "You received a new proposal for your AI Chatbot Development project.",
        type: "project",
        priority: "high",
        actionUrl: "/projects/123/proposals",
      },
      {
        title: "Payment Received",
        message: "You received a payment of $2,500 for the completed project.",
        type: "payment",
        priority: "normal",
        actionUrl: "/payments/history",
      },
      {
        title: "New Message",
        message: "You have a new message from a potential client.",
        type: "message",
        priority: "normal",
        actionUrl: "/messages",
      },
    ];

    const createdNotifications = [];

    for (const user of users) {
      for (let i = 0; i < 3; i++) {
        const template = notificationTemplates[i];

        try {
          const notification = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            ID.unique(),
            {
              ...template,
              userId: user.$id,
              relatedId: `related_${Math.random().toString(36).substr(2, 9)}`,
              relatedType: template.type,
              isRead: Math.random() > 0.6,
              readAt:
                Math.random() > 0.6
                  ? new Date(
                      Date.now() - Math.random() * 24 * 60 * 60 * 1000,
                    ).toISOString()
                  : null,
            },
          );

          createdNotifications.push(notification);
        } catch (error) {
          console.error(`Error creating notification:`, error);
        }
      }
    }

    this.updateProgress(
      "notifications",
      100,
      `Created ${createdNotifications.length} notifications`,
    );
    return createdNotifications;
  }

  // Seed conversations and messages
  async seedConversations(users: any[], projects: any[]) {
    this.updateProgress("conversations", 0, "Creating conversations...");

    const createdConversations = [];
    const createdMessages = [];

    // Create conversations between clients and freelancers
    for (let i = 0; i < Math.min(projects.length, 5); i++) {
      const project = projects[i];

      try {
        const conversation = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.CONVERSATIONS,
          ID.unique(),
          {
            participants: [project.clientId, project.freelancerId].filter(
              Boolean,
            ),
            projectId: project.$id,
            title: `Project: ${project.title}`,
            lastMessage: "Looking forward to working together!",
            lastMessageAt: new Date().toISOString(),
            lastMessageBy: project.clientId,
            unreadCount: JSON.stringify({
              [project.clientId]: 0,
              [project.freelancerId || "none"]: 1,
            }),
            isArchived: false,
          },
        );

        createdConversations.push(conversation);

        // Create some messages for this conversation
        const messages = [
          {
            senderId: project.clientId,
            receiverId: project.freelancerId,
            content:
              "Hi! I reviewed your portfolio and I think you're perfect for this project. When can we start?",
            messageType: "text",
            isRead: true,
          },
          {
            senderId: project.freelancerId,
            receiverId: project.clientId,
            content:
              "Thank you! I can start immediately. I have a few questions about the requirements...",
            messageType: "text",
            isRead: false,
          },
        ];

        for (const msgData of messages) {
          if (msgData.receiverId) {
            const message = await databases.createDocument(
              DATABASE_ID,
              COLLECTIONS.MESSAGES,
              ID.unique(),
              {
                ...msgData,
                conversationId: conversation.$id,
                attachments: [],
                readAt: msgData.isRead ? new Date().toISOString() : null,
                isDeleted: false,
              },
            );
            createdMessages.push(message);
          }
        }

        this.updateProgress(
          "conversations",
          Math.round(((i + 1) / 5) * 100),
          `Created conversation for: ${project.title}`,
        );
      } catch (error) {
        console.error(`Error creating conversation:`, error);
      }
    }

    return { conversations: createdConversations, messages: createdMessages };
  }

  // Main method to seed all data
  async seedAllData() {
    this.updateProgress("overall", 0, "Starting data seeding process...");

    try {
      // 1. Create users with real avatars (15%)
      this.updateProgress("overall", 0, "Creating users with avatars...");
      const users = await this.seedUsers();
      this.updateProgress(
        "overall",
        15,
        `Created ${users.length} users with storage avatars`,
      );

      // 2. Create skills and categories (25%)
      this.updateProgress("overall", 15, "Creating skills and categories...");
      const { skills, categories } = await this.seedSkillsAndCategories();
      this.updateProgress(
        "overall",
        25,
        `Created ${skills.length} skills and ${categories.length} categories`,
      );

      // 3. Create projects (45%)
      this.updateProgress("overall", 25, "Creating projects...");
      const projects = await this.seedProjects(users);
      this.updateProgress("overall", 45, `Created ${projects.length} projects`);

      // 4. Create portfolio items with real images (60%)
      this.updateProgress(
        "overall",
        45,
        "Creating portfolio items with storage images...",
      );
      const portfolio = await this.seedPortfolio(users);
      this.updateProgress(
        "overall",
        60,
        `Created ${portfolio.length} portfolio items with storage images`,
      );

      // 5. Create reviews (75%)
      this.updateProgress("overall", 60, "Creating reviews...");
      const reviews = await this.seedReviews(projects, users);
      this.updateProgress("overall", 75, `Created ${reviews.length} reviews`);

      // 6. Create notifications (85%)
      this.updateProgress("overall", 75, "Creating notifications...");
      const notifications = await this.seedNotifications(users);
      this.updateProgress(
        "overall",
        85,
        `Created ${notifications.length} notifications`,
      );

      // 7. Create conversations and messages (100%)
      this.updateProgress("overall", 85, "Creating conversations...");
      const { conversations, messages } = await this.seedConversations(
        users,
        projects,
      );
      this.updateProgress(
        "overall",
        100,
        `Created ${conversations.length} conversations and ${messages.length} messages`,
      );

      this.updateProgress(
        "overall",
        100,
        "✅ Data seeding completed successfully!",
      );

      return {
        users,
        skills,
        categories,
        projects,
        portfolio,
        reviews,
        notifications,
        conversations,
        messages,
        summary: {
          users: users.length,
          skills: skills.length,
          categories: categories.length,
          projects: projects.length,
          portfolio: portfolio.length,
          reviews: reviews.length,
          notifications: notifications.length,
          conversations: conversations.length,
          messages: messages.length,
        },
      };
    } catch (error) {
      console.error("Error during data seeding:", error);
      this.updateProgress("overall", -1, `❌ Error: ${error.message}`);
      throw error;
    }
  }

  // Clean all data (useful for re-seeding)
  async cleanAllData() {
    this.updateProgress("cleanup", 0, "Starting data cleanup...");

    const collections = [
      COLLECTIONS.MESSAGES,
      COLLECTIONS.CONVERSATIONS,
      COLLECTIONS.NOTIFICATIONS,
      COLLECTIONS.REVIEWS,
      COLLECTIONS.PORTFOLIO,
      COLLECTIONS.PROJECTS,
      COLLECTIONS.SKILLS,
      COLLECTIONS.CATEGORIES,
      COLLECTIONS.USERS,
    ];

    let completed = 0;
    for (const collection of collections) {
      try {
        const documents = await databases.listDocuments(
          DATABASE_ID,
          collection,
        );

        for (const doc of documents.documents) {
          await databases.deleteDocument(DATABASE_ID, collection, doc.$id);
        }

        completed++;
        this.updateProgress(
          "cleanup",
          Math.round((completed / collections.length) * 100),
          `Cleaned ${collection}: ${documents.documents.length} documents`,
        );
      } catch (error) {
        console.error(`Error cleaning ${collection}:`, error);
      }
    }

    this.updateProgress("cleanup", 100, "✅ Data cleanup completed");
  }
}
