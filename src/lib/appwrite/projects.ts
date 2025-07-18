import { 
  databases, 
  DATABASE_ID, 
  createPublicReadPermissions,
  createPermissions,
  Query,
  ID
} from './database';

// Project status workflow
export type ProjectStatus = 
  | 'posted'      // Проект опубликован, ждет заявок
  | 'applied'     // Есть заявки от фрилансеров
  | 'assigned'    // Проект назначен фрилансеру
  | 'in_progress' // Работа в процессе
  | 'review'      // На проверке у клиента
  | 'revision'    // Требуются доработки
  | 'completed'   // Работа завершена
  | 'paid'        // Оплачено
  | 'cancelled'   // Отменено
  | 'disputed';   // Спор

// Application status
export type ApplicationStatus = 
  | 'pending'     // Заявка подана, ждет ответа
  | 'accepted'    // Заявка принята
  | 'rejected'    // Заявка отклонена
  | 'withdrawn';  // Заявка отозвана

export interface Project {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  duration: string; // e.g., "1-2 weeks", "1-3 months"
  skillsRequired: string[];
  aiToolsRequired?: string[];
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  status: ProjectStatus;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  assignedFreelancerId?: string;
  assignedFreelancerName?: string;
  applicationsCount: number;
  viewsCount: number;
  isUrgent: boolean;
  isFeatured: boolean;
  attachments?: string[];
  tags: string[];
  location?: string;
  isRemote: boolean;
  paymentVerified: boolean;
  escrowAmount?: number;
  platformFee: number; // 10% commission
  freelancerEarnings?: number;
  completedAt?: string;
  paidAt?: string;
  deadlineAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectApplication {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  projectId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar?: string;
  freelancerRating: number;
  coverLetter: string;
  proposedBudget: number;
  proposedDuration: string;
  portfolioItems?: string[]; // IDs of relevant portfolio items
  status: ApplicationStatus;
  appliedAt: string;
  respondedAt?: string;
  clientResponse?: string;
}

export interface ProjectMilestone {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'paid';
  submittedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  deliverables?: string[];
  feedback?: string;
}

export interface ProjectPayment {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  projectId: string;
  milestoneId?: string;
  clientId: string;
  freelancerId: string;
  amount: number;
  platformFee: number;
  freelancerEarnings: number;
  stripePaymentIntentId: string;
  stripeTransferId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paidAt?: string;
  refundedAt?: string;
  failureReason?: string;
}

export class ProjectService {
  
  // Get all projects with filters
  static async getProjects(
    filters: {
      category?: string;
      budgetMin?: number;
      budgetMax?: number;
      experienceLevel?: string;
      isRemote?: boolean;
      status?: ProjectStatus;
      clientId?: string;
      assignedFreelancerId?: string;
    } = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<{ projects: Project[]; total: number }> {
    try {
      const queries = [
        Query.orderDesc('createdAt'),
        Query.limit(limit),
        Query.offset(offset)
      ];

      // Add filters
      if (filters.category) {
        queries.push(Query.equal('category', filters.category));
      }
      if (filters.status) {
        queries.push(Query.equal('status', filters.status));
      }
      if (filters.clientId) {
        queries.push(Query.equal('clientId', filters.clientId));
      }
      if (filters.assignedFreelancerId) {
        queries.push(Query.equal('assignedFreelancerId', filters.assignedFreelancerId));
      }
      if (filters.isRemote !== undefined) {
        queries.push(Query.equal('isRemote', filters.isRemote));
      }
      if (filters.budgetMin) {
        queries.push(Query.greaterThanEqual('budget', filters.budgetMin));
      }
      if (filters.budgetMax) {
        queries.push(Query.lessThanEqual('budget', filters.budgetMax));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        'projects',
        queries
      );

      return {
        projects: response.documents as Project[],
        total: response.total
      };
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
  }

  // Get single project
  static async getProject(projectId: string): Promise<Project> {
    try {
      const project = await databases.getDocument(
        DATABASE_ID,
        'projects',
        projectId
      );
      return project as Project;
    } catch (error: any) {
      console.error('Error fetching project:', error);
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
  }

  // Apply to project
  static async applyToProject(
    projectId: string,
    applicationData: Omit<ProjectApplication, '$id' | '$createdAt' | '$updatedAt' | 'appliedAt' | 'status'>
  ): Promise<ProjectApplication> {
    try {
      // Create application
      const application = await databases.createDocument(
        DATABASE_ID,
        'project_applications',
        ID.unique(),
        {
          ...applicationData,
          projectId,
          status: 'pending',
          appliedAt: new Date().toISOString()
        },
        createPermissions(applicationData.freelancerId)
      );

      // Update project applications count
      const project = await this.getProject(projectId);
      await databases.updateDocument(
        DATABASE_ID,
        'projects',
        projectId,
        {
          applicationsCount: project.applicationsCount + 1,
          status: project.status === 'posted' ? 'applied' : project.status
        }
      );

      return application as ProjectApplication;
    } catch (error: any) {
      console.error('Error applying to project:', error);
      throw new Error(`Failed to apply to project: ${error.message}`);
    }
  }

  // Get project applications
  static async getProjectApplications(projectId: string): Promise<ProjectApplication[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'project_applications',
        [
          Query.equal('projectId', projectId),
          Query.orderDesc('appliedAt')
        ]
      );

      return response.documents as ProjectApplication[];
    } catch (error: any) {
      console.error('Error fetching project applications:', error);
      throw new Error(`Failed to fetch project applications: ${error.message}`);
    }
  }

  // Accept application
  static async acceptApplication(
    applicationId: string,
    clientId: string
  ): Promise<{ application: ProjectApplication; project: Project }> {
    try {
      // Get application
      const application = await databases.getDocument(
        DATABASE_ID,
        'project_applications',
        applicationId
      ) as ProjectApplication;

      // Update application status
      const updatedApplication = await databases.updateDocument(
        DATABASE_ID,
        'project_applications',
        applicationId,
        {
          status: 'accepted',
          respondedAt: new Date().toISOString()
        }
      ) as ProjectApplication;

      // Update project
      const updatedProject = await databases.updateDocument(
        DATABASE_ID,
        'projects',
        application.projectId,
        {
          status: 'assigned',
          assignedFreelancerId: application.freelancerId,
          assignedFreelancerName: application.freelancerName
        }
      ) as Project;

      // Reject other applications
      const otherApplications = await this.getProjectApplications(application.projectId);
      for (const otherApp of otherApplications) {
        if (otherApp.$id !== applicationId && otherApp.status === 'pending') {
          await databases.updateDocument(
            DATABASE_ID,
            'project_applications',
            otherApp.$id,
            {
              status: 'rejected',
              respondedAt: new Date().toISOString(),
              clientResponse: 'Another freelancer was selected for this project.'
            }
          );
        }
      }

      return {
        application: updatedApplication,
        project: updatedProject
      };
    } catch (error: any) {
      console.error('Error accepting application:', error);
      throw new Error(`Failed to accept application: ${error.message}`);
    }
  }

  // Update project status
  static async updateProjectStatus(
    projectId: string,
    status: ProjectStatus,
    userId: string
  ): Promise<Project> {
    try {
      const updatedProject = await databases.updateDocument(
        DATABASE_ID,
        'projects',
        projectId,
        {
          status,
          updatedAt: new Date().toISOString(),
          ...(status === 'completed' && { completedAt: new Date().toISOString() }),
          ...(status === 'paid' && { paidAt: new Date().toISOString() })
        }
      );

      return updatedProject as Project;
    } catch (error: any) {
      console.error('Error updating project status:', error);
      throw new Error(`Failed to update project status: ${error.message}`);
    }
  }
}
