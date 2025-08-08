import {
  databases,
  DATABASE_ID,
  COLLECTIONS,
  UserDocument,
  createPermissions,
  Query,
  ID,
} from "./database";

// Users API Service
export class UsersService {
  // Create user profile
  static async createUserProfile(
    userData: Omit<UserDocument, "$id" | "$createdAt" | "$updatedAt">,
    userId: string,
  ): Promise<UserDocument> {
    try {
      const user = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId, // Use the auth user ID as document ID
        {
          ...userData,
          totalEarned: 0,
          jobsCompleted: 0,
          rating: 0,
          reviewsCount: 0,
          verified: false,
          topRated: false,
          availability: "available",
        },
        createPermissions(userId),
      );

      return user as UserDocument;
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw new Error("Failed to create user profile");
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<UserDocument | null> {
    try {
      const user = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
      );

      return user as UserDocument;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  // Get user by ID (alias for getUserProfile)
  static async getUserById(userId: string): Promise<UserDocument | null> {
    return this.getUserProfile(userId);
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    updates: Partial<UserDocument>,
  ): Promise<UserDocument> {
    try {
      const user = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        updates,
      );

      return user as UserDocument;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update user profile");
    }
  }

  // Get freelancers with filters
  static async getFreelancers(filters?: {
    skills?: string[];
    location?: string;
    hourlyRateMin?: number;
    hourlyRateMax?: number;
    rating?: number;
    availability?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ freelancers: UserDocument[]; total: number }> {
    try {
      console.log("Getting freelancers with filters:", filters); // Debug
      
      const queries = [
        Query.equal("userType", "freelancer"),
      ];
      
      console.log("Queries:", queries); // Debug
      
      // Remove rating query for now to avoid schema issues
      // Query.orderDesc("rating"),

      // Add filters
      if (filters?.skills && filters.skills.length > 0) {
        queries.push(Query.contains("skills", filters.skills));
      }

      if (filters?.location) {
        queries.push(Query.equal("location", filters.location));
      }

      if (filters?.hourlyRateMin) {
        queries.push(
          Query.greaterThanEqual("hourlyRate", filters.hourlyRateMin),
        );
      }

      if (filters?.hourlyRateMax) {
        queries.push(Query.lessThanEqual("hourlyRate", filters.hourlyRateMax));
      }

      if (filters?.rating) {
        queries.push(Query.greaterThanEqual("rating", filters.rating));
      }

      if (filters?.availability) {
        queries.push(Query.equal("availability", filters.availability));
      }

      if (filters?.search) {
        queries.push(Query.search("name", filters.search));
      }

      if (filters?.limit) {
        queries.push(Query.limit(filters.limit));
      }

      if (filters?.offset) {
        queries.push(Query.offset(filters.offset));
      }

      console.log('Executing query with filters:', filters);
      console.log('Query array:', queries);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        queries,
      );

      console.log('Response from Appwrite:', response);
      console.log('Total documents found:', response.total);
      console.log('Documents:', response.documents);

      return {
        freelancers: response.documents as UserDocument[],
        total: response.total,
      };
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      throw new Error("Failed to fetch freelancers");
    }
  }

  // Get top rated freelancers
  static async getTopRatedFreelancers(
    limit: number = 6,
  ): Promise<UserDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [
          Query.equal("userType", "freelancer"),
          Query.equal("topRated", true),
          Query.orderDesc("rating"),
          Query.limit(limit),
        ],
      );

      return response.documents as UserDocument[];
    } catch (error) {
      console.error("Error fetching top rated freelancers:", error);
      return [];
    }
  }

  // Search freelancers
  static async searchFreelancers(
    searchTerm: string,
    limit: number = 20,
  ): Promise<UserDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [
          Query.equal("userType", "freelancer"),
          Query.search("name", searchTerm),
          Query.limit(limit),
        ],
      );

      return response.documents as UserDocument[];
    } catch (error) {
      console.error("Error searching freelancers:", error);
      return [];
    }
  }

  // Update user stats (called when project is completed)
  static async updateUserStats(
    userId: string,
    stats: {
      totalEarned?: number;
      jobsCompleted?: number;
      rating?: number;
      reviewsCount?: number;
    },
  ): Promise<void> {
    try {
      const user = await this.getUserProfile(userId);
      if (!user) return;

      const updates: Partial<UserDocument> = {};

      if (stats.totalEarned !== undefined) {
        updates.totalEarned = (user.totalEarned || 0) + stats.totalEarned;
      }

      if (stats.jobsCompleted !== undefined) {
        updates.jobsCompleted = (user.jobsCompleted || 0) + stats.jobsCompleted;
      }

      if (stats.rating !== undefined && stats.reviewsCount !== undefined) {
        const currentTotal = (user.rating || 0) * (user.reviewsCount || 0);
        const newTotal = currentTotal + stats.rating;
        const newCount = (user.reviewsCount || 0) + stats.reviewsCount;
        updates.rating = newTotal / newCount;
        updates.reviewsCount = newCount;
      }

      await this.updateUserProfile(userId, updates);
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  }

  // Check if user should be top rated
  static async checkTopRatedStatus(userId: string): Promise<void> {
    try {
      const user = await this.getUserProfile(userId);
      if (!user || user.userType !== "freelancer") return;

      const shouldBeTopRated =
        (user.rating || 0) >= 4.8 &&
        (user.reviewsCount || 0) >= 10 &&
        (user.jobsCompleted || 0) >= 5;

      if (shouldBeTopRated !== user.topRated) {
        await this.updateUserProfile(userId, { topRated: shouldBeTopRated });
      }
    } catch (error) {
      console.error("Error checking top rated status:", error);
    }
  }
}

// Export getUserById function for convenience
export const getUserById = UsersService.getUserById;
