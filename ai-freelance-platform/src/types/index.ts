// User Types
export interface User {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  avatar?: string;
  title?: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  skills: string[];
  languages: string[];
  verified: boolean;
  online: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  totalEarnings: number;
  successRate: number;
  responseTime: string;
  memberSince: string;
  userType: 'freelancer' | 'client' | 'both';
  badges: string[];
  portfolioItems: string[]; // Portfolio document IDs
}

// Job Types
export interface Job {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  description: string;
  category: 'design' | 'code' | 'video' | 'games';
  skills: string[];
  budgetType: 'fixed' | 'hourly';
  budgetMin: number;
  budgetMax: number;
  duration: string;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  clientId: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  proposals: number;
  attachments: string[];
  featured: boolean;
  deadline?: string;
  assignedFreelancer?: string;
}

// Proposal Types
export interface Proposal {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: string;
  attachments: string[];
  status: 'pending' | 'accepted' | 'rejected';
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
}

// Message Types
export interface Conversation {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  participants: string[];
  jobId?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: { [userId: string]: number };
}

export interface Message {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  attachments?: string[];
  readBy: string[];
}

// Portfolio Types
export interface PortfolioItem {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  tools: string[];
  images: string[];
  client?: string;
  year: string;
  featured: boolean;
  projectUrl?: string;
}

// Review Types
export interface Review {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  rating: number;
  comment: string;
  skills: { [skill: string]: number };
  communication: number;
  quality: number;
  timeliness: number;
}

// Payment Types
export interface Payment {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  amount: number;
  platformFee: number;
  totalAmount: number;
  method: 'stripe' | 'crypto';
  cryptoType?: 'bitcoin' | 'ethereum' | 'usdt';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  escrowReleased: boolean;
  milestoneId?: string;
}

// Support Types
export interface SupportTicket {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  subject: string;
  category: 'account' | 'payments' | 'projects' | 'security' | 'reviews' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedAgent?: string;
  attachments?: string[];
  responses: SupportResponse[];
}

export interface SupportResponse {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  isAgent: boolean;
  attachments?: string[];
}

// Notification Types
export interface Notification {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  type: 'message' | 'proposal' | 'payment' | 'review' | 'job_update' | 'system';
  title: string;
  content: string;
  read: boolean;
  actionUrl?: string;
  metadata?: { [key: string]: string | number | boolean | null };
}

// Verification Types
export interface Verification {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  type: 'identity' | 'payment' | 'phone' | 'email';
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  documents: T[];
  total: number;
  limit: number;
  offset: number;
}

// Form Types
export interface JobFormData {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budgetType: 'fixed' | 'hourly';
  budgetMin: string;
  budgetMax: string;
  duration: string;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  attachments: File[];
}

export interface ProposalFormData {
  coverLetter: string;
  proposedRate: string;
  estimatedDuration: string;
  attachments: File[];
  milestones: {
    title: string;
    description: string;
    amount: string;
    dueDate: string;
  }[];
}

export interface ProfileFormData {
  name: string;
  title: string;
  bio: string;
  location: string;
  hourlyRate: number;
  skills: string[];
  languages: string[];
}

// Filter Types
export interface JobFilters {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  experienceLevel?: string;
  skills?: string[];
  sortBy?: 'newest' | 'budget-high' | 'budget-low' | 'proposals';
  search?: string;
}

export interface FreelancerFilters {
  category?: string;
  ratingMin?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  skills?: string[];
  languages?: string[];
  verified?: boolean;
  online?: boolean;
  sortBy?: 'rating' | 'rate-low' | 'rate-high' | 'completed';
  search?: string;
}
