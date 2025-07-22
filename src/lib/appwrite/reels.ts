import { databases, DATABASE_ID, COLLECTIONS } from "./database";
import { ID, Query } from "appwrite";

export interface Reel {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: "video" | "website" | "bot" | "design" | "other";
  tags?: string[];
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  isPremium: boolean;
  views: number;
  likes: number;
  rating: number;
  duration?: number;
  price?: number;
  deliveryTime?: string;
  features?: string[];
  requirements?: string;
}

export interface SolutionPackage {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  reelId?: string;
  freelancerPrice?: number;
  aiServicePrice: number;
  estimatedTime: string;
  difficulty: "easy" | "medium" | "hard";
  isPopular: boolean;
  createdBy: string;
}

export interface FreelancerSetup {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  freelancerId: string;
  freelancerName: string;
  serviceTitle: string;
  serviceDescription: string;
  category: string;
  deliverables: string[];
  price: number;
  deliveryTime: string;
  revisions: number;
  requirements?: string;
}

export interface ReelInteraction {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  userId: string;
  reelId: string;
  type: "view" | "like" | "save";
  timestamp: string;
}

export class ReelsService {
  // Создать новый рилс
  static async createReel(
    reelData: Omit<Reel, "$id" | "$createdAt" | "$updatedAt">,
  ): Promise<Reel> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.REELS,
        ID.unique(),
        {
          ...reelData,
          tags: JSON.stringify(reelData.tags || []),
          features: JSON.stringify(reelData.features || []),
        },
      );

      return {
        ...response,
        tags: reelData.tags || [],
        features: reelData.features || [],
      } as Reel;
    } catch (error) {
      console.error("Error creating reel:", error);
      throw new Error("Failed to create reel");
    }
  }

  // Получить один рилс по ID
  static async getReel(reelId: string): Promise<Reel | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.REELS,
        reelId,
      );

      return {
        ...response,
        tags: response.tags ? JSON.parse(response.tags) : [],
        features: response.features ? JSON.parse(response.features) : [],
      } as Reel;
    } catch (error) {
      console.error("Error fetching reel:", error);
      return null;
    }
  }

  // Получить топ рилсы для главной страницы
  static async getTopReels(limit: number = 4): Promise<Reel[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REELS,
        [
          Query.orderDesc("rating"),
          Query.orderDesc("views"),
          Query.limit(limit),
        ],
      );

      return response.documents.map((doc) => ({
        ...doc,
        tags: doc.tags ? JSON.parse(doc.tags) : [],
        features: doc.features ? JSON.parse(doc.features) : [],
      })) as Reel[];
    } catch (error) {
      console.error("Error fetching top reels:", error);
      throw new Error("Failed to fetch top reels");
    }
  }

  // Получить рилсы по категории
  static async getReelsByCategory(
    category: string,
    limit: number = 20,
  ): Promise<Reel[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REELS,
        [
          Query.equal("category", category),
          Query.orderDesc("$createdAt"),
          Query.limit(limit),
        ],
      );

      return response.documents.map((doc) => ({
        ...doc,
        tags: doc.tags ? JSON.parse(doc.tags) : [],
        features: doc.features ? JSON.parse(doc.features) : [],
      })) as Reel[];
    } catch (error) {
      console.error("Error fetching reels by category:", error);
      throw new Error("Failed to fetch reels by category");
    }
  }

  // Получить рилсы по создателю
  static async getReelsByCreator(
    creatorId: string,
    limit: number = 50,
  ): Promise<Reel[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REELS,
        [
          Query.equal("creatorId", creatorId),
          Query.orderDesc("$createdAt"),
          Query.limit(limit),
        ],
      );

      return response.documents.map((doc) => ({
        ...doc,
        tags: doc.tags ? JSON.parse(doc.tags) : [],
      })) as Reel[];
    } catch (error) {
      console.error("Error fetching reels by creator:", error);
      // Return mock data for demo
      return [
        {
          $id: "1",
          title: "AI Website Builder Pro",
          description: "Create professional websites with AI in minutes",
          videoUrl: "/videos/website-demo.mp4",
          thumbnailUrl: "/images/website-thumb.svg",
          category: "website",
          creatorId: creatorId,
          creatorName: "You",
          isPremium: true,
          views: 15420,
          likes: 892,
          rating: 4.9,
          duration: 45,
          tags: ["React", "AI", "Next.js"],
        },
        {
          $id: "2",
          title: "TikTok Video Creator",
          description: "Generate viral TikTok content automatically",
          videoUrl: "/videos/tiktok-demo.mp4",
          thumbnailUrl: "/images/tiktok-thumb.svg",
          category: "video",
          creatorId: creatorId,
          creatorName: "You",
          isPremium: false,
          views: 23100,
          likes: 1340,
          rating: 4.8,
          duration: 30,
          tags: ["Python", "OpenAI", "FFmpeg"],
        },
      ];
    }
  }

  // Обновить рилс
  static async updateReel(
    reelId: string,
    updateData: Partial<Reel>,
  ): Promise<Reel> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.REELS,
        reelId,
        {
          ...updateData,
          tags: updateData.tags ? JSON.stringify(updateData.tags) : undefined,
          features: updateData.features
            ? JSON.stringify(updateData.features)
            : undefined,
        },
      );

      return {
        ...response,
        tags: updateData.tags || [],
        features: updateData.features || [],
      } as Reel;
    } catch (error) {
      console.error("Error updating reel:", error);
      throw new Error("Failed to update reel");
    }
  }

  // Удалить рилс
  static async deleteReel(reelId: string): Promise<void> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.REELS, reelId);
    } catch (error) {
      console.error("Error deleting reel:", error);
      throw new Error("Failed to delete reel");
    }
  }

  // Увеличить просмотры рилса
  static async incrementViews(reelId: string): Promise<void> {
    try {
      const reel = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.REELS,
        reelId,
      );
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.REELS, reelId, {
        views: (reel.views || 0) + 1,
      });
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  }

  // Лайкнуть рилс
  static async likeReel(reelId: string, userId: string): Promise<void> {
    try {
      // Проверяем, не лайкал ли уже пользователь
      const existingLike = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        [
          Query.equal("userId", userId),
          Query.equal("reelId", reelId),
          Query.equal("type", "like"),
        ],
      );

      if (existingLike.documents.length > 0) {
        return; // Уже лайкнул
      }

      // Добавляем лайк
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.REEL_INTERACTIONS,
        ID.unique(),
        {
          userId,
          reelId,
          type: "like",
          timestamp: new Date().toISOString(),
        },
      );

      // Увеличиваем счетчик лайков
      const reel = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.REELS,
        reelId,
      );
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.REELS, reelId, {
        likes: (reel.likes || 0) + 1,
      });
    } catch (error) {
      console.error("Error liking reel:", error);
      throw new Error("Failed to like reel");
    }
  }

  // Получить готовые пакеты
  static async getSolutionPackages(
    category?: string,
  ): Promise<SolutionPackage[]> {
    try {
      const queries = [Query.orderDesc("$createdAt")];
      if (category) {
        queries.push(Query.equal("category", category));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SOLUTION_PACKAGES,
        queries,
      );

      return response.documents.map((doc) => ({
        ...doc,
        features: doc.features ? JSON.parse(doc.features) : [],
      })) as SolutionPackage[];
    } catch (error) {
      console.error("Error fetching solution packages:", error);
      throw new Error("Failed to fetch solution packages");
    }
  }

  // Получить настройки фрилансеров
  static async getFreelancerSetups(
    category?: string,
  ): Promise<FreelancerSetup[]> {
    try {
      const queries = [Query.orderDesc("$createdAt")];
      if (category) {
        queries.push(Query.equal("category", category));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FREELANCER_SETUPS,
        queries,
      );

      return response.documents.map((doc) => ({
        ...doc,
        deliverables: doc.deliverables ? JSON.parse(doc.deliverables) : [],
      })) as FreelancerSetup[];
    } catch (error) {
      console.error("Error fetching freelancer setups:", error);
      throw new Error("Failed to fetch freelancer setups");
    }
  }
}
