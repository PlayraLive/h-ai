import { databases, storage, ID, Query } from '@/lib/appwrite';

export interface ActiveProject {
  $id?: string;
  jobId: string;
  freelancerId: string;
  clientId: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  milestones?: string;
  requirements?: string;
  deliverables?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface ProjectMessage {
  $id?: string;
  projectId: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: 'text' | 'file' | 'milestone' | 'system';
  attachments?: string;
  read: boolean;
  timestamp: string;
  $createdAt?: string;
}

export interface ProjectFile {
  $id?: string;
  projectId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  category: 'general' | 'deliverable' | 'reference' | 'feedback';
  approved: boolean;
  feedback?: string;
  uploadedAt: string;
  $createdAt?: string;
}

export interface ProjectMilestone {
  $id?: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
  order: number;
  payment?: number;
  deliverables?: string;
  $createdAt?: string;
}

class ProjectService {
  private readonly DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  private readonly ACTIVE_PROJECTS_COLLECTION = 'active_projects';
  private readonly PROJECT_MESSAGES_COLLECTION = 'project_messages';
  private readonly PROJECT_FILES_COLLECTION = 'project_files';
  private readonly PROJECT_MILESTONES_COLLECTION = 'project_milestones';
  private readonly STORAGE_BUCKET = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;

  // Создание активного проекта
  async createActiveProject(projectData: Omit<ActiveProject, '$id' | '$createdAt' | '$updatedAt'>): Promise<ActiveProject> {
    try {
      const response = await databases.createDocument(
        this.DATABASE_ID,
        this.ACTIVE_PROJECTS_COLLECTION,
        ID.unique(),
        {
          ...projectData,
          startedAt: new Date().toISOString(),
          status: 'active',
          progress: 0
        }
      );
      return response as ActiveProject;
    } catch (error) {
      console.error('Error creating active project:', error);
      throw error;
    }
  }

  // Получение активного проекта по ID
  async getActiveProject(projectId: string): Promise<ActiveProject | null> {
    try {
      const response = await databases.getDocument(
        this.DATABASE_ID,
        this.ACTIVE_PROJECTS_COLLECTION,
        projectId
      );
      return response as ActiveProject;
    } catch (error) {
      console.error('Error getting active project:', error);
      return null;
    }
  }

  // Получение проектов пользователя
  async getUserProjects(userId: string, userType: 'freelancer' | 'client'): Promise<ActiveProject[]> {
    try {
      const field = userType === 'freelancer' ? 'freelancerId' : 'clientId';
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.ACTIVE_PROJECTS_COLLECTION,
        [
          Query.equal(field, userId),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents as ActiveProject[];
    } catch (error) {
      console.error('Error getting user projects:', error);
      return [];
    }
  }

  // Обновление прогресса проекта
  async updateProjectProgress(projectId: string, progress: number, status?: string): Promise<void> {
    try {
      const updateData: any = { progress };
      if (status) {
        updateData.status = status;
        if (status === 'completed') {
          updateData.completedAt = new Date().toISOString();
        }
      }

      await databases.updateDocument(
        this.DATABASE_ID,
        this.ACTIVE_PROJECTS_COLLECTION,
        projectId,
        updateData
      );
    } catch (error) {
      console.error('Error updating project progress:', error);
      throw error;
    }
  }

  // Отправка сообщения в проект
  async sendProjectMessage(messageData: Omit<ProjectMessage, '$id' | '$createdAt'>): Promise<ProjectMessage> {
    try {
      const response = await databases.createDocument(
        this.DATABASE_ID,
        this.PROJECT_MESSAGES_COLLECTION,
        ID.unique(),
        {
          ...messageData,
          timestamp: new Date().toISOString(),
          read: false
        }
      );
      return response as ProjectMessage;
    } catch (error) {
      console.error('Error sending project message:', error);
      throw error;
    }
  }

  // Получение сообщений проекта
  async getProjectMessages(projectId: string): Promise<ProjectMessage[]> {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.PROJECT_MESSAGES_COLLECTION,
        [
          Query.equal('projectId', projectId),
          Query.orderAsc('timestamp')
        ]
      );
      return response.documents as ProjectMessage[];
    } catch (error) {
      console.error('Error getting project messages:', error);
      return [];
    }
  }

  // Загрузка файла в проект
  async uploadProjectFile(
    file: File,
    projectId: string,
    uploadedBy: string,
    category: string = 'general',
    description?: string
  ): Promise<ProjectFile> {
    try {
      // Загружаем файл в storage
      const fileResponse = await storage.createFile(
        this.STORAGE_BUCKET,
        ID.unique(),
        file
      );

      // Создаем запись в базе данных
      const fileData = {
        projectId,
        uploadedBy,
        fileName: file.name,
        fileUrl: fileResponse.$id,
        fileType: file.type,
        fileSize: file.size,
        description: description || '',
        category,
        approved: false,
        uploadedAt: new Date().toISOString()
      };

      const response = await databases.createDocument(
        this.DATABASE_ID,
        this.PROJECT_FILES_COLLECTION,
        ID.unique(),
        fileData
      );

      return response as ProjectFile;
    } catch (error) {
      console.error('Error uploading project file:', error);
      throw error;
    }
  }

  // Получение файлов проекта
  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.PROJECT_FILES_COLLECTION,
        [
          Query.equal('projectId', projectId),
          Query.orderDesc('uploadedAt')
        ]
      );
      return response.documents as ProjectFile[];
    } catch (error) {
      console.error('Error getting project files:', error);
      return [];
    }
  }

  // Одобрение файла
  async approveFile(fileId: string, approved: boolean, feedback?: string): Promise<void> {
    try {
      await databases.updateDocument(
        this.DATABASE_ID,
        this.PROJECT_FILES_COLLECTION,
        fileId,
        {
          approved,
          feedback: feedback || ''
        }
      );
    } catch (error) {
      console.error('Error approving file:', error);
      throw error;
    }
  }

  // Создание milestone
  async createMilestone(milestoneData: Omit<ProjectMilestone, '$id' | '$createdAt'>): Promise<ProjectMilestone> {
    try {
      const response = await databases.createDocument(
        this.DATABASE_ID,
        this.PROJECT_MILESTONES_COLLECTION,
        ID.unique(),
        milestoneData
      );
      return response as ProjectMilestone;
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }
  }

  // Получение milestones проекта
  async getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.PROJECT_MILESTONES_COLLECTION,
        [
          Query.equal('projectId', projectId),
          Query.orderAsc('order')
        ]
      );
      return response.documents as ProjectMilestone[];
    } catch (error) {
      console.error('Error getting project milestones:', error);
      return [];
    }
  }

  // Обновление статуса milestone
  async updateMilestoneStatus(milestoneId: string, status: string): Promise<void> {
    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }

      await databases.updateDocument(
        this.DATABASE_ID,
        this.PROJECT_MILESTONES_COLLECTION,
        milestoneId,
        updateData
      );
    } catch (error) {
      console.error('Error updating milestone status:', error);
      throw error;
    }
  }

  // Получение URL файла
  getFileUrl(fileId: string): string {
    return storage.getFileView(this.STORAGE_BUCKET, fileId).href;
  }

  // Получение URL для скачивания файла
  getFileDownloadUrl(fileId: string): string {
    return storage.getFileDownload(this.STORAGE_BUCKET, fileId).href;
  }
}

export const projectService = new ProjectService();
