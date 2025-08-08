import { 
  databases, 
  DATABASE_ID, 
  COLLECTIONS, 
  JobDocument, 
  ApplicationDocument,
  ApplicationStatus,
  createPublicReadPermissions,
  Query,
  ID
} from './database';

// Jobs API Service
export class JobsService {
  // Create a new job
  static async createJob(jobData: Partial<JobDocument>, userId: string): Promise<JobDocument> {
    try {
      const job = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        ID.unique(),
        {
          ...jobData,
          applicationsCount: 0,
          viewsCount: 0,
          status: 'active'
        },
        createPublicReadPermissions(userId)
      );

      // Create conversation for the job
      try {
        const { EnhancedMessagingService } = await import('@/lib/services/enhanced-messaging');
        await EnhancedMessagingService.getOrCreateConversation(
          [userId, `job-${job.$id}`],
          `Джобс: ${jobData.title}`,
          'project',
          {
            jobId: job.$id,
            jobTitle: jobData.title,
            jobCategory: jobData.category
          }
        );
        console.log('✅ Created conversation for job:', job.$id);
      } catch (conversationError) {
        console.warn('Failed to create conversation for job:', conversationError);
        // Don't fail the job creation if conversation creation fails
      }

      return job as unknown as JobDocument;
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error(`Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all jobs with filters
  static async getJobs(filters?: {
    category?: string;
    location?: string;
    budgetMin?: number;
    budgetMax?: number;
    experienceLevel?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ jobs: JobDocument[]; total: number }> {
    try {
      const queries = [
        Query.equal('status', 'active'),
        Query.orderDesc('$createdAt')
      ];

      // Add filters
      if (filters?.category) {
        queries.push(Query.equal('category', filters.category));
      }
      
      if (filters?.location && filters.location !== 'remote') {
        queries.push(Query.equal('location', filters.location));
      }
      
      if (filters?.budgetMin) {
        queries.push(Query.greaterThanEqual('budgetMin', filters.budgetMin));
      }
      
      if (filters?.budgetMax) {
        queries.push(Query.lessThanEqual('budgetMax', filters.budgetMax));
      }
      
      if (filters?.experienceLevel) {
        queries.push(Query.equal('experienceLevel', filters.experienceLevel));
      }

      if (filters?.search) {
        queries.push(Query.search('title', filters.search));
      }

      if (filters?.limit) {
        queries.push(Query.limit(filters.limit));
      }

      if (filters?.offset) {
        queries.push(Query.offset(filters.offset));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        queries
      );

      return {
        jobs: response.documents as unknown as JobDocument[],
        total: response.total
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw new Error('Failed to fetch jobs');
    }
  }

  // Get a single job by ID
  static async getJob(jobId: string): Promise<JobDocument> {
    try {
      const job = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        jobId
      );

      // Increment view count
      await this.incrementViewCount(jobId);

      return job as unknown as JobDocument;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw new Error('Failed to fetch job');
    }
  }

  // Get jobs by client ID
  static async getJobsByClient(clientId: string): Promise<JobDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        [
          Query.equal('clientId', clientId),
          Query.orderDesc('$createdAt')
        ]
      );

      return response.documents as unknown as JobDocument[];
    } catch (error) {
      console.error('Error fetching client jobs:', error);
      throw new Error('Failed to fetch client jobs');
    }
  }

  // Update job
  static async updateJob(jobId: string, updates: Partial<JobDocument>): Promise<JobDocument> {
    try {
      const job = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        jobId,
        updates
      );

      return job as unknown as JobDocument;
    } catch (error) {
      console.error('Error updating job:', error);
      throw new Error('Failed to update job');
    }
  }

  // Delete job
  static async deleteJob(jobId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        jobId
      );
    } catch (error) {
      console.error('Error deleting job:', error);
      throw new Error('Failed to delete job');
    }
  }

  // Increment view count
  static async incrementViewCount(jobId: string): Promise<void> {
    try {
      const job = await databases.getDocument(DATABASE_ID, COLLECTIONS.JOBS, jobId);
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        jobId,
        { viewsCount: (job.viewsCount || 0) + 1 }
      );
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  // Increment applications count
  static async incrementApplicationsCount(jobId: string): Promise<void> {
    try {
      const job = await databases.getDocument(DATABASE_ID, COLLECTIONS.JOBS, jobId);
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        jobId,
        { applicationsCount: (job.applicationsCount || 0) + 1 }
      );
    } catch (error) {
      console.error('Error incrementing applications count:', error);
    }
  }

  // Get featured jobs
  static async getFeaturedJobs(limit: number = 6): Promise<JobDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        [
          Query.equal('status', 'active'),
          Query.equal('featured', true),
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );

      return response.documents as unknown as JobDocument[];
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      return [];
    }
  }

  // Search jobs
  static async searchJobs(searchTerm: string, limit: number = 20): Promise<JobDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        [
          Query.equal('status', 'active'),
          Query.search('title', searchTerm),
          Query.limit(limit)
        ]
      );

      return response.documents as unknown as JobDocument[];
    } catch (error) {
      console.error('Error searching jobs:', error);
      return [];
    }
  }
}

// Applications API Service
export class ApplicationsService {
  // Submit application
  static async submitApplication(
    applicationData: Omit<ApplicationDocument, '$id' | '$createdAt' | '$updatedAt'>,
    userId: string
  ): Promise<ApplicationDocument> {
    try {
      console.log('Submitting application with data:', applicationData);

      // Проверяем обязательные поля
      if (!applicationData.jobId || !applicationData.freelancerId || !applicationData.coverLetter) {
        throw new Error('Missing required fields');
      }

      const application = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.APPLICATIONS,
        ID.unique(),
        {
          ...applicationData,
          status: 'pending',
          freelancerAvatar: applicationData.freelancerAvatar || '',
          freelancerRating: applicationData.freelancerRating || 0,
          clientResponse: '',
          attachments: JSON.stringify(applicationData.attachments || [])
        },
        createPublicReadPermissions(userId)
      );

      console.log('Application created successfully:', application.$id);

      // Increment applications count for the job
      try {
        await JobsService.incrementApplicationsCount(applicationData.jobId);
      } catch (countError) {
        console.warn('Failed to increment applications count:', countError);
        // Не прерываем процесс, если не удалось обновить счетчик
      }

      // Send notification to job client
      try {
        // Get job details to find client
        const job = await JobsService.getJob(applicationData.jobId);
        if (job && job.clientId) {
          // Try to send notification using NotificationService
          try {
            const { NotificationService } = await import('@/lib/services/notifications');
            await NotificationService.createNotification({
              user_id: job.clientId,
              title: '🎯 Новая заявка на ваш заказ!',
              message: `${applicationData.freelancerName} подал заявку на "${job.title}". Предложенный бюджет: $${applicationData.proposedBudget}`,
              type: 'project',
              action_url: `/en/jobs/${applicationData.jobId}`,
              metadata: JSON.stringify({
                applicationId: application.$id,
                jobId: applicationData.jobId,
                freelancerId: applicationData.freelancerId,
                proposedBudget: applicationData.proposedBudget
              })
            });
            console.log('✅ Notification sent to client successfully');
          } catch (notificationError) {
            console.warn('Failed to send notification to client:', notificationError);
            // Не прерываем процесс, если не удалось отправить уведомление
          }
        }
      } catch (jobError) {
        console.warn('Failed to get job details for notification:', jobError);
      }

      return application as unknown as ApplicationDocument;
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error instanceof Error && error.message?.includes('Collection with the requested ID could not be found')) {
        throw new Error('Applications system is not properly configured. Please contact support.');
      }
      throw new Error(`Failed to submit application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get applications for a job
  static async getJobApplications(jobId: string): Promise<ApplicationDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.APPLICATIONS,
        [
          Query.equal('jobId', jobId),
          Query.orderDesc('$createdAt')
        ]
      );

      return response.documents as unknown as ApplicationDocument[];
    } catch (error) {
      console.error('Error fetching job applications:', error);
      throw new Error('Failed to fetch applications');
    }
  }

  // Get applications by freelancer
  static async getFreelancerApplications(freelancerId: string): Promise<ApplicationDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.APPLICATIONS,
        [
          Query.equal('freelancerId', freelancerId),
          Query.orderDesc('$createdAt')
        ]
      );

      return response.documents as unknown as ApplicationDocument[];
    } catch (error) {
      console.error('Error fetching freelancer applications:', error);
      throw new Error('Failed to fetch applications');
    }
  }

  // Update application status
  static async updateApplicationStatus(
    applicationId: string, 
    status: ApplicationStatus,
    clientResponse?: string
  ): Promise<ApplicationDocument> {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          clientResponse,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      const result = await response.json();
      
      // Get updated application
      const application = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.APPLICATIONS,
        applicationId
      );

      return application as unknown as ApplicationDocument;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw new Error('Failed to update application');
    }
  }

  // Check if user has applied to job
  static async hasUserApplied(jobId: string, freelancerId: string): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.APPLICATIONS,
        [
          Query.equal('jobId', jobId),
          Query.equal('freelancerId', freelancerId)
        ]
      );

      return response.documents.length > 0;
    } catch (error) {
      console.error('Error checking application status:', error);
      return false;
    }
  }
}

// Helper function to increment applications count
JobsService.incrementApplicationsCount = async function(jobId: string): Promise<void> {
  try {
    const job = await databases.getDocument(DATABASE_ID, COLLECTIONS.JOBS, jobId);
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.JOBS,
      jobId,
      { applicationsCount: (job.applicationsCount || 0) + 1 }
    );
  } catch (error) {
    console.error('Error incrementing applications count:', error);
  }
};
