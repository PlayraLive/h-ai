import { Client, Databases, ID, Query, Permission, Role } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const databases = new Databases(client);

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const COLLECTIONS = {
  JOBS: 'jobs',
  USERS: 'users',
  APPLICATIONS: 'applications',
  PROJECTS: 'projects',
  REVIEWS: 'reviews',
  MESSAGES: 'messages',
  INVITATIONS: 'invitations',
  // AI Solutions & Reels Collections
  REELS: 'reels',
  SOLUTION_PACKAGES: 'solution_packages',
  FREELANCER_SETUPS: 'freelancer_setups',
  AI_SOLUTIONS: 'ai_solutions',
  USER_PROJECTS: 'user_projects',
  ORDERS: 'orders',
  PROJECT_CUSTOMIZATIONS: 'project_customizations',
  REEL_INTERACTIONS: 'reel_interactions',
  AI_SERVICE_ORDERS: 'ai_service_orders'
};

// Job Status Types
export type JobStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
export type JobType = 'fixed' | 'hourly';
export type ExperienceLevel = 'entry' | 'intermediate' | 'expert';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

// Database Schemas
export interface JobDocument {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  skills: string[];
  budgetType: JobType;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  duration: string;
  experienceLevel: ExperienceLevel;
  location: string;
  status: JobStatus;
  clientId: string;
  clientName: string;
  clientCompany?: string;
  clientAvatar?: string;
  featured: boolean;
  urgent: boolean;
  deadline?: string;
  attachments?: string[];
  applicationsCount: number;
  viewsCount: number;
  tags?: string[];
}

export interface UserDocument {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  email: string;
  name: string;
  avatar?: string;
  userType: 'client' | 'freelancer';
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  skills?: string[];
  hourlyRate?: number;
  totalEarned?: number;
  jobsCompleted?: number;
  rating?: number;
  reviewsCount?: number;
  verified: boolean;
  topRated: boolean;
  availability: 'available' | 'busy' | 'unavailable';
  languages?: { name: string; level: string }[];
  portfolio?: {
    title: string;
    description: string;
    image: string;
    url?: string;
  }[];
}

export interface ApplicationDocument {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  jobId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar?: string;
  freelancerRating?: number;
  coverLetter: string;
  proposedBudget: number;
  proposedDuration: string;
  status: ApplicationStatus;
  clientResponse?: string;
  attachments?: string[];
}

export interface ProjectDocument {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  title: string;
  description: string;
  budget: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  startDate: string;
  endDate?: string;
  milestones?: {
    title: string;
    description: string;
    amount: number;
    dueDate: string;
    completed: boolean;
  }[];
}

export interface ReviewDocument {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  projectId: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  rating: number;
  title: string;
  comment: string;
  isPublic: boolean;
  helpful: number;
  notHelpful: number;
  response?: {
    text: string;
    createdAt: string;
  };
  tags: string[];
}

export interface MessageDocument {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  senderId: string;
  receiverId: string;
  jobId?: string;
  projectId?: string;
  content: string;
  attachments?: string[];
  read: boolean;
  type: 'text' | 'file' | 'system';
}

// Database initialization function
export async function initializeDatabase() {
  try {
    // Check if database exists
    await databases.get(DATABASE_ID);
    console.log('Database already exists');
  } catch (error) {
    console.log('Database does not exist, creating...');
    // Database creation would be done through Appwrite console
  }
}

// Helper function to create permissions
export function createPermissions(userId: string) {
  return [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId))
  ];
}

// Helper function for public read permissions
export function createPublicReadPermissions(userId: string) {
  return [
    Permission.read(Role.any()),
    Permission.write(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId))
  ];
}

export { client, Query, ID };
