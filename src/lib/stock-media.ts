// Stock Media Service for Realistic Content
// Provides curated stock photos and videos for populating database

export interface StockImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  width: number;
  height: number;
  author?: string;
  license: 'unsplash' | 'pexels' | 'pixabay';
}

export interface StockVideo {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  duration: number;
  width: number;
  height: number;
  author?: string;
  license: 'pexels' | 'pixabay';
}

export interface UserAvatar {
  id: string;
  url: string;
  name: string;
  profession: string;
  gender: 'male' | 'female';
  ethnicity: string;
}

export class StockMediaService {
  // Professional AI/Tech focused avatars
  static getUserAvatars(): UserAvatar[] {
    return [
      {
        id: 'avatar-1',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        name: 'Alex Rodriguez',
        profession: 'AI Engineer',
        gender: 'male',
        ethnicity: 'hispanic'
      },
      {
        id: 'avatar-2',
        url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
        name: 'Sarah Chen',
        profession: 'Data Scientist',
        gender: 'female',
        ethnicity: 'asian'
      },
      {
        id: 'avatar-3',
        url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        name: 'David Kim',
        profession: 'ML Engineer',
        gender: 'male',
        ethnicity: 'asian'
      },
      {
        id: 'avatar-4',
        url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        name: 'Emma Watson',
        profession: 'AI Consultant',
        gender: 'female',
        ethnicity: 'caucasian'
      },
      {
        id: 'avatar-5',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        name: 'Michael Johnson',
        profession: 'Full Stack Developer',
        gender: 'male',
        ethnicity: 'african'
      },
      {
        id: 'avatar-6',
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
        name: 'Lisa Rodriguez',
        profession: 'UX Designer',
        gender: 'female',
        ethnicity: 'hispanic'
      },
      {
        id: 'avatar-7',
        url: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face',
        name: 'Marcus Thompson',
        profession: 'Blockchain Developer',
        gender: 'male',
        ethnicity: 'caucasian'
      },
      {
        id: 'avatar-8',
        url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
        name: 'Priya Patel',
        profession: 'AI Researcher',
        gender: 'female',
        ethnicity: 'indian'
      }
    ];
  }

  // Tech and AI project images
  static getProjectImages(): StockImage[] {
    return [
      {
        id: 'project-1',
        url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
        title: 'AI Dashboard Interface',
        description: 'Modern AI analytics dashboard with data visualization',
        tags: ['ai', 'dashboard', 'analytics', 'interface', 'data'],
        category: 'ai-development',
        width: 800,
        height: 600,
        license: 'unsplash'
      },
      {
        id: 'project-2',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        title: 'Data Science Visualization',
        description: 'Complex data analysis and machine learning visualization',
        tags: ['data-science', 'visualization', 'charts', 'analytics', 'ml'],
        category: 'data-science',
        width: 800,
        height: 600,
        license: 'unsplash'
      },
      {
        id: 'project-3',
        url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop',
        title: 'Mobile App Development',
        description: 'Modern mobile application with AI integration',
        tags: ['mobile', 'app', 'development', 'ui', 'modern'],
        category: 'app-development',
        width: 800,
        height: 600,
        license: 'unsplash'
      },
      {
        id: 'project-4',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        title: 'Business Analytics Platform',
        description: 'Enterprise business intelligence and analytics solution',
        tags: ['business', 'analytics', 'enterprise', 'charts', 'intelligence'],
        category: 'business-intelligence',
        width: 800,
        height: 600,
        license: 'unsplash'
      },
      {
        id: 'project-5',
        url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop',
        title: 'Code Development Environment',
        description: 'Modern development environment with AI assistance',
        tags: ['coding', 'development', 'programming', 'workspace', 'tech'],
        category: 'development',
        width: 800,
        height: 600,
        license: 'unsplash'
      },
      {
        id: 'project-6',
        url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=300&fit=crop',
        title: 'AI Robot Technology',
        description: 'Advanced robotics and artificial intelligence',
        tags: ['robotics', 'ai', 'technology', 'automation', 'future'],
        category: 'robotics',
        width: 800,
        height: 600,
        license: 'unsplash'
      },
      {
        id: 'project-7',
        url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
        title: 'Web Development Interface',
        description: 'Modern web development with responsive design',
        tags: ['web', 'development', 'responsive', 'design', 'frontend'],
        category: 'web-development',
        width: 800,
        height: 600,
        license: 'unsplash'
      },
      {
        id: 'project-8',
        url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
        title: 'Machine Learning Workspace',
        description: 'Data science and machine learning development environment',
        tags: ['machine-learning', 'data', 'workspace', 'python', 'jupyter'],
        category: 'machine-learning',
        width: 800,
        height: 600,
        license: 'unsplash'
      }
    ];
  }

  // Portfolio specific images
  static getPortfolioImages(): StockImage[] {
    return [
      {
        id: 'portfolio-1',
        url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
        title: 'AI Chatbot Interface',
        description: 'Conversational AI chatbot with natural language processing',
        tags: ['chatbot', 'ai', 'nlp', 'conversation', 'interface'],
        category: 'ai-chatbot',
        width: 800,
        height: 600,
        license: 'unsplash'
      },
      {
        id: 'portfolio-2',
        url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop',
        title: 'E-commerce Platform',
        description: 'Modern e-commerce solution with AI recommendations',
        tags: ['ecommerce', 'shopping', 'ai', 'recommendations', 'platform'],
        category: 'ecommerce',
        width: 800,
        height: 600,
        license: 'unsplash'
      },
      {
        id: 'portfolio-3',
        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
        title: 'Financial Dashboard',
        description: 'Real-time financial analytics and trading platform',
        tags: ['finance', 'trading', 'analytics', 'real-time', 'dashboard'],
        category: 'fintech',
        width: 800,
        height: 600,
        license: 'unsplash'
      },
      {
        id: 'portfolio-4',
        url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=300&fit=crop',
        title: 'Social Media Platform',
        description: 'Modern social networking platform with AI content moderation',
        tags: ['social', 'media', 'platform', 'ai', 'moderation'],
        category: 'social-media',
        width: 800,
        height: 600,
        license: 'unsplash'
      }
    ];
  }

  // Demo videos for reels
  static getDemoVideos(): StockVideo[] {
    return [
      {
        id: 'video-1',
        url: 'https://cdn.pixabay.com/vimeo/492553652/programming-119012.mp4',
        thumbnailUrl: 'https://i.vimeocdn.com/video/1039003987-6e7e8f6b9c7d5b4b5f0e4f3f3f3f3f3f_640x360.jpg',
        title: 'AI Code Generation Demo',
        description: 'Demonstration of AI-powered code generation and completion',
        tags: ['ai', 'coding', 'automation', 'development', 'demo'],
        category: 'ai-development',
        duration: 30,
        width: 1920,
        height: 1080,
        license: 'pixabay'
      },
      {
        id: 'video-2',
        url: 'https://cdn.pixabay.com/vimeo/344264815/data-48950.mp4',
        thumbnailUrl: 'https://i.vimeocdn.com/video/857495631-47f3e1e1f3e1f3e1f3e1f3e1f3e1f3e1_640x360.jpg',
        title: 'Data Analytics Visualization',
        description: 'Real-time data processing and visualization demo',
        tags: ['data', 'analytics', 'visualization', 'charts', 'real-time'],
        category: 'data-science',
        duration: 45,
        width: 1920,
        height: 1080,
        license: 'pixabay'
      },
      {
        id: 'video-3',
        url: 'https://cdn.pixabay.com/vimeo/507037338/ai-128248.mp4',
        thumbnailUrl: 'https://i.vimeocdn.com/video/1052003456-8e9f0f7f9c8d6b5b5f1e5f4f4f4f4f4f_640x360.jpg',
        title: 'Machine Learning Model Training',
        description: 'Time-lapse of ML model training and optimization process',
        tags: ['machine-learning', 'training', 'optimization', 'ai', 'neural-network'],
        category: 'machine-learning',
        duration: 60,
        width: 1920,
        height: 1080,
        license: 'pixabay'
      }
    ];
  }

  // Company logos and brand images
  static getCompanyLogos(): StockImage[] {
    return [
      {
        id: 'company-1',
        url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=200&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop',
        title: 'TechCorp Inc.',
        description: 'Modern technology company logo',
        tags: ['logo', 'brand', 'technology', 'corporate'],
        category: 'brand',
        width: 200,
        height: 200,
        license: 'unsplash'
      },
      {
        id: 'company-2',
        url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop',
        title: 'AI Solutions Ltd.',
        description: 'Artificial intelligence company branding',
        tags: ['logo', 'ai', 'brand', 'solutions'],
        category: 'brand',
        width: 200,
        height: 200,
        license: 'unsplash'
      }
    ];
  }

  // Background images for hero sections
  static getHeroBackgrounds(): StockImage[] {
    return [
      {
        id: 'hero-1',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2fd1?w=1920&h=1080&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2fd1?w=400&h=225&fit=crop',
        title: 'AI Technology Background',
        description: 'Futuristic AI and technology background',
        tags: ['ai', 'technology', 'futuristic', 'background', 'hero'],
        category: 'background',
        width: 1920,
        height: 1080,
        license: 'unsplash'
      },
      {
        id: 'hero-2',
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop',
        title: 'Digital Network Background',
        description: 'Abstract digital network and data visualization',
        tags: ['digital', 'network', 'data', 'abstract', 'background'],
        category: 'background',
        width: 1920,
        height: 1080,
        license: 'unsplash'
      }
    ];
  }

  // Utility methods
  static getRandomAvatar(): UserAvatar {
    const avatars = this.getUserAvatars();
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  static getRandomProjectImage(): StockImage {
    const images = this.getProjectImages();
    return images[Math.floor(Math.random() * images.length)];
  }

  static getRandomPortfolioImage(): StockImage {
    const images = this.getPortfolioImages();
    return images[Math.floor(Math.random() * images.length)];
  }

  static getRandomVideo(): StockVideo {
    const videos = this.getDemoVideos();
    return videos[Math.floor(Math.random() * videos.length)];
  }

  static getImagesByCategory(category: string): StockImage[] {
    const allImages = [...this.getProjectImages(), ...this.getPortfolioImages()];
    return allImages.filter(image =>
      image.category === category ||
      image.tags.includes(category)
    );
  }

  static getVideosByCategory(category: string): StockVideo[] {
    const allVideos = this.getDemoVideos();
    return allVideos.filter(video =>
      video.category === category ||
      video.tags.includes(category)
    );
  }

  // Get images for specific use cases
  static getAvatarByProfession(profession: string): UserAvatar | null {
    const avatars = this.getUserAvatars();
    return avatars.find(avatar =>
      avatar.profession.toLowerCase().includes(profession.toLowerCase())
    ) || null;
  }

  static getImagesByTags(tags: string[]): StockImage[] {
    const allImages = [...this.getProjectImages(), ...this.getPortfolioImages()];
    return allImages.filter(image =>
      tags.some(tag => image.tags.includes(tag.toLowerCase()))
    );
  }

  // Generate realistic project data with proper images
  static generateProjectWithMedia(category: string) {
    const image = this.getImagesByCategory(category)[0] || this.getRandomProjectImage();
    const avatar = this.getRandomAvatar();

    return {
      image: image.url,
      thumbnail: image.thumbnailUrl,
      clientAvatar: avatar.url,
      clientName: avatar.name,
      tags: image.tags,
      description: image.description
    };
  }

  // Generate portfolio item with proper media
  static generatePortfolioWithMedia(category: string) {
    const image = this.getImagesByCategory(category)[0] || this.getRandomPortfolioImage();
    const video = this.getVideosByCategory(category)[0] || this.getRandomVideo();

    return {
      image: image.url,
      thumbnail: image.thumbnailUrl,
      videoUrl: video.url,
      videoThumbnail: video.thumbnailUrl,
      tags: [...image.tags, ...video.tags],
      description: `${image.description}. ${video.description}`
    };
  }
}

// Export types and service
export default StockMediaService;
