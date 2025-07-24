import { AISpecialist } from '@/types';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../appwrite/database';

// Get all AI specialists from database
export const getAISpecialists = async (): Promise<AISpecialist[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.AI_SPECIALISTS,
      [Query.orderDesc('$createdAt')]
    );
    
    return response.documents.map(doc => ({
      id: doc.$id,
      name: doc.name,
      title: doc.title,
      description: doc.description,
      shortDescription: doc.shortDescription,
      category: doc.category,
      avatar: doc.avatar,
      videoUrl: doc.videoUrl,
      voiceIntro: doc.voiceIntro,
      skills: doc.skills || [],
      aiProviders: doc.aiProviders || [],
      monthlyPrice: doc.monthlyPrice,
      taskPrice: doc.taskPrice,
      currency: 'USD', // Default since not in database
      capabilities: doc.capabilities || [],
      deliveryTime: doc.deliveryTime,
      examples: doc.examples || [],
      rating: 4.8, // Default since not in database
      completedTasks: Math.floor(Math.random() * 2000) + 500, // Random for demo
      responseTime: doc.responseTime,
      isActive: true, // Default since not in database
      isPopular: Math.random() > 0.5, // Random for demo
      isFeatured: Math.random() > 0.7 // Random for demo
    })) as AISpecialist[];
  } catch (error) {
    console.error('Error fetching AI specialists:', error);
    return [];
  }
};

// Get featured specialists for homepage
export const getFeaturedSpecialists = async (limit: number = 4): Promise<AISpecialist[]> => {
  const specialists = await getAISpecialists();
  return specialists
    .filter(specialist => specialist.isFeatured || specialist.isPopular)
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.rating - a.rating;
    })
    .slice(0, limit);
};

// Get specialist by ID
export const getSpecialistById = async (id: string): Promise<AISpecialist | undefined> => {
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.AI_SPECIALISTS, id);
    
    return {
      id: doc.$id,
      name: doc.name,
      title: doc.title,
      description: doc.description,
      shortDescription: doc.shortDescription,
      category: doc.category,
      avatar: doc.avatar,
      videoUrl: doc.videoUrl,
      voiceIntro: doc.voiceIntro,
      skills: doc.skills || [],
      aiProviders: doc.aiProviders || [],
      monthlyPrice: doc.monthlyPrice,
      taskPrice: doc.taskPrice,
      currency: 'USD',
      capabilities: doc.capabilities || [],
      deliveryTime: doc.deliveryTime,
      examples: doc.examples || [],
      rating: 4.8,
      completedTasks: Math.floor(Math.random() * 2000) + 500,
      responseTime: doc.responseTime,
      isActive: true,
      isPopular: Math.random() > 0.5,
      isFeatured: Math.random() > 0.7
    } as AISpecialist;
  } catch (error) {
    console.error('Error fetching specialist by ID:', error);
    return undefined;
  }
};

// Get specialists by category
export const getSpecialistsByCategory = async (category: string): Promise<AISpecialist[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.AI_SPECIALISTS,
      [
        Query.equal('category', category),
        Query.orderDesc('$createdAt')
      ]
    );
    
    return response.documents.map(doc => ({
      id: doc.$id,
      name: doc.name,
      title: doc.title,
      description: doc.description,
      shortDescription: doc.shortDescription,
      category: doc.category,
      avatar: doc.avatar,
      videoUrl: doc.videoUrl,
      voiceIntro: doc.voiceIntro,
      skills: doc.skills || [],
      aiProviders: doc.aiProviders || [],
      monthlyPrice: doc.monthlyPrice,
      taskPrice: doc.taskPrice,
      currency: 'USD',
      capabilities: doc.capabilities || [],
      deliveryTime: doc.deliveryTime,
      examples: doc.examples || [],
      rating: 4.8,
      completedTasks: Math.floor(Math.random() * 2000) + 500,
      responseTime: doc.responseTime,
      isActive: true,
      isPopular: Math.random() > 0.5,
      isFeatured: Math.random() > 0.7
    })) as AISpecialist[];
  } catch (error) {
    console.error('Error fetching specialists by category:', error);
    return [];
  }
}; 