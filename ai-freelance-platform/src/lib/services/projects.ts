import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';

export interface Project {
  $id: string;
  title: string;
  description: string;
  category: 'ai_design' | 'ai_development' | 'ai_video' | 'ai_games' | 'ai_writing' | 'ai_data';
  subcategory?: string;
  client_id: string;
  freelancer_id?: string;
  budget_type: 'fixed' | 'hourly';
  budget_min: number;
  budget_max?: number;
  hourly_rate?: number;
  estimated_hours?: number;
  deadline?: string;
  status: 'draft' | 'open' | 'in_progress' | 'in_review' | 'completed' | 'cancelled' | 'disputed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  skills_required?: string[];
  attachments?: string[];
  requirements?: string;
  deliverables?: string;
  milestones?: string;
  proposals_count: number;
  views_count: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export class ProjectService {
  // Create new project
  static async createProject(projectData: Omit<Project, '$id' | 'created_at' | 'updated_at' | 'proposals_count' | 'views_count'>): Promise<Project> {
    const now = new Date().toISOString();
    
    const project = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PROJECTS,
      ID.unique(),
      {
        ...projectData,
        proposals_count: 0,
        views_count: 0,
        created_at: now,
        updated_at: now,
      }
    );

    return project as Project;
  }

  // Get project by ID
  static async getProject(projectId: string): Promise<Project> {
    const project = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.PROJECTS,
      projectId
    );

    // Increment view count
    await this.incrementViewCount(projectId);

    return project as Project;
  }

  // Get projects with filters
  static async getProjects(filters: {
    category?: string;
    status?: string;
    client_id?: string;
    freelancer_id?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<Project[]> {
    const queries = [];

    if (filters.category) {
      queries.push(Query.equal('category', filters.category));
    }
    if (filters.status) {
      queries.push(Query.equal('status', filters.status));
    }
    if (filters.client_id) {
      queries.push(Query.equal('client_id', filters.client_id));
    }
    if (filters.freelancer_id) {
      queries.push(Query.equal('freelancer_id', filters.freelancer_id));
    }
    if (filters.featured !== undefined) {
      queries.push(Query.equal('featured', filters.featured));
    }

    queries.push(Query.orderDesc('created_at'));
    
    if (filters.limit) {
      queries.push(Query.limit(filters.limit));
    }
    if (filters.offset) {
      queries.push(Query.offset(filters.offset));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PROJECTS,
      queries
    );

    return response.documents as Project[];
  }

  // Update project
  static async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const project = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PROJECTS,
      projectId,
      {
        ...updates,
        updated_at: new Date().toISOString(),
      }
    );

    return project as Project;
  }

  // Delete project
  static async deleteProject(projectId: string): Promise<void> {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.PROJECTS,
      projectId
    );
  }

  // Increment view count
  static async incrementViewCount(projectId: string): Promise<void> {
    try {
      const project = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.PROJECTS,
        projectId
      );

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PROJECTS,
        projectId,
        {
          views_count: (project.views_count || 0) + 1,
        }
      );
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  // Increment proposals count
  static async incrementProposalsCount(projectId: string): Promise<void> {
    try {
      const project = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.PROJECTS,
        projectId
      );

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PROJECTS,
        projectId,
        {
          proposals_count: (project.proposals_count || 0) + 1,
        }
      );
    } catch (error) {
      console.error('Error incrementing proposals count:', error);
    }
  }

  // Search projects
  static async searchProjects(searchTerm: string, filters: any = {}): Promise<Project[]> {
    const queries = [
      Query.search('title', searchTerm),
      Query.orderDesc('created_at'),
    ];

    if (filters.category) {
      queries.push(Query.equal('category', filters.category));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PROJECTS,
      queries
    );

    return response.documents as Project[];
  }

  // Get project statistics
  static async getProjectStats(clientId?: string, freelancerId?: string) {
    const queries = [];
    
    if (clientId) {
      queries.push(Query.equal('client_id', clientId));
    }
    if (freelancerId) {
      queries.push(Query.equal('freelancer_id', freelancerId));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PROJECTS,
      queries
    );

    const projects = response.documents as Project[];
    
    return {
      total: projects.length,
      open: projects.filter(p => p.status === 'open').length,
      in_progress: projects.filter(p => p.status === 'in_progress').length,
      completed: projects.filter(p => p.status === 'completed').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length,
      total_budget: projects.reduce((sum, p) => sum + p.budget_min, 0),
    };
  }
}
